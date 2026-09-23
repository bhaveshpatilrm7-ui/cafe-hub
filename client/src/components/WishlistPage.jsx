import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const { wishlist } = useWishlist();

  return (
    <div className="wishlist-page page-wrapper">
      <div className="container">
        <div className="page-header mb-6">
          <h1>My Saved Wishlist</h1>
          <p>Your favorite coffee drinks and food items saved for later.</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="card text-center py-12">
            <div className="empty-state-icon">❤️</div>
            <h2>Your Wishlist is Empty</h2>
            <p>Save items to your wishlist by clicking the heart icon on any product.</p>
            <Link to="/menu" className="btn btn-primary mt-4">Explore Menu</Link>
          </div>
        ) : (
          <div className="grid-4">
            {wishlist.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
