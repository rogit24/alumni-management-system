import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// Public Pages
import Landing from "./pages/LandingPage"; // Add your Landing page component here
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import Profile from "./pages/student/Profile";
import AlumniSearch from "./pages/student/AlumniSearch";
import Jobs from "./pages/student/Jobs";
import StudentApplications from "./pages/student/Applications";
import StudentReferrals from "./pages/student/Referrals";
import Messages from "./pages/student/Messages";
import Notifications from "./pages/student/Notifications";

// Alumni
import AlumniDashboard from "./pages/alumni/AlumniDashboard";
import JobManagement from "./pages/alumni/JobManagement";
import AlumniApplications from "./pages/alumni/Applications";
import AlumniReferrals from "./pages/alumni/Referrals";
import AlumniMessages from "./pages/alumni/Messages";
import AlumniNotifications from "./pages/alumni/Notifications";
import AlumniProfile from "./pages/alumni/Profile";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Reports from "./pages/admin/Reports";
import Students from "./pages/admin/Students";
import Alumni from "./pages/admin/Alumni";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public & Authentication Routes */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Student Routes */}

        <Route
          path="/student"
          element={<StudentDashboard />}
        />

        <Route
          path="/student/profile"
          element={<Profile />}
        />

        <Route
          path="/student/alumni-search"
          element={<AlumniSearch />}
        />

        <Route
          path="/student/jobs"
          element={<Jobs />}
        />

        <Route
          path="/student/applications"
          element={<StudentApplications />}
        />

        <Route
          path="/student/referrals"
          element={<StudentReferrals />}
        />

        <Route
          path="/student/messages"
          element={<Messages />}
        />

        <Route
          path="/student/notifications"
          element={<Notifications />}
        />

        {/* Alumni Routes */}

        <Route
          path="/alumni"
          element={<AlumniDashboard />}
        />

        <Route
          path="/alumni/jobs"
          element={<JobManagement />}
        />

        <Route
          path="/alumni/applications"
          element={<AlumniApplications />}
        />

        <Route
          path="/alumni/referrals"
          element={<AlumniReferrals />}
        />
        
        <Route
          path="/alumni/messages"
          element={<AlumniMessages />}
        />

        <Route
          path="/alumni/notifications"
          element={<AlumniNotifications />}
        />
        
        <Route
          path="/alumni/profile"
          element={<AlumniProfile />}
        />

        {/* Admin Routes */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
        
        <Route
          path="/admin/users"
          element={<Users />}
        />

        <Route
          path="/admin/reports"
          element={<Reports />}
        />
        
        <Route
          path="/admin/students"
          element={<Students />}
        />

        <Route
          path="/admin/alumni"
          element={<Alumni />}
        />

      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
      />
    </BrowserRouter>
  );
}

export default App;