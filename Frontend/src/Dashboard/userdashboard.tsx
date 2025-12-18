import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";
import { handleLogout } from "../auth";

const API_URL = `${import.meta.env.VITE_BACKEND}/api`;

interface Problem {
  _id: string;
  name: string;
  difficulty: string;
  points: number;
  visibility: boolean;
}

interface ContestUser {
  id: string;
  username: string;
}

interface Contest {
  _id: string;
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  users: ContestUser[];
  type: string;
  isPasswordProtected: boolean;
  password: string | "";
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [contests, setContests] = useState<Contest[]>([]);
  const [loadingContests, setLoadingContests] = useState(true);
  const [processingContestId, setProcessingContestId] = useState<string | null>(null);

  // Password prompt states
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [contestToStart, setContestToStart] = useState<Contest | null>(null);
  const [passwordError, setPasswordError] = useState("");

  const userId = localStorage.getItem("_id") || "";
  const username = localStorage.getItem("username") || "";

  useEffect(() => {
    fetchProblems();
    fetchContests();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(`${API_URL}/problems/user`);
      setProblems(res.data);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
      setProblems([]);
    }
  };

  const fetchContests = async () => {
    setLoadingContests(true);
    try {
      const res = await axios.get(`${API_URL}/contests`);
      setContests(res.data);
    } catch (error) {
      console.error("Failed to fetch contests:", error);
      setContests([]);
    } finally {
      setLoadingContests(false);
    }
  };

  const parseContestDateTime = (dateStr: string, timeStr: string) =>
    new Date(`${dateStr}T${timeStr}`);

  const activeContests = contests.filter(contest => {
    const now = new Date();
    const endDateTime = parseContestDateTime(contest.endDate, contest.endTime);
    return now < endDateTime;
  });

  const isUserRegistered = (contest: Contest) => {
    if (!contest.users || contest.users.length === 0) return false;
    return contest.users.some(user => user.id === userId);
  };

  const hasContestStarted = (contest: Contest) => {
    const now = new Date();
    const startDateTime = parseContestDateTime(contest.startDate, contest.startTime);
    return now >= startDateTime;
  };

  const handleRegister = async (contestId: string) => {
    if (!userId || !username) {
      alert("You must be logged in to register for contests.");
      navigate("/login");
      return;
    }
    try {
      setProcessingContestId(contestId);
      await axios.post(`${API_URL}/contests/${contestId}/register`, { userId, username });
      alert("Successfully registered for contest!");
      await fetchContests();
    } catch (error) {
      console.error("Failed to register:", error);
      alert("Failed to register for contest.");
    } finally {
      setProcessingContestId(null);
    }
  };

  const handleUnregister = async (contestId: string) => {
    if (!userId) {
      alert("You must be logged in.");
      navigate("/login");
      return;
    }
    try {
      setProcessingContestId(contestId);
      await axios.post(`${API_URL}/contests/${contestId}/removeUser`, { userId });
      alert("Successfully unregistered from contest!");
      await fetchContests();
    } catch (error) {
      console.error("Failed to unregister:", error);
      alert("Failed to unregister from contest.");
    } finally {
      setProcessingContestId(null);
    }
  };

  // Handles final navigation once authorized
  const handleStartContest = (contestId: string) => {
    navigate(`/contest/${contestId}`);
  };

  // Handle start clicked: show password prompt if protected
  const onStartClick = (contest: Contest) => {
    if (contest.isPasswordProtected) {
      setContestToStart(contest);
      setShowPasswordPrompt(true);
      setPasswordInput("");
      setPasswordError("");
    } else {
      handleStartContest(contest._id);
    }
  };

