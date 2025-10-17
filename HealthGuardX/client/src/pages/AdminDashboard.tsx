import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Activity, 
  FileCheck, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  TrendingUp
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { isAdmin, isConnected } = useWeb3();

  // Fetch system stats
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
  });

  // Fetch KYC queue
  const { data: kycQueue } = useQuery({
    queryKey: ["/api/admin/kyc-queue"],
    enabled: isAdmin,
  });

  // Fetch role applications
  const { data: roleApplications } = useQuery({
    queryKey: ["/api/admin/role-applications"],
    enabled: isAdmin,
  });

  // Fetch recent events
  const { data: recentEvents } = useQuery({
    queryKey: ["/api/admin/events"],
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  // Approve KYC mutation
  const approveKYC = useMutation({
    mutationFn: (data: { wallet: string; approved: boolean }) =>
      apiRequest("POST", "/api/admin/approve-kyc", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/kyc-queue"] });
    },
  });

  // Approve role mutation
  const approveRole = useMutation({
    mutationFn: (data: { id: string; approved: boolean }) =>
      apiRequest("POST", "/api/admin/approve-role", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/role-applications"] });
    },
  });

  const chartData = [
    { name: 'Mon', patients: 12, claims: 5, emergencies: 2 },
    { name: 'Tue', patients: 19, claims: 8, emergencies: 1 },
    { name: 'Wed', patients: 15, claims: 12, emergencies: 3 },
    { name: 'Thu', patients: 22, claims: 6, emergencies: 0 },
    { name: 'Fri', patients: 18, claims: 15, emergencies: 4 },
    { name: 'Sat', patients: 8, claims: 3, emergencies: 1 },
    { name: 'Sun', patients: 5, claims: 2, emergencies: 0 },
  ];

  const roleDistribution = [
    { name: 'Patients', value: stats?.totalPatients || 0, color: '#3b82f6' },
    { name: 'Doctors', value: stats?.totalDoctors || 0, color: '#06b6d4' },
    { name: 'Hospitals', value: stats?.totalHospitals || 0, color: '#f97316' },
    { name: 'Insurers', value: stats?.totalInsurers || 0, color: '#10b981' },
  ];

  if (!isConnected || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-heading font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Admin privileges required to access this dashboard</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">System oversight and governance</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" data-testid="button-pause-system">
              <Pause className="w-4 h-4 mr-2" />
              Pause System
            </Button>
            <Button variant="outline">
              Export Logs
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold mt-1" data-testid="text-total-users">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +12% this week
                  </p>
                </div>
                <Users className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Patients</p>
                  <p className="text-3xl font-bold mt-1" data-testid="text-active-patients">{stats?.activePatients || 0}</p>
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +8% this week
                  </p>
                </div>
                <Activity className="w-10 h-10 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Claims</p>
                  <p className="text-3xl font-bold mt-1" data-testid="text-pending-claims">{stats?.pendingClaims || 0}</p>
                  <p className="text-xs text-yellow-500 mt-1">Requires review</p>
                </div>
                <FileCheck className="w-10 h-10 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Events</p>
                  <p className="text-3xl font-bold mt-1" data-testid="text-emergency-events">{stats?.emergencyEvents || 0}</p>
                  <p className="text-xs text-red-500 mt-1">Last 24h</p>
                </div>
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                  <Bar dataKey="patients" fill="#3b82f6" />
                  <Bar dataKey="claims" fill="#06b6d4" />
                  <Bar dataKey="emergencies" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {roleDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KYC Approval Queue */}
        <Card>
          <CardHeader>
            <CardTitle>KYC Approval Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Role Type</TableHead>
                  <TableHead>KYC Document</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycQueue && kycQueue.length > 0 ? (
                  kycQueue.map((item: any) => (
                    <TableRow key={item.id} data-testid={`kyc-row-${item.id}`}>
                      <TableCell className="font-mono text-sm">
                        {item.wallet.slice(0, 6)}...{item.wallet.slice(-4)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.roleType || 'patient'} />
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="text-primary">
                          View CID
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveKYC.mutate({ wallet: item.wallet, approved: true })}
                            data-testid={`button-approve-${item.id}`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveKYC.mutate({ wallet: item.wallet, approved: false })}
                            data-testid={`button-reject-${item.id}`}
                          >
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No pending KYC submissions
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Role Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Role Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Role Requested</TableHead>
                  <TableHead>License/Institution</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roleApplications && roleApplications.length > 0 ? (
                  roleApplications.map((app: any) => (
                    <TableRow key={app.id} data-testid={`role-app-${app.id}`}>
                      <TableCell className="font-mono text-sm">
                        {app.wallet.slice(0, 6)}...{app.wallet.slice(-4)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={app.roleType} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {app.licenseNumber || app.institutionName || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveRole.mutate({ id: app.id, approved: true })}
                            data-testid={`button-approve-role-${app.id}`}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveRole.mutate({ id: app.id, approved: false })}
                            data-testid={`button-reject-role-${app.id}`}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No pending role applications
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Real-Time System Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentEvents && recentEvents.length > 0 ? (
                recentEvents.map((event: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border border-border hover-elevate"
                    data-testid={`event-${index}`}
                  >
                    <Activity className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.eventName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">View</Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent system events</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
