import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";
import { notifications as notificationsApi } from "../../services/api";

function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const loadNotifications = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) return;

      const res = await notificationsApi.getUserNotifications(currentUser.id);
      const mapped = res.map((n) => ({
        id: n.id,
        message: n.message,
        date: n.createdAt ? new Date(n.createdAt).toLocaleString() : "Just now",
        isRead: n.isRead,
      }));
      
      setNotifications(mapped);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const clearNotifications = async () => {
    try {
      for (const n of notifications) {
        await notificationsApi.delete(n.id);
      }
      setNotifications([]);
      toast.success("All Notifications Cleared Successfully");
    } catch (error) {
      toast.error("Failed to clear notifications ❌");
    }
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