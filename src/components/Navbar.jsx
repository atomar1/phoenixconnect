import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.svg';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md font-ultra">
      <div className="flex items-center">
        <Link to="/">
          <img 
            src={Logo} 
            alt="Phoenix Connect Logo" 
            className="h-8 w-auto"
          />
        </Link>
      </div>

      <div className="flex space-x-6">
        <Link 
          to="/resources" 
          className="text-gray-700 hover:text-brand-red transition-colors"
        >
          Resources
        </Link>
        <Link 
          to="/community" 
          className="text-gray-700 hover:text-brand-red transition-colors"
        >
          Community
        </Link>
        <Link 
          to="/risk-assessment" 
          className="text-gray-700 hover:text-brand-red transition-colors"
        >
          Risk Assessment
        </Link>
      </div>

      <div className="flex space-x-4">
        <Link 
          to="/login" 
          className="px-4 py-2 text-brand-red border border-brand-red rounded-md hover:bg-brand-red hover:bg-opacity-10 transition-colors"
        >
          Login
        </Link>
        <Link 
          to="/signup" 
          className="px-4 py-2 bg-brand-red text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;