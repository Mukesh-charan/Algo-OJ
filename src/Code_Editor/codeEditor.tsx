import React, { useEffect, useState } from "react";
import styles from "./editor.module.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";

const API_URL = "http://localhost:8000/api/problems";

interface TestCase {
  input: string;
  output: string;
}

const CodeEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sampleIO, setSampleIO] = useState([{ input: "", output: "" }]);
  const [testcases, setTestcases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);

  // Tabs logic
  const [selectedTab, setSelectedTab] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState(""); // Optionally computed after code runs!

  // Editor code and language
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");

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

  if (loading) return <>Loading...</>;

  // Tabs: Test Case 1, 2, ..., Custom Input
  const testCaseTabs = sampleIO?.map((_, idx) => `Test Case ${idx + 1}`);
  const allTabs = [...(testCaseTabs || []), "Custom Input"];
  const lastTabIndex = allTabs.length - 1;

  const handleTabClick = (idx: number) => setSelectedTab(idx);

  let currentInput = "";
  let currentOutput = "";
  let isCustom = false;

  if (selectedTab < lastTabIndex) {
    currentInput = sampleIO[selectedTab]?.input || "";
    currentOutput = sampleIO[selectedTab]?.output || "";
  } else {
    isCustom = true;
    currentInput = customInput;
    currentOutput = customOutput;
  }

  // Editor code for changing language
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  // Editor code change handler
  const handleEditorChange = (value?: string) => {
    setCode(value || "");
  };

  return (
    <div className={styles.container}>
      {/* Left Panel */}
      <div className={styles["question-section"]}>
        <div className={styles.questionContent}>
        <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
          <div style={{ fontWeight: "bold", fontSize: 24, marginBottom: 4 }}>{name}</div>
          <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
          <div style={{ color: "#888", marginBottom: 8 }}>{difficulty} | {points} Points</div>
          <div className={styles.problemStatementScrollable}>
            {problemStatement}
          </div>
        </div>

        <div className={styles.testcasePanel}>
          <div className={styles["tabs-container"]}>
            {allTabs.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => handleTabClick(idx)}
                className={`${styles.tabButton} ${idx === selectedTab ? styles.activeTab : ""}`}
                style={{
                  marginRight: 4,
                  padding: "6px 12px",
                  border: idx === selectedTab ? "2px solid #1976d2" : "1px solid #ccc",
                  borderRadius: "5px 5px 0 0",
                  background: idx === selectedTab ? "#e3f0fa" : "#f7f7f7",
                  fontWeight: idx === selectedTab ? "bold" : "normal",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className={styles["tab-panel"]}>
            <div>
              <label style={{ fontWeight: "bold" }}>Input:</label>
              <textarea
                value={currentInput}
                onChange={e => {
                  if (isCustom) setCustomInput(e.target.value);
                }}
                readOnly={!isCustom}
                className={styles["testcase-input"]}
                placeholder="Enter input..."
                style={{
                  width: "100%",
                  minHeight: "42px",
                  background: !isCustom ? "#f4f4f4" : "white"
                }}
              />
            </div>
            {currentOutput ? (
              <div style={{ marginTop: 8 }}>
                <label style={{ fontWeight: "bold" }}>Expected Output:</label>
                <textarea
                  value={currentOutput}
                  readOnly
                  className={styles["testcase-output"]}
                  style={{
                    width: "100%",
                    minHeight: "32px",
                    background: "#f4f4f4"
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div
        className={styles["answer-section"]}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: 8 }}>Code Editor</label>
          <select
            className={styles["language-dropdown"]}
            value={language}
            onChange={handleLanguageChange}
            style={{
              padding: "6px 10px",
              fontSize: 14,
              borderRadius: 4,
              border: "1px solid #ccc",
              width: "150px",
            }}
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
            {/* Add more languages if desired */}
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
            height: "calc(100% - 48px)",
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
      </div>
    </div>
  );
};

export default CodeEditor;
