import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { toast } from "react-toastify";
import { profiles } from "../../services/api";

function Profile() {
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    skills: "",
    education: "",
    profileImage: "",
  });

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
        });
      });
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Please select a valid image"
      );
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        profileImage: reader.result,
      }));

      toast.success(
        "Profile Photo Uploaded"
      );
    };

    reader.readAsDataURL(file);
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
      });

      toast.success("Profile Saved Successfully 🎉");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save profile ❌");
    }
  };

  return (
    <StudentLayout>
      <div className="container py-4">

        <div className="card card-dark shadow p-4">

          <h2 className="text-center mb-4">
            Student Profile
          </h2>

          {/* Profile Image */}
          <div className="text-center mb-4">

            <img
              src={
                profile.profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="rounded-circle shadow"
              style={{
                width: "140px",
                height: "140px",
                objectFit: "cover",
              }}
            />

            <input
              type="file"
              accept="image/*"
              className="form-control mt-3"
              onChange={handlePhotoUpload}
            />

          </div>

          <div className="mb-3">
            <label className="form-label">
              Name
            </label>

            <input
              type="text"
              className="form-control"
              name="name"
              value={profile.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              name="email"
              value={profile.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Skills
            </label>

            <input
              type="text"
              className="form-control"
              name="skills"
              value={profile.skills}
              onChange={handleChange}
              placeholder="React, Java, Spring Boot"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Education
            </label>

            <textarea
              className="form-control"
              rows="4"
              name="education"
              value={profile.education}
              onChange={handleChange}
              placeholder="B.Tech Computer Engineering"
            />
          </div>

          <button
            className="btn gradient-btn"
            onClick={handleSave}
          >
            Save Profile
          </button>

        </div>

      </div>
    </StudentLayout>
  );
}

export default Profile;