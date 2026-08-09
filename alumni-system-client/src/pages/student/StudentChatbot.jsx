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

    // Add user message
    const userMsg = {
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await aiService.chatWithCareerAdvisor(queryText);
      
      const botMsg = {
        sender: "bot",
        text: response.reply || "I'm sorry, I couldn't process that query.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Set matches if returned
      if (response.matches && response.matches.length > 0) {
        setMatches(response.matches);
      }
    } catch (error) {
      console.error(error);
      const botErrorMsg = {
        sender: "bot",
        text: "Sorry, I had trouble reaching the AI service. Please make sure the AI microservice is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botErrorMsg]);
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
          <div className={matches.length > 0 ? "col-lg-8 mb-4" : "col-12 mb-4"}>
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

          {/* Job Recommendation Column */}
          {matches.length > 0 && (
            <div className="col-lg-4">
              <div className="card shadow border-0" style={{ height: "78vh", borderRadius: "16px", overflow: "hidden" }}>
                <div className="card-header bg-primary text-white py-3">
                  <h5 className="m-0 font-weight-bold d-flex align-items-center gap-2">
                    🎯 Recommended Matches
                  </h5>
                </div>
                <div className="card-body p-3" style={{ overflowY: "auto" }}>
                  <p className="text-muted small mb-3">AI identified the following real-time listings matching your credentials and query query:</p>
                  
                  {matches.map((job) => (
                    <div key={job.id} className="card border-primary mb-3 shadow-sm hover-card">
                      <div className="card-body p-3">
                        <span className="badge bg-light text-primary border border-primary rounded-pill mb-2 float-end">{job.jobType}</span>
                        <h6 className="card-title font-weight-bold mb-1">{job.title}</h6>
                        <p className="text-muted small mb-2">{job.company} • {job.location}</p>
                        <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                          <span className="text-success small font-weight-bold">💰 {job.salary} Package</span>
                          <span className="badge bg-info text-dark rounded-pill">Match Score: {job.matchScore ? Math.round(job.matchScore * 100) : 92}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </StudentLayout>
  );
}

export default StudentChatbot;
