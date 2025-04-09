import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DoctorPatientDetails() {
  const [rfid, setRfid] = useState("");
  // Use patientData to store complete response (user, prescriptions, consultations, appointments)
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.get(`/rfid/user/${rfid}`);
      // Set the entire response data in state
      setPatientData(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Patient not found");
      setPatientData(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        padding: "1rem",
      }}
    >
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
          Patient Details by RFID
        </h1>
        <div>
          <Link
            to="/doctor"
            style={{ marginRight: "1rem", textDecoration: "underline" }}
          >
            Dashboard
          </Link>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={{
              backgroundColor: "#ef4444",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: "1.5rem" }}>
        <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              color: "#6B7280",
              fontSize: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            Enter RFID Number
          </label>
          <input
            type="text"
            value={rfid}
            onChange={(e) => setRfid(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #6B7280",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
            }}
            required
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
            }}
          >
            Search
          </button>
        </form>
        {error && <p style={{ color: "#ef4444" }}>{error}</p>}
        {patientData && patientData.user && (
          <div>
            {/* Patient Details Section */}
            <div
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                marginBottom: "1rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                Patient Details
              </h2>
              <p>
                <strong>Name:</strong> {patientData.user.name}
              </p>
              <p>
                <strong>Email:</strong> {patientData.user.email}
              </p>
              <p>
                <strong>Phone:</strong> {patientData.user.phone}
              </p>
              <p>
                <strong>Address:</strong> {patientData.user.address}
              </p>
              {/* Additional patient details as needed */}
            </div>

            {/* Prescriptions Section */}
            <div
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                marginBottom: "1rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                Prescriptions
              </h2>
              {patientData.prescriptions &&
              patientData.prescriptions.length > 0 ? (
                patientData.prescriptions.map((prescription) => (
                  <div
                    key={prescription._id}
                    style={{
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <p>
                      <strong>Notes:</strong> {prescription.notes}
                    </p>
                    <div>
                      <strong>Medicines:</strong>
                      {prescription.medicines.map((med, index) => (
                        <div key={index}>
                          {med.name} – {med.quantity} (
                          {med.intakeTime.join(", ")}) for {med.duration}
                        </div>
                      ))}
                    </div>
                    <p>
                      <small>
                        Created on:{" "}
                        {new Date(prescription.createdAt).toLocaleString()}
                      </small>
                    </p>
                  </div>
                ))
              ) : (
                <p>No prescriptions found.</p>
              )}
            </div>

            {/* Consultations Section */}
            <div
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                marginBottom: "1rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                Consultations
              </h2>
              {patientData.consultations &&
              patientData.consultations.length > 0 ? (
                patientData.consultations.map((consultation) => (
                  <div
                    key={consultation._id}
                    style={{
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {consultation.doctorId ? (
                      <div>
                        <p>
                          <strong>Doctor Name:</strong>{" "}
                          {consultation.doctorId.name}
                        </p>
                        <p>
                          <strong>Email:</strong> {consultation.doctorId.email}
                        </p>
                        <p>
                          <strong>Speciality:</strong>{" "}
                          {consultation.doctorId.speciality}
                        </p>
                      </div>
                    ) : (
                      <p>
                        <strong>Doctor:</strong> N/A
                      </p>
                    )}
                    <p>
                      <strong>Status:</strong> {consultation.status}
                    </p>
                    <p>
                      <small>
                        Last Consultation:{" "}
                        {new Date(
                          consultation.lastConsultationDate
                        ).toLocaleString()}
                      </small>
                    </p>
                  </div>
                ))
              ) : (
                <p>No consultations found.</p>
              )}
            </div>

            {/* Appointments Section */}
            <div
              style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.5rem",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                Appointments
              </h2>
              {patientData.appointments &&
              patientData.appointments.length > 0 ? (
                patientData.appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    style={{
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <p>
                      <strong>Date:</strong> {appointment.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {appointment.time}
                    </p>
                    <p>
                      <strong>Status:</strong> {appointment.status}
                    </p>
                  </div>
                ))
              ) : (
                <p>No appointments found.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DoctorPatientDetails;
