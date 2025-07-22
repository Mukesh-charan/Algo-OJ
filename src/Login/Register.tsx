import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import styles from "./Login.module.css";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Initialize useNavigate
  const navigate = useNavigate(); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(""); // Reset error message
    setMessage(""); // Reset success message

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/register", 
        formData
      );
      setMessage(response.data.message); // Success message
      navigate("/admindashboard"); // Redirect to /home after successful registration
    } catch (error: any) {
      console.error("Error response:", error.response);
      setError(error.response?.data?.message || error.message || "Something went wrong");
    }
  };

  return (
    <div>
      <header className={styles.header}>
        <h1>Random(Compile)</h1>
      </header>

      <div className={styles.loginContainer}>
        
        <h2>Register</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>} {/* Display success message */}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
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
            Register
          </button>
        </form>
        <a href="/" className={styles.registerLink} style={{ marginLeft: 12 }}>
          Already have an account? Login
        </a>
      </div>
    </div>
  );
};

export default Register;
