import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import adminAuthService from '../../services/adminAuthService';
import Button from './Button';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ChevronDownIcon,
  HomeIcon,
  CubeIcon,
  PhoneIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const cartCount = itemCount;

  // Check if current user is admin
  useEffect(() => {
    setIsAdmin(adminAuthService.isAdmin(user));
  }, [user]);

  // Sticky navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Dynamic navigation links based on user role
  const getNavLinks = () => {
    const baseLinks = [
      { name: 'Home', href: '/', icon: HomeIcon },
      { name: 'Products', href: '/products', icon: CubeIcon },
      { name: 'Contact', href: '/contact', icon: PhoneIcon },
    ];

    // Add admin link only for admin users
    if (isAdmin) {
      baseLinks.push({ name: 'Admin', href: '/admin', icon: Cog6ToothIcon });
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

  const isActiveLink = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl py-1 mobile-md:py-1.5 sm:py-2 border-b border-yellow-200 dark:border-slate-700/50' 
          : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm py-1.5 mobile-md:py-2 sm:py-3 md:py-3 lg:py-3 shadow-md dark:shadow-slate-900/20'
      }`}>
      <div className="max-w-8xl mx-auto px-2 mobile-md:px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-12">
        <div className="flex justify-between items-center h-10 mobile-md:h-12 sm:h-14 md:h-15 lg:h-16 xl:h-16">
          {/* Logo with Brand Name */}
          <Link to="/" className="flex items-center space-x-2 mobile-md:space-x-3 group cursor-pointer">
            <Logo size={isScrolled ? 'sm' : 'md'} variant="default" />
            <div className="flex flex-col">
              {/* Brand name - show full name prominently */}
              <span className={`font-bold transition-all duration-300 bg-gradient-to-r from-yellow-600 to-red-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent leading-tight ${
                isScrolled 
                  ? 'text-sm mobile-md:text-base mobile-lg:text-lg sm:text-lg md:text-lg lg:text-lg xl:text-xl' 
                  : 'text-base mobile-md:text-lg mobile-lg:text-xl sm:text-xl md:text-xl lg:text-xl xl:text-2xl'
              }`}>
                Jai Bhavani
              </span>
              {/* Subtitle */}
              <div className={`text-xs mobile-md:text-sm sm:text-sm md:text-xs lg:text-xs xl:text-sm text-gray-600 dark:text-slate-300 font-medium leading-none ${
                isScrolled ? 'mt-0.5' : 'mt-1'
              }`}>
                Cement Agency
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-3 md:space-x-4 lg:space-x-5 xl:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-3 lg:px-3 py-2 lg:py-2 rounded-lg font-medium transition-all duration-200 group relative cursor-pointer text-sm md:text-sm lg:text-base xl:text-base ${
                  isActiveLink(link.href)
                    ? 'text-red-600 dark:text-amber-400 bg-red-50 dark:bg-slate-800/80 shadow-sm dark:shadow-amber-400/10'
                    : 'text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-amber-400 hover:bg-red-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <link.icon className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                <span>{link.name}</span>
                {/* Hover underline effect */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-red-600 dark:bg-amber-400 transition-all duration-300 ${
                  isActiveLink(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </div>

          {/* Right side actions - Mobile and Desktop */}
          <div className="flex items-center space-x-1 md:space-x-2 mobile-md:space-x-3">
            {/* Theme Toggle - Desktop only */}
            <div className="hidden md:flex items-center justify-center h-8 w-8 md:h-9 md:w-9">
              <ThemeToggle className="text-gray-700 dark:text-slate-300" />
            </div>

            {/* Notifications - Desktop Only */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center justify-center h-8 w-8 md:h-9 md:w-9">
                <NotificationDropdown />
              </div>
            )}

            {/* Cart Icon - Desktop Only */}
            <Link
              to="/cart"
              className="relative hidden md:flex items-center justify-center h-8 w-8 md:h-9 md:w-9 text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-amber-400 hover:bg-red-50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200 cursor-pointer"
            >
              <ShoppingCartIcon className="h-5 w-5 md:h-5 md:w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 dark:bg-amber-500 text-white dark:text-slate-900 text-xs rounded-full h-4 w-4 md:h-4 md:w-4 flex items-center justify-center animate-pulse shadow-lg font-bold border border-white dark:border-slate-900">
                  <span className="text-xs leading-none">{cartCount > 9 ? '9+' : cartCount}</span>
                </span>
              )}
            </Link>

            {/* Orders Icon - Desktop Only */}
            {isAuthenticated && (
              <Link
                to="/orders"
                className="relative hidden md:flex items-center justify-center h-8 w-8 md:h-9 md:w-9 text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200 cursor-pointer"
                title="My Orders"
              >
                <ClipboardDocumentListIcon className="h-5 w-5 md:h-5 md:w-5" />
              </Link>
            )}

            {/* Authentication - Desktop Dropdown */}
            {isAuthenticated ? (
              <Menu as="div" className="relative hidden md:block">
                <Menu.Button className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-slate-800/50 transition-all duration-200 group cursor-pointer h-8 md:h-9">
                  <div className="bg-gradient-to-br from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 p-1 md:p-1 rounded-full shadow-lg flex items-center justify-center">
                    <UserIcon className="h-4 w-4 md:h-4 md:w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm md:text-sm lg:text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{user?.name}</div>
                    <div className="text-xs md:text-xs lg:text-xs text-gray-500 dark:text-slate-400 capitalize">
                      {user?.role === 'admin' ? 'Admin' : 
                       user?.role === 'primary' ? 'Primary' :
                       user?.role === 'secondary' ? 'Secondary' : 'Customer'}
                    </div>
                  </div>
                  <ChevronDownIcon className="h-3 w-3 md:h-3 md:w-3 text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-black ring-opacity-5 dark:ring-slate-700 focus:outline-none border border-gray-200 dark:border-slate-700">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-red-50 dark:bg-slate-700/70 text-red-600 dark:text-amber-400' : 'text-gray-900 dark:text-slate-100'
                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer`}
                          >
                            <UserIcon className="mr-3 h-5 w-5" />
                            My Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/orders"
                            className={`${
                              active ? 'bg-red-50 dark:bg-slate-700/70 text-red-600 dark:text-amber-400' : 'text-gray-900 dark:text-slate-100'
                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer`}
                          >
                            <ClipboardDocumentListIcon className="mr-3 h-5 w-5" />
                            My Orders
                          </Link>
                        )}
                      </Menu.Item>
                      {user?.role === 'admin' && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin"
                              className={`${
                                active ? 'bg-red-50 dark:bg-slate-700/70 text-red-600 dark:text-amber-400' : 'text-gray-900 dark:text-slate-100'
                              } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer`}
                            >
                              <Cog6ToothIcon className="mr-3 h-5 w-5" />
                              Admin Panel
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                    </div>
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-slate-100'
                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer`}
                          >
                            <XMarkIcon className="mr-3 h-5 w-5" />
                            Sign Out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-red-500 dark:hover:border-amber-500 hover:text-red-600 dark:hover:text-amber-400 font-medium px-3 py-1.5 h-8 text-sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 hover:from-yellow-500 hover:to-red-600 dark:hover:from-amber-500 dark:hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-3 py-1.5 h-8 text-sm"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile only - just theme toggle and cart in header */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle */}
            <div className="flex items-center justify-center h-8 w-8 mobile-md:h-9 mobile-md:w-9">
              <ThemeToggle className="text-gray-700 dark:text-slate-300 scale-75 mobile-md:scale-85" />
            </div>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center h-8 w-8 mobile-md:h-9 mobile-md:w-9 text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-amber-400 hover:bg-red-50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200 cursor-pointer"
            >
              <ShoppingCartIcon className="h-4 w-4 mobile-md:h-5 mobile-md:w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 dark:bg-amber-500 text-white dark:text-slate-900 text-xs rounded-full h-4 w-4 mobile-md:h-5 mobile-md:w-5 flex items-center justify-center animate-pulse shadow-lg font-bold border border-white dark:border-slate-900">
                  <span className="text-xs leading-none">{cartCount > 9 ? '9+' : cartCount}</span>
                </span>
              )}
            </Link>

            {/* Orders Icon - Mobile */}
            {isAuthenticated && (
              <Link
                to="/orders"
                className="relative flex items-center justify-center h-8 w-8 mobile-md:h-9 mobile-md:w-9 text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200 cursor-pointer"
                title="My Orders"
              >
                <ClipboardDocumentListIcon className="h-4 w-4 mobile-md:h-5 mobile-md:w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 border-t border-gray-200 dark:border-slate-700 z-40 px-2 py-2 backdrop-blur-sm shadow-lg">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer min-w-0 flex-1 ${
                isActiveLink(link.href)
                  ? 'text-red-600 dark:text-amber-400 bg-red-50 dark:bg-slate-800/70'
                  : 'text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-amber-400 hover:bg-red-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <link.icon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6" />
              <span className="text-xs font-medium truncate">{link.name}</span>
            </Link>
          ))}
          
          {/* Orders in mobile bottom nav */}
          {isAuthenticated && (
            <Link
              to="/orders"
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer min-w-0 flex-1 ${
                isActiveLink('/orders')
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800/70'
                  : 'text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <ClipboardDocumentListIcon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6" />
              <span className="text-xs font-medium truncate">Orders</span>
            </Link>
          )}
          
          {/* Notifications in mobile bottom nav */}
          {isAuthenticated && (
            <Link
              to="/notifications"
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer min-w-0 flex-1 ${
                isActiveLink('/notifications')
                  ? 'text-red-600 dark:text-amber-400 bg-red-50 dark:bg-slate-800/70'
                  : 'text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-amber-400 hover:bg-red-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="relative">
                <BellIcon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6" />
              </div>
              <span className="text-xs font-medium truncate">Alerts</span>
            </Link>
          )}
          
          {/* Profile/Auth in bottom nav */}
          {isAuthenticated ? (
            <Link
              to="/profile"
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer min-w-0 flex-1 ${
                isActiveLink('/profile')
                  ? 'text-red-600 dark:text-amber-400 bg-red-50 dark:bg-slate-800/70'
                  : 'text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-amber-400 hover:bg-red-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 p-1 rounded-full shadow-sm">
                  <UserIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <span className="text-xs font-medium truncate">Profile</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer min-w-0 flex-1 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-amber-400 hover:bg-red-50 dark:hover:bg-slate-800/50"
            >
              <UserIcon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6" />
              <span className="text-xs font-medium truncate">Login</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
