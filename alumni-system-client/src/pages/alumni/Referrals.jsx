import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";
import { referrals as referralsApi, auth, profiles, notifications as notificationsApi, messages as messagesApi } from "../../services/api";
import { downloadBase64File } from "../../services/fileHelper";

function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedRefForApprove, setSelectedRefForApprove] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [loading, setLoading] = useState(true);

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

      const resolvedRefs = [];
      for (const ref of refs) {
        const studentUser = allUsers.find(u => u.id === ref.studentId);
        let profilePic = "";
        try {
          const profileData = await profiles.getByUserId(ref.studentId);
          profilePic = profileData.profilePicture || "";
        } catch (e) {
          // ignore
        }
        resolvedRefs.push({
          id: ref.id,
          studentId: ref.studentId,
          studentName: studentUser ? studentUser.name : `Student #${ref.studentId}`,
          studentEmail: studentUser ? studentUser.email : "N/A",
          company: ref.company || "N/A",
          jobRole: ref.jobRole || "N/A",
          message: ref.message || "N/A",
          requestDate: ref.requestDate || "N/A",
          status: ref.status ? (ref.status.charAt(0).toUpperCase() + ref.status.slice(1).toLowerCase()) : "Pending",
          studentPhoto: profilePic
        });
      }

      setReferrals(resolvedRefs);
    } catch (error) {
      console.error("Failed to load referrals", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const ref = referrals.find(r => r.id === id);
      if (status === "Rejected") {
        await referralsApi.reject(id);
        toast.success(`Referral Rejected Successfully 🎉`);
        
        // Trigger status update notification
        if (ref && ref.studentId) {
          try {
            const currentUser = JSON.parse(localStorage.getItem("currentUser"));
            await notificationsApi.createNotification({
              userId: ref.studentId,
              title: `Referral Request Rejected`,
              message: `Your referral request to ${currentUser.name} has been rejected.`,
              type: "REFERRAL"
            });
          } catch (notifErr) {
            console.error("Failed to send referral status notification", notifErr);
          }
        }
      }
      loadReferrals();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update referral ❌`);
    }
  };

  const handleApproveClick = (ref) => {
    setSelectedRefForApprove(ref);
    setApprovalMessage(`Hi ${ref.studentName || "there"}, I have approved your referral request for ${ref.company} (${ref.jobRole}). Good luck!`);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRefForApprove) return;
    setIsSubmittingApproval(true);
    try {
      const refId = selectedRefForApprove.id;
      const studentId = selectedRefForApprove.studentId;
      
      // 1. Approve referral in backend
      await referralsApi.approve(refId);
      
      // 2. Send direct chat message if message is not empty
      if (approvalMessage.trim()) {
        try {
          await messagesApi.sendMessage({
            receiverId: studentId,
            messageContent: approvalMessage
          });
        } catch (msgErr) {
          console.error("Failed to send approval chat message", msgErr);
        }
      }
      
      toast.success(`Referral Approved Successfully 🎉`);

      // 3. Trigger status update notification
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        await notificationsApi.createNotification({
          userId: studentId,
          title: "Referral Approved",
          message: `Your referral request to ${currentUser.name} has been approved.`,
          type: "REFERRAL"
        });
      } catch (notifErr) {
        console.error("Failed to send referral status notification", notifErr);
      }

      setIsApproveModalOpen(false);
      setSelectedRefForApprove(null);
      setApprovalMessage("");
      loadReferrals();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to approve referral ❌`);
    } finally {
      setIsSubmittingApproval(false);
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
      <div className="container py-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-light-subtle">
          <div>
            <h2 className="fw-bold mb-1 text-dark">🤝 Referral Requests</h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>Provide career endorsements and resume referrals for students.</p>
          </div>
          <span className="badge bg-primary px-3 py-2 fs-6 rounded-pill">
            Total Requests: {referrals.length}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading endorsements board...</p>
          </div>
        ) : referrals.length === 0 ? (
          <div className="card shadow-sm p-5 text-center border-0 text-dark rounded-4 bg-white">
            <h5 className="fw-bold mb-2">No Referral Requests Found</h5>
            <p className="text-secondary mb-0">Incoming requests from students will appear here dynamically.</p>
          </div>
        ) : (
          <div className="row g-3">
            {referrals.map((ref) => (
              <div key={ref.id} className="col-md-6">
                <div className="card border-0 rounded-4 shadow-sm h-100 bg-white">
                  <div className="card-body p-4 text-dark">
                    
                    {/* Header: Student Profile Image + Name */}
                    <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom border-light-subtle">
                      <img
                        src={ref.studentPhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt={ref.studentName}
                        className="rounded-circle border shadow-sm"
                        style={{ width: "52px", height: "52px", objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>{ref.studentName}</h4>
                        <small className="text-muted">{ref.studentEmail}</small>
                      </div>
                      <span className={`badge px-3 py-1.5 rounded-pill ${
                        ref.status === "Approved"
                          ? "bg-success"
                          : ref.status === "Rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}>
                        {ref.status}
                      </span>
                    </div>

                    <div className="p-3 mb-3 rounded-3 bg-light text-dark" style={{ fontSize: "0.9rem" }}>
                      <p className="mb-2"><strong>🏢 Target Company:</strong> <span className="text-secondary">{ref.company}</span></p>
                      <p className="mb-2"><strong>💼 Target Role:</strong> <span className="text-secondary">{ref.jobRole}</span></p>
                      <p className="mb-0"><strong>📅 Requested:</strong> <span className="text-secondary">{ref.requestDate}</span></p>
                    </div>

                    {ref.message && (
                      <div className="mb-3">
                        <strong className="d-block mb-1 text-secondary" style={{ fontSize: "0.85rem" }}>💬 Message from Student:</strong>
                        <p className="mb-0 p-3 rounded bg-light text-dark" style={{ fontSize: "0.9rem", fontStyle: "italic", borderLeft: "3px solid #0d6efd" }}>
                          "{ref.message}"
                        </p>
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-4 pt-2 border-top border-light-subtle">
                      <button
                        className="btn btn-outline-info flex-grow-1 fw-bold rounded-pill"
                        onClick={() => openResumeModal(ref.studentId)}
                      >
                        📄 View Profile & Resume
                      </button>

                      {ref.status === "Pending" && (
                        <>
                          <button
                            className="btn btn-success px-4 rounded-pill fw-bold"
                            onClick={() => handleApproveClick(ref)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-outline-danger px-4 rounded-pill fw-bold"
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
              className="card border-0 text-dark shadow-lg rounded-4"
              style={{
                width: "100%",
                maxWidth: "750px",
                maxHeight: "90vh",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Modal Header */}
              <div className="card-header d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle bg-white rounded-top-4">
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
                    <div className="bg-light text-dark p-4 rounded-3 border" style={{ fontFamily: "'Inter', sans-serif" }}>
                      
                      {/* Avatar Image + Details in Modal */}
                      <div className="text-center border-bottom pb-3 mb-3">
                        <img
                          src={selectedProfile.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                          alt={selectedProfile.fullName}
                          className="rounded-circle shadow-sm border border-3 border-white mb-3"
                          style={{ width: "90px", height: "90px", objectFit: "cover" }}
                        />
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
                          <h6 className="fw-bold text-uppercase border-bottom pb-1 text-dark" style={{ fontSize: "0.85rem" }}>
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
                          <h6 className="fw-bold text-uppercase border-bottom pb-1 text-dark" style={{ fontSize: "0.85rem" }}>
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
                          <h6 className="fw-bold text-uppercase border-bottom pb-1 text-dark" style={{ fontSize: "0.85rem" }}>
                            Skills & Expertise
                          </h6>
                          <div className="d-flex flex-wrap gap-1.5 pt-1">
                            {selectedProfile.skills.split(",").map((skill, index) => (
                              <span
                                key={index}
                                className="badge bg-white text-dark border px-2.5 py-1.5 rounded-1"
                                style={{ fontSize: "0.78rem", fontWeight: "500" }}
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
              <div className="card-footer py-3 border-top border-light-subtle d-flex justify-content-end bg-white rounded-bottom-4">
                {selectedProfile && selectedProfile.resume && (
                  <button
                    className="btn btn-success me-2 fw-bold"
                    onClick={() => {
                      downloadBase64File(selectedProfile.resume, `${selectedProfile.fullName.replace(/\s+/g, "_")}_Resume.pdf`);
                    }}
                  >
                    📥 Download Uploaded Resume
                  </button>
                )}
                <button
                  className="btn btn-secondary fw-bold"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedProfile(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom approval overlay */}
        {isApproveModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 1060,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
          >
            <div className="card border-0 text-dark shadow-lg rounded-4" style={{ width: "100%", maxWidth: "550px", background: "#ffffff" }}>
              <div className="card-header bg-white py-3 border-bottom border-light-subtle rounded-top-4">
                <h5 className="fw-bold mb-0 text-dark">✍️ Approval Direct Message</h5>
              </div>
              <div className="card-body p-4">
                <p className="text-secondary small mb-3">Include an optional congrats note or referral instructions. This will be automatically sent as a direct message to the student.</p>
                <textarea
                  className="form-control"
                  rows="4"
                  value={approvalMessage}
                  onChange={(e) => setApprovalMessage(e.target.value)}
                  placeholder="Enter congrats note here..."
                />
              </div>
              <div className="card-footer py-3 border-top border-light-subtle bg-white rounded-bottom-4 d-flex justify-content-end gap-2">
                <button className="btn btn-secondary fw-bold" disabled={isSubmittingApproval} onClick={() => setIsApproveModalOpen(false)}>Cancel</button>
                <button className="btn btn-success fw-bold" disabled={isSubmittingApproval} onClick={handleConfirmApprove}>
                  {isSubmittingApproval ? "Processing..." : "Confirm & Send"}
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