import { useEffect, useState } from "react";
import AlumniLayout from "../../layouts/AlumniLayout";
import { toast } from "react-toastify";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
  );

  const loadMessages = () => {
    const allMessages =
      JSON.parse(localStorage.getItem("messages")) || [];

    const myMessages = allMessages
      .filter(
        (msg) =>
          msg.senderEmail === currentUser?.email ||
          msg.receiverEmail === currentUser?.email
      )
      .sort(
        (a, b) =>
          new Date(a.date) - new Date(b.date)
      );

    setMessages(myMessages);
  };

  useEffect(() => {
    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sendReply = () => {
    if (!replyText.trim()) {
      toast.error("Please Enter Message");
      return;
    }

    const studentMessage = messages.find(
      (msg) =>
        msg.senderEmail !== currentUser?.email
    );

    if (!studentMessage) {
      toast.warning("No Student Selected");
      return;
    }

    const allMessages =
      JSON.parse(localStorage.getItem("messages")) || [];

    const newMessage = {
      id: Date.now(),

      senderName: currentUser?.name,
      senderEmail: currentUser?.email,

      receiverName: studentMessage.senderName,
      receiverEmail: studentMessage.senderEmail,

      message: replyText,
      date: new Date().toLocaleString(),
    };

    allMessages.push(newMessage);

    localStorage.setItem(
      "messages",
      JSON.stringify(allMessages)
    );

    setReplyText("");

    loadMessages();

    toast.success("Message Sent Successfully");
  };

  return (
    <AlumniLayout>
      <div className="container">

        <div className="card shadow p-3 mb-3">
          <h3>Student Chat</h3>
        </div>

        <div
          className="card shadow p-3 mb-3"
          style={{
            height: "500px",
            overflowY: "auto",
          }}
        >
          {messages.length === 0 ? (
            <div className="text-center mt-5">
              <h5>No Messages Found</h5>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine =
                msg.senderEmail === currentUser?.email;

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
                    className={`p-3 rounded shadow ${
                      isMine
                        ? "bg-primary text-white"
                        : "bg-light text-dark"
                    }`}
                    style={{
                      maxWidth: "70%",
                    }}
                  >
                    <strong>
                      {isMine
                        ? "You"
                        : msg.senderName}
                    </strong>

                    <p className="mb-1 mt-2">
                      {msg.message}
                    </p>

                    <small>
                      {msg.date}
                    </small>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="card shadow p-3">
          <div className="input-group">

            <input
              type="text"
              className="form-control"
              placeholder="Type Message..."
              value={replyText}
              onChange={(e) =>
                setReplyText(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendReply();
                }
              }}
            />

            <button
              className="btn btn-primary"
              onClick={sendReply}
            >
              Send
            </button>

          </div>
        </div>

      </div>
    </AlumniLayout>
  );
}

export default Messages;