import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { auth } from "../../services/api";

function Users() {

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const data = await auth.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const blockUser = async (id) => {
    const userToBlock = users.find((u) => u.id === id);
    if (!userToBlock) return;
    const newStatus = userToBlock.status === "Blocked" ? "Active" : "Blocked";
    try {
      await auth.updateUserStatus(id, newStatus);
      fetchUsers();
    } catch (err) {
      console.error("Error blocking/unblocking user:", err);
    }
  };

  const approveAlumni = async (id) => {
    try {
      await auth.updateUserStatus(id, "Active");
      fetchUsers();
    } catch (err) {
      console.error("Error approving alumni:", err);
    }
  };

  const deleteUser = async (id) => {
    try {
      await auth.deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <AdminLayout>

      <div className="container">

        <h2 className="mb-4">
          User Management
        </h2>

        {users.map((user) => (

          <div
            className="card shadow p-3 mb-3"
            key={user.id}
          >

            <h5>{user.name}</h5>

            <p>{user.email}</p>

            <p>
              Role:
              <strong> {user.role}</strong>
            </p>

            <p>
              Status:
              <span
                className={
                  user.status === "Blocked"
                    ? "badge bg-danger ms-2"
                    : user.status === "Pending Approval"
                    ? "badge bg-warning text-dark ms-2"
                    : "badge bg-success ms-2"
                }
              >
                {user.status || "Active"}
              </span>
            </p>

            <div className="d-flex gap-2">

              {user.role === "alumni" && user.status === "Pending Approval" && (
                <button
                  className="btn btn-success"
                  onClick={() =>
                    approveAlumni(user.id)
                  }
                >
                  Approve Alumni
                </button>
              )}

              <button
                className="btn btn-warning"
                onClick={() =>
                  blockUser(user.id)
                }
              >
                Block / Unblock
              </button>

              <button
                className="btn btn-danger"
                onClick={() =>
                  deleteUser(user.id)
                }
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </AdminLayout>
  );
}

export default Users;