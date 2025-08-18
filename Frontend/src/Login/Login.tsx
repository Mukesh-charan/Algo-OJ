import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import axios from "axios";
import styles from "./Login.module.css";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";



const Login: React.FC = () => { 


  const [formData, setFormData] = useState({
    usernameOrEmail: "", // This field will accept either username or email
    password: "",
  });
  const [error, setError] = useState<string>("");
  const navigate = useNavigate(); // Navigate hook for redirection

  // Handle change in input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission (Login)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Sending login request to the server
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/api/auth/login`, {
        username: formData.usernameOrEmail, // Send username or email
        email: formData.usernameOrEmail, // Send username or email
        password: formData.password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userType", response.data.user.type);
      localStorage.setItem("_id", response.data.user.id);
      localStorage.setItem('username', response.data.user.username);

      // Store the token (in localStorage or other methods)
      //localStorage.setItem("token", response.data.token);

      const user = response.data.user;
      if (user.type === "admin") {
        navigate("/adminDashboard");
      } else {
        navigate("/dashboard");
      }


    } catch (error: any) {
      // Show error message if login fails
      setError(error.response?.data?.message || "Something went wrong");
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
      <header className={styles.header}>
        <h1>Random(Compile)</h1>
      </header>

      <div className={styles.loginContainer} style={{ width: "25%" }}>
        <h2>Login</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>

            <label htmlFor="usernameOrEmail">Username or Email:</label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              placeholder="Enter your username or email"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>

        <a href="/register" className={styles.registerLink} style={{ marginLeft: 12 }}>
          Don't have an account? Register
        </a>
      </div>
    </div>
  );
};

export default Login;
