import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";

function Reports() {

  const [report, setReport] =
    useState({
      users: 0,
      jobs: 0,
      applications: 0,
    });

  useEffect(() => {

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const jobs =
      JSON.parse(localStorage.getItem("jobs")) || [];

    const applications =
      JSON.parse(
        localStorage.getItem("applications")
      ) || [];

    setReport({
      users: users.length,
      jobs: jobs.length,
      applications: applications.length,
    });

  }, []);

  return (
    <AdminLayout>

      <div className="container">

        <h2 className="mb-4">
          Reports
        </h2>

        <div className="row">

          <div className="col-md-4">
            <div className="card shadow p-4 text-center">
              <h3>{report.users}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow p-4 text-center">
              <h3>{report.jobs}</h3>
              <p>Total Jobs</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow p-4 text-center">
              <h3>{report.applications}</h3>
              <p>Total Applications</p>
            </div>
          </div>

        </div>

      </div>

    </AdminLayout>
  );
}

export default Reports;