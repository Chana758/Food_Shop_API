import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../../service/productService';
import { FaMinus, FaPlus, FaArrowLeft, FaHeart, FaRegHeart, FaStar, FaRegStar, FaCheckCircle } from 'react-icons/fa';
import { BiLeaf } from 'react-icons/bi';
import { useTranslation } from 'react-i18next';
import Toast from '../../../components/common/Toast';
import useFavorite from '../../../hooks/useFavorite';
import { useProductReviews, useReview } from '../../../hooks/useReview';
import { useAuth } from '../../../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { isFavorite, toggleFavorite } = useFavorite();

  // ✅ NEW — reviews for this product (public) + the logged-in user's own reviews
  const { reviews, stats, loading: reviewsLoading, refetch: refetchReviews } = useProductReviews(id);
  const { myReviews, createReview } = useReview();

  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Has this user already reviewed this product?
  const myExistingReview = myReviews.find(r => String(r.product_id) === String(id));

  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productService.getById(id);
        setProduct(data.data || data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Price Calculation Logic
  const originalPrice   = product ? parseFloat(product.price) : 0;
  const discount        = product ? parseFloat(product.discount_price || 0) : 0;
  const hasDiscount     = discount > 0 && discount < originalPrice;
  const discountPrice   = hasDiscount ? discount : originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - discount) / originalPrice) * 100)
    : 0;

  const handleQuantityChange = (type) => {
    const maxStock = product?.stock_quantity || 100;
    if (type === 'increase' && quantity < maxStock) setQuantity(prev => prev + 1);
    else if (type === 'decrease' && quantity > 1)   setQuantity(prev => prev - 1);
  };

  const addToCart = () => {
    if (!product) return;
    // ✅ Fix: ប្តូរពី localStorage មក sessionStorage
    const sessUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (sessUser?.status === 'blocked') {
      alert("Action restricted: Your account has been blocked.");
      return;
    }
    const cart  = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(item => String(item.id) === String(product.id));
    if (index >= 0) cart[index].quantity += quantity;
    else cart.push({ ...product, quantity, price: discountPrice });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
  };

  // ✅ NEW — submit a review for this product
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewRating < 1) {
      setReviewError('Please select a star rating.');
      return;
    }
    setSubmittingReview(true);
    setReviewError(null);
    try {
      await createReview({
        product_id: id,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });
      setReviewSuccess(true);
      setReviewRating(0);
      setReviewComment('');
      refetchReviews();
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(err?.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Loading State
  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-[#2D4A22] rounded-full animate-spin" />
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 animate-pulse">
        Loading...
      </p>
    </div>
  );

  // Error State
  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center">
      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">
        Product Not Found
      </p>
      <button
        onClick={() => navigate(-1)}
        className="text-[#2D4A22] font-black text-[9px] uppercase tracking-[0.2em] hover:text-[#F58220] transition-colors"
      >
        ← Go Back
      </button>
    </div>
  );

  const productImageUrl = product.image?.startsWith('http')
    ? product.image
    : `http://127.0.0.1:8000/storage/${product.image}`;

  const totalPrice = (discountPrice * quantity).toFixed(2);

  // ✅ Fix: ប្តូរពី localStorage មក sessionStorage
  const isBlocked = JSON.parse(sessionStorage.getItem('currentUser'))?.status === 'blocked';

  const fav = isFavorite(product.id);

  return (
    <>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
      <div className="w-full min-h-screen bg-[#FAFAFA] pt-24 pb-20 px-4 md:px-12 animate-fadeIn">

        {/* Header */}
        <div className="max-w-5xl mx-auto mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#2D4A22] font-black text-[9px] uppercase tracking-[0.2em] hover:text-[#F58220] transition-colors"
          >
            <FaArrowLeft size={9} /> {t('button.back') || 'Go Back'}
          </button>
        </div>

        {/* Product Details */}
        <div className="max-w-5xl mx-auto bg-white border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-2">

          {/* Image Section */}
          <div className="bg-[#F9F9F9] p-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="w-[360px] h-[360px] bg-white border border-gray-200/60 shadow-md relative">
              <img
                src={productImageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => toggleFavorite(product, navigate)}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 shadow-sm rounded-full hover:scale-110 transition-transform"
              >
                {fav
                  ? <FaHeart size={16} className="text-red-500" />
                  : <FaRegHeart size={16} className="text-gray-400" />
                }
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="p-8 md:p-10 flex flex-col">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 bg-[#FFF8F2] text-[#F58220] text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3 w-fit border border-[#F58220]/10">
              <BiLeaf size={10} />
              <span>{product.category?.name || 'Menu Item'}</span>
            </div>

            <h1 className="text-2xl font-black text-[#2D4A22] uppercase tracking-tight mb-2">
              {product.name}
            </h1>

            {/* ✅ NEW — rating summary under the title */}
            <div className="flex items-center gap-2 mb-3">
              <StarDisplay rating={stats.average} size={13} />
              <span className="text-[11px] font-bold text-gray-600">
                {stats.average > 0 ? stats.average.toFixed(1) : '—'}
              </span>
              <span className="text-[10px] text-gray-400">
                ({stats.count} {stats.count === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            <p className="text-[10px] text-gray-400 mb-4 font-bold uppercase tracking-widest">
              SKU: {product.sku || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              {product.description || 'Authentic organic recipe.'}
            </p>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-black text-[#2D4A22]">${totalPrice}</span>
              {hasDiscount && (
                <>
                  <span className="text-[10px] text-gray-300 line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                  <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <span className="block text-[9px] font-black text-[#2D4A22] uppercase mb-2">
                Adjust Quantity
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 bg-white shadow-sm">
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    className="px-3 py-2 hover:bg-gray-50 border-r border-gray-100"
                  >
                    <FaMinus size={8} />
                  </button>
                  <span className="px-5 font-black text-xs text-[#2D4A22]">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    className="px-3 py-2 hover:bg-gray-50 border-l border-gray-100"
                  >
                    <FaPlus size={8} />
                  </button>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {product.stock_quantity} Available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={addToCart}
                disabled={isBlocked}
                className={`flex-1 py-3 font-black text-[9px] uppercase tracking-widest transition-colors
                  ${isBlocked
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#2D4A22] text-white hover:bg-[#F58220]'
                  }`}
              >
                {isBlocked ? 'Blocked' : 'Add To Cart'}
              </button>
              <button
                onClick={() => {
                  if (!isBlocked) { addToCart(); navigate('/cart'); }
                  else { alert("Account Blocked"); }
                }}
                disabled={isBlocked}
                className={`flex-1 border-2 py-3 font-black text-[9px] uppercase tracking-widest
                  ${isBlocked
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-[#2D4A22] text-[#2D4A22] hover:bg-gray-50'
                  }`}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* ✅ NEW — Reviews Section */}
        <div className="max-w-5xl mx-auto mt-10 bg-white border border-gray-100 shadow-sm p-8 md:p-10">
          <h2 className="text-lg font-black text-[#2D4A22] uppercase tracking-tight mb-6">
            Customer Reviews
          </h2>

          {/* Rating summary bar */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="text-center flex-shrink-0">
              <p className="text-4xl font-black text-[#2D4A22]">
                {stats.average > 0 ? stats.average.toFixed(1) : '—'}
              </p>
              <StarDisplay rating={stats.average} size={14} />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                {stats.count} {stats.count === 1 ? 'Review' : 'Reviews'}
              </p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.distribution?.[star] ?? 0;
                const pct = stats.count > 0 ? Math.round((count / stats.count) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span className="w-6 font-bold">{star}★</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-gray-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit review form — only for logged-in users who haven't already reviewed */}
          {user ? (
            myExistingReview ? (
              <div className="mb-8 bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700 font-semibold flex items-center gap-2">
                <FaCheckCircle size={14} />
                You already reviewed this product. Thanks for your feedback!
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="mb-8 bg-[#FAFAFA] border border-gray-100 rounded-xl p-5 space-y-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                  Write a Review
                </p>

                {reviewSuccess && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 rounded-lg px-3 py-2 text-xs font-semibold">
                    <FaCheckCircle size={12} /> Review submitted successfully!
                  </div>
                )}
                {reviewError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-3 py-2 text-xs font-semibold">
                    {reviewError}
                  </div>
                )}

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-yellow-400"
                    >
                      {n <= (hoverRating || reviewRating)
                        ? <FaStar size={22} />
                        : <FaRegStar size={22} />}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#9ff3a9] resize-none bg-white"
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 bg-[#2D4A22] text-white font-black text-[9px] uppercase tracking-widest hover:bg-[#F58220] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )
          ) : (
            <div className="mb-8 bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-500">
              <button
                onClick={() => navigate('/login')}
                className="font-bold text-[#2D4A22] hover:text-[#F58220] underline"
              >
                Log in
              </button>{' '}
              to write a review for this product.
            </div>
          )}

          {/* Review list */}
          {reviewsLoading ? (
            <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest py-8 animate-pulse">
              Loading reviews...
            </p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest py-8">
              No reviews yet — be the first to review this product!
            </p>
          ) : (
            <div className="space-y-5">
              {reviews.map(r => (
                <div key={r.id} className="border-b border-gray-50 last:border-0 pb-5 last:pb-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#2D4A22] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
                        {(r.user?.name || 'G').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{r.user?.name || 'Guest'}</span>
                      {r.order_id && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-full">
                          <FaCheckCircle size={9} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <StarDisplay rating={r.rating} size={12} />
                  {r.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed mt-2">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── small helper — read-only star display ──────────────────────────────
const StarDisplay = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      n <= Math.round(rating)
        ? <FaStar key={n} size={size} className="text-yellow-400" />
        : <FaRegStar key={n} size={size} className="text-gray-200" />
    ))}
  </div>
);

export default ProductDetail;