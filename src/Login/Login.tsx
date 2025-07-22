import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import axios from "axios";
import styles from "./Login.module.css";

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
      const response = await axios.post("http://localhost:8000/api/auth/login", {
        username: formData.usernameOrEmail, // Send username or email
        email: formData.usernameOrEmail, // Send username or email
        password: formData.password,
      });

      // Store the token (in localStorage or other methods)
      localStorage.setItem("token", response.data.token);

      // Redirect to the home page after successful login
      navigate("/admindashboard"); // Assuming you have a Home.tsx component

    } catch (error: any) {
      // Show error message if login fails
      setError(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <header className={styles.header}>
        <h1>Random(Compile)</h1>
      </header>

      <div className={styles.loginContainer}>
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
