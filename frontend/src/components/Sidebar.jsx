import React, { useState } from 'react'; // 1. useState import karo
import { ListGroup } from 'react-bootstrap';

function Sidebar({ role = 'student' }) {
  // 2. State banayein jo tracking rakhegi ki kaunsa tab abhi active (selected) hai
  // By default, wireframe ke hisab se 'Profile' ko active rakhte hain
  const [activeTab, setActiveTab] = useState('Profile');

  const linksByRole = {
    student: [
      { label: 'Profile', icon: 'bi-person' },
      { label: 'Search Alumni', icon: 'bi-search' },
      { label: 'Jobs', icon: 'bi-briefcase' },
      { label: 'Referrals', icon: 'bi-handshake' },
      { label: 'Messages', icon: 'bi-chat-dots' },
      { label: 'Notifications', icon: 'bi-bell' }
    ],
    alumni: [
      { label: 'Profile', icon: 'bi-person' },
      { label: 'Post Job', icon: 'bi-plus-square' },
      { label: 'Manage Jobs', icon: 'bi-briefcase' },
      { label: 'Applications', icon: 'bi-people' },
      { label: 'Referrals', icon: 'bi-handshake' },
      { label: 'Messages', icon: 'bi-chat-dots' }
    ],
    admin: [
      { label: 'Users', icon: 'bi-people' },
      { label: 'Reports', icon: 'bi-bar-chart' },
      { label: 'Jobs', icon: 'bi-briefcase' },
      { label: 'Applications', icon: 'bi-file-earmark-text' },
      { label: 'Referrals', icon: 'bi-handshake' }
    ]
  };

  const currentLinks = linksByRole[role] || linksByRole['student'];

  const getProfileMeta = () => {
    if (role === 'admin') return { name: 'ADMIN', subtitle: 'System Control', icon: 'bi-shield-check' };
    if (role === 'alumni') return { name: 'Alumni Name', subtitle: 'Alumni', icon: 'bi-person-circle' };
    return { name: 'John Doe', subtitle: 'Student', icon: 'bi-person-circle' };
  };

  const profile = getProfileMeta();

  return (
    <div className="d-flex flex-column justify-content-between h-100 p-3 bg-light border-end" style={{ minWidth: '240px' }}>
      <div>
        <div className="text-center my-4 pb-3 border-bottom">
          <i className={`bi ${profile.icon} text-dark`} style={{ fontSize: '3.5rem' }}></i>
          <h5 className="mt-2 mb-0 fw-bold">{profile.name}</h5>
          <small className="text-muted fw-semibold">{profile.subtitle}</small>
        </div>

        <ListGroup variant="flush">
          {currentLinks.map((link, idx) => {
            // 3. Check karo kya yeh current link activeTab ke barabar hai?
            const isActive = link.label === activeTab;

            return (
              <ListGroup.Item 
                key={idx} 
                action 
                // 4. Agar active hai toh Bootstrap ki 'bg-dark text-white' class de do, nahi toh normal text-dark
                className={`border-0 py-2.5 my-1 rounded fw-medium d-flex align-items-center ${
                  isActive ? 'bg-dark text-white shadow-sm' : 'text-dark'
                }`}
                style={{ fontSize: '0.95rem', transition: 'all 0.15s ease' }}
                // 5. Click hote hi activeTab state ko update kar do
                onClick={() => setActiveTab(link.label)}
              >
                <i className={`bi ${link.icon} me-3 fs-5 ${isActive ? 'text-white' : 'text-muted'}`}></i>
                {link.label}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </div>

      <ListGroup variant="flush">
        <ListGroup.Item 
          action 
          className="border-0 text-danger fw-bold d-flex align-items-center rounded"
          onClick={() => window.location.href = '/auth'}
        >
          <i className="bi bi-box-arrow-left me-3 fs-5"></i>
          Logout
        </ListGroup.Item>
      </ListGroup>
    </div>
  );
}

export default Sidebar;