import React from 'react';
import { Link } from 'react-router-dom';
import { FiCoffee, FiMapPin, FiPhone, FiMail, FiClock, FiHeart } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <span className="logo-icon"><FiCoffee /></span>
              <span className="logo-text">Café<span>Hub</span></span>
            </Link>
            <p className="footer-tagline">
              Your favorite artisanal café experience, handcrafted with passion and delivered hot to your doorstep.
            </p>
            <div className="opening-hours-box">
              <FiClock className="hours-icon" />
              <div>
                <strong>Mon - Sun:</strong> 8:00 AM - 11:00 PM
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Explore Menu</Link></li>
              <li><Link to="/reservations">Book a Table</Link></li>
              <li><Link to="/cart">Cart & Checkout</Link></li>
              <li><Link to="/wishlist">My Wishlist</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Our Specialties</h4>
            <ul className="footer-links">
              <li><Link to="/menu?category=coffee">Artisanal Coffee</Link></li>
              <li><Link to="/menu?category=cold-coffee">Cold Frappes</Link></li>
              <li><Link to="/menu?category=pizza">Thin Crust Pizza</Link></li>
              <li><Link to="/menu?category=burgers">Gourmet Burgers</Link></li>
              <li><Link to="/menu?category=desserts">Decadent Desserts</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-col contact-col">
            <h4 className="footer-heading">Visit Us</h4>
            <div className="contact-item">
              <FiMapPin className="c-icon" />
              <span>Coffee Street, Uma Char Rasta,Vadodra 390019</span>
            </div>
            <div className="contact-item">
              <FiPhone className="c-icon" />
              <span>+91 9016112372</span>
            </div>
            <div className="contact-item">
              <FiMail className="c-icon" />
              <span>xhamaster.com(also for sex)</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CaféHub System. Built with <FiHeart className="heart-icon" /> for coffee lovers.</p>
        </div>
      </div>

      <style>{`
        .footer-section {
          background-color: var(--primary);
          color: #f4eae1;
          padding-top: 60px;
          padding-bottom: 25px;
          margin-top: auto;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
          gap: 40px;
          margin-bottom: 50px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-heading);
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .footer-logo .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--accent);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-logo .logo-text span {
          color: var(--accent);
        }

        .footer-tagline {
          font-size: 0.9rem;
          color: #d1c2b5;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .opening-hours-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.08);
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          border-left: 3px solid var(--accent);
        }

        .hours-icon {
          font-size: 1.4rem;
          color: var(--accent);
        }

        .footer-heading {
          color: #ffffff;
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 20px;
          position: relative;
        }

        .footer-heading::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          width: 30px;
          height: 2px;
          background: var(--accent);
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-links a {
          font-size: 0.9rem;
          color: #d1c2b5;
          transition: var(--transition);
        }

        .footer-links a:hover {
          color: var(--accent);
          padding-left: 6px;
        }

        .contact-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.9rem;
          color: #d1c2b5;
        }

        .c-icon {
          color: var(--accent);
          font-size: 1.2rem;
          margin-top: 3px;
          flex-shrink: 0;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 25px;
          text-align: center;
          font-size: 0.85rem;
          color: #b5a394;
        }

        .heart-icon {
          color: var(--danger);
          vertical-align: middle;
        }

        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 576px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
