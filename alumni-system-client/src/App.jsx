import React from 'react';
import { AppProvider } from './context/AppContext'; // 1. Provider ko import karo
import DashboardLayout from './components/DashboardCard';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';

function App() {
  const currentPath = window.location.pathname;

  // Render logic wahi purani hai, bas isko hum niche <AppProvider> mein wrap karenge
  const renderPage = () => {
    if (currentPath === '/' || currentPath === '') {
      return <LandingPage />;
    }

    if (currentPath === '/auth') {
      return <AuthPage />;
    }

    if (currentPath === '/student') {
      return (
        <DashboardLayout role="student">
          {/* Member 2 yahan apna <StudentDashboard /> dalega */}
          <div className="border border-dashed p-5 text-center text-muted bg-white rounded shadow-sm">
            <h4>🎓 Student Dashboard Content Pane Ready</h4>
            <p>Waiting for Member 2 code export package injection.</p>
          </div>
        </DashboardLayout>
      );
    }

    if (currentPath === '/alumni') {
      return (
        <DashboardLayout role="alumni">
          {/* Member 3 yahan apna <AlumniDashboard /> dalega */}
          <div className="border border-dashed p-5 text-center text-muted bg-white rounded shadow-sm">
            <h4>💼 Alumni Dashboard Content Pane Ready</h4>
            <p>Waiting for Member 3 code export package injection.</p>
          </div>
        </DashboardLayout>
      );
    }

    if (currentPath === '/admin') {
      return (
        <DashboardLayout role="admin">
          {/* Member 4 yahan apna <AdminDashboard /> dalega */}
          <div className="border border-dashed p-5 text-center text-muted bg-white rounded shadow-sm">
            <h4>🛡️ Admin Dashboard Content Pane Ready</h4>
            <p>Waiting for Member 4 code export package injection.</p>
          </div>
        </DashboardLayout>
      );
    }

    return <LandingPage />;
  };

  return (
    // 2. Poori App ko iske andar wrap kar diya
    <AppProvider>
      {renderPage()}
    </AppProvider>
  );
}

export default App;