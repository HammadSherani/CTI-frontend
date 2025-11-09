import { Icon } from '@iconify/react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const IconButton = ({ 
  icon, 
  label, 
  count = 0, 
  showCount = false,
  href,
  onClick 
}) => {
  const button = (
    <div className="relative group cursor-pointer" aria-label={label}>
      <Icon
        icon={icon}
        className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
        width={24}
        height={24}
      />
      {showCount && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
          {count}
        </span>
      )}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
        {label} {showCount && `(${count})`}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{button}</Link>;
  }

  return <div onClick={onClick}>{button}</div>;
};

const DashboardLink = ({link}) => (
  <Link href={link}>
    <button className="relative ml-1 text-sm group px-6 cursor-pointer py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors duration-200 font-medium shadow-sm">
      Dashboard
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
        Go to Dashboard
      </div>
    </button>
  </Link>
);

function ButtonSection() {
  const [cartItems, setCartItems] = useState(1);
  const [wishlistItems, setWishlistItems] = useState(1);
  const [notificationCount] = useState(4);
  const { user } = useSelector((state) => state.auth);

  const handleCartClick = () => console.log('Cart clicked');
  const handleWishlistClick = () => console.log('Wishlist clicked');
  const handleNotificationClick = () => console.log('Notifications clicked');

  // 👇 Show Join Now button when no user is logged in
  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/auth/register">
          <button className="px-6 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors duration-200 font-medium shadow-sm">
            Join Now
          </button>
        </Link>
      </div>
    );
  }

  const renderCustomerButtons = () => (
    <>
      <IconButton
        icon="mdi:heart-outline"
        label="Wishlist"
        count={wishlistItems}
        showCount
        onClick={handleWishlistClick}
      />
      <IconButton
        icon="mdi:bell-outline"
        label="Notifications"
        count={notificationCount}
        showCount
        onClick={handleNotificationClick}
      />
      <IconButton
        icon="mdi:cart-outline"
        label="My Cart"
        count={cartItems}
        showCount
        onClick={handleCartClick}
      />
      <IconButton
        icon="mdi:account-circle"
        label="My Account"
        href="/my-account"
      />
    </>
  );

  const renderRepairmanButtons = () => (
    <>
      <IconButton
        icon="mdi:bell-outline"
        label="Notifications"
        count={notificationCount}
        showCount
        onClick={handleNotificationClick}
      />
      <DashboardLink link="/repair-man/dashboard" />
    </>
  );

  const renderAdminButtons = () => (
    <>
      <IconButton
        icon="mdi:bell-outline"
        label="Notifications"
        count={notificationCount}
        showCount
        onClick={handleNotificationClick}
      />
      <DashboardLink link="/admin/dashboard" />
    </>
  );

  const roleButtons = {
    customer: renderCustomerButtons,
    repairman: renderRepairmanButtons,
    admin: renderAdminButtons,
  };

  const renderButtons = roleButtons[user.role];

  return (
    <div className="flex items-center gap-4">
      {renderButtons ? renderButtons() : <h3>Login</h3>}
    </div>
  );
}



export default ButtonSection;