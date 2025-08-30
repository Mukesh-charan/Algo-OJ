import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";
import { handleLogout } from "../auth";

const API_URL = `${import.meta.env.VITE_BACKEND}/api`;

interface Problem {
  _id?: string;
  name: string;
  difficulty: string;
  points: number;
  problemStatement: string;
  sampleInput: string[];
  sampleOutput: string[];
}

const EditContest: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Regular states
  const [contestName, setContestName] = useState("");
  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [existingProblems, setExistingProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const [contestStartDate, setContestStartDate] = useState("");
  const [contestEndDate, setContestEndDate] = useState("");
  const [contestStartTime, setContestStartTime] = useState("");
  const [contestEndTime, setContestEndTime] = useState("");
  const [type, setType] = useState("true"); // "true"/"false" string for select

  // Password protection states
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // To prefill/isolate password toggling & protection from backend
  useEffect(() => {
    const fetchContestAndProblems = async () => {
      try {
        const contestResponse = await axios.get(`${API_URL}/contests/${id}`);
        const contest = contestResponse.data;

        setContestName(contest.name);
        setType(contest.type ? "true" : "false");

        // Date/time parsing
        const toDateString = (iso: string) =>
          iso ? new Date(iso).toISOString().slice(0, 10) : "";

        setContestStartDate(toDateString(contest.startDate));
        setContestStartTime(contest.startTime?.slice(0, 5) || "");
        setContestEndDate(toDateString(contest.endDate));
        setContestEndTime(contest.endTime?.slice(0, 5) || "");

        // Password-related (these field names should match backend, adjust if needed)
        setIsPasswordProtected(contest.isPasswordProtected || false);
        setPassword("");
        setConfirmPassword("");

        // Fetch all problems and set
        const problemsResponse = await axios.get(`${API_URL}/problems`);
        const allProblems = problemsResponse.data;
        setExistingProblems(allProblems);

        // Preselect those already in contest
        const selected = contest.problems
          .map((cp: { id: string }) => allProblems.find((p: Problem) => p._id === cp.id))
          .filter((p: Problem | undefined): p is Problem => p !== undefined);
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

  const addExistingProblem = (problem: Problem) => {
    if (selectedProblems.some((p) => p._id === problem._id)) {
      alert("Problem already added");
      return;
    }
    setSelectedProblems((prev) => [...prev, problem]);
  };

  const removeProblem = (problemId?: string) => {
    if (!problemId) return;
    setSelectedProblems((prev) => prev.filter((p) => p._id !== problemId));
  };

  const handleUpdate = async () => {
    if (!contestName.trim()) {
      alert("Contest name is required");
      return;
    }
    if (selectedProblems.length === 0) {
      alert("Add at least one problem to the contest");
      return;
    }
    if (!contestStartDate || !contestStartTime || !contestEndDate || !contestEndTime) {
      alert("Start and End date/time must be set");
      return;
    }
    if (isPasswordProtected) {
      if (!password) {
        alert("Password required.");
        return;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
    }

    try {
      const formattedStartTime = contestStartTime ? `${contestStartTime}:00` : null;
      const formattedEndTime = contestEndTime ? `${contestEndTime}:00` : null;
      
      // Construct payload
      const contestPayload = {
        name: contestName.trim(),
        startDate: contestStartDate.toString(),
        startTime: formattedStartTime,
        endDate: contestEndDate.toString(),
        endTime: formattedEndTime,
        problems: selectedProblems.map((p) => ({ id: p._id! })),
        type,
        isPasswordProtected,
        password: isPasswordProtected ? password : undefined,
      };
      await axios.put(`${API_URL}/contests/${id}`, contestPayload);
      alert("Contest updated successfully");
      navigate("/contest");
    } catch (error) {
      console.error("Error updating contest", error);
      alert("Failed to update contest");
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
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: false },
      size: { value: 3, random: true },
      links: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
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
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" },
      },
      modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } },
    },
    retina_detect: true,
  };

  if (loading) return <div>Loading contest data...</div>;

  return (
    <div>
      <Particles id="edit-contest-particles" init={particlesInit} options={particlesOptions} className="particles-container" />
      <header className="header">
        <h1 style={{ marginLeft: "120px" }}>Edit Contest ({contestName})</h1>
        <button
          onClick={() => {
            handleLogout();
            navigate("/login");
          }}
          style={{ marginRight: "30px" }}
        >
          Logout
        </button>
      </header>
      <div className="container" style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
        <h1>Edit Contest</h1>

        <label htmlFor="contestName" style={{ display: "block", marginBottom: 4 }}>
          Contest Name:
        </label>
        <input
          type="text"
          id="contestName"
          className="input-full"
          value={contestName}
          onChange={e => setContestName(e.target.value)}
          placeholder="Enter contest name"
          style={{ marginBottom: 20, padding: 8, fontSize: 16, width: "100%" }}
        />

        <label htmlFor="contestStartDate" style={{ display: "block", marginBottom: 4 }}>
          Contest Start Date:
        </label>
        <input
          type="date"
          id="contestStartDate"
          className="input-full"
          value={contestStartDate}
          onChange={e => setContestStartDate(e.target.value)}
          style={{ marginBottom: 20, padding: 8, fontSize: 16, width: "100%" }}
        />
        <label htmlFor="contestStartTime" style={{ display: "block", marginBottom: 4 }}>
          Contest Start Time:
        </label>
        <input
          type="time"
          id="contestStartTime"
          className="input-full"
          value={contestStartTime}
          onChange={e => setContestStartTime(e.target.value)}
          style={{ marginBottom: 20, padding: 8, fontSize: 16, width: "100%" }}
        />

        <label htmlFor="contestEndDate" style={{ display: "block", marginBottom: 4 }}>
          Contest End Date:
        </label>
        <input
          type="date"
          id="contestEndDate"
          className="input-full"
          value={contestEndDate}
          onChange={e => setContestEndDate(e.target.value)}
          style={{ marginBottom: 20, padding: 8, fontSize: 16, width: "100%" }}
        />
        <label htmlFor="contestEndTime" style={{ display: "block", marginBottom: 4 }}>
          Contest End Time:
        </label>
        <input
          type="time"
          id="contestEndTime"
          className="input-full"
          value={contestEndTime}
          onChange={e => setContestEndTime(e.target.value)}
          style={{ marginBottom: 20, padding: 8, fontSize: 16, width: "100%" }}
        />

        <label htmlFor="type">Code Editor Type:</label>
        <select
          id="type"
          className="input-full"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <option value="true">Random</option>
          <option value="false">Normal</option>
        </select>

        {/* Password protection section */}
        <div style={{ margin: "20px 0" }}>
          <label>Password Protected?</label>
          <select
            value={isPasswordProtected ? "yes" : "no"}
            onChange={e => setIsPasswordProtected(e.target.value === "yes")}
            style={{ marginBottom: 10, marginLeft: 10, padding: 8 }}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        {isPasswordProtected && (
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ marginBottom: 10, padding: 8, width: "100%" }}
              required
            />
            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{ marginBottom: 20, padding: 8, width: "100%" }}
              required
            />
          </div>
        )}

        <button className="add-problem-btn" onClick={() => navigate("/addProblem")} style={{ marginBottom: 20 }}>
          Add New Problem
        </button>

        <h2>Manage Problems</h2>
        {existingProblems.length === 0 && <p>No problems available</p>}
        <div style={{ display: "flex", fontWeight: "bold", width: "100%", marginBottom: 10 }}>
          <div style={{ flex: 4 }}>Problem</div>
          <div style={{ flex: 2 }}>Difficulty</div>
          <div style={{ flex: 2 }}>Points</div>
          <div style={{ flex: 2 }}>Actions</div>
        </div>
        <div className="problem-list" style={{ maxHeight: 300, border: "1px solid #ddd", padding: 10, borderRadius: 4 }}>
          {existingProblems.map((problem) => {
            const isSelected = selectedProblems.some((p) => p._id === problem._id);
            return (
              <div
                key={problem._id}
                className="problem-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                  paddingBottom: 6,
                  borderBottom: "1px solid #eee"
                }}
              >
                <div style={{ flex: 4 }}>{problem.name}</div>
                <div style={{ flex: 2, textTransform: "capitalize" }}>{problem.difficulty}</div>
                <div style={{ flex: 2 }}>{problem.points}</div>
                <div style={{ flex: 2 }}>
                  {isSelected ? (
                    <button className="button-action" onClick={() => removeProblem(problem._id)} aria-label={`Remove problem ${problem.name}`}>Remove</button>
                  ) : (
                    <button className="button-action" onClick={() => addExistingProblem(problem)} aria-label={`Add problem ${problem.name}`}>Add</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={handleUpdate} className="add-problem-btn" style={{ marginTop: 20 }}>
          Update Contest
        </button>
        <button
          type="button"
          className="button-action"
          style={{ backgroundColor: "#eee", color: "#1245a4", marginTop: "10px" }}
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditContest;
