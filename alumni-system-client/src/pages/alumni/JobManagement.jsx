import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";
import { jobs as jobsService } from "../../services/api";

function JobManagement() {
  const [jobs, setJobs] = useState([]);

  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
    jobType: "",
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    try {
      const data = await jobsService.getAll();
      const myJobs = data.filter(
        (job) =>
          job.postedByEmail === currentUser?.email
      );
      setJobs(myJobs);
    } catch (error) {
      toast.error("Failed to load jobs from backend ❌");
    }
  };

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
  };

  const addJob = async () => {
    if (
      !jobData.title ||
      !jobData.company ||
      !jobData.location ||
      !jobData.salary ||
      !jobData.description ||
      !jobData.jobType
    ) {
      toast.error("Please Fill All Fields");
      return;
    }

    try {
      await jobsService.create(jobData);

      setJobData({
        title: "",
        company: "",
        location: "",
        salary: "",
        description: "",
        jobType: "",
      });

      await loadJobs();

      toast.success("Job Posted Successfully");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to post job ❌";
      toast.error(errMsg);
    }
  };

  const deleteJob = async (id) => {
    try {
      await jobsService.delete(id);
      await loadJobs();
      toast.error("Job Deleted Successfully");
    } catch (error) {
      toast.error("Failed to delete job ❌");
    }
  };

  return (
    <AlumniLayout>
      <div className="container">

        <div className="card shadow p-4 mb-4">
          <h2 className="mb-4">
            Post New Job
          </h2>

          <input
            type="text"
            name="title"
            className="form-control mb-3"
            placeholder="Job Title"
            value={jobData.title}
            onChange={handleChange}
          />

          <input
            type="text"
            name="company"
            className="form-control mb-3"
            placeholder="Company Name"
            value={jobData.company}
            onChange={handleChange}
          />

          <input
            type="text"
            name="location"
            className="form-control mb-3"
            placeholder="Location"
            value={jobData.location}
            onChange={handleChange}
          />

          <input
            type="text"
            name="salary"
            className="form-control mb-3"
            placeholder="Salary Package"
            value={jobData.salary}
            onChange={handleChange}
          />

          <textarea
            name="description"
            className="form-control mb-3"
            rows="4"
            placeholder="Job Description"
            value={jobData.description}
            onChange={handleChange}
          />

          <select
            name="jobType"
            className="form-control mb-3"
            value={jobData.jobType}
            onChange={handleChange}
          >
            <option value="">
              Select Job Type
            </option>

            <option value="Internship">
              Internship
            </option>

            <option value="Full Time">
              Full Time
            </option>
          </select>

          <button
            className="btn btn-success"
            onClick={addJob}
          >
            Post Job
          </button>
        </div>

        <div className="row">

          {jobs.length === 0 ? (
            <div className="col-12">
              <div className="card p-4 text-center">
                <h5>No Jobs Posted Yet</h5>
              </div>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                className="col-md-6 mb-4"
                key={job.id}
              >
                <div className="card shadow p-4 h-100">

                  <h4>{job.title}</h4>

                  <p>
                    <strong>Company:</strong>{" "}
                    {job.company}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {job.location}
                  </p>

                  <p>
                    <strong>Salary:</strong>{" "}
                    {job.salary}
                  </p>

                  <p>
                    <strong>Type:</strong>{" "}
                    {job.jobType}
                  </p>

                  <p>
                    <strong>Description:</strong>{" "}
                    {job.description}
                  </p>

                  <p>
                    <strong>Posted:</strong>{" "}
                    {job.postedDate}
                  </p>

                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      deleteJob(job.id)
                    }
                  >
                    Delete Job
                  </button>

                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </AlumniLayout>
  );
}

export default JobManagement;