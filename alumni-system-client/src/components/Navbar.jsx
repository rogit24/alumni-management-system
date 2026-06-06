function Navbar() {
  const user = JSON.parse(
    localStorage.getItem("currentUser")
  );

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2>Dashboard</h2>

      <h5>
        Welcome, {user?.name}
      </h5>
    </div>
  );
}

export default Navbar;