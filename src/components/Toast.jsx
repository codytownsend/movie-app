// src/components/Toast.js
import React from 'react';

const Toast = ({ toast }) => {
  if (!toast.show) return null;
  return (
    <div className="fixed bottom-24 left-0 right-0 flex justify-center items-center z-50 pointer-events-none">
      <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full shadow-lg">
        {toast.message}
      </div>
    </div>
  );
};

export default Toast;
