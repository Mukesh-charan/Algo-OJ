import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './Login/Login.tsx';
import Register from './Login/Register.tsx';
import ProblemDashboard from './Dashboard/admin_problemDashboard.tsx';
import AdminDashboard from './Dashboard/admindashboard.tsx';
import AddProblem from './Dashboard/addproblem.tsx';
import EditProblem from './Dashboard/editProblem.tsx';
import UserDashboard from './Dashboard/admin_userdashboard.tsx';
import Dashboard from './Dashboard/userdashboard.tsx';
import CodeEditor from './Code_Editor/codeEditor.tsx';
import ContestDashboard from './Dashboard/contestdashboard.tsx';
import AddContest from './Dashboard/addcontest.tsx';
import EditContest from './Dashboard/editContest.tsx';
import { ProtectedRoute, RoleProtectedRoute } from './auth.tsx';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
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
      <Route
        path="/"
        element={
          <Dashboard />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
