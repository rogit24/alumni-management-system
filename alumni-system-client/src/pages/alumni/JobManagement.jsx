import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";

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

  const loadJobs = () => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    const savedJobs =
      JSON.parse(localStorage.getItem("jobs")) || [];

    const myJobs = savedJobs.filter(
      (job) =>
        job.postedByEmail === currentUser?.email
    );

    setJobs(myJobs);
  };

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
  };

  const addJob = () => {
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

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    const allJobs =
      JSON.parse(localStorage.getItem("jobs")) || [];

    const newJob = {
      id: Date.now(),
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      salary: jobData.salary,
      description: jobData.description,
      jobType: jobData.jobType,
      postedBy: currentUser?.name,
      postedByEmail: currentUser?.email,
      postedDate:
        new Date().toLocaleDateString(),
    };

    const updatedJobs = [
      ...allJobs,
      newJob,
    ];

    localStorage.setItem(
      "jobs",
      JSON.stringify(updatedJobs)
    );

    // Student Notifications
    const notifications =
      JSON.parse(
        localStorage.getItem("notifications")
      ) || [];

    const users =
      JSON.parse(
        localStorage.getItem("users")
      ) || [];

    users
      .filter(
        (user) =>
          user.role?.toLowerCase() === "student"
      )
      .forEach((student) => {
        notifications.push({
          id:
            Date.now() +
            Math.floor(
              Math.random() * 1000
            ),
          userEmail: student.email,
          message: `New Job Posted: ${jobData.title} at ${jobData.company}`,
          date: new Date().toLocaleString(),
        });
      });

    localStorage.setItem(
      "notifications",
      JSON.stringify(notifications)
    );

    setJobData({
      title: "",
      company: "",
      location: "",
      salary: "",
      description: "",
      jobType: "",
    });

    loadJobs();

    toast.success("Job Posted Successfully");
  };

  const deleteJob = (id) => {
    const allJobs =
      JSON.parse(localStorage.getItem("jobs")) || [];

    const updatedJobs = allJobs.filter(
      (job) => job.id !== id
    );

    localStorage.setItem(
      "jobs",
      JSON.stringify(updatedJobs)
    );

    loadJobs();

    toast.error("Job Deleted Successfully");
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