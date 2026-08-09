import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AlumniLayout from "../../layouts/AlumniLayout";
import { auth, jobs as jobsService, applications, referrals, messages, profiles } from "../../services/api";

function AlumniDashboard() {
  const [stats, setStats] = useState({
    jobs: 0,
    applications: 0,
    referrals: 0,
    messages: 0,
  });

  const [userName, setUserName] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [recentRefs, setRecentRefs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    setUserName(currentUser.name || "Alumni");

    const fetchStatsAndProfile = async () => {
      try {
        const jobsList = await jobsService.getAll();
        const myJobs = jobsList.filter(j => j.postedByEmail === currentUser.email);

        let appCount = 0;
        for (const job of myJobs) {
          try {
            const apps = await applications.getApplicationsForJob(job.id);
            appCount += apps.length;
          } catch (e) {}
        }

        const refsList = await referrals.getAlumniReferrals(currentUser.id);
        const inboxList = await messages.getMyInbox();

        setStats({
          jobs: myJobs.length,
          applications: appCount,
          referrals: refsList.length,
          messages: inboxList.length,
        });

        // Get pending referral requests to review (limit to 3)
        const pendingRefs = refsList.filter(r => r.status?.toLowerCase() === "pending").slice(0, 3);
        
        try {
          const users = await auth.getAllUsers();
          const resolvedRefs = pendingRefs.map(ref => {
            const studentUser = users.find(u => u.id === ref.studentId);
            return {
              ...ref,
              studentName: studentUser ? studentUser.name : `Student #${ref.studentId}`,
              studentEmail: studentUser ? studentUser.email : "N/A"
            };
          });
          setRecentRefs(resolvedRefs);
        } catch (err) {
          console.error("Failed to load users for referral mapping:", err);
          setRecentRefs(pendingRefs);
        }

        // Fetch profile completeness
        let completeness = 0;
        try {
          const prof = await profiles.getMe();
          if (prof) {
            const fields = [
              prof.fullName,
              prof.email,
              prof.currentCompany,
              prof.designation,
              prof.skills,
              prof.location,
              prof.bio,
              prof.profilePicture
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
    <AlumniLayout>
      <div className="container-fluid py-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        
        {/* Welcome Header Banner */}
        <div 
          className="p-5 rounded-4 shadow-sm mb-4 border border-light-subtle position-relative overflow-hidden text-white animate__animated animate__fadeIn" 
          style={{ 
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          }}
        >
          <div className="position-absolute end-0 top-0 p-3 opacity-10" style={{ fontSize: "12rem", transform: "translate(20px, -40px)" }}>
            🏆
          </div>
          <div className="position-relative z-1">
            <span className="badge bg-purple-subtle text-purple px-3 py-2 mb-3 rounded-pill fw-bold text-uppercase tracking-wider" style={{ background: "rgba(168, 85, 247, 0.25)" }}>
              Alumni workspace
            </span>
            <h1 className="display-5 fw-bold mb-2">Welcome Back, {userName}</h1>
            <p className="lead mb-4 text-slate-300 opacity-90">
              Share career openings, review student credentials, and provide referral endorsements.
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
                <Link to="/alumni/profile" className="btn btn-sm btn-outline-success border-2 fw-bold ms-2 px-3 rounded-pill">
                  ✏️ Finish Setup
                </Link>
              )}
            </div>

          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading alumni space...</p>
          </div>
        ) : (
          <>
            {/* Metric Cards Row */}
            <div className="row g-4 mb-5">
              
              {/* Job Management */}
              <div className="col-lg-3 col-md-6">
                <Link to="/alumni/jobs" style={{ textDecoration: "none" }}>
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
                      <span className="small text-uppercase opacity-75 fw-bold">My Postings</span>
                    </div>
                    <h2 className="display-6 fw-bold mb-1">{stats.jobs}</h2>
                    <p className="mb-0 small opacity-90">Jobs Posted By You</p>
                  </div>
                </Link>
              </div>

              {/* Applications */}
              <div className="col-lg-3 col-md-6">
                <Link to="/alumni/applications" style={{ textDecoration: "none" }}>
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
                      <span className="small text-uppercase opacity-75 fw-bold">Incoming Apps</span>
                    </div>
                    <h2 className="display-6 fw-bold mb-1">{stats.applications}</h2>
                    <p className="mb-0 small opacity-90">Total Applications</p>
                  </div>
                </Link>
              </div>

              {/* Referrals */}
              <div className="col-lg-3 col-md-6">
                <Link to="/alumni/referrals" style={{ textDecoration: "none" }}>
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
                <Link to="/alumni/messages" style={{ textDecoration: "none" }}>
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
                    <p className="mb-0 small opacity-90">Student Discussions</p>
                  </div>
                </Link>
              </div>

            </div>

            {/* Pending Referrals Action Panel */}
            <div className="card border-0 rounded-4 shadow-sm p-4 bg-white mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold text-dark mb-1">⏳ Pending Referral Requests</h5>
                  <p className="text-muted small mb-0">Review these endorsement requests submitted by students.</p>
                </div>
                <Link to="/alumni/referrals" className="btn btn-sm btn-primary px-3 rounded-pill fw-bold">
                  Manage Referrals
                </Link>
              </div>

              <div className="row g-3">
                {recentRefs.length === 0 ? (
                  <div className="col-12 text-center py-4 text-muted small">
                    You have no pending referral requests to review. Great job!
                  </div>
                ) : (
                  recentRefs.map((ref) => (
                    <div className="col-md-4" key={ref.id}>
                      <div 
                        className="card border border-light-subtle rounded-4 p-4 h-100 bg-white"
                        style={{ transition: "border-color 0.25s, box-shadow 0.25s" }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "#f59e0b";
                          e.currentTarget.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.05)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "var(--bs-border-color)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-warning-subtle text-warning px-2.5 py-1">
                            Pending
                          </span>
                          <span className="small text-muted">{ref.requestDate || "N/A"}</span>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">{ref.studentName}</h6>
                        <p className="text-muted small mb-3">✉️ {ref.studentEmail}</p>
                        
                        <div className="mt-auto pt-2 border-top border-light-subtle d-flex justify-content-between align-items-baseline">
                          <span className="small fw-semibold text-slate-500">🏢 {ref.company}</span>
                          <span className="small text-secondary">{ref.jobRole}</span>
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
              <h5 className="fw-bold mb-0 text-dark">💼 Set Up Your Profile</h5>
              <button
                className="btn-close"
                onClick={() => {
                  sessionStorage.setItem("profilePopupDismissed", "true");
                  setShowPopup(false);
                }}
              ></button>
            </div>

            <div className="card-body p-4 text-center">
              <div className="mb-3" style={{ fontSize: "3rem" }}>🤝</div>
              <h5 className="fw-bold text-dark mb-2">Welcome to Alumni Connect!</h5>
              <p className="text-secondary mb-0" style={{ fontSize: "0.92rem" }}>
                It looks like you haven't set up your alumni profile yet. Completing your profile helps students find and reach out to you for mentoring, referrals, and networking.
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
                to="/alumni/profile"
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
    </AlumniLayout>
  );
}

export default AlumniDashboard;