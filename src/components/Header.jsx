// src/components/Header.js
import React from 'react';
import { Sliders, Bell } from 'lucide-react';

const Header = ({ colorScheme, setFilterOpen, setNotificationsOpen }) => (
  <header className={`${colorScheme.card} shadow-sm p-4 flex justify-between items-center z-10`}>
    <div className="flex items-center cursor-pointer" onClick={() => setFilterOpen(true)}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorScheme.bg}`}>
        <Sliders className={`w-5 h-5 ${colorScheme.text}`} />
      </div>
    </div>
    <h1 className={`text-xl font-bold ${colorScheme.text}`}>
      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">MovieMatch</span>
    </h1>
    <div 
      className={`w-10 h-10 rounded-full flex items-center justify-center ${colorScheme.bg} cursor-pointer`}
      onClick={() => setNotificationsOpen(true)}
    >
      <Bell className={`w-5 h-5 ${colorScheme.text}`} />
    </div>
  </header>
);

export default Header;
