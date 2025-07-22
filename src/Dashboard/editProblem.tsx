import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";

const API_URL = "http://localhost:8000/api/problems";

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

  // Fetch existing problem data on mount
  useEffect(() => {
    if (!id) return;

    const fetchProblem = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`);
        const data = res.data;
        setName(data.name);
        setDifficulty(data.difficulty);
        setProblemStatement(data.problemStatement);

        // Assume sampleInput and sampleOutput are string arrays of same length
        if (Array.isArray(data.sampleInput) && Array.isArray(data.sampleOutput)) {
          const samples = data.sampleInput.map((input: string, idx: number) => ({
            input,
            output: data.sampleOutput[idx] || "",
          }));
          setSampleIO(samples.length ? samples : [{ input: "", output: "" }]);
        } else {
          setSampleIO([{ input: "", output: "" }]);
        }

        // testcases should be array of {input, output}
        if (Array.isArray(data.testcases) && data.testcases.length > 0) {
          setTestcases(data.testcases);
        } else {
          setTestcases([{ input: "", output: "" }]);
        }
      } catch (error) {
        console.error("Failed to fetch problem data:", error);
        alert("Failed to load problem data.");
        navigate("/adminDashboard");
      }
    };

    fetchProblem();
  }, [id, navigate]);

  // Handlers for sampleIO and testcases (identical to AddProblem)
  const handleAddSample = () => setSampleIO([...sampleIO, { input: "", output: "" }]);
  const handleRemoveSample = (index: number) => setSampleIO(sampleIO.filter((_, i) => i !== index));
  const handleSampleChange = (index: number, field: "input" | "output", value: string) => {
    const updated = [...sampleIO];
    updated[index][field] = value;
    setSampleIO(updated);
  };

  const handleAddTestcase = () => setTestcases([...testcases, { input: "", output: "" }]);
  const handleRemoveTestcase = (index: number) => setTestcases(testcases.filter((_, i) => i !== index));
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
      const filteredSampleInput = sampleIO.map((io) => io.input.trim()).filter(Boolean);
      const filteredSampleOutput = sampleIO.map((io) => io.output.trim()).filter(Boolean);

      await axios.put(`${API_URL}/${id}`, {
        name,
        difficulty,
        problemStatement,
        sampleInput: filteredSampleInput,
        sampleOutput: filteredSampleOutput,
        testcases,
      });

      alert("Problem updated successfully");
      navigate("/adminDashboard"); // or "/"
    } catch (error) {
      console.error("Failed to update problem:", error);
      alert("Error updating problem");
    }
  };

  return (
    <>
      <header className="header">
        <h1>Edit Problem</h1>
      </header>

      <div className="addcontainer">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <label>
            Problem Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%", padding: 6, borderRadius: 4 , color:"black", backgroundColor:"white", border: "2px solid #1245a4"}}
            />
          </label>

          <label>
            Difficulty:
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              required
              style={{ width: "100%", padding: 6, borderRadius: 4 , color:"black", backgroundColor:"white", border: "2px solid #1245a4"}}
            >
              <option value="" disabled>
                Select difficulty
              </option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>

          <label>
            Problem Statement:
            <textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              rows={5}
              required
              style={{ width: "100%", padding: 6, borderRadius: 4 , color:"black", backgroundColor:"white", border: "2px solid #1245a4"}}
            />
          </label>

          {/* Sample Input/Output Section */}
          <fieldset style={{ border: "2px solid #1245a4", padding: 10, borderRadius: 6 }}>
            <legend>Sample Input/Output</legend>
            {sampleIO.map((io, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="Sample input"
                  value={io.input}
                  onChange={(e) => handleSampleChange(idx, "input", e.target.value)}
                  required
                  style={{ flex: 1, padding: 4, borderRadius: 4 , color:"black", backgroundColor:"white", border: "2px solid #1245a4"}}
                />
                <input
                  type="text"
                  placeholder="Sample output"
                  value={io.output}
                  onChange={(e) => handleSampleChange(idx, "output", e.target.value)}
                  required
                  style={{ flex: 1, padding: 4, borderRadius: 4 , color:"black", backgroundColor:"white", border: "2px solid #1245a4"}}
                />
                {sampleIO.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSample(idx)}
                    aria-label="Remove sample"
                    style={{ cursor: "pointer", color: "red", backgroundColor:"white", border: "2px solid #1245a4"}}
                  >
                    &#x2212;
                  </button>
                )}
                {idx === sampleIO.length - 1 && (
                  <button
                    type="button"
                    onClick={handleAddSample}
                    aria-label="Add sample"
                    style={{ cursor: "pointer", color: "green", backgroundColor:"white", border: "2px solid #1245a4"}}
                  >
                    &#x2b;
                  </button>
                )}
              </div>
            ))}
          </fieldset>

          {/* Main Testcases Section */}
          <fieldset style={{ border: "2px solid #1245a4", padding: 10, borderRadius: 6 }}>
            <legend>Main Testcases</legend>
            {testcases.map((tc, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="Testcase input"
                  value={tc.input}
                  onChange={(e) => handleTestcaseChange(idx, "input", e.target.value)}
                  required
                  style={{ flex: 1, padding: 4, borderRadius: 4 , color:"black", backgroundColor:"white", border: "2px solid #1245a4"}}
                />
                <input
                  type="text"
                  placeholder="Testcase output"
                  value={tc.output}
                  onChange={(e) => handleTestcaseChange(idx, "output", e.target.value)}
                  required
                  style={{ flex: 1, padding: 4, borderRadius: 4 , color:"black",backgroundColor:"white", border: "2px solid #1245a4"  }}
                />
                {testcases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTestcase(idx)}
                    aria-label="Remove testcase"
                    style={{ cursor: "pointer", color: "red", backgroundColor:"white", border: "2px solid #1245a4"}}
                  >
                    &#x2212;
                  </button>
                )}
                {idx === testcases.length - 1 && (
                  <button
                    type="button"
                    onClick={handleAddTestcase}
                    aria-label="Add testcase"
                    style={{ cursor: "pointer", color: "green", backgroundColor:"white", border: "2px solid #1245a4"    }}
                  >
                    &#x2b;
                  </button>
                )}
              </div>
            ))}
          </fieldset>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <button type="submit" style={{ padding: "8px 16px" }}>
              Update
            </button>
            <button type="button" onClick={() => navigate("/adminDashboard")} style={{ padding: "8px 16px" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditProblem;
