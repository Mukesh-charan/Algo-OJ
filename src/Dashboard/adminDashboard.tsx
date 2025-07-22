import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/api"; // Replace with your actual API base URL

interface Problem {
  _id: string;
  name: string;
  difficulty: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("");

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(`${API_URL}/problems`);
      setProblems(res.data);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
      setProblems([]);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/problems/${id}`);
      fetchProblems();
    } catch (error) {
      console.error("Failed to delete problem:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      try {
        await axios.put(`${API_URL}/problems/${editId}`, {
          name: editName,
          difficulty: editDifficulty,
        });
        setEditId(null);
        setEditName("");
        setEditDifficulty("");
        fetchProblems();
      } catch (error) {
        console.error("Failed to update problem:", error);
      }
    }
  };

  const filteredProblems = problems.filter((problem) =>
    problem.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="header">
        <h1>Random(Compile)</h1>
      </header>

      <div className="container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search by problem name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredProblems.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 40, fontSize: 20 }}>
            <p>No problems found.</p>
          </div>
        ) : (
          <div className="problem-list">
            {/* Headings */}
            <div
              className="problem-item"
              style={{ fontWeight: "bold", fontSize: 22, marginBottom: 15 }}
            >
              <div style={{ flex: 4 }}>Problem</div>
              <div style={{ flex: 2 }}>Difficulty</div>
              <div style={{ flex: 2, textAlign: "center" }}>Actions</div>
            </div>

            {/* List */}
            {filteredProblems.map((problem) =>
              editId === problem._id ? (
                <form
                  key={problem._id}
                  className="problem-item"
                  onSubmit={handleUpdate}
                  style={{ fontSize: 20 }}
                >
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    style={{ flex: 4, marginRight: 10, padding: 6, borderRadius: 6 }}
                  />
                  <input
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value)}
                    required
                    style={{ flex: 2, marginRight: 10, padding: 6, borderRadius: 6 }}
                  />
                  <div
                    className="problem-actions"
                    style={{ flex: 2, display: "flex", justifyContent: "center" }}
                  >
                    <button type="submit">Save</button>
                    <button type="button" >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div key={problem._id} className="problem-item" style={{ fontSize: 20 }}>
                  <div style={{ flex: 4 }}>{problem.name}</div>
                  <div style={{ flex: 2 }}>{problem.difficulty}</div>
                  <div
                    className="problem-actions"
                    style={{ flex: 2, display: "flex", justifyContent: "center" }}
                  >
                    <button onClick={() => navigate("/editProblem")}>Edit</button>
                    <button onClick={() => handleDelete(problem._id)}>Delete</button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        <button
          onClick={() => navigate("/addProblem")}
          style={{ marginTop: 40, fontSize: 18, padding: "10px 20px", borderRadius: 6 }}
        >
          Add Problem
        </button>
      </div>
    </>
  );
};

export default Dashboard;
