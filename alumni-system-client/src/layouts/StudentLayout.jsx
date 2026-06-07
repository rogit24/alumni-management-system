import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function StudentLayout({ children }) {
  return (
    <div className="student-layout d-flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="student-main flex-grow-1">

        <Navbar />

        <div className="student-content p-4">
          {children}
        </div>

      </div>

    </div>
  );
}

export default StudentLayout;