import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { toast } from "react-toastify";
import { jobs as jobsService, applications, auth, notifications as notificationsApi, referrals as referralsApi, messages as messagesApi } from "../../services/api";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [autoRequestReferral, setAutoRequestReferral] = useState(true);
  const [autoSendMessage, setAutoSendMessage] = useState(true);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobsService.getAll();
        setJobs(data);
      } catch (error) {
        toast.error("Failed to load jobs from backend ❌");
      }
    };
    fetchJobs();
  }, []);

  const openApplyModal = (job) => {
    setSelectedJobForApply(job);
    setAutoRequestReferral(true);
    setAutoSendMessage(true);
    setIsApplyModalOpen(true);
  };

  const submitJobApplication = async () => {
    if (!selectedJobForApply) return;
    setIsSubmittingApp(true);
    try {
      const job = selectedJobForApply;
      // 1. Submit Job Application
      await applications.submit({ jobId: job.id });
      toast.success(`Successfully applied for ${job.title} 🎉`);

      // Find target alumni user
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const allUsers = await auth.getAllUsers();
      const alumniUser = allUsers.find(u => u.email === job.postedByEmail);

      if (alumniUser) {
        // 2. Automatically request referral if opted in
        if (autoRequestReferral) {
          try {
            await referralsApi.create({
              studentId: currentUser.id,
              alumniId: alumniUser.id,
              company: job.company,
              jobRole: job.title,
              message: `Auto-generated request via application for ${job.title}.`,
              requestDate: new Date().toLocaleDateString(),
            });
            // Send Referral Notification
            await notificationsApi.createNotification({
              userId: alumniUser.id,
              title: "New Referral Request",
              message: `${currentUser.name} requested a referral for ${job.company} (${job.title}).`,
              type: "REFERRAL"
            });
          } catch (refErr) {
            console.error("Failed to auto-create referral request", refErr);
          }
        }

        // 3. Automatically send chat message if opted in
        if (autoSendMessage) {
          try {
            const chatMsg = `Hello! I have just applied for your job post '${job.title}' and requested your referral. Please review my profile and resume.`;
            await messagesApi.sendMessage({
              receiverId: alumniUser.id,
              messageContent: chatMsg
            });
            // Send Message Notification
            await notificationsApi.createNotification({
              userId: alumniUser.id,
              title: "New Message Received",
              message: `You received a new message from ${currentUser.name}: "${chatMsg.substring(0, 30)}..."`,
              type: "MESSAGE"
            });
          } catch (msgErr) {
            console.error("Failed to auto-send chat message", msgErr);
          }
        }

        // 4. Send Job Application Notification
        try {
          await notificationsApi.createNotification({
            userId: alumniUser.id,
            title: "New Job Application",
            message: `${currentUser.name} has applied for your job post: ${job.title}.`,
            type: "JOB"
          });
        } catch (notifErr) {
          console.error("Failed to send job application notification", notifErr);
        }
      }
      setIsApplyModalOpen(false);
      setSelectedJobForApply(null);
    } catch (error) {
      const errMsg = error.response?.data?.message || `Failed to apply for ${selectedJobForApply.title} ❌`;
      toast.error(errMsg);
    } finally {
      setIsSubmittingApp(false);
    }
  };

  return (
    <StudentLayout>
      <div className="container">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Available Jobs</h2>

          <span className="badge bg-primary fs-6">
            Total Jobs: {jobs.length}
          </span>
        </div>

        {jobs.length === 0 ? (
          <div className="card shadow p-4 text-center">
            <h5>No Jobs Available</h5>
            <p>
              Alumni have not posted any jobs yet.
            </p>
          </div>
        ) : (
          <div className="row">

            {jobs.map((job) => (
              <div
                className="col-lg-6 mb-4"
                key={job.id}
              >
                <div className="card shadow border-0 h-100">

                  <div className="card-body">

                    <h4 className="mb-3">
                      {job.title}
                    </h4>

                    <p>
                      <strong>Company:</strong>{" "}
                      {job.company}
                    </p>

                    <p>
                      <strong>Salary:</strong>{" "}
                      {job.salary}
                    </p>

                    {job.location && (
                      <p>
                        <strong>Location:</strong>{" "}
                        {job.location}
                      </p>
                    )}

                    {job.description && (
                      <p>
                        <strong>Description:</strong>{" "}
                        {job.description}
                      </p>
                    )}

                    <button
                      className="btn btn-success w-100"
                      onClick={() =>
                        openApplyModal(job)
                      }
                    >
                      Apply Now
                    </button>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>

      {/* Job Application Confirmation Modal */}
      {isApplyModalOpen && selectedJobForApply && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            className="card border-0 text-dark shadow-lg"
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "#ffffff",
              borderRadius: "16px"
            }}
          >
            <div className="card-header bg-transparent border-bottom p-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0 text-dark">Confirm Application</h5>
              <button
                className="btn-close"
                onClick={() => {
                  setIsApplyModalOpen(false);
                  setSelectedJobForApply(null);
                }}
              ></button>
            </div>

            <div className="card-body p-4">
              <p className="text-secondary mb-3">
                You are applying for <strong>{selectedJobForApply.title}</strong> at <strong>{selectedJobForApply.company}</strong>.
              </p>

              <h6 className="fw-bold mb-3 text-dark" style={{ fontSize: "0.9rem" }}>Application Actions:</h6>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="autoReferralCheck"
                  checked={autoRequestReferral}
                  onChange={(e) => setAutoRequestReferral(e.target.checked)}
                />
                <label className="form-check-label text-dark" htmlFor="autoReferralCheck" style={{ fontSize: "0.88rem" }}>
                  <strong>🤝 Request Alumni Referral</strong>
                  <span className="d-block text-muted" style={{ fontSize: "0.78rem" }}>
                    Automatically submit a referral request to the posting alumni.
                  </span>
                </label>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="autoMessageCheck"
                  checked={autoSendMessage}
                  onChange={(e) => setAutoSendMessage(e.target.checked)}
                />
                <label className="form-check-label text-dark" htmlFor="autoMessageCheck" style={{ fontSize: "0.88rem" }}>
                  <strong>💬 Send Direct Message</strong>
                  <span className="d-block text-muted" style={{ fontSize: "0.78rem" }}>
                    Automatically send a chat message to the alumni informing them about your application.
                  </span>
                </label>
              </div>
            </div>

            <div className="card-footer bg-transparent border-top p-3 d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsApplyModalOpen(false);
                  setSelectedJobForApply(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={submitJobApplication}
                disabled={isSubmittingApp}
              >
                {isSubmittingApp ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

export default Jobs;