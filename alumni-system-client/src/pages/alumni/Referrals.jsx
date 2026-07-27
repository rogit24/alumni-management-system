import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";
import { referrals as referralsApi, auth, profiles } from "../../services/api";

function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    loadReferrals();

    const interval = setInterval(() => {
      loadReferrals();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadReferrals = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) return;

      const refs = await referralsApi.getAlumniReferrals(currentUser.id);
      const allUsers = await auth.getAllUsers();

      const resolvedRefs = refs.map(ref => {
        const studentUser = allUsers.find(u => u.id === ref.studentId);
        return {
          id: ref.id,
          studentId: ref.studentId,
          studentName: studentUser ? studentUser.name : `Student #${ref.studentId}`,
          studentEmail: studentUser ? studentUser.email : "N/A",
          company: ref.company || "N/A",
          jobRole: ref.jobRole || "N/A",
          message: ref.message || "N/A",
          requestDate: ref.requestDate || "N/A",
          status: ref.status ? (ref.status.charAt(0).toUpperCase() + ref.status.slice(1).toLowerCase()) : "Pending"
        };
      });

      setReferrals(resolvedRefs);
    } catch (error) {
      console.error("Failed to load referrals", error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      if (status === "Approved") {
        await referralsApi.approve(id);
      } else {
        await referralsApi.reject(id);
      }
      toast.success(`Referral ${status} Successfully 🎉`);
      loadReferrals();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update referral ❌`);
    }
  };

  const openResumeModal = async (studentId) => {
    setIsLoadingProfile(true);
    setIsModalOpen(true);
    try {
      const profileData = await profiles.getByUserId(studentId);
      setSelectedProfile(profileData);
    } catch (error) {
      toast.error("This student has not created a detailed profile yet ❌");
      setIsModalOpen(false);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  return (
    <AlumniLayout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-light-subtle">
          <div>
            <h2 className="fw-bold mb-1 text-dark">🤝 Referral Requests</h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>Provide career endorsements and resume referrals for students.</p>
          </div>
          <span className="badge bg-primary px-3 py-2 fs-6 rounded-pill">
            Total Requests: {referrals.length}
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="card shadow p-5 text-center border-0 text-dark" style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0"
          }}>
            <h5 className="fw-bold mb-2">No Referral Requests Found</h5>
            <p className="text-secondary mb-0">Incoming requests from students will appear here dynamically.</p>
          </div>
        ) : (
          <div className="row g-3">
            {referrals.map((ref) => (
              <div key={ref.id} className="col-md-6">
                <div className="card border-0 rounded-4 shadow-sm h-100" style={{
                  background: "#e0f2fe",
                  border: "1px solid #bae6fd",
                  transition: "transform 0.2s ease, background 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.background = "#bae6fd";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.background = "#e0f2fe";
                  e.currentTarget.style.boxShadow = "none";
                }}
                >
                  <div className="card-body p-4 text-dark">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="fw-bold mb-0 text-dark">{ref.studentName}</h4>
                      <span className={`badge ${
                        ref.status === "Approved"
                          ? "bg-success"
                          : ref.status === "Rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}>
                        {ref.status}
                      </span>
                    </div>

                    <div className="p-3 mb-3 rounded bg-white text-dark" style={{ border: "1px solid rgba(14, 165, 233, 0.15)", fontSize: "0.9rem" }}>
                      <p className="mb-2"><strong>✉️ Email:</strong> <span className="text-secondary">{ref.studentEmail}</span></p>
                      <p className="mb-2"><strong>🏢 Target Company:</strong> <span className="text-secondary">{ref.company}</span></p>
                      <p className="mb-2"><strong>💼 Target Role:</strong> <span className="text-secondary">{ref.jobRole}</span></p>
                      <p className="mb-0"><strong>📅 Requested:</strong> <span className="text-secondary">{ref.requestDate}</span></p>
                    </div>

                    {ref.message && (
                      <div className="mb-3">
                        <strong className="d-block mb-1 text-secondary" style={{ fontSize: "0.85rem" }}>💬 Message from Student:</strong>
                        <p className="mb-0 p-3 rounded bg-white text-dark" style={{ fontSize: "0.9rem", fontStyle: "italic", borderLeft: "3px solid #0d6efd", border: "1px solid rgba(14, 165, 233, 0.1)" }}>
                          "{ref.message}"
                        </p>
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-4 pt-2 border-top border-light-subtle">
                      <button
                        className="btn btn-outline-info flex-grow-1"
                        onClick={() => openResumeModal(ref.studentId)}
                      >
                        📄 View Profile & Resume
                      </button>

                      {ref.status === "Pending" && (
                        <>
                          <button
                            className="btn btn-success px-4"
                            onClick={() => updateStatus(ref.id, "Approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger px-4"
                            onClick={() => updateStatus(ref.id, "Rejected")}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resume Viewer Modal */}
        {isModalOpen && (
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
              className="card border-0 text-dark shadow-lg"
              style={{
                width: "100%",
                maxWidth: "750px",
                maxHeight: "90vh",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Modal Header */}
              <div className="card-header d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle" style={{ background: "#f8fafc" }}>
                <h5 className="fw-bold mb-0 text-dark">📄 Student Resume View</h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedProfile(null);
                  }}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="card-body p-4" style={{ overflowY: "auto" }}>
                {isLoadingProfile ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3 text-muted">Retrieving verified Student Profile...</p>
                  </div>
                ) : (
                  selectedProfile && (
                    <div className="bg-light text-dark p-4 rounded border" style={{ fontFamily: "'Inter', sans-serif", background: "#f0f7ff", borderColor: "#bae6fd" }}>
                      {/* Name / Contact Header */}
                      <div className="text-center border-bottom pb-3 mb-3" style={{ borderColor: "#bae6fd" }}>
                        <h3 className="fw-bold text-uppercase text-dark mb-1">{selectedProfile.fullName}</h3>
                        <p className="fw-semibold text-primary mb-2" style={{ fontSize: "1rem" }}>
                          {selectedProfile.designation || "Student"}
                          {selectedProfile.currentCompany ? ` @ ${selectedProfile.currentCompany}` : ""}
                        </p>
                        <div className="d-flex justify-content-center flex-wrap gap-3 text-muted" style={{ fontSize: "0.85rem" }}>
                          <span>✉️ {selectedProfile.email}</span>
                          {selectedProfile.phone && <span>📞 {selectedProfile.phone}</span>}
                          {selectedProfile.location && <span>📍 {selectedProfile.location}</span>}
                        </div>
                      </div>

                      {/* Summary Section */}
                      {selectedProfile.bio && (
                        <div className="mb-3">
                          <h6 className="fw-bold text-uppercase border-bottom pb-1 text-dark" style={{ fontSize: "0.85rem", borderColor: "#bae6fd" }}>
                            Professional Summary
                          </h6>
                          <p className="text-secondary" style={{ fontSize: "0.88rem", textAlign: "justify", marginBottom: 0 }}>
                            {selectedProfile.bio}
                          </p>
                        </div>
                      )}

                      {/* Education Section */}
                      {selectedProfile.education && (
                        <div className="mb-3">
                          <h6 className="fw-bold text-uppercase border-bottom pb-1 text-dark" style={{ fontSize: "0.85rem", borderColor: "#bae6fd" }}>
                            Education
                          </h6>
                          <div className="d-flex justify-content-between align-items-baseline">
                            <p className="text-dark fw-semibold mb-0" style={{ whiteSpace: "pre-line", fontSize: "0.88rem" }}>
                              {selectedProfile.education}
                            </p>
                            {selectedProfile.graduationYear && (
                              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                                Class of {selectedProfile.graduationYear}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills Section */}
                      {selectedProfile.skills && (
                        <div>
                          <h6 className="fw-bold text-uppercase border-bottom pb-1 text-dark" style={{ fontSize: "0.85rem", borderColor: "#bae6fd" }}>
                            Skills & Expertise
                          </h6>
                          <div className="d-flex flex-wrap gap-1.5 pt-1">
                            {selectedProfile.skills.split(",").map((skill, index) => (
                              <span
                                key={index}
                                className="badge bg-white text-dark border border-secondary px-2.5 py-1.5 rounded-1"
                                style={{ fontSize: "0.78rem", fontWeight: "500", borderColor: "#bae6fd !important" }}
                              >
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Modal Footer */}
              <div className="card-footer py-3 border-top border-light-subtle d-flex justify-content-end" style={{ background: "#f8fafc" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedProfile(null);
                  }}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AlumniLayout>
  );
}

export default Referrals;