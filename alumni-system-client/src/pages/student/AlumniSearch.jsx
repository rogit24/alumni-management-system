import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, referrals as referralsApi, profiles, notifications as notificationsApi } from "../../services/api";

function AlumniSearch() {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadAlumni = async () => {
      try {
        const users = await auth.getAllUsers();
        const alumniUsers = users.filter((u) => u && u.role?.toLowerCase() === "alumni");
        
        const resolvedAlumni = [];
        for (const user of alumniUsers) {
          try {
            const profileData = await profiles.getByUserId(user.id);
            resolvedAlumni.push({
              id: user.id,
              name: user.name || profileData.fullName || "Alumni",
              email: user.email,
              company: profileData.currentCompany || "N/A",
              skills: profileData.skills || "N/A",
              experience: profileData.designation || "",
              location: profileData.location || "",
              profileImage: profileData.profilePicture || "",
            });
          } catch (e) {
            resolvedAlumni.push({
              id: user.id,
              name: user.name || "Alumni",
              email: user.email,
              company: "N/A",
              skills: "N/A",
              experience: "",
              location: "",
              profileImage: "",
            });
          }
        }
        setAlumni(resolvedAlumni);
      } catch (error) {
        toast.error("Failed to load alumni list ❌");
      } finally {
        setLoading(false);
      }
    };
    loadAlumni();
  }, []);

  const requestReferral = async (alumniData) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    try {
      const payload = {
        studentId: currentUser.id,
        alumniId: alumniData.id,
        company: alumniData.company,
        jobRole: alumniData.experience || "Software Engineer",
        message: `Hello, I'm requesting a referral for ${alumniData.company}.`,
        requestDate: new Date().toLocaleDateString(),
      };

      await referralsApi.create(payload);

      // Trigger notification
      try {
        await notificationsApi.createNotification({
          userId: alumniData.id,
          title: "New Referral Request",
          message: `${currentUser.name} has requested a referral for ${alumniData.company}.`,
          type: "REFERRAL"
        });
      } catch (notifErr) {
        console.error("Failed to send referral notification", notifErr);
      }

      toast.success("Referral Request Sent Successfully 🎉");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send referral request ❌");
    }
  };

  const filteredAlumni = alumni.filter(
    (item) =>
      (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.company || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.skills || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StudentLayout>
      <div className="container py-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        
        {/* Search header panel */}
        <div className="card border-0 rounded-4 shadow-sm p-4 mb-4 bg-white text-dark">
          <h2 className="fw-bold mb-3">🔍 Search Alumni Network</h2>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Name, Company, or Skills (e.g. Google, React)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Searching directories...</p>
          </div>
        ) : (
          <div className="row">
            {search.trim() === "" ? (
              <div className="col-12">
                <div className="card border-0 shadow-sm p-5 text-center bg-white" style={{ borderRadius: '20px' }}>
                  <i className="bi bi-search text-primary display-4 mb-3 d-block"></i>
                  <h5 className="fw-bold text-dark">Find Your Alumni Partners</h5>
                  <p className="text-muted mb-0">Type a company, name, or core professional skills above to explore listings.</p>
                </div>
              </div>
            ) : filteredAlumni.length === 0 ? (
              <div className="col-12">
                <div className="card border-0 shadow-sm p-5 text-center bg-white" style={{ borderRadius: '20px' }}>
                  <i className="bi bi-person-x text-danger display-4 mb-3 d-block"></i>
                  <h5 className="fw-bold text-dark">No Alumni Found</h5>
                  <p className="text-muted mb-0">Try searching queries like "Google", "React", or "Ravi".</p>
                </div>
              </div>
            ) : (
              filteredAlumni.map((item, index) => (
                <div className="col-md-6 mb-4" key={item.id || item.email || index}>
                  <div className="card border-0 shadow-sm p-4 rounded-4 bg-white text-dark h-100 d-flex flex-column">
                    
                    {/* Alumni Avatar & Header details */}
                    <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom border-light-subtle">
                      <img
                        src={item.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt={item.name}
                        className="rounded-circle border border-2 border-light-subtle shadow-sm"
                        style={{ width: "65px", height: "65px", objectFit: "cover" }}
                      />
                      <div>
                        <h4 className="fw-bold mb-0 text-dark">{item.name}</h4>
                        {item.experience && <span className="small text-muted">{item.experience}</span>}
                      </div>
                    </div>

                    <div className="flex-grow-1" style={{ fontSize: "0.92rem" }}>
                      <p className="mb-2">
                        <strong>🏢 Target Company:</strong> <span className="text-secondary">{item.company || "N/A"}</span>
                      </p>
                      <p className="mb-2">
                        <strong>🛠️ Core Skills:</strong> <span className="text-secondary">{item.skills || "N/A"}</span>
                      </p>
                      <p className="mb-2">
                        <strong>✉️ Email Address:</strong> <span className="text-secondary">{item.email || "N/A"}</span>
                      </p>
                      {item.location && (
                        <p className="mb-0">
                          <strong>📍 Office Location:</strong> <span className="text-secondary">{item.location}</span>
                        </p>
                      )}
                    </div>

                    <div className="d-flex gap-2 mt-4 pt-2 border-top border-light-subtle">
                      <button
                        className="btn btn-success flex-grow-1 px-3 py-2 rounded-pill fw-bold"
                        onClick={() => requestReferral(item)}
                      >
                        Request Referral
                      </button>
                      <button
                        className="btn btn-outline-primary flex-grow-1 px-3 py-2 rounded-pill fw-bold"
                        onClick={() => {
                          localStorage.setItem(
                            "selectedAlumni",
                            JSON.stringify({
                              id: item.id,
                              name: item.name,
                              email: item.email,
                              company: item.company,
                            })
                          );
                          navigate("/student/messages");
                        }}
                      >
                        Message Chat
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default AlumniSearch;