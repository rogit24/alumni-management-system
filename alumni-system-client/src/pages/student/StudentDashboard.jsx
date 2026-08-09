import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../../layouts/StudentLayout";
import { jobs as jobsService, applications, referrals, messages, profiles } from "../../services/api";

function StudentDashboard() {
  const [stats, setStats] = useState({
    jobs: 0,
    applications: 0,
    referrals: 0,
    messages: 0,
  });

  const [userName, setUserName] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    setUserName(currentUser.name || "Student");

    const fetchStatsAndProfile = async () => {
      try {
        const jobsList = await jobsService.getAll();
        const appsList = await applications.getMyApplications();
        const refsList = await referrals.getStudentReferrals(currentUser.id);
        const inboxList = await messages.getMyInbox();

        setStats({
          jobs: jobsList.length,
          applications: appsList.length,
          referrals: refsList.length,
          messages: inboxList.length,
        });

        // Get most recent 3 jobs
        const sortedJobs = [...jobsList].reverse().slice(0, 3);
        setRecentJobs(sortedJobs);

        // Fetch profile completeness
        let completeness = 0;
        try {
          const prof = await profiles.getMe();
          if (prof) {
            const fields = [
              prof.fullName,
              prof.email,
              prof.phone,
              prof.location,
              prof.designation,
              prof.skills,
              prof.bio,
              prof.education
            ];
            const filled = fields.filter(val => val && String(val).trim() !== "").length;
            completeness = Math.round((filled / fields.length) * 100);
          }
        } catch (e) {
          console.log("No profile found yet, completeness is 0%");
        }
        setProfileCompletion(completeness);

        // Show popup if completeness is 0 and not dismissed in session
        if (sessionStorage.getItem("profilePopupDismissed") !== "true" && completeness === 0) {
          setShowPopup(true);
        }
      } catch (error) {
        console.error("Failed to load dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsAndProfile();
  }, []);

  return (
    <StudentLayout>
      <div className="container-fluid py-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        
        {/* Welcome Header Banner */}
        <div 
          className="p-5 rounded-4 shadow-sm mb-4 border border-light-subtle position-relative overflow-hidden text-white animate__animated animate__fadeIn" 
          style={{ 
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          }}
        >
          <div className="position-absolute end-0 top-0 p-3 opacity-10" style={{ fontSize: "12rem", transform: "translate(20px, -40px)" }}>
            🎓
          </div>
          <div className="position-relative z-1">
            <span className="badge bg-success px-3 py-2 mb-3 rounded-pill fw-bold text-uppercase tracking-wider">
              Student Workspace
            </span>
            <h1 className="display-5 fw-bold mb-2">Welcome Back, {userName}</h1>
            <p className="lead mb-4 text-slate-300 opacity-90">
              Explore job opportunities, apply with your resume, and connect with global alumni endorsers.
            </p>

            {/* Profile Completion Bar */}
            <div className="d-flex align-items-center flex-wrap gap-3 pt-2">
              <div style={{ flexGrow: 1, maxWidth: "320px" }}>
                <div className="progress rounded-pill" style={{ height: "10px", background: "rgba(255, 255, 255, 0.15)" }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated bg-success rounded-pill" 
                    role="progressbar" 
                    style={{ width: `${profileCompletion}%` }}
                    aria-valuenow={profileCompletion} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              <span className="fw-bold text-success" style={{ fontSize: "0.95rem" }}>
                {profileCompletion}% Profile Completed
              </span>
              {profileCompletion < 100 && (
                <Link to="/student/profile" className="btn btn-sm btn-outline-success border-2 fw-bold ms-2 px-3 rounded-pill">
                  ✏️ Finish Setup
                </Link>
              )}
            </div>

          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading student space...</p>
          </div>
        ) : (
          <>
            {/* Metric Cards Row */}
            <div className="row g-4 mb-5">
              
              {/* Jobs */}
              <div className="col-lg-3 col-md-6">
                <Link to="/student/jobs" style={{ textDecoration: "none" }}>
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
                      <span className="fs-1">💼</span>
                      <span className="small text-uppercase opacity-75 fw-bold">Marketplace</span>
                    </div>
                    <h2 className="display-6 fw-bold mb-1">{stats.jobs}</h2>
                    <p className="mb-0 small opacity-90">Available Openings</p>
                  </div>
                </Link>
              </div>

              {/* Applications */}
              <div className="col-lg-3 col-md-6">
                <Link to="/student/applications" style={{ textDecoration: "none" }}>
                  <div 
                    className="card border-0 rounded-4 shadow-sm p-4 h-100 text-white position-relative overflow-hidden" 
                    style={{ 
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 10px 20px rgba(16, 185, 129, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fs-1">📄</span>
                      <span className="small text-uppercase opacity-75 fw-bold">Applications</span>
                    </div>
                    <h2 className="display-6 fw-bold mb-1">{stats.applications}</h2>
                    <p className="mb-0 small opacity-90">Submitted Applications</p>
                  </div>
                </Link>
              </div>

              {/* Referrals */}
              <div className="col-lg-3 col-md-6">
                <Link to="/student/referrals" style={{ textDecoration: "none" }}>
                  <div 
                    className="card border-0 rounded-4 shadow-sm p-4 h-100 text-white position-relative overflow-hidden" 
                    style={{ 
                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 10px 20px rgba(245, 158, 11, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fs-1">🤝</span>
                      <span className="small text-uppercase opacity-75 fw-bold">Referrals</span>
                    </div>
                    <h2 className="display-6 fw-bold mb-1">{stats.referrals}</h2>
                    <p className="mb-0 small opacity-90">Referral Endorsements</p>
                  </div>
                </Link>
              </div>

              {/* Messages */}
              <div className="col-lg-3 col-md-6">
                <Link to="/student/messages" style={{ textDecoration: "none" }}>
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
                      <span className="fs-1">💬</span>
                      <span className="small text-uppercase opacity-75 fw-bold">Messages</span>
                    </div>
                    <h2 className="display-6 fw-bold mb-1">{stats.messages}</h2>
                    <p className="mb-0 small opacity-90">Chat Conversations</p>
                  </div>
                </Link>
              </div>

            </div>

            {/* Recent Job Openings Directory */}
            <div className="card border-0 rounded-4 shadow-sm p-4 bg-white mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold text-dark mb-1">🔥 Newly Posted Openings</h5>
                  <p className="text-muted small mb-0">Apply directly or ask for a referral on these opportunities.</p>
                </div>
                <Link to="/student/jobs" className="btn btn-sm btn-primary px-3 rounded-pill fw-bold">
                  View All Jobs
                </Link>
              </div>
              
              <div className="row g-3">
                {recentJobs.length === 0 ? (
                  <div className="col-12 text-center py-4 text-muted small">
                    No open job opportunities posted yet.
                  </div>
                ) : (
                  recentJobs.map((job) => (
                    <div className="col-md-4" key={job.id}>
                      <div 
                        className="card border border-light-subtle rounded-4 p-4 h-100 bg-white"
                        style={{ transition: "border-color 0.25s, box-shadow 0.25s" }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "#4f46e5";
                          e.currentTarget.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.05)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "var(--bs-border-color)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <span className="badge bg-primary-subtle text-primary align-self-start mb-2 px-2.5 py-1">
                          #{job.id}
                        </span>
                        <h6 className="fw-bold text-dark mb-1">{job.title}</h6>
                        <p className="text-secondary small mb-3">🏢 {job.company}</p>
                        
                        <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top border-light-subtle">
                          <span className="small text-muted">📍 {job.location || "Remote"}</span>
                          <Link to="/student/jobs" className="btn btn-xs btn-outline-primary py-1 px-2.5 rounded-pill small fw-semibold" style={{ fontSize: "0.78rem" }}>
                            Apply →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </>
        )}

      </div>

      {/* Welcome Profile Setup Modal */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            className="card border-0 text-dark shadow-lg animate__animated animate__zoomIn"
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "#ffffff",
              borderRadius: "16px"
            }}
          >
            <div className="card-header bg-transparent border-bottom p-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0 text-dark">🎓 Set Up Your Profile</h5>
              <button
                className="btn-close"
                onClick={() => {
                  sessionStorage.setItem("profilePopupDismissed", "true");
                  setShowPopup(false);
                }}
              ></button>
            </div>

            <div className="card-body p-4 text-center">
              <div className="mb-3" style={{ fontSize: "3rem" }}>🚀</div>
              <h5 className="fw-bold text-dark mb-2">Welcome to Alumni Connect!</h5>
              <p className="text-secondary mb-0" style={{ fontSize: "0.92rem" }}>
                It looks like you haven't filled out your student profile yet. Completing your profile allows you to apply to jobs, request referrals, and be discovered by top alumni.
              </p>
            </div>

            <div className="card-footer bg-transparent border-top p-3 d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  sessionStorage.setItem("profilePopupDismissed", "true");
                  setShowPopup(false);
                }}
              >
                Skip for Now
              </button>
              <Link
                to="/student/profile"
                className="btn btn-success"
                onClick={() => {
                  sessionStorage.setItem("profilePopupDismissed", "true");
                  setShowPopup(false);
                }}
              >
                Update Profile Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

export default StudentDashboard;