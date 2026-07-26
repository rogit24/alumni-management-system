import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { toast } from "react-toastify";
import { jobs as jobsService } from "../../services/api";

function Jobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobsService.getAll();
        setJobs(data);
      } catch (error) {
        toast.error("Failed to load jobs from backend ❌");
      }
    };
    fetchJobs();
  }, []);

  const applyJob = (job) => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    const applications =
      JSON.parse(localStorage.getItem("applications")) || [];

    const alreadyApplied = applications.find(
      (app) =>
        app.jobId === job.id &&
        app.studentEmail === currentUser?.email
    );

    if (alreadyApplied) {
      toast.warning(
        "You have already applied for this job"
      );
      return;
    }

    const newApplication = {
      id: Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      salary: job.salary,

      studentName:
        currentUser?.name || "Student",

      studentEmail:
        currentUser?.email || "",

      status: "Pending",

      appliedDate:
        new Date().toLocaleDateString(),
    };

    const updatedApplications = [
      ...applications,
      newApplication,
    ];

    localStorage.setItem(
      "applications",
      JSON.stringify(updatedApplications)
    );

    toast.success(
      `Successfully applied for ${job.title}`
    );
  };

  return (
    <StudentLayout>
      <div className="container">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Available Jobs</h2>

          <span className="badge bg-primary fs-6">
            Total Jobs: {jobs.length}
          </span>
        </div>

        {jobs.length === 0 ? (
          <div className="card shadow p-4 text-center">
            <h5>No Jobs Available</h5>
            <p>
              Alumni have not posted any jobs yet.
            </p>
          </div>
        ) : (
          <div className="row">

            {jobs.map((job) => (
              <div
                className="col-lg-6 mb-4"
                key={job.id}
              >
                <div className="card shadow border-0 h-100">

                  <div className="card-body">

                    <h4 className="mb-3">
                      {job.title}
                    </h4>

                    <p>
                      <strong>Company:</strong>{" "}
                      {job.company}
                    </p>

                    <p>
                      <strong>Salary:</strong>{" "}
                      {job.salary}
                    </p>

                    {job.location && (
                      <p>
                        <strong>Location:</strong>{" "}
                        {job.location}
                      </p>
                    )}

                    {job.description && (
                      <p>
                        <strong>Description:</strong>{" "}
                        {job.description}
                      </p>
                    )}

                    <button
                      className="btn btn-success w-100"
                      onClick={() =>
                        applyJob(job)
                      }
                    >
                      Apply Now
                    </button>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </StudentLayout>
  );
}

export default Jobs;