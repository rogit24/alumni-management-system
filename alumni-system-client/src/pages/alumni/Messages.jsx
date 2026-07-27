import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";
import { auth, messages as messagesApi } from "../../services/api";

function Messages() {
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const users = await auth.getAllUsers();
        const filteredStudents = users.filter((u) => u && u.role?.toLowerCase() === "student" && u.email !== currentUser?.email);
        setStudentList(filteredStudents);

        const initiallySelected = JSON.parse(localStorage.getItem("selectedStudent"));
        if (initiallySelected) {
          const found = filteredStudents.find((s) => s.email === initiallySelected.email);
          setSelectedStudent(found || initiallySelected);
        } else if (filteredStudents.length > 0) {
          setSelectedStudent(filteredStudents[0]);
        }
      } catch (err) {
        toast.error("Failed to load student directory ❌");
      }
    };
    fetchDirectory();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      localStorage.setItem("selectedStudent", JSON.stringify(selectedStudent));
    }
  }, [selectedStudent]);

  const loadMessages = async () => {
    if (!selectedStudent) return;

    try {
      const res = await messagesApi.getConversation(selectedStudent.id);
      const resolvedMsgs = res.map((msg) => ({
        id: msg.id,
        senderName: msg.senderId === currentUser.id ? currentUser.name : selectedStudent.name,
        senderEmail: msg.senderEmail,
        receiverName: msg.senderId === currentUser.id ? selectedStudent.name : currentUser.name,
        receiverEmail: msg.receiverEmail,
        message: msg.messageContent,
        date: msg.sentAt ? new Date(msg.sentAt).toLocaleString() : "Just now",
      }));
      setMessages(resolvedMsgs);
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
  }, [selectedStudent]);

  const sendMessage = async () => {
    if (!selectedStudent) {
      toast.warning("Please select a student to message");
      return;
    }

    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      const payload = {
        receiverId: selectedStudent.id,
        messageContent: messageText,
      };

      await messagesApi.sendMessage(payload);
      setMessageText("");
      loadMessages();
      toast.success("Message sent successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message ❌");
    }
  };

  const filteredStudentList = studentList.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AlumniLayout>
      <div className="container-fluid py-2">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <div>
            <h2 className="fw-bold text-dark m-0">Student Messages Inbox</h2>
            <p className="text-muted m-0">Review Guidance Chats and Referral Inquiries</p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card shadow-sm h-100 bg-white" style={{ minHeight: "600px" }}>
              <div className="card-header bg-transparent fw-bold text-dark border-0 pt-4 px-4 pb-2">
                Student Directory
              </div>
              <div className="px-4 mb-3">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 bg-light"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="card-body p-0" style={{ overflowY: "auto", maxHeight: "480px" }}>
                {filteredStudentList.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-1 d-block mb-2 text-secondary"></i>
                    <span>No students found</span>
                  </div>
                ) : (
                  filteredStudentList.map((student) => {
                    const isSelected = selectedStudent?.email === student.email;
                    return (
                      <div
                        key={student.email}
                        className={`d-flex align-items-center gap-3 p-3 border-bottom cursor-pointer transition-all ${
                          isSelected ? "bg-primary-subtle text-primary border-start border-primary border-4" : "hover-bg-light"
                        }`}
                        onClick={() => setSelectedStudent(student)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          className="rounded-circle bg-secondary-subtle text-secondary fw-bold d-flex align-items-center justify-content-center"
                          style={{ width: "42px", height: "42px" }}
                        >
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <h6 className="m-0 fw-bold text-truncate text-dark">{student.name}</h6>
                          <small className="text-muted d-block text-truncate">{student.email}</small>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card shadow-sm h-100 bg-white d-flex flex-column" style={{ minHeight: "600px" }}>
              {selectedStudent ? (
                <>
                  <div className="card-header bg-transparent border-bottom p-4 d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                      style={{ width: "46px", height: "46px", fontSize: "1.2rem" }}
                    >
                      {selectedStudent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="m-0 fw-bold text-dark">{selectedStudent.name}</h5>
                      <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-0.5 rounded-pill small fw-semibold">
                        Student
                      </span>
                    </div>
                  </div>

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
                        <p className="small">Send a message to introduce yourself or reply to their questions.</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMine = msg.senderEmail === currentUser?.email;
                        return (
                          <div
                            key={msg.id}
                            className={`d-flex mb-3 ${isMine ? "justify-content-end" : "justify-content-start"}`}
                          >
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
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="card-footer bg-transparent border-top p-3">
                    <div className="input-group shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
                      <input
                        type="text"
                        className="form-control border-end-0 py-3"
                        placeholder={`Type a message to ${selectedStudent.name}...`}
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
                  <h5>Select a student to start messaging</h5>
                  <p className="small">Choose a student profile from the directory on the left.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AlumniLayout>
  );
}

export default Messages;