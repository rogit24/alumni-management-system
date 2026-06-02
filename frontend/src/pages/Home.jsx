import Navbar from "../components/Navbar"

function Home() {
  return (
    <>
      <Navbar />

      <div className="container mt-5">

        <h1>Alumni Management System</h1>

        <p>
          Connect Students and Alumni
        </p>

        <button className="btn btn-primary me-2">
          Login
        </button>

        <button className="btn btn-success">
          Register
        </button>

      </div>
    </>
  )
}

export default Home