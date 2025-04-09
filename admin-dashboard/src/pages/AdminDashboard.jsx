import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header style={{ backgroundColor: '#3b82f6', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
        <div>
          <Link to="/admin/users" style={{ marginRight: '1rem', textDecoration: 'underline' }}>Users</Link>
          <Link to="/admin/hospitals" style={{ marginRight: '1rem', textDecoration: 'underline' }}>Hospitals</Link>
          <Link to="/admin/rfid" style={{ marginRight: '1rem', textDecoration: 'underline' }}>RFID</Link>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>Logout</button>
        </div>
      </header>
      <main style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome, {user.name}</h2>
        <p style={{ marginBottom: '1rem' }}>Use the navigation links above to perform full CRUD operations on users, hospitals, and RFID assignments.</p>
      </main>
    </div>
  );
}

export default AdminDashboard;
