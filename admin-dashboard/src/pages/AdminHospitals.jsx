import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [newHospital, setNewHospital] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchHospitals = async () => {
    try {
      const response = await axiosInstance.get('/hospitals');
      if (response.data.success) {
        setHospitals(response.data.hospitals);
      }
    } catch (err) {
      console.error('Error fetching hospitals', err);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleInputChange = (e) => {
    setNewHospital({ ...newHospital, [e.target.name]: e.target.value });
  };

  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/hospitals', newHospital);
      if (response.data.success) {
        fetchHospitals();
        setNewHospital({ name: '', address: '', phone: '', email: '', website: '' });
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add hospital');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hospital?")) {
      try {
        await axiosInstance.delete(`/hospitals/${id}`);
        fetchHospitals();
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  const handleEdit = async (hospital) => {
    const newName = window.prompt("Enter new name:", hospital.name);
    const newAddress = window.prompt("Enter new address:", hospital.address);
    if (newName && newAddress) {
      try {
        await axiosInstance.put(`/hospitals/${hospital._id}`, { name: newName, address: newAddress });
        fetchHospitals();
      } catch (error) {
        console.error("Update failed", error);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1rem' }}>
      <header style={{ backgroundColor: '#3b82f6', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Manage Hospitals</h1>
        <div>
          <Link to="/admin" style={{ marginRight: '1rem', textDecoration: 'underline' }}>Dashboard</Link>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Hospital List</h2>
        <table style={{ minWidth: '100%', backgroundColor: 'white', marginBottom: '1.5rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Address</th>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Phone</th>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Website</th>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map(h => (
              <tr key={h._id}>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{h.name}</td>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{h.address}</td>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{h.phone}</td>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{h.email}</td>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{h.website}</td>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>
                  <button onClick={() => handleEdit(h)} style={{ backgroundColor: '#facc15', color: 'black', padding: '0.5rem 1rem', borderRadius: '0.5rem', marginRight: '0.5rem' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(h._id)} style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Add New Hospital</h2>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleAddHospital} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', maxWidth: '20rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Name</label>
            <input
              type="text"
              name="name"
              value={newHospital.name}
              onChange={handleInputChange}
              style={{ width: '100%', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '1rem' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Address</label>
            <input
              type="text"
              name="address"
              value={newHospital.address}
              onChange={handleInputChange}
              style={{ width: '100%', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '1rem' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Phone</label>
            <input
              type="text"
              name="phone"
              value={newHospital.phone}
              onChange={handleInputChange}
              style={{ width: '100%', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
            <input
              type="email"
              name="email"
              value={newHospital.email}
              onChange={handleInputChange}
              style={{ width: '100%', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Website</label>
            <input
              type="text"
              name="website"
              value={newHospital.website}
              onChange={handleInputChange}
              style={{ width: '100%', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '0.5rem' }}
            />
          </div>
          <button type="submit" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
            Add Hospital
          </button>
        </form>
      </main>
    </div>
  );
}

export default AdminHospitals;
