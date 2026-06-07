import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { toast } from "react-toastify";

function Applications() {
  const [applications, setApplications] = useState([]);

  const loadApplications = () => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    const allApplications =
      JSON.parse(localStorage.getItem("applications")) || [];

    const myApplications = allApplications.filter(
      (app) =>
        app.studentEmail === currentUser?.email
    );

    setApplications(myApplications);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const withdrawApplication = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to withdraw this application?"
    );

    if (!confirmDelete) return;

    const allApplications =
      JSON.parse(localStorage.getItem("applications")) || [];

    const updatedApplications =
      allApplications.filter(
        (app) => app.id !== id
      );

    localStorage.setItem(
      "applications",
      JSON.stringify(updatedApplications)
    );

    setApplications(
      applications.filter(
        (app) => app.id !== id
      )
    );

    toast.success(
      "Application Withdrawn Successfully ✅"
    );
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