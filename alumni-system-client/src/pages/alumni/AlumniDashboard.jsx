import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { jobs as jobsService, applications, referrals, messages } from "../../services/api";

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
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    setUserName(currentUser.name || "Alumni");

    const fetchStats = async () => {
      try {
        const jobsList = await jobsService.getAll();
        const myJobs = jobsList.filter(j => j.postedByEmail === currentUser.email);

        let appCount = 0;
        for (const job of myJobs) {
          try {
            const apps = await applications.getApplicationsForJob(job.id);
            appCount += apps.length;
          } catch (e) {}
        }

        const refsList = await referrals.getAlumniReferrals(currentUser.id);
        const inboxList = await messages.getMyInbox();

        setStats({
          jobs: myJobs.length,
          applications: appCount,
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