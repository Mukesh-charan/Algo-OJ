import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";

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
        problemStatement,
        sampleInput: filteredSampleInput,
        sampleOutput: filteredSampleOutput,
        testcases,
      });
      alert("Problem added successfully");
      navigate("/adminDashboard");
    } catch (error) {
      console.error("Failed to add problem:", error);
      alert("Error adding problem");
    }
  };

  return (
    <div>
      <header className="header">
        <h1>Random(Compile)</h1>
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
