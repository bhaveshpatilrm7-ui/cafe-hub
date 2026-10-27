import React, { useState, useEffect, useRef } from 'react';
import { FiFeather, FiClock, FiCheck, FiPlay, FiPackage, FiRefreshCw, FiBell, FiTruck } from 'react-icons/fi';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { playSuccessSound } from '../utils/audio';

const KitchenDashboardPage = () => {
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const prevOrderIdsRef = useRef(new Set());

  const fetchKitchenQueue = async (isInitial = false) => {
    try {
      const res = await API.get('/kitchen/orders');
      if (res.data.success) {
        const fetchedOrders = res.data.data;
        setKitchenOrders(fetchedOrders);

        // Check if new orders arrived to trigger sound & toast notification
        if (!isInitial && prevOrderIdsRef.current.size > 0) {
          const newOrders = fetchedOrders.filter(o => !prevOrderIdsRef.current.has(o._id));
          if (newOrders.length > 0) {
            playSuccessSound();
            const latest = newOrders[0];
            const orderNum = latest.orderNumber || `#${latest._id.substring(latest._id.length - 6).toUpperCase()}`;
            addToast(`🔔 New Order Received: ${orderNum} from ${latest.user?.name || 'Customer'}`, 'info');
          }
        }

        // Update known order IDs
        const idsSet = new Set(fetchedOrders.map(o => o._id));
        prevOrderIdsRef.current = idsSet;
      }
    } catch (err) {
      console.error('Error fetching kitchen queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenQueue(true);
    // Controlled polling every 6 seconds for real-time order queue updates
    const interval = setInterval(() => fetchKitchenQueue(false), 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(`Order updated to ${newStatus}`, 'success');
        fetchKitchenQueue(false);
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Error updating order status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  const pendingOrders = kitchenOrders.filter(o => (o.status || o.orderStatus) === 'Pending');
  const confirmedOrders = kitchenOrders.filter(o => (o.status || o.orderStatus) === 'Confirmed');
  const preparingOrders = kitchenOrders.filter(o => (o.status || o.orderStatus) === 'Preparing');
  const readyOrders = kitchenOrders.filter(o => (o.status || o.orderStatus) === 'Ready' || (o.status || o.orderStatus) === 'Out for Delivery');

  return (
    <div className="kitchen-page page-wrapper">
      <div className="container">
        <div className="kitchen-header-bar mb-6">
          <div>
            <h1><FiFeather /> Staff Order & Kitchen Queue</h1>
            <p>Real-time order management ticket display for operational staff.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => fetchKitchenQueue(false)}>
            <FiRefreshCw /> Refresh Queue ({kitchenOrders.length} Active)
          </button>
        </div>

        <div className="kitchen-kanban-grid">
          {/* Column 1: New / Pending Orders */}
          <div className="kanban-col col-pending">
            <div className="col-header">
              <h3><FiBell /> New Orders</h3>
              <span className="col-count">{pendingOrders.length}</span>
            </div>

            <div className="kanban-cards-wrapper">
              {pendingOrders.length === 0 ? (
                <p className="no-orders-msg">No new orders</p>
              ) : (
                pendingOrders.map(order => (
                  <div key={order._id} className="card kitchen-order-card">
                    <div className="card-top">
                      <strong className="order-ticket-id">#{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}</strong>
                      <span className="order-time"><FiClock /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="customer-name-bar">
                      Customer: <strong>{order.user?.name || 'Customer'}</strong>
                    </div>

                    <div className="payment-method-chip mb-2">
                      <span className="badge badge-primary">{order.paymentMethod || 'COD'}</span>
                      <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {order.paymentStatus === 'Paid' ? 'Paid' : 'Payment Pending'}
                      </span>
                    </div>

                    <div className="kitchen-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="k-item">
                          <strong className="k-qty">{item.quantity}x</strong>
                          <div className="k-desc">
                            <span className="k-name">{item.name || item.productName}</span>
                            <span className="k-opts">
                              {item.size?.name ? `Size: ${item.size.name} ` : ''}
                              {item.sugarLevel ? `| Sugar: ${item.sugarLevel} ` : ''}
                              {item.addOns?.length > 0 ? `| Add: ${item.addOns.map(a => a.name).join(', ')}` : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="kitchen-note-box">
                        <strong>Note:</strong> {order.notes}
                      </div>
                    )}

                    <button
                      className="btn btn-primary w-full mt-4"
                      onClick={() => handleUpdateStatus(order._id, 'Confirmed')}
                    >
                      <FiCheck /> Accept Order
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Confirmed Orders */}
          <div className="kanban-col col-confirmed">
            <div className="col-header">
              <h3><FiCheck /> Confirmed</h3>
              <span className="col-count">{confirmedOrders.length}</span>
            </div>

            <div className="kanban-cards-wrapper">
              {confirmedOrders.length === 0 ? (
                <p className="no-orders-msg">No confirmed orders</p>
              ) : (
                confirmedOrders.map(order => (
                  <div key={order._id} className="card kitchen-order-card">
                    <div className="card-top">
                      <strong className="order-ticket-id">#{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}</strong>
                      <span className="order-time"><FiClock /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="customer-name-bar">
                      Customer: <strong>{order.user?.name || 'Customer'}</strong>
                    </div>

                    <div className="kitchen-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="k-item">
                          <strong className="k-qty">{item.quantity}x</strong>
                          <div className="k-desc">
                            <span className="k-name">{item.name || item.productName}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      className="btn btn-accent w-full mt-4"
                      onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                    >
                      <FiPlay /> Start Preparing
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: In Preparation */}
          <div className="kanban-col col-preparing">
            <div className="col-header">
              <h3><FiPlay /> Preparing</h3>
              <span className="col-count">{preparingOrders.length}</span>
            </div>

            <div className="kanban-cards-wrapper">
              {preparingOrders.length === 0 ? (
                <p className="no-orders-msg">No orders being prepared</p>
              ) : (
                preparingOrders.map(order => (
                  <div key={order._id} className="card kitchen-order-card highlight-prep">
                    <div className="card-top">
                      <strong className="order-ticket-id">#{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}</strong>
                      <span className="order-time"><FiClock /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="customer-name-bar">
                      Customer: <strong>{order.user?.name || 'Customer'}</strong>
                    </div>

                    <div className="kitchen-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="k-item">
                          <strong className="k-qty">{item.quantity}x</strong>
                          <div className="k-desc">
                            <span className="k-name">{item.name || item.productName}</span>
                            <span className="k-opts">
                              {item.size?.name ? `Size: ${item.size.name} ` : ''}
                              {item.sugarLevel ? `| Sugar: ${item.sugarLevel} ` : ''}
                              {item.addOns?.length > 0 ? `| Add: ${item.addOns.map(a => a.name).join(', ')}` : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="kitchen-note-box">
                        <strong>Note:</strong> {order.notes}
                      </div>
                    )}

                    <button
                      className="btn btn-accent w-full mt-4"
                      onClick={() => handleUpdateStatus(order._id, 'Ready')}
                    >
                      <FiCheck /> Mark Ready
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 4: Ready / Dispatched */}
          <div className="kanban-col col-ready">
            <div className="col-header">
              <h3><FiPackage /> Ready / Out for Delivery</h3>
              <span className="col-count">{readyOrders.length}</span>
            </div>

            <div className="kanban-cards-wrapper">
              {readyOrders.length === 0 ? (
                <p className="no-orders-msg">No ready orders</p>
              ) : (
                readyOrders.map(order => (
                  <div key={order._id} className="card kitchen-order-card highlight-ready">
                    <div className="card-top">
                      <strong className="order-ticket-id">#{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}</strong>
                      <span className="order-time"><FiClock /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="customer-name-bar">
                      Customer: <strong>{order.user?.name || 'Customer'}</strong>
                    </div>

                    <div className="kitchen-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="k-item">
                          <strong className="k-qty">{item.quantity}x</strong>
                          <div className="k-desc">
                            <span className="k-name">{item.name || item.productName}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(order.status || order.orderStatus) === 'Ready' ? (
                      <button
                        className="btn btn-primary w-full mt-4"
                        onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                      >
                        <FiTruck /> Out for Delivery
                      </button>
                    ) : (
                      <button
                        className="btn btn-success w-full mt-4"
                        onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                      >
                        <FiCheck /> Mark Delivered
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .kitchen-kanban-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          align-items: start;
        }

        .kanban-col {
          background: var(--cream-subtle);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
          padding: 16px;
          min-height: 500px;
        }

        .col-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          margin-bottom: 16px;
          border-bottom: 2px solid var(--border-light);
        }

        .col-header h3 {
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .col-count {
          background: var(--primary);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.8rem;
          padding: 2px 10px;
          border-radius: var(--radius-full);
        }

        .kanban-cards-wrapper {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .kitchen-order-card {
          padding: 16px;
          border: 1px solid var(--border-light);
        }

        .highlight-prep {
          border-left: 4px solid var(--accent);
        }

        .highlight-ready {
          border-left: 4px solid var(--success);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .order-ticket-id {
          font-family: monospace;
          font-size: 1.1rem;
          color: var(--primary);
        }

        .order-time {
          font-size: 0.78rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .customer-name-bar {
          font-size: 0.85rem;
          margin-bottom: 10px;
          color: var(--text-dark);
        }

        .payment-method-chip {
          display: flex;
          gap: 6px;
          font-size: 0.75rem;
        }

        .kitchen-items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #ffffff;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid var(--border-light);
          margin-bottom: 10px;
        }

        .k-item {
          display: flex;
          gap: 8px;
          font-size: 0.88rem;
        }

        .k-qty {
          color: var(--primary);
        }

        .k-desc {
          display: flex;
          flex-direction: column;
        }

        .k-name {
          font-weight: 600;
        }

        .k-opts {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .kitchen-note-box {
          background: #fff8e1;
          border: 1px solid #ffe082;
          padding: 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #5d4037;
        }

        .no-orders-msg {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
          padding: 30px 0;
        }

        @media (max-width: 1200px) {
          .kitchen-kanban-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .kitchen-kanban-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default KitchenDashboardPage;
