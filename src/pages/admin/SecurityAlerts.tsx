import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSecurity } from '@/hooks/useSecurity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { AlertTriangle, CheckCircle, Clock, Download, Filter, RefreshCw, Search, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { SecurityMetricsCards } from '@/components/admin/SecurityMetricsCards';
import { SecurityAlertDetails } from '@/components/admin/SecurityAlertDetails';
import { SecuritySettingsPanel } from '@/components/admin/SecuritySettingsPanel';

export default function SecurityAlerts() {
  const [activeTab, setActiveTab] = useState('alerts');
  const {
    alerts,
    totalAlerts,
    isLoadingAlerts,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    selectedAlertId,
    setSelectedAlertId,
    selectedAlert,
    isLoadingAlertDetails,
    resolveAlert,
    isResolvingAlert,
    metrics,
    isLoadingMetrics,
    timeRange,
    setTimeRange,
    settings,
    isLoadingSettings,
    updateSettings,
    isUpdatingSettings
  } = useSecurity();

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  // Handle date range change
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setFilters(prev => ({
      ...prev,
      startDate: range.from || undefined,
      endDate: range.to || undefined
    }));
    setPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="bg-red-500">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  // Get alert type icon
  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case 'failed_login_attempt':
      case 'brute_force_attempt':
        return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case 'suspicious_login_location':
      case 'unusual_activity':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'permission_violation':
      case 'api_abuse':
        return <Shield className="h-4 w-4 text-destructive" />;
      case 'data_access_anomaly':
        return <Shield className="h-4 w-4 text-warning" />;
      case 'configuration_change':
        return <ShieldCheck className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  // Format alert type for display
  const formatAlertType = (alertType: string) => {
    return alertType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor security alerts and configure security settings
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>Security Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Security Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Security Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {selectedAlertId ? (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedAlertId(null)}
                className="mb-4"
              >
                Back to Alerts
              </Button>
              <SecurityAlertDetails 
                alert={selectedAlert} 
                isLoading={isLoadingAlertDetails} 
                onResolve={() => {
                  if (selectedAlertId) {
                    resolveAlert(selectedAlertId);
                  }
                }}
                isResolving={isResolvingAlert}
              />
            </div>
          ) : (
            <>
              {/* Filter Controls */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Alert Type</label>
                      <Select
                        value={filters.alertType || ''}
                        onValueChange={(value) => handleFilterChange('alertType', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          <SelectItem value="failed_login_attempt">Failed Login Attempt</SelectItem>
                          <SelectItem value="suspicious_login_location">Suspicious Login Location</SelectItem>
                          <SelectItem value="brute_force_attempt">Brute Force Attempt</SelectItem>
                          <SelectItem value="permission_violation">Permission Violation</SelectItem>
                          <SelectItem value="api_abuse">API Abuse</SelectItem>
                          <SelectItem value="unusual_activity">Unusual Activity</SelectItem>
                          <SelectItem value="data_access_anomaly">Data Access Anomaly</SelectItem>
                          <SelectItem value="configuration_change">Configuration Change</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Severity</label>
                      <Select
                        value={filters.severity || ''}
                        onValueChange={(value) => handleFilterChange('severity', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Severities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Severities</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={filters.resolved === undefined ? '' : String(filters.resolved)}
                        onValueChange={(value) => {
                          if (value === '') {
                            handleFilterChange('resolved', undefined);
                          } else {
                            handleFilterChange('resolved', value === 'true');
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Statuses</SelectItem>
                          <SelectItem value="false">Unresolved</SelectItem>
                          <SelectItem value="true">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Date Range</label>
                      <DateRangePicker
                        from={filters.startDate}
                        to={filters.endDate}
                        onSelect={handleDateRangeChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search alerts..."
                          value={filters.searchTerm || ''}
                          onChange={(e) => handleFilterChange('searchTerm', e.target.value || undefined)}
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={handleClearFilters}>
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts Table */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Security Alerts</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.reload()}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </Button>
                  </div>
                  <CardDescription>
                    {totalAlerts} alerts found
                    {filters.alertType && ` • Filtered by ${formatAlertType(filters.alertType)}`}
                    {filters.severity && ` • Severity: ${filters.severity.charAt(0).toUpperCase() + filters.severity.slice(1)}`}
                    {filters.resolved !== undefined && ` • ${filters.resolved ? 'Resolved' : 'Unresolved'} only`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAlerts ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin">
                          <RefreshCw className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Loading alerts...</p>
                      </div>
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium">No alerts found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {Object.keys(filters).length > 0
                          ? 'Try adjusting your filters to see more results'
                          : 'No security alerts have been detected'}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Severity</TableHead>
                            <TableHead>Alert Type</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead className="w-[180px]">Time</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {alerts.map((alert) => (
                            <TableRow 
                              key={alert.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => setSelectedAlertId(alert.id)}
                            >
                              <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getAlertTypeIcon(alert.alertType)}
                                  <span>{formatAlertType(alert.alertType)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{alert.message}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(alert.createdAt), 'MMM d, yyyy HH:mm')}
                              </TableCell>
                              <TableCell>
                                {alert.resolved ? (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Resolved
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination */}
                  {!isLoadingAlerts && alerts.length > 0 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalAlerts)} of {totalAlerts} alerts
                      </div>
                      <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(totalAlerts / pageSize)}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Security Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Security Metrics</CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={String(timeRange)}
                    onValueChange={(value) => setTimeRange(Number(value))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SecurityMetricsCards metrics={metrics} isLoading={isLoadingMetrics} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <SecuritySettingsPanel 
            settings={settings} 
            isLoading={isLoadingSettings} 
            onUpdate={updateSettings}
            isUpdating={isUpdatingSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}