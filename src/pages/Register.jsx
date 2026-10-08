import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role: "USER" }) // සාමාන්‍ය පාරිභෝගිකයෙක් ලෙස
        });

        if (response.ok) {
            alert("Registration Successful!");
            navigate("/login"); // ලොග් වෙන පිටුවට යවනවා
        } else {
            alert("Registration Failed!");
        }
    };

    return (
        <div style={{ padding: "50px", textAlign: "center" }}>
            <h2>Create an Account</h2>
            <form onSubmit={handleRegister}>
                <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} /><br/><br/>
                <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} /><br/><br/>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}