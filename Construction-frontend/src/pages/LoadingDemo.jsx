import React, { useState } from 'react';
import Loading from '../components/common/Loading';
import FullPageLoader from '../components/common/FullPageLoader';
import Button from '../components/common/Button';

const LoadingDemo = () => {
  const [showFullPage, setShowFullPage] = useState(false);
  const [currentVariant, setCurrentVariant] = useState('crane');

  if (showFullPage) {
    return (
      <FullPageLoader 
        variant={currentVariant}
        text="Building your experience..."
        subtitle="Our construction crew is hard at work preparing everything for you"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-slate-100">
          Construction Loading Animations
        </h1>
        
        {/* Variant selector */}
        <div className="flex justify-center space-x-4 mb-8">
          {['crane', 'building', 'mixer', 'simple'].map((variant) => (
            <Button
              key={variant}
              onClick={() => setCurrentVariant(variant)}
              variant={currentVariant === variant ? 'primary' : 'outline'}
              size="sm"
            >
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Button>
          ))}
        </div>

        {/* Loading examples grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Small */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Small</h3>
            <Loading size="sm" variant={currentVariant} text="Loading..." />
          </div>

          {/* Medium */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Medium</h3>
            <Loading size="md" variant={currentVariant} text="Processing..." />
          </div>

          {/* Large */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Large</h3>
            <Loading size="lg" variant={currentVariant} text="Building..." />
          </div>

          {/* Extra Large with Logo */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">XL + Logo</h3>
            <Loading size="xl" variant={currentVariant} text="Constructing..." showLogo={true} />
          </div>
        </div>

        {/* Full page demo */}
        <div className="text-center">
          <Button
            onClick={() => setShowFullPage(true)}
            className="bg-gradient-to-r from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600"
          >
            Demo Full Page Loader
          </Button>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
            Click to see full page loading experience
          </p>
        </div>

        {/* Usage examples */}
        <div className="mt-12 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-slate-100">Usage Examples</h2>
          <div className="space-y-4 text-sm">
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded">
              <code className="text-blue-600 dark:text-blue-400">
                {`<Loading size="md" variant="crane" text="Building your order..." />`}
              </code>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded">
              <code className="text-blue-600 dark:text-blue-400">
                {`<Loading size="lg" variant="building" showLogo={true} />`}
              </code>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded">
              <code className="text-blue-600 dark:text-blue-400">
                {`<FullPageLoader variant="mixer" text="Processing order..." />`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingDemo;
