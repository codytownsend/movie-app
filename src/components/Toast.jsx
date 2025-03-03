// src/components/Toast.jsx
import React, { useEffect, useState } from 'react';

const Toast = ({ toast }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (toast.show) {
      setVisible(true);
      
      // Auto-hide the toast after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  if (!toast.show && !visible) return null;
  
  return (
    <div className="fixed bottom-24 left-0 right-0 flex justify-center items-center z-50 pointer-events-none px-4">
      <div 
        className={`bg-black bg-opacity-80 text-white px-6 py-3 rounded-full shadow-lg max-w-xs text-center transform transition-all duration-300 ease-in-out ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
};

export default Toast;