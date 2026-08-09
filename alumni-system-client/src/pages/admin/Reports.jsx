import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { auth, jobs as jobsApi, applications as applicationsApi, referrals as referralsApi } from "../../services/api";

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
    totalReferrals: 0,
    approvedReferrals: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [referralsList, setReferralsList] = useState([]);
  const [applicationsList, setApplicationsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search/Filter states
  const [userQuery, setUserQuery] = useState("");
  const [jobQuery, setJobQuery] = useState("");
  const [refQuery, setRefQuery] = useState("");

  const loadData = async () => {
    try {
      const users = await auth.getAllUsers();
      setUsersList(users);

      const jobs = await jobsApi.getAll();
      setJobsList(jobs);

      let applications = [];
      try {
        applications = await applicationsApi.getAll();
        setApplicationsList(applications);
      } catch (err) {
        console.error("Error loading applications:", err);
      }

      let referrals = [];
      try {
        referrals = await referralsApi.getAll();
      } catch (err) {
        console.error("Error loading referrals:", err);
      }

      const students = users.filter((u) => u && u.role?.toLowerCase() === "student");
      const alumni = users.filter((u) => u && u.role?.toLowerCase() === "alumni");
      const admins = users.filter((u) => u && u.role?.toLowerCase() === "admin");

      const pending = applications.filter((app) => app && app.status?.toUpperCase() === "PENDING");
      const approved = applications.filter((app) => app && (app.status?.toUpperCase() === "APPROVED" || app.status?.toUpperCase() === "ACCEPTED"));

      const appRefs = referrals.filter((ref) => ref && (ref.status?.toUpperCase() === "APPROVED" || ref.status?.toUpperCase() === "ACCEPTED"));

      setReport({
        totalUsers: users.length,
        studentCount: students.length,
        alumniCount: alumni.length,
        adminCount: admins.length,
        totalJobs: jobs.length,
        totalApps: applications.length,
        pendingApps: pending.length,
        approvedApps: approved.length,
        totalReferrals: referrals.length,
        approvedReferrals: appRefs.length,
      });

      // Map referrals to resolve actual names from users list
      const resolvedReferrals = referrals.map(ref => {
        const studentUser = users.find(u => u.id === ref.studentId);
        const alumniUser = users.find(u => u.id === ref.alumniId);
        return {
          ...ref,
          studentName: studentUser ? studentUser.name : `Student #${ref.studentId}`,
          studentEmail: studentUser ? studentUser.email : "N/A",
          alumniName: alumniUser ? alumniUser.name : `Alumni #${ref.alumniId}`,
          alumniEmail: alumniUser ? alumniUser.email : "N/A",
        };
      });
      setReferralsList(resolvedReferrals);

      setRecentUsers(users.slice(-5).reverse());
    } catch (err) {
      console.error("Error loading report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered lists based on search inputs
  const filteredRecentUsers = recentUsers.filter(u => 
    u.name?.toLowerCase().includes(userQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(userQuery.toLowerCase())
  );

  const filteredJobs = jobsList.filter(j => 
    j.title?.toLowerCase().includes(jobQuery.toLowerCase()) || 
    j.company?.toLowerCase().includes(jobQuery.toLowerCase())
  );

  const filteredRefs = referralsList.filter(r => 
    r.studentName?.toLowerCase().includes(refQuery.toLowerCase()) || 
    r.company?.toLowerCase().includes(refQuery.toLowerCase()) || 
    r.alumniName?.toLowerCase().includes(refQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="container-fluid py-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        
        {/* Top Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold text-dark m-0">Portal Operations & Analytics Report</h2>
            <p className="text-muted m-0">Dynamic industry-standard evaluation metrics and audit logs</p>
          </div>
          <button
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4 py-2"
            onClick={() => window.print()}
            style={{ borderRadius: "8px" }}
          >
            🖨️ Export Audit Report
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Aggregating platform reports...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards Row */}
            <div className="row g-4 mb-4">
              
              {/* Demographics Card */}
              <div className="col-lg-4 col-md-6">
                <div 
                  className="card border-0 rounded-4 shadow-sm p-4 bg-white border-start border-primary border-4 position-relative"
                  style={{ transition: "transform 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span className="text-muted text-uppercase small fw-bold tracking-wider">User Demographics</span>
                  <div className="d-flex justify-content-between align-items-baseline my-2">
                    <h1 className="display-5 fw-bold text-dark mb-0">{report.totalUsers}</h1>
                    <span className="text-primary fw-semibold small">Active Profiles</span>
                  </div>
                  <div className="row text-secondary small pt-2 border-top g-0 mt-2">
                    <div className="col-6">🎓 Students: <strong>{report.studentCount}</strong></div>
                    <div className="col-6 text-end">🏆 Alumni: <strong>{report.alumniCount}</strong></div>
                  </div>
                </div>
              </div>

              {/* Jobs Card */}
              <div className="col-lg-4 col-md-6">
                <div 
                  className="card border-0 rounded-4 shadow-sm p-4 bg-white border-start border-success border-4 position-relative"
                  style={{ transition: "transform 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span className="text-muted text-uppercase small fw-bold tracking-wider">Marketplace Activity</span>
                  <div className="d-flex justify-content-between align-items-baseline my-2">
                    <h1 className="display-5 fw-bold text-dark mb-0">{report.totalJobs}</h1>
                    <span className="text-success fw-semibold small">Total Listings</span>
                  </div>
                  <div className="row text-secondary small pt-2 border-top g-0 mt-2">
                    <div className="col-6">💼 Total Apps: <strong>{report.totalApps}</strong></div>
                    <div className="col-6 text-end text-success">Approved: <strong>{report.approvedApps}</strong></div>
                  </div>
                </div>
              </div>

              {/* Referrals Card */}
              <div className="col-lg-4 col-md-6">
                <div 
                  className="card border-0 rounded-4 shadow-sm p-4 bg-white border-start border-warning border-4 position-relative"
                  style={{ transition: "transform 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <span className="text-muted text-uppercase small fw-bold tracking-wider">Referral Funnel</span>
                  <div className="d-flex justify-content-between align-items-baseline my-2">
                    <h1 className="display-5 fw-bold text-dark mb-0">{report.totalReferrals}</h1>
                    <span className="text-warning fw-semibold small">Requests Created</span>
                  </div>
                  <div className="row text-secondary small pt-2 border-top g-0 mt-2">
                    <div className="col-6">🤝 Completed: <strong>{report.approvedReferrals}</strong></div>
                    <div className="col-6 text-end">Pending: <strong>{report.totalReferrals - report.approvedReferrals}</strong></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Distribution and Recent Users Row */}
            <div className="row g-4 mb-4">
              
              {/* Ratios Distribution */}
              <div className="col-lg-5 col-12">
                <div className="card border-0 rounded-4 shadow-sm h-100 bg-white p-4">
                  <h5 className="fw-bold text-dark mb-3">Portal Profile Segments</h5>
                  <p className="text-muted small mb-4">Visual breakdown of user demographics registered in UserService.</p>
                  
                  {/* Student Ratio */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold text-secondary">Academic Students</span>
                      <span className="fw-bold text-dark">
                        {report.studentCount} ({report.totalUsers > 0 ? ((report.studentCount / report.totalUsers) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: "10px" }}>
                      <div
                        className="progress-bar bg-primary rounded-pill"
                        style={{ width: report.totalUsers > 0 ? `${(report.studentCount / report.totalUsers) * 100}%` : "0%" }}
                      ></div>
                    </div>
                  </div>

                  {/* Alumni Ratio */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold text-secondary">Global Alumni Partners</span>
                      <span className="fw-bold text-dark">
                        {report.alumniCount} ({report.totalUsers > 0 ? ((report.alumniCount / report.totalUsers) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: "10px" }}>
                      <div
                        className="progress-bar bg-purple rounded-pill"
                        style={{ width: report.totalUsers > 0 ? `${(report.alumniCount / report.totalUsers) * 100}%` : "0%", backgroundColor: "#8b5cf6" }}
                      ></div>
                    </div>
                  </div>

                  {/* Admin Ratio */}
                  <div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold text-secondary">System Administrators</span>
                      <span className="fw-bold text-dark">
                        {report.adminCount} ({report.totalUsers > 0 ? ((report.adminCount / report.totalUsers) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: "10px" }}>
                      <div
                        className="progress-bar bg-secondary rounded-pill"
                        style={{ width: report.totalUsers > 0 ? `${(report.adminCount / report.totalUsers) * 100}%` : "0%" }}
                      ></div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Recent Users Table */}
              <div className="col-lg-7 col-12">
                <div className="card border-0 rounded-4 shadow-sm h-100 bg-white p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h5 className="fw-bold text-dark mb-0">Recent User Registrations</h5>
                    <input 
                      type="text" 
                      placeholder="Search recent users..." 
                      className="form-control form-control-sm w-auto"
                      value={userQuery}
                      onChange={e => setUserQuery(e.target.value)}
                    />
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light text-uppercase small text-secondary" style={{ fontSize: "0.75rem" }}>
                        <tr>
                          <th className="border-0">User Name</th>
                          <th className="border-0">Email</th>
                          <th className="border-0 text-end">Role</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "0.88rem" }}>
                        {filteredRecentUsers.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="text-center py-4 text-muted">No recent users found</td>
                          </tr>
                        ) : (
                          filteredRecentUsers.map((user, idx) => (
                            <tr key={user.id || idx}>
                              <td className="fw-bold text-dark">{user.name}</td>
                              <td className="text-muted">{user.email}</td>
                              <td className="text-end">
                                <span className={`badge px-2.5 py-1.5 rounded-pill fw-bold ${
                                  user.role?.toLowerCase() === 'admin' ? 'bg-danger-subtle text-danger' :
                                  user.role?.toLowerCase() === 'alumni' ? 'bg-purple-subtle text-purple' : 'bg-primary-subtle text-primary'
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

            {/* Jobs Directory Section */}
            <div className="card border-0 rounded-4 shadow-sm mb-4 bg-white p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold text-dark mb-0">Active Job Postings</h5>
                  <p className="text-muted small mb-0">List of all active opportunities managed in JobMS.</p>
                </div>
                <input 
                  type="text" 
                  placeholder="Search jobs/companies..." 
                  className="form-control form-control-sm w-auto"
                  value={jobQuery}
                  onChange={e => setJobQuery(e.target.value)}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-uppercase small text-secondary" style={{ fontSize: "0.75rem" }}>
                    <tr>
                      <th className="border-0">Job ID</th>
                      <th className="border-0">Title</th>
                      <th className="border-0">Company</th>
                      <th className="border-0 text-end">Posted By</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: "0.88rem" }}>
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">No active postings recorded</td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => (
                        <tr key={job.id}>
                          <td className="fw-bold text-slate-500">#{job.id}</td>
                          <td className="fw-semibold text-primary">{job.title}</td>
                          <td><span className="badge bg-light text-dark border">{job.company}</span></td>
                          <td className="text-end text-muted">{job.postedByEmail || "System Administrator"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Referrals Pipeline Tracker */}
            <div className="card border-0 rounded-4 shadow-sm bg-white p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h5 className="fw-bold text-dark mb-0">Referral Connection Funnel</h5>
                  <p className="text-muted small mb-0">Real-time referral requests mapped from database records.</p>
                </div>
                <input 
                  type="text" 
                  placeholder="Search student/alumni/company..." 
                  className="form-control form-control-sm w-auto"
                  value={refQuery}
                  onChange={e => setRefQuery(e.target.value)}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-uppercase small text-secondary" style={{ fontSize: "0.75rem" }}>
                    <tr>
                      <th className="border-0">Referral ID</th>
                      <th className="border-0">Student Name</th>
                      <th className="border-0">Target Company</th>
                      <th className="border-0">Alumni Endorser</th>
                      <th className="border-0">Request Date</th>
                      <th className="border-0 text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: "0.88rem" }}>
                    {filteredRefs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">No referral connections recorded</td>
                      </tr>
                    ) : (
                      filteredRefs.map((ref) => (
                        <tr key={ref.id}>
                          <td className="fw-bold text-slate-500">#{ref.id}</td>
                          <td className="fw-semibold text-dark">{ref.studentName}</td>
                          <td><span className="badge bg-light text-dark border">{ref.company}</span></td>
                          <td>{ref.alumniName}</td>
                          <td>{ref.requestDate || "N/A"}</td>
                          <td className="text-end">
                            <span className={`badge px-2.5 py-1.5 rounded-pill fw-bold ${
                              ref.status?.toUpperCase() === 'APPROVED' || ref.status?.toUpperCase() === 'ACCEPTED' 
                                ? 'bg-success-subtle text-success' 
                                : 'bg-warning-subtle text-warning'
                            }`}>
                              {ref.status || "PENDING"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default Reports;