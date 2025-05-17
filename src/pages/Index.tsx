
import React, { useState, useEffect } from 'react';
import { 
  fetchData, 
  DataRequest, 
  TIME_DIMENSIONS, 
  CUSTOMER_DIMENSIONS, 
  ITEM_DIMENSIONS, 
  GEO_DIMENSIONS 
} from '@/services/api';
import FilterCard from '@/components/FilterCard';
import SummaryCard from '@/components/SummaryCard';
import DataVisualization from '@/components/DataVisualization';
import { ChartType, getChartTypeDisplay, getChartTitle } from '@/utils/chartUtils';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, SlidersHorizontal } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  // State for data type (sales/inventory)
  const [dataType, setDataType] = useState<'sales' | 'inventory'>('sales');
  
  // State for dimension selections
  const [selections, setSelections] = useState({
    time: { level: '[]', display: TIME_DIMENSIONS['[]'].display },
    customer: { level: '[]', display: CUSTOMER_DIMENSIONS.sales['[]'].display },
    item: { level: '[]', display: ITEM_DIMENSIONS['[]'].display },
    geo: { level: '[]', display: GEO_DIMENSIONS['[]'].display }
  });
  
  // State for visualization
  const [chartType, setChartType] = useState<ChartType>('table');
  const [visualizationData, setVisualizationData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check for advanced filters on component mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('advancedFilters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setDataType(filters.dataType);
        setSelections({
          time: filters.time,
          customer: filters.customer,
          item: filters.item,
          geo: filters.geo
        });
        // Clear the stored filters
        localStorage.removeItem('advancedFilters');
        // Automatically fetch data with the applied filters
        fetchVisualizationData(filters.dataType, {
          time: filters.time,
          customer: filters.customer,
          item: filters.item,
          geo: filters.geo
        });
      } catch (error) {
        console.error("Error parsing saved filters:", error);
      }
    }
  }, []);
  
  // When data type changes, reset customer dimension
  useEffect(() => {
    setSelections(prev => ({
      ...prev,
      customer: { 
        level: '[]', 
        display: CUSTOMER_DIMENSIONS[dataType]['[]'].display 
      }
    }));
    // Reset visualization data too
    setVisualizationData(null);
  }, [dataType]);
  
  // Handle dimension selection change
  const handleDimensionChange = (dimension: 'time' | 'customer' | 'item' | 'geo', value: string) => {
    const dimensions = dimension === 'time' 
      ? TIME_DIMENSIONS 
      : dimension === 'customer' 
        ? CUSTOMER_DIMENSIONS[dataType] 
        : dimension === 'item' 
          ? ITEM_DIMENSIONS 
          : GEO_DIMENSIONS;
          
    setSelections({
      ...selections,
      [dimension]: {
        level: value,
        display: dimensions[value].display
      }
    });
  };
  
  // Handle data type change
  const handleDataTypeChange = (type: 'sales' | 'inventory') => {
    setDataType(type);
  };
  
  // Apply filters and fetch data
  const fetchVisualizationData = async (type = dataType, selectedDimensions = selections) => {
    setIsLoading(true);
    
    try {
      // Create request object
      const request: DataRequest = {
        dataType: type,
        time: TIME_DIMENSIONS[selectedDimensions.time.level].id,
        customer: CUSTOMER_DIMENSIONS[type][selectedDimensions.customer.level].id,
        item: ITEM_DIMENSIONS[selectedDimensions.item.level].id,
        geo: GEO_DIMENSIONS[selectedDimensions.geo.level].id
      };
      
      // Fetch data
      const response = await fetchData(request);
      
      if (response.success) {
        setVisualizationData(response.data);
        toast.success("Data loaded successfully");
      } else {
        toast.error(response.message || "Failed to load data");
      }
    } catch (error) {
      toast.error("An error occurred while fetching data");
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate breadcrumb elements
  const generateBreadcrumb = () => {
    const activeDimensions = Object.entries(selections)
      .filter(([_, selection]) => selection.level !== '[]')
      .map(([key, selection]) => {
        // Special handling for customer dimension
        if (key === 'customer') {
          const dimName = dataType === 'sales' ? 'Customer' : 'Store';
          return `${dimName}: ${selection.display}`;
        }
        return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${selection.display}`;
      });
    
    if (activeDimensions.length === 0) {
      return (
        <div className="breadcrumb-item font-medium text-blue-600">
          All {dataType.charAt(0).toUpperCase() + dataType.slice(1)} Data Overview
        </div>
      );
    }
    
    return (
      <>
        <div className="breadcrumb-item font-medium text-blue-600 mr-1">
          {dataType.charAt(0).toUpperCase() + dataType.slice(1)} Data by:
        </div>
        {activeDimensions.map((dimension, index) => (
          <div 
            key={index} 
            className={`breadcrumb-item ${
              index === activeDimensions.length - 1 
                ? 'font-semibold text-gray-900' 
                : 'font-medium text-gray-700'
            }`}
          >
            {dimension}
          </div>
        ))}
      </>
    );
  };
  
  // Generate chart title
  const chartTitle = getChartTitle(dataType, selections);

  // Handle navigation to advanced filters
  const handleAdvancedFiltersClick = () => {
    if (!visualizationData) {
      toast.warning("Please apply filters first to see available columns");
      return;
    }
    
    // Store current data type and data in localStorage
    localStorage.setItem('currentDataType', dataType);
    localStorage.setItem('currentColumns', JSON.stringify(Object.keys(visualizationData[0] || {})));
    
    // Navigate to advanced filters
    navigate('/advanced-filters');
  };

  return (
    <div className="container py-8 px-4 mx-auto max-w-7xl">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-3">📊 Interactive Analytics Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Select dimensions and filters to analyze your sales or inventory data.
      </p>
      
      {/* Data Type Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <Button 
          onClick={() => handleDataTypeChange('sales')}
          variant={dataType === 'sales' ? 'default' : 'outline'}
          className="py-6"
        >
          📈 Sales Data
        </Button>
        <Button 
          onClick={() => handleDataTypeChange('inventory')}
          variant={dataType === 'inventory' ? 'default' : 'outline'}
          className="py-6"
        >
          📦 Inventory Data
        </Button>
        <Button 
          onClick={handleAdvancedFiltersClick}
          variant="secondary"
          className="py-6"
          disabled={!visualizationData}
        >
          <SlidersHorizontal className="mr-2 h-5 w-5" />
          Advanced Filters
        </Button>
      </div>
      
      {/* Breadcrumb Navigation */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-1">Current View:</p>
        <div className="flex flex-wrap items-center">
          {generateBreadcrumb()}
        </div>
      </div>
      
      <hr className="my-4" />
      
      {/* Filter Controls */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          <i className="mr-2">🔍</i> Filter Controls
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Time Dimension */}
          <FilterCard
            title="Time Dimension"
            type="time"
            options={TIME_DIMENSIONS}
            value={selections.time.level}
            onChange={(value) => handleDimensionChange('time', value)}
          />
          
          {/* Customer/Store Dimension (dynamic based on data type) */}
          <FilterCard
            title={dataType === 'sales' ? "Customer Dimension" : "Store Dimension"}
            type="customer"
            options={CUSTOMER_DIMENSIONS[dataType]}
            value={selections.customer.level}
            onChange={(value) => handleDimensionChange('customer', value)}
            dataType={dataType}
          />
          
          {/* Item Dimension */}
          <FilterCard
            title="Item Dimension"
            type="item"
            options={ITEM_DIMENSIONS}
            value={selections.item.level}
            onChange={(value) => handleDimensionChange('item', value)}
          />
          
          {/* Geography Dimension */}
          <FilterCard
            title="Geography Dimension"
            type="geo"
            options={GEO_DIMENSIONS}
            value={selections.geo.level}
            onChange={(value) => handleDimensionChange('geo', value)}
          />
        </div>
      </div>
      
      {/* Apply Button and Chart Type Selection */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <Button 
            onClick={() => fetchVisualizationData()}
            disabled={isLoading}
            className="w-full py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>🚀 Apply Filters & Visualize</>
            )}
          </Button>
        </div>
        <div>
          <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">{getChartTypeDisplay('table')}</SelectItem>
              <SelectItem value="bar">{getChartTypeDisplay('bar')}</SelectItem>
              <SelectItem value="line">{getChartTypeDisplay('line')}</SelectItem>
              <SelectItem value="pie">{getChartTypeDisplay('pie')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Data Visualization */}
      <DataVisualization 
        data={visualizationData} 
        chartType={chartType}
        dataType={dataType}
        title={chartTitle}
      />
      
      {/* Selected Dimensions Summary */}
      <hr className="my-8" />
      
      <h2 className="text-xl font-semibold mb-4">
        <i className="mr-2">📋</i> Current Dimension Selections
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Time Summary */}
        <SummaryCard
          type="time"
          displayName={selections.time.display}
          value={selections.time.level}
          dataType={dataType}
        />
        
        {/* Customer/Store Summary */}
        <SummaryCard
          type="customer"
          displayName={selections.customer.display}
          value={selections.customer.level}
          dataType={dataType}
        />
        
        {/* Item Summary */}
        <SummaryCard
          type="item"
          displayName={selections.item.display}
          value={selections.item.level}
          dataType={dataType}
        />
        
        {/* Geography Summary */}
        <SummaryCard
          type="geo"
          displayName={selections.geo.display}
          value={selections.geo.level}
          dataType={dataType}
        />
      </div>
      
      <hr className="my-4" />
      <p className="text-sm text-gray-500 text-center">
        Developed with React, TypeScript, and Tailwind CSS
      </p>
    </div>
  );
};

export default Index;
