import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("currentUser"));

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const updateNotificationCount = () => {
    const activeUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!activeUser) return;
    const allNotifications = JSON.parse(localStorage.getItem("notifications")) || [];
    const myNotifications = allNotifications.filter(
      (n) =>
        n &&
        n.userEmail?.trim().toLowerCase() === activeUser.email?.trim().toLowerCase()
    );
    setNotificationCount(myNotifications.length);
  };

  useEffect(() => {
    updateNotificationCount();
    const interval = setInterval(updateNotificationCount, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sidebar bg-dark text-white p-3 d-flex flex-column">
      <div className="mb-4 text-center py-2 border-bottom">
        <h3 className="logo-text m-0 d-flex align-items-center justify-content-center gap-2">
          <span>🎓</span> AlumniConnect
        </h3>
      </div>

      <div className="flex-grow-1">
        {user?.role?.toLowerCase() === "student" && (
          <>
            <Link className={`sidebar-link ${isActive("/student")}`} to="/student">
              <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </Link>

            <Link className={`sidebar-link ${isActive("/student/profile")}`} to="/student/profile">
              <i className="bi bi-person-circle me-2"></i> Profile
            </Link>

            <Link className={`sidebar-link ${isActive("/student/alumni-search")}`} to="/student/alumni-search">
              <i className="bi bi-search me-2"></i> Alumni Search
            </Link>

            <Link className={`sidebar-link ${isActive("/student/jobs")}`} to="/student/jobs">
              <i className="bi bi-briefcase me-2"></i> Jobs
            </Link>

            <Link className={`sidebar-link ${isActive("/student/applications")}`} to="/student/applications">
              <i className="bi bi-file-earmark-text me-2"></i> Applications
            </Link>

            <Link className={`sidebar-link ${isActive("/student/referrals")}`} to="/student/referrals">
              <i className="bi bi-award me-2"></i> Referrals
            </Link>

            <Link className={`sidebar-link ${isActive("/student/messages")}`} to="/student/messages">
              <i className="bi bi-chat-left-text me-2"></i> Messages
            </Link>

            <Link className={`sidebar-link ${isActive("/student/notifications")}`} to="/student/notifications">
              <i className="bi bi-bell me-2"></i> Notifications
              {notificationCount > 0 && (
                <span className="badge bg-danger rounded-pill ms-auto px-2 py-0.5 small" style={{ fontSize: '11px' }}>{notificationCount}</span>
              )}
            </Link>
          </>
        )}

        {user?.role?.toLowerCase() === "alumni" && (
          <>
            <Link className={`sidebar-link ${isActive("/alumni")}`} to="/alumni">
              <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </Link>

            <Link className={`sidebar-link ${isActive("/alumni/profile")}`} to="/alumni/profile">
              <i className="bi bi-person-circle me-2"></i> Profile
            </Link>

            <Link className={`sidebar-link ${isActive("/alumni/jobs")}`} to="/alumni/jobs">
              <i className="bi bi-briefcase me-2"></i> Job Management
            </Link>

            <Link className={`sidebar-link ${isActive("/alumni/applications")}`} to="/alumni/applications">
              <i className="bi bi-file-earmark-text me-2"></i> Applications
            </Link>

            <Link className={`sidebar-link ${isActive("/alumni/referrals")}`} to="/alumni/referrals">
              <i className="bi bi-award me-2"></i> Referrals
            </Link>

            <Link className={`sidebar-link ${isActive("/alumni/messages")}`} to="/alumni/messages">
              <i className="bi bi-chat-left-text me-2"></i> Messages
            </Link>

            <Link className={`sidebar-link ${isActive("/alumni/notifications")}`} to="/alumni/notifications">
              <i className="bi bi-bell me-2"></i> Notifications
              {notificationCount > 0 && (
                <span className="badge bg-danger rounded-pill ms-auto px-2 py-0.5 small" style={{ fontSize: '11px' }}>{notificationCount}</span>
              )}
            </Link>
          </>
        )}

        {user?.role?.toLowerCase() === "admin" && (
          <>
            <Link className={`sidebar-link ${isActive("/admin")}`} to="/admin">
              <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </Link>

            <Link className={`sidebar-link ${isActive("/admin/students")}`} to="/admin/students">
              <i className="bi bi-mortarboard me-2"></i> Students
            </Link>

            <Link className={`sidebar-link ${isActive("/admin/alumni")}`} to="/admin/alumni">
              <i className="bi bi-patch-check me-2"></i> Alumni
            </Link>

            <Link className={`sidebar-link ${isActive("/admin/users")}`} to="/admin/users">
              <i className="bi bi-people me-2"></i> Users
            </Link>

            <Link className={`sidebar-link ${isActive("/admin/reports")}`} to="/admin/reports">
              <i className="bi bi-graph-up me-2"></i> Reports
            </Link>
          </>
        )}
      </div>

      <button
        className="btn btn-outline-danger w-100 mt-4 d-flex align-items-center justify-content-center gap-2"
        style={{ borderRadius: '12px', padding: '10px', fontWeight: '600' }}
        onClick={logout}
      >
        <i className="bi bi-box-arrow-right"></i> Logout
      </button>
    </div>
  );
}

export default Sidebar;