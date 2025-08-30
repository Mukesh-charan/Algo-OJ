import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";
import { handleLogout } from "../auth";

const API_URL = `${import.meta.env.VITE_BACKEND}/api`;

interface Contest {
  _id: string;
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

const ContestDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await axios.get(`${API_URL}/contests`);
      setContests(res.data);
    } catch (error) {
      console.error("Failed to fetch contests:", error);
      setContests([]);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/contests/${id}`);
      fetchContests();
    } catch (error) {
      console.error("Failed to delete contest:", error);
    }
  };

  const filteredContests = contests.filter((contest) =>
    contest.name.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Search contests..."
            style={{ flex: 5 }}
          />
        </div>
        {filteredContests.length === 0 ? (
          <div>No contests found.</div>
        ) : (
          <>
            <div style={{ display: "flex", fontWeight: "bold", marginBottom: 12, width: "100%" }}>
              <div style={{ flex: 3 }}>Contest</div>
              <div style={{ flex: 1 }}>Start Date</div>
              <div style={{ flex: 1 }}>Start Time</div>
              <div style={{ flex: 1 }}>End Date</div>
              <div style={{ flex: 1 }}>End Time</div>
              <div style={{ flex: 2 }}>Actions</div>
            </div>
            <div className="contest-list" style={{ display: "flex", flexDirection: "column" ,fontWeight: "bold", marginBottom: 12, width: "100%" }}>
              {filteredContests.map((contest) => (
                <div
                  key={contest._id}
                  className="contest-item"
                  style={{ display: "flex", fontWeight: "normal", marginBottom: 12, width: "100%", alignItems: "center" }}
                >
                  <div style={{ flex: 3 }}>{contest.name}</div>
                  <div style={{ flex: 1 }}>{contest.startDate}</div>
                  <div style={{ flex: 1 }}>{contest.startTime}</div>
                  <div style={{ flex: 1 }}>{contest.endDate}</div>
                  <div style={{ flex: 1 }}>{contest.endTime}</div>
                  <div
                    className="contest-actions"
                    style={{ flex: 2, display: "flex", gap: "10px" }}
                  >
                    <button
                      className="button-action"
                      onClick={() => navigate(`/contest/${contest._id}/leaderboard`)}
                    >
                      LeaderBoard
                    </button>
                    <button
                      className="button-action"
                      onClick={() => navigate(`/editContest/${contest._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="button-action"
                      onClick={() => handleDelete(contest._id)}
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
        <button className="add-contest-btn" onClick={() => navigate("/addcontest")}>
          Add Contest
        </button>
      </div>
    </div>
  );
};

export default ContestDashboard;
