// src/pages/AdminDoctors.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    try {
      const response = await axiosInstance.get('/doctors');
      if (response.data.success) {
        setDoctors(response.data.doctors);
      }
    } catch (error) {
      console.error("Error fetching doctors", error);
      if (error.response && error.response.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header style={{ backgroundColor: '#3b82f6', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Manage Doctors</h1>
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
      <main style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Doctors List</h2>
        {doctors.length === 0 ? (
          <p>No doctors found.</p>
        ) : (
          <table style={{ minWidth: '100%', backgroundColor: 'white' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Speciality</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Hospital</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc._id}>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{doc.name}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{doc.email}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{doc.speciality}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{doc.hospitalId ? doc.hospitalId.name : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default AdminDoctors;
