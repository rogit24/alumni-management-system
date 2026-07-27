import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";
import { referrals as referralsApi, auth } from "../../services/api";

function Referrals() {
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    loadReferrals();

    const interval = setInterval(() => {
      loadReferrals();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadReferrals = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) return;

      const refs = await referralsApi.getAlumniReferrals(currentUser.id);
      const allUsers = await auth.getAllUsers();

      const resolvedRefs = refs.map(ref => {
        const studentUser = allUsers.find(u => u.id === ref.studentId);
        return {
          id: ref.id,
          studentName: studentUser ? studentUser.name : `Student #${ref.studentId}`,
          studentEmail: studentUser ? studentUser.email : "N/A",
          company: ref.company || "N/A",
          requestDate: ref.requestDate || "N/A",
          status: ref.status ? (ref.status.charAt(0).toUpperCase() + ref.status.slice(1).toLowerCase()) : "Pending"
        };
      });

      setReferrals(resolvedRefs);
    } catch (error) {
      console.error("Failed to load referrals", error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      if (status === "Approved") {
        await referralsApi.approve(id);
      } else {
        await referralsApi.reject(id);
      }
      toast.success(`Referral ${status} Successfully 🎉`);
      loadReferrals();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update referral ❌`);
    }
  };

  return (
    <AlumniLayout>
      <div className="container">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Referral Requests</h2>

          <span className="badge bg-primary fs-6">
            {referrals.length}
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="card shadow p-4 text-center">
            <h5>No Referral Requests Found</h5>
          </div>
        ) : (
          referrals.map((ref) => (
            <div
              className="card shadow border-0 p-4 mb-3"
              key={ref.id}
            >
              <h5>{ref.studentName}</h5>

              <p>
                <strong>Email:</strong>{" "}
                {ref.studentEmail}
              </p>

              <p>
                <strong>Company:</strong>{" "}
                {ref.company}
              </p>

              <p>
                <strong>Request Date:</strong>{" "}
                {ref.requestDate}
              </p>

              {ref.updatedDate && (
                <p>
                  <strong>Updated:</strong>{" "}
                  {ref.updatedDate}
                </p>
              )}

              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    ref.status === "Approved"
                      ? "badge bg-success"
                      : ref.status === "Rejected"
                      ? "badge bg-danger"
                      : "badge bg-warning text-dark"
                  }
                >
                  {ref.status}
                </span>
              </p>

              {ref.status === "Pending" && (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success"
                    onClick={() =>
                      updateStatus(
                        ref.id,
                        "Approved"
                      )
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      updateStatus(
                        ref.id,
                        "Rejected"
                      )
                    }
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}

      </div>
    </AlumniLayout>
  );
}

export default Referrals;