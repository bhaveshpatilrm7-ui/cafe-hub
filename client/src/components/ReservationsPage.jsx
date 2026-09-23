import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUsers, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ReservationsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [tables, setTables] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('18:00');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

  const fetchData = async () => {
    try {
      const tRes = await API.get('/tables');
      if (tRes.data.success) {
        setTables(tRes.data.data);
      }
      if (user) {
        const rRes = await API.get('/reservations/my-reservations');
        if (rRes.data.success) {
          setMyReservations(rRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching table reservation data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleBookTable = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to reserve a table', 'info');
      return;
    }
    if (!selectedTableId) {
      addToast('Please select a table from the list', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/reservations', {
        tableId: selectedTableId,
        date,
        timeSlot,
        guestCount,
        specialRequest
      });

      if (res.data.success) {
        addToast('Table reservation submitted successfully!', 'success');
        setSelectedTableId('');
        setSpecialRequest('');
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to book table. Table might be busy at this time.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReservation = async (resId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await API.put(`/reservations/${resId}/cancel`);
      if (res.data.success) {
        addToast('Reservation cancelled', 'info');
        fetchData();
      }
    } catch (err) {
      addToast('Error cancelling reservation', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  // Filter suitable tables matching guest capacity
  const availableTables = tables.filter(t => t.capacity >= guestCount);

  return (
    <div className="reservations-page page-wrapper">
      <div className="container">
        <div className="menu-header mb-8">
          <h1>Reserve a Table</h1>
          <p>Book your spot in advance for fine dining, coffee dates, or private meetings.</p>
        </div>

        <div className="reservations-layout">
          {/* Left Booking Form */}
          <div className="card booking-form-card">
            <h3><FiCalendar /> Table Reservation Form</h3>

            <form onSubmit={handleBookTable}>
              <div className="form-group">
                <label className="form-label">Reservation Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Time Slot</label>
                  <select
                    className="form-select"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="form-input"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* Table Selection Grid */}
              <div className="form-group">
                <label className="form-label">Select Table:</label>
                <div className="tables-select-grid">
                  {availableTables.map((t) => (
                    <div
                      key={t._id}
                      className={`table-select-card ${selectedTableId === t._id ? 'selected' : ''}`}
                      onClick={() => setSelectedTableId(t._id)}
                    >
                      <div className="table-num">{t.tableNumber}</div>
                      <div className="table-capacity">{t.capacity} Seats</div>
                      <div className="table-loc">{t.location}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Special Requests (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="E.g., Window view, birthday decoration, quiet corner table."
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={submitting || !selectedTableId}>
                {submitting ? 'Booking...' : 'Confirm Reservation'}
              </button>
            </form>
          </div>

          {/* Right Existing Reservations List */}
          <div className="my-reservations-wrapper">
            <h3 className="mb-4">My Reservations</h3>

            {!user ? (
              <div className="card text-center py-6">
                <p>Login to view your table reservations.</p>
              </div>
            ) : myReservations.length === 0 ? (
              <div className="card text-center py-8">
                <p>No active reservations found.</p>
              </div>
            ) : (
              myReservations.map((res) => (
                <div key={res._id} className="card res-card">
                  <div className="res-header">
                    <div>
                      <strong className="res-table">Table {res.table?.tableNumber || 'Assigned'}</strong>
                      <span className="res-details">{res.date} at {res.timeSlot} ({res.guestCount} Guests)</span>
                    </div>
                    <span className={`badge ${res.status === 'Confirmed' ? 'badge-success' : res.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                      {res.status}
                    </span>
                  </div>

                  {res.specialRequest && <p className="res-req">Note: {res.specialRequest}</p>}

                  {res.status === 'Pending' || res.status === 'Confirmed' ? (
                    <button className="btn btn-danger btn-sm mt-3" onClick={() => handleCancelReservation(res._id)}>
                      Cancel Reservation
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .reservations-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
        }

        .booking-form-card {
          padding: 30px;
        }

        .booking-form-card h3 {
          font-size: 1.3rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tables-select-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 6px;
        }

        .table-select-card {
          padding: 14px;
          border: 1.5px solid var(--border-light);
          border-radius: var(--radius-sm);
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
        }

        .table-select-card:hover, .table-select-card.selected {
          border-color: var(--primary);
          background: var(--cream-subtle);
        }

        .table-num {
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--primary);
        }

        .table-capacity { font-size: 0.8rem; color: var(--accent-hover); font-weight: 600; }
        .table-loc { font-size: 0.75rem; color: var(--text-muted); }

        .my-reservations-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .res-card {
          padding: 18px;
        }

        .res-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .res-table { display: block; color: var(--primary); font-size: 1.05rem; }
        .res-details { font-size: 0.85rem; color: var(--text-muted); }
        .res-req { font-size: 0.8rem; font-style: italic; margin-top: 6px; color: var(--text-muted); }

        @media (max-width: 992px) {
          .reservations-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ReservationsPage;
