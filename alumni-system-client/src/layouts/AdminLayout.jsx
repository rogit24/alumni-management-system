import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AdminLayout({ children }) {
  return (
    <div className="admin-layout d-flex">
      
      
      <Sidebar />

    
      <div className="admin-main flex-grow-1">
        <Navbar />

        <div className="admin-content p-4">
          {children}
        </div>
      </div>

    </div>
  );
}

export default AdminLayout;