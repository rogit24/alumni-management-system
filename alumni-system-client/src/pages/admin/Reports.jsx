import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";

function Reports() {
  const [report, setReport] = useState({
    totalUsers: 0,
    studentCount: 0,
    alumniCount: 0,
    adminCount: 0,
    totalJobs: 0,
    totalApps: 0,
    pendingApps: 0,
    approvedApps: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    // Read the single source of truth database collections
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
    const applications = JSON.parse(localStorage.getItem("applications")) || [];

    // Derive deeper analytic metrics
    const students = users.filter((u) => u && u.role === "student");
    const alumni = users.filter((u) => u && u.role === "alumni");
    const admins = users.filter((u) => u && u.role === "admin");

    const pending = applications.filter((app) => app && app.status === "Pending");
    const approved = applications.filter((app) => app && (app.status === "Approved" || app.status === "Accepted"));

    setReport({
      totalUsers: users.length,
      studentCount: students.length,
      alumniCount: alumni.length,
      adminCount: admins.length,
      totalJobs: jobs.length,
      totalApps: applications.length,
      pendingApps: pending.length,
      approvedApps: approved.length,
    });

    // Take the last 5 registered users for a summary feed table
    setRecentUsers(users.slice(-5).reverse());
  }, []);

  return (
    <AdminLayout>
      <div className="container-fluid py-2">
        {/* Header section */}
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <div>
            <h2 className="fw-bold text-dark m-0">System Analytics & Reports</h2>
            <p className="text-muted m-0">Comprehensive evaluation metrics overview</p>
          </div>
          <button
            className="btn btn-primary shadow-sm"
            onClick={() => window.print()}
          >
            🖨️ Export Report
          </button>
        </div>

        {/* Row 1: Core High-Level Counters */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm p-4 border-start border-primary border-4 bg-white">
              <span className="text-muted text-uppercase small fw-bold">User Database</span>
              <h1 className="display-5 fw-bold text-dark my-2">{report.totalUsers}</h1>
              <div className="row text-muted small pt-1 border-top g-0">
                <div className="col-6">Graduates: <strong>{report.alumniCount}</strong></div>
                <div className="col-6 text-end">Students: <strong>{report.studentCount}</strong></div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm p-4 border-start border-success border-4 bg-white">
              <span className="text-muted text-uppercase small fw-bold">Marketplace Postings</span>
              <h1 className="display-5 fw-bold text-dark my-2">{report.totalJobs}</h1>
              <div className="row text-muted small pt-1 border-top g-0">
                <div className="col-6">Active Jobs: <strong>{report.totalJobs}</strong></div>
                <div className="col-6 text-end">Companies: <strong>{report.totalJobs > 0 ? 1 : 0}</strong></div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm p-4 border-start border-warning border-4 bg-white">
              <span className="text-muted text-uppercase small fw-bold">Hiring Funnel</span>
              <h1 className="display-5 fw-bold text-dark my-2">{report.totalApps}</h1>
              <div className="row text-muted small pt-1 border-top g-0">
                <div className="col-6">Pending: <strong className="text-warning">{report.pendingApps}</strong></div>
                <div className="col-6 text-end">Approved: <strong className="text-success">{report.approvedApps}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Deep Metric Cards and Lists */}
        <div className="row g-4 mb-4">
          {/* Detailed Breakdown Card */}
          <div className="col-lg-5">
            <div className="card shadow-sm h-100 bg-white">
              <div className="card-header bg-transparent fw-bold text-dark border-0 pt-4 px-4">
                System Ratios Breakdown
              </div>
              <div className="card-body px-4 pb-4">
                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Engineering Students</span>
                    <span className="fw-bold">{report.studentCount} Profiles</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-info"
                      style={{ width: report.totalUsers > 0 ? `${(report.studentCount / report.totalUsers) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Verified Global Alumni</span>
                    <span className="fw-bold">{report.alumniCount} Profiles</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-purple"
                      style={{ width: report.totalUsers > 0 ? `${(report.alumniCount / report.totalUsers) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>System Administration</span>
                    <span className="fw-bold">{report.adminCount} Profiles</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-secondary"
                      style={{ width: report.totalUsers > 0 ? `${(report.adminCount / report.totalUsers) * 100}%` : "0%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Feed Table */}
          <div className="col-lg-7">
            <div className="card shadow-sm h-100 bg-white">
              <div className="card-header bg-transparent fw-bold text-dark border-0 pt-4 px-4">
                Recent Registry Log Entries
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 custom-table">
                    <thead className="table-light small text-uppercase">
                      <tr>
                        <th className="ps-4">User Name</th>
                        <th>Email Account</th>
                        <th className="pe-4">System Role</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {recentUsers.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center py-4 text-muted">No audit trails available</td>
                        </tr>
                      ) : (
                        recentUsers.map((user, idx) => (
                          <tr key={user.id || idx}>
                            <td className="ps-4 fw-semibold text-dark">{user.name || "N/A"}</td>
                            <td className="text-muted">{user.email}</td>
                            <td className="pe-4">
                              <span className={`badge px-2 py-1 rounded-pill ${user.role === 'admin' ? 'bg-danger-subtle text-danger' :
                                user.role === 'alumni' ? 'bg-purple-subtle text-purple' : 'bg-info-subtle text-info'
                                }`}>
                                {user.role}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default Reports;