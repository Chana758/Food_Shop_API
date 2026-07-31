import React from 'react';
import { productService } from '../../service/productService'; 

// Import Layout Components
import Benner from '../../components/layout/user/Benner';   
import Features from '../../components/common/Features'; 
import Category from './menu/Category'; 

const Home = () => {
  // Fetch products on component mount
  
  return (
    <div className="animate-fadeIn">
      <Benner />
      <Category />
      <Features />
    </div>
  );
};

export default Home;