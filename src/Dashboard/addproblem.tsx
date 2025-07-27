import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";
import { handleLogout } from "../auth";

const API_URL = "http://localhost:8000/api/problems";

interface TestCase {
  input: string;
  output: string;
}

const AddProblem: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [points, setPoints] = useState(0);
  const [sampleIO, setSampleIO] = useState<TestCase[]>([{ input: "", output: "" }]);
  const [testcases, setTestcases] = useState<TestCase[]>([{ input: "", output: "" }]);
  const [visibility, setVisibility] = useState<boolean>(true);

  const handleAddSample = () => {
    setSampleIO([...sampleIO, { input: "", output: "" }]);
  };

  const handleRemoveSample = (index: number) => {
    const updated = sampleIO.filter((_, i) => i !== index);
    setSampleIO(updated);
  };

  const handleSampleChange = (index: number, field: "input" | "output", value: string) => {
    const updated = [...sampleIO];
    updated[index][field] = value;
    setSampleIO(updated);
  };

  const handleAddTestcase = () => {
    setTestcases([...testcases, { input: "", output: "" }]);
  };

  const handleRemoveTestcase = (index: number) => {
    const updated = testcases.filter((_, i) => i !== index);
    setTestcases(updated);
  };

  const handleTestcaseChange = (index: number, field: "input" | "output", value: string) => {
    const updated = [...testcases];
    updated[index][field] = value;
    setTestcases(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!difficulty) {
      alert("Please select a difficulty level.");
      return;
    }
    try {
      const filteredSampleInput = sampleIO.map(io => io.input.trim()).filter(x => x);
      const filteredSampleOutput = sampleIO.map(io => io.output.trim()).filter(x => x);

      await axios.post(`${API_URL}/`, {
        name,
        difficulty,
        points,
        visibility,
        problemStatement,
        sampleInput: filteredSampleInput,
        sampleOutput: filteredSampleOutput,
        testcases,
      });
      alert("Problem added successfully");
      navigate(-1);
    } catch (error) {
      console.error("Failed to add problem:", error);
      alert("Error adding problem");
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
      <header className="header">
        <h1 style={{ marginLeft: "120px" }}>Random(Compile)</h1>
        <button onClick={() => { handleLogout(), navigate("/login") }} style={{ marginRight: "30px" }}>Logout</button>
      </header>
      <div className="addcontainer">
        <form onSubmit={handleSubmit} className="add-form">
          <label>Problem Name:</label>
          <input
            required
            className="input-full"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <label>Difficulty:</label>
          <select
            required
            className="input-full"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            <option value="">Select difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <label>Points:</label>

          <input
            required
            className="input-full"
            value={points}
            onChange={e => setPoints(Number(e.target.value))}
          />

          <label htmlFor="visibility">User Visibility:</label>
          <select
            id="visibility"
            className="input-full"
            value={visibility ? "true" : "false"}
            onChange={e => setVisibility(e.target.value === "true")}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>


          <label>Problem Statement:</label>
          <textarea
            rows={5}
            required
            className="input-full"
            value={problemStatement}
            onChange={e => setProblemStatement(e.target.value)}
          />

          <label>Sample Input/Output</label>
          {sampleIO.map((io, idx) => (
            <div style={{ display: "flex", gap: "8px", marginBottom: 7 }} key={idx}>
              <input
                required
                className="input-flex"
                value={io.input}
                onChange={e => handleSampleChange(idx, "input", e.target.value)}
                placeholder="Sample Input"
              />
              <input
                required
                className="input-flex"
                value={io.output}
                onChange={e => handleSampleChange(idx, "output", e.target.value)}
                placeholder="Sample Output"
              />
              {sampleIO.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => handleRemoveSample(idx)} aria-label="Remove sample">
                  &minus;
                </button>
              )}
              {idx === sampleIO.length - 1 && (
                <button type="button" className="btn-add" onClick={handleAddSample} aria-label="Add sample">
                  +
                </button>
              )}
            </div>
          ))}

          <label>Main Testcases</label>
          {testcases.map((tc, idx) => (
            <div style={{ display: "flex", gap: "8px", marginBottom: 7 }} key={idx}>
              <input
                required
                className="input-flex"
                value={tc.input}
                onChange={e => handleTestcaseChange(idx, "input", e.target.value)}
                placeholder="Testcase Input"
              />
              <input
                required
                className="input-flex"
                value={tc.output}
                onChange={e => handleTestcaseChange(idx, "output", e.target.value)}
                placeholder="Testcase Output"
              />
              {testcases.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => handleRemoveTestcase(idx)} aria-label="Remove testcase">
                  &minus;
                </button>
              )}
              {idx === testcases.length - 1 && (
                <button type="button" className="btn-add" onClick={handleAddTestcase} aria-label="Add testcase">
                  +
                </button>
              )}
            </div>
          ))}

          <button type="submit" className="button-action">
            Submit
          </button>
          <button
            type="button"
            className="button-action"
            style={{ backgroundColor: "#eee", color: "#1245a4" }}
            onClick={() => navigate("/problemDashboard")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProblem;
