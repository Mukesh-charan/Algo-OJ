import React, { useEffect, useState } from "react";
import styles from "./editor.module.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";

const API_URL = `http://localhost:8000/api/problems`;

interface TestCase {
  input: string;
  output: string;
  yourOutput?: string;
}

const CodeEditor: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id?: string; contestId?: string }>();

  // problemId is always in id param
  const problemId = params.id || "";
  // contestId is optional, only present in contest route
  const contestId = params.contestId;

  const [name, setName] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sampleIO, setSampleIO] = useState<TestCase[]>([{ input: "", output: "" }]);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState(""); // for custom input output
  const [hasRun, setHasRun] = useState(false);
  const [testcases, setTestcases] = useState<{ input: string; output: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (!problemId) return;

    const fetchProblem = async () => {
      try {
        const res = await axios.get(`${API_URL}/${problemId}`);
        const data = res.data;
        setName(data.name || "");
        setDifficulty(data.difficulty || "");
        setProblemStatement(data.problemStatement || "");
        setPoints(data.points || 0);// state


        // inside fetchProblem, after getting data:
        if (Array.isArray(data.testcases) && data.testcases.length > 0) {
          setTestcases(
            data.testcases.map((tc: any) => ({ input: tc.input, output: tc.output }))
          );
        } else {
          setTestcases([]);
        }


        if (Array.isArray(data.sampleInput) && Array.isArray(data.sampleOutput)) {
          const samples = data.sampleInput.map((input: string, idx: number) => ({
            input,
            output: data.sampleOutput?.[idx] ?? "",
          }));
          setSampleIO(samples.length ? samples : [{ input: "", output: "" }]);
        } else {
          setSampleIO([{ input: "", output: "" }]);
        }
      } catch (error) {
        console.error("Failed to fetch problem data:", error);
        alert("Failed to load problem data.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId, navigate]);

  const outputsMatch = (test: TestCase) =>
    test.yourOutput !== undefined && test.output.trim() === (test.yourOutput || "").trim();

  const getOutputBoxStyle = (test: TestCase) => {
    if (!hasRun) {
      return {
        border: "2px solid #ccc",
        boxShadow: "none",
        borderRadius: 6,
        padding: "8px 12px",
        marginBottom: 8,
        whiteSpace: "pre-wrap",
        fontFamily: "monospace",
        backgroundColor: "#fafafa",
        minHeight: 40,
      } as React.CSSProperties;
    }
    const pass = outputsMatch(test);
    return {
      border: "2px solid",
      borderColor: pass ? "green" : "red",
      boxShadow: pass ? "0 0 6px 2px #6fa36f55" : "0 0 6px 2px #e5737355",
      borderRadius: 6,
      padding: "8px 12px",
      marginBottom: 8,
      whiteSpace: "pre-wrap",
      fontFamily: "monospace",
      backgroundColor: "#fafafa",
      minHeight: 40,
    } as React.CSSProperties;
  };

  if (loading) return <>Loading...</>;

  const testCaseTabs = sampleIO.map((_, idx) => `Test Case ${idx + 1}`);
  const allTabs = [...testCaseTabs, "Custom Input"];
  const lastTabIndex = allTabs.length - 1;

  const handleTabClick = (idx: number) => {
    setSelectedTab(idx);
    setOutput("");
  };

  const isCustom = selectedTab === lastTabIndex;
  const currentInput = isCustom ? customInput : sampleIO[selectedTab]?.input || "";
  const currentExpectedOutput = isCustom ? "" : sampleIO[selectedTab]?.output || "";
  const currentYourOutput = isCustom ? "" : sampleIO[selectedTab]?.yourOutput || "";

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleEditorChange = (value?: string) => {
    setCode(value || "");
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const newSampleIO = [...sampleIO];
      for (let i = 0; i < newSampleIO.length; i++) {
        const input = newSampleIO[i].input || "";
        const payload = {
          language,
          code,
          input,
        };
        const response = await axios.post(`http://localhost:5245/run`, payload);
        const result = response.data;
        newSampleIO[i].yourOutput =
          typeof result === "string" ? result : JSON.stringify(result);
      }
      setSampleIO(newSampleIO);

      setHasRun(true);

      const firstFailIdx = newSampleIO.findIndex(
        (test) => (test.yourOutput || "").trim() !== (test.output || "").trim()
      );
      if (firstFailIdx !== -1) {
        setSelectedTab(firstFailIdx);
      }

      if (customInput.trim() !== "") {
        const payload = {
          language,
          code,
          input: customInput,
        };
        const response = await axios.post(`http://localhost:5245/run`, payload);
        const result = response.data;
        setOutput(typeof result === "string" ? result : JSON.stringify(result));
      } else {
        setOutput("");
      }
    } catch (error) {
      setOutput("Error running code on test cases");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  // Example submission handler that sends contestId conditionally
  const handleSubmitSolution = async () => {
    if (!code.trim()) {
      alert("No code to submit!");
      console.warn("Submission aborted: No code provided.");
      return;
    }
    if (!testcases || testcases.length === 0) {
      alert("No testcases found for this problem!");
      console.warn("Submission aborted: No testcases available.");
      return;
    }
  
  
    let status = "Accepted";
    let runTime = "0ms";
    let passedCount = 0;
    const startTime = Date.now();
  
    try {
      // Run code on ALL testcases sequentially
      for (const [index, tc] of testcases.entries()) {
  
        const payload = {
          language,
          code,
          input: tc.input,
        };
  
  
        const response = await axios.post("http://localhost:5245/run", payload);
        const result = response.data;
  

  
        if (typeof result === "object" && result.status === "TLE") {
          console.warn(`Testcase #${index + 1} caused TLE.`);
          status = "TLE";
          break; // stop further testing
        }
  
        // Try to extract the actual output string
        let yourOutput = "";
        if (typeof result.output === "string") {
          yourOutput = result.output;
        } else if (typeof result === "string") {
          yourOutput = result;
        } else if (result.stdout) {
          yourOutput = result.stdout;
        } else {
          yourOutput = JSON.stringify(result);
        }
  
  
        if (yourOutput.trim() === tc.output.trim()) {
          passedCount++;
        } else {
          console.warn(`Testcase #${index + 1} failed.`);
          if (status !== "TLE") {
            status = "Wrong Answer"; // only downgrade if no TLE occurred yet
          }
        }
      }
  
      runTime = (Date.now() - startTime) + "ms";
  
      // Save submission code file to backend to get UUID
      const submitRes = await axios.post("http://localhost:5245/submit", { language, code });
      
  
      const uuid = submitRes.data.uuid;
      if (!uuid) {
        console.error("UUID not returned from /submit endpoint.");
        alert("Failed to save submission file.");
        return;
      }
  
      // Calculate points based on passed testcases
      const maxPoints = points || 0;
      const achievedPoints =
        status === "TLE" ? 0 : Math.round((passedCount / testcases.length) * maxPoints);
  
      // Prepare payload for saving submission metadata to backend
      const submissionPayload = {
        problemId,
        contestId: contestId || "", // optional
        points: achievedPoints,
        status,
        submissionTime: new Date().toISOString(),
        runTime,
        userId: localStorage.getItem("_id") || "anonymous",
        userName: localStorage.getItem("username") || "anonymous",
        problemName: name,
        uuid,
      };
  
  
      // IMPORTANT: Check your backend API URL here!
      // Is it `http://localhost:8000/api/submissions` or something else?
      const backendSubmissionUrl = "http://localhost:8000/api/submissions";
  
      const saveRes = await axios.post(backendSubmissionUrl, submissionPayload);
  
  
      alert(
        `Solution Submitted!\nVerdict: ${status}\nPassed: ${passedCount}/${testcases.length}\nScore: ${achievedPoints}/${maxPoints}`
      );
    } catch (error: any) {
      console.error("Submission error caught:", error);
      alert(`Failed to submit solution: ${error?.message || error}`);
    }
  };
  


  return (
    <div
      className={styles.container}
      style={{ display: "flex", height: "100vh", gap: 20, padding: 16 }}
    >
      {/* Left Panel - Problem */}
      <div className={styles["question-section"]}>
        <div className={styles.questionContent}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h2 style={{ margin: 0 }}>{name}</h2>
            <button onClick={() => navigate(-1)}>Back to Dashboard</button>
          </div>
          <div style={{ color: "#888", marginBottom: 12 }}>
            {difficulty} | {points} Points
          </div>
          <div
            className={styles.problemStatementScrollable}
            style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
          >
            {problemStatement}
          </div>
        </div>

        {/* Testcases Tabs */}
        <div className={styles.testcasePanel} style={{ marginTop: "auto" }}>
          <div className={styles["tabs-container"]} style={{ marginBottom: 8 }}>
            {allTabs.map((tab, idx) => {
              const isSampleTab = idx < sampleIO.length;
              const testPassed = isSampleTab && hasRun && outputsMatch(sampleIO[idx]);
              const testFailed = isSampleTab && hasRun && !outputsMatch(sampleIO[idx]);

              return (
                <button
                  key={tab}
                  onClick={() => handleTabClick(idx)}
                  className={`${styles.tabButton} ${idx === selectedTab ? styles.activeTab : ""}`}
                  style={{
                    marginRight: 4,
                    padding: "6px 12px",
                    borderTopLeftRadius: "5px",
                    borderTopRightRadius: "5px",
                    background: idx === selectedTab ? "#e3f0fa" : "#f7f7f7",
                    fontWeight: idx === selectedTab ? "bold" : "normal",
                    cursor: "pointer",
                    outline: "none",
                    borderTop: idx === selectedTab ? "2px solid #1976d2" : "1px solid #ccc",
                    borderRight: idx === selectedTab ? "2px solid #1976d2" : "1px solid #ccc",
                    borderBottom: idx === selectedTab ? "2px solid #1976d2" : "1px solid #ccc",
                    borderLeft:
                      hasRun && isSampleTab
                        ? testPassed
                          ? "6px solid green"
                          : testFailed
                            ? "6px solid red"
                            : idx === selectedTab
                              ? "2px solid #1976d2"
                              : "1px solid #ccc"
                        : idx === selectedTab
                          ? "2px solid #1976d2"
                          : "1px solid #ccc",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div
            className={styles["tab-panel"]}
            style={{
              padding: 8,
              border: "1px solid #ccc",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>
                Input:
              </label>
              <textarea
                value={currentInput}
                onChange={(e) => {
                  if (isCustom) setCustomInput(e.target.value);
                }}
                readOnly={!isCustom}
                className={styles["testcase-input"]}
                placeholder="Enter input..."
                style={{
                  width: "100%",
                  minHeight: 60,
                  background: !isCustom ? "#f4f4f4" : "white",
                  fontFamily: "monospace",
                  resize: "vertical",
                }}
              />
            </div>

            {!isCustom && currentExpectedOutput ? (
              <div style={{ marginTop: 8 }}>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>
                  Expected Output:
                </label>
                <div style={getOutputBoxStyle(sampleIO[selectedTab])}>{currentExpectedOutput}</div>

                {currentYourOutput !== undefined ? (
                  <>
                    <label
                      style={{
                        fontWeight: "bold",
                        display: "block",
                        marginTop: 12,
                        marginBottom: 4,
                      }}
                    >
                      Your Output:
                    </label>
                    <div style={getOutputBoxStyle(sampleIO[selectedTab])}>{currentYourOutput}</div>
                  </>
                ) : null}
              </div>
            ) : null}

            {isCustom && (
              <div style={{ marginTop: 8 }}>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>
                  Output:
                </label>
                <textarea
                  value={output}
                  readOnly
                  style={{
                    width: "100%",
                    minHeight: 80,
                    background: "#e8f0fe",
                    fontFamily: "monospace",
                    resize: "vertical",
                    color: "#000000",
                  }}
                  placeholder="Run the code to see output here."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Code Editor and Run */}
      <div
        className={styles["answer-section"]}
        style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
      >
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <label htmlFor="language-select" style={{ fontWeight: "bold" }}>
            Language:
          </label>
          <select
            id="language-select"
            className={styles["language-dropdown"]}
            value={language}
            onChange={handleLanguageChange}
            style={{
              padding: "6px 10px",
              fontSize: 14,
              borderRadius: 4,
              border: "1px solid #ccc",
              width: 150,
            }}
          >
            <option value="py">Python</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
            {/* Add more languages if needed */}
          </select>
        </div>

        <div
          className={styles.monacoWrapper}
          style={{
            background: "#191919",
            color: "#fff",
            padding: 10,
            borderRadius: 8,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 400,
            height: "calc(100% - 56px)",
            boxSizing: "border-box",
          }}
        >
          <MonacoEditor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              autoIndent: "advanced",
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              snippetSuggestions: "inline",
              tabSize: 4,
              insertSpaces: true,
              formatOnType: true,
              formatOnPaste: true,
            }}
          />
        </div>

        {/* Run and Submit Buttons */}
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            style={{
              backgroundColor: isRunning ? "#90caf9" : "#1976d2",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              cursor: isRunning || isSubmitting ? "not-allowed" : "pointer",
              flex: 1,
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => {
              if (!isRunning && !isSubmitting) e.currentTarget.style.backgroundColor = "#115293";
            }}
            onMouseLeave={(e) => {
              if (!isRunning && !isSubmitting) e.currentTarget.style.backgroundColor = "#1976d2";
            }}
          >
            {isRunning ? "Running..." : "Run Code"}
          </button>

          <button
            onClick={handleSubmitSolution}
            disabled={isRunning || isSubmitting}
            style={{
              backgroundColor: isSubmitting ? "#a5d6a7" : "#388e3c",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              cursor: isRunning || isSubmitting ? "not-allowed" : "pointer",
              flex: 1,
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => {
              if (!isRunning && !isSubmitting) e.currentTarget.style.backgroundColor = "#2e7d32";
            }}
            onMouseLeave={(e) => {
              if (!isRunning && !isSubmitting) e.currentTarget.style.backgroundColor = "#388e3c";
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Solution"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
