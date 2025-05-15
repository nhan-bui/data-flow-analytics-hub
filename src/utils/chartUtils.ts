
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Chart type definition
export type ChartType = 'table' | 'bar' | 'line' | 'pie';

// Colors for charts
export const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#6366f1'  // Indigo
];

// Get display name for chart type
export const getChartTypeDisplay = (type: ChartType): string => {
  switch(type) {
    case 'table': return '📊 Table View';
    case 'bar': return '📶 Bar Chart';
    case 'line': return '📈 Line Chart';
    case 'pie': return '🥧 Pie Chart';
    default: return type;
  }
};

// Format large numbers
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Get key for X-axis from data
export const getXAxisKey = (data: any[]): string => {
  if (!data.length) return '';
  
  // Skip these keys when looking for dimension
  const skipKeys = ['revenue', 'stock', 'chart_label'];
  
  // First non-value field is usually our dimension
  return Object.keys(data[0]).find(key => !skipKeys.includes(key)) || 'chart_label';
};

// Get value field name based on data type
export const getValueField = (dataType: 'sales' | 'inventory'): string => {
  return dataType === 'sales' ? 'revenue' : 'stock';
};

// Get chart title based on selections
export const getChartTitle = (
  dataType: 'sales' | 'inventory', 
  dimensions: { [key: string]: { level: string, display: string } }
): string => {
  const dataTypeTitle = dataType.charAt(0).toUpperCase() + dataType.slice(1);
  
  // Check if any dimensions are selected
  const activeDimensions = Object.entries(dimensions)
    .filter(([_, selection]) => selection.level !== '[]')
    .map(([key, selection]) => {
      // Handle special case for customer/store
      if (key === 'customer') {
        const dimName = dataType === 'sales' ? 'Customer' : 'Store';
        return `${dimName}: ${selection.display}`;
      }
      return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${selection.display}`;
    });
    
  if (activeDimensions.length === 0) {
    return `Overall ${dataTypeTitle} Summary`;
  }
  
  return `${dataTypeTitle} Analysis by ${activeDimensions.join(', ')}`;
};
