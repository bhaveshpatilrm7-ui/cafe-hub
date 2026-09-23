import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCoffee, FiShoppingBag, FiStar, FiAward, FiClock, FiTruck, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import API from '../services/api';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          API.get('/categories'),
          API.get('/products?isFeatured=true&limit=8')
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (prodRes.data.success) setFeaturedProducts(prodRes.data.data);
      } catch (err) {
        console.error('Error loading homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-page page-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-badge">
              <FiCoffee /> Artisanal Coffee & Bakery
            </span>
            <h1 className="hero-title">
              Your Favorite Café, <span>Just a Click Away</span>
            </h1>
            <p className="hero-description">
              Handcrafted espresso, fresh artisanal sourdough pizzas, gourmet burgers and decadent desserts baked fresh every morning.
            </p>

            <div className="hero-buttons">
              <Link to="/menu" className="btn btn-primary btn-lg">
                Explore Menu <FiArrowRight />
              </Link>
              <Link to="/reservations" className="btn btn-outline btn-lg">
                Reserve Table
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <strong>20+</strong>
                <span>Artisanal Items</span>
              </div>
              <div className="stat-item-divider"></div>
              <div className="stat-item">
                <strong>4.9 <FiStar className="star-inline" /></strong>
                <span>1000+ Reviews</span>
              </div>
              <div className="stat-item-divider"></div>
              <div className="stat-item">
                <strong>30 Mins</strong>
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>

          <div className="hero-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
              alt="CaféHub Fresh Coffee & Pastries"
              className="hero-img"
            />
            <div className="hero-floating-card">
              <FiAward className="card-icon" />
              <div>
                <strong>#1 Rated Café</strong>
                <p>Voted best barista in city</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="features-bar">
        <div className="container features-container">
          <div className="feature-item">
            <div className="feature-icon"><FiCoffee /></div>
            <div>
              <h4>Freshly Roasted</h4>
              <p>100% Single-origin Arabica beans</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><FiTruck /></div>
            <div>
              <h4>Express Delivery</h4>
              <p>Hot food served right at your doorstep</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><FiClock /></div>
            <div>
              <h4>Open 7 Days</h4>
              <p>From 8 AM to 11 PM daily</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-subtitle">Explore Our Menu</span>
              <h2 className="section-title">Popular Categories</h2>
            </div>
            <Link to="/menu" className="btn btn-secondary">
              View All Categories <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link to={`/menu?category=${cat.slug}`} key={cat._id} className="category-card">
                  <div className="category-img-box">
                    <img src={cat.image} alt={cat.name} />
                  </div>
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular / Best Sellers Section */}
      <section className="section popular-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-subtitle">Chef's Recommendations</span>
              <h2 className="section-title">Featured Best Sellers</h2>
            </div>
            <Link to="/menu" className="btn btn-outline">
              See Full Menu
            </Link>
          </div>

          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="grid-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="section offer-banner">
        <div className="container offer-container">
          <div className="offer-content">
            <span className="offer-badge">Limited Time Offer</span>
            <h2>Get 20% OFF Your First Online Order!</h2>
            <p>Use coupon code <strong className="code-highlight">CAFE20</strong> at checkout to enjoy discounts on all orders above ₹200.</p>
            <Link to="/menu" className="btn btn-accent btn-lg">
              Order Now & Save
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="section reviews-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">Love From Our Guests</span>
            <h2 className="section-title">What Our Customers Say</h2>
          </div>

          <div className="grid-3 reviews-grid">
            <div className="card review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => <FiStar key={i} className="star-fill" />)}
              </div>
              <p className="review-text">
                "The Iced Caramel Frappe and Sizzling Walnut Brownie here are out of this world! Prompt delivery and warm packaging every single time."
              </p>
              <div className="reviewer-info">
                <div className="reviewer-avatar">S</div>
                <div>
                  <strong>Sarah Jenkins</strong>
                  <span>Regular Customer</span>
                </div>
              </div>
            </div>

            <div className="card review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => <FiStar key={i} className="star-fill" />)}
              </div>
              <p className="review-text">
                "CaféHub is my go-to place for table reservations. Seamless online booking system and top-notch Margherita pizza!"
              </p>
              <div className="reviewer-info">
                <div className="reviewer-avatar">R</div>
                <div>
                  <strong>Rahul Sharma</strong>
                  <span>Food Critic</span>
                </div>
              </div>
            </div>

            <div className="card review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => <FiStar key={i} className="star-fill" />)}
              </div>
              <p className="review-text">
                "Extremely smooth website, custom coffee options with extra shots, and easy tracking of my orders. Recommended 100%!"
              </p>
              <div className="reviewer-info">
                <div className="reviewer-avatar">M</div>
                <div>
                  <strong>Michelle Tan</strong>
                  <span>Coffee Enthusiast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .hero-section {
          padding: 40px 0 80px 0;
          background: linear-gradient(135deg, #fbf9f5 0%, #f4eae1 100%);
          overflow: hidden;
        }

        .hero-container {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 50px;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: #ffffff;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary);
          box-shadow: var(--shadow-sm);
          margin-bottom: 20px;
        }

        .hero-title {
          font-size: 3.4rem;
          line-height: 1.15;
          margin-bottom: 20px;
        }

        .hero-title span {
          color: var(--accent-hover);
        }

        .hero-description {
          font-size: 1.1rem;
          color: var(--text-muted);
          margin-bottom: 32px;
          max-width: 540px;
        }

        .hero-buttons {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(74, 44, 32, 0.1);
        }

        .stat-item strong {
          display: block;
          font-size: 1.5rem;
          color: var(--primary);
        }

        .stat-item span {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .star-inline { color: #d4a373; fill: #d4a373; }

        .stat-item-divider {
          width: 1px;
          height: 35px;
          background: rgba(74, 44, 32, 0.15);
        }

        .hero-image-wrapper {
          position: relative;
        }

        .hero-img {
          width: 100%;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          object-fit: cover;
          height: 460px;
        }

        .hero-floating-card {
          position: absolute;
          bottom: -20px;
          left: -20px;
          background: #ffffff;
          padding: 16px 20px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid var(--border-light);
        }

        .card-icon {
          font-size: 2.2rem;
          color: var(--accent);
        }

        /* Features Bar */
        .features-bar {
          background: #ffffff;
          border-y: 1px solid var(--border-light);
          padding: 24px 0;
          box-shadow: var(--shadow-sm);
        }

        .features-container {
          display: flex;
          align-items: center;
          justify-content: space-around;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--cream-subtle);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }

        .section {
          padding: 70px 0;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
        }

        .section-header.text-center {
          justify-content: center;
          text-align: center;
        }

        .section-subtitle {
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--accent-hover);
        }

        .section-title {
          font-size: 2.2rem;
          margin-top: 4px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }

        .category-card {
          background: #ffffff;
          padding: 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
          text-align: center;
          transition: var(--transition);
        }

        .category-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent);
          box-shadow: var(--shadow-md);
        }

        .category-img-box {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 14px auto;
        }

        .category-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .category-card h3 {
          font-size: 1.1rem;
          margin-bottom: 4px;
        }

        .category-card p {
          font-size: 0.78rem;
          color: var(--text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Offer banner */
        .offer-banner {
          background: linear-gradient(rgba(74, 44, 32, 0.9), rgba(74, 44, 32, 0.9)),
                      url('https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80') center/cover;
          color: #ffffff;
          border-radius: var(--radius-lg);
          padding: 60px 40px;
          text-align: center;
          margin: 30px 0;
        }

        .offer-badge {
          display: inline-block;
          background: var(--accent);
          color: #ffffff;
          padding: 4px 14px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .offer-content h2 {
          color: #ffffff;
          font-size: 2.6rem;
          margin-bottom: 12px;
        }

        .offer-content p {
          font-size: 1.1rem;
          color: #e2d3c7;
          margin-bottom: 24px;
        }

        .code-highlight {
          color: var(--accent);
          font-family: monospace;
          background: rgba(255, 255, 255, 0.15);
          padding: 2px 8px;
          border-radius: 4px;
        }

        /* Reviews */
        .reviews-grid {
          margin-top: 30px;
        }

        .review-card {
          padding: 28px;
        }

        .review-stars {
          display: flex;
          gap: 4px;
          color: #d4a373;
          font-size: 1.1rem;
          margin-bottom: 14px;
        }

        .star-fill { fill: #d4a373; }

        .review-text {
          font-style: italic;
          color: var(--text-dark);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reviewer-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent);
          color: #ffffff;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reviewer-info strong {
          display: block;
          font-size: 0.95rem;
          color: var(--primary);
        }

        .reviewer-info span {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        @media (max-width: 992px) {
          .hero-container { grid-template-columns: 1fr; }
          .hero-img { height: 320px; }
          .categories-grid { grid-template-columns: repeat(3, 1fr); }
          .features-container { flex-direction: column; gap: 20px; align-items: flex-start; }
        }

        @media (max-width: 576px) {
          .hero-title { font-size: 2.3rem; }
          .categories-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-buttons { flex-direction: column; width: 100%; }
          .hero-buttons .btn { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
