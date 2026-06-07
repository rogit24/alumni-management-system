import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";

function Referrals() {
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const allReferrals = JSON.parse(localStorage.getItem("referrals")) || [];

    const myReferrals = allReferrals.filter(
      (ref) =>
        ref &&
        ref.alumniEmail?.trim().toLowerCase() ===
          currentUser?.email?.trim().toLowerCase()
    );

    setReferrals(myReferrals);
  };

  const updateStatus = (id, status) => {
    const allReferrals = JSON.parse(localStorage.getItem("referrals")) || [];

    const updatedReferrals = allReferrals.map((ref) =>
      ref.id === id
        ? {
            ...ref,
            status,
            updatedDate: new Date().toLocaleString(),
          }
        : ref
    );

    localStorage.setItem("referrals", JSON.stringify(updatedReferrals));

    const selectedReferral = updatedReferrals.find(
      (ref) => ref.id === id
    );

    if (!selectedReferral) {
      toast.error("Referral Not Found");
      return;
    }

    // Create Notification for Student
    const notifications =
      JSON.parse(localStorage.getItem("notifications")) || [];

    notifications.push({
      id: Date.now(),
      userEmail: selectedReferral.studentEmail,
      message:
        status === "Approved"
          ? `🎉 Your referral request for ${selectedReferral.company} has been approved.`
          : `❌ Your referral request for ${selectedReferral.company} has been rejected.`,
      date: new Date().toLocaleString(),
    });

    localStorage.setItem("notifications", JSON.stringify(notifications));

    toast.success(`Referral ${status} Successfully`);
    loadReferrals();
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