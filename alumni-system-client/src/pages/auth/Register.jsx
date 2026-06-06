import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = () => {
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const existingUser = users.find(
      (u) => u.email === formData.email
    );

    if (existingUser) {
     toast.warning("User already exists");
      return;
    }

    users.push({
      id: Date.now(),
      ...formData,
    });

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    );

   toast.success("Registration Successful");

    navigate("/");
  };

  return (
    <div
      className="container-fluid"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#0f172a,#1e293b,#312e81)",
      }}
    >
      {/* Navbar */}

      <nav className="navbar navbar-dark py-3">
        <div className="container">
          <h3 className="text-white fw-bold">
            🎓 Alumni Connect System
          </h3>
        </div>
      </nav>

      <div className="container">
        <div className="row align-items-center min-vh-100">

          {/* Left Side */}

          <div className="col-lg-6 text-white">

            <h1 className="display-4 fw-bold mb-3">
              Alumni Management System
            </h1>

            <p className="lead mb-4">
              Connect Students with Alumni,
              Explore Career Opportunities,
              Request Referrals and Build
              Professional Networks.
            </p>

            <div className="row">

              <div className="col-md-6 mb-3">
                <div className="card bg-dark text-white p-3">
                  <h5>💼 Job Portal</h5>
                  <small>
                    Alumni can post jobs for students.
                  </small>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="card bg-dark text-white p-3">
                  <h5>🤝 Referrals</h5>
                  <small>
                    Request referrals from alumni.
                  </small>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="card bg-dark text-white p-3">
                  <h5>💬 Messaging</h5>
                  <small>
                    Chat directly with alumni.
                  </small>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="card bg-dark text-white p-3">
                  <h5>🔔 Notifications</h5>
                  <small>
                    Real-time updates and alerts.
                  </small>
                </div>
              </div>

            </div>

          </div>

          {/* Right Side Register Form */}

          <div className="col-lg-6">

            <div
              className="card shadow-lg border-0 p-4"
              style={{
                borderRadius: "20px",
                background: "#1e293b",
                color: "white",
              }}
            >
              <h2 className="text-center mb-4">
                Create Account
              </h2>

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="form-control mb-3"
                onChange={handleChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
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

              <select
                name="role"
                className="form-select mb-3"
                onChange={handleChange}
              >
                <option value="student">
                  Student
                </option>

                <option value="alumni">
                  Alumni
                </option>
              </select>

              <button
                className="btn btn-primary w-100"
                onClick={handleRegister}
              >
                Register Now
              </button>

              <p className="text-center mt-3">
                Already Have Account?{" "}
                <Link to="/">
                  Login
                </Link>
              </p>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;