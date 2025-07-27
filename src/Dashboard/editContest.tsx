import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";
import { handleLogout } from "../auth";


const API_URL = "http://localhost:8000/api";

interface Problem {
    _id?: string;
    name: string;
    difficulty: string;
    points: number;
    problemStatement: string;
    sampleInput: string[];
    sampleOutput: string[];
}

interface ContestProblem {
    id: string;
}

interface Contest {
    _id: string;
    name: string;
    problems: ContestProblem[];
}

const EditContest: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [contestName, setContestName] = useState<string>("");
    const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
    const [existingProblems, setExistingProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch contest and problems on mount
    useEffect(() => {
        const fetchContestAndProblems = async () => {
            try {
                // Fetch contest by id
                const contestResponse = await axios.get<Contest>(`${API_URL}/contests/${id}`);
                const contest = contestResponse.data;
                setContestName(contest.name);

                // Fetch all problems
                const problemsResponse = await axios.get<Problem[]>(`${API_URL}/problems`);
                const allProblems = problemsResponse.data;
                setExistingProblems(allProblems);

                // Map contest's problems to full problem details
                const selected = contest.problems
                    .map((cp) => allProblems.find((p) => p._id === cp.id))
                    .filter((p): p is Problem => p !== undefined);

                setSelectedProblems(selected);

                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch contest or problems", error);
                alert("Failed to load contest data.");
                setLoading(false);
            }
        };

        fetchContestAndProblems();
    }, [id]);

    // Add a problem to selectedProblems
    const addExistingProblem = (problem: Problem) => {
        if (selectedProblems.some((p: Problem) => p._id === problem._id)) {
            alert("Problem already added");
            return;
        }
        setSelectedProblems((prev) => [...prev, problem]);
    };

    // Remove a problem from selectedProblems by _id
    const removeProblem = (problemId?: string) => {
        if (!problemId) return;
        setSelectedProblems((prev) => prev.filter((p: Problem) => p._id !== problemId));
    };

    // Handle contest update
    const handleUpdate = async () => {
        if (!contestName.trim()) {
            alert("Contest name is required");
            return;
        }
        if (selectedProblems.length === 0) {
            alert("Add at least one problem to the contest");
            return;
        }

        try {
            const contestPayload = {
                name: contestName.trim(),
                problems: selectedProblems.map((p) => ({ id: p._id! })), // _id should exist on existing problems
            };

            await axios.put(`${API_URL}/contests/${id}`, contestPayload);
            alert("Contest updated successfully");
            navigate("/contest"); // Change path as needed
        } catch (error) {
            console.error("Error updating contest", error);
            alert("Failed to update contest");
        }
    };

    if (loading) return <div>Loading contest data...</div>;
    const particlesInit = async (engine: Engine) => {
        try {
            await loadSlim(engine);
        } catch (error) {
            console.error("Error initializing particles:", error);
        }
    };

    const particlesOptions: RecursivePartial<IOptions> = {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800,
                },
            },
            color: {
                value: "#ffffff",
            },
            shape: {
                type: "circle",
            },
            opacity: {
                value: 0.5,
                random: false,
            },
            size: {
                value: 3,
                random: true,
            },
            links: {
                enable: true,
                distance: 150,
                color: "#ffffff",
                opacity: 0.4,
                width: 1,
            },
            move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false,
            },
        },
        interactivity: {
            events: {
                onhover: {
                    enable: true,
                    mode: "repulse",
                },
                onclick: {
                    enable: true,
                    mode: "push",
                },
            },
            modes: {
                repulse: {
                    distance: 100,
                    duration: 0.4,
                },
                push: {
                    particles_nb: 4,
                },
            },
        },
        retina_detect: true,
    };
    return (
        <div>
            <Particles
                id="welcome-particles"
                init={particlesInit}
                options={particlesOptions}
                className="particles-container"
            />
            <header className="header">
                <h1 style={{ marginLeft: "120px" }}>Random(Compile)</h1>
                <button onClick={() => { handleLogout(), navigate("/login") }} style={{ marginRight: "30px" }}>Logout</button>
            </header>
            <div className="container" style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
                <h1>Edit Contest {contestName}</h1>

                <label htmlFor="contestName" style={{ display: "block", marginBottom: 4 }}>
                    Contest Name:
                </label>
                <input
                    type="text"
                    id="contestName"
                    className="input-full"
                    value={contestName}
                    onChange={(e) => setContestName(e.target.value)}
                    placeholder="Enter contest name"
                    style={{ marginBottom: 20, padding: 8, fontSize: 16, width: "100%" }}
                />
                <button className="add-problem-btn" onClick={() => navigate("/addProblem")}>
                    Add New Problem
                </button>
                <h2>Manage Problems</h2>

                {existingProblems.length === 0 && <p>No problems available</p>}

                <div
                    style={{
                        display: "flex",
                        fontWeight: "bold",
                        marginBottom: 12,
                        width: "100%",
                        borderBottom: "2px solid #ccc",
                        paddingBottom: 6,
                    }}
                >
                    <div style={{ flex: 4 }}>Problem</div>
                    <div style={{ flex: 2 }}>Difficulty</div>
                    <div style={{ flex: 2 }}>Points</div>
                    <div style={{ flex: 2 }}>Actions</div>
                </div>

                <div
                    className="problem-list"
                    style={{
                        maxHeight: 300,
                        border: "1px solid #ddd",
                        padding: 10,
                        borderRadius: 4,
                    }}
                >
                    {existingProblems.map((problem) => {
                        const isSelected = selectedProblems.some((p: Problem) => p._id === problem._id);
                        return (
                            <div
                                key={problem._id}
                                className="problem-item"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: 8,
                                    paddingBottom: 6,
                                    borderBottom: "1px solid #eee",
                                }}
                            >
                                <div style={{ flex: 4 }}>{problem.name}</div>
                                <div style={{ flex: 2, textTransform: "capitalize" }}>{problem.difficulty}</div>
                                <div style={{ flex: 2 }}>{problem.points}</div>
                                <div style={{ flex: 2 }}>
                                    {isSelected ? (
                                        <button
                                            className="button-action"
                                            onClick={() => removeProblem(problem._id)}
                                            aria-label={`Remove problem ${problem.name}`}
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            className="button-action"
                                            onClick={() => addExistingProblem(problem)}
                                            aria-label={`Add problem ${problem.name}`}
                                        >
                                            Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={handleUpdate}
                    className="button-action"
                    style={{ marginTop: 20, padding: "10px 20px", fontSize: 16 }}
                >
                    Update Contest
                </button>
                <button
                    type="button"
                    className="button-action"
                    style={{ backgroundColor: "#eee", color: "#1245a4" }}
                    onClick={() => navigate(-1)}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default EditContest;
