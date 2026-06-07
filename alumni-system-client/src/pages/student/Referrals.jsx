import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { toast } from "react-toastify";

function Referrals() {
  const [referrals, setReferrals] = useState([]);

  const loadReferrals = () => {
    const savedReferrals =
      JSON.parse(localStorage.getItem("referrals")) || [];

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser"));

    const myReferrals = savedReferrals.filter(
      (ref) =>
        ref.studentEmail === currentUser?.email
    );

    setReferrals(myReferrals);
  };

  useEffect(() => {
    loadReferrals();

    const interval = setInterval(() => {
      loadReferrals();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const deleteReferral = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this referral request?"
    );

    if (!confirmDelete) return;

    const allReferrals =
      JSON.parse(localStorage.getItem("referrals")) || [];

    const updatedReferrals =
      allReferrals.filter((ref) => ref.id !== id);

    localStorage.setItem(
      "referrals",
      JSON.stringify(updatedReferrals)
    );

    loadReferrals();

    toast.error("Referral Request Deleted");
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case "Approved":
        return "badge bg-success";
      case "Rejected":
        return "badge bg-danger";
      default:
        return "badge bg-warning text-dark";
    }
  };

  return (
    <StudentLayout>
      <div className="container">

        <div className="d-flex justify-content-between align-items-center mb-4">

          <h2>My Referrals</h2>

          <div>
            <span className="badge bg-primary fs-6 me-2">
              {referrals.length}
            </span>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={loadReferrals}
            >
              Refresh
            </button>
          </div>

        </div>

        {referrals.length === 0 ? (

          <div className="card shadow p-5 text-center">
            <h5>No Referral Requests Found</h5>
            <p className="text-muted">
              Request referrals from alumni to
              see them here.
            </p>
          </div>

        ) : (

          referrals.map((ref) => (

            <div
              className="card shadow border-0 p-4 mb-3"
              key={ref.id}
            >

              <div className="d-flex justify-content-between">

                <div>
                  <h5>{ref.alumniName}</h5>

                  <p className="mb-1">
                    <strong>Company:</strong>{" "}
                    {ref.company}
                  </p>

                  <p className="mb-1">
                    <strong>Request Date:</strong>{" "}
                    {ref.requestDate}
                  </p>

                  {ref.updatedDate && (
                    <p className="mb-1">
                      <strong>Updated:</strong>{" "}
                      {ref.updatedDate}
                    </p>
                  )}
                </div>

                <div>
                  <span
                    className={getBadgeClass(
                      ref.status
                    )}
                  >
                    {ref.status}
                  </span>
                </div>

              </div>

              {ref.status === "Pending" && (
                <div className="mt-3">

                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      deleteReferral(ref.id)
                    }
                  >
                    Delete Request
                  </button>

                </div>
              )}

            </div>

          ))

        )}

      </div>
    </StudentLayout>
  );
}

export default Referrals;