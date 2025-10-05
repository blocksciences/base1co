import { useEffect, useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ScatterChart, Scatter,
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, FunnelChart, Funnel, LabelList
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Globe, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const AdvancedAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeMetric, setActiveMetric] = useState<'volume' | 'transactions'>('volume');

  // Real-time metrics
  const { data: realTimeMetrics, refetch: refetchRealTime } = useQuery({
    queryKey: ['realTimeMetrics'],
    queryFn: async () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);

      const { data, error } = await supabase
        .from('user_investments')
        .select('wallet_address, amount_usd')
        .gte('created_at', oneMinuteAgo.toISOString());

      if (error) throw error;

      const uniqueUsers = new Set(data.map(i => i.wallet_address)).size;
      const totalUsd = data.reduce((sum, i) => sum + Number(i.amount_usd || 0), 0);
      const avgTransaction = data.length > 0 ? totalUsd / data.length : 0;

      return {
        activeUsers: uniqueUsers,
        tokensPerMinute: data.length,
        usdPerMinute: totalUsd,
        avgTransactionSize: avgTransaction,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Sales trend
  const { data: salesTrend, isLoading: isLoadingSales } = useQuery({
    queryKey: ['salesTrend', timeRange],
    queryFn: async () => {
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('user_investments')
        .select('created_at, amount_usd, wallet_address')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const grouped = data.reduce((acc: any, inv: any) => {
        const timestamp = new Date(inv.created_at).toISOString().split('T')[0];
        if (!acc[timestamp]) {
          acc[timestamp] = { timestamp, transactions: 0, volume: 0, users: new Set() };
        }
        acc[timestamp].transactions += 1;
        acc[timestamp].volume += Number(inv.amount_usd || 0);
        acc[timestamp].users.add(inv.wallet_address);
        return acc;
      }, {});

      return Object.values(grouped).map((item: any) => ({
        ...item,
        uniqueUsers: item.users.size,
        users: undefined,
      }));
    },
  });

  // Conversion funnel
  const { data: conversionFunnel } = useQuery({
    queryKey: ['conversionFunnel'],
    queryFn: async () => {
      const [profiles, kyc, investments] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('kyc_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('user_investments').select('wallet_address').then(r => ({
          ...r,
          count: new Set(r.data?.map(i => i.wallet_address)).size
        })),
      ]);

      const total = profiles.count || 1;
      return [
        { stage: 'Registered', users: profiles.count || 0, conversion: 100 },
        { stage: 'KYC Submitted', users: kyc.count || 0, conversion: ((kyc.count || 0) / total) * 100 },
        { stage: 'Invested', users: investments.count || 0, conversion: ((investments.count || 0) / total) * 100 },
      ];
    },
  });

  // Country distribution
  const { data: countryStats } = useQuery({
    queryKey: ['countryStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kyc_submissions')
        .select('country');

      if (error) throw error;

      const grouped = data.reduce((acc: any, kyc: any) => {
        const country = kyc.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});

      const total = data.length;
      return Object.entries(grouped)
        .map(([country, count]: [string, any]) => ({
          country,
          investors: count,
          percentage: (count / total) * 100,
        }))
        .sort((a, b) => b.investors - a.investors)
        .slice(0, 10);
    },
  });

  // Hourly activity
  const { data: hourlyActivity } = useQuery({
    queryKey: ['hourlyActivity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_investments')
        .select('created_at, wallet_address')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const hourly = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        transactions: 0,
        users: new Set(),
      }));

      data.forEach((inv: any) => {
        const hour = new Date(inv.created_at).getHours();
        hourly[hour].transactions += 1;
        hourly[hour].users.add(inv.wallet_address);
      });

      return hourly.map(h => ({
        hour: h.hour,
        transactions: h.transactions,
        users: h.users.size,
      }));
    },
  });

  // KYC status distribution
  const { data: kycDistribution } = useQuery({
    queryKey: ['kycDistribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kyc_submissions')
        .select('status');

      if (error) throw error;

      const grouped = data.reduce((acc: any, kyc: any) => {
        acc[kyc.status] = (acc[kyc.status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(grouped).map(([status, count]) => ({
        status,
        count,
      }));
    },
  });

  const exportData = () => {
    const data = {
      salesTrend,
      conversionFunnel,
      countryStats,
      hourlyActivity,
      kycDistribution,
      realTimeMetrics,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.json`;
    a.click();
  };

  if (isLoadingSales) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportData} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeMetrics?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Last minute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transactions/Min</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeMetrics?.tokensPerMinute || 0}</div>
            <p className="text-xs text-muted-foreground">Real-time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Volume/Min</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${realTimeMetrics?.usdPerMinute?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${realTimeMetrics?.avgTransactionSize?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Per purchase</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Trend</TabsTrigger>
          <TabsTrigger value="funnel">Conversion</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="kyc">KYC Status</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Volume & Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="volume"
                    fill={COLORS[0]}
                    stroke={COLORS[0]}
                    fillOpacity={0.6}
                    name="Volume (USD)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="transactions"
                    stroke={COLORS[1]}
                    name="Transactions"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="uniqueUsers"
                    stroke={COLORS[2]}
                    name="Unique Users"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle>User Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel
                    dataKey="users"
                    data={conversionFunnel}
                    isAnimationActive
                  >
                    <LabelList position="right" fill="#000" stroke="none" dataKey="stage" />
                    {conversionFunnel?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle>Top Countries by Investors</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={countryStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="investors" fill={COLORS[0]} name="Investors" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity Pattern (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" label={{ value: 'Hour (UTC)', position: 'insideBottom', offset: -5 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    stroke={COLORS[0]}
                    fill={COLORS[0]}
                    fillOpacity={0.6}
                    name="Transactions"
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke={COLORS[1]}
                    fill={COLORS[1]}
                    fillOpacity={0.6}
                    name="Unique Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc">
          <Card>
            <CardHeader>
              <CardTitle>KYC Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={kycDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {kycDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
