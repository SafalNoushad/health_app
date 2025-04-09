// src/pages/AdminPatientConsultations.jsx
import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function AdminPatientConsultations() {
  const [patientId, setPatientId] = useState('');
  const [consultations, setConsultations] = useState([]);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.get(`/consultations/patient/${patientId}`);
      setConsultations(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch consultations');
      setConsultations([]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1.5rem' }}>
      <header style={{ backgroundColor: '#3b82f6', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Patient Consultations</h1>
        <div>
          <Link to="/admin" style={{ marginRight: '1rem', textDecoration: 'underline' }}>Dashboard</Link>
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
      <main>
        <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: '#4b5563' }}>Enter Patient ID</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            style={{ width: '100%', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '1rem' }}
            required
          />
          <button type="submit" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
            Search Consultations
          </button>
        </form>
        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
        {consultations.length > 0 && (
          <table style={{ minWidth: '100%', backgroundColor: 'white' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Doctor</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Last Consultation</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c._id}>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{c.doctorId?.name}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{c.status}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{new Date(c.lastConsultationDate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default AdminPatientConsultations;
