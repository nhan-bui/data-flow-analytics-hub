
import React from 'react';
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
  Cell,
  TooltipProps
} from 'recharts';
import { ChartType, CHART_COLORS, getXAxisKey, getValueField, formatNumber } from '@/utils/chartUtils';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { SearchX } from 'lucide-react';

interface DataVisualizationProps {
  data: any[] | null;
  chartType: ChartType;
  dataType: 'sales' | 'inventory';
  title?: string;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-80">
    <SearchX className="h-16 w-16 text-gray-300 mb-4" />
    <h3 className="text-xl font-medium text-gray-600 mb-2">No Data to Display</h3>
    <p className="text-gray-500 text-center max-w-md">
      Select dimension options and click <strong>Apply Filters</strong> to visualize your data.
    </p>
  </div>
);

const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  chartType,
  dataType,
  title = 'Data Visualization'
}) => {
  // If no data provided, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <EmptyState />
      </div>
    );
  }

  // Get the field name for the value based on data type
  const valueField = getValueField(dataType);
  const valueFieldTitle = dataType === 'sales' ? 'Revenue' : 'Stock Level';
  
  // Get the field name for the X-axis from the data
  const xAxisField = getXAxisKey(data);
  
  // Render table view
  const renderTable = () => (
    <div className="data-table w-full overflow-auto">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            {Object.keys(data[0]).map((key) => (
              <TableHead key={key} className={key === valueField ? 'text-right' : ''}>
                {key === valueField ? valueFieldTitle : key}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {Object.entries(row).map(([key, value]) => (
                <TableCell key={key} className={key === valueField ? 'text-right font-medium' : ''}>
                  {key === valueField && typeof value === 'number' 
                    ? new Intl.NumberFormat('en-US').format(value as number) 
                    : String(value)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="text-xs text-gray-500 p-2">
        Showing {data.length} record(s)
      </div>
    </div>
  );

  // Render bar chart
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey={xAxisField} 
          angle={-45} 
          textAnchor="end" 
          height={70} 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={formatNumber} 
          tick={{ fontSize: 12 }}
          label={{ 
            value: valueFieldTitle, 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' },
            dy: 50
          }} 
        />
        <Tooltip 
          formatter={(value) => [new Intl.NumberFormat('en-US').format(value as number), valueFieldTitle]}
          labelFormatter={(label) => xAxisField + ': ' + label}
        />
        <Legend />
        <Bar 
          dataKey={valueField} 
          fill={CHART_COLORS[0]} 
          name={valueFieldTitle} 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );

  // Render line chart
  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xAxisField} 
          angle={-45} 
          textAnchor="end" 
          height={70} 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={formatNumber} 
          tick={{ fontSize: 12 }}
          label={{ 
            value: valueFieldTitle, 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' },
            dy: 50
          }}
        />
        <Tooltip 
          formatter={(value) => [new Intl.NumberFormat('en-US').format(value as number), valueFieldTitle]}
          labelFormatter={(label) => xAxisField + ': ' + label}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey={valueField} 
          stroke={CHART_COLORS[0]} 
          name={valueFieldTitle} 
          strokeWidth={2} 
          dot={{ r: 4 }} 
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  // Render pie chart
  const renderPieChart = () => {
    // Filter out any non-positive values for pie chart
    const pieData = data.filter(item => Number(item[valueField]) > 0);
    
    // If no positive data, return message
    if (pieData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-80">
          <p className="text-gray-500">No positive values available for pie chart.</p>
        </div>
      );
    }
    
    // If too many segments, show warning
    const tooManySegments = pieData.length > 10;
    
    return (
      <>
        {tooManySegments && (
          <div className="bg-amber-50 text-amber-800 p-2 rounded mb-4 text-sm">
            Pie chart may be less effective with {pieData.length} categories. Consider Bar chart or more filters.
          </div>
        )}
        <ResponsiveContainer width="100%" height={400}>
          <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={130}
              innerRadius={40}
              fill="#8884d8"
              dataKey={valueField}
              nameKey={xAxisField}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [new Intl.NumberFormat('en-US').format(value as number), valueFieldTitle]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </>
    );
  };

  // Render the appropriate chart based on the chart type
  const renderVisualization = () => {
    switch (chartType) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      case 'table':
      default:
        return renderTable();
    }
  };

  return (
    <div className="chart-container">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {renderVisualization()}
    </div>
  );
};

export default DataVisualization;
