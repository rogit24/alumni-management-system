import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";

import "./index.css";

import {
  mockUsers,
  mockMessages,
  mockJobs,
  mockApplications,
  mockReferrals
} from "./data/users"; 

const seedDatabase = () => {
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(mockUsers));
  }

  if (!localStorage.getItem("messages") || localStorage.getItem("messages") === "[]") {
    localStorage.setItem("messages", JSON.stringify(mockMessages));
  }

  if (!localStorage.getItem("jobs") || localStorage.getItem("jobs") === "[]") {
    localStorage.setItem("jobs", JSON.stringify(mockJobs));
  }

  if (!localStorage.getItem("applications") || localStorage.getItem("applications") === "[]") {
    localStorage.setItem("applications", JSON.stringify(mockApplications));
  }

  if (!localStorage.getItem("referrals") || localStorage.getItem("referrals") === "[]") {
    localStorage.setItem("referrals", JSON.stringify(mockReferrals));
  }
};


seedDatabase();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);  