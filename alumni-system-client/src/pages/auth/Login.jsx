import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = () => {
    const allUsers = JSON.parse(localStorage.getItem("users")) || [];

    const user = allUsers.find(
      (u) =>
        u.email === formData.email &&
        u.password === formData.password
    );

    if (!user) {
      toast.error("Invalid Credentials ❌");
      return;
    }

    if (user.status === "Blocked") {
      toast.error("Your account has been blocked by the Admin! ❌");
      return;
    }

    localStorage.setItem(
      "currentUser",
      JSON.stringify(user)
    );

  toast.success("Login Successful");

    switch (user.role.toLowerCase()) {
      case "student":
        navigate("/student");
        break;

      case "alumni":
        navigate("/alumni");
        break;

      case "admin":
        navigate("/admin");
        break;

      default:
        alert("Role not found");
    }
  };

 return (
  <div className="auth-container">

    {/* Navbar */}
    <nav className="auth-navbar d-flex justify-content-between align-items-center">
      <h3 className="logo-text">
        🎓 Alumni Connect
      </h3>

      <div>
        <Link
          to="/register"
          className="btn btn-outline-light"
        >
          Register
        </Link>
      </div>
    </nav>

    <div className="container">

      <div className="row hero-section align-items-center">

        {/* Left Section */}

        <div className="col-lg-7">

          <h1 className="project-title mb-4">
            Student-Alumni Connect System
          </h1>

          <p className="project-desc mb-4">
            Connect students with alumni for
             career guidance,
            networking, job opportunities,
            referrals and professional growth.
          </p>

          <div className="feature-item">
            🎓 Search Alumni Network
          </div>

          <div className="feature-item">
            💼 Find Jobs & Internships
          </div>

          <div className="feature-item">
            🤝 Request Referrals
          </div>

          <div className="feature-item">
            💬 Messaging
          </div>

          <div className="feature-item">
            🔔 Smart Notifications
          </div>

        </div>

        {/* Login Form */}

        <div className="col-lg-5">

          <div className="card card-dark p-4 shadow-lg">

            <h2 className="text-center mb-4">
              Login
            </h2>

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control mb-3"
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control mb-3"
              onChange={handleChange}
            />

            <button
              className="btn gradient-btn w-100"
              onClick={handleLogin}
            >
              Login
            </button>

            <p className="text-center mt-3">
              New User?{" "}
              <Link to="/register">
                Register
              </Link>
            </p>

          </div>

        </div>

      </div>



    </div>

    <footer className="footer">
      © 2026 Student-Alumni Connect System 
     
    </footer>

  </div>
);
}

export default Login;