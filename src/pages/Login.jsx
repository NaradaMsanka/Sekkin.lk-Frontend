import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token); // JWT Token එක Browser එකේ Save කරනවා
            alert("Login Successful!");
            navigate("/"); // Home එකට යවනවා
        } else {
            alert("Invalid Email or Password");
        }
    };

    return (
        <div style={{ padding: "50px", textAlign: "center" }}>
            <h2>Login to Sekkin.lk</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} /><br/><br/>
                <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} /><br/><br/>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}