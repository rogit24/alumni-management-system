import { useState, useEffect } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";
import { profiles } from "../../services/api";
import { convertToBase64 } from "../../services/fileHelper";

function Profile() {
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    company: "",
    experience: "",
    skills: "",
    location: "",
    about: "",
    photo: "",
  });
  const [loading, setLoading] = useState(true);

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
            company: data.currentCompany || "",
            experience: data.designation || "",
            skills: data.skills || "",
            location: data.location || "",
            about: data.bio || "",
            photo: data.profilePicture || "",
          });
        }
      })
      .catch((err) => {
        setProfile({
          id: "",
          name: currentUser.name || "",
          email: currentUser.email || "",
          company: "",
          experience: "",
          skills: "",
          location: "",
          about: "",
          photo: "",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file 📸");
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      setProfile((prev) => ({
        ...prev,
        photo: base64,
      }));
      toast.success("Profile photo uploaded successfully! 📸");
    } catch (err) {
      console.error(err);
      toast.error("Failed to read image file");
    }
  };

  const saveProfile = async () => {
    if (
      !profile.name ||
      !profile.email ||
      !profile.company ||
      !profile.skills
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        fullName: profile.name,
        email: profile.email,
        currentCompany: profile.company,
        designation: profile.experience,
        skills: profile.skills,
        location: profile.location,
        bio: profile.about,
        profilePicture: profile.photo || "",
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
        company: updated.currentCompany || "",
        experience: updated.designation || "",
        skills: updated.skills || "",
        location: updated.location || "",
        about: updated.bio || "",
        photo: updated.profilePicture || "",
      });

      // Update current logged-in user details in localStorage session context
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
        currentUser.name = updated.fullName;
        currentUser.email = updated.email;
        currentUser.company = updated.currentCompany;
        currentUser.skills = updated.skills;
        currentUser.experience = updated.designation;
        currentUser.location = updated.location;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }

      toast.success("Profile Updated Successfully 🎉");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save profile ❌");
    }
  };

  return (
    <AlumniLayout>
      <div className="container py-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading profile settings...</p>
          </div>
        ) : (
          <div className="card border-0 text-dark shadow p-4 rounded-4 bg-white">
            
            <h2 className="fw-bold mb-4 text-dark">🏆 Alumni Profile Settings</h2>

            {/* Profile Image upload layout */}
            <div className="row mb-4 align-items-center">
              <div className="col-md-3 text-center mb-3 mb-md-0">
                <img
                  src={
                    profile.photo ||
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
                <div>
                  <label className="form-label fw-semibold text-secondary" style={{ fontSize: "0.85rem" }}>📸 Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handlePhoto}
                  />
                  <small className="text-muted mt-1 d-block">Upload a square image (JPEG/PNG) to represent yourself across search results and messaging.</small>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email *</label>
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
                <label className="form-label">Current Company / Employer *</label>
                <input
                  type="text"
                  className="form-control"
                  name="company"
                  value={profile.company}
                  onChange={handleChange}
                  placeholder="Google"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Designation / Role Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="experience"
                  value={profile.experience}
                  onChange={handleChange}
                  placeholder="Senior Software Engineer"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Industry Expertise / Skills (Comma-separated) *</label>
                <input
                  type="text"
                  className="form-control"
                  name="skills"
                  value={profile.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, Java"
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
                  placeholder="Pune, India"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Professional Bio (About Me)</label>
              <textarea
                rows="4"
                className="form-control"
                name="about"
                value={profile.about}
                onChange={handleChange}
                placeholder="Tell students about your career journey, tech stack, and mentoring preferences..."
              />
            </div>

            <button
              className="btn gradient-btn btn-lg"
              onClick={saveProfile}
            >
              Save Profile Settings 💾
            </button>

          </div>
        )}
      </div>
    </AlumniLayout>
  );
}

export default Profile;