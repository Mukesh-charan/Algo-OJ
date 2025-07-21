import styles from './Home.module.css';
import React from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  // Check if the user is authenticated
  const token = localStorage.getItem("token");
  if (!token) {
    // Redirect to login page if not authenticated
    navigate("/login");
}

  return (
    <>
      {/* Modal for Submissions */}
      <div id="submissionsModal" className={styles.modal}>
        <div className={styles.modalContent}>
          <span className={styles.closeButton}>&times;</span>
          <h2>Submissions</h2>
          <table id="submissionsTable">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Question Number</th>
                <th>Timestamp</th>
                <th>Judgement Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Rows will be dynamically added later */}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Layout */}
      <div className={styles.container}>
        {/* Left Column */}
        <div className={styles.questionSection}>
          <h2>Output</h2>
          <div id="output" className={styles.outputContainer}>
            <pre id="outputText" className="no-output">No output yet</pre>
          </div>

          {/* Input */}
          <div className={styles.inputContainer}>
            <label htmlFor="userInput"><strong>Enter Input:</strong></label>
            <textarea id="userInput" placeholder="Type your input here..."></textarea>
          </div>

          {/* Buttons */}
          <div className={styles.buttonContainer}>
            <button id="runButton">Run</button>
            <button id="submitButton" className={styles.submitButton}>Submit</button>
          </div>

          {/* Problem Dropdown */}
          <select id="problemSelector" className={styles.problemDropdown}>
            <option value="x">Question 1</option>
            <option value="x">Question 2</option>
            <option value="x">Question 3</option>
          </select>
        </div>

        {/* Right Column */}
        <div className={styles.answerSection}>
          <h2>Code Editor</h2>

          {/* Language Dropdown */}
          <select id="languageSelector" className={styles.languageDropdown}>
            <option value="python">Python</option>
            <option value="c">C</option>
            <option value="clike">C++</option>
            <option value="java">Java</option>
          </select>

          {/* Editor */}
          <div className={styles.editorContainer}>
            <textarea id="codeEditor"></textarea>
          </div>
        </div>
      </div>

      {/* View Submissions Button */}
      <div>
        <button id="submissionPageButton" className={styles.submissionsButton}>View Submissions</button>
      </div>
    </>
  );
};

export default Home;
