import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiCheckCircle, FiPlus, FiLock, FiCopy, FiExternalLink, FiSmartphone } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { playSuccessSound } from '../utils/audio';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Success modal state
  const [successOrder, setSuccessOrder] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  // New address form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const merchantUpiId = 'bhavesh.patilrm@oksbi';
  const merchantName = 'Bhavesh Patil';

  const fetchAddresses = async () => {
    try {
      const res = await API.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.data);
        if (res.data.data.length > 0) {
          const defaultAddr = res.data.data.find(a => a.isDefault) || res.data.data[0];
          setSelectedAddressId(defaultAddr._id);
        }
      }
    } catch (err) {
      console.error('Error fetching addresses', err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/addresses', {
        fullName,
        phone,
        addressLine,
        city,
        state,
        postalCode,
        isDefault: addresses.length === 0
      });
      if (res.data.success) {
        addToast('Address added successfully!', 'success');
        setShowAddModal(false);
        setFullName(''); setPhone(''); setAddressLine(''); setCity(''); setState(''); setPostalCode('');
        fetchAddresses();
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to add address', 'error');
    }
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(merchantUpiId);
    addToast('UPI ID copied to clipboard!', 'success');
  };

  const finalTotalAmount = cart.grandTotal || 0;
  const upiUri = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${finalTotalAmount}&cu=INR`;

  const handleOpenUpiApp = () => {
    window.location.href = upiUri;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      addToast('Please select or add a delivery address', 'error');
      return;
    }

    const selectedAddress = addresses.find(a => a._id === selectedAddressId);
    if (!selectedAddress) {
      addToast('Selected address not found', 'error');
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await API.post('/orders', {
        shippingAddress: {
          fullName: selectedAddress.fullName || selectedAddress.name || 'Customer',
          phone: selectedAddress.phone || '9876543210',
          addressLine: selectedAddress.addressLine || selectedAddress.street || 'Address Line',
          city: selectedAddress.city || 'City',
          state: selectedAddress.state || 'State',
          postalCode: selectedAddress.postalCode || selectedAddress.pincode || '000000'
        },
        paymentMethod,
        paymentReference: utrNumber.trim(),
        notes
      });

      if (res.data.success) {
        const createdOrder = res.data.data;
        setSuccessOrder(createdOrder);

        // 1. Play success sound
        playSuccessSound();

        // 2. Clear Cart
        await clearCart();

        // 3. Wait 1.5 - 2s and redirect to Home
        setRedirecting(true);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1800);
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Order placement failed', 'error');
      setPlacingOrder(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    if (!successOrder) {
      navigate('/cart');
      return null;
    }
  }

  return (
    <div className="checkout-page page-wrapper">
      <div className="container">
        <h1 className="mb-6">Checkout</h1>

        <div className="checkout-grid">
          {/* Main Form Area */}
          <div className="checkout-main">
            {/* 1. Address Section */}
            <div className="card checkout-step-card">
              <div className="step-header">
                <h3><FiMapPin /> 1. Select Delivery Address</h3>
                <button className="btn btn-outline btn-sm" onClick={() => setShowAddModal(true)}>
                  <FiPlus /> Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="mb-4">No saved addresses found. Please add a delivery address.</p>
                  <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add Address Now</button>
                </div>
              ) : (
                <div className="address-options-list">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`address-option-card ${selectedAddressId === addr._id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr._id}
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                      />
                      <div className="addr-info">
                        <span className="addr-street">{addr.fullName || addr.name} ({addr.phone})</span>
                        <span className="addr-city">{addr.addressLine || addr.street}, {addr.city}, {addr.state} - {addr.postalCode || addr.pincode}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Payment Method Section */}
            <div className="card checkout-step-card">
              <h3><FiCreditCard /> 2. Choose Payment Method</h3>
              <div className="payment-options">
                {/* Option 1: Online UPI QR */}
                <label className={`payment-option ${paymentMethod === 'UPI' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  <div>
                    <strong>Online UPI QR Payment (Google Pay / PhonePe / Paytm / BHIM)</strong>
                    <p>Scan dynamic QR code with exact total ₹{finalTotalAmount}</p>
                  </div>
                </label>

                {/* Option 2: Cash on Delivery (COD) */}
                <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div>
                    <strong>Cash on Delivery (COD)</strong>
                    <p>Pay cash or scan QR upon food delivery. (You can also pay online later!)</p>
                  </div>
                </label>
              </div>

              {/* Dynamic UPI Payment Panel */}
              {paymentMethod === 'UPI' && (
                <div className="upi-payment-panel mt-6">
                  <div className="upi-panel-header">
                    <h4>Pay via Dynamic UPI QR Code</h4>
                    <span className="badge badge-success">Verified Merchant</span>
                  </div>

                  <div className="upi-qr-display-box">
                    <div className="qr-container">
                      <QRCodeSVG
                        value={upiUri}
                        size={220}
                        level="H"
                        includeMargin={true}
                      />
                      <span className="qr-caption">Scan with any UPI App</span>
                    </div>

                    <div className="upi-details-col">
                      <div className="upi-amount-badge">
                        <span>Amount to Pay</span>
                        <strong>₹{finalTotalAmount}</strong>
                      </div>

                      <div className="merchant-info-box">
                        <div className="info-row">
                          <span className="info-lbl">Merchant Name:</span>
                          <strong className="info-val">{merchantName}</strong>
                        </div>
                        <div className="info-row">
                          <span className="info-lbl">UPI ID:</span>
                          <code className="upi-id-code">{merchantUpiId}</code>
                        </div>
                      </div>

                      <div className="upi-buttons-group">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopyUpiId}>
                          <FiCopy /> Copy UPI ID
                        </button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={handleOpenUpiApp}>
                          <FiSmartphone /> Pay with UPI App <FiExternalLink />
                        </button>
                      </div>

                      <p className="upi-instruction">
                        Scan with Google Pay, PhonePe, Paytm, or BHIM. Amount ₹{finalTotalAmount} is encoded in the QR.
                      </p>
                    </div>
                  </div>

                  {/* UTR Input */}
                  <div className="utr-input-box mt-6">
                    <label className="form-label">UPI Transaction / UTR Number (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter 12-digit UTR / Ref Number from UPI App"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                    />
                    <small className="help-text">Enter your 12-digit UTR number after completing the transfer.</small>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Order Notes */}
            <div className="card checkout-step-card">
              <h3>Order Instructions / Notes</h3>
              <textarea
                className="form-textarea"
                placeholder="E.g., Please make coffee extra hot, leave at front gate, or ring doorbell twice."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Right Summary Area */}
          <div className="checkout-summary">
            <div className="card summary-card">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {cart.items.map((item) => (
                  <div key={item._id} className="summary-item">
                    <span>{item.quantity}x {item.product?.name}</span>
                    <span>₹{item.itemTotal || item.totalPrice}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cart.subtotal}</span>
              </div>
              {cart.discountAmount > 0 && (
                <div className="summary-row discount-row">
                  <span>Discount</span>
                  <span>- ₹{cart.discountAmount}</span>
                </div>
              )}
              <div className="summary-row">
                <span>GST Tax (5%)</span>
                <span>₹{cart.tax || Math.round(cart.subtotal * 0.05)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{cart.subtotal > 500 ? <strong className="free-tag">FREE</strong> : `₹${cart.deliveryFee || 40}`}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Final Total Amount</span>
                <span>₹{finalTotalAmount}</span>
              </div>

              <button
                className="btn btn-primary btn-lg w-full mt-6"
                disabled={placingOrder || !selectedAddressId}
                onClick={handlePlaceOrder}
              >
                {placingOrder ? 'Processing Order...' : (
                  paymentMethod === 'COD' ? <><FiCheckCircle /> Place Order (₹{finalTotalAmount})</> : <><FiLock /> Verify & Place Order (₹{finalTotalAmount})</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Popup with Animation, Sound & Auto Redirect */}
      {successOrder && (
        <div className="modal-overlay">
          <div className="card modal-content success-popup-modal text-center">
            <div className="success-anim-box mb-4">
              <div className="success-check-circle">
                <FiCheckCircle className="check-icon-anim" />
              </div>
            </div>

            <h2 className="success-popup-title">Order Placed Successfully!</h2>
            <p className="success-popup-sub">Your order has been placed successfully.</p>

            <div className="order-summary-chip-box mt-4">
              <div className="summary-chip-row">
                <span>Order ID:</span>
                <strong>#{successOrder.orderNumber || successOrder._id.substring(successOrder._id.length - 8).toUpperCase()}</strong>
              </div>
              <div className="summary-chip-row">
                <span>Payment Method:</span>
                <strong>{successOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online UPI QR'}</strong>
              </div>
              <div className="summary-chip-row highlight-amt">
                <span>Amount to Pay:</span>
                <strong>₹{successOrder.totalAmount}</strong>
              </div>
            </div>

            <div className="redirect-status-msg mt-6">
              <div className="spinner-small"></div>
              <span>Redirecting to Home...</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Delivery Address</h3>
            <form onSubmit={handleAddAddress}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Bhavesh Patil"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Flat 101, Oakwood Residency, MG Road"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="400001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
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
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
        }

        .checkout-main {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .checkout-step-card {
          padding: 24px;
        }

        .step-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .checkout-step-card h3 {
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .address-options-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .address-option-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          border: 1.5px solid var(--border-light);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition);
        }

        .address-option-card.selected {
          border-color: var(--primary);
          background: var(--cream-subtle);
        }

        .addr-info {
          display: flex;
          flex-direction: column;
        }

        .addr-street {
          font-weight: 700;
          color: var(--primary);
        }

        .addr-city {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 14px;
        }

        .payment-option {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          border: 1.5px solid var(--border-light);
          border-radius: var(--radius-sm);
          cursor: pointer;
        }

        .payment-option.selected {
          border-color: var(--primary);
          background: var(--cream-subtle);
        }

        .payment-option strong { display: block; color: var(--primary); }
        .payment-option p { font-size: 0.8rem; color: var(--text-muted); }

        /* Dynamic UPI Panel */
        .upi-payment-panel {
          background: var(--cream-subtle);
          border: 1.5px solid var(--border-focus);
          border-radius: var(--radius-md);
          padding: 24px;
        }

        .upi-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-light);
        }

        .upi-panel-header h4 {
          font-size: 1.1rem;
          color: var(--primary);
        }

        .upi-qr-display-box {
          display: flex;
          gap: 24px;
          align-items: center;
          flex-wrap: wrap;
        }

        .qr-container {
          background: #ffffff;
          padding: 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .qr-caption {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 8px;
          font-weight: 600;
        }

        .upi-details-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 240px;
        }

        .upi-amount-badge {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }

        .upi-amount-badge span {
          font-size: 0.78rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 700;
        }

        .upi-amount-badge strong {
          font-size: 1.8rem;
          color: var(--primary);
        }

        .merchant-info-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.9rem;
        }

        .info-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .info-lbl { color: var(--text-muted); }
        .info-val { color: var(--primary); }

        .upi-id-code {
          background: #ffffff;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 700;
          color: var(--primary);
          border: 1px solid var(--border-light);
        }

        .upi-buttons-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .upi-instruction {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .utr-input-box {
          background: #ffffff;
          padding: 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }

        .help-text {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 4px;
          display: block;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.9rem;
          margin-bottom: 14px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
        }

        .discount-row { color: var(--success); font-weight: 600; }
        .free-tag { color: var(--success); }

        /* Success Popup Modal */
        .success-popup-modal {
          max-width: 440px;
          padding: 36px 28px;
          animation: popIn 0.3s ease-out;
        }

        .success-anim-box {
          display: flex;
          justify-content: center;
        }

        .success-check-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--success-bg);
          color: var(--success);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          box-shadow: 0 4px 14px rgba(42, 157, 143, 0.25);
        }

        .check-icon-anim {
          animation: scaleUp 0.4s ease-out;
        }

        .success-popup-title {
          font-size: 1.6rem;
          color: var(--primary);
        }

        .success-popup-sub {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .order-summary-chip-box {
          background: var(--cream-subtle);
          border: 1px solid var(--border-light);
          padding: 14px;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.9rem;
          text-align: left;
        }

        .summary-chip-row {
          display: flex;
          justify-content: space-between;
        }

        .highlight-amt {
          border-top: 1px dashed var(--border-light);
          padding-top: 6px;
          font-size: 1rem;
          color: var(--primary);
        }

        .redirect-status-msg {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-light);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes scaleUp {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          padding: 30px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
        }

        @media (max-width: 992px) {
          .checkout-grid { grid-template-columns: 1fr; }
          .upi-qr-display-box { flex-direction: column; align-items: stretch; }
          .qr-container { align-self: center; }
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
