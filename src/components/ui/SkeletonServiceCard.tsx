import React from 'react';

export const SkeletonServiceCard: React.FC = () => {
  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full min-h-[380px] animate-pulse">
      <div className="relative pt-6 px-6 flex justify-between items-start mb-2 gap-2">
        <div className="bg-surface-variant/50 w-24 h-6 rounded-full"></div>
        <div className="w-8 h-8 rounded-full bg-surface-variant/50 -mt-2 -mr-2"></div>
      </div>

      <div className="p-6 pt-2 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="w-3/4 h-7 bg-surface-variant/50 rounded-md"></div>
          <div className="w-12 h-6 bg-surface-variant/50 rounded-md shrink-0"></div>
        </div>
        
        <div className="space-y-2 mb-6 flex-grow">
          <div className="w-full h-4 bg-surface-variant/50 rounded-md"></div>
          <div className="w-full h-4 bg-surface-variant/50 rounded-md"></div>
          <div className="w-2/3 h-4 bg-surface-variant/50 rounded-md"></div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="w-3/4 h-4 bg-surface-variant/50 rounded-md"></div>
          <div className="w-1/2 h-4 bg-surface-variant/50 rounded-md"></div>
        </div>

        <div className="w-full h-10 bg-surface-variant/50 rounded-lg mb-4"></div>
        <div className="w-full h-12 bg-surface-variant/50 rounded-xl"></div>
      </div>
    </div>
  );
};