  const handleSolve = async (id: string) => {
    try {
      await axios.get(`${API_URL}/problems/${id}`);
      navigate(`/codeEditor/${id}`);
    } catch (error) {
      console.error("Failed to solve problem:", error);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!contestToStart) return;
    try {
      setPasswordError("");
      const res = await axios.post(`${API_URL}/contests/${contestToStart._id}/verify-password`, { password });
      if (res.data.valid) {
        // Mark that this user has access to this specific contest
        localStorage.setItem(`contestAccess_${contestToStart._id}`, "true");
        setShowPasswordPrompt(false);
        handleStartContest(contestToStart._id);
      } else {
        setPasswordError("Incorrect password");
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          setPasswordError("Incorrect password");
        } else if (error.response.data && error.response.data.message) {
          setPasswordError(error.response.data.message);
        } else {
          setPasswordError("Error verifying password");
        }
      } else {
        setPasswordError("Network error or server unreachable");
      }
    }
  };
  

  // Filter problems as before
  const filteredProblems = problems.filter(
    problem =>
      problem.name.toLowerCase().includes(search.toLowerCase()) &&
      problem.difficulty.toLowerCase().includes(difficulty.toLowerCase())
  );

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
      move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false },
    },
    interactivity: {
      events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
      modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } },
    },
    retina_detect: true,
  };

  return (
    <div>
      <Particles id="welcome-particles" init={particlesInit} options={particlesOptions} className="particles-container" />
      <header className="header">
        <h1 style={{ marginLeft: "120px" }}>Random(Compile)</h1>
        {localStorage.getItem("token") ? (
          <button
            onClick={() => {
              handleLogout();
              navigate("/login");
            }}
            style={{ marginRight: "30px" }}
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => {
              navigate("/login");
            }}
            style={{ marginRight: "30px" }}
          >
            Login
          </button>
        )}
      </header>
      <div className="container">
        {localStorage.getItem("userType") === "admin" && (
          <button className="back-btn" onClick={() => navigate("/admindashboard")}>Back to Dashboard</button>
        )}

        <h2>Available Contests</h2>
        {loadingContests ? (
          <div>Loading contests...</div>
        ) : activeContests.length === 0 ? (
          <div>No contests available currently.</div>
        ) : (
          <>
            <div style={{ marginBottom: "25px", width: "100%", marginLeft: "150px" }}>
            <div style={{ display: "flex", fontWeight: "bold", marginBottom: 12, width: "100%" }}>
              <div style={{ flex: 3 }}>Contest Name</div>
              <div style={{ flex: 1 }}>Start Date</div>
              <div style={{ flex: 1 }}>Start Time</div>
              <div style={{ flex: 1 }}>End Date</div>
              <div style={{ flex: 1 }}>End Time</div>
              <div style={{ flex: 1 }}>Coding Style</div>
              <div style={{ flex: 2 }}>Action</div>
            </div>
              {activeContests.map(contest => {
                const registered = isUserRegistered(contest);
                const started = hasContestStarted(contest);

                let actionButton;
                if (started && registered) {
                  actionButton = (
                    <button
                      className="button-action"
                      onClick={() => onStartClick(contest)}
                    >
                      Start
                    </button>
                  );
                } else {
                  actionButton = registered ? (
                    <button
                      className="button-action"
                      onClick={() => handleUnregister(contest._id)}
                      disabled={processingContestId === contest._id}
                    >
                      {processingContestId === contest._id ? "Processing..." : "Un-register"}
                    </button>
                  ) : (
                    <button
                      className="button-action"
                      onClick={() => handleRegister(contest._id)}
                      disabled={processingContestId === contest._id}
                    >
                      {processingContestId === contest._id ? "Processing..." : "Register"}
                    </button>
                  );
                }

                return (
                  <div key={contest._id} style={{ display: "flex", alignItems: "center", marginBottom: 8, width: "100%" }}>
                  <div style={{ flex: 3, fontWeight: "bold" }}>{contest.name}</div>
                  <div style={{ flex: 1 }}>{contest.startDate}</div>
                  <div style={{ flex: 1 }}>{contest.startTime}</div>
                  <div style={{ flex: 1 }}>{contest.endDate}</div>
                  <div style={{ flex: 1 }}>{contest.endTime}</div>
                  <div style={{ flex: 1 }}>{contest.type === "true" ? "Random" : "Normal"}</div>
                  <div style={{ flex: 2 }}>{actionButton}</div>
                </div>
                );
              })}
            </div>
          </>
        )}

        <h2>Search Problems</h2>
        <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "20px" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-bar"
            placeholder="Search problems..."
            style={{ flex: 5 }}
          />
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="search-bar"
            style={{ flex: 1 }}
          >
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {filteredProblems.length === 0 ? (
          <div>No problems found.</div>
        ) : (
          <>
            <div style={{ display: "flex", fontWeight: "bold", marginBottom: 12, width: "100%" }}>
              <div style={{ flex: 4 }}>Problem</div>
              <div style={{ flex: 2 }}>Difficulty</div>
              <div style={{ flex: 1 }}>Actions</div>
            </div>
            <div className="problem-list">
              {filteredProblems
                .filter(problem => problem.visibility)
                .map(problem => (
                  <div key={problem._id} className="problem-item" style={{ alignItems: "center" }}>
                    <div style={{ flex: 4 }}>{problem.name}</div>
                    <div style={{ flex: 2 }}>{problem.difficulty}</div>
                    <div className="problem-actions" style={{ flex: 1 }}>
                      <button className="button-action" onClick={() => handleSolve(problem._id)}>
                        Solve
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {showPasswordPrompt && contestToStart && (
          <div
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <form
              onSubmit={e => {
                e.preventDefault();
                handlePasswordSubmit(passwordInput);
              }}
              style={{
                backgroundColor: "white",
                padding: 24,
                borderRadius: 8,
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                width: 320,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <h3 style={{ margin: 0, marginBottom: 8 }}>
                Enter password for "{contestToStart.name}"
              </h3>
              <input
                type="password"
                value={passwordInput}
                placeholder="Password"
                onChange={e => setPasswordInput(e.target.value)}
                style={{
                  padding: 8, fontSize: 16, borderRadius: 4, border: "1px solid #ccc",
                }}
                autoFocus
              />
              {passwordError && (
                <div style={{ color: "red", fontSize: 14 }}>{passwordError}</div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setShowPasswordPrompt(false)} style={{ padding: "8px 12px" }}>
                  Cancel
                </button>
                <button type="submit" disabled={passwordInput.length === 0} style={{ padding: "8px 12px" }}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
