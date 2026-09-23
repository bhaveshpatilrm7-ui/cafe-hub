import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiCoffee, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res && res.success) {
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        navigate(from, { replace: true });
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Invalid credentials', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
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
              <h2>Welcome Back</h2>
              <p>Sign in to your CaféHub account to place orders and manage reservations.</p>
            </div>

            {/* Quick Demo Credentials Box */}
            <div className="demo-credentials-box">
              <p className="demo-title">Quick Demo Login:</p>
              <div className="demo-btns">
                <button
                  type="button"
                  className="demo-chip chip-admin"
                  onClick={() => fillDemo('admin@cafehub.com', 'admin123')}
                >
                  Admin
                </button>
                <button
                  type="button"
                  className="demo-chip chip-staff"
                  onClick={() => fillDemo('staff@cafehub.com', 'staff123')}
                >
                  Staff
                </button>
                <button
                  type="button"
                  className="demo-chip chip-customer"
                  onClick={() => fillDemo('customer@cafehub.com', 'customer123')}
                >
                  Customer
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    className="form-input icon-padded"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    className="form-input icon-padded"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={submitting}>
                {submitting ? 'Signing in...' : <>Sign In <FiArrowRight /></>}
              </button>
            </form>

            <div className="auth-footer">
              <p>Don't have an account? <Link to="/register">Create an account</Link></p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .auth-card-container {
          max-width: 460px;
          margin: 30px auto;
        }

        .auth-card {
          padding: 36px;
          border-radius: var(--radius-lg);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .auth-logo-box {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: var(--primary);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin: 0 auto 16px auto;
          box-shadow: 0 6px 18px rgba(74, 44, 32, 0.25);
        }

        .auth-header h2 {
          font-size: 1.8rem;
          margin-bottom: 6px;
        }

        .auth-header p {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .demo-credentials-box {
          background: var(--cream-subtle);
          border: 1px dashed var(--border-light);
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          margin-bottom: 24px;
        }

        .demo-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .demo-btns {
          display: flex;
          gap: 8px;
        }

        .demo-chip {
          flex: 1;
          padding: 6px;
          border-radius: 6px;
          border: none;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
        }

        .chip-admin { background: #f3e5f5; color: #7b1fa2; }
        .chip-staff { background: #fff3e0; color: #e65100; }
        .chip-customer { background: #e3f2fd; color: #1976d2; }
        .demo-chip:hover { opacity: 0.8; transform: translateY(-1px); }

        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--primary);
          font-size: 1.1rem;
        }

        .form-input.icon-padded {
          padding-left: 42px;
        }

        .w-full { width: 100%; }

        .auth-footer {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid var(--border-light);
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .auth-footer a {
          color: var(--primary);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
