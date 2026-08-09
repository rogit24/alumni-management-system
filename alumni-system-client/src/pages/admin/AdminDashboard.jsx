import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { auth, jobs as jobsApi, applications as applicationsApi, referrals as referralsApi } from "../../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    alumni: 0,
    admins: 0,
    jobs: 0,
    applications: 0,
    referrals: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const users = await auth.getAllUsers();
      const jobs = await jobsApi.getAll();
      
      let applications = [];
      try {
        applications = await applicationsApi.getAll();
      } catch (err) {
        console.error("Error fetching applications:", err);
      }

      let referrals = [];
      try {
        referrals = await referralsApi.getAll();
      } catch (err) {
        console.error("Error fetching referrals:", err);
      }

      setStats({
        users: users.length,
        students: users.filter((u) => u.role?.toLowerCase() === "student").length,
        alumni: users.filter((u) => u.role?.toLowerCase() === "alumni").length,
        admins: users.filter((u) => u.role?.toLowerCase() === "admin").length,
        jobs: jobs.length,
        applications: applications.length,
        referrals: referrals.length,
      });
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        
        {/* Welcome Header Banner */}
        <div 
          className="p-5 rounded-4 shadow-sm mb-4 border border-light-subtle position-relative overflow-hidden text-white" 
          style={{ 
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          }}
        >
          <div className="position-absolute end-0 top-0 p-3 opacity-10" style={{ fontSize: "12rem", transform: "translate(20px, -40px)" }}>
            🛡️
          </div>
          <div className="position-relative z-1">
            <span className="badge bg-primary px-3 py-2 mb-3 rounded-pill fw-bold text-uppercase tracking-wider">
              Control Panel
            </span>
            <h1 className="display-5 fw-bold mb-2">Welcome Back, Admin</h1>
            <p className="lead mb-0 text-slate-300 opacity-90">
              Monitor complete system analytics, review registration pipeline, and track operations.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Synchronizing dashboard metrics...</p>
          </div>
        ) : (
          <div className="row g-4">
            
            {/* Total Users */}
            <div className="col-lg-3 col-md-6">
              <Link to="/admin/users" style={{ textDecoration: "none" }}>
                <div 
                  className="card border-0 rounded-4 shadow-sm p-4 h-100 text-white position-relative overflow-hidden" 
                  style={{ 
                    background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(79, 70, 229, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fs-1">👥</span>
                    <span className="small text-uppercase opacity-75 fw-bold">User Pool</span>
                  </div>
                  <h2 className="display-6 fw-bold mb-1">{stats.users}</h2>
                  <p className="mb-0 small opacity-90">Total Registered Accounts</p>
                </div>
              </Link>
            </div>

            {/* Students */}
            <div className="col-lg-3 col-md-6">
              <Link to="/admin/students" style={{ textDecoration: "none" }}>
                <div 
                  className="card border-0 rounded-4 shadow-sm p-4 h-100 text-white position-relative overflow-hidden" 
                  style={{ 
                    background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(14, 165, 233, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fs-1">🎓</span>
                    <span className="small text-uppercase opacity-75 fw-bold">Academics</span>
                  </div>
                  <h2 className="display-6 fw-bold mb-1">{stats.students}</h2>
                  <p className="mb-0 small opacity-90">Active Student Accounts</p>
                </div>
              </Link>
            </div>

            {/* Alumni */}
            <div className="col-lg-3 col-md-6">
              <Link to="/admin/alumni" style={{ textDecoration: "none" }}>
                <div 
                  className="card border-0 rounded-4 shadow-sm p-4 h-100 text-white position-relative overflow-hidden" 
                  style={{ 
                    background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(139, 92, 246, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fs-1">🏆</span>
                    <span className="small text-uppercase opacity-75 fw-bold">Professionals</span>
                  </div>
                  <h2 className="display-6 fw-bold mb-1">{stats.alumni}</h2>
                  <p className="mb-0 small opacity-90">Verified Global Alumni</p>
                </div>
              </Link>
            </div>

            {/* Admins */}
            <div className="col-lg-3 col-md-6">
              <Link to="/admin/users" style={{ textDecoration: "none" }}>
                <div 
                  className="card border-0 rounded-4 shadow-sm p-4 h-100 text-white position-relative overflow-hidden" 
                  style={{ 
                    background: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(244, 63, 94, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fs-1">🛡️</span>
                    <span className="small text-uppercase opacity-75 fw-bold">Moderation</span>
                  </div>
                  <h2 className="display-6 fw-bold mb-1">{stats.admins}</h2>
                  <p className="mb-0 small opacity-90">System Administrators</p>
                </div>
              </Link>
            </div>

            {/* Jobs */}
            <div className="col-lg-4 col-md-6">
              <Link to="/admin/reports" style={{ textDecoration: "none" }}>
                <div 
                  className="card border border-light-subtle rounded-4 shadow-sm p-4 h-100 text-dark bg-white" 
                  style={{ 
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.05)";
                    e.currentTarget.style.borderColor = "#4f46e5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "var(--bs-border-color)";
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fs-2 text-primary">💼</span>
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1">Active</span>
                  </div>
                  <h3 className="fw-bold mb-1">{stats.jobs}</h3>
                  <h6 className="text-secondary fw-semibold mb-2">Jobs Posted</h6>
                  <p className="mb-0 small text-muted">Open job opportunities in the portal marketplace.</p>
                </div>
              </Link>
            </div>

            {/* Applications */}
            <div className="col-lg-4 col-md-6">
              <Link to="/admin/reports" style={{ textDecoration: "none" }}>
                <div 
                  className="card border border-light-subtle rounded-4 shadow-sm p-4 h-100 text-dark bg-white" 
                  style={{ 
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.05)";
                    e.currentTarget.style.borderColor = "#10b981";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "var(--bs-border-color)";
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fs-2 text-success">📄</span>
                    <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1">Funnels</span>
                  </div>
                  <h3 className="fw-bold mb-1">{stats.applications}</h3>
                  <h6 className="text-secondary fw-semibold mb-2">Job Applications</h6>
                  <p className="mb-0 small text-muted">Student job applications submitted and in pipelines.</p>
                </div>
              </Link>
            </div>

            {/* Referrals */}
            <div className="col-lg-4 col-md-6">
              <Link to="/admin/reports" style={{ textDecoration: "none" }}>
                <div 
                  className="card border border-light-subtle rounded-4 shadow-sm p-4 h-100 text-dark bg-white" 
                  style={{ 
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.05)";
                    e.currentTarget.style.borderColor = "#f59e0b";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "var(--bs-border-color)";
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fs-2 text-warning">🤝</span>
                    <span className="badge bg-warning-subtle text-warning rounded-pill px-2.5 py-1">Connections</span>
                  </div>
                  <h3 className="fw-bold mb-1">{stats.referrals}</h3>
                  <h6 className="text-secondary fw-semibold mb-2">Referrals Requested</h6>
                  <p className="mb-0 small text-muted">Endorsements requested by students from global alumni.</p>
                </div>
              </Link>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;