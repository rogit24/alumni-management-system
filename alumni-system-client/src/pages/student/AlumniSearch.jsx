import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, referrals as referralsApi, profiles, notifications as notificationsApi } from "../../services/api";

function AlumniSearch() {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");

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
            });
          }
        }
        setAlumni(resolvedAlumni);
      } catch (error) {
        toast.error("Failed to load alumni list ❌");
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
        jobRole: "Software Engineer",
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
      <div className="container">
        <div className="card shadow p-4 mb-4">
          <h2 className="mb-3">Search Alumni</h2>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Name, Company or Skills"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="row">
          {search.trim() === "" ? (
            <div className="col-12">
              <div className="card shadow-sm p-5 text-center bg-white" style={{ borderRadius: '20px' }}>
                <i className="bi bi-search text-primary display-4 mb-3 d-block"></i>
                <h5 className="fw-bold text-dark">Search the Alumni Network</h5>
                <p className="text-muted mb-0">Type a name, company, or professional skills above to search alumni profiles.</p>
              </div>
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="col-12">
              <div className="card shadow-sm p-5 text-center bg-white" style={{ borderRadius: '20px' }}>
                <i className="bi bi-person-x text-danger display-4 mb-3 d-block"></i>
                <h5 className="fw-bold text-dark">No Alumni Found</h5>
                <p className="text-muted mb-0">Try search queries like "Google", "React", or "Amit".</p>
              </div>
            </div>
          ) : (
            filteredAlumni.map((item, index) => (
              <div className="col-md-6 mb-4" key={item.id || item.email || index}>
                <div className="card shadow border-0 p-4 h-100">
                  <h4>{item.name}</h4>
                  <p>
                    <strong>Company:</strong> {item.company || "N/A"}
                  </p>
                  <p>
                    <strong>Skills:</strong> {item.skills || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {item.email || "N/A"}
                  </p>
                  {item.experience && (
                    <p>
                      <strong>Experience:</strong> {item.experience}
                    </p>
                  )}
                  {item.location && (
                    <p>
                      <strong>Location:</strong> {item.location}
                    </p>
                  )}

                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-success"
                      onClick={() => requestReferral(item)}
                    >
                      Request Referral
                    </button>
                    <button
                      className="btn btn-primary"
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
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

export default AlumniSearch;