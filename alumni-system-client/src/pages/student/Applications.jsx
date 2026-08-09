import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { toast } from "react-toastify";
import { applications as applicationsApi, jobs as jobsService, auth, profiles } from "../../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    try {
      const apps = await applicationsApi.getMyApplications();
      const jobsList = await jobsService.getAll();
      const allUsers = await auth.getAllUsers();
      
      const resolvedApps = [];
      for (const app of apps) {
        const matchingJob = jobsList.find(j => j.id === app.jobId);
        let alumniPhoto = "";
        let alumniName = "";
        
        if (matchingJob) {
          const alumniUser = allUsers.find(u => u.email === matchingJob.postedByEmail);
          if (alumniUser) {
            alumniName = alumniUser.name;
            try {
              const profileData = await profiles.getByUserId(alumniUser.id);
              alumniPhoto = profileData.profilePicture || "";
            } catch (e) {
              // ignore
            }
          }
        }
        resolvedApps.push({
          id: app.id,
          jobTitle: matchingJob ? matchingJob.title : `Job #${app.jobId}`,
          company: matchingJob ? matchingJob.company : "N/A",
          salary: matchingJob ? matchingJob.salary : "N/A",
          status: app.status ? (app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase()) : "Pending",
          appliedDate: app.appliedDate || "N/A",
          alumniPhoto,
          alumniName: alumniName || "Alumni Poster"
        });
      }

      setApplications(resolvedApps);
    } catch (error) {
      toast.error("Failed to load applications from backend ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const withdrawApplication = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to withdraw this application?"
    );

    if (!confirmDelete) return;

    try {
      await applicationsApi.withdraw(id);
      toast.success("Application Withdrawn Successfully 🎉");
      loadApplications();
    } catch (error) {
      toast.error("Failed to withdraw application ❌");
    }
  };

  return (
    <StudentLayout>
      <div className="container py-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-light-subtle">
          <div>
            <h2 className="fw-bold mb-1 text-dark">💼 My Job Applications</h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>Track the recruitment status of your job requests.</p>
          </div>
          <span className="badge bg-primary fs-6 py-2 px-3 rounded-pill">
            Total: {applications.length}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading application logs...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="card shadow-sm p-5 text-center border-0 text-dark rounded-4 bg-white">
            <h5 className="fw-bold mb-2">No Applications Found</h5>
            <p className="text-secondary mb-0">Apply to posted jobs to see requests tracked here.</p>
          </div>
        ) : (
          applications.map((app) => (
            <div className="card border-0 rounded-4 shadow-sm p-4 mb-3 bg-white text-dark" key={app.id}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                <div className="d-flex align-items-center gap-3">
                  <img
                    src={app.alumniPhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt={app.alumniName}
                    className="rounded-circle border shadow-sm"
                    style={{ width: "45px", height: "45px", objectFit: "cover" }}
                  />
                  <div>
                    <h4 className="fw-bold mb-1 text-dark" style={{ fontSize: "1.1rem" }}>{app.jobTitle}</h4>
                    <span className="small text-muted">🏢 {app.company} | Poster: {app.alumniName}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-4 flex-wrap">
                  <div style={{ fontSize: "0.9rem" }}>
                    <p className="mb-1"><strong>💰 Salary:</strong> <span className="text-secondary">{app.salary}</span></p>
                    <p className="mb-0"><strong>📅 Date:</strong> <span className="text-secondary">{app.appliedDate}</span></p>
                  </div>
                  <div>
                    <span
                      className={`badge px-3 py-1.5 rounded-pill ${
                        app.status === "Approved" || app.status === "Accepted"
                          ? "bg-success"
                          : app.status === "Rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  {app.status === "Pending" && (
                    <button
                      className="btn btn-outline-danger px-3 py-1.5 rounded-pill fw-bold"
                      onClick={() => withdrawApplication(app.id)}
                    >
                      Withdraw
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </StudentLayout>
  );
}

export default Applications;