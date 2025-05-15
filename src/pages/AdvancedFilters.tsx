
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

      {/* Data Type Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <Button 
          onClick={() => setDataType('sales')}
          variant={dataType === 'sales' ? 'default' : 'outline'}
          className="py-6"
        >
          📈 Sales Data
        </Button>
        <Button 
          onClick={() => setDataType('inventory')}
          variant={dataType === 'inventory' ? 'default' : 'outline'}
          className="py-6"
        >
          📦 Inventory Data
        </Button>
      </div>

      {/* Dimension Sections */}
      <div className="space-y-8">
        {/* Time Dimension */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CalendarClock className="h-6 w-6 text-time-main" />
            <h2 className="text-2xl font-semibold text-gray-800">Time Dimension</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="year">Year</Label>
              <Input 
                id="year" 
                type="number" 
                placeholder="e.g. 2025" 
                min="2000" 
                max="2030"
                value={selectedYear || ''}
                onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="quarter">Quarter</Label>
              <Input 
                id="quarter" 
                type="number" 
                placeholder="1-4" 
                min="1" 
                max="4"
                value={selectedQuarter || ''}
                onChange={(e) => setSelectedQuarter(e.target.value ? parseInt(e.target.value) : null)}
                className="mt-2"
                disabled={!selectedYear}
              />
            </div>
            <div>
              <Label htmlFor="month">Month</Label>
              <Input 
                id="month" 
                type="number" 
                placeholder="1-12" 
                min="1" 
                max="12"
                value={selectedMonth || ''}
                onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
                className="mt-2"
                disabled={!selectedYear}
              />
            </div>
          </div>
        </div>

        {/* Customer/Store Dimension */}
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
                <Input 
                  id="customerType" 
                  placeholder="Enter customer type" 
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="storeCode">Store Code</Label>
                <Input 
                  id="storeCode" 
                  placeholder="Enter store code" 
                  value={storeCode}
                  onChange={(e) => setStoreCode(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Item Dimension */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Package className="h-6 w-6 text-item-main" />
            <h2 className="text-2xl font-semibold text-gray-800">Item Dimension</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="itemCode">Item Code</Label>
              <Input 
                id="itemCode" 
                placeholder="Enter item code" 
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="block mb-2">Size</Label>
              <div className="grid grid-cols-3 gap-2">
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
            
            <div>
              <Label className="block mb-2">Weight Range</Label>
              <div className="grid grid-cols-2 gap-2">
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
          </div>
        </div>

        {/* Geography Dimension */}
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
                <option value="">Select a state</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <select
                id="city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                disabled={!selectedState}
              >
                <option value="">Select a city</option>
                {selectedState && availableCities[selectedState as keyof typeof availableCities]?.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
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
