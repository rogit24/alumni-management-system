import { useState, useEffect } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";

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
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    if (!currentUser) return;

    const savedProfiles =
      JSON.parse(
        localStorage.getItem("alumniProfiles")
      ) || [];

    const existingProfile = savedProfiles.find(
      (p) => p.email === currentUser.email
    );

    if (existingProfile) {
      setProfile(existingProfile);
    } else {
      setProfile({
        id: Date.now(),
        name: currentUser.name || "",
        email: currentUser.email || "",
        company: "",
        experience: "",
        skills: "",
        location: "",
        about: "",
        photo: "",
      });
    }
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

  const saveProfile = () => {
    if (
      !profile.name ||
      !profile.email ||
      !profile.company ||
      !profile.skills
    ) {
      toast.error(
        "Please fill all required fields"
      );
      return;
    }

    const allProfiles =
      JSON.parse(
        localStorage.getItem("alumniProfiles")
      ) || [];

    const existingIndex =
      allProfiles.findIndex(
        (p) => p.email === profile.email
      );

    if (existingIndex !== -1) {
      allProfiles[existingIndex] = profile;
    } else {
      allProfiles.push(profile);
    }

    localStorage.setItem(
      "alumniProfiles",
      JSON.stringify(allProfiles)
    );

    // Used in Student Alumni Search
    localStorage.setItem(
      "alumni",
      JSON.stringify(allProfiles)
    );

    // Update the user details in the main "users" collection so it reflects in student search
    const allUsers = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = allUsers.findIndex((u) => u.email === profile.email);
    if (userIndex !== -1) {
      allUsers[userIndex] = {
        ...allUsers[userIndex],
        name: profile.name,
        company: profile.company,
        skills: profile.skills,
        experience: profile.experience,
        location: profile.location,
        about: profile.about,
        photo: profile.photo,
      };
      localStorage.setItem("users", JSON.stringify(allUsers));
    }

    // Update current logged-in user
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    if (currentUser) {
      currentUser.name = profile.name;
      currentUser.email = profile.email;
      currentUser.company = profile.company;
      currentUser.skills = profile.skills;
      currentUser.experience = profile.experience;
      currentUser.location = profile.location;

      localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
      );
    }

    toast.success(
      "Profile Updated Successfully 🎉"
    );
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