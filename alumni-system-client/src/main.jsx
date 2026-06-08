import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";

import "./index.css";
// Import mock data from users.js
import {
  mockUsers,
  mockMessages,
  mockJobs,
  mockApplications,
  mockReferrals
} from "./data/users"; 

const seedDatabase = () => {
  // Seed users if not exists
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(mockUsers));
  }

  // Seed messages if not exists or is empty array
  if (!localStorage.getItem("messages") || localStorage.getItem("messages") === "[]") {
    localStorage.setItem("messages", JSON.stringify(mockMessages));
  }

  // Seed jobs if not exists or is empty array
  if (!localStorage.getItem("jobs") || localStorage.getItem("jobs") === "[]") {
    localStorage.setItem("jobs", JSON.stringify(mockJobs));
  }

  // Seed applications if not exists or is empty array
  if (!localStorage.getItem("applications") || localStorage.getItem("applications") === "[]") {
    localStorage.setItem("applications", JSON.stringify(mockApplications));
  }

  // Seed referrals if not exists or is empty array
  if (!localStorage.getItem("referrals") || localStorage.getItem("referrals") === "[]") {
    localStorage.setItem("referrals", JSON.stringify(mockReferrals));
  }

  // Migrate legacy mock data in localStorage to use correct emails
  try {
    const storedMessages = localStorage.getItem("messages");
    if (storedMessages) {
      const messages = JSON.parse(storedMessages);
      let updated = false;
      const updatedMessages = messages.map(msg => {
        if (msg.senderEmail === "student@gmail.com") { msg.senderEmail = "student1@gmail.com"; updated = true; }
        if (msg.receiverEmail === "student@gmail.com") { msg.receiverEmail = "student1@gmail.com"; updated = true; }
        if (msg.senderEmail === "alumni@gmail.com") { msg.senderEmail = "alumni1@gmail.com"; updated = true; }
        if (msg.receiverEmail === "alumni@gmail.com") { msg.receiverEmail = "alumni1@gmail.com"; updated = true; }
        return msg;
      });
      if (updated) {
        localStorage.setItem("messages", JSON.stringify(updatedMessages));
      }
    }
  } catch (e) {
    console.error("Migration failed for messages:", e);
  }

  try {
    const storedApps = localStorage.getItem("applications");
    if (storedApps) {
      const apps = JSON.parse(storedApps);
      let updated = false;
      const updatedApps = apps.map(app => {
        if (app.studentEmail === "student@gmail.com") {
          app.studentEmail = "student1@gmail.com";
          updated = true;
        }
        if (app.studentEmail === "student1@gmail.com" && (!app.jobTitle || !app.company)) {
          app.jobTitle = app.jobTitle || "Software Engineer Intern";
          app.company = app.company || "Google";
          app.salary = app.salary || "$120,000/yr";
          app.appliedDate = app.appliedDate || "2026-06-07";
          app.studentName = app.studentName || "Amit Patel";
          updated = true;
        }
        return app;
      });
      if (updated) {
        localStorage.setItem("applications", JSON.stringify(updatedApps));
      }
    }
  } catch (e) {
    console.error("Migration failed for applications:", e);
  }

  try {
    const storedRefs = localStorage.getItem("referrals");
    if (storedRefs) {
      const refs = JSON.parse(storedRefs);
      let updated = false;
      const updatedRefs = refs.map(ref => {
        if (ref.studentEmail === "student@gmail.com" || ref.alumniEmail === "alumni@gmail.com") {
          if (ref.studentEmail === "student@gmail.com") ref.studentEmail = "student1@gmail.com";
          if (ref.alumniEmail === "alumni@gmail.com") ref.alumniEmail = "alumni1@gmail.com";
          updated = true;
        }
        if ((ref.studentEmail === "student1@gmail.com" || ref.alumniEmail === "alumni1@gmail.com") && (!ref.studentName || !ref.alumniName || !ref.company)) {
          ref.studentName = ref.studentName || "Amit Patel";
          ref.alumniName = ref.alumniName || "Rahul Sharma";
          ref.company = ref.company || "Google";
          ref.requestDate = ref.requestDate || "2026-06-07";
          updated = true;
        }
        return ref;
      });
      if (updated) {
        localStorage.setItem("referrals", JSON.stringify(updatedRefs));
      }
    }
  } catch (e) {
    console.error("Migration failed for referrals:", e);
  }
};

// Execute the seed BEFORE rendering the app
seedDatabase();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);  