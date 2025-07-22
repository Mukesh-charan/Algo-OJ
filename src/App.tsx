import { Routes, Route } from 'react-router-dom';
import Login from './Login/Login.tsx';
import Register from './Login/Register.tsx';
import Dashboard from './Dashboard/adminDashboard.tsx';
import AddProblem from './Dashboard/addProblem.tsx';
import EditProblem from './Dashboard/editProblem.tsx';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admindashboard" element={<Dashboard />} />
      <Route path="/addProblem" element={<AddProblem />} />
      <Route path="/editProblem" element={<EditProblem />} />
    </Routes>
  );
}

