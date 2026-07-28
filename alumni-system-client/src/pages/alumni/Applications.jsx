import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";
import { applications as applicationsApi, jobs as jobsService, auth, profiles, notifications as notificationsApi, messages as messagesApi } from "../../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [draggedOverCol, setDraggedOverCol] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedAppForApprove, setSelectedAppForApprove] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  const openResumeModal = async (app) => {
    setSelectedApplication(app);
    setIsLoadingProfile(true);
    setIsModalOpen(true);
    try {
      const profileData = await profiles.getByUserId(app.studentId);
      setSelectedProfile(profileData);
    } catch (error) {
      toast.error("This student has not created a detailed profile yet ❌");
      setIsModalOpen(false);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const downloadApplicationPDF = () => {
    const element = document.getElementById("downloadable-application-content");
    if (!element) {
      toast.error("Application content not found! ❌");
      return;
    }

    const opt = {
      margin:       [12, 12, 12, 12],
      filename:     `${selectedProfile.fullName.replace(/\s+/g, "_")}_Job_Application.pdf`,
      image:        { type: "jpeg", quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
      toast.success("Application details downloaded successfully! 📄");
    } else {
      toast.error("PDF generation library is loading. Please try again in a moment. ❌");
    }
  };

  useEffect(() => {
    loadApplications();

    const interval = setInterval(() => {
      loadApplications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadApplications = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) return;

      const jobsList = await jobsService.getAll();
      const myJobs = jobsList.filter(j => j.postedByEmail === currentUser.email);
      const allUsers = await auth.getAllUsers();

      let resolvedApps = [];
      for (const job of myJobs) {
        try {
          const apps = await applicationsApi.getApplicationsForJob(job.id);
          const mapped = apps.map(app => {
            const studentUser = allUsers.find(u => u.email === app.studentEmail);
            return {
              id: app.id,
              jobId: job.id,
              jobTitle: job.title,
              company: job.company,
              salary: job.salary,
              studentName: studentUser ? studentUser.name : app.studentEmail,
              studentEmail: app.studentEmail,
              studentId: studentUser ? studentUser.id : null,
              status: app.status || "PENDING",
              appliedDate: app.appliedDate || "N/A"
            };
          });
          resolvedApps = [...resolvedApps, ...mapped];
        } catch (err) {
          console.error("Failed to load applications for job", job.id);
        }
      }

      setApplications(resolvedApps);
    } catch (error) {
      console.error("Failed to load applications", error);
    }
  };

  const updateStatus = async (id, status) => {
    const app = applications.find(a => a.id === id);
    if (!app) return;

    if (status === "ACCEPTED") {
      // Open approval message modal
      setSelectedAppForApprove(app);
      setApprovalMessage(`Hi ${app.studentName || "there"}, I have approved your application for ${app.jobTitle} at ${app.company}. Congratulations!`);
      setIsApproveModalOpen(true);
      return;
    }

    try {
      await applicationsApi.updateStatus(id, status);
      toast.success(`Application updated to ${status} Successfully 🎉`);

      // Trigger status update notification
      if (app.studentId) {
        try {
          const currentUser = JSON.parse(localStorage.getItem("currentUser"));
          await notificationsApi.createNotification({
            userId: app.studentId,
            title: "Application Status Updated",
            message: `Your application for ${app.jobTitle} at ${app.company} has been updated to ${status.toLowerCase()} by ${currentUser.name}.`,
            type: "JOB"
          });
        } catch (notifErr) {
          console.error("Failed to send application status notification", notifErr);
        }
      }

      loadApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update status ❌`);
    }
  };

  const handleConfirmApprove = async () => {
    if (!selectedAppForApprove) return;
    setIsSubmittingApproval(true);
    try {
      const appId = selectedAppForApprove.id;
      const studentId = selectedAppForApprove.studentId;
      
      // 1. Update application status to ACCEPTED
      await applicationsApi.updateStatus(appId, "ACCEPTED");
      
      // 2. Send direct chat message if message is not empty
      if (approvalMessage.trim() && studentId) {
        try {
          await messagesApi.sendMessage({
            receiverId: studentId,
            messageContent: approvalMessage
          });
        } catch (msgErr) {
          console.error("Failed to send approval chat message", msgErr);
        }
      }
      
      toast.success(`Application approved successfully 🎉`);

      // 3. Trigger status update notification
      if (studentId) {
        try {
          const currentUser = JSON.parse(localStorage.getItem("currentUser"));
          await notificationsApi.createNotification({
            userId: studentId,
            title: "Application Approved",
            message: `Your application for ${selectedAppForApprove.jobTitle} at ${selectedAppForApprove.company} has been approved by ${currentUser.name}.`,
            type: "JOB"
          });
        } catch (notifErr) {
          console.error("Failed to send application status notification", notifErr);
        }
      }

      setIsApproveModalOpen(false);
      setSelectedAppForApprove(null);
      setApprovalMessage("");
      loadApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to approve application ❌`);
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    setDraggedOverCol(columnStatus);
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const idStr = e.dataTransfer.getData("text/plain");
    if (!idStr) return;
    const id = parseInt(idStr);
    
    const app = applications.find(a => a.id === id);
    if (app && app.status !== targetStatus) {
      await updateStatus(id, targetStatus);
    }
  };

  const filterByStatus = (status) => {
    return applications.filter(app => app.status === status);
  };

  const columns = [
    { title: "⏳ Pending", status: "PENDING", shadowColor: "rgba(245, 158, 11, 0.25)" },
    { title: "🔍 Reviewed", status: "REVIEWED", shadowColor: "rgba(6, 182, 212, 0.25)" },
    { title: "✅ Approved", status: "ACCEPTED", shadowColor: "rgba(16, 185, 129, 0.25)" },
    { title: "❌ Rejected", status: "REJECTED", shadowColor: "rgba(244, 63, 94, 0.25)" }
  ];

  return (
    <AlumniLayout>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-light-subtle">
          <div>
            <h2 className="fw-bold mb-1 text-dark">💼 Job Recruitment Pipeline</h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>Drag and drop student application cards to instantly change recruitment statuses.</p>
          </div>
          <button className="btn btn-outline-primary px-4 py-2 fw-semibold" onClick={loadApplications}>
            🔄 Refresh Board
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="card shadow p-5 text-center border-0 text-dark" style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0"
          }}>
            <h5 className="fw-bold mb-2">No Applications Received Yet</h5>
            <p className="text-secondary mb-0">Active job listings will populate applications dynamically here.</p>
          </div>
        ) : (
          <div className="row g-3">
            {columns.map((col) => {
              const isOver = draggedOverCol === col.status;
              const columnApps = filterByStatus(col.status);

              return (
                <div key={col.status} className="col-lg-3 col-md-6">
                  <div
                    onDragOver={(e) => handleDragOver(e, col.status)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.status)}
                    className="card border-0 rounded-4 shadow-sm"
                    style={{
                      background: "#f1f5f9",
                      border: isOver ? "2px dashed #0d6efd" : "1px solid #e2e8f0",
                      // Dynamic height: collapses nicely when empty
                      minHeight: columnApps.length > 0 ? "auto" : "150px",
                      transition: "all 0.25s ease",
                      boxShadow: isOver ? `0 0 15px ${col.shadowColor}` : "none"
                    }}
                  >
                    {/* Column Header */}
                    <div
                      className="card-header d-flex justify-content-between align-items-center border-bottom text-dark py-3 rounded-top"
                      style={{
                        background: "#e2e8f0",
                        borderBottomColor: "#cbd5e1"
                      }}
                    >
                      <h6 className="fw-bold mb-0" style={{ letterSpacing: "0.5px" }}>{col.title}</h6>
                      <span className="badge rounded-pill bg-secondary px-2.5 py-1" style={{ fontSize: "0.75rem" }}>
                        {columnApps.length}
                      </span>
                    </div>

                    {/* Column Body / Drop Zone */}
                    <div className="card-body p-2" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                      {columnApps.length === 0 ? (
                        <div className="text-center text-secondary py-4" style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}>
                          Drag cards here
                        </div>
                      ) : (
                        columnApps.map((app) => (
                           <div
                            key={app.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, app.id)}
                            className="card mb-2 p-3 text-dark border"
                            style={{
                              background: "#e0f2fe",
                              borderColor: "#bae6fd",
                              cursor: "grab",
                              transition: "all 0.2s ease"
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
                            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "0.95rem" }}>{app.jobTitle}</h6>
                            <p className="text-secondary mb-2" style={{ fontSize: "0.8rem" }}>
                              🏢 {app.company}
                            </p>
                            <div className="p-2.5 rounded bg-white" style={{ fontSize: "0.8rem", border: "1px solid rgba(14, 165, 233, 0.1)" }}>
                              <p className="mb-1 text-dark">👤 {app.studentName}</p>
                              <p className="mb-1 text-muted text-truncate">✉️ {app.studentEmail}</p>
                              <p className="mb-2 text-secondary" style={{ fontSize: "0.75rem" }}>📅 {app.appliedDate}</p>
                              {app.studentId ? (
                                <button
                                  className="btn btn-sm btn-outline-info w-100"
                                  onClick={() => openResumeModal(app)}
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  📄 View Resume
                                </button>
                              ) : (
                                <span className="text-muted d-block text-center" style={{ fontSize: "0.7rem" }}>
                                  No Profile Available
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
                    <div id="downloadable-application-content" className="bg-light text-dark p-4 rounded border" style={{ fontFamily: "'Inter', sans-serif", background: "#ffffff", borderColor: "#e2e8f0" }}>
                      {/* Job Application Details Header */}
                      <div className="mb-4 pb-3 border-bottom border-secondary text-dark" style={{ borderColor: "#dee2e6" }}>
                        <h5 className="fw-bold text-primary mb-2">💼 Job Application Information</h5>
                        <div className="row g-2" style={{ fontSize: "0.88rem" }}>
                          <div className="col-sm-6">
                            <p className="mb-1"><strong>Position Applied:</strong> <span className="text-secondary">{selectedApplication?.jobTitle}</span></p>
                            <p className="mb-1"><strong>Company:</strong> <span className="text-secondary">{selectedApplication?.company}</span></p>
                          </div>
                          <div className="col-sm-6">
                            <p className="mb-1"><strong>Recruitment Status:</strong> <span className="badge bg-primary text-white">{selectedApplication?.status}</span></p>
                            <p className="mb-0"><strong>Applied Date:</strong> <span className="text-secondary">{selectedApplication?.appliedDate}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Name / Contact Header */}
                      <div className="text-center border-bottom pb-3 mb-3" style={{ borderColor: "#dee2e6" }}>
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
                          <h6 className="fw-bold text-uppercase border-bottom pb-1 text-dark" style={{ fontSize: "0.85rem", borderColor: "#dee2e6" }}>
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
                          <h6 className="fw-bold text-uppercase border-bottom pb-1 text-dark" style={{ fontSize: "0.85rem", borderColor: "#dee2e6" }}>
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
                          <h6 className="fw-bold text-uppercase border-bottom pb-1 text-dark" style={{ fontSize: "0.85rem", borderColor: "#dee2e6" }}>
                            Skills & Expertise
                          </h6>
                          <div className="d-flex flex-wrap gap-1.5 pt-1">
                            {selectedProfile.skills.split(",").map((skill, index) => (
                              <span
                                key={index}
                                className="badge bg-light text-dark border px-2.5 py-1.5 rounded-1"
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
              <div className="card-footer py-3 border-top border-light-subtle d-flex justify-content-end gap-2" style={{ background: "#f8fafc" }}>
                <button
                  className="btn btn-success"
                  onClick={downloadApplicationPDF}
                  disabled={isLoadingProfile || !selectedProfile}
                >
                  📥 Download Application PDF
                </button>
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

        {/* Custom Approval Message Modal */}
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
                maxWidth: "550px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Modal Header */}
              <div className="card-header d-flex justify-content-between align-items-center py-3 border-bottom border-light-subtle" style={{ background: "#f8fafc" }}>
                <h5 className="fw-bold mb-0 text-dark">✍️ Add Approval Message</h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setIsApproveModalOpen(false);
                    setSelectedAppForApprove(null);
                    setApprovalMessage("");
                  }}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="card-body p-4">
                <p className="text-secondary" style={{ fontSize: "0.9rem" }}>
                  Write a note for <strong>{selectedAppForApprove?.studentName}</strong>. This will be sent as a direct message in their chat inbox.
                </p>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary" style={{ fontSize: "0.85rem" }}>Message Content</label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="Enter message for the student..."
                    value={approvalMessage}
                    onChange={(e) => setApprovalMessage(e.target.value)}
                    style={{ fontSize: "0.9rem", resize: "none" }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="card-footer py-3 border-top border-light-subtle d-flex justify-content-end gap-2" style={{ background: "#f8fafc" }}>
                <button
                  className="btn btn-secondary px-4"
                  onClick={() => {
                    setIsApproveModalOpen(false);
                    setSelectedAppForApprove(null);
                    setApprovalMessage("");
                  }}
                  disabled={isSubmittingApproval}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success px-4"
                  onClick={handleConfirmApprove}
                  disabled={isSubmittingApproval}
                >
                  {isSubmittingApproval ? "Approving..." : "Confirm & Approve"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AlumniLayout>
  );
}

export default Applications;