import React, { useEffect, useState, useRef } from "react";
import styles from "./editor.module.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";


const PROBLEM_API_URL = `${import.meta.env.VITE_BACKEND}/api/problems`;
const CONTEST_API_URL = `${import.meta.env.VITE_BACKEND}/api/contests`;
const SUBMISSION_API_URL = `${import.meta.env.VITE_BACKEND}/api/submissions`;
const AI_API_URL = `${import.meta.env.VITE_BACKEND}/api/ai`;
const COMPILER_API_URL = `${import.meta.env.VITE_COMPILER}`;

interface TestCase {
  input: string;
  output: string;
  yourOutput?: string;
}

interface Contest {
  _id: string;
  name: string;
  startDate: string; // e.g. "2025-07-30"
  startTime: string; // e.g. "14:00:00"
  endDate: string;   // e.g. "2025-08-05"
  endTime: string;   // e.g. "18:00:00"
  // additional fields as necessary
}
interface Submission {
  _id: string;
  problemId: string;
  points: number;
  status: string;
  submissionTime: string;   // or Date if parsed
  runTime: string;
  userId: string;
  userName: string;
  problemName: string;
  uuid: string;
  contestId?: string;
}

const CodeEditor: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id?: string; contestId?: string }>();

  const problemId = params.id || "";
  const contestId = params.contestId || "";
  const [hint, setHint] = useState<string | null>(null);
  const [showHintPopup, setShowHintPopup] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiStatusLoading, setAiStatusLoading] = useState(true);

  const [name, setName] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sampleIO, setSampleIO] = useState<TestCase[]>([{ input: "", output: "" }]);
  const [points, setPoints] = useState(0);
  const [testcases, setTestcases] = useState<TestCase[]>([]);
  const [isRandomOrder, setIsRandomOrder] = useState(true);
  const [loading, setLoading] = useState(true);

  // Contest details & countdown timer state
  const [contest, setContest] = useState<Contest | null>(null);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [showSubmissionTable, setShowSubmissionTable] = useState(false);
  const [contestEnded, setContestEnded] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);

  // Code editor related
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [randomOrder, setRandomOrder] = useState<number[]>([]);
  const [codeLines, setCodeLines] = useState<String[]>([])
  const [selectedTab, setSelectedTab] = useState(0);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Contest data if contestId present
  useEffect(() => {

    const fetchContest = async () => {
      try {
        const res = await axios.get(`${CONTEST_API_URL}/${contestId}`);
        const data: Contest = res.data;
        setContest(data);
        setupContestTimer(data);
        setIsRandomOrder(res.data.type === "true" ? true : false)
      } catch (error) {
        console.error("Failed to fetch contest data:", error);
      }
    };

    if (contestId) {
      fetchContest();
    }
  }, [contestId]);

  // Setup countdown timer for contest end time
  const setupContestTimer = (contest: Contest) => {
    // Combine contest.endDate and endTime into JS Date
    const endDateTimeStr = `${contest.endDate}T${contest.endTime}`;
    const endTime = new Date(endDateTimeStr);

    const updateTimer = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setContestEnded(true);
        setTimeLeftMs(0);

        // Clear timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      } else {
        setTimeLeftMs(diff);
        setContestEnded(false);
      }
    };

    updateTimer();

    // Clear previous interval just in case
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(updateTimer, 1000);
  };

  // Fetch problem data AND testcases
  useEffect(() => {
    if (!problemId) return;

    const fetchProblem = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${PROBLEM_API_URL}/${problemId}`);
        const data = res.data;

        setName(data.name || "");
        setDifficulty(data.difficulty || "");
        setProblemStatement(data.problemStatement || "");
        setPoints(data.points || 0);

        const fetchedCodeLines: string[] = (data.starterCode || "").split("\n");
        setCodeLines(fetchedCodeLines);

        const fetchedRandomOrder: number[] = Array.isArray(data.random) ? data.random : [];
        setRandomOrder(fetchedRandomOrder);

        // Set testcases and sample IO as per your existing logic
        if (Array.isArray(data.testcases) && data.testcases.length > 0) {
          const tc = data.testcases.map((t: any) => ({ input: t.input, output: t.output }));
          setTestcases(tc);
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
  useEffect(() => {
    const fetchAiStatus = async () => {
      try {
        const res = await axios.get(`${AI_API_URL}/status`);
        setAiEnabled(!!res.data.status);
      } catch (error) {
        // If fetch fails, you might want to default to disabled for safety
        setAiEnabled(false);
        console.error("Failed to fetch AI status:", error);
      } finally {
        setAiStatusLoading(false);
      }
    };
    fetchAiStatus();
  }, []);


  useEffect(() => {
    if (codeLines.length === 0) return;

    if (isRandomOrder) {
      const totalLines = randomOrder.length || codeLines.length;
      const randomizedLines = Array(totalLines).fill("");

      randomOrder.forEach((pos: number, i: number) => {
        randomizedLines[pos] = codeLines[i] ?? "";
      });

      const randomizedCode = randomizedLines.join("\n");
      setCode(randomizedCode);
    } else {
      // Normal order with all code lines as-is
      setCode(codeLines.join("\n"));
    }
  }, [isRandomOrder, randomOrder, codeLines]);


  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Formatting timeLeftMs into hh:mm:ss and % for timer bar
  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return "0s";

    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    return `${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "m " : ""
      }${seconds}s`;
  };
  function reorderToOriginal(code: string, randomOrder: number[]): string {
    const lines = code.split("\n");
    // Explicitly declare the type as string[]
    const inverseOrder: string[] = [];
    randomOrder.forEach((origIdx, shuffledIdx) => {
      inverseOrder[origIdx] = lines[shuffledIdx] ?? "";
    });
    return inverseOrder.join("\n");
  }
  const fetchSubmissions = async () => {
    const userId = localStorage.getItem("_id"); // correct key
    if (!userId || !problemId) {
      setSubmissions([]);
      return;
    }
    const payload = { userId, problemId };
    try {
      const res = await axios.post(`${SUBMISSION_API_URL}/usersubmission`, payload);
      setSubmissions(res.data);
      setShowSubmissionTable(true);
    } catch (error) {
      console.error("Failed to fetch submissions:", error); // corrected message
      setSubmissions([]);
    }
  };


  function handleEditorChange(value: string) {
    const lines = value.split('\n');
    if (!isRandomOrder && lines.length > randomOrder.length) {
      const trimmed = lines.slice(0, randomOrder.length).join('\n');
      setCode(trimmed);
    } else {
      setCode(value);
    }
  }
  // Calculate % elapsed for timer bar
  const getContestProgressPercent = () => {
    if (!contest) return 0;

    const startDateTime = new Date(`${contest.startDate}T${contest.startTime}`).getTime();
    const endDateTime = new Date(`${contest.endDate}T${contest.endTime}`).getTime();
    const now = Date.now();

    if (now >= endDateTime) return 100;
    if (now <= startDateTime) return 0;

    return ((now - startDateTime) / (endDateTime - startDateTime)) * 100;
  };

  // If contest ended, disable submit/run buttons & show message
  const disableActions = contestEnded;

  // Output box style helper, your existing logic
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

  // Your existing handler functions (run, submit) can be reused here with added disable of buttons based on contestEnded

  // Render loading
  if (loading) return <div>Loading...</div>;

  const testCaseTabs = sampleIO.map((_, idx) => `Test Case ${idx + 1}`);
  const allTabs = [...testCaseTabs, "Custom Input"];
  const lastTabIndex = allTabs.length - 1;

  const isCustom = selectedTab === lastTabIndex;
  const currentInput = isCustom ? customInput : sampleIO[selectedTab]?.input || "";
  const currentExpectedOutput = isCustom ? "" : sampleIO[selectedTab]?.output || "";
  const currentYourOutput = isCustom ? "" : sampleIO[selectedTab]?.yourOutput || "";

  // Example stub of your run and submit handlers to show disable buttons (You should implement or reuse your full functions)
  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const newSampleIO = [...sampleIO];
      const orderedCode = isRandomOrder ? reorderToOriginal(code, randomOrder) : code;
      for (let i = 0; i < newSampleIO.length; i++) {
        const input = newSampleIO[i].input || "";
        const payload = {
          language,
          code: orderedCode,
          input,
        };
        const response = await axios.post(`${COMPILER_API_URL}run`, payload);
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
          code:orderedCode,
          input: customInput,
        };
        const response = await axios.post(`${COMPILER_API_URL}run`, payload);
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
  
  const handleSubmitSolution = async () => {
    if (disableActions) return; // Prevent action if contest ended or disabled
    if (!code.trim()) {
      alert("No code to submit!");
      return;
    }
    if (!testcases || testcases.length === 0) {
      alert("No testcases found for this problem!");
      return;
    }
  
    setIsSubmitting(true);
  
    let status = "Accepted";
    let passedCount = 0;
    const orderedCode = isRandomOrder ? reorderToOriginal(code, randomOrder) : code;
  
    try {
      const startTime = performance.now();
  
      for (const [index, tc] of testcases.entries()) {
        const payload = { language, code: orderedCode, input: tc.input };
        const response = await axios.post(`${COMPILER_API_URL}run`, payload);
        const result = response.data;
  
        if (typeof result === "object" && result.status === "TLE") {
          status = "TLE";
          break;
        }
  
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
          if (status !== "TLE") status = "Wrong Answer";
        }
      }
  
      const endTime = performance.now();
      const runTimeMs = Math.round(endTime - startTime);
      
      const userId = localStorage._id || "";
      const userName = localStorage.username || ""; // Adjust if using a different key
      const submissionTime = new Date().toISOString();
      const achievedPoints = status === "TLE" ? 0 : Math.round((passedCount / testcases.length) * points);
  
      const submissionPayload = {
        problemId,
        contestId: contestId || null,
        points: achievedPoints,
        status,
        submissionTime,
        runTime: runTimeMs.toString(),
        userId,
        userName,
        problemName: name
      };
  
      await axios.post(`${SUBMISSION_API_URL}/`, submissionPayload);
  
      alert(`Solution Submitted!\nVerdict: ${status}\nPassed: ${passedCount}/${testcases.length}\nScore: ${achievedPoints}/${points}`);
    } catch (error: any) {
      console.error("Submission error caught:", error);
      alert(
        `Failed to submit solution: ${error?.response?.data?.message || error.message || error}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };
   


  const fetchHint = async () => {
    if (!problemId) {
      alert("No problem loaded");
      return;
    }

    try {
      const orderedCode = isRandomOrder ? reorderToOriginal(code, randomOrder) : code;
      const response = await axios.post(`${AI_API_URL}/generate-hint`, {
        problem: problemStatement,
        code: orderedCode,
      });
      setHint(response.data.hint || "No hint available.");
      setShowHintPopup(true);
    } catch (error) {
      console.error("Failed to fetch hint:", error);
      alert("Failed to fetch hint.");
    }
  };


  return (
    <div className={styles.container} style={{ display: "flex", height: "100vh", gap: 20, padding: 16 }}>
      {/* Left Panel - Problem */}
      <div className={styles["question-section"]} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div className={contestId != "" ? styles.questionContestContent : styles.questionContent}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 style={{ margin: 0 }}>{name}</h2>
            <button onClick={() => navigate(-1)}>Back to Dashboard</button>
          </div>
          <div style={{ color: "#888", marginBottom: 12 }}>
            {difficulty} | {points} Points
          </div>
          <div className={styles.problemStatementScrollable} style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
            {problemStatement}
          </div>
        </div>

        {/* Contest timer bar, only if contestId present */}
        {contestId && contest && (
          <div style={{ marginTop: "auto", paddingTop: 10 }}>
            <div style={{ marginBottom: 4, fontWeight: "bold", fontSize: 14, color: contestEnded ? "red" : "#1976d2" }}>
              Contest ends in: {timeLeftMs !== null ? formatTimeLeft(timeLeftMs) : "-"}
            </div>
            <div
              style={{
                height: 12,
                backgroundColor: "#ddd",
                borderRadius: 6,
                overflow: "hidden",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
              }}
              aria-label="Contest Progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={getContestProgressPercent()}
            >
              <div
                style={{
                  width: `${getContestProgressPercent()}%`,
                  height: "100%",
                  backgroundColor: contestEnded ? "#e57373" : "#1976d2",
                  transition: "width 1s linear",
                }}
              />
            </div>
            {contestEnded && (
              <div style={{ color: "red", fontWeight: "bold", marginTop: 8 }}>
                Contest has ended. Submissions and running code are disabled.
              </div>
            )}
          </div>
        )}

        {/* Testcases Tabs */}
        <div className={styles.testcasePanel} style={{ marginTop: 10 }}>
          <div className={styles["tabs-container"]} style={{ marginBottom: 8 }}>
            {allTabs.map((tab, idx) => {
              const isSampleTab = idx < sampleIO.length;
              const testPassed = isSampleTab && hasRun && outputsMatch(sampleIO[idx]);
              const testFailed = isSampleTab && hasRun && !outputsMatch(sampleIO[idx]);

              return (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(idx)}
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
              <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>Input:</label>
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
                <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>Expected Output:</label>
                <div style={getOutputBoxStyle(sampleIO[selectedTab])}>{currentExpectedOutput}</div>

                {currentYourOutput !== undefined && (
                  <>
                    <label style={{ fontWeight: "bold", display: "block", marginTop: 12, marginBottom: 4 }}>
                      Your Output:
                    </label>
                    <div style={getOutputBoxStyle(sampleIO[selectedTab])}>{currentYourOutput}</div>
                  </>
                )}
              </div>
            ) : null}

            {isCustom && (
              <div style={{ marginTop: 8 }}>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>Output:</label>
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
        {/* Language selector */}
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <label htmlFor="language-select" style={{ fontWeight: "bold" }}>
            Language:
          </label>
          <select
            id="language-select"
            className={styles["language-dropdown"]}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
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
          {!contestId && (
            <button
              type="button"
              onClick={() => setIsRandomOrder((prev) => !prev)}
              style={{ marginBottom: 12 }}
            >
              {isRandomOrder ? "Switch to Normal Code Editor" : "Switch to Random Code Editor"}
            </button>
          )}

        </div>

        {/* Monaco Editor */}
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
            onChange={(value) => {
              setCode(value || "");
              handleEditorChange;
            }}

            options={{
              fontSize: 16,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              lineNumbers: (line: number) =>
                isRandomOrder ? (randomOrder[line - 1]?.toString() || "") : line.toString(),
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
            disabled={isRunning || isSubmitting || disableActions}
            style={{
              backgroundColor: isRunning ? "#90caf9" : "#1976d2",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              cursor: isRunning || isSubmitting || disableActions ? "not-allowed" : "pointer",
              flex: 1,
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => {
              if (!isRunning && !isSubmitting && !disableActions) e.currentTarget.style.backgroundColor = "#115293";
            }}
            onMouseLeave={(e) => {
              if (!isRunning && !isSubmitting && !disableActions) e.currentTarget.style.backgroundColor = "#1976d2";
            }}
          >
            {isRunning ? "Running..." : "Run Code"}
          </button>
          <button
            onClick={handleSubmitSolution}
            disabled={isRunning || isSubmitting || disableActions}
            style={{
              backgroundColor: isSubmitting ? "#a5d6a7" : "#388e3c",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              cursor: isRunning || isSubmitting || disableActions ? "not-allowed" : "pointer",
              flex: 1,
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => {
              if (!isRunning && !isSubmitting && !disableActions) e.currentTarget.style.backgroundColor = "#2e7d32";
            }}
            onMouseLeave={(e) => {
              if (!isRunning && !isSubmitting && !disableActions) e.currentTarget.style.backgroundColor = "#388e3c";
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Solution"}
          </button>
          <button
            onClick={fetchHint}
            disabled={aiStatusLoading || !aiEnabled || loading || isRunning || isSubmitting || contestEnded}
          >
            {aiStatusLoading ? "Checking AI..." : "Get Hint"}
          </button>

          {showHintPopup && (
            <>
              <div
                className={styles.backdrop}
                onClick={() => setShowHintPopup(false)}
                style={{
                  position: "fixed",
                  top: 0, left: 0,
                  width: "100vw", height: "100vh",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  zIndex: 999,
                }}
              ></div>

              <div
                className={styles.modalBox}
                onClick={e => e.stopPropagation()}
                style={{
                  position: "fixed",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "#fff",
                  padding: 20,
                  borderRadius: 8,
                  maxHeight: "80vh",
                  width: "90%",
                  maxWidth: 600,
                  overflowY: "auto",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                  zIndex: 1000,
                }}
              >
                <h2>Hint</h2>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{hint}</pre>
                <button onClick={() => setShowHintPopup(false)} style={{ marginTop: 15 }}>Close</button>
              </div>
            </>
          )}

          <button onClick={fetchSubmissions}>Submissions</button>
          {showSubmissionTable && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setShowSubmissionTable(false)}
                style={{
                  position: "fixed",
                  top: 0, left: 0,
                  width: "100vw", height: "100vh",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  zIndex: 999,
                }}
              />
              {/* Modal box */}
              <div
                onClick={e => e.stopPropagation()} // prevent closing modal when clicking inside
                style={{
                  position: "fixed",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "white",
                  padding: 20,
                  borderRadius: 8,
                  maxHeight: "80vh",
                  width: "90%",
                  maxWidth: 900,
                  overflowY: "auto",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                  zIndex: 1000,
                }}
              >
                <h3>Submission History</h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #ccc", display: "flex" }}>
                      <th style={{ flex: 2 }}>Submission Time</th>
                      <th style={{ flex: 2 }}>Points</th>
                      <th style={{ flex: 2 }}>Status</th>
                      <th style={{ flex: 2 }}>Run Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...submissions]
                      .sort((a, b) => new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime())
                      .map(sub => (
                        <tr key={sub._id} style={{ borderBottom: "1px solid #eee", display: "flex", margin: "2%" }}>
                          <td style={{ flex: 2 }}>{new Date(sub.submissionTime).toLocaleString()}</td>
                          <td style={{ flex: 1 }}>{sub.points}</td>
                          <td style={{ flex: 1.2 }}>{sub.status}</td>
                          <td style={{ flex: 0.8 }}>{sub.runTime}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <button onClick={() => setShowSubmissionTable(false)} style={{ marginTop: 15 }}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;