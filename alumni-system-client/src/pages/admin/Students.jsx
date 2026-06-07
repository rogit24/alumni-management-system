import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";

function Students() {
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const filteredStudents = users.filter(
      (user) => user && user.role?.toLowerCase() === "student"
    );
    setStudents(filteredStudents);

    const apps = JSON.parse(localStorage.getItem("applications")) || [];
    setApplications(apps);

    const refs = JSON.parse(localStorage.getItem("referrals")) || [];
    setReferrals(refs);
  }, []);

  return (
    <AdminLayout>
      <div className="container-fluid py-2">
        <div className="mb-4">
          <h2 className="fw-bold text-dark">Students Registry</h2>
          <p className="text-muted">Monitor registered students, view their job applications and requested referrals</p>
        </div>

        {students.length === 0 ? (
          <div className="card shadow-sm p-5 text-center bg-white" style={{ borderRadius: '20px' }}>
            <i className="bi bi-mortarboard display-3 text-muted mb-3 d-block"></i>
            <h5>No Students Found</h5>
            <p className="text-muted mb-0">There are no student accounts registered in the database yet.</p>
          </div>
        ) : (
          <div className="row g-4">
            {students.map((student) => {
              const myApps = applications.filter((app) => app.studentEmail === student.email);
              const myRefs = referrals.filter((ref) => ref.studentEmail === student.email);

              return (
                <div className="col-12" key={student.id || student.email}>
                  <div className="card shadow-sm p-4 bg-white border-0" style={{ borderRadius: '20px' }}>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 flex-wrap gap-2">
                      <div>
                        <h4 className="fw-bold text-dark mb-1">{student.name}</h4>
                        <span className="text-muted"><i className="bi bi-envelope me-1"></i> {student.email}</span>
                      </div>
                      <span className="badge bg-primary-subtle text-primary px-3 py-1.5 rounded-pill fw-bold">
                        Student Account
                      </span>
                    </div>

                    <div className="row g-4">
                      {/* Job Applications column */}
                      <div className="col-md-6 border-end">
                        <h6 className="fw-bold text-dark mb-3 d-flex justify-content-between align-items-center">
                          <span>💼 Applications Submitted</span>
                          <span className="badge bg-secondary rounded-pill">{myApps.length}</span>
                        </h6>
                        {myApps.length === 0 ? (
                          <p className="text-muted small mb-0 py-2">No job applications submitted yet.</p>
                        ) : (
                          <div className="list-group list-group-flush" style={{ maxHeight: "250px", overflowY: "auto" }}>
                            {myApps.map((app) => (
                              <div className="list-group-item bg-transparent px-0 py-2 border-0 d-flex justify-content-between align-items-center" key={app.id}>
                                <div>
                                  <span className="fw-semibold text-dark d-block">Job ID: #{app.jobId}</span>
                                  <small className="text-muted">Status: {app.status}</small>
                                </div>
                                <span className={`badge px-2 py-1 ${
                                  app.status === 'Approved' || app.status === 'Accepted' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'
                                }`}>
                                  {app.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Referrals column */}
                      <div className="col-md-6">
                        <h6 className="fw-bold text-dark mb-3 d-flex justify-content-between align-items-center">
                          <span>🤝 Referral Requests</span>
                          <span className="badge bg-secondary rounded-pill">{myRefs.length}</span>
                        </h6>
                        {myRefs.length === 0 ? (
                          <p className="text-muted small mb-0 py-2">No referral requests created yet.</p>
                        ) : (
                          <div className="list-group list-group-flush" style={{ maxHeight: "250px", overflowY: "auto" }}>
                            {myRefs.map((ref) => (
                              <div className="list-group-item bg-transparent px-0 py-2 border-0 d-flex justify-content-between align-items-center" key={ref.id}>
                                <div>
                                  <span className="fw-semibold text-dark d-block">{ref.company}</span>
                                  <small className="text-muted">Alumni: {ref.alumniName || ref.alumniEmail}</small>
                                </div>
                                <span className={`badge px-2 py-1 ${
                                  ref.status === 'Approved' || ref.status === 'Accepted' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'
                                }`}>
                                  {ref.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default Students;