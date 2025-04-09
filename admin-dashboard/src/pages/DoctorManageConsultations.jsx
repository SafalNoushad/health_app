import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const consultationStatuses = ["active", "inactive"]; // Adjust these as needed

function DoctorManageConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchConsultations = async () => {
    try {
      const response = await axiosInstance.get("/consultations/doctor");
      setConsultations(response.data);
    } catch (error) {
      console.error("Error fetching consultations", error);
      if (error.response && error.response.status === 401) {
        logout();
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [id]: newStatus,
    }));
  };

  const updateConsultationStatus = async (consultation) => {
    const newStatus = statusUpdates[consultation._id];
    if (!newStatus) return;
    try {
      // Assuming your backend supports updating consultation status at:
      // PUT /consultations/:id/status
      await axiosInstance.put(`/consultations/${consultation._id}/status`, {
        status: newStatus,
      });
      fetchConsultations();
    } catch (error) {
      console.error("Error updating consultation status", error);
    }
  };

  const deleteConsultation = async (id) => {
    if (window.confirm("Are you sure you want to delete this consultation?")) {
      try {
        // Assuming a DELETE endpoint exists: DELETE /consultations/:id
        await axiosInstance.delete(`/consultations/${id}`);
        fetchConsultations();
      } catch (error) {
        console.error("Error deleting consultation", error);
      }
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
          Manage My Consultations
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
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>
          Consultations List
        </h2>
        {consultations.length === 0 ? (
          <p>No consultations found.</p>
        ) : (
          <table
            style={{
              minWidth: "100%",
              backgroundColor: "white",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{ padding: "0.5rem 1rem", border: "1px solid #ddd" }}
                >
                  Patient
                </th>
                <th
                  style={{ padding: "0.5rem 1rem", border: "1px solid #ddd" }}
                >
                  Doctor
                </th>
                <th
                  style={{ padding: "0.5rem 1rem", border: "1px solid #ddd" }}
                >
                  Current Status
                </th>
                <th
                  style={{ padding: "0.5rem 1rem", border: "1px solid #ddd" }}
                >
                  Update Status
                </th>
                <th
                  style={{ padding: "0.5rem 1rem", border: "1px solid #ddd" }}
                >
                  Last Consultation
                </th>
                <th
                  style={{ padding: "0.5rem 1rem", border: "1px solid #ddd" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((consultation) => (
                <tr key={consultation._id}>
                  <td
                    style={{ padding: "0.5rem 1rem", border: "1px solid #ddd" }}
                  >
                    {consultation.patientId?.name || "N/A"}
                  </td>
                  <td
                    style={{ padding: "0.5rem 1rem", border: "1px solid #ddd" }}
                  >
                    {consultation.doctorId ? (
                      <div>
                        <p>{consultation.doctorId.name}</p>
                        <p style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                          {consultation.doctorId.email}
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                          {consultation.doctorId.speciality}
                        </p>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid #ddd",
                      textTransform: "capitalize",
                    }}
                  >
                    {consultation.status}
                  </td>
                  <td
                    style={{ padding: "0.5rem 1rem", border: "1px solid #ddd" }}
                  >
                    <select
                      value={
                        statusUpdates[consultation._id] || consultation.status
                      }
                      onChange={(e) =>
                        handleStatusChange(consultation._id, e.target.value)
                      }
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ddd",
                        borderRadius: "0.5rem",
                      }}
                    >
                      {consultationStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td
                    style={{ padding: "0.5rem 1rem", border: "1px solid #ddd" }}
                  >
                    {new Date(
                      consultation.lastConsultationDate
                    ).toLocaleString()}
                  </td>
                  <td
                    style={{ padding: "0.5rem 1rem", border: "1px solid #ddd" }}
                  >
                    <button
                      onClick={() => updateConsultationStatus(consultation)}
                      style={{
                        backgroundColor: "#3b82f6",
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                        marginRight: "0.5rem",
                      }}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => deleteConsultation(consultation._id)}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                      }}
                    >
                      Delete
                    </button>
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

export default DoctorManageConsultations;
