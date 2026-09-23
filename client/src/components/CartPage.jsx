import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiTag, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cart, updateQuantity, removeItem, applyCoupon, removeCoupon, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    await applyCoupon(couponCode);
    setApplying(false);
    setCouponCode('');
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page page-wrapper">
        <div className="container">
          <div className="card text-center py-12 empty-cart-card">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added any coffee or delicious treats yet.</p>
            <Link to="/menu" className="btn btn-primary btn-lg mt-6">
              Explore Our Menu <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page-wrapper">
      <div className="container">
        <div className="cart-header">
          <h1>Your Shopping Cart</h1>
          <p>{cart.items.length} item(s) in your cart</p>
        </div>

        <div className="cart-grid">
          {/* Cart Items List */}
          <div className="cart-items-wrapper">
            {cart.items.map((item) => (
              <div key={item._id} className="card cart-item-card">
                <img
                  src={item.product?.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80'}
                  alt={item.product?.name}
                  className="cart-item-img"
                />

                <div className="cart-item-details">
                  <h3>
                    <Link to={`/product/${item.product?._id}`}>{item.product?.name}</Link>
                  </h3>

                  {/* Options display */}
                  <div className="cart-item-options">
                    {item.size?.name && <span className="opt-chip">Size: {item.size.name}</span>}
                    {item.sugarLevel && <span className="opt-chip">Sugar: {item.sugarLevel}</span>}
                    {item.addOns?.length > 0 && (
                      <span className="opt-chip">Add-ons: {item.addOns.map(a => a.name).join(', ')}</span>
                    )}
                  </div>

                  <div className="cart-item-unit-price">
                    Unit Price: ₹{item.unitPrice}
                  </div>
                </div>

                {/* Quantity adjustments */}
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    >
                      <FiMinus />
                    </button>
                    <span className="qty-num">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="cart-item-total">
                    ₹{item.totalPrice}
                  </div>

                  <button
                    className="delete-item-btn"
                    onClick={() => removeItem(item._id)}
                    title="Remove item"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Summary Sidebar */}
          <div className="cart-summary-sidebar">
            {/* Coupon Box */}
            <div className="card coupon-card">
              <h3><FiTag /> Have a Coupon?</h3>
              {cart.couponCode ? (
                <div className="applied-coupon-box">
                  <div>
                    <strong>{cart.couponCode}</strong> applied!
                    <p className="disc-desc">Discount saved: ₹{cart.discountAmount}</p>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={removeCoupon}>Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-form">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter CAFE20 or WELCOME50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                  <button type="submit" className="btn btn-primary" disabled={applying}>
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price Order Summary Box */}
            <div className="card price-summary-card">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cart.subtotal}</span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="summary-row discount-row">
                  <span>Coupon Discount</span>
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
                <span>Grand Total</span>
                <span>₹{cart.grandTotal}</span>
              </div>

              <button className="btn btn-primary btn-lg w-full mt-6" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cart-header {
          margin-bottom: 30px;
        }

        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 30px;
        }

        .cart-items-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cart-item-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 20px;
        }

        .cart-item-img {
          width: 90px;
          height: 90px;
          border-radius: var(--radius-sm);
          object-fit: cover;
        }

        .cart-item-details {
          flex: 1;
        }

        .cart-item-details h3 {
          font-size: 1.1rem;
          margin-bottom: 4px;
        }

        .cart-item-options {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 6px;
        }

        .opt-chip {
          font-size: 0.75rem;
          background: var(--cream-subtle);
          padding: 2px 8px;
          border-radius: 4px;
          color: var(--text-muted);
        }

        .cart-item-unit-price {
          font-size: 0.85rem;
          color: var(--text-light);
        }

        .cart-item-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .cart-item-total {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--primary);
          min-width: 70px;
          text-align: right;
        }

        .delete-item-btn {
          background: none;
          border: none;
          color: var(--text-light);
          font-size: 1.2rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .delete-item-btn:hover {
          color: var(--danger);
        }

        .cart-summary-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .coupon-card h3, .price-summary-card h3 {
          font-size: 1.15rem;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .coupon-form {
          display: flex;
          gap: 8px;
        }

        .applied-coupon-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--success-bg);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
        }

        .disc-desc {
          font-size: 0.78rem;
          color: var(--success);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 0.95rem;
        }

        .discount-row { color: var(--success); font-weight: 600; }
        .free-tag { color: var(--success); }

        .summary-divider {
          height: 1px;
          background: var(--border-light);
          margin: 16px 0;
        }

        .total-row {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--primary);
        }

        .empty-cart-card {
          padding: 60px 20px;
        }

        .empty-cart-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        @media (max-width: 992px) {
          .cart-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default CartPage;
