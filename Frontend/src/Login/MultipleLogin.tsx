import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";

const MultipleLogin: React.FC = () => {
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  // Handle "Logout from all devices" button click
  const handleLogoutAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("_id")
      if (!token) {
        navigate("/login");
        return;
      }
      await fetch(`${import.meta.env.VITE_BACKEND}/api/auth/logoutAll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: userId,
            token: token,
        }),
      });
      localStorage.clear();
      navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to logout from all devices"
      );
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
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      links: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
      move: { enable: true, speed: 2, direction: "none" },
    },
    interactivity: {
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" },
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { particles_nb: 4 },
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
      <header className={styles.header}>
        <h1>Random(Compile)</h1>
      </header>

      <div className={styles.loginContainer} style={{ width: "25%" }}>
        <h2>Multiple Login Detected</h2>
        <p style={{ color: "red", marginBottom: 20 }}>
          Your account has been logged in from another device. To continue,
          please log out from all devices and log back in here.
        </p>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          onClick={handleLogoutAll}
          className={styles.loginButton}
          style={{ width: "100%" }}
        >
          Log Out From All Devices
        </button>
      </div>
    </div>
  );
};

export default MultipleLogin;
