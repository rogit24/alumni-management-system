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
      }
    };

    fetchStatsAndProfile();
  }, []);

   return (
    <StudentLayout>
      <div className="container-fluid">

        {/* Welcome Section */}
        <div className="mb-5 p-4 rounded-4 text-white position-relative overflow-hidden shadow animate__animated animate__fadeIn" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <h2 className="fw-bold mb-1">
                🎓 Student Dashboard
              </h2>
              <p className="mb-3 text-light-emphasis" style={{ color: "#94a3b8" }}>
                Welcome back, <strong>{userName}</strong>! Ready to connect and apply today?
              </p>
              
              {/* Profile Completion Indicator */}
              <div className="d-flex align-items-center gap-3">
                <div style={{ flexGrow: 1, maxWidth: "300px" }}>
                  <div className="progress" style={{ height: "8px", background: "rgba(255, 255, 255, 0.15)" }}>
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                      role="progressbar" 
                      style={{ width: `${profileCompletion}%` }}
                      aria-valuenow={profileCompletion} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
                <span className="fw-semibold text-success" style={{ fontSize: "0.9rem" }}>
                  {profileCompletion}% Profile Completed
                </span>
              </div>
            </div>
            {profileCompletion < 100 && (
              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                <Link to="/student/profile" className="btn btn-sm btn-outline-success fw-semibold">
                  ✏️ Complete Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Cards */}

        <div className="row g-4">

          <div className="col-md-3">
            <Link to="/student/jobs" style={{ textDecoration: "none" }}>
              <div className="student-card student-card-blue p-4 position-relative" style={{ cursor: "pointer" }}>

                <div className="card-icon">
                  💼
                </div>

                <h2>{stats.jobs}</h2>

                <p>Available Jobs</p>

              </div>
            </Link>
          </div>

          <div className="col-md-3">
            <Link to="/student/applications" style={{ textDecoration: "none" }}>
              <div className="student-card student-card-green p-4 position-relative" style={{ cursor: "pointer" }}>

                <div className="card-icon">
                  📄
                </div>

                <h2>
                  {stats.applications}
                </h2>

                <p>Applications</p>

              </div>
            </Link>
          </div>

          <div className="col-md-3">
            <Link to="/student/referrals" style={{ textDecoration: "none" }}>
              <div className="student-card student-card-orange p-4 position-relative" style={{ cursor: "pointer" }}>

                <div className="card-icon">
                  🤝
                </div>

                <h2>{stats.referrals}</h2>

                <p>Referrals</p>

              </div>
            </Link>
          </div>

          <div className="col-md-3">
            <Link to="/student/messages" style={{ textDecoration: "none" }}>
              <div className="student-card student-card-purple p-4 position-relative" style={{ cursor: "pointer" }}>

                <div className="card-icon">
                  💬
                </div>

                <h2>{stats.messages}</h2>

                <p>Messages</p>

              </div>
            </Link>
          </div>

        </div>

        {/* Quick Info Section */}

     

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