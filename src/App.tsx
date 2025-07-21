import { Routes, Route } from 'react-router-dom';
import Login from './Login/Login.tsx';
import Register from './Login/Register.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

