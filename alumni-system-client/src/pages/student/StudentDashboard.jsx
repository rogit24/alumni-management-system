import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { jobs as jobsService, applications, referrals, messages } from "../../services/api";

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
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    setUserName(currentUser.name || "Student");

    const fetchStats = async () => {
      try {
        const jobsList = await jobsService.getAll();
        const appsList = await applications.getMyApplications();
        const refsList = await referrals.getStudentReferrals(currentUser.id);
        const inboxList = await messages.getMyInbox();

        setStats({
          jobs: jobsList.length,
          applications: appsList.length,
          referrals: refsList.length,
          messages: inboxList.length,
        });
      } catch (error) {
        console.error("Failed to load dashboard metrics", error);
      }
    };

    fetchStats();
  }, []);

   return (
    <StudentLayout>
      <div className="container-fluid">

        {/* Welcome Section */}

        <div className="mb-5">
          <h2 className="fw-bold">
            🎓 Student Dashboard
          </h2>

          <p className="text-light">
            Welcome back, {userName}
          </p>
        </div>

        {/* Dashboard Cards */}

        <div className="row g-4">

          <div className="col-md-3">
            <div className="student-card student-card-blue p-4 position-relative">

              <div className="card-icon">
                💼
              </div>

              <h2>{stats.jobs}</h2>

              <p>Available Jobs</p>

            </div>
          </div>

          <div className="col-md-3">
            <div className="student-card student-card-green p-4 position-relative">

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
            <div className="student-card student-card-orange p-4 position-relative">

              <div className="card-icon">
                🤝
              </div>

              <h2>{stats.referrals}</h2>

              <p>Referrals</p>

            </div>
          </div>

          <div className="col-md-3">
            <div className="student-card student-card-purple p-4 position-relative">

              <div className="card-icon">
                💬
              </div>

              <h2>{stats.messages}</h2>

              <p>Messages</p>

            </div>
          </div>

        </div>

        {/* Quick Info Section */}

     

      </div>
    </StudentLayout>
  );
}

export default StudentDashboard;