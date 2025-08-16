import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './Login/Login.tsx';
import Register from './Login/Register.tsx';
import ProblemDashboard from './Problem/admin_problemDashboard.tsx';
import AdminDashboard from './Dashboard/admindashboard.tsx';
import AddProblem from './Problem/addproblem.tsx';
import EditProblem from './Problem/editProblem.tsx';
import UserDashboard from './Dashboard/admin_userdashboard.tsx';
import Dashboard from './Dashboard/userdashboard.tsx';
import CodeEditor from './Code_Editor/codeEditor.tsx';
import ContestDashboard from './Contest/contestdashboard.tsx';
import AddContest from './Contest/addcontest.tsx';
import EditContest from './Contest/editContest.tsx';
import ContestProblemDashboard from './Contest/contestproblem.tsx';
import { ProtectedRoute, RoleProtectedRoute } from './auth.tsx';
import LeaderboardPage from "../src/Contest/Leaderboard.tsx"
import { useEffect } from 'react';

const COMPILER_API_URL = `${import.meta.env.VITE_COMPILER}`;

function pingCompilerApi() {
  fetch(COMPILER_API_URL, { method: 'GET' })
}
export default function App() {
  useEffect(() => {
    pingCompilerApi();
    const interval = setInterval(pingCompilerApi, 600000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin-only routes */}
      <Route
        path="/admindashboard"
        element={
            <AdminDashboard />
        }
      />
      <Route
        path="/problemDashboard"
        element={
          <RoleProtectedRoute role="admin">
            <ProblemDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/addProblem"
        element={
          <RoleProtectedRoute role="admin">
            <AddProblem />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/editProblem/:id"
        element={
          <RoleProtectedRoute role="admin">
            <EditProblem />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/userDashboard"
        element={
          <RoleProtectedRoute role="admin">
            <UserDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/contest"
        element={
          <RoleProtectedRoute role="admin">
            <ContestDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/addcontest"
        element={
          <RoleProtectedRoute role="admin">
            <AddContest />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/editContest/:id"
        element={
          <RoleProtectedRoute role="admin">
            <EditContest />
          </RoleProtectedRoute>
        }
      />
      {/* Protected routes - any logged-in user */}
      <Route
        path="/"
        element={
          <Dashboard />
        }
      />
      <Route path="/contest/:id/leaderboard" element={
        <ProtectedRoute>
        <LeaderboardPage />
        </ProtectedRoute>} />

      <Route
        path="/codeEditor/:id"
        element={
          <ProtectedRoute>
            <CodeEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contest/:contestId/codeEditor/:id"
        element={
          <ProtectedRoute>
            <CodeEditor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contest/:id"
        element={
          <ProtectedRoute>
            <ContestProblemDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
