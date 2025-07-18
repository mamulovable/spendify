import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityAlert } from '@/types/security';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Clock, Globe, Loader2, Shield, ShieldAlert, ShieldCheck, User } from 'lucide-react';
import { format } from 'date-fns';

interface SecurityAlertDetailsProps {
  alert: SecurityAlert | null | undefined;
  isLoading: boolean;
  onResolve: () => void;
  isResolving: boolean;
}

export function SecurityAlertDetails({ alert, isLoading, onResolve, isResolving }: SecurityAlertDetailsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin">
                <Loader2 className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Loading alert details...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alert) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium">Alert not found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The requested security alert could not be found
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="bg-red-500">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Medium</Badge>;
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
        return <ShieldAlert className="h-5 w-5 text-destructive" />;
      case 'suspicious_login_location':
      case 'unusual_activity':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'permission_violation':
      case 'api_abuse':
        return <Shield className="h-5 w-5 text-destructive" />;
      case 'data_access_anomaly':
        return <Shield className="h-5 w-5 text-amber-500" />;
      case 'configuration_change':
        return <ShieldCheck className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Shield className="h-5 w-5" />;
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-1">
          {getAlertTypeIcon(alert.alertType)}
          <CardTitle className="text-xl">{formatAlertType(alert.alertType)}</CardTitle>
          {getSeverityBadge(alert.severity)}
          {alert.resolved && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 ml-auto">
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolved
            </Badge>
          )}
        </div>
        <CardDescription>
          Alert ID: {alert.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">{alert.message}</h3>
          <p className="text-sm text-muted-foreground">
            Detected on {format(new Date(alert.createdAt), 'MMMM d, yyyy')} at {format(new Date(alert.createdAt), 'HH:mm:ss')}
          </p>
        </div>

        <Separator />

        {/* Alert Details */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Details</h4>
            <div className="bg-muted rounded-md p-4 overflow-auto max-h-[200px]">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(alert.details, null, 2)}
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Information */}
            {alert.userId && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  User Information
                </h4>
                <div className="bg-muted rounded-md p-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">User ID</p>
                      <p className="text-sm font-medium">{alert.userId}</p>
                    </div>
                    {alert.details.user && (
                      <>
                        {alert.details.user.email && (
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{alert.details.user.email}</p>
                          </div>
                        )}
                        {alert.details.user.name && (
                          <div>
                            <p className="text-xs text-muted-foreground">Name</p>
                            <p className="text-sm font-medium">{alert.details.user.name}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Location Information */}
            {(alert.ipAddress || alert.details.location) && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  Location Information
                </h4>
                <div className="bg-muted rounded-md p-4">
                  <div className="space-y-2">
                    {alert.ipAddress && (
                      <div>
                        <p className="text-xs text-muted-foreground">IP Address</p>
                        <p className="text-sm font-medium">{alert.ipAddress}</p>
                      </div>
                    )}
                    {alert.details.location && (
                      <>
                        {alert.details.location.country && (
                          <div>
                            <p className="text-xs text-muted-foreground">Country</p>
                            <p className="text-sm font-medium">{alert.details.location.country}</p>
                          </div>
                        )}
                        {alert.details.location.city && (
                          <div>
                            <p className="text-xs text-muted-foreground">City</p>
                            <p className="text-sm font-medium">{alert.details.location.city}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Agent */}
          {alert.userAgent && (
            <div>
              <h4 className="text-sm font-medium mb-2">User Agent</h4>
              <div className="bg-muted rounded-md p-4">
                <p className="text-xs break-all">{alert.userAgent}</p>
              </div>
            </div>
          )}

          {/* Resolution Information */}
          {alert.resolved && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Resolution Information
              </h4>
              <div className="bg-muted rounded-md p-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Resolved By</p>
                    <p className="text-sm font-medium">{alert.resolvedBy || 'System'}</p>
                  </div>
                  {alert.resolvedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Resolved At</p>
                      <p className="text-sm font-medium">
                        {format(new Date(alert.resolvedAt), 'MMMM d, yyyy')} at {format(new Date(alert.resolvedAt), 'HH:mm:ss')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {!alert.resolved && (
        <CardFooter className="flex justify-end">
          <Button 
            onClick={onResolve} 
            disabled={isResolving}
            className="flex items-center gap-1"
          >
            {isResolving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Resolving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Mark as Resolved</span>
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}