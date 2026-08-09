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

  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

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
      toast.success("Registration Successful! Please check your email for the OTP code. ✉️");
      setRegisteredEmail(formData.email);
      setShowOtpScreen(true);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Registration Failed ❌";
      toast.error(errMsg);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      toast.warning("Please enter the 6-digit OTP code");
      return;
    }

    setIsVerifying(true);
    try {
      await auth.verifyOtp(registeredEmail, otpCode);
      toast.success("Email Verified Successfully! 🎉");
      navigate("/login");
    } catch (error) {
      const errMsg = error.response?.data?.message || "OTP verification failed! ❌";
      toast.error(errMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await auth.resendOtp(registeredEmail);
      toast.success("A new OTP code has been sent to your email ✉️");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to resend OTP ❌";
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
            {!showOtpScreen ? (
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
            ) : (
              <div className="card card-dark shadow-lg border-0 p-4 animate__animated animate__fadeIn">
                <h2 className="text-center mb-2 fw-bold" style={{ color: '#0f172a' }}>
                  Verify Email
                </h2>
                <p className="text-muted text-center mb-4" style={{ fontSize: "0.9rem" }}>
                  A 6-digit OTP code has been dispatched to <strong>{registeredEmail}</strong>.
                </p>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary">One-Time Password (OTP)</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="form-control text-center fs-4 fw-bold letter-spacing-2"
                    style={{ letterSpacing: "8px" }}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>

                <button
                  className="btn gradient-btn w-100 border-0 fw-bold"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Verify & Activate"}
                </button>

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button 
                    onClick={handleResendOtp} 
                    className="btn btn-link text-decoration-none fw-semibold p-0"
                    style={{ color: '#6366f1' }}
                  >
                    ✉️ Resend OTP
                  </button>
                  <button 
                    onClick={() => setShowOtpScreen(false)} 
                    className="btn btn-link text-decoration-none fw-semibold text-secondary p-0"
                  >
                    Back to Register
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;