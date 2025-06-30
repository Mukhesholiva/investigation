import React, { useMemo, useState, useRef } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, FileText, PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

// --- Helper Functions ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
        <p className="font-bold">{label}</p>
        <p style={{ color: payload[0].color }}>{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// --- Main Component ---
export default function Dashboard() {
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [popoverCenters, setPopoverCenters] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { user } = useAuth();
  const [openModal, setOpenModal] = useState<null | 'revenue' | 'clients' | 'tests'>(null);

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Use user.centers as fallback for initial fetch
  const initialCenters = user?.centers || [];
  const { data: investigationData, isLoading } = useQuery({
    queryKey: ['investigations', selectedCenters.length === 0 ? initialCenters : selectedCenters],
    queryFn: () => apiService.getInvestigations(selectedCenters.length === 0 ? initialCenters : selectedCenters),
    enabled: (selectedCenters.length > 0 || initialCenters.length > 0),
  });

  // Always get all unique centers from the full investigations data
  const centerOptions = useMemo(() => {
    if (!investigationData) return [];
    const centersSet = new Set<string>();
    investigationData.investigations.forEach((inv: any) => {
      if (inv.Center) centersSet.add(inv.Center);
    });
    return Array.from(centersSet).sort();
  }, [investigationData]);

  // Popover selection logic
  const allPopoverSelected = popoverCenters.length === 0 || popoverCenters.length === centerOptions.length;
  const togglePopoverCenter = (center: string) => {
    if (popoverCenters.includes(center)) {
      setPopoverCenters(popoverCenters.filter((c) => c !== center));
    } else {
      setPopoverCenters([...popoverCenters, center]);
    }
  };
  const toggleAllPopoverCenters = () => {
    if (allPopoverSelected) {
      setPopoverCenters([]);
    } else {
      setPopoverCenters(centerOptions);
    }
  };
  // When popover opens, sync popoverCenters with selectedCenters
  const handlePopoverOpenChange = (open: boolean) => {
    setPopoverOpen(open);
    if (open) {
      setPopoverCenters(selectedCenters);
    }
  };
  // Apply button handler
  const handleApplyCenters = () => {
    setSelectedCenters(popoverCenters);
    setPopoverOpen(false);
  };

  const processedData = useMemo(() => {
    if (!investigationData) return null;
    const { investigations, crt_value_data, daywise_clients, mom_clients, total_clients } = investigationData;
    // Filter investigations by selected center
    let filteredInvestigations = selectedCenters.length === 0
      ? investigations
      : investigations.filter((inv: any) => selectedCenters.includes(inv.Center));
    // Filter by date range
    if (fromDate) {
      const from = new Date(fromDate);
      filteredInvestigations = filteredInvestigations.filter((inv: any) => new Date(inv.Date) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      filteredInvestigations = filteredInvestigations.filter((inv: any) => new Date(inv.Date) <= to);
    }

    // 1. Calculate Total Revenue (deduplicated by GuestCode)
    const uniqueGuests = new Map<string, number>();
    filteredInvestigations.forEach((inv: any) => {
      if (!uniqueGuests.has(inv.GuestCode)) {
        uniqueGuests.set(inv.GuestCode, parseFloat(inv.itemValue));
      }
    });
    const totalRevenue = Array.from(uniqueGuests.values()).reduce((acc, val) => acc + val, 0);

    // 2. Total Tests
    const totalTests = filteredInvestigations.length;

    // 3. Test Distribution Data for Pie Chart
    const testCounts = filteredInvestigations.reduce((acc: any, curr: any) => {
      acc[curr.ItemName] = (acc[curr.ItemName] || 0) + 1;
      return acc;
    }, {});
    const testDistribution = Object.entries(testCounts)
        .map(([name, value]) => ({ name, value: value as number }))
        .sort((a, b) => b.value - a.value);

    // 4. Revenue by Employee for Pie Chart
    const employeeRevenue = crt_value_data.map((item: any) => ({
      name: item.employee_name.replace("CRT ", ""),
      value: item.amount
    }));

    // Filter daywiseClients and momClients if needed (if they are per center)
    // For now, use as is

    // Unique clients for this center
    const uniqueClients = filteredInvestigations.reduce((acc: any, inv: any) => {
      if (!acc.some((c: any) => c.GuestCode === inv.GuestCode)) {
        acc.push(inv);
      }
      return acc;
    }, []);

    // Revenue per client for this center
    const revenueClients = filteredInvestigations.reduce((acc: any, inv: any) => {
      if (!acc.some((c: any) => c.GuestCode === inv.GuestCode)) {
        acc.push({ ...inv, amount: parseFloat(inv.itemValue) });
      }
      return acc;
    }, []);

    return {
      totalRevenue,
      totalClients: uniqueClients.length,
      totalTests,
      testDistribution,
      employeeRevenue,
      daywiseClients: daywise_clients,
      momClients: mom_clients,
      uniqueClients,
      revenueClients,
      allTests: filteredInvestigations,
    };
  }, [investigationData, selectedCenters, fromDate, toDate]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
            <p>Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!processedData) {
    return (
        <DashboardLayout>
            <div className="flex justify-center items-center h-full">
                <p>No data available for the selected centers.</p>
            </div>
        </DashboardLayout>
    );
  }
  
  const { totalRevenue, totalClients, totalTests, testDistribution, employeeRevenue, daywiseClients, momClients } = processedData;

  // Pie chart: show only top 8 employees, group rest as 'Others'
  const topN = 8;
  let pieData = employeeRevenue;
  if (employeeRevenue.length > topN) {
    const sorted = [...employeeRevenue].sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, topN);
    const othersValue = sorted.slice(topN).reduce((acc, cur) => acc + cur.value, 0);
    pieData = [...top, { name: 'Others', value: othersValue }];
  }

  return (
    <DashboardLayout>
        <div className="space-y-8 animate-fade-in">
          {/* Center Multi-Select Dropdown and Date Filters */}
          <div className="flex flex-col md:flex-row justify-end gap-4 items-center">
            <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full max-w-xs flex justify-between items-center">
                  <span>
                    {allPopoverSelected
                      ? 'All Centers'
                      : popoverCenters.length === 0
                        ? 'Select Center(s)'
                        : popoverCenters.join(', ')}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="flex items-center mb-2">
                  <Checkbox id="all-centers" checked={allPopoverSelected} onCheckedChange={toggleAllPopoverCenters} />
                  <label htmlFor="all-centers" className="ml-2 text-sm cursor-pointer select-none">All Centers</label>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {centerOptions.map((center) => (
                    <div key={center} className="flex items-center mb-1">
                      <Checkbox
                        id={`center-${center}`}
                        checked={allPopoverSelected || popoverCenters.includes(center)}
                        onCheckedChange={() => togglePopoverCenter(center)}
                      />
                      <label htmlFor={`center-${center}`} className="ml-2 text-sm cursor-pointer select-none">{center}</label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <Button size="sm" onClick={handleApplyCenters}>
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                max={toDate || undefined}
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">To:</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                min={fromDate || undefined}
              />
            </div>
          </div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Dialog open={openModal === 'revenue'} onOpenChange={v => setOpenModal(v ? 'revenue' : null)}>
              <DialogTrigger asChild>
                <Card className="bg-white shadow-lg border-l-4 border-green-500 cursor-pointer hover:shadow-xl transition" onClick={() => setOpenModal('revenue')}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">Total earnings from all clients</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Revenue by Client</DialogTitle>
                  <DialogDescription>List of unique clients and their total paid amount.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[400px] overflow-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Guest Code</th>
                        <th className="text-left p-2">Phone</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-right p-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.revenueClients.map((c: any) => (
                        <tr key={c.GuestCode} className="border-b hover:bg-gray-50">
                          <td className="p-2">{c.GuestName}</td>
                          <td className="p-2">{c.GuestCode}</td>
                          <td className="p-2">{c.Phone}</td>
                          <td className="p-2">{c.email}</td>
                          <td className="p-2 text-right">{formatCurrency(c.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={openModal === 'clients'} onOpenChange={v => setOpenModal(v ? 'clients' : null)}>
              <DialogTrigger asChild>
                <Card className="bg-white shadow-lg border-l-4 border-blue-500 cursor-pointer hover:shadow-xl transition" onClick={() => setOpenModal('clients')}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Clients</CardTitle>
                    <Users className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalClients.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Unique clients served</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Unique Clients</DialogTitle>
                  <DialogDescription>List of all unique clients and their details.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[400px] overflow-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Guest Code</th>
                        <th className="text-left p-2">Phone</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Gender</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.uniqueClients.map((c: any) => (
                        <tr key={c.GuestCode} className="border-b hover:bg-gray-50">
                          <td className="p-2">{c.GuestName}</td>
                          <td className="p-2">{c.GuestCode}</td>
                          <td className="p-2">{c.Phone}</td>
                          <td className="p-2">{c.email}</td>
                          <td className="p-2">{c.Gender}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={openModal === 'tests'} onOpenChange={v => setOpenModal(v ? 'tests' : null)}>
              <DialogTrigger asChild>
                <Card className="bg-white shadow-lg border-l-4 border-amber-500 cursor-pointer hover:shadow-xl transition" onClick={() => setOpenModal('tests')}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Tests</CardTitle>
                    <FileText className="h-5 w-5 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalTests.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total investigations performed</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>All Test Records</DialogTitle>
                  <DialogDescription>List of all test records with client and test details.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[400px] overflow-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Guest Code</th>
                        <th className="text-left p-2">Test</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Phone</th>
                        <th className="text-left p-2">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.allTests.map((t: any, i: number) => (
                        <tr key={t.ID + '-' + i} className="border-b hover:bg-gray-50">
                          <td className="p-2">{t.GuestName}</td>
                          <td className="p-2">{t.GuestCode}</td>
                          <td className="p-2">{t.ItemName}</td>
                          <td className="p-2">{t.Date?.slice(0, 10)}</td>
                          <td className="p-2">{t.Phone}</td>
                          <td className="p-2">{t.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader className="flex items-center gap-2">
                <PieChartIcon className="text-gray-600" />
                <CardTitle>Revenue by Employee</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {pieData.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="flex items-center gap-2">
                <BarChartIcon className="text-gray-600" />
                <CardTitle>Top 5 Tests Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={testDistribution.slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="value" name="Count" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="flex items-center gap-2">
                <BarChartIcon className="text-gray-600" />
                <CardTitle>Day-wise Client Count</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={daywiseClients}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="client_count" name="Clients" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="flex items-center gap-2">
                <LineChartIcon className="text-gray-600" />
                <CardTitle>Month-on-Month Client Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={momClients}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="client_count" name="Clients" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
    </DashboardLayout>
  );
}
