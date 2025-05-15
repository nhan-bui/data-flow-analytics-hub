
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  CalendarClock, 
  Users, 
  Package, 
  Globe, 
  Store
} from 'lucide-react';

interface FilterCardProps {
  title: string;
  type: 'time' | 'customer' | 'item' | 'geo';
  options: { [key: string]: { display: string } };
  value: string;
  onChange: (value: string) => void;
  dataType?: 'sales' | 'inventory';
}

export const FilterCard: React.FC<FilterCardProps> = ({ 
  title, 
  type, 
  options,
  value, 
  onChange,
  dataType = 'sales'
}) => {
  // Get the current display name from the value
  const currentDisplay = options[value]?.display || 'All';
  
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
      case 'time': return 'border-l-time-main';
      case 'customer': return 'border-l-customer-main';
      case 'item': return 'border-l-item-main';
      case 'geo': return 'border-l-geo-main';
      default: return 'border-l-gray-300';
    }
  };
  
  // Get badge styles based on the type
  const getBadgeStyles = () => {
    switch (type) {
      case 'time':
        return 'bg-time-badgeBg text-time-badgeText';
      case 'customer':
        return 'bg-customer-badgeBg text-customer-badgeText';
      case 'item':
        return 'bg-item-badgeBg text-item-badgeText';
      case 'geo':
        return 'bg-geo-badgeBg text-geo-badgeText';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get background color based on the type
  const getBackgroundColor = () => {
    switch (type) {
      case 'time': return 'bg-white';
      case 'customer': return 'bg-white';
      case 'item': return 'bg-white';
      case 'geo': return 'bg-white';
      default: return 'bg-white';
    }
  };

  return (
    <div className={`flex flex-col justify-between h-[140px] p-4 rounded-md border-l-4 shadow-sm ${getBorderColor()} ${getBackgroundColor()}`}>
      <div>
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="border border-gray-200 h-9 text-sm w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {Object.entries(options).map(([key, { display }]) => (
              <SelectItem key={key} value={key} className="text-sm">
                {display}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <span className={`text-xs font-medium py-1 px-3 rounded-full inline-block ${getBadgeStyles()}`}>
          Current: {currentDisplay}
        </span>
      </div>
    </div>
  );
};

export default FilterCard;
