import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";

function StudentDashboard() {
  const [stats, setStats] = useState({
    jobs: 0,
    applications: 0,
    referrals: 0,
    messages: 0,
  });

  const [userName, setUserName] =
    useState("");

  useEffect(() => {
    const jobs =
      JSON.parse(localStorage.getItem("jobs")) || [];

    const applications =
      JSON.parse(
        localStorage.getItem("applications")
      ) || [];

    const referrals =
      JSON.parse(
        localStorage.getItem("referrals")
      ) || [];

    const messages =
      JSON.parse(
        localStorage.getItem("messages")
      ) || [];

    const currentUser =
      JSON.parse(
        localStorage.getItem("currentUser")
      );

    setUserName(
      currentUser?.name || "Student"
    );

    setStats({
      jobs: jobs.length,
      applications: applications.length,
      referrals: referrals.length,
      messages: messages.length,
    });
  }, []);