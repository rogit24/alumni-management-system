import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { auth, jobs as jobsApi } from "../../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    alumni: 0,
    admins: 0,
    jobs: 0,
    applications: 0,
    referrals: 0,
    messages: 0,
  });

  const loadDashboard = async () => {
    try {
      const users = await auth.getAllUsers();
      const jobs = await jobsApi.getAll();
      const applications = JSON.parse(localStorage.getItem("applications")) || [];
      const referrals = JSON.parse(localStorage.getItem("referrals")) || [];
      const messages = JSON.parse(localStorage.getItem("messages")) || [];

      setStats({
        users: users.length,
        students: users.filter((u) => u.role?.toLowerCase() === "student").length,
        alumni: users.filter((u) => u.role?.toLowerCase() === "alumni").length,
        admins: users.filter((u) => u.role?.toLowerCase() === "admin").length,
        jobs: jobs.length,
        applications: applications.length,
        referrals: referrals.length,
        messages: messages.length,
      });
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    }
  };

  useEffect(() => {
    loadDashboard();

    // Data consistency ke liye polling chalne dete hain
    const interval = setInterval(() => {
      loadDashboard();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="mb-4">
          <h2 className="fw-bold">Admin Dashboard</h2>
          <p className="text-muted">
            Monitor complete portal statistics loaded from source data
          </p>
        </div>

        <div className="row g-4">
          
          <div className="col-md-3">
            <div className="dashboard-card card-blue p-4 shadow-sm rounded">
              <div className="card-icon">👥</div>
              <div className="card-number">{stats.users}</div>
              <div className="card-title">Total Users</div>
            </div>
          </div>

          
          <div className="col-md-3">
            <div className="dashboard-card card-green p-4 shadow-sm rounded">
              <div className="card-icon">🎓</div>
              <div className="card-number">{stats.students}</div>
              <div className="card-title">Students</div>
            </div>
          </div>

         
          <div className="col-md-3">
            <div className="dashboard-card card-purple p-4 shadow-sm rounded">
              <div className="card-icon">🏆</div>
              <div className="card-number">{stats.alumni}</div>
              <div className="card-title">Alumni</div>
            </div>
          </div>

          
          <div className="col-md-3">
            <div className="dashboard-card card-orange p-4 shadow-sm rounded">
              <div className="card-icon">🛡️</div>
              <div className="card-number">{stats.admins}</div>
              <div className="card-title">Admins</div>
            </div>
          </div>

          
          <div className="col-md-3">
            <div className="dashboard-card card-cyan p-4 shadow-sm rounded">
              <div className="card-icon">💼</div>
              <div className="card-number">{stats.jobs}</div>
              <div className="card-title">Jobs Posted</div>
            </div>
          </div>

          
          <div className="col-md-3">
            <div className="dashboard-card card-red p-4 shadow-sm rounded">
              <div className="card-icon">📄</div>
              <div className="card-number">{stats.applications}</div>
              <div className="card-title">Applications</div>
            </div>
          </div>

         
          <div className="col-md-3">
            <div className="dashboard-card card-green p-4 shadow-sm rounded">
              <div className="card-icon">🤝</div>
              <div className="card-number">{stats.referrals}</div>
              <div className="card-title">Referrals</div>
            </div>
          </div>

          
          <div className="col-md-3">
            <div className="dashboard-card card-purple p-4 shadow-sm rounded">
              <div className="card-icon">💬</div>
              <div className="card-number">{stats.messages}</div>
              <div className="card-title">Messages</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;