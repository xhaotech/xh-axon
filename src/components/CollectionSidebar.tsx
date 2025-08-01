import React from 'react';
import { CollectionTree } from './CollectionTree';
import { cn } from '@/lib/utils';

interface CollectionSidebarProps {
  className?: string;
}

export const CollectionSidebar: React.FC<CollectionSidebarProps> = ({ 
  className 
}) => {
  return (
    <div className={cn(
      "w-80 bg-background border-r border-border flex flex-col h-full",
      className
    )}>
      <CollectionTree />
    </div>
  );
};
