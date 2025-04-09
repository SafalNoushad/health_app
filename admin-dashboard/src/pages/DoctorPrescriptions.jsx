import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [newPrescription, setNewPrescription] = useState({
    rfidNumber: "",
    medicineName: "",
    quantity: "",
    intakeTime: [], // Changed to an empty array for checkboxes
    duration: "",
    instructions: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchPrescriptions = async () => {
    try {
      const response = await axiosInstance.get("/prescriptions/doctor");
      setPrescriptions(response.data);
    } catch (error) {
      console.error("Error fetching prescriptions", error);
      if (error.response && error.response.status === 401) {
        logout();
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleChange = (e) => {
    setNewPrescription({ ...newPrescription, [e.target.name]: e.target.value });
  };

  // Handle checkbox changes for intakeTime selection
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let updatedTimes = newPrescription.intakeTime || [];
    if (checked) {
      // Add value if not already included
      if (!updatedTimes.includes(value)) {
        updatedTimes = [...updatedTimes, value];
      }
    } else {
      // Remove value if unchecked
      updatedTimes = updatedTimes.filter((time) => time !== value);
    }
    setNewPrescription({ ...newPrescription, intakeTime: updatedTimes });
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        rfidNumber: newPrescription.rfidNumber,
        medicines: [
          {
            name: newPrescription.medicineName,
            quantity: newPrescription.quantity,
            intakeTime: newPrescription.intakeTime, // Already an array of selected values
            duration: newPrescription.duration,
            instructions: newPrescription.instructions,
          },
        ],
        notes: newPrescription.notes,
      };
      await axiosInstance.post("/prescriptions", payload);
      fetchPrescriptions();
      setNewPrescription({
        rfidNumber: "",
        medicineName: "",
        quantity: "",
        intakeTime: [],
        duration: "",
        instructions: "",
        notes: "",
      });
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to create prescription"
      );
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "1rem" }}>
      <header style={{ backgroundColor: "#3b82f6", color: "#fff", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>My Prescriptions</h1>
        <div>
          <Link to="/doctor" style={{ marginRight: "1rem", textDecoration: "none", color: "#fff" }}>
            Dashboard
          </Link>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={{ backgroundColor: "#ef4444", color: "#fff", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none" }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: "1rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Create New Prescription</h2>
        {error && <p style={{ color: "#ef4444" }}>{error}</p>}
        <form
          onSubmit={handleCreatePrescription}
          style={{ backgroundColor: "#fff", padding: "1rem", borderRadius: "0.5rem", boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)", marginBottom: "1rem" }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Patient RFID Number</label>
            <input
              type="text"
              name="rfidNumber"
              value={newPrescription.rfidNumber}
              onChange={handleChange}
              style={{ width: "100%", border: "1px solid #d1d5db", padding: "0.5rem", borderRadius: "0.5rem" }}
              placeholder="Enter patient's RFID number"
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Medicine Name</label>
            <input
              type="text"
              name="medicineName"
              value={newPrescription.medicineName}
              onChange={handleChange}
              style={{ width: "100%", border: "1px solid #d1d5db", padding: "0.5rem", borderRadius: "0.5rem" }}
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Quantity</label>
            <input
              type="text"
              name="quantity"
              value={newPrescription.quantity}
              onChange={handleChange}
              style={{ width: "100%", border: "1px solid #d1d5db", padding: "0.5rem", borderRadius: "0.5rem" }}
              required
            />
          </div>
          {/* Intake Time Checkboxes */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Intake Time</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  value="morning"
                  checked={newPrescription.intakeTime.includes("morning")}
                  onChange={handleCheckboxChange}
                  style={{ marginRight: "0.5rem" }}
                />
                Morning
              </label>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  value="afternoon"
                  checked={newPrescription.intakeTime.includes("afternoon")}
                  onChange={handleCheckboxChange}
                  style={{ marginRight: "0.5rem" }}
                />
                Afternoon
              </label>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  value="night"
                  checked={newPrescription.intakeTime.includes("night")}
                  onChange={handleCheckboxChange}
                  style={{ marginRight: "0.5rem" }}
                />
                Night
              </label>
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Duration</label>
            <input
              type="text"
              name="duration"
              value={newPrescription.duration}
              onChange={handleChange}
              style={{ width: "100%", border: "1px solid #d1d5db", padding: "0.5rem", borderRadius: "0.5rem" }}
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Instructions</label>
            <input
              type="text"
              name="instructions"
              value={newPrescription.instructions}
              onChange={handleChange}
              style={{ width: "100%", border: "1px solid #d1d5db", padding: "0.5rem", borderRadius: "0.5rem" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>General Notes</label>
            <input
              type="text"
              name="notes"
              value={newPrescription.notes}
              onChange={handleChange}
              style={{ width: "100%", border: "1px solid #d1d5db", padding: "0.5rem", borderRadius: "0.5rem" }}
            />
          </div>
          <button
            type="submit"
            style={{ backgroundColor: "#3b82f6", color: "#fff", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none" }}
          >
            Create Prescription
          </button>
        </form>

        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Prescription List</h2>
        {prescriptions.length === 0 ? (
          <p>No prescriptions found.</p>
        ) : (
          <table style={{ width: "100%", backgroundColor: "#fff" }}>
            <thead>
              <tr>
                <th style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db" }}>Patient</th>
                <th style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db" }}>Medicines</th>
                <th style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db" }}>Notes</th>
                <th style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db" }}>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((p) => (
                <tr key={p._id}>
                  <td style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db" }}>{p.patientId?.name}</td>
                  <td style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db" }}>
                    {p.medicines.map((med, index) => (
                      <div key={index}>
                        <strong>{med.name}</strong> – {med.quantity} (
                        {med.intakeTime.join(", ")}) for {med.duration}
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db" }}>{p.notes}</td>
                  <td style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db" }}>
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default DoctorPrescriptions;
