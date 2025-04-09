import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching users", error);
      if (error.response && error.response.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axiosInstance.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  const handleEdit = async (user) => {
    const newName = window.prompt("Enter new name:", user.name);
    const newEmail = window.prompt("Enter new email:", user.email);
    if (newName && newEmail) {
      try {
        await axiosInstance.put(`/users/${user._id}`, { name: newName, email: newEmail });
        fetchUsers();
      } catch (error) {
        console.error("Update failed", error);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '1rem' }}>
      <header style={{ backgroundColor: '#3b82f6', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Manage Users</h1>
        <div>
          <Link to="/admin" style={{ marginRight: '1rem', textDecoration: 'underline' }}>Dashboard</Link>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ backgroundColor: '#ef4444', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>User List</h2>
        <table style={{ minWidth: '100%', backgroundColor: 'white' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Role</th>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{u.name}</td>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{u.email}</td>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{u.role}</td>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>
                  <button onClick={() => handleEdit(u)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', marginRight: '0.5rem' }}>Edit</button>
                  <button onClick={() => handleDelete(u._id)} style={{ backgroundColor: '#ef4444', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default AdminUsers;
