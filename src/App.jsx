import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import './App.css'; // ඔයාගේ CSS ෆයිල් එක එහෙම්මම තියාගන්නවා

function App() {
  return (
    <Router>
      {/* වෙබ්සයිට් එකේ උඩින්ම තියෙන Navigation Bar එක */}
      <nav style={{ padding: "15px", background: "#333", color: "white", marginBottom: "20px", display: "flex", gap: "20px" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Home</Link>
        <Link to="/login" style={{ color: "white", textDecoration: "none" }}>Login</Link>
        <Link to="/register" style={{ color: "white", textDecoration: "none" }}>Register</Link>
      </nav>

      {/* පිටු මාරු වෙන කොටස */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </Router>
  );
}

export default App;