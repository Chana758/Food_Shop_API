import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { IoSearch } from 'react-icons/io5';
import { FaArrowLeft } from 'react-icons/fa';
import { BiLeaf } from 'react-icons/bi';
import axiosInstance from '../../../api/axios';
import { getImageUrl } from '../../../utils/imageUrl';

const PLACEHOLDER = 'https://placehold.co/400x300?text=Khmer+Fresh';

const SearchResults = () => {
  const navigate                        = useNavigate();
  const [searchParams]                  = useSearchParams();
  const query                           = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery]   = useState(query);
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [isLoading, setIsLoading]       = useState(false);

  // ── Fetch from API ────────────────────────────────────
  const fetchResults = async (term) => {
    if (!term || term.trim().length < 2) {
      setProducts([]);
      setCategories([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.get('/search', {
        params: { q: term.trim() },
      });

      const data = res.data?.data ?? {};

      // Backend returns paginated objects → extract .data array
      setProducts(data.products?.data   ?? []);
      setCategories(data.categories?.data ?? []);

    } catch (err) {
      console.error('Search failed:', err);
      setProducts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Re-fetch when URL query changes ──────────────────
  useEffect(() => {
    setSearchQuery(query);
    fetchResults(query);
  }, [query]);

  // ── Handle form submit → update URL ──────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const hasResults = products.length > 0 || categories.length > 0;

  // ─────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] pt-32 pb-20 px-6 md:px-14">
      <div className="max-w-7xl mx-auto">

        {/* Back */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#277d08] font-black text-[10px] uppercase tracking-[0.3em] hover:text-[#F58220] transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-16">
          <form onSubmit={handleSearch} className="relative group">
            <IoSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[#F58220] text-xl" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you craving today?"
              className="w-full pl-16 pr-10 py-4 rounded-sm border border-gray-100 bg-white focus:border-[#2D4A22] outline-none shadow-sm text-sm uppercase font-bold tracking-widest transition-all"
            />
          </form>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center text-gray-400 font-bold tracking-widest uppercase">
            Loading Results...
          </div>
        )}

        {/* Results */}
        {!isLoading && hasResults && (
          <div className="space-y-14">

            {/* Products */}
            {products.length > 0 && (
              <section>
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-[#F58220]" /> Products
                  <span className="text-[#F58220]">({products.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products.map(item => (
                    <Link key={item.id} to={`/menu/product/${item.id}`} className="group flex flex-col">
                      <div className="relative aspect-[4/3.5] overflow-hidden bg-gray-50 mb-6 border border-gray-100">
                        <img
                          src={getImageUrl(item.image, PLACEHOLDER)}
                          alt={item.name}
                          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                          onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-black text-[#2D4A22] uppercase tracking-widest">{item.name}</h3>
                        <p className="text-[#F58220] font-bold mt-1">${Number(item.price).toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <section>
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-[#F58220]" /> Categories
                  <span className="text-[#F58220]">({categories.length})</span>
                </h2>
                <div className="flex flex-wrap gap-3">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/menu?category=${cat.id}`}
                      className="px-5 py-2.5 border-2 border-gray-100 text-[10px] font-black text-[#2D4A22] uppercase tracking-widest hover:border-[#2D4A22] hover:bg-gray-50 transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* No results */}
        {!isLoading && !hasResults && query && (
          <div className="text-center py-20">
            <h3 className="text-[#2D4A22] font-black uppercase">No Matches Found</h3>
            <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">Try a different keyword</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !query && (
          <div className="text-center py-20 opacity-40">
            <BiLeaf size={50} className="mx-auto text-gray-200 mb-4" />
            <p className="uppercase font-bold text-gray-400 tracking-widest">Enter a keyword to search</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchResults;