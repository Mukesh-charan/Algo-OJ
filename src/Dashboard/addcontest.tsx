import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../auth";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";

const API_URL = "http://localhost:8000/api";

interface Problem {
    _id?: string; // _id present if problem already exists
    name: string;
    difficulty: string;
    points: number;
    problemStatement: string;
    sampleInput: string[]; // simplified for demo
    sampleOutput: string[];
    // add testcases if needed
}

const AddContest: React.FC = () => {
    const navigate = useNavigate();
    // Contest state
    const [contestName, setContestName] = useState("");
    const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]); // problems selected or created
    const [existingProblems, setExistingProblems] = useState<Problem[]>([]);

    // Fetch existing problems for selection
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await axios.get<Problem[]>(`${API_URL}/problems`);
                setExistingProblems(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchProblems();
    }, []);

    const addExistingProblem = (problem: Problem) => {
        if (selectedProblems.find(p => p._id === problem._id)) {
            alert("Problem already added");
            return;
        }
        setSelectedProblems(prev => [...prev, problem]);
    };

    // Remove problem from contest list
    const removeProblem = (problemId?: string) => {
        if (!problemId) return;
        setSelectedProblems(prev => prev.filter(p => p._id !== problemId));
    };

    // Submit contest + problems
    const handleSubmit = async () => {
        if (!contestName) {
            alert("Contest name is required");
            return;
        }
        if (selectedProblems.length === 0) {
            alert("Add at least one problem");
            return;
        }

        try {
            // 1. Post new problems first (problems without _id)
            const postedProblems = await Promise.all(
                selectedProblems.map(async prob => {
                    if (prob._id) return prob; // existing problems already saved

                    // post new problem
                    const response = await axios.post(`${API_URL}/problems`, {
                        name: prob.name,
                        difficulty: prob.difficulty,
                        points: prob.points,
                        problemStatement: prob.problemStatement,
                        sampleInput: prob.sampleInput,
                        sampleOutput: prob.sampleOutput,
                    });
                    return response.data;
                })
            );

            // 2. Prepare contest object with saved problems (_id comes from backend)
            const contestPayload = {
                name: contestName,
                problems: postedProblems.map(p => ({ id: p._id })),
            };

            console.log(contestPayload)
            await axios.post(`${API_URL}/contests`, contestPayload);

            alert("Contest and problems added successfully!");
            // Clear all states or navigate away as needed
            navigate("/contest")
        } catch (error) {
            console.error(error);
            alert("Error adding contest or problems");
        }
    };
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
            <div className="container">
                <h1>Create Contest</h1>
                {/* Contest Name */}
                <label>Contest Name:</label>
                <input
                    type="text"
                    className="input-full"
                    value={contestName}
                    onChange={e => setContestName(e.target.value)}
                    placeholder="Enter contest name"
                />

                <button className="add-problem-btn" onClick={() => navigate("/addProblem")}>
                    Add New Problem
                </button>
                <h2>Select Problems</h2>
                {existingProblems.length === 0 && <p>No existing problems to add</p>}
                <>
                    <div style={{ display: "flex", fontWeight: "bold", width: "100%", marginLeft: "100px" }}>
                        <div style={{ flex: 4 }}>Problem</div>
                        <div style={{ flex: 2 }}>Difficulty</div>
                        <div style={{ flex: 2 }}>Points</div>
                        <div style={{ flex: 2 }}>Actions</div>
                    </div>
                    <div className="problem-list">
                        {existingProblems.map((problem) => {
                            const isSelected = selectedProblems.some(p => p._id === problem._id);
                            return (
                                <div key={problem._id} className="problem-item" style={{ alignItems: "center", marginLeft: "50px" }}>
                                    <div style={{ flex: 4 }}>{problem.name}</div>
                                    <div style={{ flex: 2 }}>{problem.difficulty}</div>
                                    <div style={{ flex: 2 }}>{problem.points}</div>
                                    <div className="problem-actions" style={{ flex: 2 }}>
                                        {isSelected ? (
                                            <button className="button-action" onClick={() => removeProblem(problem._id)}>Remove</button>
                                        ) : (
                                            <button className="button-action" onClick={() => addExistingProblem(problem)}>Add</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>



                <button onClick={handleSubmit} className="add-problem-btn" style={{ marginTop: 20 }}>
                    Create Contest
                </button>
            </div>
        </div>
    );
};

export default AddContest;