import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { toast } from "react-toastify";
import { referrals as referralsApi, auth, profiles } from "../../services/api";

function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReferrals = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) return;

      const refs = await referralsApi.getStudentReferrals(currentUser.id);
      const allUsers = await auth.getAllUsers();

      const resolvedRefs = [];
      for (const ref of refs) {
        const alumniUser = allUsers.find(u => u.id === ref.alumniId);
        let profilePic = "";
        try {
          const profileData = await profiles.getByUserId(ref.alumniId);
          profilePic = profileData.profilePicture || "";
        } catch (e) {
          // ignore
        }
        resolvedRefs.push({
          id: ref.id,
          alumniName: alumniUser ? alumniUser.name : `Alumni #${ref.alumniId}`,
          company: ref.company || "N/A",
          jobRole: ref.jobRole || "N/A",
          requestDate: ref.requestDate || "N/A",
          status: ref.status ? (ref.status.charAt(0).toUpperCase() + ref.status.slice(1).toLowerCase()) : "Pending",
          alumniPhoto: profilePic
        });
      }

      setReferrals(resolvedRefs);
    } catch (error) {
      console.error("Failed to load referrals", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();

    const interval = setInterval(() => {
      loadReferrals();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const deleteReferral = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this referral request?"
    );

    if (!confirmDelete) return;

    try {
      await referralsApi.delete(id);
      toast.error("Referral Request Deleted");
      loadReferrals();
    } catch (error) {
      toast.error("Failed to delete referral request ❌");
    }
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
      <div className="container py-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-light-subtle">
          <div>
            <h2 className="fw-bold mb-1 text-dark">📋 My Referrals</h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>Track endorsement requests sent to alumni partners.</p>
          </div>
          <div>
            <span className="badge bg-primary fs-6 me-2 py-2 px-3 rounded-pill">
              Total: {referrals.length}
            </span>
            <button
              className="btn btn-outline-primary btn-sm rounded-pill fw-bold px-3"
              onClick={loadReferrals}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading referral logs...</p>
          </div>
        ) : referrals.length === 0 ? (
          <div className="card shadow-sm p-5 text-center border-0 text-dark rounded-4 bg-white">
            <h5 className="fw-bold mb-2">No Referral Requests Found</h5>
            <p className="text-secondary mb-0">Ask alumni for professional referrals to see requests here.</p>
          </div>
        ) : (
          <div className="row g-3">
            {referrals.map((ref) => (
              <div className="col-md-6" key={ref.id}>
                <div className="card border-0 rounded-4 shadow-sm bg-white text-dark">
                  <div className="card-body p-4">
                    
                    {/* Header: Alumni Avatar + Name */}
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-light-subtle">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={ref.alumniPhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                          alt={ref.alumniName}
                          className="rounded-circle border shadow-sm"
                          style={{ width: "48px", height: "48px", objectFit: "cover" }}
                        />
                        <div>
                          <h5 className="fw-bold mb-0 text-dark">{ref.alumniName}</h5>
                          <span className="small text-muted">🏢 {ref.company}</span>
                        </div>
                      </div>
                      <div>
                        <span className={`${getBadgeClass(ref.status)} px-3 py-1.5 rounded-pill`}>
                          {ref.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 mb-3 rounded-3 bg-light text-dark" style={{ fontSize: "0.9rem" }}>
                      <p className="mb-2"><strong>💼 Target Role:</strong> <span className="text-secondary">{ref.jobRole}</span></p>
                      <p className="mb-0"><strong>📅 Request Date:</strong> <span className="text-secondary">{ref.requestDate}</span></p>
                    </div>

                    {ref.status === "Pending" && (
                      <div className="mt-4 pt-2 border-top border-light-subtle d-flex justify-content-end">
                        <button
                          className="btn btn-outline-danger px-4 rounded-pill fw-bold"
                          onClick={() => deleteReferral(ref.id)}
                        >
                          Delete Request
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default Referrals;