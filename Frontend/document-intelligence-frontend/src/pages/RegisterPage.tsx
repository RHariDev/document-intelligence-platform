import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { username, email, password } = formData;
    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/register/", {
        username,
        email,
        password
      });

      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("refreshToken", res.data.refresh);
      navigate("/documents");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <input
        type="text"
        name="username"
        placeholder="Username"
        className="w-full mb-3 px-4 py-2 border rounded"
        onChange={handleChange}
        value={formData.username}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full mb-3 px-4 py-2 border rounded"
        onChange={handleChange}
        value={formData.email}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        className="w-full mb-4 px-4 py-2 border rounded"
        onChange={handleChange}
        value={formData.password}
      />
      <button
        onClick={handleRegister}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Register
      </button>
      <p className="text-center mt-4">
        Already have an account?{" "}
        <Link to="/" className="text-blue-600 underline hover:text-blue-800">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
