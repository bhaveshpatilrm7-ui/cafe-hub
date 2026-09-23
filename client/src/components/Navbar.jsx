import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiCoffee, FiShoppingBag, FiHeart, FiUser, FiCalendar, FiLogOut, FiMenu, FiX, FiGrid, FiFeather } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const { wishlist } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon"><FiCoffee /></span>
          <span className="logo-text">Café<span>Hub</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/menu" className={`nav-link ${isActive('/menu') ? 'active' : ''}`}>Menu</Link>
          <Link to="/reservations" className={`nav-link ${isActive('/reservations') ? 'active' : ''}`}>
            <FiCalendar className="inline-icon" /> Book Table
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Wishlist Icon */}
          <Link to="/wishlist" className="action-icon-btn" title="Wishlist">
            <FiHeart />
            {wishlist.length > 0 && <span className="action-badge">{wishlist.length}</span>}
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="action-icon-btn" title="Shopping Cart">
            <FiShoppingBag />
            {cartItemCount > 0 && <span className="action-badge">{cartItemCount}</span>}
          </Link>

          {/* User Profile / Auth */}
          {user ? (
            <div className="user-dropdown-wrapper">
              <button className="user-profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span className="user-name-desktop">{user.name.split(' ')[0]}</span>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown-menu" onClick={() => setDropdownOpen(false)}>
                  <div className="dropdown-user-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                    <span className={`role-badge role-${user.role}`}>{user.role}</span>
                  </div>

                  <Link to="/profile" className="dropdown-item">
                    <FiUser /> My Profile & Addresses
                  </Link>

                  <Link to="/orders" className="dropdown-item">
                    <FiShoppingBag /> My Orders
                  </Link>

                  <Link to="/reservations" className="dropdown-item">
                    <FiCalendar /> My Reservations
                  </Link>

                  {(user.role === 'staff' || user.role === 'admin') && (
                    <Link to="/kitchen" className="dropdown-item highlight-kitchen">
                      <FiFeather /> Kitchen Orders
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item highlight-admin">
                      <FiGrid /> Admin Dashboard
                    </Link>
                  )}

                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="mobile-toggle-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="mobile-drawer" onClick={() => setMobileOpen(false)}>
          <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
            <Link to="/" className="mobile-nav-link">Home</Link>
            <Link to="/menu" className="mobile-nav-link">Menu</Link>
            <Link to="/reservations" className="mobile-nav-link">Book a Table</Link>
            {user && (
              <>
                <Link to="/orders" className="mobile-nav-link">My Orders</Link>
                <Link to="/profile" className="mobile-nav-link">Profile & Addresses</Link>
                {user.role !== 'customer' && (
                  <Link to="/kitchen" className="mobile-nav-link">Kitchen Dashboard</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="mobile-nav-link">Admin Dashboard</Link>
                )}
                <button className="mobile-nav-link logout" onClick={handleLogout}>Logout</button>
              </>
            )}
            {!user && (
              <div className="mobile-auth-links">
                <Link to="/login" className="btn btn-outline w-full">Login</Link>
                <Link to="/register" className="btn btn-primary w-full">Register</Link>
              </div>
            )}
          </nav>
        </div>
      )}

      <style>{`
        .navbar-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 75px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 15px rgba(74, 44, 32, 0.08);
          z-index: 1000;
          display: flex;
          align-items: center;
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-heading);
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--primary);
        }

        .logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--primary);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          box-shadow: 0 4px 12px rgba(74, 44, 32, 0.25);
        }

        .logo-text span {
          color: var(--accent);
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-dark);
          transition: var(--transition);
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link:hover, .nav-link.active {
          color: var(--accent-hover);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent);
          border-radius: 2px;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .action-icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--cream-subtle);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          transition: var(--transition);
        }

        .action-icon-btn:hover {
          background: var(--accent);
          color: #ffffff;
          transform: translateY(-2px);
        }

        .action-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--danger);
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 800;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
        }

        .user-dropdown-wrapper {
          position: relative;
        }

        .user-profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--cream-subtle);
          border: 1px solid var(--border-light);
          padding: 6px 14px 6px 8px;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: var(--transition);
        }

        .user-profile-btn:hover {
          border-color: var(--accent);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary);
          color: #ffffff;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .user-name-desktop {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--primary);
        }

        .user-dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 240px;
          background: #ffffff;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-light);
          padding: 8px 0;
          display: flex;
          flex-direction: column;
          z-index: 1010;
          animation: dropdownFade 0.2s ease;
        }

        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-user-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-light);
        }

        .dropdown-name {
          font-weight: 700;
          color: var(--primary);
          font-size: 0.95rem;
        }

        .dropdown-email {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .role-badge {
          display: inline-block;
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .role-customer { background: #e3f2fd; color: #1976d2; }
        .role-staff { background: #fff3e0; color: #e65100; }
        .role-admin { background: #f3e5f5; color: #7b1fa2; }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-dark);
          transition: var(--transition);
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background: var(--cream-subtle);
          color: var(--primary);
        }

        .highlight-kitchen { color: #e65100; font-weight: 600; }
        .highlight-admin { color: #7b1fa2; font-weight: 600; }
        .logout-btn { color: var(--danger); border-top: 1px solid var(--border-light); margin-top: 4px; }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mobile-toggle-btn {
          display: none;
          background: none;
          border: none;
          font-size: 1.6rem;
          color: var(--primary);
          cursor: pointer;
        }

        .mobile-drawer {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1050;
          display: flex;
          justify-content: flex-end;
        }

        .mobile-nav {
          width: 280px;
          height: 100%;
          background: #ffffff;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mobile-nav-link {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--primary);
          padding: 10px 0;
          border-bottom: 1px solid var(--border-light);
        }

        @media (max-width: 768px) {
          .desktop-nav, .user-name-desktop { display: none; }
          .mobile-toggle-btn { display: block; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
