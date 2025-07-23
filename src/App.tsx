import { Routes, Route } from 'react-router-dom';
import Login from './Login/Login.tsx';
import Register from './Login/Register.tsx';
import ProblemDashboard from './Dashboard/admin_problemDashboard.tsx';
import AdminDashboard from './Dashboard/adminDashboard.tsx';
import AddProblem from './Dashboard/addproblem.tsx';
import EditProblem from './Dashboard/editProblem.tsx';
import UserDashboard from './Dashboard/admin_userdashboard.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/problemDashboard" element={<ProblemDashboard />} />
      <Route path="/addProblem" element={<AddProblem />} />
      <Route path="/editProblem/:id" element={<EditProblem />} />
      <Route path="/userDashboard" element={<UserDashboard />} />
    </Routes>
  );
}

