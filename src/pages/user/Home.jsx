import React from 'react';

// ១. Import សេវាកម្មទាញទិន្នន័យមកប្រើ
import { productService } from '../../service/productService'; 

// Import Layout Components
import Benner from '../../components/layout/user/Benner';   
import Features from '../../components/common/Features'; 
import Category from './menu/Category'; 

const Home = () => {
  // ត្រង់នេះអ្នកអាចសរសេរ useEffect ដើម្បីហៅ productService.getAll() បាន
  
  return (
    <div className="animate-fadeIn">
      <Benner />
      <Category />
      <Features />
    </div>
  );
};

export default Home;