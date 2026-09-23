import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCoffee, FiUser, FiMail, FiPhone, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register({ name, email, phone, password });
      if (res && res.success) {
        addToast('Account created successfully!', 'success');
        navigate('/');
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="container">
        <div className="auth-card-container">
          <div className="card auth-card">
            <div className="auth-header">
              <div className="auth-logo-box">
                <FiCoffee />
              </div>
              <h2>Create Your Account</h2>
              <p>Join CaféHub to order food online, track orders and book tables.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-icon-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    className="form-input icon-padded"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    className="form-input icon-padded"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <div className="input-icon-wrapper">
                  <FiPhone className="input-icon" />
                  <input
                    type="tel"
                    className="form-input icon-padded"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password (Min 6 chars)</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    className="form-input icon-padded"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={submitting}>
                {submitting ? 'Creating Account...' : <>Register Account <FiArrowRight /></>}
              </button>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Sign in instead</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
