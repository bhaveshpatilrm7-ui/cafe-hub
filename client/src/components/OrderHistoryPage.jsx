import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiClock, FiChevronRight, FiCreditCard } from 'react-icons/fi';
import API from '../services/api';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get('/orders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching order history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      case 'Pending': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  return (
    <div className="order-history-page page-wrapper">
      <div className="container">
        <div className="page-header mb-6">
          <h1>My Orders</h1>
          <p>View past orders and track ongoing food deliveries.</p>
        </div>

        {orders.length === 0 ? (
          <div className="card text-center py-12">
            <div className="empty-state-icon">📦</div>
            <h2>No Orders Found</h2>
            <p>You haven't placed any orders yet.</p>
            <Link to="/menu" className="btn btn-primary mt-4">Order Now</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const currentStatus = order.status || order.orderStatus || 'Pending';
              const total = order.totalAmount || order.grandTotal || 0;
              const isPaid = order.paymentStatus === 'Paid';
              const canPayOnline = !isPaid && currentStatus !== 'Cancelled';

              return (
                <div key={order._id} className="card order-card">
                  <div className="order-header">
                    <div>
                      <span className="order-id">#{order.orderNumber || order._id.substring(order._id.length - 8).toUpperCase()}</span>
                      <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="order-badges-header">
                      <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                        {isPaid ? 'Paid' : 'Payment Pending'}
                      </span>
                      <span className={`badge ${getStatusBadge(currentStatus)}`}>
                        {currentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="preview-item">
                        <span>{item.quantity}x {item.name || item.productName}</span>
                        <span>₹{item.itemTotal || item.totalPrice || (item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div>
                      <span className="total-label">Final Total Amount:</span>
                      <strong className="total-val"> ₹{total}</strong>
                      <span className="pay-method-tag"> ({order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod})</span>
                    </div>

                    <div className="action-buttons-group">
                      {canPayOnline && (
                        <Link to={`/orders/${order._id}`} className="btn btn-primary btn-sm">
                          <FiCreditCard /> Pay Bill Online
                        </Link>
                      )}
                      <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                        View Details <FiChevronRight />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 860px;
        }

        .order-card {
          padding: 24px;
        }

        .order-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 16px;
        }

        .order-badges-header {
          display: flex;
          gap: 8px;
        }

        .order-id {
          font-weight: 800;
          font-family: monospace;
          font-size: 1rem;
          color: var(--primary);
          margin-right: 12px;
        }

        .order-date {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .order-items-preview {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }

        .preview-item {
          display: flex;
          justify-content: space-between;
        }

        .order-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px dashed var(--border-light);
          flex-wrap: wrap;
          gap: 12px;
        }

        .total-label { font-size: 0.9rem; color: var(--text-muted); }
        .total-val { font-size: 1.2rem; color: var(--primary); }
        .pay-method-tag { font-size: 0.8rem; color: var(--text-muted); }

        .action-buttons-group {
          display: flex;
          gap: 10px;
        }
      `}</style>
    </div>
  );
};

export default OrderHistoryPage;
