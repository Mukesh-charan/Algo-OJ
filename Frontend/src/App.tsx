import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

// Import your components
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
import LeaderboardPage from "../src/Contest/Leaderboard.tsx";
import { ProtectedRoute, RoleProtectedRoute, ContestProtectedRoute } from './auth.tsx';
import MultipleLogin from './Login/MultipleLogin.tsx';


const BACKEND_API_URL = `${import.meta.env.VITE_BACKEND}`;

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/multiple-login" element={<MultipleLogin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin-only routes */}
      <Route
        path="/admindashboard"
        element={
          <RoleProtectedRoute role="admin">
            <AdminDashboard />
          </RoleProtectedRoute>
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
      <Route path="/" element={<Dashboard />} />
      <Route
        path="/contest/:id/leaderboard"
        element={
          <ContestProtectedRoute>
            <LeaderboardPage />
          </ContestProtectedRoute>
        }
      />
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
            <CodeEditor />
        }
      />
      <Route
        path="/contest/:id"
        element={
          <ContestProtectedRoute>
            <ContestProblemDashboard />
          </ContestProtectedRoute>
        }
      />

      {/* Redirect unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
