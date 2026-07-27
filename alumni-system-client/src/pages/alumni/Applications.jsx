import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";
import { applications as applicationsApi, jobs as jobsService, auth } from "../../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [draggedOverCol, setDraggedOverCol] = useState(null);

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
    try {
      await applicationsApi.updateStatus(id, status);
      toast.success(`Application updated to ${status} Successfully 🎉`);
      loadApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update status ❌`);
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
                              <p className="mb-0 text-secondary" style={{ fontSize: "0.75rem" }}>📅 {app.appliedDate}</p>
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
      </div>
    </AlumniLayout>
  );
}

export default Applications;