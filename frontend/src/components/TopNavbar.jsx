import React from 'react';

function TopNavbar({ role = 'student' }) {
  const getWelcomeMessage = () => {
    if (role === 'admin') return 'Admin Dashboard';
    if (role === 'alumni') return 'Welcome, Alumni Name';
    return 'Welcome, John Doe';
  };

  const badgeCount = role === 'admin' ? 1 : role === 'alumni' ? 3 : 2;

  return (
    <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom">
      <h4 className="mb-0 fw-bold">{getWelcomeMessage()}</h4>
      
      {/* Notification Bell Badge Wrapper */}
      <div className="position-relative cursor-pointer" style={{ cursor: 'pointer' }}>
        <i className="bi bi-bell fs-3"></i>
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-dark text-white border border-light" style={{ fontSize: '0.65rem' }}>
          {badgeCount}
        </span>
      </div>
    </div>
  );
}

export default TopNavbar;