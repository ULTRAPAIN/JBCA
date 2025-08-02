import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import adminAuthService from '../../services/adminAuthService';
import Button from './Button';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ShoppingCartIcon,
  UserIcon,
  ChevronDownIcon,
  HomeIcon,
  CubeIcon,
  PhoneIcon,
  Cog6ToothIcon,
  BuildingStorefrontIcon
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white dark:bg-slate-800 shadow-xl py-2' 
        : 'bg-white dark:bg-slate-800 bg-opacity-95 dark:bg-opacity-95 backdrop-blur-sm py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="bg-gradient-to-br from-yellow-400 to-red-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <BuildingStorefrontIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className={`font-bold transition-all duration-300 ${
                isScrolled ? 'text-xl' : 'text-2xl'
              } text-gray-900 dark:text-white`}>
                Jai Bhavani
              </span>
              <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Cement Agency</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 group relative cursor-pointer ${
                  isActiveLink(link.href)
                    ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
                {/* Hover underline effect */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-red-600 dark:bg-red-400 transition-all duration-300 ${
                  isActiveLink(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle className="text-gray-700 dark:text-gray-300" />

            {/* Notifications */}
            {isAuthenticated && (
              <NotificationDropdown />
            )}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 cursor-pointer"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Authentication */}
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group cursor-pointer">
                  <div className="bg-gradient-to-br from-yellow-400 to-red-500 p-2 rounded-full">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user?.role === 'admin' ? 'Administrator' : 
                       user?.role === 'primary' ? 'Primary Customer' :
                       user?.role === 'secondary' ? 'Secondary Customer' : 'Customer'}
                    </div>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
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
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-600 rounded-xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-black ring-opacity-5 dark:ring-gray-600 focus:outline-none">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-gray-50 dark:bg-gray-700 text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
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
                              active ? 'bg-gray-50 dark:bg-gray-700 text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer`}
                          >
                            <ShoppingCartIcon className="mr-3 h-5 w-5" />
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
                                active ? 'bg-gray-50 dark:bg-gray-700 text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
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
                              active ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
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
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none cursor-pointer"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <Transition
          show={isOpen}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div className="md:hidden">
            <div className="px-2 pt-4 pb-3 space-y-2 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-600">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                    isActiveLink(link.href)
                      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-yellow-400 to-red-500 text-white">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Transition>
      </div>
    </nav>
  );
};

export default Navbar;
