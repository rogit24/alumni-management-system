import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser"));

  const selectedAlumni =
    JSON.parse(localStorage.getItem("selectedAlumni"));

  const loadMessages = () => {
    const allMessages =
      JSON.parse(localStorage.getItem("messages")) || [];

    const conversation = allMessages.filter(
      (msg) =>
        (msg.senderEmail === currentUser?.email &&
          msg.receiverEmail === selectedAlumni?.email) ||
        (msg.senderEmail === selectedAlumni?.email &&
          msg.receiverEmail === currentUser?.email)
    );

    setMessages(conversation);
  };

  useEffect(() => {
    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!messageText.trim()) {
      alert("Enter Message");
      return;
    }

    const allMessages =
      JSON.parse(localStorage.getItem("messages")) || [];

    const newMessage = {
      id: Date.now(),
      senderName: currentUser.name,
      senderEmail: currentUser.email,

      receiverName: selectedAlumni.name,
      receiverEmail: selectedAlumni.email,

      message: messageText,
      date: new Date().toLocaleString(),
    };

    allMessages.push(newMessage);

    localStorage.setItem(
      "messages",
      JSON.stringify(allMessages)
    );

    setMessageText("");

    loadMessages();
  };

  return (
    <StudentLayout>
      <div className="container">

        <div className="card shadow p-3 mb-3">
          <h4>
            Chat with {selectedAlumni?.name}
          </h4>
        </div>

        <div
          className="card shadow p-3 mb-3"
          style={{
            height: "500px",
            overflowY: "auto",
          }}
        >

          {messages.map((msg) => {

            const isMine =
              msg.senderEmail === currentUser.email;

            return (
              <div
                key={msg.id}
                className={`d-flex mb-3 ${
                  isMine
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`p-3 rounded ${
                    isMine
                      ? "bg-primary text-white"
                      : "bg-light"
                  }`}
                  style={{
                    maxWidth: "70%",
                  }}
                >
                  <p className="mb-1">
                    {msg.message}
                  </p>

                  <small>
                    {msg.date}
                  </small>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card shadow p-3">

          <div className="input-group">

            <input
              type="text"
              className="form-control"
              placeholder="Type Message..."
              value={messageText}
              onChange={(e) =>
                setMessageText(e.target.value)
              }
            />

            <button
              className="btn btn-primary"
              onClick={sendMessage}
            >
              Send
            </button>

          </div>

        </div>

      </div>
    </StudentLayout>
  ); 
}

export default Messages;