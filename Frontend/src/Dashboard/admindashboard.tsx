import "./dashboard.css";
import Particles from "react-tsparticles";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../auth";
import React, { useEffect, useState } from "react";
import { setAiAssistanceEnabled, fetchAiAssistanceEnabled } from "../AI integration/ai";
const AdminDashboard = () => {
  const [aiEnabled, setAiEnabled] = useState(false);
  useEffect(() => {
    async function getStatus() {
      const status = await fetchAiAssistanceEnabled();
      setAiEnabled(status);
    }
    getStatus();
  }, []);

  // Handler to toggle AI status
  const toggleAiStatus = async () => {
    const newStatus = !aiEnabled;
    await setAiAssistanceEnabled(newStatus);
    setAiEnabled(newStatus);
  };

  const particlesInit = async (engine: Engine) => {
    try {
      await loadSlim(engine);
    } catch (error) {
      console.error("Error initializing particles:", error);
    }
  };
  const ai_status = fetchAiAssistanceEnabled()
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
  const navigate = useNavigate();
  return (
    <div>
      <Particles
        id="welcome-particles"
        init={particlesInit}
        options={particlesOptions}
        className="particles-container"
      />

      <div>
        <header className="header">
          <h1 style={{ marginLeft: "120px" }}>Random(Compile)</h1>
          <button onClick={() => { handleLogout(), navigate("/login") }} style={{ marginRight: "30px" }}>Logout</button>
        </header>
        <div className="container">
          <h1>Admin Dashboard</h1>
          <div style={{ display: "flex", gap: "100px", width: "100%" }}>
            <button style={{ flex: 1 }} onClick={() => navigate("/problemDashboard")}><h2 style={{ color: "black" }}>Problem Management</h2></button>
            <button style={{ flex: 1 }} onClick={() => navigate("/userDashboard")}><h2 style={{ color: "black" }}>User Management</h2></button>
          </div>
          <div style={{ display: "flex", gap: "100px", width: "100%", marginTop: "20px" }}>
            <button style={{ flex: 1 }} onClick={() => navigate("/contest")}><h2 style={{ color: "black" }}>Contest Management</h2></button>
            <button onClick={toggleAiStatus} style={{flex:1}}><h2 style={{ color: "black" }}>
              {aiEnabled ? "Disable AI" : "Enable AI"}</h2>
            </button>
          </div>
          <div style={{ display: "flex", gap: "100px", width: "100%", marginTop: "20px" }}>
            <button style={{ flex: 1 }} onClick={() => navigate("/")}><h2 style={{ color: "black" }}>Console</h2></button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminDashboard;
