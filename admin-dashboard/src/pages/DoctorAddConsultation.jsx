// src/pages/DoctorAddConsultation.jsx
import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function DoctorAddConsultation() {
  const [rfidNumber, setRfidNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/consultations/add-by-rfid', { rfidNumber, notes });
      if (response.status === 201) {
        setMessage('Consultation relationship created successfully.');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add consultation');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1rem' }}>
      <header style={{ backgroundColor: '#3b82f6', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Add Consultation</h1>
        <div>
          <Link to="/doctor" style={{ marginRight: '1rem', textDecoration: 'underline' }}>Dashboard</Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{ backgroundColor: '#ef4444', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Add New Consultation via RFID</h2>
        {message && <p style={{ color: 'blue', marginBottom: '1rem' }}>{message}</p>}
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', maxWidth: '300px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>RFID Number</label>
            <input
              type="text"
              value={rfidNumber}
              onChange={(e) => setRfidNumber(e.target.value)}
              style={{ width: '100%', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '0.5rem' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Consultation Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '0.5rem' }}
              required
            />
          </div>
          <button type="submit" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
            Add Consultation
          </button>
        </form>
      </main>
    </div>
  );
}

export default DoctorAddConsultation;
