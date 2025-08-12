import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../services/api';
import ModernProductCard from '../components/common/ModernProductCard';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { useResponsive } from '../hooks/useResponsive';
import { 
  TruckIcon, 
  ShieldCheckIcon, 
  CurrencyRupeeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  BuildingOffice2Icon,
  CubeIcon,
  WrenchScrewdriverIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

// Import brand logos
import ultraTechLogo from '../assets/ultra tech .jpeg';
import ambujaLogo from '../assets/ambuja.jpeg';
import accLogo from '../assets/acc.jpeg';
import birlaLogo from '../assets/adity birla.jpeg';
import drFixitLogo from '../assets/dr fixit.jpeg';
import jkLogo from '../assets/jk cement.jpeg';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const { getGridCols, getContainerMaxWidth, isMobile, isTablet, isTV } = useResponsive();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get responsive grid columns for products
  const productGridCols = getGridCols({
    mobile: 1,
    tablet: 2,
    desktop: 3,
    large: 4,
    tv: 5,
    ultrawide: 6
  });

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        // Fetch more products to ensure we have enough for mixed categories
        const response = await productsAPI.getAll({ limit: 12 });
        
        // Handle different response structures
        const products = response.data.data?.products || response.data.products || response.data.data || [];
        
        // Mix products from different categories for better variety
        const mixedProducts = [];
        const categories = ['Cement & Concrete', 'Bricks & Blocks', 'Stone Aggregates', 'Roof and Tiles Bonding'];
        
        // Try to get products from each category to ensure variety
        categories.forEach(category => {
          const categoryProducts = products.filter(p => p.category === category);
          if (categoryProducts.length > 0) {
            mixedProducts.push(...categoryProducts.slice(0, 2)); // Add up to 2 products from each category
          }
        });
        
        // If we still need more products, fill with remaining ones
        if (mixedProducts.length < 8) {
          const remainingProducts = products.filter(p => !mixedProducts.some(mp => mp._id === p._id));
          mixedProducts.push(...remainingProducts.slice(0, 8 - mixedProducts.length));
        }
        
        setFeaturedProducts(mixedProducts);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const features = [
    {
      icon: TruckIcon,
      title: 'Fast Delivery',
      description: 'Quick delivery to your construction site across Mumbai and Pune',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Quality Assured',
      description: 'Premium quality construction materials from trusted manufacturers',
      color: 'bg-red-100 text-red-600',
    },
    {
      icon: CurrencyRupeeIcon,
      title: 'Best Prices',
      description: 'Competitive pricing with special rates for bulk customers',
      color: 'bg-gray-100 text-gray-600',
    },
  ];

  const productCategories = [
    {
      name: 'Cement & Concrete',
      image: '/api/placeholder/400/300',
      description: 'Premium cement brands and ready-mix concrete',
      count: '15+ Products',
      link: '/products?category=Cement'
    },
    {
      name: 'Bricks & Blocks',
      image: '/api/placeholder/400/300', 
      description: 'High-quality bricks and concrete blocks',
      count: '25+ Products',
      link: '/products?category=Bricks & Blocks'
    },
    {
      name: 'Stone Aggregates',
      image: '/api/placeholder/400/300',
      description: 'Construction sand, gravel and stone chips',
      count: '10+ Products',
      link: '/products?category=Stone Aggregates'
    },
    {
    name: 'Roof and Tiles Bonding',
    image: '/api/placeholder/400/300',
    description: 'For roofing, tiles, and bonding applications',
    count: '6+ Products',
    link: '/products?category=Roof and Tiles Bonding',
  },
  ];

  const testimonials = [
    {
      quote: "Jai Bhavani has been our trusted supplier for over 3 years. Their quality is consistent and delivery is always on time.",
      name: "Rajesh Sharma",
      company: "Sharma Construction Co.",
      rating: 4
    },
    {
      quote: "Best prices in Mumbai for bulk orders. The team is professional and understands our project requirements.",
      name: "Priya Patel", 
      company: "Patel Builders",
      rating: 5
    },
    {
      quote: "Excellent customer service and premium quality materials. Highly recommend for any construction project.",
      name: "Vikram Singh",
      company: "Singh Infrastructure",
      rating: 5
    }
  ];

  const trustedBrands = [
    { name: 'UltraTech', logo: ultraTechLogo },
    { name: 'Ambuja', logo: ambujaLogo },
    { name: 'ACC', logo: accLogo },
    { name: 'Birla', logo: birlaLogo },
    { name: 'DR.FIXIT', logo: drFixitLogo },
    { name: 'JK', logo: jkLogo },
  ];

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Call Us',
      info: '+91 8983463892',
    },
    {
      icon: MapPinIcon,
      title: 'Visit Us',
      info: 'After Leo kids School, Anjurphata Road, near Ratan Talkies, Kamatghar, Bhiwandi, Maharashtra 421302',
    },
    {
      icon: ClockIcon,
      title: 'Working Hours',
      info: 'Mon-Sun: 9AM-7:30PM',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Enhanced Hero Section with Construction Theme */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 dark:from-slate-900 dark:via-slate-800 dark:to-red-900 text-white py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Animated Background Elements - Responsive */}
        <div className="absolute top-4 sm:top-10 left-4 sm:left-10 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-yellow-500 opacity-20 rounded-full animate-pulse"></div>
        <div className="absolute top-20 sm:top-40 right-4 sm:right-20 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-red-500 opacity-20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-1/4 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-400 opacity-30 transform rotate-45 animate-pulse"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8">
          <div className="text-center">
            {/* Main Headline with Animation - Responsive Typography */}
            <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 animate-fade-in-up">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight">
                <span className="text-yellow-400">Jai Bhavani</span>
                <br />
                <span className="text-white">Cement Agency</span>
              </h1>
              <div className="w-12 sm:w-16 md:w-20 lg:w-24 xl:w-28 h-0.5 sm:h-0.5 md:h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto mb-3 sm:mb-4 md:mb-5"></div>
            </div>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 lg:mb-10 max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto text-gray-100 animate-fade-in-up animation-delay-200 px-4 sm:px-0">
              Your trusted partner for premium construction materials. 
              <br className="hidden sm:block" />
              <span className="text-yellow-300 font-semibold">Quality cement, steel, bricks, and more</span> at unbeatable prices.
            </p>
            
            {isAuthenticated ? (
              <div className="space-y-4 sm:space-y-6 animate-fade-in-up animation-delay-400">
                <p className="text-sm sm:text-base lg:text-lg px-4 sm:px-0">
                  Welcome back, <span className="text-yellow-300 font-semibold">{user?.name}</span>! 
                  {user?.role !== 'registered' && (
                    <span className="block sm:inline ml-0 sm:ml-2 mt-2 sm:mt-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold">
                      {user?.role === 'admin' ? 'ADMINISTRATOR - Full Access' :
                       user?.role === 'primary' ? 'PRIMARY CUSTOMER - Special Pricing Active' : 
                       'SECONDARY CUSTOMER - Special Pricing Active'}
                    </span>
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-4 lg:gap-5 justify-center px-4 sm:px-0">
                  <Link to="/products" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 hover:from-amber-600 hover:to-orange-600 dark:hover:from-amber-500 dark:hover:to-orange-500 text-white dark:text-slate-900 font-bold px-6 sm:px-8 md:px-8 lg:px-10 py-3 sm:py-3 md:py-4 text-base sm:text-base lg:text-lg shadow-xl dark:shadow-amber-400/30 hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      Browse Products
                    </Button>
                  </Link>
                  <Link to="/orders" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full sm:w-auto border-2 border-white dark:border-amber-400  dark:text-amber-400 hover:text-amber-400 hover:bg-white dark:hover:bg-amber-400 font-bold px-6 sm:px-8 md:px-8 lg:px-10 py-3 sm:py-3 md:py-4 text-base sm:text-base lg:text-lg shadow-lg dark:shadow-amber-400/20"
                    >
                      My Orders
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 animate-fade-in-up animation-delay-400">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-4 lg:gap-5 justify-center px-4 sm:px-0">
                  <Link to="/products" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 hover:from-amber-600 hover:to-orange-600 dark:hover:from-amber-500 dark:hover:to-orange-500 text-white dark:text-slate-900 font-bold px-6 sm:px-8 md:px-8 lg:px-10 py-3 sm:py-3 md:py-4 text-base sm:text-base lg:text-lg shadow-xl dark:shadow-amber-400/30 hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      Browse Products
                    </Button>
                  </Link>
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full sm:w-auto border-2 border-amber-400 dark:border-amber-400 text-amber-400 dark:text-amber-400 hover:bg-amber-400 hover:text-gray-900 dark:hover:bg-amber-400 dark:hover:text-white font-bold px-6 sm:px-8 md:px-8 lg:px-10 py-3 sm:py-3 md:py-4 text-base sm:text-base lg:text-lg shadow-lg dark:shadow-amber-400/20"
                    >
                      Request a Quote
                    </Button>
                  </Link>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 px-4 sm:px-0">
                  <span className="text-yellow-300">Join 500+</span> satisfied contractors and builders
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trusted Brands Section */}
      <section className="py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 bg-white dark:bg-slate-800 border-b-2 sm:border-b-4 border-yellow-400 dark:border-amber-400 transition-colors duration-300">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10 xl:mb-12">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-3">
              Official Suppliers of Trusted Brands
            </h2>
            <p className="text-sm sm:text-base md:text-base lg:text-base text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Authorized dealers for India's leading construction brands</p>
          </div>
          
          {/* Centered container for brands with proper spacing */}
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6 lg:gap-4 xl:gap-5 max-w-4xl lg:max-w-5xl">
              {trustedBrands.map((brand, index) => (
                <div 
                  key={index} 
                  className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-4 lg:p-3 xl:p-4 text-center hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-lg dark:hover:shadow-amber-400/20 transition-all duration-300 transform hover:scale-105 animate-fade-in-up cursor-pointer relative overflow-hidden min-h-[100px] md:min-h-[120px] lg:min-h-[110px] xl:min-h-[130px] flex flex-col justify-center"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Enhanced gradient background on hover with better contrast */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full">
                    {/* Brand Logo */}
                    <div className="mb-2 sm:mb-3 flex items-center justify-center h-12 sm:h-14 md:h-16 lg:h-14 xl:h-16">
                      <img 
                        src={brand.logo} 
                        alt={`${brand.name} Logo`}
                        className="max-h-full max-w-full object-contain filter brightness-90 group-hover:brightness-100 transition-all duration-300 group-hover:scale-110"
                      />
                    </div>
                    
                    {/* Brand Name */}
                    <div className="text-xs sm:text-sm md:text-base lg:text-sm xl:text-base font-bold text-gray-800 dark:text-slate-200 mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors duration-300">
                      {brand.name}
                    </div>
                    
                    {/* Authorized Dealer Text */}
                    <div className="text-xs md:text-xs lg:text-xs xl:text-sm text-gray-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-200 transition-colors duration-300 font-medium">
                      Authorized Dealer
                    </div>
                    
                    {/* Small accent line that appears on hover */}
                    <div className="w-0 group-hover:w-6 sm:group-hover:w-8 h-0.5 bg-amber-500 dark:bg-amber-400 mx-auto mt-1 sm:mt-2 transition-all duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 2xl:py-24 bg-gray-100 dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10 xl:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-3">
              Why Choose <span className="text-red-600 dark:text-orange-400">Jai Bhavani</span>?
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl text-gray-600 dark:text-slate-300 max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 sm:px-0">
              We provide the best construction materials with excellent service and competitive pricing
            </p>
            <div className="w-12 sm:w-16 md:w-20 lg:w-24 xl:w-28 h-0.5 bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 mx-auto mt-3 sm:mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-6 lg:gap-8 xl:gap-10">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white dark:bg-slate-700 rounded-xl shadow-lg dark:shadow-slate-900/50 p-4 sm:p-6 md:p-6 lg:p-7 xl:p-8 text-center hover:shadow-2xl dark:hover:shadow-slate-900/70 transition-all duration-300 transform hover:scale-105 animate-fade-in-up border-t-4 border-yellow-400"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`mx-auto h-12 w-12 sm:h-16 sm:w-16 md:h-18 md:w-18 lg:h-20 lg:w-20 xl:h-22 xl:w-22 ${feature.color} rounded-full flex items-center justify-center mb-3 sm:mb-4 lg:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-4 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-sm md:text-base lg:text-base xl:text-base text-gray-600 dark:text-gray-300 leading-relaxed px-2 sm:px-0">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="py-8 sm:py-10 md:py-12 lg:py-14 xl:py-16 bg-white dark:bg-slate-900">
        <div className="max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-3">
              Our <span className="text-yellow-500 dark:text-amber-400">Product</span> Categories
            </h2>
            <p className="text-sm sm:text-base md:text-base lg:text-base xl:text-lg text-gray-600 dark:text-slate-300 max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-2xl mx-auto">
              Discover our comprehensive range of construction materials
            </p>
            <div className="w-12 sm:w-16 md:w-20 lg:w-20 xl:w-24 h-0.5 bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 mx-auto mt-3 sm:mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-5 xl:gap-6 max-w-5xl mx-auto">
            {productCategories.map((category, index) => (
              <div 
                key={index}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Category Card */}
                <Link 
                  to={category.link}
                  className="block cursor-pointer"
                >
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl dark:hover:shadow-amber-400/20 transition-all duration-300 transform hover:scale-105 border-t-4 border-yellow-400 dark:border-amber-400 relative h-[300px] flex flex-col">
                    {/* Category Image Background */}
                    <div className="h-[140px] bg-gradient-to-br from-gray-700 to-gray-900 dark:from-slate-700 dark:to-slate-800 relative overflow-hidden flex items-center justify-center flex-shrink-0">
                      {/* Construction Pattern Overlay */}
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`
                      }} />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent group-hover:from-red-900 dark:group-hover:from-amber-900 transition-all duration-300"></div>
                      
                      {/* Category Icon in Center */}
                      <div className="relative z-10 h-16 w-16 bg-gradient-to-br from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <div className="text-white">
                          {index === 0 && <BuildingOffice2Icon className="h-8 w-8" />}
                          {index === 1 && <CubeIcon className="h-8 w-8" />}
                          {index === 2 && <WrenchScrewdriverIcon className="h-8 w-8" />}
                          {index === 3 && <CubeIcon className="h-8 w-8" />}
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Info */}
                    <div className="p-4 text-white flex-1 flex flex-col justify-between min-h-0">
                      <div className="flex-1 min-h-0">
                        <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-300 dark:group-hover:text-amber-300 transition-colors duration-300 line-clamp-1">
                          {category.name}
                        </h3>
                        <p className="text-gray-300 dark:text-slate-300 text-sm group-hover:text-white transition-colors duration-300 line-clamp-2 mb-3">
                          {category.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-block bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 text-gray-900 dark:text-slate-900 px-3 py-1 rounded-full text-xs font-bold">
                          {category.count}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32 bg-gradient-to-br from-gray-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              Featured <span className="text-red-600 dark:text-orange-400">Products</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl text-gray-600 dark:text-slate-300">
              Discover our most popular construction materials
            </p>
            <div className="w-20 sm:w-24 md:w-28 lg:w-32 xl:w-40 h-0.5 sm:h-1 bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 mx-auto mt-4 sm:mt-6"></div>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <Loading size="lg" text="Loading products..." />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-6 xl:gap-8 mb-8 sm:mb-12 lg:mb-16">
              {featuredProducts.slice(0, isTV ? 12 : isMobile ? 4 : 8).map((product, index) => (
                <div 
                  key={product._id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <ModernProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/products">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 hover:from-red-700 hover:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 text-white font-bold px-8 py-4 text-lg shadow-xl dark:shadow-red-500/30 hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-gray-900 to-red-900 dark:from-slate-900 dark:to-slate-800 text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4">
              What Our <span className="text-yellow-400 dark:text-amber-400">Customers</span> Say
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 dark:text-slate-300 px-4 sm:px-0">
              Trusted by 500+ contractors and builders across Mumbai & Pune
            </p>
            <div className="w-16 sm:w-20 md:w-24 lg:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 mx-auto mt-4 sm:mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-7 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-slate-800 bg-opacity-90 dark:bg-opacity-95 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-7 lg:p-8 shadow-xl hover:bg-opacity-100 dark:hover:bg-opacity-100 transition-all duration-300 transform hover:scale-105 animate-fade-in-up border border-gray-200 dark:border-slate-600"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Rating Stars */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 text-yellow-400 dark:text-amber-400 fill-current" />
                  ))}
                </div>
                
                {/* Quote */}
                <blockquote className="text-sm sm:text-base md:text-base lg:text-lg italic text-center mb-4 sm:mb-6 text-black dark:text-slate-100 font-medium px-2 sm:px-0">
                  "{testimonial.quote}"
                </blockquote>
                
                {/* Customer Info */}
                <div className="text-center">
                  <div className="font-bold text-red-600 dark:text-orange-400 text-base sm:text-lg md:text-lg">{testimonial.name}</div>
                  <div className="text-gray-600 dark:text-slate-400 font-medium text-sm sm:text-base md:text-base">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Pricing Tiers */}
      {!isAuthenticated && (
        <section className="py-20 bg-yellow-50 dark:bg-slate-800 border-t-4 border-yellow-400 dark:border-amber-400 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                Special Pricing for <span className="text-red-600 dark:text-orange-400">Regular</span> Customers
              </h2>
              <p className="text-xl text-gray-600 dark:text-slate-300">
                Register now and enjoy exclusive discounts on bulk orders
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 mx-auto mt-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg dark:shadow-slate-900/50 p-6 sm:p-8 md:p-7 text-center hover:shadow-2xl dark:hover:shadow-slate-900/70 transition-all duration-300 transform hover:scale-105 animate-fade-in-up">
                <div className="h-16 w-16 bg-gray-100 dark:bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                  Regular Customer
                </h3>
                <p className="text-gray-600 dark:text-slate-300 mb-6">
                  Standard pricing for all products
                </p>
                <div className="text-3xl font-bold text-gray-600 dark:text-slate-400 mb-6">
                  Standard Rates
                </div>
                <Link to="/register">
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-yellow-500 dark:border-amber-400 text-yellow-600 dark:text-amber-400 hover:bg-yellow-500 hover:text-white dark:hover:bg-amber-400 dark:hover:text-white hover:border-yellow-600 dark:hover:border-amber-300 font-semibold shadow-lg shadow-yellow-500/20 dark:shadow-amber-400/20 hover:shadow-xl hover:shadow-yellow-500/30 dark:hover:shadow-amber-400/30 transition-all duration-300 hover:scale-105"
                  >
                    Register Now
                  </Button>
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-700 rounded-xl shadow-xl dark:shadow-slate-900/60 p-6 sm:p-8 md:p-7 text-center border-4 border-yellow-400 dark:border-amber-400 hover:shadow-2xl dark:hover:shadow-slate-900/80 transition-all duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-200 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-500 dark:bg-amber-500 text-gray-900 dark:text-slate-900 px-4 py-2 rounded-full text-sm font-bold">
                    POPULAR
                  </span>
                </div>
                <div className="h-16 w-16 bg-yellow-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                  Secondary Customer
                </h3>
                <p className="text-gray-600 dark:text-slate-300 mb-6">
                  Moderate discounts for regular buyers
                </p>
                <div className="text-3xl font-bold text-yellow-600 dark:text-amber-400 mb-6">
                  5-10% OFF
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-600 p-3 rounded-lg">
                  Contact us to upgrade your account
                </p>
              </div>

              <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg dark:shadow-slate-900/50 p-6 sm:p-8 md:p-7 text-center hover:shadow-2xl dark:hover:shadow-slate-900/70 transition-all duration-300 transform hover:scale-105 animate-fade-in-up animation-delay-400">
                <div className="h-16 w-16 bg-red-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                  Primary Customer
                </h3>
                <p className="text-gray-600 dark:text-slate-300 mb-6">
                  Best pricing for bulk purchasers
                </p>
                <div className="text-3xl font-bold text-red-600 dark:text-orange-400 mb-6">
                  10-15% OFF
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-600 p-3 rounded-lg">
                  Contact us to upgrade your account
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Contact Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900 text-white transition-colors duration-300 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-8 left-8 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-32 right-12 w-4 h-4 sm:w-6 sm:h-6 bg-red-400 rounded-full animate-bounce opacity-40"></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 sm:w-4 sm:h-4 bg-amber-400 rounded-full animate-pulse opacity-50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-block mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm uppercase tracking-widest text-yellow-400 dark:text-amber-400 font-bold bg-yellow-400/10 dark:bg-amber-400/10 px-3 sm:px-4 py-1 sm:py-2 rounded-full border border-yellow-400/20 dark:border-amber-400/20">
                Contact Us
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400 dark:from-amber-400 dark:to-yellow-400">Touch</span>
            </h2>
            <p className="text-sm sm:text-lg md:text-xl lg:text-lg xl:text-xl text-gray-300 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Have questions? We're here to help you build your dreams!
            </p>
            <div className="w-16 sm:w-20 md:w-24 lg:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-red-500 dark:from-amber-400 dark:via-yellow-400 dark:to-orange-500 mx-auto mt-6 sm:mt-8 rounded-full shadow-lg"></div>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-10 xl:gap-12 mb-12 sm:mb-16 lg:mb-20">
            {contactInfo.map((contact, index) => (
              <div 
                key={index} 
                className="group relative text-center animate-fade-in-up bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-9 lg:p-10 xl:p-12 border border-white/10 dark:border-slate-700/50 hover:border-yellow-400/30 dark:hover:border-amber-400/30 hover:bg-white/10 dark:hover:bg-slate-700/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/10 dark:hover:shadow-amber-500/10"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Icon Container */}
                <div className="relative mx-auto mb-6 sm:mb-8 lg:mb-10">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-22 md:w-22 lg:h-24 lg:w-24 xl:h-28 xl:w-28 bg-gradient-to-br from-yellow-400 via-amber-400 to-red-500 dark:from-amber-400 dark:via-yellow-400 dark:to-orange-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-yellow-500/20 dark:shadow-amber-500/20">
                    <contact.icon className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 xl:h-14 xl:w-14 text-white drop-shadow-lg" />
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 h-16 w-16 sm:h-20 sm:w-20 md:h-22 md:w-22 lg:h-24 lg:w-24 xl:h-28 xl:w-28 mx-auto bg-gradient-to-br from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                </div>
                
                {/* Content */}
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl font-bold mb-3 sm:mb-4 lg:mb-6 group-hover:text-yellow-400 dark:group-hover:text-amber-400 transition-colors duration-300">
                  {contact.title}
                </h3>
                <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-lg text-gray-300 dark:text-slate-300 group-hover:text-white transition-colors duration-300 font-medium">
                  {contact.info}
                </p>

                {/* Hover border effect */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-yellow-400/50 group-hover:to-red-500/50 dark:group-hover:from-amber-400/50 dark:group-hover:to-orange-500/50 transition-all duration-500"></div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <p className="text-sm sm:text-base lg:text-lg text-gray-400 dark:text-slate-400 mb-4 sm:mb-6">
                Ready to start your construction project?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center">
              <Link to="/contact">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="group relative border-2 border-yellow-400/80 dark:border-amber-400/80 text-yellow-400 dark:text-amber-400 hover:bg-yellow-400 hover:text-slate-900 dark:hover:bg-amber-400 dark:hover:text-white font-bold px-6 sm:px-8 lg:px-8 xl:px-10 py-3 sm:py-4 lg:py-4 text-sm sm:text-base lg:text-base xl:text-lg shadow-xl shadow-yellow-500/20 dark:shadow-amber-500/20 hover:shadow-2xl hover:shadow-yellow-500/40 dark:hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105 rounded-xl sm:rounded-2xl backdrop-blur-sm bg-slate-900/20 dark:bg-slate-800/40 hover:border-yellow-500 dark:hover:border-amber-500"
                >
                  <span className="relative z-10 flex items-center gap-2 sm:gap-3 font-bold">
                    Contact Us Now
                    <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 group-hover:animate-bounce" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-400 dark:from-amber-400 dark:to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl"></div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
