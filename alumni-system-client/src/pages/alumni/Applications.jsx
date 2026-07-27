import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";
import { applications as applicationsApi, jobs as jobsService, auth } from "../../services/api";

function Applications() {
  const [applications, setApplications] =
    useState([]);

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
            let displayStatus = "Pending";
            if (app.status === "ACCEPTED") {
              displayStatus = "Approved";
            } else if (app.status === "REJECTED") {
              displayStatus = "Rejected";
            }
            return {
              id: app.id,
              jobId: job.id,
              jobTitle: job.title,
              company: job.company,
              salary: job.salary,
              studentName: studentUser ? studentUser.name : app.studentEmail,
              studentEmail: app.studentEmail,
              status: displayStatus,
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
      const backendStatus = status === "Approved" ? "ACCEPTED" : "REJECTED";
      await applicationsApi.updateStatus(id, backendStatus);
      toast.success(`Application ${status} Successfully 🎉`);
      loadApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update status ❌`);
    }
  };

  return (
    <AlumniLayout>

      <div className="container">

        <div className="d-flex justify-content-between align-items-center mb-4">

          <h2>Job Applications</h2>

          <button
            className="btn btn-primary"
            onClick={loadApplications}
          >
            Refresh
          </button>

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

              <h4>{app.jobTitle}</h4>

              <p>
                <strong>Company:</strong>{" "}
                {app.company}
              </p>

              <p>
                <strong>Student:</strong>{" "}
                {app.studentName}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {app.studentEmail}
              </p>

              <p>
                <strong>Applied Date:</strong>{" "}
                {app.appliedDate}
              </p>

              {app.updatedDate && (
                <p>
                  <strong>Updated:</strong>{" "}
                  {app.updatedDate}
                </p>
              )}

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

              {app.status === "Pending" && (

                <div className="d-flex gap-2">

                  <button
                    className="btn btn-success"
                    onClick={() =>
                      updateStatus(
                        app.id,
                        "Approved"
                      )
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      updateStatus(
                        app.id,
                        "Rejected"
                      )
                    }
                  >
                    Reject
                  </button>

                </div>

              )}

            </div>

          ))

        )}

      </div>

    </AlumniLayout>
  );
}

export default Applications;