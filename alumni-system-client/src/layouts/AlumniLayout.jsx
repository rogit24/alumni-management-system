import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AlumniLayout({ children }) {
  return (
    <div className="alumni-layout d-flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="alumni-main flex-grow-1">

        <Navbar />

        <div className="alumni-content p-4">
          {children}
        </div>

      </div>

    </div>
  );
}

export default AlumniLayout;