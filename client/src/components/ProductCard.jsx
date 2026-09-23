import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiStar, FiPlus, FiEye } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const isLiked = isInWishlist(product._id);

  const finalPrice = product.discountPercent > 0
    ? Math.round(product.basePrice * (1 - product.discountPercent / 100))
    : product.basePrice;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // If product has size options, navigate to details page for customization
    if (product.options && (product.options.sizes?.length > 0 || product.options.addOns?.length > 0)) {
      navigate(`/product/${product._id}`);
    } else {
      addToCart(product._id, 1);
    }
  };

  return (
    <div className="product-card">
      <div className="product-img-wrapper">
        <img src={product.image} alt={product.name} loading="lazy" />

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <span className="badge badge-danger discount-badge">
            {product.discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button Overlay */}
        <button
          className={`wishlist-btn-overlay ${isLiked ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          title={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart style={{ fill: isLiked ? 'var(--danger)' : 'none' }} />
        </button>
      </div>

      <div className="product-content">
        <span className="product-category">
          {product.category?.name || 'Beverage'}
        </span>

        <h3 className="product-title">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>

        <p className="product-desc">{product.description}</p>

        <div className="product-rating">
          <span className="stars">
            <FiStar className="star-icon" /> {product.rating}
          </span>
          <span className="reviews-count">({product.numReviews} reviews)</span>
        </div>

        <div className="product-footer">
          <div className="product-price">
            <span className="current-price">₹{finalPrice}</span>
            {product.discountPercent > 0 && (
              <span className="original-price">₹{product.basePrice}</span>
            )}
          </div>

          <button className="btn btn-primary btn-sm add-btn" onClick={handleQuickAdd}>
            {product.options && (product.options.sizes?.length > 0 || product.options.addOns?.length > 0) ? (
              <><FiEye /> Customise</>
            ) : (
              <><FiPlus /> Add</>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .discount-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          font-size: 0.85rem;
        }

        .stars {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #d4a373;
          font-weight: 700;
        }

        .star-icon {
          fill: #d4a373;
        }

        .reviews-count {
          color: var(--text-light);
        }

        .add-btn {
          border-radius: var(--radius-full);
          padding: 8px 16px;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
