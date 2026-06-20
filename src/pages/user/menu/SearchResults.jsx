import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { IoSearch } from 'react-icons/io5';
import { FaArrowLeft } from 'react-icons/fa';
import { BiLeaf } from 'react-icons/bi';
import { productService } from '../../../service/productService'; 

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || ''; 
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // មុខងារសម្រាប់ដោះស្រាយ Path រូបភាព
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-food.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://127.0.0.1:8000/storage/${imagePath}`;
  };

  // មុខងារ fetchResults ដែលមានតែមួយ និងត្រឹមត្រូវ
  const fetchResults = async (term) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await productService.search(term);
      // ដោយសារប្រើ paginate() នៅ Backend ទិន្នន័យស្ថិតក្នុង .data.products.data
      setResults(response.data.products.data || []); 
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery(query);
    fetchResults(query);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] pt-32 pb-20 px-6 md:px-14">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Navigation --- */}
        <div className="mb-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[#277d08] font-black text-[10px] uppercase tracking-[0.3em] hover:text-[#F58220] transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </div>

        {/* --- Search Input Box --- */}
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

        {/* --- Results Grid --- */}
        {isLoading ? (
          <div className="text-center text-gray-400 font-bold tracking-widest uppercase">Loading Results...</div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {results.map((item) => (
              <Link key={item.id} to={`/menu/product/${item.id}`} className="group flex flex-col">
                <div className="relative aspect-[4/3.5] overflow-hidden bg-gray-50 mb-6 border border-gray-100 rounded-0">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-food.jpg';
                    }}
                  />
                </div>
                <div className={`text-center`} >
                    <h3 className="text-sm font-black text-[#2D4A22] uppercase tracking-widest">{item.name}</h3>
                    <p className="text-[#F58220] font-bold mt-1">${item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20">
            <h3 className="text-[#2D4A22] font-black uppercase">No Matches Found</h3>
            <p className="text-gray-400 text-xs mt-2">Try a different keyword</p>
          </div>
        ) : (
          <div className="text-center py-20 opacity-40">
            <BiLeaf size={50} className="mx-auto text-gray-200 mb-4" />
            <p className="uppercase font-bold text-gray-400">Enter a keyword to search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;