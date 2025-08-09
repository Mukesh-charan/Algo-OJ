import { useState, useEffect } from "react";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";
import { handleLogout } from "../auth";

const API_URL = `${import.meta.env.VITE_BACKEND}/api/auth`;

interface User {
  _id: string;
  username: string;
  email: string;
  type: string;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRoleValue, setEditRoleValue] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const updateUserRole = async (id: string, newRole: string) => {
    try {
      await axios.put(`${API_URL}/users/${id}`, { type: newRole });
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? { ...user, type: newRole } : user))
      );
      setEditingUserId(null);
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update user role");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) &&
      user.type.toLowerCase().includes(role.toLowerCase())
  );
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
      <div className="container">
        <button className="back-btn" onClick={() => navigate("/admindashboard")}>
          Back to Dashboard
        </button>

        {/* Search & Role filter */}
        <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "20px" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            placeholder="Search users..."
            style={{ flex: 5 }}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="search-bar"
            style={{ flex: 1 }}
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {filteredUsers.length === 0 ? (
          <div>No users found.</div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                fontWeight: "bold",
                marginTop: 12,
                width: "100%",
              }}
            >
              <div style={{ flex: 2 }}>Username</div>
              <div style={{ flex: 3 }}>Email</div>
              <div style={{ flex: 2 }}>Role</div>
              <div style={{ flex: 2 }}>Actions</div>
            </div>

            <div className="problem-list">
              {filteredUsers.map((user) => {
                const isEditing = editingUserId === user._id;

                return (
                  <div
                    key={user._id}
                    className="problem-item"
                    style={{ alignItems: "center" }}
                  >
                    <div style={{ flex: 2 }}>{user.username}</div>
                    <div style={{ flex: 3 }}>{user.email}</div>

                    {/* Role column: select dropdown if editing, else show text */}
                    <div style={{ flex: 2 }}>
                      {isEditing ? (
                        <select
                          value={editRoleValue}
                          onChange={(e) => setEditRoleValue(e.target.value)}
                        >
                          <option value="admin">ADMIN</option>
                          <option value="user">USER</option>
                        </select>
                      ) : (
                        <span>{user.type.toUpperCase()}</span>
                      )}
                    </div>

                    {/* Actions column */}
                    <div className="problem-actions" style={{ flex: 2 }}>
                      {isEditing ? (
                        <>
                          <button
                            className="button-action"
                            onClick={() => updateUserRole(user._id, editRoleValue)}
                          >
                            Update
                          </button>
                          <button
                            className="button-action"
                            onClick={() => setEditingUserId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="button-action"
                            onClick={() => {
                              setEditingUserId(user._id);
                              setEditRoleValue(user.type);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="button-action"
                            onClick={() => handleDelete(user._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
