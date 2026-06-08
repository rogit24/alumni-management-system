import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";

function Users() {

  const [users, setUsers] = useState([]);

  useEffect(() => {

    const storedUsers =
      JSON.parse(localStorage.getItem("users")) || [];

    setUsers(storedUsers);

  }, []);

  const blockUser = (id) => {

    const updatedUsers = users.map((user) =>
      user.id === id
        ? {
            ...user,
            status:
              user.status === "Blocked"
                ? "Active"
                : "Blocked",
          }
        : user
    );

    setUsers(updatedUsers);

    localStorage.setItem(
      "users",
      JSON.stringify(updatedUsers)
    );
  };

  const approveAlumni = (id) => {
    const updatedUsers = users.map((user) =>
      user.id === id
        ? {
            ...user,
            status: "Active",
          }
        : user
    );

    setUsers(updatedUsers);

    localStorage.setItem(
      "users",
      JSON.stringify(updatedUsers)
    );
  };

  const deleteUser = (id) => {

    const updatedUsers =
      users.filter((user) => user.id !== id);

    setUsers(updatedUsers);

    localStorage.setItem(
      "users",
      JSON.stringify(updatedUsers)
    );
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