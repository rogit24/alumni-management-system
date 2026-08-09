import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { toast } from "react-toastify";
import { profiles } from "../../services/api";
import { convertToBase64, downloadBase64File } from "../../services/fileHelper";

function Profile() {
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    skills: "",
    education: "",
    profileImage: "",
    resume: "", // Added
    phone: "",
    bio: "",
    graduationYear: "",
    currentCompany: "",
    designation: "",
    location: "",
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    profiles.getMe()
      .then((data) => {
        if (data) {
          setProfile({
            id: data.id,
            name: data.fullName || "",
            email: data.email || "",
            skills: data.skills || "",
            education: data.education || "",
            profileImage: data.profilePicture || "",
            resume: data.resume || "",
            phone: data.phone || "",
            bio: data.bio || "",
            graduationYear: data.graduationYear || "",
            currentCompany: data.currentCompany || "",
            designation: data.designation || "",
            location: data.location || "",
          });
        }
      })
      .catch((err) => {
        setProfile({
          id: "",
          name: currentUser.name || "",
          email: currentUser.email || "",
          skills: "",
          education: "",
          profileImage: "",
          resume: "",
          phone: "",
          bio: "",
          graduationYear: "",
          currentCompany: "",
          designation: "",
          location: "",
        });
      });
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      setProfile((prev) => ({
        ...prev,
        profileImage: base64,
      }));
      toast.success("Profile Photo Uploaded 📸");
    } catch (err) {
      console.error(err);
      toast.error("Failed to read image file");
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a valid PDF file 📄");
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      setProfile((prev) => ({
        ...prev,
        resume: base64,
      }));
      toast.success("Resume PDF Uploaded successfully! 📄");
    } catch (err) {
      console.error(err);
      toast.error("Failed to read PDF file");
    }
  };

  const handleSave = async () => {
    if (!profile.name || !profile.email) {
      toast.error("Name and Email are required");
      return;
    }

    try {
      const payload = {
        fullName: profile.name,
        email: profile.email,
        skills: profile.skills,
        education: profile.education,
        profilePicture: profile.profileImage || "",
        resume: profile.resume || "",
        phone: profile.phone,
        bio: profile.bio,
        graduationYear: profile.graduationYear ? parseInt(profile.graduationYear) : null,
        currentCompany: profile.currentCompany,
        designation: profile.designation,
        location: profile.location,
      };

      let updated;
      if (profile.id) {
        updated = await profiles.update(profile.id, payload);
      } else {
        updated = await profiles.create(payload);
      }

      setProfile({
        id: updated.id,
        name: updated.fullName || "",
        email: updated.email || "",
        skills: updated.skills || "",
        education: updated.education || "",
        profileImage: updated.profilePicture || "",
        resume: updated.resume || "",
        phone: updated.phone || "",
        bio: updated.bio || "",
        graduationYear: updated.graduationYear || "",
        currentCompany: updated.currentCompany || "",
        designation: updated.designation || "",
        location: updated.location || "",
      });

      toast.success("Profile Saved Successfully 🎉");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save profile ❌");
    }
  };

  const downloadResumePDF = () => {
    const element = document.getElementById("student-resume-template");
    if (!element) {
      toast.error("Resume template not found! ❌");
      return;
    }

    const opt = {
      margin:       [12, 12, 12, 12],
      filename:     `${profile.name.replace(/\s+/g, "_")}_Resume.pdf`,
      image:        { type: "jpeg", quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
      toast.success("Resume downloaded successfully! 📄");
    } else {
      toast.error("PDF generation library is loading. Please try again in a moment. ❌");
    }
  };

  const handleDownloadUploadedResume = () => {
    if (!profile.resume) {
      toast.error("No resume uploaded yet!");
      return;
    }
    downloadBase64File(profile.resume, `${profile.name.replace(/\s+/g, "_")}_Uploaded_Resume.pdf`);
    toast.success("Uploaded resume downloaded! 📄");
  };

  return (
    <StudentLayout>
      <div className="container py-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        {/* Toggle Mode Navigation */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h2 className="fw-bold mb-0">
            {isPreviewMode ? "📄 Professional Resume Builder" : "🎓 Edit Student Profile"}
          </h2>
          <div className="btn-group shadow-sm">
            <button
              className={`btn ${!isPreviewMode ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setIsPreviewMode(false)}
            >
              ✏️ Edit Info
            </button>
            <button
              className={`btn ${isPreviewMode ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setIsPreviewMode(true)}
            >
              👀 Preview Resume
            </button>
          </div>
        </div>

        {!isPreviewMode ? (
          /* Profile Edit Card */
          <div className="card border-0 text-dark shadow p-4 rounded-4 bg-white">
            
            {/* Profile Image & Resume Upload Panel */}
            <div className="row mb-4 align-items-center">
              <div className="col-md-3 text-center mb-3 mb-md-0">
                <img
                  src={
                    profile.profileImage ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="Profile"
                  className="rounded-circle shadow-sm border border-3 border-light-subtle"
                  style={{
                    width: "130px",
                    height: "130px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="col-md-9">
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: "0.85rem" }}>📸 Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: "0.85rem" }}>📄 Upload Resume PDF</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="form-control"
                      onChange={handleResumeUpload}
                    />
                    {profile.resume && (
                      <div className="mt-2 d-flex align-items-center justify-content-between bg-light p-2 rounded border border-light-subtle">
                        <span className="small text-success fw-bold">✓ Resume Uploaded</span>
                        <button 
                          className="btn btn-xs btn-outline-primary py-0.5 px-2 rounded-pill small" 
                          style={{ fontSize: "0.75rem" }}
                          onClick={handleDownloadUploadedResume}
                        >
                          📥 Download Uploaded Resume
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={profile.email}
                  disabled
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Location (City, Country)</label>
                <input
                  type="text"
                  className="form-control"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder="New York, USA"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Designation / Role Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="designation"
                  value={profile.designation}
                  onChange={handleChange}
                  placeholder="Software Engineer Intern"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Current Company / Organization</label>
                <input
                  type="text"
                  className="form-control"
                  name="currentCompany"
                  value={profile.currentCompany}
                  onChange={handleChange}
                  placeholder="Google (Optional)"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Skills (Comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  name="skills"
                  value={profile.skills}
                  onChange={handleChange}
                  placeholder="React, Java, Spring Boot, Python"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Graduation Year</label>
                <input
                  type="number"
                  className="form-control"
                  name="graduationYear"
                  value={profile.graduationYear}
                  onChange={handleChange}
                  placeholder="2026"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Professional Summary (Bio)</label>
              <textarea
                className="form-control"
                rows="3"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="A brief overview of your qualifications, achievements, and career goals."
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Education Details</label>
              <textarea
                className="form-control"
                rows="4"
                name="education"
                value={profile.education}
                onChange={handleChange}
                placeholder="Degree, Major, Institution Name (e.g. B.Tech in CSE at MIT)"
              />
            </div>

            <button className="btn gradient-btn mt-3" onClick={handleSave}>
              Save Profile Details 💾
            </button>
          </div>
        ) : (
          /* Resume Preview Card */
          <div>
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-lg btn-success shadow-sm" onClick={downloadResumePDF}>
                📥 Download Resume PDF
              </button>
            </div>

            {/* Structured Resume Template to convert to PDF */}
            <div
              id="student-resume-template"
              className="bg-white text-dark p-5 rounded-4 shadow mx-auto"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                maxWidth: "800px",
                color: "#2c3e50",
                lineHeight: "1.5"
              }}
            >
              {/* Header */}
              <div className="text-center border-bottom pb-4 mb-4" style={{ borderColor: "#dee2e6" }}>
                <h1 className="fw-bold mb-1 text-uppercase text-dark" style={{ letterSpacing: "1px", fontSize: "2.2rem" }}>
                  {profile.name}
                </h1>
                <p className="fw-semibold text-primary mb-2" style={{ fontSize: "1.1rem" }}>
                  {profile.designation || "Student / Aspiring Professional"}
                  {profile.currentCompany ? ` @ ${profile.currentCompany}` : ""}
                </p>
                <div className="d-flex justify-content-center flex-wrap gap-3 text-muted" style={{ fontSize: "0.9rem" }}>
                  <span>✉️ {profile.email}</span>
                  {profile.phone && <span>📞 {profile.phone}</span>}
                  {profile.location && <span>📍 {profile.location}</span>}
                </div>
              </div>

              {/* Bio Summary Section */}
              {profile.bio && (
                <div className="mb-4">
                  <h4 className="fw-bold text-uppercase border-bottom pb-1 mb-2 text-dark" style={{ fontSize: "1rem", letterSpacing: "0.5px" }}>
                    Professional Summary
                  </h4>
                  <p className="text-secondary" style={{ fontSize: "0.95rem", textAlign: "justify" }}>
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Experience Section */}
              {(profile.designation || profile.currentCompany) && (
                <div className="mb-4">
                  <h4 className="fw-bold text-uppercase border-bottom pb-1 mb-2 text-dark" style={{ fontSize: "1rem", letterSpacing: "0.5px" }}>
                    Experience
                  </h4>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-baseline">
                      <h6 className="fw-bold text-dark mb-0">{profile.designation || "Intern"}</h6>
                      <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                        {profile.currentCompany || "Independent Projects"}
                      </span>
                    </div>
                    <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
                      Active contributor to professional software projects, focusing on scalable integration and system design.
                    </p>
                  </div>
                </div>
              )}

              {/* Education Section */}
              {profile.education && (
                <div className="mb-4">
                  <h4 className="fw-bold text-uppercase border-bottom pb-1 mb-2 text-dark" style={{ fontSize: "1rem", letterSpacing: "0.5px" }}>
                    Education
                  </h4>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-baseline">
                      <p className="text-dark fw-bold mb-0" style={{ whiteSpace: "pre-line", fontSize: "0.95rem" }}>
                        {profile.education}
                      </p>
                      {profile.graduationYear && (
                        <span className="text-muted fw-semibold" style={{ fontSize: "0.9rem" }}>
                          Class of {profile.graduationYear}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {profile.skills && (
                <div className="mb-4">
                  <h4 className="fw-bold text-uppercase border-bottom pb-1 mb-2 text-dark" style={{ fontSize: "1rem", letterSpacing: "0.5px" }}>
                    Technical Skills
                  </h4>
                  <div className="d-flex flex-wrap gap-2 pt-1">
                    {profile.skills.split(",").map((skill, index) => (
                      <span
                        key={index}
                        className="badge bg-light text-dark border px-3 py-2 rounded-1"
                        style={{ fontSize: "0.85rem", fontWeight: "500" }}
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default Profile;