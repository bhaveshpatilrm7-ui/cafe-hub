import React, { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiTrash2, FiPlus } from 'react-icons/fi';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updating, setUpdating] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const fetchAddresses = async () => {
    try {
      const res = await API.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching addresses', err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateProfile({ name, phone });
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/addresses', { street, city, state, pincode });
      if (res.data.success) {
        addToast('Address added!', 'success');
        setShowAddModal(false);
        setStreet(''); setCity(''); setState(''); setPincode('');
        fetchAddresses();
      }
    } catch (err) {
      addToast('Failed to add address', 'error');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const res = await API.delete(`/addresses/${addrId}`);
      if (res.data.success) {
        addToast('Address deleted', 'info');
        fetchAddresses();
      }
    } catch (err) {
      addToast('Failed to delete address', 'error');
    }
  };

  return (
    <div className="profile-page page-wrapper">
      <div className="container">
        <h1 className="mb-6">Account & Addresses</h1>

        <div className="grid-2">
          {/* Profile Details Form */}
          <div className="card">
            <h3 className="mb-4"><FiUser /> Profile Details</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? 'Saving...' : 'Update Details'}
              </button>
            </form>
          </div>

          {/* Saved Addresses */}
          <div className="card">
            <div className="flex-between mb-4">
              <h3><FiMapPin /> Saved Addresses</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAddModal(true)}>
                <FiPlus /> Add New
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="text-muted">No addresses saved yet.</p>
            ) : (
              <div className="addresses-list">
                {addresses.map((addr) => (
                  <div key={addr._id} className="addr-card">
                    <div>
                      <strong>{addr.street}</strong>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                    <button className="btn-icon text-danger" onClick={() => handleDeleteAddress(addr._id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for adding address */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Address</h3>
            <form onSubmit={handleAddAddress}>
              <div className="form-group">
                <label className="form-label">Street</label>
                <input type="text" className="form-input" value={street} onChange={(e) => setStreet(e.target.value)} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" value={state} onChange={(e) => setState(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input type="text" className="form-input" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .flex-between { display: flex; align-items: center; justify-content: space-between; }
        .addresses-list { display: flex; flex-direction: column; gap: 12px; }
        .addr-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
        }
        .text-danger { color: var(--danger); background: none; border: none; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default ProfilePage;
