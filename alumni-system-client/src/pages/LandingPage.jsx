import React from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';

function LandingPage() {
  return (
    <Container fluid className="vh-100 p-0 d-flex flex-column justify-content-between bg-white">
      {/* Simple Header Navbar Banner */}
      <div className="d-flex justify-content-between align-items-center px-5 py-4 border-bottom">
        <h3 className="fw-black m-0 tracking-wider">AC</h3>
        <Button variant="dark" onClick={() => window.location.href = '/auth'} className="fw-bold px-4 rounded-pill">
          Launch App
        </Button>
      </div>

      {/* Hero Showcase Center Layout */}
      <Container className="my-auto text-center px-4">
        <Row className="justify-content-center">
          <Col lg={8}>
            <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-bold mb-3 shadow-sm text-uppercase tracking-wider">CDAC Project Phase-2 Demo</span>
            <h1 className="display-3 fw-extrabold text-dark tracking-tight mb-3">
              Alumni Connect Network
            </h1>
            <p className="lead text-muted mx-auto mb-5" style={{ maxWidth: '620px', fontSize: '1.2rem' }}>
              Bridge the communication gap between university institutions, scaling students, and global engineering alumni via interactive referral systems.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button size="lg" variant="dark" onClick={() => window.location.href = '/auth'} className="px-5 py-3 fw-bold shadow-sm bg-black border-0">
                Enter Platform <i className="bi bi-arrow-right ms-2"></i>
              </Button>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Footer Branding Information Bar */}
      <div className="bg-light text-center py-3 border-top mt-auto">
        <small className="text-muted fw-semibold">Alumni Connect Framework Setup © 2026 Evaluation Sprint</small>
      </div>
    </Container>
  );
}

export default LandingPage;