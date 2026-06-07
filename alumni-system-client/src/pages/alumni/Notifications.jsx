import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";

function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const loadNotifications = () => {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    const allNotifications =
      JSON.parse(
        localStorage.getItem("notifications")
      ) || [];

    const myNotifications =
      allNotifications.filter(
        (n) =>
          n.userEmail
            ?.trim()
            .toLowerCase() ===
          currentUser?.email
            ?.trim()
            .toLowerCase()
      );

    const sortedNotifications =
      [...myNotifications].sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

    setNotifications(sortedNotifications);
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const clearNotifications = () => {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    const allNotifications =
      JSON.parse(
        localStorage.getItem("notifications")
      ) || [];

    const remaining =
      allNotifications.filter(
        (n) =>
          n.userEmail
            ?.trim()
            .toLowerCase() !==
          currentUser?.email
            ?.trim()
            .toLowerCase()
      );

    localStorage.setItem(
      "notifications",
      JSON.stringify(remaining)
    );

    setNotifications([]);

    toast.success(
      "All Notifications Cleared Successfully"
    );
  };

  return (
    <AlumniLayout>
      <div className="container py-4">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Notifications</h2>

          {notifications.length > 0 && (
            <button
              className="btn btn-danger"
              onClick={clearNotifications}
            >
              Clear All
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="card shadow p-4 text-center">
            <h5>No Notifications</h5>

            <p className="text-muted mb-0">
              You don't have any notifications.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="card shadow border-0 mb-3"
            >
              <div className="card-body">

                <h6 className="mb-2">
                  🔔 Notification
                </h6>

                <p className="mb-2">
                  {n.message}
                </p>

                <small className="text-muted">
                  {n.date}
                </small>

              </div>
            </div>
          ))
        )}

      </div>
    </AlumniLayout>
  );
}

export default Notifications;