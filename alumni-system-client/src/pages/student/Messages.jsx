import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { toast } from "react-toastify";
import { auth, messages as messagesApi, notifications as notificationsApi, profiles } from "../../services/api";

function Messages() {
  const [alumniList, setAlumniList] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    // Load current user profile for avatar display
    profiles.getMe()
      .then(data => setCurrentUserProfile(data))
      .catch(err => console.error("Error loading current user profile:", err));

    const fetchDirectory = async () => {
      try {
        const users = await auth.getAllUsers();
        const filteredAlumni = users.filter((u) => u && u.role?.toLowerCase() === "alumni" && u.email !== currentUser?.email);
        
        // Resolve profile pictures
        const resolvedAlumni = [];
        for (const alum of filteredAlumni) {
          try {
            const profileData = await profiles.getByUserId(alum.id);
            resolvedAlumni.push({
              ...alum,
              profileImage: profileData.profilePicture || ""
            });
          } catch (e) {
            resolvedAlumni.push({
              ...alum,
              profileImage: ""
            });
          }
        }
        setAlumniList(resolvedAlumni);

        const initiallySelected = JSON.parse(localStorage.getItem("selectedAlumni"));
        if (initiallySelected) {
          const found = resolvedAlumni.find((a) => a.email === initiallySelected.email);
          setSelectedAlumni(found || initiallySelected);
        } else if (resolvedAlumni.length > 0) {
          setSelectedAlumni(resolvedAlumni[0]);
        }
      } catch (err) {
        toast.error("Failed to load alumni directory ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, []);

  useEffect(() => {
    if (selectedAlumni) {
      localStorage.setItem("selectedAlumni", JSON.stringify(selectedAlumni));
    }
  }, [selectedAlumni]);

  const loadMessages = async () => {
    if (!selectedAlumni) return;

    try {
      const res = await messagesApi.getConversation(selectedAlumni.id);
      const resolvedMsgs = res.map((msg) => ({
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.senderId === currentUser.id ? currentUser.name : selectedAlumni.name,
        senderEmail: msg.senderEmail,
        receiverName: msg.senderId === currentUser.id ? selectedAlumni.name : currentUser.name,
        receiverEmail: msg.receiverEmail,
        message: msg.messageContent,
        date: msg.sentAt ? new Date(msg.sentAt).toLocaleString() : "Just now",
      }));
      setMessages(resolvedMsgs);

      // Mark received unread messages as read
      res.forEach(async (msg) => {
        if (msg.receiverId === currentUser.id && !msg.readStatus) {
          try {
            await messagesApi.markAsRead(msg.id);
          } catch (e) {
            console.error("Failed to mark message as read", e);
          }
        }
      });
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  useEffect(() => {
    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedAlumni]);

  const sendMessage = async () => {
    if (!selectedAlumni) {
      toast.warning("Please select a recipient");
      return;
    }

    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      const payload = {
        receiverId: selectedAlumni.id,
        messageContent: messageText,
      };

      await messagesApi.sendMessage(payload);

      // Trigger notification
      try {
        await notificationsApi.createNotification({
          userId: selectedAlumni.id,
          title: "New Message Received",
          message: `You received a new message from ${currentUser.name}: "${messageText.substring(0, 30)}${messageText.length > 30 ? '...' : ''}"`,
          type: "MESSAGE"
        });
      } catch (notifErr) {
        console.error("Failed to send message notification", notifErr);
      }

      setMessageText("");
      loadMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message ❌");
    }
  };

  const filteredAlumniList = alumniList.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StudentLayout>
      <div className="container-fluid py-2" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <div>
            <h2 className="fw-bold text-dark m-0">Alumni Messages Inbox</h2>
            <p className="text-muted m-0">Direct chat and career guidance center</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Opening guidance channels...</p>
          </div>
        ) : (
          <div className="row g-4">
            {/* Left Column: Alumni Contact List */}
            <div className="col-md-4">
              <div className="card border-0 rounded-4 shadow-sm bg-white" style={{ minHeight: "600px" }}>
                <div className="card-header bg-transparent fw-bold text-dark border-0 pt-4 px-4 pb-2">
                  Alumni Directory
                </div>
                <div className="px-4 mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 bg-light"
                      placeholder="Search alumni..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="card-body p-0" style={{ overflowY: "auto", maxHeight: "480px" }}>
                  {filteredAlumniList.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-people fs-1 d-block mb-2 text-secondary"></i>
                      <span>No alumni found</span>
                    </div>
                  ) : (
                    filteredAlumniList.map((alumni) => {
                      const isSelected = selectedAlumni?.email === alumni.email;
                      return (
                        <div
                          key={alumni.email}
                          className={`d-flex align-items-center gap-3 p-3 border-bottom cursor-pointer transition-all ${
                            isSelected ? "bg-primary-subtle text-primary border-start border-primary border-4" : "hover-bg-light"
                          }`}
                          onClick={() => setSelectedAlumni(alumni)}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src={alumni.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                            alt={alumni.name}
                            className="rounded-circle border shadow-sm"
                            style={{ width: "42px", height: "42px", objectFit: "cover" }}
                          />
                          <div className="flex-grow-1 min-w-0">
                            <h6 className="m-0 fw-bold text-truncate text-dark">{alumni.name}</h6>
                            <small className="text-muted d-block text-truncate">{alumni.email}</small>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Chat Box */}
            <div className="col-md-8">
              <div className="card border-0 rounded-4 shadow-sm bg-white d-flex flex-column" style={{ minHeight: "600px" }}>
                {selectedAlumni ? (
                  <>
                    {/* Chat Box Header */}
                    <div className="card-header bg-transparent border-bottom p-4 d-flex align-items-center gap-3">
                      <img
                        src={selectedAlumni.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt={selectedAlumni.name}
                        className="rounded-circle border shadow-sm"
                        style={{ width: "46px", height: "46px", objectFit: "cover" }}
                      />
                      <div>
                        <h5 className="m-0 fw-bold text-dark">{selectedAlumni.name}</h5>
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 rounded-pill small fw-semibold">
                          Verified Alumni
                        </span>
                      </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div
                      className="card-body p-4 flex-grow-1"
                      style={{
                        height: "400px",
                        overflowY: "auto",
                        background: "#f8fafc",
                      }}
                    >
                      {messages.length === 0 ? (
                        <div className="text-center mt-5 text-muted py-5">
                          <i className="bi bi-chat-left-dots fs-1 d-block mb-3 text-secondary"></i>
                          <h5>No messages yet</h5>
                          <p className="small">Send a message to start conversation guidance!</p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isMine = msg.senderId === currentUser?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`d-flex mb-3 gap-2 ${isMine ? "justify-content-end" : "justify-content-start"}`}
                            >
                              {!isMine && (
                                <img
                                  src={selectedAlumni.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                  alt={selectedAlumni.name}
                                  className="rounded-circle border"
                                  style={{ width: "32px", height: "32px", objectFit: "cover", alignSelf: "flex-end" }}
                                />
                              )}
                              <div
                                className={`p-3 rounded-4 shadow-sm ${
                                  isMine ? "bg-primary text-white" : "bg-white text-dark border border-light-subtle"
                                }`}
                                style={{ maxWidth: "70%" }}
                              >
                                {!isMine && <strong className="d-block small mb-1 text-primary">{msg.senderName}</strong>}
                                <p className="mb-1">{msg.message}</p>
                                <small className={`d-block text-end mt-1 ${isMine ? "text-white-50" : "text-muted"}`} style={{ fontSize: "10px" }}>
                                  {msg.date}
                                </small>
                              </div>
                              {isMine && (
                                <img
                                  src={currentUserProfile?.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                  alt="Me"
                                  className="rounded-circle border"
                                  style={{ width: "32px", height: "32px", objectFit: "cover", alignSelf: "flex-end" }}
                                />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Message Input Form */}
                    <div className="card-footer bg-transparent border-top p-3">
                      <div className="input-group shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                        <input
                          type="text"
                          className="form-control border-end-0 py-3"
                          placeholder={`Type a message to ${selectedAlumni.name}...`}
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              sendMessage();
                            }
                          }}
                        />
                        <button className="btn btn-primary px-4 border-start-0" onClick={sendMessage}>
                          <i className="bi bi-send-fill"></i>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-muted py-5">
                    <i className="bi bi-chat-dots fs-1 d-block mb-3 text-secondary"></i>
                    <h5>Select an alumni to start messaging</h5>
                    <p className="small">Choose an alumni profile from the directory on the left.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default Messages;