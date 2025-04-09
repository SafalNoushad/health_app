import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const data = response.data;
      if (data.success) {
        login(data.user, data.token);
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else if (data.user.role === 'doctor') {
          navigate('/doctor');
        } else {
          setError('Access is allowed only for admin and doctor roles.');
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6'}}>
      <form onSubmit={handleSubmit} style={{backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px', padding: '32px', width: '100%', maxWidth: '400px'}}>
        <h2 style={{color: '#374151', fontSize: '24px', fontWeight: '600', marginBottom: '24px', textAlign: 'center'}}>Login</h2>
        {error && <p style={{color: '#ef4444', fontSize: '14px', marginBottom: '16px'}}>{error}</p>}
        <div style={{marginBottom: '16px'}}>
          <label htmlFor="email" style={{color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block'}}>Email</label>
          <input
            id="email"
            type="email"
            style={{boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', padding: '8px 12px', color: '#374151'}}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required 
          />
        </div>
        <div style={{marginBottom: '24px'}}>
          <label htmlFor="password" style={{color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block'}}>Password</label>
          <input
            id="password"
            type="password"
            style={{boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', padding: '8px 12px', color: '#374151'}}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit" style={{backgroundColor: '#3b82f6', color: '#fff', fontSize: '16px', fontWeight: '600', padding: '12px 24px', borderRadius: '8px', width: '100%', cursor: 'pointer'}}>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
