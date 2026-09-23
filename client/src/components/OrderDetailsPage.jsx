import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiMapPin, FiCreditCard, FiXCircle, FiCopy, FiExternalLink, FiSmartphone, FiCheck } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { playSuccessSound } from '../utils/audio';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pay Bill Online state
  const [showPayModal, setShowPayModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [payingBill, setPayingBill] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState(false);

  const { addToast } = useToast();

  const merchantUpiId = 'bhavesh.patilrm@oksbi';
  const merchantName = 'Bhavesh Patil';

  const fetchOrder = async () => {
    try {
      const res = await API.get(`/orders/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching order details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await API.put(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        addToast('Order cancelled', 'info');
        fetchOrder();
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to cancel order', 'error');
    }
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(merchantUpiId);
    addToast('UPI ID copied to clipboard!', 'success');
  };

  const handlePayBillOnline = async (e) => {
    e.preventDefault();
    setPayingBill(true);
    try {
      const res = await API.put(`/orders/${order._id}/pay-online`, {
        paymentReference: utrNumber.trim()
      });

      if (res.data.success) {
        setShowPayModal(false);
        setPaySuccessMsg(true);
        playSuccessSound();
        fetchOrder();

        setTimeout(() => {
          setPaySuccessMsg(false);
        }, 3000);
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Payment failed', 'error');
    } finally {
      setPayingBill(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-wrapper container text-center">
        <h3>Order Not Found</h3>
      </div>
    );
  }

  const currentStatus = order.status || order.orderStatus || 'Pending';
  const steps = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];
  const currentStepIdx = steps.indexOf(currentStatus);

  const grandTotal = order.totalAmount || order.grandTotal || 0;
  const outstandingAmount = order.amountDue !== undefined ? order.amountDue : (order.paymentStatus === 'Paid' ? 0 : grandTotal);
  const address = order.shippingAddress || order.deliveryAddress || {};

  const upiUri = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${outstandingAmount}&cu=INR`;

  return (
    <div className="order-details-page page-wrapper">
      <div className="container">
        <div className="details-header mb-6">
          <div>
            <h1>Order #{order.orderNumber || order._id.substring(order._id.length - 8).toUpperCase()}</h1>
            <p>Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          {currentStatus === 'Pending' && (
            <button className="btn btn-danger btn-sm" onClick={handleCancelOrder}>
              <FiXCircle /> Cancel Order
            </button>
          )}
        </div>

        {/* Live Status Tracker Stepper (Only if not cancelled) */}
        {currentStatus !== 'Cancelled' ? (
          <div className="card stepper-card mb-8">
            <h3 className="mb-6">Live Delivery Status</h3>
            <div className="stepper-wrapper">
              {steps.map((step, idx) => {
                const isCompleted = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <div key={idx} className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="step-circle">{isCompleted ? <FiCheckCircle /> : idx + 1}</div>
                    <span className="step-label">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card badge-danger py-6 text-center mb-8">
            <h2>Order Cancelled</h2>
            <p>This order has been cancelled.</p>
          </div>
        )}

        {/* Success Alert Banner if Payment Completed Online */}
        {paySuccessMsg && (
          <div className="card pay-success-banner mb-6">
            <div className="banner-icon"><FiCheckCircle /></div>
            <div>
              <h3>✓ Payment Successful!</h3>
              <p>Your payment of ₹{grandTotal} was completed successfully via UPI. Payment status updated to PAID.</p>
            </div>
          </div>
        )}

        <div className="order-details-grid">
          {/* Items breakdown */}
          <div className="card">
            <h3 className="mb-4">Ordered Items</h3>
            <div className="details-items-list">
              {order.items.map((item, idx) => (
                <div key={idx} className="item-row">
                  <div className="item-main">
                    <strong>{item.quantity}x {item.name || item.productName}</strong>
                    <div className="opts">
                      {item.size?.name && <span>Size: {item.size.name} | </span>}
                      {item.sugarLevel && <span>Sugar: {item.sugarLevel} | </span>}
                      {item.addOns?.length > 0 && <span>Add-ons: {item.addOns.map(a => a.name).join(', ')}</span>}
                    </div>
                  </div>
                  <span className="item-price">₹{item.itemTotal || item.totalPrice || (item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row"><span>Subtotal:</span><span>₹{order.subtotal}</span></div>
            {order.discount > 0 && <div className="summary-row discount-row"><span>Discount:</span><span>- ₹{order.discount}</span></div>}
            <div className="summary-row"><span>GST Tax (5%):</span><span>₹{order.tax || 0}</span></div>
            <div className="summary-row"><span>Delivery Fee:</span><span>{order.deliveryFee > 0 ? `₹${order.deliveryFee}` : 'FREE'}</span></div>
            <div className="summary-row total-row"><span>Final Total Amount:</span><span>₹{grandTotal}</span></div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="card">
            <h3 className="mb-4"><FiMapPin /> Delivery Address</h3>
            <p className="mb-4">
              <strong>{address.fullName || address.name} ({address.phone})</strong><br />
              {address.addressLine || address.street}, {address.city}, {address.state} - {address.postalCode || address.pincode}
            </p>

            <h3 className="mb-4"><FiCreditCard /> Payment Status</h3>
            <p className="mb-2"><strong>Payment Method:</strong> {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</p>
            {order.paymentCompletedVia && (
              <p className="mb-2"><strong>Completed Via:</strong> <span className="badge badge-primary">{order.paymentCompletedVia}</span></p>
            )}

            <p className="mb-2">
              <strong>Payment Status:</strong>{' '}
              <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : order.paymentStatus === 'Failed' ? 'badge-danger' : 'badge-warning'}`}>
                {order.paymentStatus === 'Paid' ? 'PAID' : 'PAYMENT PENDING'}
              </span>
            </p>

            <p className="mb-2">
              <strong>Amount Due:</strong>{' '}
              <strong className={outstandingAmount === 0 ? 'text-success' : 'text-danger'}>
                ₹{outstandingAmount}
              </strong>
            </p>

            {order.paymentReference && (
              <p className="mb-2">
                <strong>UPI UTR / Ref Number:</strong> <code className="utr-code">{order.paymentReference}</code>
              </p>
            )}

            {/* Pay Bill Online Button (Visible when paymentStatus is Pending and status !== Cancelled) */}
            {order.paymentStatus === 'Pending' && currentStatus !== 'Cancelled' ? (
              <div className="mt-6 p-4 pay-online-callout">
                <p className="mb-3">Original Payment: <strong>Cash on Delivery</strong> (Amount Due: ₹{outstandingAmount})</p>
                <button className="btn btn-primary w-full btn-lg" onClick={() => setShowPayModal(true)}>
                  <FiCreditCard /> Pay Bill Online (₹{outstandingAmount})
                </button>
              </div>
            ) : order.paymentStatus === 'Paid' ? (
              <div className="mt-4 p-3 paid-confirmed-box">
                <FiCheckCircle className="icon-success" />
                <span><strong>Paid Online</strong> — Payment completed successfully.</span>
              </div>
            ) : null}

            {order.notes && (
              <div className="mt-6">
                <strong>Order Instructions:</strong>
                <p className="notes-box">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pay Bill Online Modal */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="card modal-content pay-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-bar">
              <h3>Pay Order Bill Online</h3>
              <button className="btn-icon" onClick={() => setShowPayModal(false)}><FiXCircle /></button>
            </div>

            <div className="upi-payment-panel mt-4">
              <div className="upi-panel-header">
                <h4>Dynamic UPI QR Code</h4>
                <span className="badge badge-success">Verified Merchant</span>
              </div>

              <div className="upi-qr-display-box">
                <div className="qr-container">
                  <QRCodeSVG
                    value={upiUri}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                  <span className="qr-caption">Scan with any UPI App</span>
                </div>

                <div className="upi-details-col">
                  <div className="upi-amount-badge">
                    <span>Outstanding Amount Due</span>
                    <strong>₹{outstandingAmount}</strong>
                  </div>

                  <div className="merchant-info-box">
                    <div className="info-row">
                      <span className="info-lbl">Merchant:</span>
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
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => window.location.href = upiUri}>
                      <FiSmartphone /> Pay in UPI App <FiExternalLink />
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePayBillOnline} className="mt-6">
                <div className="utr-input-box">
                  <label className="form-label">UPI Transaction / UTR Reference Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter 12-digit UTR Ref number from UPI app"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                  />
                </div>

                <div className="modal-actions mt-4">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={payingBill}>
                    {payingBill ? 'Verifying Payment...' : <><FiCheck /> Submit Payment Details (₹{outstandingAmount})</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .stepper-card {
          padding: 30px;
        }

        .stepper-wrapper {
          display: flex;
          justify-content: space-between;
          position: relative;
        }

        .stepper-wrapper::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 30px;
          right: 30px;
          height: 3px;
          background: var(--border-light);
          z-index: 1;
        }

        .step-item {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: var(--text-muted);
        }

        .step-item.completed .step-circle {
          background: var(--success);
          border-color: var(--success);
          color: #ffffff;
        }

        .step-item.current .step-circle {
          border-color: var(--primary);
          color: var(--primary);
          box-shadow: 0 0 0 4px rgba(74, 44, 32, 0.15);
        }

        .step-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .step-item.completed .step-label, .step-item.current .step-label {
          color: var(--primary);
        }

        .pay-success-banner {
          background: var(--success-bg);
          border: 1.5px solid var(--success);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .banner-icon {
          font-size: 2.2rem;
          color: var(--success);
        }

        .order-details-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
        }

        .details-items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
        }

        .opts {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .utr-code {
          background: var(--cream-subtle);
          padding: 2px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 700;
        }

        .pay-online-callout {
          background: var(--cream-subtle);
          border: 1.5px dashed var(--primary);
          border-radius: var(--radius-sm);
        }

        .paid-confirmed-box {
          background: var(--success-bg);
          border: 1px solid var(--success);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          color: var(--success);
        }

        .icon-success { font-size: 1.3rem; }

        .notes-box {
          background: var(--cream-subtle);
          padding: 10px;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-top: 4px;
        }

        /* Pay Modal */
        .pay-modal-card {
          max-width: 580px;
        }

        .modal-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .upi-payment-panel {
          background: var(--cream-subtle);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 20px;
        }

        .upi-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .upi-qr-display-box {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .qr-container {
          background: #ffffff;
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .qr-caption {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .upi-details-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .upi-amount-badge {
          background: #ffffff;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
        }

        .upi-amount-badge span { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
        .upi-amount-badge strong { font-size: 1.5rem; color: var(--primary); }

        .merchant-info-box { font-size: 0.85rem; }
        .info-row { display: flex; gap: 6px; }
        .info-lbl { color: var(--text-muted); }
        .info-val { color: var(--primary); }
        .upi-id-code { font-family: monospace; font-weight: 700; background: #ffffff; padding: 2px 6px; border-radius: 4px; }

        .upi-buttons-group { display: flex; gap: 8px; }

        @media (max-width: 992px) {
          .order-details-grid { grid-template-columns: 1fr; }
          .stepper-wrapper { overflow-x: auto; padding-bottom: 10px; }
          .upi-qr-display-box { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default OrderDetailsPage;
