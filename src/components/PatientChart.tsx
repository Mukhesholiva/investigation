import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GuestChartProps {
  data: any[];
}

export function GuestChart({ data }: GuestChartProps) {
  const chartData = [
    { name: 'Jan', Guests: 65 },
    { name: 'Feb', Guests: 59 },
    { name: 'Mar', Guests: 80 },
    { name: 'Apr', Guests: 81 },
    { name: 'May', Guests: 56 },
    { name: 'Jun', Guests: 55 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Volume</CardTitle>
        <CardDescription>Monthly Guest registration trends</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Guests" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
