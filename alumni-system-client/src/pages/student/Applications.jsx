import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { toast } from "react-toastify";
import { applications as applicationsApi, jobs as jobsService } from "../../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);

  const loadApplications = async () => {
    try {
      const apps = await applicationsApi.getMyApplications();
      const jobsList = await jobsService.getAll();
      
      const resolvedApps = apps.map(app => {
        const matchingJob = jobsList.find(j => j.id === app.jobId);
        return {
          id: app.id,
          jobTitle: matchingJob ? matchingJob.title : `Job #${app.jobId}`,
          company: matchingJob ? matchingJob.company : "N/A",
          salary: matchingJob ? matchingJob.salary : "N/A",
          status: app.status ? (app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase()) : "Pending",
          appliedDate: app.appliedDate || "N/A",
        };
      });

      setApplications(resolvedApps);
    } catch (error) {
      toast.error("Failed to load applications from backend ❌");
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
      <div className="container">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">
            My Applications
          </h2>

          <span className="badge bg-primary fs-6">
            {applications.length}
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="card shadow p-5 text-center">
            <h5>No Applications Found</h5>
          </div>
        ) : (
          applications.map((app) => (
            <div
              className="card shadow border-0 p-4 mb-3"
              key={app.id}
            >
              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <h4 className="mb-2">
                    {app.jobTitle}
                  </h4>

                  <p>
                    <strong>Company:</strong>{" "}
                    {app.company}
                  </p>

                  <p>
                    <strong>Salary:</strong>{" "}
                    {app.salary}
                  </p>

                  <p>
                    <strong>Applied Date:</strong>{" "}
                    {app.appliedDate}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        app.status === "Approved"
                          ? "badge bg-success"
                          : app.status === "Rejected"
                          ? "badge bg-danger"
                          : "badge bg-warning text-dark"
                      }
                    >
                      {app.status}
                    </span>
                  </p>
                </div>

                <div>
                  {app.status === "Pending" && (
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        withdrawApplication(app.id)
                      }
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