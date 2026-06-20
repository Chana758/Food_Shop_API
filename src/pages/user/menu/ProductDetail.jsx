import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../../hooks/useProducts';
import { FaMinus, FaPlus, FaArrowLeft, FaHeart, FaRegHeart } from 'react-icons/fa';
import { BiTime, BiLeaf } from 'react-icons/bi';
import { MdDeliveryDining, MdVerified } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import Toast from '../../../components/common/Toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ហៅទិន្នន័យពី Hook
  const { data: productsData, isLoading, error } = useProducts();

  /**
   * សុវត្ថិភាពទិន្នន័យ (Data Extraction Logic):
   * ដោយសារយើងប្រើ Laravel Pagination (paginate(15)) ទិន្នន័យនឹងស្ថិតក្នុង Object.
   */
  const productsArray = productsData?.data?.data 
    ? productsData.data.data 
    : (Array.isArray(productsData?.data) ? productsData.data : (Array.isArray(productsData) ? productsData : []));

  // ស្វែងរកផលិតផលដែលត្រូវនឹង ID
  const product = productsArray.find((item) => String(item.id) === String(id));

  // រៀបចំតម្លៃ
  const price = product ? parseFloat(product.price) : 0;
  const discountPrice = product?.discount_price ? parseFloat(product.discount_price) : price;
  const hasDiscount = product?.discount_price && product.discount_price < product.price;
  const discountPercent = hasDiscount ? (((price - discountPrice) / price) * 100).toFixed(0) : 0;

  // គ្រប់គ្រងស្ថានភាព Favorite
  useEffect(() => {
    if (product) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.some((item) => String(item.id) === String(product.id)));
    }
  }, [product]);

  const handleFavoriteToggle = () => {
    if (!product) return;
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      localStorage.setItem('favorites', JSON.stringify(favorites.filter((item) => String(item.id) !== String(product.id))));
      setIsFavorite(false);
    } else {
      favorites.push({ id: product.id, name: product.name, price: discountPrice, image: product.image });
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const handleQuantityChange = (type) => {
    const maxStock = product?.stock_quantity || 100;
    if (type === 'increase' && quantity < maxStock) setQuantity((prev) => prev + 1);
    else if (type === 'decrease' && quantity > 1) setQuantity((prev) => prev - 1);
  };

  // បន្ថែមចូលកន្ត្រក (បានបន្ថែម Security Check)
  const addToCart = () => {
    if (!product) return;

    // NOTE: Security Check - ការពារ User ដែលជាប់ Block
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.status === 'blocked') {
        alert("Action restricted: Your account has been blocked by the administrator.");
        return; 
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex((item) => String(item.id) === String(product.id));
    if (index >= 0) cart[index].quantity += quantity;
    else cart.push({ ...product, quantity, price: discountPrice });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !product) return <div className="min-h-screen flex items-center justify-center">Product Not Found</div>;

  const productImageUrl = product.image?.startsWith('http') ? product.image : `http://127.0.0.1:8000/storage/${product.image}`;
  const totalPrice = (discountPrice * quantity).toFixed(2);
  const isBlocked = JSON.parse(localStorage.getItem('user'))?.status === 'blocked';

  return (
    <>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}

      <div className="w-full min-h-screen bg-[#FAFAFA] pt-24 pb-20 px-4 md:px-12 animate-fadeIn">
        <div className="max-w-5xl mx-auto mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#2D4A22] font-black text-[9px] uppercase tracking-[0.2em] hover:text-[#F58220] transition-colors">
            <FaArrowLeft size={9} /> {t('button.back') || 'Go Back'}
          </button>
        </div>

        <div className="max-w-5xl mx-auto bg-white border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-[#F9F9F9] p-6 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="w-[360px] h-[360px] bg-white border border-gray-200/60 shadow-md relative">
              <img src={productImageUrl} alt={product.name} className="w-full h-full object-cover" />
              <button onClick={handleFavoriteToggle} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 shadow-sm rounded-full">
                {isFavorite ? <FaHeart size={16} className="text-red-500" /> : <FaRegHeart size={16} className="text-gray-400" />}
              </button>
            </div>
          </div>

          <div className="p-8 md:p-10 flex flex-col">
            <div className="inline-flex items-center gap-2 bg-[#FFF8F2] text-[#F58220] text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 mb-3 w-fit border border-[#F58220]/10">
              <BiLeaf size={10} /> <span>{product.category?.name || 'Menu Item'}</span>
            </div>

            <h1 className="text-2xl font-black text-[#2D4A22] uppercase tracking-tight mb-2">{product.name}</h1>
            <p className="text-[10px] text-gray-400 mb-4 font-bold uppercase tracking-widest">SKU: {product.sku || 'N/A'}</p>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-black text-[#2D4A22]">${totalPrice}</span>
              {hasDiscount && (
                <>
                  <span className="text-[10px] text-gray-300 line-through">${price.toFixed(2)}</span>
                  <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5">-{discountPercent}%</span>
                </>
              )}
            </div>

            <div className="mb-6">
              <span className="block text-[9px] font-black text-[#2D4A22] uppercase mb-2">Adjust Quantity</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 bg-white shadow-sm">
                  <button onClick={() => handleQuantityChange('decrease')} className="px-3 py-2 hover:bg-gray-50 border-r border-gray-100"><FaMinus size={8} /></button>
                  <span className="px-5 font-black text-xs text-[#2D4A22]">{quantity}</span>
                  <button onClick={() => handleQuantityChange('increase')} className="px-3 py-2 hover:bg-gray-50 border-l border-gray-100"><FaPlus size={8} /></button>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{product.stock_quantity} Items Available</span>
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <button 
                onClick={addToCart} 
                disabled={isBlocked}
                className={`flex-1 py-3 font-black text-[9px] uppercase tracking-widest transition-colors ${isBlocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2D4A22] text-white hover:bg-[#F58220]'}`}>
                {isBlocked ? 'Account Blocked' : 'Add To Cart'}
              </button>
              <button 
                onClick={() => { if(!isBlocked) { addToCart(); navigate('/cart'); } else { alert("Account Blocked"); } }} 
                disabled={isBlocked}
                className={`flex-1 border-2 py-3 font-black text-[9px] uppercase tracking-widest ${isBlocked ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-[#2D4A22] text-[#2D4A22] hover:bg-gray-50'}`}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;