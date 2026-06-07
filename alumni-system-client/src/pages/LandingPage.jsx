import React from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      {/* Premium Navigation Header */}
      <nav className="auth-navbar d-flex justify-content-between align-items-center">
        <h3 className="logo-text m-0 d-flex align-items-center gap-2">
          <span>🎓</span> AlumniConnect
        </h3>
        <div>
          <Button 
            variant="outline-light" 
            onClick={() => navigate('/login')} 
            className="fw-bold px-4 py-2 rounded-pill me-2"
          >
            Sign In
          </Button>
          <Button 
            className="gradient-btn px-4 py-2 rounded-pill border-0"
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Showcase Center Layout */}
      <Container className="hero-section d-flex align-items-center py-5">
        <Row className="align-items-center gy-5">
          {/* Left Column: Heading and description */}
          <Col lg={6} className="text-start">
            <span className="badge bg-light text-primary border px-3 py-2 rounded-pill fw-bold mb-3 shadow-sm text-uppercase tracking-wider">
              ✨ Empowering Next-Gen Careers
            </span>
            <h1 className="project-title mb-4">
              Bridge the Gap Between Students & Alumni
            </h1>
            <p className="project-desc mb-4">
              A professional network designed exclusively for our university institution. Communicate in real-time, get career guidance, and apply for high-value referrals directly from your global alumni community.
            </p>
            <div className="d-flex flex-wrap gap-3 mb-5">
              <Button 
                size="lg" 
                className="gradient-btn px-5 py-3 border-0 d-flex align-items-center gap-2"
                onClick={() => navigate('/login')}
              >
                Enter Platform <i className="bi bi-arrow-right"></i>
              </Button>
              <Button 
                size="lg" 
                variant="outline-dark" 
                onClick={() => navigate('/register')} 
                className="px-5 py-3 fw-bold rounded-3 border-2"
                style={{ borderRadius: '12px' }}
              >
                Create Account
              </Button>
            </div>
            
            {/* Trust factors */}
            <div className="d-flex align-items-center gap-4 text-muted">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-check text-success fs-5"></i>
                <span className="fw-semibold small">Verified Community</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-lightning-charge-fill text-warning fs-5"></i>
                <span className="fw-semibold small">Instant Referrals</span>
              </div>
            </div>
          </Col>

          {/* Right Column: Visual Mockup Showcase */}
          <Col lg={6}>
            <div className="position-relative p-4">
              {/* Decorative background gradients */}
              <div className="position-absolute bg-primary rounded-circle blur-3xl opacity-10" style={{ width: '300px', height: '300px', top: '-10%', right: '-10%', filter: 'blur(80px)' }}></div>
              <div className="position-absolute bg-purple rounded-circle blur-3xl opacity-10" style={{ width: '250px', height: '250px', bottom: '-10%', left: '-10%', filter: 'blur(75px)' }}></div>

              {/* Interactive Dashboard Mockup Card */}
              <Card className="card-dark border-0 p-4 shadow-lg position-relative" style={{ zIndex: 2 }}>
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="bg-primary text-white p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                      💼
                    </span>
                    <span className="fw-bold text-dark">Portal Preview</span>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill fw-bold small">
                    Live Connections
                  </span>
                </div>

                {/* Simulated Referral Card */}
                <div className="bg-light p-3 rounded-4 mb-3 border border-light-subtle d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-3">🤝</span>
                    <div>
                      <h6 className="m-0 fw-bold text-dark">Google Referral Approved</h6>
                      <small className="text-muted">By Rahul Sharma (Alumni)</small>
                    </div>
                  </div>
                  <span className="badge bg-success text-white px-2 py-1 rounded">Approved</span>
                </div>

                {/* Simulated Job Card */}
                <div className="bg-light p-3 rounded-4 mb-3 border border-light-subtle d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-3">💻</span>
                    <div>
                      <h6 className="m-0 fw-bold text-dark">Software Engineer Intern</h6>
                      <small className="text-muted">Google • Posted Today</small>
                    </div>
                  </div>
                  <span className="badge bg-primary text-white px-2 py-1 rounded">Apply Now</span>
                </div>

                {/* Simulated Chat Bubble */}
                <div className="bg-primary-subtle text-primary p-3 rounded-4 border border-primary-subtle d-flex align-items-start gap-3">
                  <span className="fs-4">💬</span>
                  <div>
                    <h6 className="m-0 fw-bold">Message from Amit Patel</h6>
                    <p className="m-0 small text-primary-emphasis mt-1">"Hello Sir, I wanted to ask if I could get a referral for the SWE intern role?"</p>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Feature Highlights Grid */}
      <Container className="py-5 my-5 border-top border-light-subtle">
        <Row className="text-center mb-5">
          <Col lg={12}>
            <h2 className="fw-extrabold text-dark display-5 mb-3">Our Platform Ecosystem</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px', fontSize: '1.1rem' }}>
              Explore the critical networking features created to accelerate professional development and job hunting.
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          <Col md={3}>
            <Card className="card-dark border-0 p-4 h-100 text-start">
              <div className="fs-1 mb-3">💼</div>
              <h5 className="fw-bold text-dark">Job Board</h5>
              <p className="text-muted small">Explore high-quality internships and full-time vacancies uploaded directly by institution alumni.</p>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card-dark border-0 p-4 h-100 text-start">
              <div className="fs-1 mb-3">🤝</div>
              <h5 className="fw-bold text-dark">Referral Engine</h5>
              <p className="text-muted small">Send official referral requests to alumni working in your target corporate tech companies.</p>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card-dark border-0 p-4 h-100 text-start">
              <div className="fs-1 mb-3">💬</div>
              <h5 className="fw-bold text-dark">Direct Chats</h5>
              <p className="text-muted small">Communicate natively using the secure built-in real-time inbox to seek guidance.</p>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="card-dark border-0 p-4 h-100 text-start">
              <div className="fs-1 mb-3">🔔</div>
              <h5 className="fw-bold text-dark">Live Alerts</h5>
              <p className="text-muted small">Get real-time push alerts tracking your referral approvals, messages, and job updates.</p>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Statistics section */}
      <Container className="py-4">
        <Row className="g-4 mb-5">
          <Col md={4}>
            <div className="stats-card">
              <h2>500+</h2>
              <p>Registered Students</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="stats-card">
              <h2>200+</h2>
              <p>Active Alumni</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="stats-card">
              <h2>100+</h2>
              <p>Total Job Placements</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Footer Branding Bar */}
      <div className="footer">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <small className="text-muted">Alumni Connect Framework Setup • CDAC Sprint Sprint Evaluation</small>
          <small className="text-muted fw-bold">© 2026 Evaluation Sprint. All rights reserved.</small>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;