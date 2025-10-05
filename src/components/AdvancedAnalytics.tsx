import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export const AdvancedAnalytics = () => {
  const { data: salesByDay, isLoading: isLoadingSales } = useQuery({
    queryKey: ["salesByDay"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_investments")
        .select("created_at, amount_usd")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by day
      const grouped = data.reduce((acc: any, inv: any) => {
        const date = new Date(inv.created_at).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = { date, sales: 0, volume: 0 };
        }
        acc[date].sales += 1;
        acc[date].volume += Number(inv.amount_usd || 0);
        return acc;
      }, {});

      return Object.values(grouped).slice(-30); // Last 30 days
    },
  });

  const { data: projectStats, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projectStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("name, raised_amount, goal_amount, status");

      if (error) throw error;

      return data.map((p: any) => ({
        name: p.name,
        raised: Number(p.raised_amount || 0),
        goal: Number(p.goal_amount || 0),
        progress: Math.min((Number(p.raised_amount || 0) / Number(p.goal_amount || 1)) * 100, 100),
      }));
    },
  });

  const { data: countryStats, isLoading: isLoadingCountries } = useQuery({
    queryKey: ["countryStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kyc_submissions")
        .select("country");

      if (error) throw error;

      const grouped = data.reduce((acc: any, kyc: any) => {
        const country = kyc.country || "Unknown";
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(grouped)
        .map(([country, count]) => ({ country, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10);
    },
  });

  const { data: statusDistribution } = useQuery({
    queryKey: ["statusDistribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("status");

      if (error) throw error;

      const grouped = data.reduce((acc: any, p: any) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(grouped).map(([status, count]) => ({
        name: status,
        value: count,
      }));
    },
  });

  if (isLoadingSales || isLoadingProjects || isLoadingCountries) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="sales" className="space-y-4">
      <TabsList>
        <TabsTrigger value="sales">Sales Trend</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="geography">Geography</TabsTrigger>
        <TabsTrigger value="distribution">Distribution</TabsTrigger>
      </TabsList>

      <TabsContent value="sales" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Sales Volume (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  stroke={COLORS[0]}
                  fill={COLORS[0]}
                  fillOpacity={0.6}
                  name="Number of Sales"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="volume"
                  stroke={COLORS[1]}
                  fill={COLORS[1]}
                  fillOpacity={0.6}
                  name="Volume (USD)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="projects" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Funding Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="raised" fill={COLORS[0]} name="Raised (USD)" />
                <Bar dataKey="goal" fill={COLORS[1]} name="Goal (USD)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="geography" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Countries (by KYC)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS[2]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="distribution" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
