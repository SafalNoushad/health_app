import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function AdminRFID() {
  const [rfids, setRfids] = useState([]);
  const [newRFID, setNewRFID] = useState({ rfidNumber: '', userId: '' });
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchRFIDs = async () => {
    try {
      const response = await axiosInstance.get('/rfid');
      if (response.data.success) {
        setRfids(response.data.rfids);
      }
    } catch (err) {
      console.error('Error fetching RFID assignments', err);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchRFIDs();
  }, []);

  const handleInputChange = (e) => {
    setNewRFID({ ...newRFID, [e.target.name]: e.target.value });
  };

  const handleAssignRFID = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/rfid/assign', newRFID);
      if (response.data.success) {
        fetchRFIDs();
        setNewRFID({ rfidNumber: '', userId: '' });
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign RFID');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this RFID assignment?")) {
      try {
        await axiosInstance.delete(`/rfid/${id}`);
        fetchRFIDs();
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  const handleEdit = async (rfid) => {
    const newRFIDNumber = window.prompt("Enter new RFID number:", rfid.rfidNumber);
    const newUserId = window.prompt("Enter new user ID (patient):", rfid.userId?._id || '');
    const newIsActive = window.prompt("Is it active? (true/false):", rfid.isActive);
    if (newRFIDNumber && newUserId && newIsActive !== null) {
      try {
        await axiosInstance.put(`/rfid/${rfid._id}`, { 
          rfidNumber: newRFIDNumber, 
          userId: newUserId, 
          isActive: newIsActive === 'true' 
        });
        fetchRFIDs();
      } catch (error) {
        console.error("Update failed", error);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1rem' }}>
      <header style={{ backgroundColor: '#3b82f6', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Manage RFID Assignments</h1>
        <div>
          <Link to="/admin" style={{ marginRight: '1rem', textDecoration: 'underline' }}>Dashboard</Link>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ backgroundColor: '#ef4444', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>RFID Assignments</h2>
        {rfids.length === 0 ? (
          <p>No RFID assignments found.</p>
        ) : (
          <table style={{ minWidth: '100%', backgroundColor: 'white', marginBottom: '1.5rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>RFID Number</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>User Name</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Assigned By</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Active</th>
                <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rfids.map(r => (
                <tr key={r._id}>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{r.rfidNumber}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{r.userId ? r.userId.name : 'N/A'}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{r.assignedBy ? r.assignedBy.name : 'N/A'}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{r.isActive ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>
                    <button onClick={() => handleEdit(r)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', marginRight: '0.5rem' }}>Edit</button>
                    <button onClick={() => handleDelete(r._id)} style={{ backgroundColor: '#ef4444', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Assign New RFID</h2>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleAssignRFID} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', maxWidth: '300px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>RFID Number</label>
            <input
              type="text"
              name="rfidNumber"
              value={newRFID.rfidNumber}
              onChange={handleInputChange}
              style={{ width: '100%', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '0.5rem' }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>User ID (Patient)</label>
            <input
              type="text"
              name="userId"
              value={newRFID.userId}
              onChange={handleInputChange}
              style={{ width: '100%', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '0.5rem' }}
              required
            />
          </div>
          <button type="submit" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
            Assign RFID
          </button>
        </form>
      </main>
    </div>
  );
}

export default AdminRFID;
