// pages/login.js

import { useState } from "react";
import { useRouter } from "next/router";
import { loginDoctor } from "../../helper";
import Preloader from "../Preloader";

// Define CSS styles
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    // justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f3f9dc", // Light green
  },
  form: {
    width: "300px",
    backgroundColor: "#fff", // White
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#8e8333", // Yellow
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  errorMessage: {
    color: "red",
    marginTop: "10px",
  },
};

export default function DoctorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setloading] = useState("")

  const handleSubmit = async (e) => {
    setloading(true)
    e.preventDefault();
    setError("");

    try {
      // Call the function to handle login logic
      const res = await loginDoctor({ email, password });
      if (res.ok) {
        
        // Redirect to homepage if login is successful
        router.push("/registerDoc/homepage");
        
      } else {
        setError(res.message);
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again later.");
    }
    setloading(false)
  };

  return (
    <div style={styles.container} className="p-4">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={{ marginBottom: "20px" }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>
          <button type="submit" style={styles.button}>
            Login
          </button>
      </form>
      {loading ? <Preloader />: null}
      {error && <p style={styles.errorMessage}>{error}</p>}
    </div>
  );
}
