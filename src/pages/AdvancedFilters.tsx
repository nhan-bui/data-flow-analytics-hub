
import React, { useState, useEffect } from 'react';
import { 
  TIME_DIMENSIONS, 
  CUSTOMER_DIMENSIONS, 
  ITEM_DIMENSIONS, 
  GEO_DIMENSIONS,
  fetchData,
  DataRequest
} from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Users, Package, Globe, Store, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const AdvancedFilters: React.FC = () => {
  const navigate = useNavigate();
  const [dataType, setDataType] = useState<'sales' | 'inventory'>('sales');
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [noDataAvailable, setNoDataAvailable] = useState(false);
  
  // Time dimension states
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  
  // Customer/Store dimension states
  const [customerType, setCustomerType] = useState<string>('');
  const [storeCode, setStoreCode] = useState<string>('');
  
  // Item dimension states
  const [itemCode, setItemCode] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedWeightRanges, setSelectedWeightRanges] = useState<string[]>([]);
  
  // Geo dimension states
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Define sample data for selections
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableWeightRanges = ['0-5kg', '5-10kg', '10-15kg', '15-20kg', '20-25kg', '25-30kg'];
  const availableStates = ['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Arizona'];
  const availableCities = {
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
    'Texas': ['Houston', 'Austin', 'Dallas', 'San Antonio'],
    'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
    'Illinois': ['Chicago', 'Springfield', 'Peoria', 'Rockford'],
    'Arizona': ['Phoenix', 'Tucson', 'Mesa', 'Chandler']
  };
  
  // Load data and set state on component mount
  useEffect(() => {
    // Check if data is available from localStorage
    const storedDataType = localStorage.getItem('currentDataType');
    const storedColumns = localStorage.getItem('currentColumns');
    
    if (!storedDataType || !storedColumns) {
      setNoDataAvailable(true);
      return;
    }
    
    try {
      const dataType = storedDataType as 'sales' | 'inventory';
      const columns = JSON.parse(storedColumns);
      
      setDataType(dataType);
      setAvailableColumns(columns);
      
      // Clear localStorage after use
      localStorage.removeItem('currentDataType');
      localStorage.removeItem('currentColumns');
    } catch (error) {
      console.error("Error parsing stored data:", error);
      setNoDataAvailable(true);
    }
  }, []);
  
  // Reset customer-specific fields when data type changes
  useEffect(() => {
    setCustomerType('');
    setStoreCode('');
  }, [dataType]);

  // Reset city when state changes
  useEffect(() => {
    setSelectedCity('');
  }, [selectedState]);

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleWeightRangeToggle = (range: string) => {
    if (selectedWeightRanges.includes(range)) {
      setSelectedWeightRanges(selectedWeightRanges.filter(r => r !== range));
    } else {
      setSelectedWeightRanges([...selectedWeightRanges, range]);
    }
  };

  // Check if a specific column type exists in available columns
  const hasColumnType = (columnType: string): boolean => {
    if (availableColumns.length === 0) return false;
    
    switch (columnType) {
      case 'time':
        return availableColumns.some(col => ['Year', 'Quarter', 'Month'].includes(col));
      case 'customer':
        return dataType === 'sales' 
          ? availableColumns.includes('CustomerType')
          : availableColumns.includes('StoreCode');
      case 'item':
        return availableColumns.some(col => ['Size', 'WeightRange', 'ProductCode'].includes(col));
      case 'geo':
        return availableColumns.some(col => ['State', 'City'].includes(col));
      default:
        return false;
    }
  };

  const handleApplyFilters = () => {
    let timeLevel = '[]';
    if (selectedYear && selectedMonth) {
      timeLevel = '["t.Thang"]';
    } else if (selectedYear && selectedQuarter) {
      timeLevel = '["t.Quy"]';
    } else if (selectedYear) {
      timeLevel = '["t.Nam"]';
    }

    let customerLevel = '[]';
    if (dataType === 'sales' && customerType) {
      customerLevel = '["LoaiKH"]';
    } else if (dataType === 'inventory' && storeCode) {
      customerLevel = '["s.MaCuaHang"]';
    }

    let itemLevel = '[]';
    if (itemCode) {
      itemLevel = '["i.MaMH"]';
    } else if (selectedSizes.length > 0 && selectedWeightRanges.length > 0) {
      itemLevel = '["i.KichCo", "WeightRange"]';
    } else if (selectedSizes.length > 0) {
      itemLevel = '["i.KichCo"]';
    } else if (selectedWeightRanges.length > 0) {
      itemLevel = '["WeightRange"]';
    }

    let geoLevel = '[]';
    if (selectedState && selectedCity) {
      geoLevel = '["g.Bang", "g.MaThanhPho"]';
    } else if (selectedState) {
      geoLevel = '["g.Bang"]';
    }

    // Create filters object to pass to the home page
    const filters = {
      dataType,
      time: {
        level: timeLevel,
        display: TIME_DIMENSIONS[timeLevel].display
      },
      customer: {
        level: customerLevel,
        display: dataType === 'sales' 
          ? CUSTOMER_DIMENSIONS.sales[customerLevel].display 
          : CUSTOMER_DIMENSIONS.inventory[customerLevel].display
      },
      item: {
        level: itemLevel,
        display: ITEM_DIMENSIONS[itemLevel].display
      },
      geo: {
        level: geoLevel,
        display: GEO_DIMENSIONS[geoLevel].display
      }
    };

    // Store filters in localStorage to pass to the home page
    localStorage.setItem('advancedFilters', JSON.stringify(filters));
    
    toast.success("Advanced filters applied");
    navigate('/');
  };

  // If no data is available, show a message
  if (noDataAvailable) {
    return (
      <div className="container py-8 px-4 mx-auto max-w-7xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">🔍 Advanced Dimension Filters</h1>
            <p className="text-gray-600">
              Fine-tune your data analysis by selecting specific dimensional attributes
            </p>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
          <h2 className="text-xl font-semibold mb-4">Please Apply Filters First</h2>
          <p className="text-gray-600 mb-6">
            To use advanced filters, you need to apply basic filters on the main dashboard first.
            This will determine which columns are available for advanced filtering.
          </p>
          <Button onClick={() => navigate('/')} className="px-8">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-2">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">🔍 Advanced Dimension Filters</h1>
          <p className="text-gray-600">
            Fine-tune your data analysis by selecting specific dimensional attributes
          </p>
        </div>
      </div>

      {/* Data Type Tabs (disabled, just for display) */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <Button 
          variant={dataType === 'sales' ? 'default' : 'outline'}
          className="py-6"
          disabled
        >
          📈 Sales Data
        </Button>
        <Button 
          variant={dataType === 'inventory' ? 'default' : 'outline'}
          className="py-6"
          disabled
        >
          📦 Inventory Data
        </Button>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <p className="text-blue-700 text-sm">
          Filtering data for columns: <span className="font-semibold">{availableColumns.join(', ')}</span>
        </p>
      </div>

      {/* Dimension Sections - Only show sections that match available columns */}
      <div className="space-y-8">
        {/* Time Dimension */}
        {hasColumnType('time') && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <CalendarClock className="h-6 w-6 text-time-main" />
              <h2 className="text-2xl font-semibold text-gray-800">Time Dimension</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="year">Year</Label>
                <select 
                  id="year" 
                  value={selectedYear === null ? '' : selectedYear.toString()}
                  onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Years</option>
                  {[2023, 2024, 2025, 2026, 2027].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              {availableColumns.includes('Quarter') && (
                <div>
                  <Label htmlFor="quarter">Quarter</Label>
                  <select 
                    id="quarter" 
                    value={selectedQuarter === null ? '' : selectedQuarter.toString()}
                    onChange={(e) => setSelectedQuarter(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                    disabled={!selectedYear}
                  >
                    <option value="">All Quarters</option>
                    {[1, 2, 3, 4].map(quarter => (
                      <option key={quarter} value={quarter}>Quarter {quarter}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {availableColumns.includes('Month') && (
                <div>
                  <Label htmlFor="month">Month</Label>
                  <select 
                    id="month" 
                    value={selectedMonth === null ? '' : selectedMonth.toString()}
                    onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                    disabled={!selectedYear}
                  >
                    <option value="">All Months</option>
                    {[
                      { value: 1, name: "January" },
                      { value: 2, name: "February" },
                      { value: 3, name: "March" },
                      { value: 4, name: "April" },
                      { value: 5, name: "May" },
                      { value: 6, name: "June" },
                      { value: 7, name: "July" },
                      { value: 8, name: "August" },
                      { value: 9, name: "September" },
                      { value: 10, name: "October" },
                      { value: 11, name: "November" },
                      { value: 12, name: "December" }
                    ].map(month => (
                      <option key={month.value} value={month.value}>{month.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer/Store Dimension */}
        {hasColumnType('customer') && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              {dataType === 'sales' 
                ? <Users className="h-6 w-6 text-customer-main" />
                : <Store className="h-6 w-6 text-customer-main" />
              }
              <h2 className="text-2xl font-semibold text-gray-800">
                {dataType === 'sales' ? 'Customer Dimension' : 'Store Dimension'}
              </h2>
            </div>

            {dataType === 'sales' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="customerType">Customer Type</Label>
                  <select 
                    id="customerType" 
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Customer Types</option>
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="storeCode">Store Code</Label>
                  <select 
                    id="storeCode" 
                    value={storeCode}
                    onChange={(e) => setStoreCode(e.target.value)}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Store Codes</option>
                    <option value="ST001">ST001</option>
                    <option value="ST002">ST002</option>
                    <option value="ST003">ST003</option>
                    <option value="ST004">ST004</option>
                    <option value="ST005">ST005</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Item Dimension */}
        {hasColumnType('item') && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-6 w-6 text-item-main" />
              <h2 className="text-2xl font-semibold text-gray-800">Item Dimension</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableColumns.includes('ProductCode') && (
                <div>
                  <Label htmlFor="itemCode">Item Code</Label>
                  <select 
                    id="itemCode" 
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Items</option>
                    <option value="IT001">IT001</option>
                    <option value="IT002">IT002</option>
                    <option value="IT003">IT003</option>
                    <option value="IT004">IT004</option>
                    <option value="IT005">IT005</option>
                  </select>
                </div>
              )}
              
              {availableColumns.includes('Size') && (
                <div>
                  <Label className="block mb-2">Size</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div key="all-sizes" className="flex items-center space-x-2">
                      <Checkbox 
                        id="all-sizes" 
                        checked={selectedSizes.length === 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSizes([]);
                          }
                        }}
                      />
                      <Label htmlFor="all-sizes" className="text-sm">All Sizes</Label>
                    </div>
                    {availableSizes.map(size => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`size-${size}`} 
                          checked={selectedSizes.includes(size)}
                          onCheckedChange={() => handleSizeToggle(size)}
                        />
                        <Label htmlFor={`size-${size}`} className="text-sm">{size}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {availableColumns.includes('WeightRange') && (
                <div>
                  <Label className="block mb-2">Weight Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div key="all-weights" className="flex items-center space-x-2">
                      <Checkbox 
                        id="all-weights" 
                        checked={selectedWeightRanges.length === 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedWeightRanges([]);
                          }
                        }}
                      />
                      <Label htmlFor="all-weights" className="text-sm">All Weights</Label>
                    </div>
                    {availableWeightRanges.map(range => (
                      <div key={range} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`weight-${range}`} 
                          checked={selectedWeightRanges.includes(range)}
                          onCheckedChange={() => handleWeightRangeToggle(range)}
                        />
                        <Label htmlFor={`weight-${range}`} className="text-sm">{range}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Geography Dimension */}
        {hasColumnType('geo') && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="h-6 w-6 text-geo-main" />
              <h2 className="text-2xl font-semibold text-gray-800">Geography Dimension</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All States</option>
                  {availableStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              {availableColumns.includes('City') && (
                <div>
                  <Label htmlFor="city">City</Label>
                  <select
                    id="city"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                    disabled={!selectedState}
                  >
                    <option value="">All Cities</option>
                    {selectedState && availableCities[selectedState as keyof typeof availableCities]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <div className="mt-8">
        <Button onClick={handleApplyFilters} className="w-full py-6" size="lg">
          🚀 Apply Advanced Filters
        </Button>
      </div>
    </div>
  );
};

export default AdvancedFilters;
