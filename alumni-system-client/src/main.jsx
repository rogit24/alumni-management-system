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
};

// Execute the seed BEFORE rendering the app
seedDatabase();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);  