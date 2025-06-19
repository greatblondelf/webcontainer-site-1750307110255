import React, { useState } from 'react';

const RandomColorButton = () => {
  const [buttonColor, setButtonColor] = useState('#3b82f6');

  const getRandomColor = () => {
    const colors = [
      '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
      '#8b5cf6', '#06b6d4', '#f97316', '#6b7280',
      '#ec4899', '#14b8a6', '#3b82f6', '#84cc16',
      '#f59e0b', '#a855f7', '#0ea5e9', '#7c3aed'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleClick = () => {
    setButtonColor(getRandomColor());
  };

  return (
    <button
      onClick={handleClick}
      style={{ backgroundColor: buttonColor }}
      className="px-8 py-4 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
      aria-label="Click to change button color randomly"
    >
      Click me to change color!
    </button>
  );
};

export default RandomColorButton;
