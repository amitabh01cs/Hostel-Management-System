import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Ground Floor", occupancy: 95 },
  { name: "Floor 1", occupancy: 75 },
  { name: "Floor 2", occupancy: 85 },
  { name: "Floor ", occupancy: 60 },
];

const OccupancyChart = () => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Room Occupancy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis 
                domain={[0, 100]} 
                tickCount={6} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                width={45}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Occupancy']}
                labelStyle={{ color: '#333', fontWeight: 500 }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey="occupancy" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                barSize={40}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OccupancyChart;
