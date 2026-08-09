import { useState, useRef, useEffect } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { ai as aiService } from "../../services/api";
import { toast } from "react-toastify";

function StudentChatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your AI Career Advisor. I have read your student profile and dynamically aggregated active job listings. Ask me anything about career matching, resume tips, or interview preparation!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "What jobs match my profile?",
    "How can I improve my resume for a backend developer role?",
    "Show me internships matching my skills.",
    "Draft a professional message requesting a job referral."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    const botMsgId = Date.now();
    console.log("[handleSend] Initialized message IDs. botMsgId =", botMsgId);

    // Create user and bot messages
    const userMsg = {
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const botMsg = {
      sender: "bot",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: botMsgId,
    };

    // Update messages state in a single atomic update
    setMessages((prev) => [...prev, userMsg, botMsg]);
    
    if (!textToSend) setInput("");
    setLoading(true);
    setMatches([]); // Clear matches for the new query

    try {
      const user = JSON.parse(localStorage.getItem("currentUser"));
      const token = user ? user.token : "";

      console.log("[handleSend] Initiating fetch to chatbot API...");
      const response = await fetch("http://localhost:9191/api/v1/ai/career/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ query: queryText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let buffer = "";
      let accumulatedReply = "";

      console.log("[handleSend] Reading stream chunks...");
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          
          // Split buffer by newline to process complete JSON chunks
          const lines = buffer.split("\n");
          // Keep the last partial line in buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const cleanedLine = line.trim();
            if (!cleanedLine) continue;
            try {
              console.log("[handleSend] Parsed line:", cleanedLine);
              const data = JSON.parse(cleanedLine);
              if (data.matches) {
                console.log("[handleSend] Found matches:", data.matches);
                setMatches(data.matches);
              }
              if (data.token !== undefined) {
                accumulatedReply += data.token;
                console.log("[handleSend] Token received:", JSON.stringify(data.token), "Accumulated length:", accumulatedReply.length);
                setMessages((prev) => {
                  const updated = prev.map((msg) => {
                    if (msg.id === botMsgId) {
                      console.log("[handleSend] Updating bot msg text. msg.id matches botMsgId.");
                      return { ...msg, text: accumulatedReply };
                    }
                    return msg;
                  });
                  return updated;
                });
              }
              if (data.error) {
                console.error("[handleSend] Stream error detail:", data.error);
              }
            } catch (err) {
              console.warn("[handleSend] JSON parse warning on stream line:", err, cleanedLine);
            }
          }
        }
      }

      // If buffer has anything left after stream ends
      const cleanedBuffer = buffer.trim();
      if (cleanedBuffer) {
        try {
          console.log("[handleSend] Parsing final buffer line:", cleanedBuffer);
          const data = JSON.parse(cleanedBuffer);
          if (data.matches) setMatches(data.matches);
          if (data.token !== undefined) {
            accumulatedReply += data.token;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMsgId ? { ...msg, text: accumulatedReply } : msg
              )
            );
          }
        } catch (err) {
          console.warn("[handleSend] JSON parse warning on final stream buffer:", err, buffer);
        }
      }

      console.log("[handleSend] Stream completed. Accumulated reply length:", accumulatedReply.length);
      // Fallback if no text was streamed
      if (!accumulatedReply) {
        console.warn("[handleSend] No tokens were streamed, applying fallback.");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, text: "I'm sorry, I couldn't generate a response." } : msg
          )
        );
      }

    } catch (error) {
      console.error("[handleSend] Error during fetch/stream:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                text: "Sorry, I had trouble reaching the AI service. Please make sure the AI microservice is running.",
              }
            : msg
        )
      );
      toast.error("Failed to connect to AI Career Advisor");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <StudentLayout>
      <div className="container-fluid py-2">
        <div className="row">
          {/* Chat Interface Column */}
          <div className="col-12 mb-4">
            <div className="card shadow border-0" style={{ height: "78vh", borderRadius: "16px", overflow: "hidden" }}>
              
              {/* Card Header */}
              <div className="card-header bg-dark text-white py-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary text-white d-flex align-items-center justify-content-center rounded-circle" style={{ width: "45px", height: "45px", fontSize: "22px" }}>
                    🤖
                  </div>
                  <div>
                    <h5 className="m-0 font-weight-bold">AI Career Advisor</h5>
                    <span className="badge bg-success rounded-pill p-1 px-2" style={{ fontSize: "10px" }}>Active RAG Agent</span>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-light" onClick={() => {
                  setMessages([
                    {
                      sender: "bot",
                      text: "Session cleared. How can I help you today?",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }
                  ]);
                  setMatches([]);
                }}>Clear History</button>
              </div>

              {/* Chat Message Box */}
              <div className="card-body bg-light d-flex flex-column" style={{ overflowY: "auto", flexGrow: "1" }}>
                
                {/* Message Threads */}
                <div className="flex-grow-1">
                  {messages.map((msg, index) => (
                    <div key={index} className={`d-flex flex-column mb-3 ${msg.sender === "user" ? "align-items-end" : "align-items-start"}`}>
                      <div className={`p-3 rounded-4 shadow-sm ${msg.sender === "user" ? "bg-primary text-white" : "bg-white text-dark"}`} 
                           style={{ 
                             maxWidth: "75%", 
                             borderRadius: msg.sender === "user" ? "20px 20px 2px 20px" : "20px 20px 20px 2px",
                             whiteSpace: "pre-line"
                           }}>
                        {msg.text}
                      </div>
                      <small className="text-muted mt-1 mx-2" style={{ fontSize: "10px" }}>{msg.timestamp}</small>
                    </div>
                  ))}
                  {loading && (
                    <div className="d-flex flex-column align-items-start mb-3">
                      <div className="p-3 rounded-4 bg-white text-dark shadow-sm d-flex align-items-center gap-2" style={{ borderRadius: "20px 20px 20px 2px" }}>
                        <span className="spinner-grow spinner-grow-sm text-primary" role="status" aria-hidden="true"></span>
                        <span className="spinner-grow spinner-grow-sm text-primary" role="status" aria-hidden="true"></span>
                        <span className="spinner-grow spinner-grow-sm text-primary" role="status" aria-hidden="true"></span>
                        <span className="small text-muted ms-1">Consulting profile and listings...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Prompts */}
                {messages.length === 1 && !loading && (
                  <div className="mt-auto border-top pt-3">
                    <h6 className="text-muted small mb-2">Suggested Topics:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {quickPrompts.map((prompt, i) => (
                        <button key={i} className="btn btn-outline-secondary btn-sm text-start rounded-pill px-3" onClick={() => handleSend(prompt)}>
                          ✨ {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Footer */}
              <div className="card-footer bg-white border-top p-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control rounded-pill-start border-end-0 py-2.5 px-4"
                    placeholder="Type your career query (e.g. Find matching Java roles)..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    style={{ borderTopLeftRadius: "24px", borderBottomLeftRadius: "24px" }}
                  />
                  <button
                    className="btn btn-primary px-4 d-flex align-items-center justify-content-center"
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                    style={{ borderTopRightRadius: "24px", borderBottomRightRadius: "24px" }}
                  >
                    <span className="d-none d-sm-inline me-1">Send</span>
                    <i className="bi bi-send-fill"></i>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}

export default StudentChatbot;
