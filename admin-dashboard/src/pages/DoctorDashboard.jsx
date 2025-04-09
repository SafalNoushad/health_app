import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <header
        style={{
          backgroundColor: "#3b82f6",
          color: "white",
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          Doctor Dashboard
        </h1>
        <nav
          style={{
            marginTop: "0.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            to="/doctor/appointments"
            style={{ marginRight: "1rem", textDecoration: "underline" }}
          >
            My Appointments
          </Link>
          <Link
            to="/doctor/manage-appointments"
            style={{ marginRight: "1rem", textDecoration: "underline" }}
          >
            Manage Appointments
          </Link>
          <Link
            to="/doctor/consultations"
            style={{ marginRight: "1rem", textDecoration: "underline" }}
          >
            View Consultations
          </Link>
          <Link
            to="/doctor/manage-consultations"
            style={{ marginRight: "1rem", textDecoration: "underline" }}
          >
            Manage Consultations
          </Link>
          <Link
            to="/doctor/prescriptions"
            style={{ marginRight: "1rem", textDecoration: "underline" }}
          >
            Prescriptions
          </Link>
          <Link
            to="/doctor/patient"
            style={{ marginRight: "1rem", textDecoration: "underline" }}
          >
            Patient Details
          </Link>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
            }}
          >
            Logout
          </button>
        </nav>
      </header>
      <main style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>
          Welcome, Dr. {user.name}
        </h2>
        <p>
          Use the navigation above to access your appointments, consultations,
          prescriptions, and patient details.
        </p>
      </main>
    </div>
  );
}

export default DoctorDashboard;
