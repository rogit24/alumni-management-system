import React from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

function DashboardLayout({ children, role }) {
  return (
    <div className="d-flex vh-100 overflow-hidden w-100">
      {/* Structural Column Left: Sidebar */}
      <Sidebar role={role} />

      {/* Structural Column Right: Header Bar + Content Workspace */}
      <div className="d-flex flex-column flex-grow-1 h-100 bg-white">
        <TopNavbar role={role} />
        <div className="flex-grow-1 overflow-auto p-4 bg-light">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;