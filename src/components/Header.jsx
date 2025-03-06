// src/components/Header.jsx
import React from 'react';
import { useAppContext } from '../context/AppContext';

const Header = () => {
  const { colorScheme } = useAppContext();

  return (
    <header className={`${colorScheme.card} shadow-sm p-4 flex justify-center items-center z-10`}>
      <h1 className={`text-xl font-bold ${colorScheme.text} relative group`}>
        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          MovieMatch
        </span>
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
      </h1>
    </header>
  );
};

export default Header;