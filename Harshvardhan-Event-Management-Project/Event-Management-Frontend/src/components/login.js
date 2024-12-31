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
      sessionStorage.setItem("role", user.role); // Assuming backend returns role in response

      // Navigate based on role
      if (user.role === "admin") {
        navigate("/Dashboard"); // Admin can manage events
      } else {
        navigate("/Dashboard"); // User can only view events
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
        <button
          type="button"
          className="register-btn"
          onClick={() => navigate("/register")}
          style={registerButtonStyle}
        >
          NEW USER REGISTER
        </button>
      </form>
    </div>
  );
};

// Styles for container, header, and form
const containerStyle = {
  backgroundColor: "white", 
  minHeight: "100vh",
  paddingTop: "80px", 
};

const headerStyle = {
  backgroundColor: "#f1faee", 
  padding: "1.5em", 
  textAlign: "center",
  color: "#f1faee", 
  borderRadius: "8px 8px 0 0", 
  textTransform: "uppercase", 
  letterSpacing: "2px", 
  fontFamily: "'Poppins', sans-serif", 
};

const headerTextStyle = {
  fontSize: "2.5rem",
  fontWeight: "bold",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "2em",
  maxWidth: "500px",
  margin: "2em auto",
  border: "3px solid #457b9d", 
  borderRadius: "12px",
  boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)", 
  backgroundColor: "#f1faee", 
  fontFamily: "'Poppins', sans-serif", 
};

const inputStyle = {
  padding: "12px",
  margin: "10px 0",
  width: "100%",
  boxSizing: "border-box",
  border: "2px solid #a8dadc",
  borderRadius: "8px",
  fontSize: "1rem",
  outline: "none",
  transition: "border-color 0.3s ease, box-shadow 0.3s ease", 
  backgroundColor: "#ffffff", 
};

const buttonStyle = {
  backgroundColor: "#457b9d",
  color: "#f1faee",
  padding: "12px",
  marginTop: "10px",
  width: "100%",
  border: "none",
  borderRadius: "25px",
  cursor: "pointer",
  fontSize: "1.1rem",
  transition: "all 0.3s ease",
  textTransform: "uppercase",
  boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.2)",
};

const registerButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#a8dadc",
  color: "#457b9d",
  marginTop: "15px",
};

// New Hover Styles
const buttonHoverStyle = {
  backgroundColor: "#2a4d69", // Slightly darker blue for the login button
  transform: "scale(1.1)", // Larger scale for an elevated effect
};

const registerButtonHoverStyle = {
  backgroundColor: "#86c7d9", // Lighter shade of teal for register button
  transform: "scale(1.08)", // Slightly less scale for differentiation
};


export default Login;
