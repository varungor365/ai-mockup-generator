import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          AI Mockup & <span className="text-blue-400">3D Configurator Suite</span>
        </h1>
        <p className="text-sm text-gray-400">AI Models, Virtual Try-On & Realtime 3D Design</p>
      </div>
    </header>
  );
};

export default Header;