import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiStar, FiHeart, FiShoppingBag, FiPlus, FiMinus, FiCheckCircle, FiShield, FiMessageSquare } from 'react-icons/fi';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Customization state
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedSugar, setSelectedSugar] = useState('Normal');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const [pRes, rRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get(`/reviews/product/${id}`)
        ]);

        if (pRes.data.success) {
          const prod = pRes.data.data;
          setProduct(prod);
          if (prod.options?.sizes?.length > 0) {
            setSelectedSize(prod.options.sizes[0]);
          }
          if (prod.options?.sugarLevels?.length > 0) {
            setSelectedSugar(prod.options.sugarLevels[0]);
          }
        }
        if (rRes.data.success) {
          setReviews(rRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching product details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-wrapper container text-center">
        <div className="empty-state">
          <h3>Product Not Found</h3>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/menu')}>Back to Menu</button>
        </div>
      </div>
    );
  }

  // Calculate base unit price with discount
  let baseUnit = product.basePrice;
  if (product.discountPercent > 0) {
    baseUnit = Math.round(baseUnit * (1 - product.discountPercent / 100));
  }

  // Add size extra price
  if (selectedSize && selectedSize.price) {
    baseUnit += selectedSize.price;
  }

  // Add add-ons price
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + (a.price || 0), 0);
  baseUnit += addOnsTotal;

  const totalCalculatedPrice = Math.round(baseUnit * quantity);

  const toggleAddOn = (addOn) => {
    const exists = selectedAddOns.some(a => a.name === addOn.name);
    if (exists) {
      setSelectedAddOns(prev => prev.filter(a => a.name !== addOn.name));
    } else {
      setSelectedAddOns(prev => [...prev, addOn]);
    }
  };

  const handleAddToCart = () => {
    addToCart(product._id, quantity, {
      size: selectedSize,
      sugarLevel: selectedSugar,
      addOns: selectedAddOns
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to submit a review', 'info');
      return;
    }
    if (!newComment.trim()) {
      addToast('Please write a review comment', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await API.post('/reviews', {
        productId: product._id,
        rating: newRating,
        comment: newComment
      });

      if (res.data.success) {
        addToast('Review submitted successfully!', 'success');
        setNewComment('');
        // Refresh reviews
        const rRes = await API.get(`/reviews/product/${id}`);
        if (rRes.data.success) setReviews(rRes.data.data);
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Could not submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const isLiked = isInWishlist(product._id);

  return (
    <div className="product-details-page page-wrapper">
      <div className="container">
        {/* Main Details Card */}
        <div className="card details-main-card">
          <div className="details-grid">
            {/* Product Image */}
            <div className="details-img-container">
              <img src={product.image} alt={product.name} />
              {product.discountPercent > 0 && (
                <span className="badge badge-danger details-discount-tag">
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Product Content & Options */}
            <div className="details-info">
              <span className="product-category">{product.category?.name || 'Café Specialty'}</span>
              <h1 className="details-title">{product.name}</h1>

              <div className="details-rating-bar">
                <span className="stars"><FiStar style={{ fill: '#d4a373' }} /> {product.rating}</span>
                <span className="reviews-text">({product.numReviews} customer reviews)</span>
                <span className={`badge ${product.stockQuantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                  {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <p className="details-desc">{product.description}</p>

              {/* Size Customization Option */}
              {product.options?.sizes?.length > 0 && (
                <div className="option-section">
                  <label className="option-title">Select Size:</label>
                  <div className="option-chips">
                    {product.options.sizes.map((s, idx) => (
                      <button
                        key={idx}
                        className={`chip-select ${(selectedSize?.name === s.name) ? 'active' : ''}`}
                        onClick={() => setSelectedSize(s)}
                      >
                        {s.name} {s.price > 0 ? `(+₹${s.price})` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugar Level Option */}
              {product.options?.sugarLevels?.length > 0 && (
                <div className="option-section">
                  <label className="option-title">Sugar Level:</label>
                  <div className="option-chips">
                    {product.options.sugarLevels.map((sugar, idx) => (
                      <button
                        key={idx}
                        className={`chip-select ${selectedSugar === sugar ? 'active' : ''}`}
                        onClick={() => setSelectedSugar(sugar)}
                      >
                        {sugar}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons Option */}
              {product.options?.addOns?.length > 0 && (
                <div className="option-section">
                  <label className="option-title">Optional Add-ons:</label>
                  <div className="checkbox-list">
                    {product.options.addOns.map((addon, idx) => {
                      const isChecked = selectedAddOns.some(a => a.name === addon.name);
                      return (
                        <label key={idx} className={`addon-checkbox-label ${isChecked ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAddOn(addon)}
                          />
                          <span>{addon.name} (+₹{addon.price})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Price & Quantity Action Bar */}
              <div className="details-action-box">
                <div className="dynamic-price-display">
                  <span className="price-label">Total Price:</span>
                  <span className="price-val">₹{totalCalculatedPrice}</span>
                </div>

                <div className="quantity-controls">
                  <button
                    className="qty-btn"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => q - 1)}
                  >
                    <FiMinus />
                  </button>
                  <span className="qty-num">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    <FiPlus />
                  </button>
                </div>

                <button
                  className="btn btn-primary btn-lg flex-1"
                  disabled={product.stockQuantity <= 0}
                  onClick={handleAddToCart}
                >
                  <FiShoppingBag /> Add to Cart
                </button>

                <button
                  className={`btn btn-outline btn-icon ${isLiked ? 'liked' : ''}`}
                  onClick={() => toggleWishlist(product)}
                  title="Wishlist"
                >
                  <FiHeart style={{ fill: isLiked ? 'var(--danger)' : 'none' }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Ratings Section */}
        <div className="reviews-section-container">
          <h2 className="reviews-heading"><FiMessageSquare /> Customer Reviews</h2>

          <div className="reviews-layout">
            {/* Submit Review Form */}
            <div className="card review-form-card">
              <h3>Write a Review</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                    <label className="form-label">Your Rating</label>
                    <div className="rating-select-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`star-select ${star <= newRating ? 'selected' : ''}`}
                          onClick={() => setNewRating(star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Review Comment</label>
                    <textarea
                      rows="4"
                      className="form-textarea"
                      placeholder="Share your experience with this food/drink..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary w-full" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="mb-4">Please login to write a customer review.</p>
                  <button className="btn btn-outline" onClick={() => navigate('/login')}>Login Now</button>
                </div>
              )}
            </div>

            {/* Existing Reviews List */}
            <div className="reviews-list-wrapper">
              {reviews.length === 0 ? (
                <div className="empty-state">
                  <p>No reviews yet for this product. Be the first to share your feedback!</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="card review-item-card">
                    <div className="review-header">
                      <strong>{rev.user?.name || 'Verified Customer'}</strong>
                      <div className="stars">
                        {[...Array(rev.rating)].map((_, i) => (
                          <FiStar key={i} style={{ fill: '#d4a373', color: '#d4a373' }} />
                        ))}
                      </div>
                    </div>
                    <p className="review-comment">{rev.comment}</p>
                    <span className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .details-main-card {
          padding: 32px;
          margin-bottom: 40px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 40px;
        }

        .details-img-container {
          position: relative;
          width: 100%;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--cream-subtle);
          max-height: 480px;
        }

        .details-img-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .details-discount-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          font-size: 0.85rem;
        }

        .details-title {
          font-size: 2.2rem;
          margin-bottom: 8px;
        }

        .details-rating-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
          font-size: 0.9rem;
        }

        .details-desc {
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-light);
        }

        .option-section {
          margin-bottom: 20px;
        }

        .option-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--primary);
          display: block;
          margin-bottom: 8px;
        }

        .option-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .chip-select {
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border-light);
          background: #ffffff;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .chip-select:hover, .chip-select.active {
          border-color: var(--primary);
          background: var(--cream-subtle);
          color: var(--primary);
        }

        .checkbox-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .addon-checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .addon-checkbox-label.checked {
          background: var(--cream-subtle);
          border-color: var(--accent);
        }

        .details-action-box {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 30px;
          padding-top: 24px;
          border-top: 1px solid var(--border-light);
          flex-wrap: wrap;
        }

        .dynamic-price-display {
          display: flex;
          flex-direction: column;
        }

        .price-label {
          font-size: 0.78rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 700;
        }

        .price-val {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary);
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          background: var(--cream-subtle);
        }

        .qty-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1rem;
        }

        .qty-num {
          width: 40px;
          text-align: center;
          font-weight: 700;
        }

        .flex-1 { flex: 1; }

        /* Reviews section */
        .reviews-section-container {
          margin-top: 40px;
        }

        .reviews-heading {
          font-size: 1.6rem;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reviews-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 30px;
        }

        .review-form-card {
          padding: 24px;
          height: fit-content;
        }

        .rating-select-stars {
          display: flex;
          gap: 8px;
          font-size: 1.6rem;
          color: #ccc;
          cursor: pointer;
          margin-top: 4px;
        }

        .star-select.selected {
          color: #d4a373;
          fill: #d4a373;
        }

        .reviews-list-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-item-card {
          padding: 18px 24px;
        }

        .review-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .review-comment {
          font-size: 0.95rem;
          color: var(--text-dark);
          margin-bottom: 8px;
        }

        .review-date {
          font-size: 0.78rem;
          color: var(--text-light);
        }

        @media (max-width: 992px) {
          .details-grid { grid-template-columns: 1fr; }
          .reviews-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetailsPage;
