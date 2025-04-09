import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axiosInstance.get('/appointments');
        if (response.data.success) {
          setAppointments(response.data.appointments);
        }
      } catch (error) {
        console.error("Error fetching appointments", error);
        if (error.response && error.response.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };

    fetchAppointments();
  }, [logout, navigate]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1rem' }}>
      <header style={{ backgroundColor: '#3b82f6', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My Appointments</h1>
        <div>
          <Link to="/doctor" style={{ marginRight: '1rem', textDecoration: 'underline' }}>Dashboard</Link>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ backgroundColor: '#ef4444', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Appointments</h2>
        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <table style={{ minWidth: '100%', backgroundColor: 'white' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Patient</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Date</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Time</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt._id}>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{appt.patientId?.name}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{appt.date}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{appt.time}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{appt.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default DoctorAppointments;
