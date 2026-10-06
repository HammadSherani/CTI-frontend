"use client";
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import logo from "../../../../../public/assets/logo.png";
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '@/store/auth';
import AdminNotificationBell from './AdminNotificationBell';

/* ---------- Static data (kept outside the component) ---------- */

const primaryNavLinks = [
  { name: "Dashboard", path: "/admin/dashboard", icon: "mdi:view-dashboard-outline" },
  {
    name: "Catalog",
    icon: "mdi:folder-outline",
    submenu: [
      {
        category: "Content Management",
        items: [
          { name: "Services", icon: "mdi:post-outline", path: "/admin/services" },
          { name: "Banners", icon: "mdi:image-outline", path: "/admin/banners" },
          { name: "Brand", icon: "mdi:tag-outline", path: "/admin/brand" },
          { name: "Models", icon: "mdi:cube-outline", path: "/admin/models" },
          { name: "Blog", icon: "mdi:post-outline", path: "/admin/blogs" },
          { name: "Home Reviews", icon: "mdi:star-outline", path: "/admin/home-reviews" },
        ],
      },
      {
        category: "Location Management",
        items: [
          { name: "City", icon: "mdi:city-variant-outline", path: "/admin/cities" },
          { name: "State", icon: "mdi:map-marker-outline", path: "/admin/states" },
          { name: "Country", icon: "mdi:earth", path: "/admin/countries" },
        ],
      },
    ],
  },
  {
    name: "Users",
    icon: "mdi:account-multiple-outline",
    submenu: [
      {
        category: "User Management",
        items: [
          { name: "All Users", icon: "mdi:account-group-outline", path: "/admin/users" },
          { name: "Repairmen", icon: "mdi:account-wrench-outline", path: "/admin/repair-man" },
          { name: "Top Professionals", icon: "mdi:star-circle-outline", path: "/admin/top-professionals" },
          { name: "KYC Management", icon: "mdi:shield-account-outline", path: "/admin/kyc-management" },
        ],
      },
      {
        category: "Operations",
        items: [
          { name: "Job Board", icon: "mdi:briefcase-outline", path: "/admin/job-board" },
          { name: "Ratings & Reviews", icon: "mdi:star-outline", path: "/admin/rating-and-reviews" },
          { name: "Disputes", icon: "mdi:gavel", path: "/admin/disputes" },
          { name: "Advertisement", icon: "mdi:advertisements", path: "/admin/advertisement" },
        ],
      },
    ],
  },
  {
    name: "Parts",
    icon: "mdi:package-variant",
    submenu: [
      {
        category: "Inventory",
        items: [
          { name: "Parts Categories", icon: "mdi:shape-outline", path: "/admin/parts/parts-categories" },
          { name: "Stock Management", icon: "mdi:warehouse", path: "/admin/parts/stock-management" },
        ],
      },
      {
        category: "Orders",
        items: [
          { name: "Parts Orders", icon: "mdi:cart-outline", path: "/admin/parts/parts-orders" },
        ],
      },
    ],
  },
  {
    name: "Academy",
    icon: "mdi:school-outline",
    submenu: [
      {
        category: "Academy",
        items: [
          { name: "Academy Categories", icon: "mdi:shape-outline", path: "/admin/academy/academy-categories" },
          { name: "Academy Subcategories", icon: "mdi:file-tree-outline", path: "/admin/academy/academy-subcategories" },
          { name: "Ace Management", icon: "mdi:warehouse", path: "/admin/academy/ace-management" },
        ],
      },
    ],
  },
  { name: "Withdrawals", path: "/admin/withdrawals/all-withdrawal-request", icon: "mdi:cash" },
  {
    // Insurance Requests + Insurance Categories merged into one menu to save width
    name: "Insurance",
    icon: "mdi:shield-check-outline",
    submenu: [
      {
        category: "Insurance",
        items: [
          { name: "Insurance Requests", icon: "mdi:shield-check-outline", path: "/admin/insurance/requests" },
          { name: "Insurance Categories", icon: "mdi:shield-crown-outline", path: "/admin/insurance/categories" },
        ],
      },
    ],
  },
  {
    name: "Modules",
    icon: "mdi:view-grid-plus-outline",
    submenu: [
      {
        category: "Other Modules",
        items: [
          { name: "Ecommerce", icon: "mdi:store", path: "/admin/ecom/dashbaord" },
          { name: "Refurbished", icon: "mdi:cellphone-link", path: "/admin/refurbished/dashbaord" },
        ],
      },
    ],
  },
];

const dropdownLinks = [
  { name: "My Profile", path: "/admin/profile", icon: "mdi:account-cog-outline" },
  { name: "Notifications", path: "/admin/notifications", icon: "mdi:bell-outline" },
  { name: "Sign Out", path: "/auth/logout", icon: "mdi:logout", isLogout: true },
];

/* ---------- Header ---------- */

