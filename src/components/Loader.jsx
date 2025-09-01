import React from "react";

function Loader({ loading, children }) {
  if (!loading) return children; 

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white animate-fadeBg z-50">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default Loader;
