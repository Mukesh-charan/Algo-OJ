import React from "react";
import styles from "./Login.module.css";

const Login: React.FC = () => {
  return (
    <div>
      <header className={styles.header}>
        <img
          src="https://dt19wmazj2dns.cloudfront.net/wp-content/uploads/2024/04/amrita-vishwa-vidyapeetham-university-logo-white-version.svg"
          alt="Amrita Vishwa Vidyapeetham"
        />
        <h1>Hack-A-Ruckus</h1>
      </header>
      
      <div className={styles.loginContainer}>
        <img
          src="https://education.sakshi.com/sites/default/files/2022-04/Amrita-vishwa-vidyapeetham-color-logo.png"
          alt="Amrita Logo"
        />
        <h2>Random(Compile)</h2>

        <form
          className={styles.loginForm}
          action="http://localhost:3000/login"
          method="post"
        >
          <div className={styles.formGroup}>
            <label htmlFor="roll_number">Username:</label>
            <input
              type="text"
              id="username"
              name="Username"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
            />
          </div>

          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
