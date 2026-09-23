import React, { useState, useEffect } from 'react';
import { FiFeather, FiClock, FiCheck, FiPlay, FiPackage, FiRefreshCw } from 'react-icons/fi';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const KitchenDashboardPage = () => {
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchKitchenQueue = async () => {
    try {
      const res = await API.get('/kitchen/queue');
      if (res.data.success) {
        setKitchenOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching kitchen queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenQueue();
    // Auto-refresh every 8 seconds for real-time kitchen display
    const interval = setInterval(fetchKitchenQueue, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await API.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res.data.success) {
        addToast(`Order marked as ${newStatus}`, 'success');
        fetchKitchenQueue();
      }
    } catch (err) {
      addToast('Error updating order status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  const pendingOrders = kitchenOrders.filter(o => o.orderStatus === 'Pending');
  const preparingOrders = kitchenOrders.filter(o => o.orderStatus === 'Preparing' || o.orderStatus === 'Confirmed');
  const readyOrders = kitchenOrders.filter(o => o.orderStatus === 'Ready');

  return (
    <div className="kitchen-page page-wrapper">
      <div className="container">
        <div className="kitchen-header-bar mb-6">
          <div>
            <h1><FiFeather /> Kitchen Live Queue</h1>
            <p>Real-time order ticket display for barista & chef prep staff.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={fetchKitchenQueue}>
            <FiRefreshCw /> Refresh Queue
          </button>
        </div>

        <div className="kitchen-kanban-grid">
          {/* Column 1: Incoming / Pending Orders */}
          <div className="kanban-col col-pending">
            <div className="col-header">
              <h3>New Orders</h3>
              <span className="col-count">{pendingOrders.length}</span>
            </div>

            <div className="kanban-cards-wrapper">
              {pendingOrders.length === 0 ? (
                <p className="no-orders-msg">No pending orders</p>
              ) : (
                pendingOrders.map(order => (
                  <div key={order._id} className="card kitchen-order-card">
                    <div className="card-top">
                      <strong className="order-ticket-id">#{order._id.substring(order._id.length - 6).toUpperCase()}</strong>
                      <span className="order-time"><FiClock /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="customer-name-bar">
                      Customer: <strong>{order.user?.name || 'Guest'}</strong>
                    </div>

                    <div className="kitchen-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="k-item">
                          <strong className="k-qty">{item.quantity}x</strong>
                          <div className="k-desc">
                            <span className="k-name">{item.productName}</span>
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
                      onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                    >
                      <FiPlay /> Start Preparing
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: In Preparation */}
          <div className="kanban-col col-preparing">
            <div className="col-header">
              <h3>Preparing</h3>
              <span className="col-count">{preparingOrders.length}</span>
            </div>

            <div className="kanban-cards-wrapper">
              {preparingOrders.length === 0 ? (
                <p className="no-orders-msg">No orders being prepared</p>
              ) : (
                preparingOrders.map(order => (
                  <div key={order._id} className="card kitchen-order-card highlight-prep">
                    <div className="card-top">
                      <strong className="order-ticket-id">#{order._id.substring(order._id.length - 6).toUpperCase()}</strong>
                      <span className="order-time"><FiClock /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="customer-name-bar">
                      Customer: <strong>{order.user?.name || 'Guest'}</strong>
                    </div>

                    <div className="kitchen-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="k-item">
                          <strong className="k-qty">{item.quantity}x</strong>
                          <div className="k-desc">
                            <span className="k-name">{item.productName}</span>
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

          {/* Column 3: Ready for Pickup / Delivery */}
          <div className="kanban-col col-ready">
            <div className="col-header">
              <h3>Ready</h3>
              <span className="col-count">{readyOrders.length}</span>
            </div>

            <div className="kanban-cards-wrapper">
              {readyOrders.length === 0 ? (
                <p className="no-orders-msg">No ready orders</p>
              ) : (
                readyOrders.map(order => (
                  <div key={order._id} className="card kitchen-order-card highlight-ready">
                    <div className="card-top">
                      <strong className="order-ticket-id">#{order._id.substring(order._id.length - 6).toUpperCase()}</strong>
                      <span className="order-time"><FiClock /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="customer-name-bar">
                      Customer: <strong>{order.user?.name || 'Guest'}</strong>
                    </div>

                    <div className="kitchen-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="k-item">
                          <strong className="k-qty">{item.quantity}x</strong>
                          <div className="k-desc">
                            <span className="k-name">{item.productName}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      className="btn btn-primary w-full mt-4"
                      onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                    >
                      <FiPackage /> Dispatch Delivery
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .kitchen-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kitchen-kanban-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .kanban-col {
          background: #f1ede8;
          border-radius: var(--radius-md);
          padding: 18px;
          min-height: 500px;
        }

        .col-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--border-light);
        }

        .col-header h3 { font-size: 1.15rem; }

        .col-count {
          background: var(--primary);
          color: #ffffff;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 800;
        }

        .kanban-cards-wrapper {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .no-orders-msg {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 30px;
        }

        .kitchen-order-card {
          padding: 16px;
        }

        .highlight-prep { border-left: 5px solid var(--warning); }
        .highlight-ready { border-left: 5px solid var(--success); }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .order-ticket-id { font-family: monospace; font-size: 1.1rem; color: var(--primary); }
        .order-time { font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }

        .customer-name-bar {
          font-size: 0.85rem;
          color: var(--text-dark);
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px dashed var(--border-light);
        }

        .kitchen-items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .k-item {
          display: flex;
          gap: 8px;
          font-size: 0.9rem;
        }

        .k-qty { color: var(--primary); }
        .k-desc { display: flex; flex-direction: column; }
        .k-name { font-weight: 700; }
        .k-opts { font-size: 0.75rem; color: var(--text-muted); }

        .kitchen-note-box {
          background: #fff8e1;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-top: 8px;
        }

        @media (max-width: 992px) {
          .kitchen-kanban-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default KitchenDashboardPage;
