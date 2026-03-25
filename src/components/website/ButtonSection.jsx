import { clearAuth } from '@/store/auth';
import { getInitials } from '@/utils/functions';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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

const DashboardLink = ({ link }) => (
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
  const router=useRouter()
  const handleCartClick = () => {
    router.push("/coming-soon")
  }
   const handleWishlistClick = () => {
    router.push("/coming-soon")
  }
   const handleNotificationClick = () => {
    router.push("/coming-soon")
  }

  const dispatch = useDispatch();
    const handleLogout = useCallback(() => {
      dispatch(clearAuth());
    }, [dispatch]);

  if (!user) {
    return (
      <div className="flex items-center  ">
        {/* Primary CTA */}
        {/* <Link href="/auth/register">
          <button
            className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg
                 bg-gradient-to-r from-orange-500 to-orange-600
                 hover:from-orange-600 hover:to-orange-700
                 shadow-md hover:shadow-lg
                 transition-all duration-200
                 active:scale-95 text-nowrap"
          >

            Create Account
          </button>
        </Link> */}


  <Link href="/coming-soon">
          <button
            className="p-3
                 hover:bg-gray-100/60 w-12 h-12 flex itens-cemter justify-center rounded-full 
                 
                 transition-all duration-200 cursor-pointer
                 "
          >
            <Icon icon="mdi:heart-outline" width="22" height="22" />
          </button>
        </Link>

        <Link href="/coming-soon">
          <button
            className=" p-3
                 hover:bg-gray-100/60 w-12 h-12 flex itens-cemter justify-center rounded-full 
                 
                 transition-all duration-200 cursor-pointer
                 "
          >
            <Icon icon="proicons:cart" width="22" height="22" />
          </button>
        </Link>

       <Link
                href="/auth/register"
                className="hidden sm:inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 shadow-sm"
              >
                Get Started
              </Link>
      </div>

    );
  }
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
        }
        
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



      const toggleDropdown = useCallback(() => {
        setIsDropdownOpen(prev => !prev);
      }, []);

        const dropdownLinks = [
    { name: "Account", path: "/my-account" , icon: "mdi:account-cog-outline" },
    { name: "Help & Support", path: "/help-support", icon: "mdi:help-circle-outline" },
    { name: "Sign Out", path: "/", icon: "mdi:logout", isLogout: true },
  ];

  
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
     
      
       {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 group
                      ${isDropdownOpen ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    aria-label="Profile menu"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                        <span className="text-xs font-semibold text-white">
                          {getInitials(user?.name)}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                    </div>
      
                    {/* User Info - Hidden on small screens */}
                    <div className="hidden md:block text-left">
                      <p className="text-xs font-medium text-gray-900 capitalize line-clamp-1 max-w-[100px]">
                        {user?.name}
                      </p>
                      <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
                    </div>
      
                    <Icon
                      icon="mdi:chevron-down"
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 
                        ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
      
                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 z-40 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">
                              {getInitials(user?.name)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
      
                      {/* Menu Items */}
                      <div className="py-2">
                        {dropdownLinks.map((link) => (
                          <React.Fragment key={link.name}>
                            {link.isLogout && <div className="border-t border-gray-100 my-2" />}
                            <Link
                              href={link.path}
                              className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-150
                                ${link.isLogout
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              onClick={handleLogout}
                            >
                              <Icon
                                icon={link.icon}
                                className={`w-4 h-4 ${link.isLogout ? 'text-red-500' : 'text-gray-400'}`}
                              />
                              <span className="truncate">{link.name}</span>
                            </Link>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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