import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";

function Alumni() {
  const [alumni, setAlumni] = useState([]);

  useEffect(() => {
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const filteredAlumni = users.filter(
      (user) =>
        user.role?.toLowerCase() === "alumni"
    );

    setAlumni(filteredAlumni);
  }, []);

  return (
    <AdminLayout>
      <div className="container">

        <h2 className="mb-4">
          Alumni Management
        </h2>

        {alumni.length === 0 ? (
          <div className="card p-4 text-center">
            No Alumni Found
          </div>
        ) : (
          alumni.map((alum) => (
            <div
              className="card shadow p-3 mb-3"
              key={alum.id}
            >
              <h5>{alum.name}</h5>

              <p>{alum.email}</p>

              <span className="badge bg-success">
                Alumni
              </span>
            </div>
          ))
        )}

      </div>
    </AdminLayout>
  );
}

export default Alumni;