function Header() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const navRef = useRef(null);
  const profileRef = useRef(null);

  const [openMenu, setOpenMenu] = useState(null); // 'Catalog' | 'Users' | ... | null
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const toggleMenu = (name) => {
    setProfileOpen(false);
    setOpenMenu((current) => (current === name ? null : name));
  };

  const toggleProfile = () => {
    setOpenMenu(null);
    setProfileOpen((v) => !v);
  };

  const handleLogout = () => {
    dispatch(clearAuth());
  };

  // Close dropdowns on outside click / Escape
  useEffect(() => {
    const onClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) setOpenMenu(null);
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Close everything on route change
  useEffect(() => {
    setOpenMenu(null);
    setProfileOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActiveLink = (linkPath) =>
    !!linkPath && (pathname === linkPath || pathname.startsWith(linkPath + '/'));

  const isSubmenuActive = (submenu) =>
    submenu?.some((group) => group.items?.some((item) => isActiveLink(item.path)));

  const navItemClass = (active) =>
    `relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-200 2xl:px-3 ${active ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
    }`;

  const renderDesktopItem = (link) => {
    if (!link.submenu) {
      const active = isActiveLink(link.path);
      return (
        <Link key={link.name} href={link.path} className={navItemClass(active)}>
          <Icon icon={link.icon} className="hidden h-4 w-4 2xl:block" />
          {link.name}
          {active && <span className="absolute -bottom-1 left-3 right-3 h-0.5 rounded-full bg-primary-600" />}
        </Link>
      );
    }

    const open = openMenu === link.name;
    const active = isSubmenuActive(link.submenu);

    return (
      <div key={link.name} className="relative">
        <button
          type="button"
          onClick={() => toggleMenu(link.name)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={navItemClass(active || open)}
        >
          <Icon icon={link.icon} className="hidden h-4 w-4 2xl:block" />
          {link.name}
          <Icon icon="mdi:chevron-down" className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          {active && <span className="absolute -bottom-1 left-3 right-3 h-0.5 rounded-full bg-primary-600" />}
        </button>

        {open && (
          <div
            role="menu"
            className="absolute left-0 top-full z-[60] mt-2 max-h-[75vh] w-72 max-w-[calc(100vw-1rem)] overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white py-2 shadow-xl"
          >
            {link.submenu.map((group, groupIndex) => (
              <div key={group.category}>
                {groupIndex > 0 && <div className="my-1 border-t border-gray-100" />}
                <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {group.category}
                </p>
                <div className="px-1.5">
                  {group.items.map((item) => {
                    const itemActive = isActiveLink(item.path);
                    return (
                      <Link
                        key={item.name}
                        href={item.path}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${itemActive
                            ? 'bg-primary-50 font-medium text-primary-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                      >
                        <Icon icon={item.icon} className={`h-4 w-4 ${itemActive ? 'text-primary-600' : 'text-gray-400'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        {/* Left: logo + desktop nav */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link href="/admin/dashboard" className="shrink-0">
            <Image
              src={logo}
              alt="RepairHub Logo"
              width={80}
              height={40}
              className="h-auto w-20 object-contain transition-opacity hover:opacity-80"
              priority
            />
          </Link>

          {/* No overflow-* on this nav, otherwise it would clip the dropdowns */}
          <nav ref={navRef} className="hidden items-center gap-0.5 xl:flex">
            {primaryNavLinks.map(renderDesktopItem)}
          </nav>
        </div>

        {/* Right: bell, profile, hamburger */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <AdminNotificationBell userToken={token} />

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={toggleProfile}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              className={`flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors ${profileOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
            >
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-sm ring-2 ring-white">
                  <span className="text-sm font-bold text-white">{initials}</span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              </div>
              <Icon
                icon="mdi:chevron-down"
                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-[60] mt-2 w-72 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
              >
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
                    <span className="text-lg font-bold text-white">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                    <p className="truncate text-sm text-gray-500">{user?.email || 'admin@example.com'}</p>
                    <span className="mt-1 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-600">
                      Administrator
                    </span>
                  </div>
                </div>

                <div className="p-1.5">
                  {dropdownLinks.map((link) => (
                    <div key={link.name}>
                      {link.isLogout && <div className="my-1.5 border-t border-gray-100" />}
                      <Link
                        href={link.path}
                        onClick={() => link.isLogout && handleLogout()}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${link.isLogout ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <Icon icon={link.icon} className={`h-5 w-5 ${link.isLogout ? 'text-red-500' : 'text-gray-400'}`} />
                        <span className="font-medium">{link.name}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 xl:hidden"
          >
            <Icon icon={mobileOpen ? 'mdi:close' : 'mdi:menu'} className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu: hidden until the hamburger is pressed, scrolls inside itself */}
      {mobileOpen && (
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain border-t border-gray-100 bg-gray-50 xl:hidden">
          <nav className="mx-auto max-w-3xl space-y-1 px-4 py-4">
            {primaryNavLinks.map((link) =>
              !link.submenu ? (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${isActiveLink(link.path) ? 'bg-primary-100 text-primary-600' : 'text-gray-700 hover:bg-white'
                    }`}
                >
                  <Icon icon={link.icon} className="h-5 w-5" />
                  {link.name}
                </Link>
              ) : (
                <div key={link.name} className="pt-2">
                  <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <Icon icon={link.icon} className="h-4 w-4" />
                    {link.name}
                  </div>
                  {link.submenu.map((group) => (
                    <div key={group.category} className="ml-3 space-y-0.5 border-l border-gray-200 pl-2">
                      {link.submenu.length > 1 && (
                        <p className="px-4 pt-1.5 text-[11px] font-medium text-gray-400">{group.category}</p>
                      )}
                      {group.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.path}
                          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${isActiveLink(item.path)
                              ? 'bg-primary-100 font-medium text-primary-600'
                              : 'text-gray-600 hover:bg-white'
                            }`}
                        >
                          <Icon icon={item.icon} className="h-4 w-4" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;