import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Map from './components/Map'; // Assuming Map.jsx is in the components folder

const App = () => {
  return (
    <main className="max-w-7xl mx-auto relative">
      {/* Navbar is always visible */}
      <Navbar />
      <Routes>
        {/* Define your app's routes */}
        <Route path="/" element={<div>Welcome to Phoenix Connect</div>} />
        <Route path="/resources" element={<Map />} />
      </Routes>
    </main>
  );
};

export default App;
