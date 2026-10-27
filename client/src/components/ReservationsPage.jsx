import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUsers, FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ReservationsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [tables, setTables] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [bookedTableIds, setBookedTableIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [date, setDate] = useState(getTodayDateString());
  const [timeSlot, setTimeSlot] = useState('18:00');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

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

  // Check table availability for selected date & time
  useEffect(() => {
    const checkAvailability = async () => {
      if (!date || !timeSlot) return;
      try {
        const aRes = await API.get('/reservations/availability', {
          params: { date, timeSlot }
        });
        if (aRes.data.success) {
          const booked = aRes.data.bookedTableIds || [];
          setBookedTableIds(booked);
          // If previously selected table is booked, deselect
          setSelectedTableId((prev) => (booked.includes(prev) ? '' : prev));
        }
      } catch (err) {
        console.error('Error checking table availability', err);
      }
    };
    checkAvailability();
  }, [date, timeSlot]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleBookTable = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to reserve a table', 'info');
      return;
    }
    if (!date) {
      addToast('Please select a reservation date', 'error');
      return;
    }
    if (!timeSlot) {
      addToast('Please select a time slot', 'error');
      return;
    }
    const numGuests = Number(guestCount);
    if (!numGuests || numGuests < 1) {
      addToast('Please provide a valid number of guests (at least 1)', 'error');
      return;
    }
    if (!selectedTableId) {
      addToast('Please select a table from the list', 'error');
      return;
    }

    const selectedTable = tables.find((t) => t._id === selectedTableId);
    if (selectedTable && selectedTable.capacity < numGuests) {
      addToast(
        `Selected table capacity (${selectedTable.capacity}) is smaller than party size (${numGuests})`,
        'error'
      );
      return;
    }

    if (bookedTableIds.includes(selectedTableId)) {
      addToast('This table is already reserved for the selected date and time slot.', 'error');
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        table: selectedTableId,
        tableId: selectedTableId,
        date,
        timeSlot,
        partySize: numGuests,
        guestCount: numGuests,
        specialRequest: specialRequest.trim(),
        specialRequests: specialRequest.trim()
      };

      const res = await API.post('/reservations', payload);

      if (res.data.success) {
        const created = res.data.data;
        addToast('Table Reserved Successfully!', 'success');
        setBookingSuccess({
          reservationNumber: created.reservationNumber,
          date: created.date,
          timeSlot: created.timeSlot,
          tableNumber: created.table?.tableNumber || selectedTable?.tableNumber,
          guestCount: created.partySize || created.guestCount || numGuests
        });
        setSelectedTableId('');
        setSpecialRequest('');
        fetchData();

        // Refresh availability
        const aRes = await API.get('/reservations/availability', {
          params: { date, timeSlot }
        });
        if (aRes.data.success) {
          setBookedTableIds(aRes.data.bookedTableIds || []);
        }
      }
    } catch (err) {
      addToast(
        err.response?.data?.error || 'Failed to book table. Table might be busy at this time.',
        'error'
      );
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
        // Refresh availability
        const aRes = await API.get('/reservations/availability', {
          params: { date, timeSlot }
        });
        if (aRes.data.success) {
          setBookedTableIds(aRes.data.bookedTableIds || []);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Error cancelling reservation', 'error');
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

            {/* Success Booking Banner */}
            {bookingSuccess && (
              <div className="booking-success-box mb-6">
                <div className="success-banner-header">
                  <div className="flex-align gap-2">
                    <FiCheckCircle className="text-success success-icon-lg" />
                    <h4 className="m-0 text-success">Table Reserved Successfully!</h4>
                  </div>
                  <button
                    type="button"
                    className="close-success-btn"
                    onClick={() => setBookingSuccess(null)}
                    title="Dismiss"
                  >
                    <FiX />
                  </button>
                </div>
                <div className="success-details-row mt-3">
                  <div>
                    <span className="detail-label">Reservation ID</span>
                    <strong className="detail-value">{bookingSuccess.reservationNumber}</strong>
                  </div>
                  <div>
                    <span className="detail-label">Table</span>
                    <strong className="detail-value">Table {bookingSuccess.tableNumber}</strong>
                  </div>
                  <div>
                    <span className="detail-label">Date</span>
                    <strong className="detail-value">{bookingSuccess.date}</strong>
                  </div>
                  <div>
                    <span className="detail-label">Time</span>
                    <strong className="detail-value">{bookingSuccess.timeSlot}</strong>
                  </div>
                  <div>
                    <span className="detail-label">Guests</span>
                    <strong className="detail-value">{bookingSuccess.guestCount} Guests</strong>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleBookTable}>
              <div className="form-group">
                <label className="form-label">Reservation Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={getTodayDateString()}
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
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setGuestCount(val);
                      // Clear selected table if it cannot accommodate new guest count
                      const currentSelected = tables.find(t => t._id === selectedTableId);
                      if (currentSelected && currentSelected.capacity < val) {
                        setSelectedTableId('');
                      }
                    }}
                    required
                  />
                </div>
              </div>

              {/* Table Selection Grid */}
              <div className="form-group">
                <label className="form-label">Select Table:</label>
                {availableTables.length === 0 ? (
                  <p className="text-muted mt-2">No tables found with capacity for {guestCount} guests.</p>
                ) : (
                  <div className="tables-select-grid">
                    {availableTables.map((t) => {
                      const isBooked = bookedTableIds.includes(t._id);
                      const isSelected = selectedTableId === t._id;
                      return (
                        <div
                          key={t._id}
                          className={`table-select-card ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                          onClick={() => {
                            if (isBooked) {
                              addToast(`Table ${t.tableNumber} is already reserved for this date and time slot. Please choose another table.`, 'error');
                              return;
                            }
                            setSelectedTableId(t._id);
                          }}
                        >
                          <div className="table-num">{t.tableNumber}</div>
                          <div className="table-capacity">{t.capacity} Seats</div>
                          <div className="table-loc">{t.location}</div>
                          {isBooked ? (
                            <span className="table-status-pill pill-booked">Booked</span>
                          ) : (
                            <span className="table-status-pill pill-available">Available</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={submitting || !selectedTableId}
              >
                {submitting ? 'Confirming Reservation...' : 'Confirm Reservation'}
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
                      <span className="res-ref">Ref: #{res.reservationNumber}</span>
                      <span className="res-details">{res.date} at {res.timeSlot} ({res.partySize || res.guestCount} Guests)</span>
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

        .booking-success-box {
          background: #f0fdf4;
          border: 1.5px solid #86efac;
          border-radius: var(--radius-sm);
          padding: 16px;
        }

        .success-banner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .success-icon-lg {
          font-size: 1.4rem;
        }

        .close-success-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: #4b5563;
        }

        .success-details-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 10px;
          background: #ffffff;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #dcfce7;
        }

        .detail-label {
          display: block;
          font-size: 0.72rem;
          text-transform: uppercase;
          color: #6b7280;
          font-weight: 600;
        }

        .detail-value {
          font-size: 0.88rem;
          color: var(--text-dark);
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
          position: relative;
        }

        .table-select-card:hover:not(.booked), .table-select-card.selected {
          border-color: var(--primary);
          background: var(--cream-subtle);
        }

        .table-select-card.booked {
          background: #f8fafc;
          border-color: #e2e8f0;
          opacity: 0.65;
          cursor: not-allowed;
        }

        .table-num {
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--primary);
        }

        .table-capacity { font-size: 0.8rem; color: var(--accent-hover); font-weight: 600; }
        .table-loc { font-size: 0.75rem; color: var(--text-muted); }

        .table-status-pill {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 4px;
          text-transform: uppercase;
        }

        .pill-available {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .pill-booked {
          background: #ffebee;
          color: #c62828;
        }

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
          align-items: flex-start;
          justify-content: space-between;
        }

        .res-table { display: block; color: var(--primary); font-size: 1.05rem; }
        .res-ref { display: block; font-size: 0.78rem; font-family: monospace; color: var(--accent-hover); font-weight: 600; margin-bottom: 2px; }
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
