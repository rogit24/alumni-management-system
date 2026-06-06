import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("currentUser"));

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  return (
    <div
      className="sidebar bg-dark text-white p-3"
    >
      <h3 className="mb-4">
        Alumni Portal
      </h3>

      {user?.role === "student" && (
        <>
          <Link className="sidebar-link" to="/student">
            Dashboard
          </Link>

          <Link className="sidebar-link" to="/student/profile">
            Profile
          </Link>

          <Link className="sidebar-link" to="/student/alumni-search">
            Alumni Search
          </Link>

          <Link className="sidebar-link" to="/student/jobs">
            Jobs
          </Link>

          <Link className="sidebar-link" to="/student/applications">
            Applications
          </Link>

          <Link className="sidebar-link" to="/student/referrals">
            Referrals
          </Link>

          <Link className="sidebar-link" to="/student/messages">
            Messages
          </Link>

          <Link className="sidebar-link" to="/student/notifications">
            Notifications
          </Link>
        </>
      )}

      {user?.role === "alumni" && (
        <>
          <Link className="sidebar-link" to="/alumni">
            Dashboard
          </Link>

          <Link className="sidebar-link" to="/alumni/profile">
            Profile
          </Link>

          <Link className="sidebar-link" to="/alumni/jobs">
            Job Management
          </Link>

          <Link className="sidebar-link" to="/alumni/applications">
            Applications
          </Link>

          <Link className="sidebar-link" to="/alumni/referrals">
            Referrals
          </Link>

          <Link className="sidebar-link" to="/alumni/messages">
            Messages
          </Link>

          <Link className="sidebar-link" to="/alumni/notifications">
            Notifications
          </Link>
        </>
      )}

      {user?.role === "admin" && (
        <>
          <Link className="sidebar-link" to="/admin">
            Dashboard
          </Link>

          <Link className="sidebar-link" to="/admin/students">
            Students
          </Link>

          <Link className="sidebar-link" to="/admin/alumni">
            Alumni
          </Link>
        </>
      )}

      <button
        className="btn btn-danger w-100 mt-4"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;