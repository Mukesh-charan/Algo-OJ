import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";
import { handleLogout } from "../auth";

const API_URL = "https://algo-oj.onrender.com/api/problems";

interface TestCase {
  input: string;
  output: string;
}

const EditProblem: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sampleIO, setSampleIO] = useState<TestCase[]>([{ input: "", output: "" }]);
  const [testcases, setTestcases] = useState<TestCase[]>([{ input: "", output: "" }]);
  const [loading, setLoading] = useState(true);
  const [visibility, setVisibility] = useState(true);
  const [points, setPoints] = useState<number>(0);
  const [random, setRandom] = useState<number[]>([]);
  const [randomsize, setRandomSize] = useState<number>(0);
  
  useEffect(() => {
    if (!id) return;
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`);
        const data = res.data;

        setName(data.name || "");
        setDifficulty(data.difficulty || "");
        setProblemStatement(data.problemStatement || "");
        setPoints(data.points || 0);
        setVisibility(data.visibility || false)
        setRandomSize(data.random.length)

        if (Array.isArray(data.sampleInput) && Array.isArray(data.sampleOutput)) {
          const samples = data.sampleInput.map((input: string, idx: number) => ({
            input,
            output: data.sampleOutput?.[idx] ?? "",
          }));
          setSampleIO(samples.length ? samples : [{ input: "", output: "" }]);
        } else {
          setSampleIO([{ input: "", output: "" }]);
        }

        if (Array.isArray(data.testcases) && data.testcases.length > 0) {
          setTestcases(data.testcases);
        } else {
          setTestcases([{ input: "", output: "" }]);
        }
      } catch (error) {
        console.error("Failed to fetch problem data:", error);
        alert("Failed to load problem data.");
        navigate("/adminDashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, navigate]);
  const shuffleArray = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const gen = (max: number) => {
    const arr = Array.from({ length: max }, (_, i) => i + 1);
    return shuffleArray(arr);
  };
  if (loading) return <div>Loading...</div>;

  // Handlers for sampleIO
  const handleAddSample = () => setSampleIO([...sampleIO, { input: "", output: "" }]);
  const handleRemoveSample = (index: number) => setSampleIO(sampleIO.filter((_, i) => i !== index));
  const handleSampleChange = (index: number, field: "input" | "output", value: string) => {
    const updated = [...sampleIO];
    updated[index][field] = value.trimStart();
    setSampleIO(updated);
  };

  // Handlers for testcases
  const handleAddTestcase = () => setTestcases([...testcases, { input: "", output: "" }]);
  const handleRemoveTestcase = (index: number) => setTestcases(testcases.filter((_, i) => i !== index));
  const handleTestcaseChange = (index: number, field: "input" | "output", value: string) => {
    const updated = [...testcases];
    updated[index][field] = value.trimStart();
    setTestcases(updated);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!difficulty) {
      alert("Please select a difficulty level.");
      return;
    }

    try {
      const filteredSampleInput = sampleIO.map(io => io.input.trim()).filter(Boolean);
      const filteredSampleOutput = sampleIO.map(io => io.output.trim()).filter(Boolean);

      await axios.put(`${API_URL}/${id}`, {
        name: name.trim(),
        difficulty,
        points,
        visibility,
        random,
        problemStatement: problemStatement.trim(),
        sampleInput: filteredSampleInput,
        sampleOutput: filteredSampleOutput,
        testcases,
      });

      alert("Problem updated successfully");
      navigate(-1);
    } catch (error) {
      console.error("Failed to update problem:", error);
      alert("Error updating problem");
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
        <form onSubmit={handleSubmit} className="add-form" noValidate>
          <label htmlFor="problemName">Problem Name:</label>
          <input
            id="problemName"
            required
            className="input-full"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={200}
          />

          <label htmlFor="difficulty">Difficulty:</label>
          <select
            id="difficulty"
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
            <option value="">Select user Visibility</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
          <label htmlFor="problemStatement">Problem Statement:</label>
          <textarea
            id="problemStatement"
            rows={5}
            required
            className="input-full"
            value={problemStatement}
            onChange={e => setProblemStatement(e.target.value)}
            maxLength={5000}
          />
          <label>Max Lines:</label>
          <input
            required
            className="input-full"
            value={randomsize}  
            onChange={e => {
              const val = Number(e.target.value);
              setRandomSize(val);
              setRandom(gen(val));
            }}
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
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => handleRemoveSample(idx)}
                  aria-label="Remove sample"
                >
                  &minus;
                </button>
              )}
              {idx === sampleIO.length - 1 && (
                <button
                  type="button"
                  className="btn-add"
                  onClick={handleAddSample}
                  aria-label="Add sample"
                >
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
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => handleRemoveTestcase(idx)}
                  aria-label="Remove testcase"
                >
                  &minus;
                </button>
              )}
              {idx === testcases.length - 1 && (
                <button
                  type="button"
                  className="btn-add"
                  onClick={handleAddTestcase}
                  aria-label="Add testcase"
                >
                  +
                </button>
              )}
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <button type="submit" className="button-action">
              Update
            </button>
            <button
              type="button"
              className="button-action"
              style={{ backgroundColor: "#eee", color: "#1245a4" }}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProblem;
