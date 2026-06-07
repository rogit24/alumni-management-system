import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AlumniSearch() {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // 1. Read directly from the consolidated "users" local storage key
    const allUsers = JSON.parse(localStorage.getItem("users")) || [];

    // 2. Filter down to pull out ONLY profiles whose role is designated as alumni
    const alumniProfiles = allUsers.filter((u) => u && u.role === "alumni");

    // 3. Map fallback IDs cleanly to ensure React lists remain stable
    const alumniWithIds = alumniProfiles.map((item, index) => ({
      ...item,
      id: item.id || item.email || `alumni-${index}`,
    }));

    setAlumni(alumniWithIds);
  }, []);

  const requestReferral = (alumniData) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const referrals = JSON.parse(localStorage.getItem("referrals")) || [];

    const alreadyRequested = referrals.find(
      (ref) =>
        ref.alumniEmail?.toLowerCase() === alumniData.email?.toLowerCase() &&
        ref.studentEmail?.toLowerCase() === currentUser?.email?.toLowerCase()
    );

    if (alreadyRequested) {
      toast.warning("Referral already requested");
      return;
    }

    const newReferral = {
      id: Date.now(),
      alumniId: alumniData.id || alumniData.email,
      alumniName: alumniData.name,
      alumniEmail: alumniData.email,
      company: alumniData.company || "N/A",
      studentName: currentUser?.name,
      studentEmail: currentUser?.email,
      status: "Pending",
      requestDate: new Date().toLocaleDateString(),
    };

    referrals.push(newReferral);
    localStorage.setItem("referrals", JSON.stringify(referrals));

    // Alumni Notification
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    notifications.push({
      id: Date.now() + Math.random(),
      userEmail: alumniData.email?.trim().toLowerCase(),
      message: `${currentUser?.name} requested a referral from you`,
      date: new Date().toLocaleString(),
      type: "referral",
      read: false,
    });

    localStorage.setItem("notifications", JSON.stringify(notifications));
    toast.success("Referral Request Sent Successfully 🎉");
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
          {filteredAlumni.length === 0 ? (
            <div className="col-12">
              <div className="card shadow p-5 text-center">
                <h5>No Alumni Found</h5>
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