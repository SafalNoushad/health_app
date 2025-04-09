import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const allowedStatuses = ['pending', 'approved', 'rejected', 'completed', 'rescheduled'];

function DoctorManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get('/appointments');
      const fetchedAppointments = response.data.appointments || response.data;
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Error fetching appointments", error);
      if (error.response && error.response.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    setStatusUpdates(prev => ({
      ...prev,
      [appointmentId]: newStatus
    }));
  };

  const updateAppointmentStatus = async (appointment) => {
    const newStatus = statusUpdates[appointment._id];
    if (!newStatus) return;
    try {
      const payload = { status: newStatus, notes: appointment.notes || '' };
      await axiosInstance.put(`/appointments/${appointment._id}/status`, payload);
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment status", error);
    }
  };

  const deleteAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await axiosInstance.delete(`/appointments/${appointmentId}`);
        fetchAppointments();
      } catch (error) {
        console.error("Error deleting appointment", error);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1rem' }}>
      <header style={{ backgroundColor: '#3b82f6', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Manage My Appointments</h1>
        <div>
          <Link to="/doctor" style={{ marginRight: '1rem', textDecoration: 'underline' }}>Dashboard</Link>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Appointments List</h2>
        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <table style={{ minWidth: '100%', backgroundColor: 'white', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Patient</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Date</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Time</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Current Status</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Update Status</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt._id}>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{appt.patientId?.name || 'N/A'}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{appt.date}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{appt.time}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', textTransform: 'capitalize' }}>{appt.status}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>
                    <select 
                      value={statusUpdates[appt._id] || appt.status}
                      onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                      style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.5rem' }}
                    >
                      {allowedStatuses.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>
                    <button 
                      onClick={() => updateAppointmentStatus(appt)}
                      style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', marginRight: '0.5rem' }}
                    >
                      Update
                    </button>
                    <button 
                      onClick={() => deleteAppointment(appt._id)}
                      style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
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

export default DoctorManageAppointments;
