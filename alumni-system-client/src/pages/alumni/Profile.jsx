import { useState, useEffect } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";
import { profiles } from "../../services/api";

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
      });
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Please upload a valid image file"
      );
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        photo: reader.result,
      }));

      toast.success(
        "Profile photo uploaded successfully"
      );
    };

    reader.readAsDataURL(file);
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
      <div className="container py-4">

        <div className="card shadow border-0 p-4">

          <h2 className="text-center mb-4">
            Alumni Profile
          </h2>

          <div className="text-center mb-4">

            <img
              src={
                profile.photo ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="rounded-circle shadow"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
              }}
            />

            <input
              type="file"
              accept="image/*"
              className="form-control mt-3"
              onChange={handlePhoto}
            />

          </div>

          <div className="row">

            <div className="col-md-6">
              <label className="form-label">
                Full Name *
              </label>

              <input
                type="text"
                className="form-control mb-3"
                name="name"
                value={profile.name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Email *
              </label>

              <input
                type="email"
                className="form-control mb-3"
                name="email"
                value={profile.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Company *
              </label>

              <input
                type="text"
                className="form-control mb-3"
                name="company"
                value={profile.company}
                onChange={handleChange}
                placeholder="Google"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Experience
              </label>

              <input
                type="text"
                className="form-control mb-3"
                name="experience"
                value={profile.experience}
                onChange={handleChange}
                placeholder="3 Years"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Skills *
              </label>

              <input
                type="text"
                className="form-control mb-3"
                name="skills"
                value={profile.skills}
                onChange={handleChange}
                placeholder="React, Node.js, Java"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Location
              </label>

              <input
                type="text"
                className="form-control mb-3"
                name="location"
                value={profile.location}
                onChange={handleChange}
                placeholder="Pune, Maharashtra"
              />
            </div>

            <div className="col-12">
              <label className="form-label">
                About Me
              </label>

              <textarea
                rows="4"
                className="form-control mb-3"
                name="about"
                value={profile.about}
                onChange={handleChange}
                placeholder="Tell students about your career journey..."
              />
            </div>

          </div>

          <button
            className="btn btn-success btn-lg"
            onClick={saveProfile}
          >
            Save Profile
          </button>

        </div>

      </div>
    </AlumniLayout>
  );
}

export default Profile;