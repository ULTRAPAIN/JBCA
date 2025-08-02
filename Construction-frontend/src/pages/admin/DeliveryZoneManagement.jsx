import React from 'react';
import { TruckIcon } from '@heroicons/react/24/outline';

const DeliveryZoneManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <TruckIcon className="mx-auto h-24 w-24 text-gray-400 dark:text-slate-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Delivery Zone Management
          </h2>
          <p className="text-gray-600 dark:text-slate-300 mb-8">
            This page will allow admins to configure delivery zones, pricing, and coverage areas.
          </p>
          <div className="bg-blue-50 dark:bg-amber-900/20 border border-blue-200 dark:border-amber-600 rounded-md p-4 max-w-2xl mx-auto">
            <p className="text-blue-800 dark:text-amber-200 text-sm">
              Coming soon: Complete delivery zone management with coverage mapping, 
              zone-specific pricing, delivery time estimates, and logistics optimization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryZoneManagement;
