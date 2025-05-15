
import React from 'react';
import { CalendarClock, Users, Package, Globe, Store } from 'lucide-react';

interface SummaryCardProps {
  type: 'time' | 'customer' | 'item' | 'geo';
  displayName: string;
  value: string;
  dataType: 'sales' | 'inventory';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ type, displayName, value, dataType }) => {
  // Get the icon based on the type
  const getIcon = () => {
    switch (type) {
      case 'time':
        return <CalendarClock className="h-5 w-5 text-time-main" />;
      case 'customer':
        return dataType === 'sales' 
          ? <Users className="h-5 w-5 text-customer-main" />
          : <Store className="h-5 w-5 text-customer-main" />;
      case 'item':
        return <Package className="h-5 w-5 text-item-main" />;
      case 'geo':
        return <Globe className="h-5 w-5 text-geo-main" />;
      default:
        return null;
    }
  };
  
  // Get the border color based on the type
  const getBorderColor = () => {
    switch (type) {
      case 'time': return 'border-time-main';
      case 'customer': return 'border-customer-main';
      case 'item': return 'border-item-main';
      case 'geo': return 'border-geo-main';
      default: return 'border-gray-300';
    }
  };
  
  // Get background color based on the type (with alpha)
  const getBackgroundColor = () => {
    switch (type) {
      case 'time': return 'bg-blue-50';
      case 'customer': return 'bg-green-50';
      case 'item': return 'bg-purple-50';
      case 'geo': return 'bg-amber-50';
      default: return 'bg-gray-50';
    }
  };
  
  // Get title name
  const getTitle = () => {
    if (type === 'customer') {
      return dataType === 'sales' ? 'Customer' : 'Store';
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className={`summary-card ${getBorderColor()} ${getBackgroundColor()}`}>
      <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
        {getIcon()}
        <span>{getTitle()}</span>
      </h4>
      <p className="text-sm text-gray-700">{displayName}</p>
    </div>
  );
};

export default SummaryCard;
