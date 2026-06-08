import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";

function AlumniDashboard() {
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
      currentUser?.name || "Alumni"
    );

    const myMessages = messages.filter(
      (msg) =>
        msg &&
        (msg.senderEmail === currentUser?.email ||
          msg.receiverEmail === currentUser?.email)
    );

    setStats({
      jobs: jobs.length,
      applications: applications.length,
      referrals: referrals.length,
      messages: myMessages.length,
    });
  }, []);

  return (
    <AlumniLayout>
      <div className="container-fluid">


        <div className="mb-5">
          <h2 className="fw-bold">
            🎓 Alumni Dashboard
          </h2>

          <p className="text-light">
            Welcome back, {userName}
          </p>
        </div>


        <div className="row g-4">

          <div className="col-md-3">
            <div className="alumni-card alumni-card-blue p-4 position-relative">

              <div className="card-icon">
                💼
              </div>

              <h2>{stats.jobs}</h2>

              <p>Posted Jobs</p>

            </div>
          </div>

          <div className="col-md-3">
            <div className="alumni-card alumni-card-green p-4 position-relative">

              <div className="card-icon">
                📄
              </div>

              <h2>
                {stats.applications}
              </h2>

              <p>Applications</p>

            </div>
          </div>

          <div className="col-md-3">
            <div className="alumni-card alumni-card-orange p-4 position-relative">

              <div className="card-icon">
                🤝
              </div>

              <h2>{stats.referrals}</h2>

              <p>Referral Requests</p>

            </div>
          </div>

          <div className="col-md-3">
            <div className="alumni-card alumni-card-purple p-4 position-relative">

              <div className="card-icon">
                💬
              </div>

              <h2>{stats.messages}</h2>

              <p>Messages</p>

            </div>
          </div>

        </div>


       

      </div>
    </AlumniLayout>
  );
}

export default AlumniDashboard;