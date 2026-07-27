import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../../services/api";

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

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      await auth.register(
        formData.name,
        formData.email,
        formData.password,
        formData.role.toLowerCase()
      );
      toast.success("Registration Successful");
      navigate("/login");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Registration Failed ❌";
      toast.error(errMsg);
    }
  };

  return (
    <div className="auth-container">
      <nav className="auth-navbar d-flex justify-content-between align-items-center">
        <h3 className="logo-text m-0 d-flex align-items-center gap-2">
          <span>🎓</span> AlumniConnect
        </h3>
        <div>
          <Link
            to="/login"
            className="btn btn-outline-light fw-bold px-4 py-2 rounded-pill"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row align-items-center gy-5">

          <div className="col-lg-6 text-dark">
            <h1 className="display-4 fw-bold mb-3" style={{ color: '#0f172a' }}>
              Alumni Management System
            </h1>
            <p className="lead mb-4" style={{ color: '#475569' }}>
              Connect Students with Alumni, Explore Career Opportunities, Request Referrals and Build Professional Networks.
            </p>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="card card-dark p-3 h-100">
                  <h5 className="fw-bold text-primary">💼 Job Portal</h5>
                  <small className="text-muted">
                    Alumni can post jobs for students.
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card card-dark p-3 h-100">
                  <h5 className="fw-bold text-success">🤝 Referrals</h5>
                  <small className="text-muted">
                    Request referrals from alumni.
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card card-dark p-3 h-100">
                  <h5 className="fw-bold text-warning">💬 Messaging</h5>
                  <small className="text-muted">
                    Chat directly with alumni.
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card card-dark p-3 h-100">
                  <h5 className="fw-bold text-danger">🔔 Notifications</h5>
                  <small className="text-muted">
                    Real-time updates and alerts.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card card-dark shadow-lg border-0 p-4">
              <h2 className="text-center mb-4 fw-bold" style={{ color: '#0f172a' }}>
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
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
              </select>

              <button
                className="btn gradient-btn w-100 border-0"
                onClick={handleRegister}
              >
                Register Now
              </button>

              <p className="text-center mt-3 mb-0">
                Already Have Account?{" "}
                <Link to="/login" className="fw-bold" style={{ color: '#6366f1' }}>
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