import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryData {
  category: string;
  total: number;
  count: number;
}

interface MonthlyData {
  month: string;
  total: number;
}

interface ReportChartProps {
  categoryData: CategoryData[];
  monthlyData: MonthlyData[];
  chartRef: React.RefObject<HTMLDivElement | null>;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export const ReportChart = ({ categoryData, monthlyData, chartRef }: ReportChartProps) => {
  const pieData = categoryData.slice(0, 8).map((item, index) => ({
    name: item.category,
    value: item.total,
    color: COLORS[index % COLORS.length],
  }));

  const barData = monthlyData.filter(m => m.total > 0);

  return (
    <div 
      ref={chartRef} 
      className="bg-card p-6 rounded-lg space-y-8"
      style={{ width: '800px', minHeight: '500px' }}
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-foreground mb-2">Financial Overview Charts</h3>
        <p className="text-sm text-muted-foreground">Visual representation of your expenses</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Pie Chart - Category Distribution */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-center text-foreground">Expenses by Category</h4>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No category data available
            </div>
          )}
        </div>

        {/* Bar Chart - Monthly Expenses */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-center text-foreground">Monthly Expenses</h4>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                  tickFormatter={(value) => value.substring(0, 3)}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No monthly data available
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {pieData.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-border">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
