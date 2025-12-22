import { Icon } from '@iconify/react';
import React from 'react';

function SmallLoader({ loading, text = "Loading..." }) {
  if (!loading) return null;

  return (
    <div className="flex items-center justify-center  min-h-screen ">
      <div className="text-center">
        <Icon
          icon="eos-icons:loading"
          className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-3"
        />

        <p className="text-gray-600 text-base">{text}</p>
      </div>
    </div>
  );
}

export default SmallLoader;
