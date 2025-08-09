import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import { useNavigate, useParams } from "react-router-dom";
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
}

interface ContestProblem {
  id: string; // id of problem in contest
}

interface Contest {
  _id: string;
  name: string;
  problems: ContestProblem[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

const ContestProblemDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(true);
  const [contestName, setContestName] = useState("");

  useEffect(() => {
    if (!id) {
      alert("No contest ID provided");
      return;
    }

    // Fetch contest and problems
    const fetchContestAndProblems = async () => {
      try {
        // 1. Fetch contest by id to get problem IDs
        const contestRes = await axios.get<Contest>(`${API_URL}/contests/${id}`);
        const contest = contestRes.data;
        setContestName(contest.name);
        const problemIds = contest.problems.map((p) => p.id);

        if (problemIds.length === 0) {
          setProblems([]);
          setLoading(false);
          return;
        }

        // 2. Fetch all problems or specifically those that match problemIds
        // Assuming your API supports filtering problems by IDs, use that endpoint if available
        // For now, let's fetch all problems and then filter

        const problemsRes = await axios.get<Problem[]>(`${API_URL}/problems`);
        const allProblems = problemsRes.data;

        // Filter the problems to the problems in current contest
        const contestProblems = allProblems.filter((problem) => problemIds.includes(problem._id));

        setProblems(contestProblems);
      } catch (error) {
        console.error("Failed to fetch contest or problems:", error);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContestAndProblems();
  }, [id]);

  const handleSolve = async (contestId:string, problemId: string) => {
    try {
      await axios.get(`${API_URL}/contest/${contestId}/codeEditor/${problemId}`);
      navigate(`/contest/${contestId}/codeEditor/${problemId}`);
    } catch (error) {
      console.error("Failed to solve problem:", error);
    }
  };

  const filteredProblems = problems.filter(
    (problem) =>
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

  if (loading) return <div>Loading contest problems...</div>;

  return (
    <div>
      <Particles
        id="welcome-particles"
        init={particlesInit}
        options={particlesOptions}
        className="particles-container"
      />
      <header className="header">
        <h1 style={{ marginLeft: "120px" }}>{`Contest: ${contestName}`}</h1>
        {!localStorage.getItem("token") ? (
          <button onClick={() => navigate("/login")} style={{ marginRight: "30px" }}>
            Login
          </button>
        ) : (
          <button
            onClick={() => {
              handleLogout();
              navigate("/login");
            }}
            style={{ marginRight: "30px" }}
          >
            Logout
          </button>
        )}
      </header>
      <div className="container">
      <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "20px" }}>
        <button onClick={()=>navigate(`/contest/${id}/leaderboard`)} style={{flex:1}}>Leaderboard</button>
        <button onClick={()=> navigate("/dashboard")} style={{flex:1}}>End contest</button>
        </div>
        <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "20px" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            placeholder="Search problems..."
            style={{ flex: 5 }}
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
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
          <div>No problems found in this contest.</div>
        ) : (
          <>
            <div style={{ display: "flex", fontWeight: "bold", marginBottom: 12, width: "100%" }}>
              <div style={{ flex: 4 }}>Problem</div>
              <div style={{ flex: 2 }}>Difficulty</div>
              <div style={{ flex: 2 }}>Points</div>
              <div style={{ flex: 1 }}>Actions</div>
            </div>
            <div className="problem-list">
              {filteredProblems
                .map((problem) => (
                  <div
                    key={problem._id}
                    className="problem-item"
                    style={{ alignItems: "center" }}
                  >
                    <div style={{ flex: 4 }}>{problem.name}</div>
                    <div style={{ flex: 2 }}>{problem.difficulty}</div>
                    <div style={{ flex: 2 }}>{problem.points}</div>
                    <div className="problem-actions" style={{ flex: 1 }}>
                      <button
                        className="button-action"
                        onClick={() => {
                            if (id) handleSolve(id, problem._id);
                          }}
                      >
                        Solve
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContestProblemDashboard;
