// src/pages/user/Home.jsx
import React from 'react';

// Layout / sections
import Benner from '../../components/layout/user/Benner';
import Features from '../../components/common/Features';
import Category from './menu/Category';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const Home = () => {
  return (
    <div className="animate-fadeIn">
      <Benner />

      {/* Each section is isolated: if one crashes, the others still render */}
      <ErrorBoundary compact>
        <Category />
      </ErrorBoundary>

      <ErrorBoundary compact>
        <Features />
      </ErrorBoundary>
    </div>
  );
};

export default Home;