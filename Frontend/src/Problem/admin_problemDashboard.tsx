import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";
import { handleLogout } from "../auth";

const API_URL = "https://algo-oj.onrender.com/api";

interface Problem {
  _id: string;
  name: string;
  difficulty: string;
  points: number;
}

const ProblemDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(`${API_URL}/problems`);
      setProblems(res.data);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
      setProblems([]);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/problems/${id}`);
      fetchProblems();
    } catch (error) {
      console.error("Failed to delete problem:", error);
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
  const filteredProblems = problems.filter((problem) =>
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
        <button className="back-btn" onClick={() => navigate("/admindashboard")}>Back to Dashboard</button>

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
              <div style={{ flex: 2 }}>Points</div>
              <div style={{ flex: 2 }}>Actions</div>
            </div>
            <div className="problem-list">
              {filteredProblems.map((problem) =>
              (
                <div key={problem._id} className="problem-item" style={{ alignItems: "center" }}>
                  <div style={{ flex: 4 }}>{problem.name}</div>
                  <div style={{ flex: 2 }}>{problem.difficulty}</div>
                  <div style={{ flex: 2 }}>{problem.points}</div>
                  <div className="problem-actions" style={{ flex: 2 }}>
                    <button className="button-action" 
                      onClick={() => handleSolve(problem._id)}>
                        Solve
                      </button>
                    <button className="button-action"
                      onClick={() => navigate(`/editProblem/${problem._id}`)}
                    >
                      Edit
                    </button>
                    <button className="button-action"
                      onClick={() => handleDelete(problem._id)}
                    >
                      Delete
                    </button>

                  </div>
                </div>
              )
              )}
            </div>
          </>
        )}
        <button className="add-problem-btn" onClick={() => navigate("/addProblem")}>
          Add Problem
        </button>
      </div>
    </div>
  );
};

export default ProblemDashboard;
