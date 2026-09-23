import React, { useState, useEffect } from 'react';
import {
  FiGrid, FiShoppingBag, FiLayers, FiCalendar, FiBox, FiTag, FiUsers, FiDollarSign,
  FiTrendingUp, FiPlus, FiEdit, FiTrash2, FiSearch, FiRefreshCw, FiCheck, FiX
} from 'react-icons/fi';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { addToast } = useToast();

  // Data states
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodForm, setProdForm] = useState({
    name: '', category: '', description: '', basePrice: 0, discountPercent: 0, image: '', stockQuantity: 50, isFeatured: false
  });

  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '', image: '' });

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'percentage', discountValue: 10, minOrderAmount: 100, maxDiscountAmount: 50, usageLimit: 100
  });

  const [showTableModal, setShowTableModal] = useState(false);
  const [tableForm, setTableForm] = useState({ tableNumber: '', capacity: 2, location: 'Indoor' });

  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [invForm, setInvForm] = useState({ item: '', category: 'Dairy', quantity: 10, unit: 'kg', minThreshold: 3 });

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats', err);
    }
  };

  const fetchTabContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') await fetchStats();
      else if (activeTab === 'products') {
        const [pRes, cRes] = await Promise.all([API.get('/products?limit=100'), API.get('/categories')]);
        if (pRes.data.success) setProducts(pRes.data.data);
        if (cRes.data.success) setCategories(cRes.data.data);
      }
      else if (activeTab === 'categories') {
        const res = await API.get('/categories');
        if (res.data.success) setCategories(res.data.data);
      }
      else if (activeTab === 'orders') {
        const res = await API.get('/orders/admin/all');
        if (res.data.success) setOrders(res.data.data);
      }
      else if (activeTab === 'reservations') {
        const res = await API.get('/reservations/admin/all');
        if (res.data.success) setReservations(res.data.data);
      }
      else if (activeTab === 'tables') {
        const res = await API.get('/tables');
        if (res.data.success) setTables(res.data.data);
      }
      else if (activeTab === 'coupons') {
        const res = await API.get('/coupons');
        if (res.data.success) setCoupons(res.data.data);
      }
      else if (activeTab === 'inventory') {
        const res = await API.get('/admin/inventory');
        if (res.data.success) setInventory(res.data.data);
      }
      else if (activeTab === 'users') {
        const res = await API.get('/auth/users');
        if (res.data.success) setUsersList(res.data.data);
      }
    } catch (err) {
      console.error('Error loading tab content', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabContent();
  }, [activeTab]);

  // Product CRUD
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await API.put(`/products/${editingProduct._id}`, prodForm);
        addToast('Product updated!', 'success');
      } else {
        await API.post('/products', prodForm);
        addToast('Product created!', 'success');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      fetchTabContent();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await API.delete(`/products/${id}`);
      addToast('Product deleted', 'info');
      fetchTabContent();
    } catch (err) {
      addToast('Failed to delete product', 'error');
    }
  };

  // Category CRUD
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await API.post('/categories', catForm);
      addToast('Category created!', 'success');
      setShowCatModal(false);
      fetchTabContent();
    } catch (err) {
      addToast('Failed to create category', 'error');
    }
  };

  // Order Status Update
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      addToast(`Order status updated to ${status}`, 'success');
      fetchTabContent();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  // Payment Verification Update (Admin)
  const handleVerifyPayment = async (orderId, action) => {
    try {
      const res = await API.put(`/orders/${orderId}/verify-payment`, { action });
      if (res.data.success) {
        addToast(action === 'verify' ? 'Payment verified successfully!' : 'Payment marked as rejected', 'success');
        fetchTabContent();
      }
    } catch (err) {
      addToast('Failed to update payment status', 'error');
    }
  };

  // Reservation Status Update
  const handleUpdateReservationStatus = async (id, status) => {
    try {
      await API.put(`/reservations/${id}/status`, { status });
      addToast(`Reservation status set to ${status}`, 'success');
      fetchTabContent();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  // Table Create
  const handleSaveTable = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tables', tableForm);
      addToast('Table created!', 'success');
      setShowTableModal(false);
      fetchTabContent();
    } catch (err) {
      addToast('Failed to create table', 'error');
    }
  };

  // Coupon Create
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      await API.post('/coupons', couponForm);
      addToast('Coupon created!', 'success');
      setShowCouponModal(false);
      fetchTabContent();
    } catch (err) {
      addToast('Failed to create coupon', 'error');
    }
  };

  // Inventory Save
  const handleSaveInventory = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/inventory', invForm);
      addToast('Inventory item added!', 'success');
      setShowInventoryModal(false);
      fetchTabContent();
    } catch (err) {
      addToast('Failed to save inventory item', 'error');
    }
  };

  // User Role Change
  const handleRoleChange = async (userId, role) => {
    try {
      await API.put(`/auth/users/${userId}/role`, { role });
      addToast('User role updated!', 'success');
      fetchTabContent();
    } catch (err) {
      addToast('Failed to update user role', 'error');
    }
  };

  const COLORS = ['#2a9d8f', '#e63946', '#f4a261', '#457b9d', '#5c3d2e'];

  return (
    <div className="admin-page page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="admin-header-bar mb-6">
          <div>
            <h1>Admin Control Panel</h1>
            <p>Full system management & performance analytics.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <FiGrid /> Analytics Overview
          </button>
          <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <FiShoppingBag /> Products
          </button>
          <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            <FiLayers /> Categories
          </button>
          <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <FiShoppingBag /> Orders
          </button>
          <button className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>
            <FiCalendar /> Reservations
          </button>
          <button className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`} onClick={() => setActiveTab('tables')}>
            <FiGrid /> Tables
          </button>
          <button className={`tab-btn ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>
            <FiTag /> Coupons
          </button>
          <button className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            <FiBox /> Inventory
          </button>
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <FiUsers /> Users & Roles
          </button>
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : (
          <div className="admin-content-area">
            {/* TAB 1: OVERVIEW & ANALYTICS */}
            {activeTab === 'overview' && stats && (
              <div className="overview-tab">
                {/* Metric Cards */}
                <div className="grid-4 mb-8">
                  <div className="card metric-card">
                    <div className="metric-icon icon-revenue"><FiDollarSign /></div>
                    <div>
                      <span className="metric-label">Total Revenue</span>
                      <h3 className="metric-val">₹{stats.totalRevenue}</h3>
                    </div>
                  </div>

                  <div className="card metric-card">
                    <div className="metric-icon icon-orders"><FiShoppingBag /></div>
                    <div>
                      <span className="metric-label">Total Orders</span>
                      <h3 className="metric-val">{stats.totalOrders}</h3>
                    </div>
                  </div>

                  <div className="card metric-card">
                    <div className="metric-icon icon-users"><FiUsers /></div>
                    <div>
                      <span className="metric-label">Registered Customers</span>
                      <h3 className="metric-val">{stats.totalUsers}</h3>
                    </div>
                  </div>

                  <div className="card metric-card">
                    <div className="metric-icon icon-stock"><FiBox /></div>
                    <div>
                      <span className="metric-label">Low Stock Alerts</span>
                      <h3 className="metric-val">{stats.lowStockCount} Items</h3>
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid-2 mb-8">
                  {/* Monthly Sales Area Chart */}
                  <div className="card chart-card">
                    <h3>Monthly Sales Revenue (₹)</h3>
                    <div style={{ width: '100%', height: 280 }}>
                      <ResponsiveContainer>
                        <AreaChart data={stats.salesMonthly}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="_id" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="sales" stroke="#4a2c20" fill="#d4a373" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Best Selling Products Bar Chart */}
                  <div className="card chart-card">
                    <h3>Top Best Selling Items</h3>
                    <div style={{ width: '100%', height: 280 }}>
                      <ResponsiveContainer>
                        <BarChart data={stats.topProducts}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="sold" fill="#4a2c20" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS MANAGEMENT */}
            {activeTab === 'products' && (
              <div className="products-tab">
                <div className="flex-between mb-4">
                  <h3>Product Catalog ({products.length})</h3>
                  <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setProdForm({ name: '', category: categories[0]?._id || '', description: '', basePrice: 150, discountPercent: 0, image: '', stockQuantity: 50, isFeatured: false }); setShowProductModal(true); }}>
                    <FiPlus /> Add New Product
                  </button>
                </div>

                <div className="card table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Discount</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p._id}>
                          <td><img src={p.image} alt={p.name} className="table-img" /></td>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.category?.name || '—'}</td>
                          <td>₹{p.basePrice}</td>
                          <td>{p.discountPercent}%</td>
                          <td><span className={`badge ${p.stockQuantity > 10 ? 'badge-success' : 'badge-danger'}`}>{p.stockQuantity}</span></td>
                          <td>
                            <div className="table-actions">
                              <button className="btn-icon" onClick={() => { setEditingProduct(p); setProdForm({ name: p.name, category: p.category?._id || '', description: p.description, basePrice: p.basePrice, discountPercent: p.discountPercent, image: p.image, stockQuantity: p.stockQuantity, isFeatured: p.isFeatured }); setShowProductModal(true); }}>
                                <FiEdit />
                              </button>
                              <button className="btn-icon text-danger" onClick={() => handleDeleteProduct(p._id)}>
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="categories-tab">
                <div className="flex-between mb-4">
                  <h3>Food Categories ({categories.length})</h3>
                  <button className="btn btn-primary" onClick={() => setShowCatModal(true)}>
                    <FiPlus /> Add Category
                  </button>
                </div>

                <div className="grid-3">
                  {categories.map(c => (
                    <div key={c._id} className="card cat-admin-card">
                      <img src={c.image} alt={c.name} className="cat-img" />
                      <h4>{c.name}</h4>
                      <p>{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: ORDERS MANAGEMENT */}
            {activeTab === 'orders' && (
              <div className="orders-tab">
                <h3 className="mb-4">All Customer Orders ({orders.length})</h3>
                <div className="card table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order Number</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Payment Status</th>
                        <th>Verification</th>
                        <th>UTR / Reference</th>
                        <th>Order Status</th>
                        <th>Payment Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o._id}>
                          <td><strong>#{o.orderNumber || o._id.substring(o._id.length - 6).toUpperCase()}</strong></td>
                          <td>{o.user?.name || 'Guest'}</td>
                          <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td>₹{o.totalAmount || o.grandTotal}</td>
                          <td><span className="badge badge-primary">{o.paymentMethod || 'COD'}</span></td>
                          <td>
                            <span className={`badge ${o.paymentStatus === 'Paid' ? 'badge-success' : o.paymentStatus === 'Failed' ? 'badge-danger' : 'badge-warning'}`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${o.paymentVerificationStatus === 'Verified' ? 'badge-success' : o.paymentVerificationStatus === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                              {o.paymentVerificationStatus || 'Pending'}
                            </span>
                          </td>
                          <td>
                            {o.paymentReference ? <code className="utr-code">{o.paymentReference}</code> : <span className="text-muted">—</span>}
                          </td>
                          <td>
                            <select
                              value={o.status || o.orderStatus || 'Pending'}
                              onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                              className="form-select status-select"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Ready">Ready</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <div className="table-actions">
                              {o.paymentVerificationStatus === 'Verified' ? (
                                <span className="badge badge-success"><FiCheck /> Verified</span>
                              ) : o.paymentVerificationStatus === 'Rejected' ? (
                                <span className="badge badge-danger"><FiX /> Rejected</span>
                              ) : (
                                <>
                                  <button className="btn btn-sm btn-primary" onClick={() => handleVerifyPayment(o._id, 'verify')}>
                                    <FiCheck /> Verify
                                  </button>
                                  <button className="btn btn-sm btn-danger" onClick={() => handleVerifyPayment(o._id, 'reject')}>
                                    <FiX /> Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: RESERVATIONS */}
            {activeTab === 'reservations' && (
              <div className="reservations-tab">
                <h3 className="mb-4">All Table Reservations ({reservations.length})</h3>
                <div className="card table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Table</th>
                        <th>Date & Time</th>
                        <th>Guests</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map(r => (
                        <tr key={r._id}>
                          <td>{r.user?.name} ({r.user?.phone})</td>
                          <td>Table {r.table?.tableNumber}</td>
                          <td>{r.date} @ {r.timeSlot}</td>
                          <td>{r.guestCount} Guests</td>
                          <td><span className={`badge ${r.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span></td>
                          <td>
                            <div className="table-actions">
                              <button className="btn btn-sm btn-primary" onClick={() => handleUpdateReservationStatus(r._id, 'Confirmed')}>Confirm</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleUpdateReservationStatus(r._id, 'Cancelled')}>Cancel</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: TABLES */}
            {activeTab === 'tables' && (
              <div className="tables-tab">
                <div className="flex-between mb-4">
                  <h3>Café Dining Tables ({tables.length})</h3>
                  <button className="btn btn-primary" onClick={() => setShowTableModal(true)}>
                    <FiPlus /> Add Table
                  </button>
                </div>
                <div className="grid-3">
                  {tables.map(t => (
                    <div key={t._id} className="card text-center">
                      <h2>{t.tableNumber}</h2>
                      <p>Capacity: <strong>{t.capacity} Guests</strong></p>
                      <p>Location: {t.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: COUPONS */}
            {activeTab === 'coupons' && (
              <div className="coupons-tab">
                <div className="flex-between mb-4">
                  <h3>Discount Coupons ({coupons.length})</h3>
                  <button className="btn btn-primary" onClick={() => setShowCouponModal(true)}>
                    <FiPlus /> Add Coupon
                  </button>
                </div>
                <div className="grid-3">
                  {coupons.map(c => (
                    <div key={c._id} className="card">
                      <h3>{c.code}</h3>
                      <p>{c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}</p>
                      <p className="text-muted">Min Order: ₹{c.minOrderAmount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="inventory-tab">
                <div className="flex-between mb-4">
                  <h3>Kitchen Stock & Raw Ingredients ({inventory.length})</h3>
                  <button className="btn btn-primary" onClick={() => setShowInventoryModal(true)}>
                    <FiPlus /> Add Stock Item
                  </button>
                </div>
                <div className="card table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Stock Level</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map(inv => (
                        <tr key={inv._id}>
                          <td><strong>{inv.item}</strong></td>
                          <td>{inv.category}</td>
                          <td>{inv.quantity} {inv.unit}</td>
                          <td>
                            <span className={`badge ${inv.status === 'In Stock' ? 'badge-success' : inv.status === 'Low Stock' ? 'badge-warning' : 'badge-danger'}`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 9: USERS */}
            {activeTab === 'users' && (
              <div className="users-tab">
                <h3 className="mb-4">System Users ({usersList.length})</h3>
                <div className="card table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map(u => (
                        <tr key={u._id}>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.email}</td>
                          <td>{u.phone || '—'}</td>
                          <td>
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className="form-select role-select"
                            >
                              <option value="customer">Customer</option>
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <span className={`role-badge role-${u.role}`}>{u.role}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" className="form-input" value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={prodForm.category} onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Base Price (₹)</label>
                  <input type="number" className="form-input" value={prodForm.basePrice} onChange={(e) => setProdForm({ ...prodForm, basePrice: Number(e.target.value) })} required />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Discount %</label>
                  <input type="number" className="form-input" value={prodForm.discountPercent} onChange={(e) => setProdForm({ ...prodForm, discountPercent: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="form-input" value={prodForm.stockQuantity} onChange={(e) => setProdForm({ ...prodForm, stockQuantity: Number(e.target.value) })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="url" className="form-input" value={prodForm.image} onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} required></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Category</h3>
            <form onSubmit={handleSaveCategory}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input type="text" className="form-input" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" className="form-input" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="url" className="form-input" value={catForm.image} onChange={(e) => setCatForm({ ...catForm, image: e.target.value })} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCatModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showTableModal && (
        <div className="modal-overlay" onClick={() => setShowTableModal(false)}>
          <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Dining Table</h3>
            <form onSubmit={handleSaveTable}>
              <div className="form-group">
                <label className="form-label">Table Number (e.g. T-07)</label>
                <input type="text" className="form-input" value={tableForm.tableNumber} onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity (Seats)</label>
                <input type="number" className="form-input" value={tableForm.capacity} onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <select className="form-select" value={tableForm.location} onChange={(e) => setTableForm({ ...tableForm, location: e.target.value })}>
                  <option value="Indoor">Indoor</option>
                  <option value="Terrace">Terrace</option>
                  <option value="Window View">Window View</option>
                  <option value="Private Booth">Private Booth</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTableModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Table</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showCouponModal && (
        <div className="modal-overlay" onClick={() => setShowCouponModal(false)}>
          <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Discount Coupon</h3>
            <form onSubmit={handleSaveCoupon}>
              <div className="form-group">
                <label className="form-label">Coupon Code (e.g. CAFE50)</label>
                <input type="text" className="form-input" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select className="form-select" value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input type="number" className="form-input" value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })} required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCouponModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Inventory Modal */}
      {showInventoryModal && (
        <div className="modal-overlay" onClick={() => setShowInventoryModal(false)}>
          <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Kitchen Inventory</h3>
            <form onSubmit={handleSaveInventory}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input type="text" className="form-input" value={invForm.item} onChange={(e) => setInvForm({ ...invForm, item: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" value={invForm.quantity} onChange={(e) => setInvForm({ ...invForm, quantity: Number(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input type="text" className="form-input" value={invForm.unit} onChange={(e) => setInvForm({ ...invForm, unit: e.target.value })} required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInventoryModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Inventory</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 12px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-light);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: #ffffff;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          white-space: nowrap;
          transition: var(--transition);
        }

        .tab-btn:hover, .tab-btn.active {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .metric-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #ffffff;
        }

        .icon-revenue { background: var(--success); }
        .icon-orders { background: var(--primary); }
        .icon-users { background: var(--info); }
        .icon-stock { background: var(--warning); }

        .metric-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
        .metric-val { font-size: 1.6rem; color: var(--primary); margin-top: 2px; }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th, .admin-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-light);
          font-size: 0.9rem;
        }

        .admin-table th {
          background: var(--cream-subtle);
          color: var(--primary);
          font-weight: 700;
        }

        .table-img {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          object-fit: cover;
        }

        .table-actions {
          display: flex;
          gap: 8px;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .cat-admin-card {
          padding: 16px;
          text-align: center;
        }

        .cat-img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          margin-bottom: 10px;
        }

        .status-select, .role-select {
          padding: 4px 8px;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;
