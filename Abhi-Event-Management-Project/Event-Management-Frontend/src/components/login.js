import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/login", {
        email,
        password,
      });

      // Save user info and role in session storage
      const user = response.data;
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("role", user.role); 


      // Navigate based on role
      if (user.role === "admin") {
        navigate("/getevents"); // Admin can manage events
      } else {
        navigate("/getevents"); // User can only view events
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <div className="login-container">
      <header style={headerStyle}>
        <h1>Event Management System</h1>
      </header>

      <form onSubmit={handleSubmit} style={formStyle}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" style={buttonStyle}>
          Login
        </button>
      </form>
      <h1>New User - <button style={Register} onClick={() => navigate("/register")}>Register</button></h1>
    </div>
  );
};

// Styles for header and form
const headerStyle = {
  backgroundColor: "#4CAF50",
  padding: "1em",
  textAlign: "center",
  color: "white",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "2em",
  maxWidth: "400px",
  margin: "2em auto",
  border: "2px solid #40e40f",
  borderRadius: "8px",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
};

const inputStyle = {
  padding: "10px",
  margin: "8px 0",
  width: "100%",
  boxSizing: "border-box",
};

const buttonStyle = {
  backgroundColor: "#4CAF50",
  color: "white",
  padding: "10px",
  width: "100%",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize:"20px"
};
const Register = {
  backgroundColor: "#4caf50",
  color:" white",
  border: "2px solid transparent",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "bold",
  textTransform: "uppercase",
};

export default Login;
