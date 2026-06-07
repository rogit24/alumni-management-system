import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";

function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const filteredStudents = users.filter(
      (user) =>
        user.role?.toLowerCase() === "student"
    );

    setStudents(filteredStudents);
  }, []);

  return (
    <AdminLayout>
      <div className="container">

        <h2 className="mb-4">
          Students Management
        </h2>

        {students.length === 0 ? (
          <div className="card p-4 text-center">
            No Students Found
          </div>
        ) : (
          students.map((student) => (
            <div
              className="card shadow p-3 mb-3"
              key={student.id}
            >
              <h5>{student.name}</h5>

              <p>{student.email}</p>

              <span className="badge bg-primary">
                Student
              </span>
            </div>
          ))
        )}

      </div>
    </AdminLayout>
  );
}

export default Students;