import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";
import type { Engine, IOptions, RecursivePartial } from "tsparticles-engine";

export interface Submission {
  problemId: string;
  contestId: string;
  points: number;
  status: string;
  submissionTime: string | Date;
  runTime: string;
  userId: string;
  userName: string;
  problemName: string;
  uuid: string;
}

export interface LeaderboardEntry {
  username: string;
  totalScore: number;
  totalRuntime: number;
  earliestSubmissionTime: number | null;
  percentile: number;
}

export interface Contest {
  id: string;
  problems: string[];
}

export function calculateLeaderboard(
  submissions: Submission[],
  contestProblemIds: string[]
): LeaderboardEntry[] {
  const userProblemMap: Record<string, Record<string, Submission>> = {};

  for (const sub of submissions) {
    if (!userProblemMap[sub.userId]) userProblemMap[sub.userId] = {};
    const current = userProblemMap[sub.userId][sub.problemId];
    const subScore = sub.points ?? 0;
    const subTime = new Date(sub.submissionTime).getTime();
    const subRun = +sub.runTime;

    if (!current) {
      userProblemMap[sub.userId][sub.problemId] = sub;
    } else {
      const currScore = current.points ?? 0;
      const currRun = +current.runTime;
      const currTime = new Date(current.submissionTime).getTime();

      if (
        subScore > currScore ||
        (subScore === currScore && subRun < currRun) ||
        (subScore === currScore && subRun === currRun && subTime < currTime)
      ) {
        userProblemMap[sub.userId][sub.problemId] = sub;
      }
    }
  }

  const leaderboard: LeaderboardEntry[] = [];
  for (const userId in userProblemMap) {
    const solvedSubs = Object.values(userProblemMap[userId]);
    const totalScore = solvedSubs.reduce((acc, sub) => acc + (sub.points ?? 0), 0);
    const totalRuntime = solvedSubs.reduce((acc, sub) => acc + (+sub.runTime || 0), 0);
    const earliestSubmissionTime = solvedSubs
  .map(sub => new Date(sub.submissionTime).getTime())
  .reduce((min, t) => t < min ? t : min, Number.POSITIVE_INFINITY);

    
    const username = solvedSubs[0]?.userName || "Unknown";

    leaderboard.push({
      username,
      totalScore,
      totalRuntime,
      earliestSubmissionTime,
      percentile: 0,
    });
  }

  leaderboard.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (a.totalRuntime !== b.totalRuntime) return a.totalRuntime - b.totalRuntime;
    return (a.earliestSubmissionTime ?? 0) - (b.earliestSubmissionTime ?? 0);
  });

  leaderboard.forEach((entry, idx, arr) => {
    entry.percentile = 100 * (arr.length - idx - 1) / (arr.length - 1 || 1);
  });

  return leaderboard;
}

const API_URL = `${import.meta.env.VITE_BACKEND}/api`;

const LeaderboardPage: React.FC = () => {
  const { id: contestId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [problemIds, setProblemIds] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!contestId) {
      const errMsg = "[ERROR] No contest ID in route params.";
      console.error(errMsg);
      setError(errMsg);
      setLoading(false);
      return;
    }

    const fetchLeaderboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const contestRes = await axios.get(`${API_URL}/contests/${contestId}`);
        const contest: Contest = contestRes.data;

        if (!contest || !Array.isArray(contest.problems)) {
          console.error("[ERROR] Contest data invalid or missing problems field:", contest);
          throw new Error("Contest data invalid or missing problems");
        }

        const pIds = contest.problems.map((p: any) =>
          typeof p === "string" ? p : p._id || p.id
        );
        setProblemIds(pIds);

        const subsRes = await axios.get(
          `${API_URL}/submissions/contest/${contestId}/submissions`
        );

        const subs: Submission[] = subsRes.data || [];
        setSubmissions(subs);

        const lb = calculateLeaderboard(subs, pIds);
        setLeaderboard(lb);
      } catch (err: any) {
        console.error("[ERROR] Failed to load leaderboard data", err);
        setError(err.message || "Failed to load leaderboard data");
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [contestId]);

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
        density: { enable: true, value_area: 800 },
      },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: false },
      size: { value: 3, random: true },
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
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" },
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { particles_nb: 4 },
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

      <div className="container">
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: 24,
            fontWeight: "600",
            padding: "10px 20px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            boxShadow: "0 3px 6px rgba(25, 118, 210, 0.3)",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#145ea8")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
        >
          ← Back
        </button>

        <h2
          style={{
            color: "#155fa0",
            fontWeight: "700",
            fontSize: 28,
            marginBottom: 24,
            textAlign: "center",
            letterSpacing: "0.05em",
          }}
        >
          Leaderboard
        </h2>

        {loading && <p style={{ textAlign: "center", fontSize: 18 }}>Loading leaderboard...</p>}

        {error && (
          <p style={{ color: "red", textAlign: "center", fontWeight: "bold", fontSize: 16 }}>
            Error loading leaderboard: {error}
          </p>
        )}

        {!loading && !error && leaderboard.length === 0 && (
          <p style={{ textAlign: "center", fontSize: 18 }}>No submissions yet for this contest.</p>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 12px",
              boxShadow: "0 4px 15px rgba(25, 118, 210, 0.1)",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "linear-gradient(90deg,rgb(89, 0, 255) 0%, #42a5f5 100%)",
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontSize: 14,
                }}
              >
                <th style={{ padding: "12px 24px", borderRadius: "12px 0 0 12px" }}>Rank</th>
                <th style={{ padding: "12px 24px" }}>User</th>
                <th style={{ padding: "12px 24px" }}>Total Score</th>
                <th style={{ padding: "12px 24px" }}>Total Runtime</th>
                <th style={{ padding: "12px 24px", borderRadius: "0 12px 12px 0" }}>Percentile</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr
                  key={entry.username || idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#e3f2fd" : "#bbdefb",
                    color: "#0d47a1",
                    fontWeight: "600",
                    fontSize: 16,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    borderRadius: 8,
                  }}
                >
                  <td style={{ padding: "14px 24px", textAlign: "center", fontWeight: "bold" }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: "14px 24px" }}>{entry.username}</td>
                  <td style={{ padding: "14px 24px", textAlign: "center" }}>{entry.totalScore}</td>
                  <td style={{ padding: "14px 24px", textAlign: "center" }}>{entry.totalRuntime}</td>
                  <td style={{ padding: "14px 24px", textAlign: "center" }}>
                    {entry.percentile.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
