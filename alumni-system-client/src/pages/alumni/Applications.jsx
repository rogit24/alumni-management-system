import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";

function Applications() {
  const [applications, setApplications] =
    useState([]);

  useEffect(() => {
    loadApplications();

    const interval = setInterval(() => {
      loadApplications();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadApplications = () => {
    const savedApplications =
      JSON.parse(
        localStorage.getItem("applications")
      ) || [];

    setApplications(savedApplications);
  };

  const updateStatus = (id, status) => {
    const updatedApplications =
      applications.map((app) =>
        app.id === id
          ? {
              ...app,
              status,
              updatedDate:
                new Date().toLocaleString(),
            }
          : app
      );

    setApplications(updatedApplications);

    localStorage.setItem(
      "applications",
      JSON.stringify(updatedApplications)
    );

    toast.success(
      `Application ${status} Successfully`
    );
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