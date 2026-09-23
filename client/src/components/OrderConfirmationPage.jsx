import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiClock, FiMapPin, FiArrowRight } from 'react-icons/fi';
import API from '../services/api';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${orderId}`);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching order', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page page-wrapper">
      <div className="container">
        <div className="card text-center success-card">
          <div className="success-icon-box">
            <FiCheckCircle />
          </div>
          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-desc">
            Thank you for ordering with CaféHub. Your food is being prepared with love and will arrive shortly!
          </p>

          <div className="order-num-badge">
            Order #: <span>{orderId}</span>
          </div>

          {order && (
            <div className="confirmation-summary-box">
              <div className="info-item">
                <FiPackage className="icon" />
                <div>
                  <strong>Total Items</strong>
                  <span>{order.items.length} item(s)</span>
                </div>
              </div>

              <div className="info-item">
                <FiClock className="icon" />
                <div>
                  <strong>Est. Preparation Time</strong>
                  <span>25 - 30 Mins</span>
                </div>
              </div>

              <div className="info-item">
                <FiMapPin className="icon" />
                <div>
                  <strong>Delivery City</strong>
                  <span>{order.deliveryAddress?.city}</span>
                </div>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <Link to={`/orders/${orderId}`} className="btn btn-primary btn-lg">
              Track Order Status <FiArrowRight />
            </Link>
            <Link to="/menu" className="btn btn-outline btn-lg">
              Back to Menu
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .success-card {
          max-width: 680px;
          margin: 40px auto;
          padding: 48px;
          border-radius: var(--radius-lg);
        }

        .success-icon-box {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--success-bg);
          color: var(--success);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          margin: 0 auto 20px auto;
        }

        .success-title {
          font-size: 2.4rem;
          margin-bottom: 8px;
        }

        .success-desc {
          color: var(--text-muted);
          font-size: 1.05rem;
          margin-bottom: 24px;
        }

        .order-num-badge {
          display: inline-block;
          background: var(--cream-subtle);
          border: 1px solid var(--border-light);
          padding: 8px 18px;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--primary);
          margin-bottom: 30px;
        }

        .confirmation-summary-box {
          display: flex;
          justify-content: space-around;
          background: var(--bg-page);
          padding: 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
          margin-bottom: 36px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .info-item .icon {
          font-size: 1.6rem;
          color: var(--accent-hover);
        }

        .info-item strong { display: block; font-size: 0.85rem; color: var(--primary); }
        .info-item span { font-size: 0.85rem; color: var(--text-muted); }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        @media (max-width: 576px) {
          .confirmation-summary-box { flex-direction: column; gap: 16px; }
          .action-buttons { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmationPage;
