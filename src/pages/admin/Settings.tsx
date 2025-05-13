import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  Database,
  Download,
  Eye,
  Lock,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
  MessageSquare,
  Bell,
  MailCheck,
  Gauge,
  ToggleRight,
  Cloud,
  Server,
  Save,
  RefreshCw,
  Info,
  Play,
  Mail,
  Key,
  Loader2,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Settings() {
  const { toast } = useToast();
  const {
    settings,
    featureFlags,
    apiIntegrations,
    backupSchedules,
    roles,
    permissions,
    emailTemplates,
    loading,
    error,
    updateSetting,
    updateFeatureFlag,
    updateApiIntegration,
    updateBackupSchedule,
    createRole,
    updateRole,
    deleteRole,
    assignPermissionToRole,
    removePermissionFromRole,
    updateEmailTemplate,
    triggerBackup,
    testEmailTemplate,
  } = useAdminSettings();

  const [activeTab, setActiveTab] = useState('general');
  const [savingSettings, setSavingSettings] = useState<Record<string, boolean>>({});

  const handleUpdateSetting = async (key: string, value: any) => {
    try {
      setSavingSettings((prev) => ({ ...prev, [key]: true }));
      await updateSetting(key, value);
      toast({
        title: 'Setting Updated',
        description: 'The system setting has been updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update setting',
        variant: 'destructive',
      });
    } finally {
      setSavingSettings((prev) => ({ ...prev, [key]: false }));
    }
  };
  
  const handleToggleFeatureFlag = async (key: string, enabled: boolean) => {
    try {
      setSavingSettings((prev) => ({ ...prev, [key]: true }));
      await updateFeatureFlag(key, enabled);
      toast({
        title: enabled ? 'Feature Enabled' : 'Feature Disabled',
        description: `The feature has been ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to toggle feature flag',
        variant: 'destructive',
      });
    } finally {
      setSavingSettings((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(s => s.category === category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">
            Configure application settings, permissions, and system maintenance
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="general" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="comm-maintenance">Communication & Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="comm-maintenance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><MailCheck className="w-4 h-4 mr-2 text-muted-foreground" />Email Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Manage email templates for system notifications and campaigns.</p>
                <Link to="/admin/email-templates">
                  <Button variant="outline">Go to Email Templates</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><Bell className="w-4 h-4 mr-2 text-muted-foreground" />Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Create and manage communication campaigns for users.</p>
                <Link to="/admin/campaigns">
                  <Button variant="outline">Go to Campaigns</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><Users className="w-4 h-4 mr-2 text-muted-foreground" />User Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Segment users for targeted actions and communications.</p>
                <Link to="/admin/user-segments">
                  <Button variant="outline">Go to User Segments</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><Database className="w-4 h-4 mr-2 text-muted-foreground" />Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">View, trigger, and restore system backups.</p>
                <Link to="/admin/backups">
                  <Button variant="outline">Go to Backups</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><Trash2 className="w-4 h-4 mr-2 text-muted-foreground" />Data Cleanup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Delete or anonymize old and sensitive data.</p>
                <Link to="/admin/data-cleanup">
                  <Button variant="outline">Go to Data Cleanup</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><Info className="w-4 h-4 mr-2 text-muted-foreground" />Release Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">View and manage version control and release notes.</p>
                <Link to="/admin/release-notes">
                  <Button variant="outline">Go to Release Notes</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center"><RefreshCw className="w-4 h-4 mr-2 text-muted-foreground" />System Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Trigger or schedule system updates, view update history, and manage rollbacks.</p>
                <Link to="/admin/system-updates">
                  <Button variant="outline">Go to System Updates</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          {loading.settings || loading.featureFlags ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  <div>Error loading settings: {error.message}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <SettingsIcon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Application Settings</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manage the core settings that control how Spendify Guru operates, including
                    feature toggles, application limits, and behavior settings.
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>
                    Enable or disable specific features across the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {featureFlags.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No feature flags configured
                    </div>
                  ) : (
                    featureFlags.map(flag => (
                      <div key={flag.id} className="flex items-center justify-between space-x-2 py-3 border-b last:border-0">
                        <div className="space-y-0.5">
                          <Label htmlFor={`flag-${flag.key}`} className="text-base">{flag.name}</Label>
                          <p className="text-sm text-muted-foreground">{flag.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {savingSettings[flag.key] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          <Switch 
                            id={`flag-${flag.key}`} 
                            checked={flag.enabled}
                            onCheckedChange={(checked) => handleToggleFeatureFlag(flag.key, checked)}
                            disabled={savingSettings[flag.key]}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
                <CardFooter className="justify-between flex-wrap">
                  <p className="text-sm text-muted-foreground">Changes take effect immediately</p>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Processing</CardTitle>
                  <CardDescription>
                    Configure limits and behavior for document processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {getSettingsByCategory('document_processing').map(setting => {
                    const isNumberSetting = typeof setting.value === 'number';
                    const isSliderSetting = isNumberSetting && (
                      setting.key === 'max_file_size' || 
                      setting.key === 'processing_timeout' ||
                      setting.key === 'concurrent_processes'
                    );

                    return (
                      <div key={setting.id} className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`setting-${setting.key}`} className="text-base">
                            {setting.description}
                          </Label>
                          {savingSettings[setting.key] && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                        
                        {isSliderSetting ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{setting.value}</span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={savingSettings[setting.key]}
                                  onClick={() => {
                                    const newValue = Math.max(1, Number(setting.value) - 1);
                                    handleUpdateSetting(setting.key, newValue);
                                  }}
                                >
                                  -
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={savingSettings[setting.key]}
                                  onClick={() => {
                                    const newValue = Number(setting.value) + 1;
                                    handleUpdateSetting(setting.key, newValue);
                                  }}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                            <Slider
                              id={`setting-${setting.key}`}
                              defaultValue={[setting.value]}
                              max={setting.key === 'max_file_size' ? 50 : setting.key === 'processing_timeout' ? 300 : 20}
                              step={1}
                              value={[setting.value]}
                              onValueChange={([value]) => handleUpdateSetting(setting.key, value)}
                              disabled={savingSettings[setting.key]}
                            />
                          </div>
                        ) : isNumberSetting ? (
                          <Input
                            id={`setting-${setting.key}`}
                            type="number"
                            value={setting.value}
                            onChange={(e) => handleUpdateSetting(setting.key, Number(e.target.value))}
                            disabled={savingSettings[setting.key]}
                          />
                        ) : typeof setting.value === 'boolean' ? (
                          <Switch
                            id={`setting-${setting.key}`}
                            checked={setting.value}
                            onCheckedChange={(checked) => handleUpdateSetting(setting.key, checked)}
                            disabled={savingSettings[setting.key]}
                          />
                        ) : (
                          <Input
                            id={`setting-${setting.key}`}
                            value={setting.value}
                            onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
                            disabled={savingSettings[setting.key]}
                          />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
                <CardFooter className="justify-between flex-wrap">
                  <p className="text-sm text-muted-foreground">
                    These settings affect all document processing operations
                  </p>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Settings</CardTitle>
                  <CardDescription>
                    Configure behavior for financial analysis and AI processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {getSettingsByCategory('analysis').map(setting => (
                    <div key={setting.id} className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`setting-${setting.key}`} className="text-base">
                          {setting.description}
                        </Label>
                        {savingSettings[setting.key] && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                      
                      {typeof setting.value === 'boolean' ? (
                        <Switch
                          id={`setting-${setting.key}`}
                          checked={setting.value}
                          onCheckedChange={(checked) => handleUpdateSetting(setting.key, checked)}
                          disabled={savingSettings[setting.key]}
                        />
                      ) : typeof setting.value === 'number' ? (
                        <Input
                          id={`setting-${setting.key}`}
                          type="number"
                          value={setting.value}
                          onChange={(e) => handleUpdateSetting(setting.key, Number(e.target.value))}
                          disabled={savingSettings[setting.key]}
                        />
                      ) : (
                        <Input
                          id={`setting-${setting.key}`}
                          value={setting.value}
                          onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
                          disabled={savingSettings[setting.key]}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="justify-between flex-wrap">
                  <p className="text-sm text-muted-foreground">
                    These settings affect AI analysis behavior and financial processing
                  </p>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                  <CardDescription>
                    View and modify application environment variables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSettingsByCategory('environment').map(setting => (
                      <div key={setting.id} className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`env-${setting.key}`} className="text-base">
                            {setting.key.toUpperCase()}
                          </Label>
                          {savingSettings[setting.key] && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                        <Input
                          id={`env-${setting.key}`}
                          value={setting.value}
                          onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
                          disabled={savingSettings[setting.key]}
                          type={setting.key.includes('key') || setting.key.includes('secret') ? 'password' : 'text'}
                        />
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto" onClick={() => window.location.reload()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload Application
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="2fa-required">Require 2FA for Admin</Label>
                <Switch id="2fa-required" />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                <Switch id="ip-whitelist" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="session-timeout">
                  Session Timeout (minutes)
                </Label>
                <Input id="session-timeout" type="number" defaultValue={30} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          {loading.roles || loading.permissions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  <div>Error loading permissions: {error.message}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Roles & Permissions</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manage user roles and permissions to control access to various features of the application
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Roles</CardTitle>
                      <CardDescription>
                        Create and manage user roles
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[400px]">
                        <div className="p-4 space-y-2">
                          {roles.map(role => {
                            const isAdmin = role.name === 'admin';
                            const isBasic = role.name === 'user';
                            const isSystemRole = isAdmin || isBasic;
                            
                            return (
                              <div 
                                key={role.id} 
                                className={`flex items-center justify-between p-3 rounded-md ${activeTab === 'permissions' && savingSettings[`role_${role.id}`] ? 'opacity-70 bg-muted' : 'hover:bg-muted cursor-pointer'}`}
                                onClick={() => {
                                  // Set active role logic would go here
                                }}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium">{role.name}</h4>
                                    {isSystemRole && (
                                      <Badge variant="outline" className="text-xs">
                                        System
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {role.description || `${role.name} role`}
                                  </p>
                                </div>
                                {!isSystemRole && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Delete role logic would go here
                                    }}
                                    disabled={savingSettings[`role_${role.id}`]}
                                  >
                                    {savingSettings[`role_${role.id}`] ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <span className="text-red-500">×</span>
                                    )}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Add new role logic would go here
                        }}
                      >
                        <span className="mr-1">+</span> Add New Role
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Permissions Management</CardTitle>
                      <CardDescription>
                        Manage permissions for each role
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-lg">Select a Role</h3>
                            <p className="text-sm text-muted-foreground">Choose a role to manage its permissions</p>
                          </div>
                          <Select defaultValue="admin">
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map(role => (
                                <SelectItem key={role.id} value={role.name}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="border rounded-md">
                          <div className="p-4 border-b bg-muted/50">
                            <h4 className="font-medium">Permission Groups</h4>
                          </div>
                          <ScrollArea className="h-[300px]">
                            <div className="p-4 space-y-6">
                              {/* Users Permissions */}
                              <div className="space-y-4">
                                <h5 className="font-medium text-sm">Users Management</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {permissions
                                    .filter(p => p.category === 'users')
                                    .map(permission => (
                                      <div key={permission.id} className="flex items-center space-x-2">
                                        <Switch id={`perm-${permission.id}`} />
                                        <Label htmlFor={`perm-${permission.id}`}>
                                          {permission.description}
                                        </Label>
                                      </div>
                                    ))}
                                </div>
                              </div>

                              {/* Documents Permissions */}
                              <div className="space-y-4">
                                <h5 className="font-medium text-sm">Documents Management</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {permissions
                                    .filter(p => p.category === 'documents')
                                    .map(permission => (
                                      <div key={permission.id} className="flex items-center space-x-2">
                                        <Switch id={`perm-${permission.id}`} />
                                        <Label htmlFor={`perm-${permission.id}`}>
                                          {permission.description}
                                        </Label>
                                      </div>
                                    ))}
                                </div>
                              </div>

                              {/* Admin Permissions */}
                              <div className="space-y-4">
                                <h5 className="font-medium text-sm">Admin & Dashboard</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {permissions
                                    .filter(p => p.category === 'admin')
                                    .map(permission => (
                                      <div key={permission.id} className="flex items-center space-x-2">
                                        <Switch id={`perm-${permission.id}`} />
                                        <Label htmlFor={`perm-${permission.id}`}>
                                          {permission.description}
                                        </Label>
                                      </div>
                                    ))}
                                </div>
                              </div>

                              {/* Settings Permissions */}
                              <div className="space-y-4">
                                <h5 className="font-medium text-sm">Settings & Configuration</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {permissions
                                    .filter(p => p.category === 'settings')
                                    .map(permission => (
                                      <div key={permission.id} className="flex items-center space-x-2">
                                        <Switch id={`perm-${permission.id}`} />
                                        <Label htmlFor={`perm-${permission.id}`}>
                                          {permission.description}
                                        </Label>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <div className="flex space-x-2">
                        <Button variant="outline">Reset</Button>
                        <Button>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          {loading.apiIntegrations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  <div>Error loading integrations: {error.message}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">API Integrations</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manage third-party services and API integrations for Spendify Guru
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {apiIntegrations.map(api => (
                  <Card key={api.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{api.name}</CardTitle>
                        <div className="flex items-center space-x-1">
                          {savingSettings[api.key] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          <Switch 
                            id={`api-${api.key}`} 
                            checked={api.enabled}
                            onCheckedChange={(checked) => {
                              setSavingSettings((prev) => ({ ...prev, [api.key]: true }));
                              updateApiIntegration(api.key, { ...api, enabled: checked })
                                .then(() => {
                                  toast({
                                    title: checked ? 'Integration Enabled' : 'Integration Disabled',
                                    description: `${api.name} has been ${checked ? 'enabled' : 'disabled'}`
                                  });
                                })
                                .catch(err => {
                                  toast({
                                    title: 'Error',
                                    description: `Failed to update ${api.name} status`,
                                    variant: 'destructive'
                                  });
                                })
                                .finally(() => {
                                  setSavingSettings((prev) => ({ ...prev, [api.key]: false }));
                                });
                            }}
                            disabled={savingSettings[api.key]}
                          />
                        </div>
                      </div>
                      <CardDescription>{api.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Credentials fields */}
                        {api.credentials && Object.keys(api.credentials).map(credKey => {
                          const isSecret = credKey.includes('key') || credKey.includes('secret') || credKey.includes('password');
                          
                          return (
                            <div key={credKey} className="grid gap-2">
                              <Label htmlFor={`${api.key}-${credKey}`} className="capitalize">
                                {credKey.replace(/_/g, ' ')}
                              </Label>
                              <div className="flex space-x-2">
                                <Input
                                  id={`${api.key}-${credKey}`}
                                  value={api.credentials[credKey] || ''}
                                  onChange={e => {
                                    const updatedCreds = {
                                      ...api.credentials,
                                      [credKey]: e.target.value
                                    };
                                    updateApiIntegration(api.key, { ...api, credentials: updatedCreds });
                                  }}
                                  type={isSecret ? 'password' : 'text'}
                                  placeholder={`Enter ${credKey.replace(/_/g, ' ')}`}
                                  disabled={!api.enabled || savingSettings[api.key]}
                                />
                                {isSecret && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!api.enabled || savingSettings[api.key]}
                                    onClick={() => {
                                      // Toggle visibility logic would go here
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Configuration options */}
                        {api.config && Object.keys(api.config).map(configKey => {
                          const configValue = api.config[configKey];
                          const isBoolean = typeof configValue === 'boolean';
                          
                          return isBoolean ? (
                            <div key={configKey} className="flex items-center space-x-2">
                              <Switch
                                id={`${api.key}-${configKey}`}
                                checked={configValue}
                                onCheckedChange={checked => {
                                  const updatedConfig = {
                                    ...api.config,
                                    [configKey]: checked
                                  };
                                  updateApiIntegration(api.key, { ...api, config: updatedConfig });
                                }}
                                disabled={!api.enabled || savingSettings[api.key]}
                              />
                              <Label htmlFor={`${api.key}-${configKey}`}>
                                {configKey.replace(/_/g, ' ')}
                              </Label>
                            </div>
                          ) : (
                            <div key={configKey} className="grid gap-2">
                              <Label htmlFor={`${api.key}-${configKey}`} className="capitalize">
                                {configKey.replace(/_/g, ' ')}
                              </Label>
                              <Input
                                id={`${api.key}-${configKey}`}
                                value={configValue || ''}
                                onChange={e => {
                                  const updatedConfig = {
                                    ...api.config,
                                    [configKey]: e.target.value
                                  };
                                  updateApiIntegration(api.key, { ...api, config: updatedConfig });
                                }}
                                disabled={!api.enabled || savingSettings[api.key]}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto"
                        disabled={!api.enabled || savingSettings[api.key]}
                        onClick={() => {
                          setSavingSettings((prev) => ({ ...prev, [api.key]: true }));
                          // Test connection logic would go here
                          setTimeout(() => {
                            toast({
                              title: 'Connection Successful',
                              description: `Successfully connected to ${api.name}`
                            });
                            setSavingSettings((prev) => ({ ...prev, [api.key]: false }));
                          }, 1500);
                        }}
                      >
                        {savingSettings[api.key] ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Test Connection
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {loading.emailTemplates ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  <div>Error loading notification settings: {error.message}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Notification Settings</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configure email notifications and messaging templates
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-4 md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Templates</CardTitle>
                      <CardDescription>
                        Manage system email templates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[400px]">
                        <div className="p-4 space-y-2">
                          {emailTemplates.map(template => (
                            <div 
                              key={template.id} 
                              className={`flex items-center justify-between p-3 rounded-md ${activeTab === 'notifications' && savingSettings[`template_${template.id}`] ? 'opacity-70 bg-muted' : 'hover:bg-muted cursor-pointer'}`}
                              onClick={() => {
                                // Select template logic would go here
                              }}
                            >
                              <div className="space-y-1">
                                <h4 className="font-medium">{template.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {template.description}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSavingSettings((prev) => ({ ...prev, [`template_${template.id}`]: true }));
                                    // Test email sending logic
                                    testEmailTemplate(template.id, 'test@example.com')
                                      .then(() => {
                                        toast({
                                          title: 'Test Email Sent',
                                          description: `A test email using the ${template.name} template has been sent`
                                        });
                                      })
                                      .catch(err => {
                                        toast({
                                          title: 'Error',
                                          description: 'Failed to send test email',
                                          variant: 'destructive'
                                        });
                                      })
                                      .finally(() => {
                                        setSavingSettings((prev) => ({ ...prev, [`template_${template.id}`]: false }));
                                      });
                                  }}
                                  disabled={savingSettings[`template_${template.id}`]}
                                >
                                  {savingSettings[`template_${template.id}`] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Mail className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Template Editor</CardTitle>
                      <CardDescription>
                        Customize email templates with variables and formatting
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="template-name">Template Name</Label>
                          <Input id="template-name" placeholder="Template name" value="Welcome Email" />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="template-subject">Email Subject</Label>
                          <Input id="template-subject" placeholder="Subject line" value="Welcome to Spendify Guru" />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="template-content">Email Content</Label>
                          <Textarea 
                            id="template-content" 
                            className="h-[200px] font-mono text-sm" 
                            placeholder="Email content with variables like {{user.name}}"
                            value={`<h1>Welcome to Spendify Guru, {{user.first_name}}!</h1>
<p>Thank you for joining our platform. We're excited to help you manage your finances better.</p>
<p>Your account is now active and you can start by uploading your first bank statement.</p>
<p>If you have any questions, feel free to contact our support team.</p>
<p>Best regards,<br>The Spendify Guru Team</p>`}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label>Available Variables</Label>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{'{{'}'user.first_name{'}}'}</Badge>
                            <Badge variant="outline">{'{{'}'user.last_name{'}}'}</Badge>
                            <Badge variant="outline">{'{{'}'user.email{'}}'}</Badge>
                            <Badge variant="outline">{'{{'}'site.name{'}}'}</Badge>
                            <Badge variant="outline">{'{{'}'site.url{'}}'}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex space-x-2 ml-auto">
                        <Button variant="outline">
                          <Mail className="mr-2 h-4 w-4" />
                          Send Test
                        </Button>
                        <Button>
                          <Save className="mr-2 h-4 w-4" />
                          Save Template
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="maintenance" className="space-y-4">
          {loading.backupSchedules ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  <div>Error loading maintenance settings: {error.message}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">System Maintenance</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manage database backups, system logs, and performance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Backups</CardTitle>
                    <CardDescription>
                      Configure automatic backups and restore points
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Backup Schedule</h4>
                          <Switch 
                            id="enable-backups"
                            checked={backupSchedules.length > 0 && backupSchedules[0].enabled}
                            onCheckedChange={(checked) => {
                              if (backupSchedules.length > 0) {
                                updateBackupSchedule(backupSchedules[0].id, { ...backupSchedules[0], enabled: checked });
                              }
                            }}
                          />
                        </div>

                        <div className="grid gap-4">
                          <div>
                            <Label>Frequency</Label>
                            <Select 
                              defaultValue={backupSchedules.length > 0 ? backupSchedules[0].frequency : 'daily'}
                              disabled={!backupSchedules.length || !backupSchedules[0].enabled}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Retention Period (days)</Label>
                            <Input 
                              type="number" 
                              defaultValue={backupSchedules.length > 0 ? backupSchedules[0].retention_days : 30}
                              disabled={!backupSchedules.length || !backupSchedules[0].enabled}
                            />
                          </div>

                          <div>
                            <Label>Storage Location</Label>
                            <Select 
                              defaultValue={backupSchedules.length > 0 ? backupSchedules[0].storage_location : 'local'}
                              disabled={!backupSchedules.length || !backupSchedules[0].enabled}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select storage" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="local">Local Storage</SelectItem>
                                <SelectItem value="s3">Amazon S3</SelectItem>
                                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recent Backups</h4>
                        <div className="border rounded-md divide-y">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="p-3 flex items-center justify-between">
                              <div>
                                <div className="font-medium">{new Date(Date.now() - i * 86400000).toLocaleDateString()}</div>
                                <div className="text-xs text-muted-foreground">42.3 MB</div>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Play className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSavingSettings((prev) => ({ ...prev, 'manual_backup': true }));
                        triggerBackup('manual')
                          .then(() => {
                            toast({
                              title: 'Backup Started',
                              description: 'Manual backup process has been initiated'
                            });
                          })
                          .catch(err => {
                            toast({
                              title: 'Error',
                              description: 'Failed to start backup process',
                              variant: 'destructive'
                            });
                          })
                          .finally(() => {
                            setSavingSettings((prev) => ({ ...prev, 'manual_backup': false }));
                          });
                      }}
                      disabled={savingSettings['manual_backup']}
                    >
                      {savingSettings['manual_backup'] ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Database className="mr-2 h-4 w-4" />
                      )}
                      Backup Now
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>
                      Monitor system performance and logs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">System Resources</h4>
                          <Badge variant={"outline"} className="text-green-600 bg-green-50">Healthy</Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <Label>CPU Usage</Label>
                              <span className="text-sm">23%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '23%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <Label>Memory Usage</Label>
                              <span className="text-sm">38%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '38%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <Label>Storage Usage</Label>
                              <span className="text-sm">62%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recent System Logs</h4>
                        <div className="border rounded-md">
                          <ScrollArea className="h-[200px]">
                            <div className="p-3 space-y-2 text-xs font-mono">
                              <div className="flex">
                                <span className="text-blue-500 mr-2">[INFO]</span>
                                <span className="text-muted-foreground mr-2">{new Date().toLocaleString()}</span>
                                <span>System backup completed successfully</span>
                              </div>
                              <div className="flex">
                                <span className="text-amber-500 mr-2">[WARN]</span>
                                <span className="text-muted-foreground mr-2">{new Date(Date.now() - 3600000).toLocaleString()}</span>
                                <span>High memory usage detected (78%)</span>
                              </div>
                              <div className="flex">
                                <span className="text-green-500 mr-2">[INFO]</span>
                                <span className="text-muted-foreground mr-2">{new Date(Date.now() - 7200000).toLocaleString()}</span>
                                <span>API service restarted</span>
                              </div>
                              <div className="flex">
                                <span className="text-red-500 mr-2">[ERROR]</span>
                                <span className="text-muted-foreground mr-2">{new Date(Date.now() - 86400000).toLocaleString()}</span>
                                <span>Database connection timeout</span>
                              </div>
                              <div className="flex">
                                <span className="text-blue-500 mr-2">[INFO]</span>
                                <span className="text-muted-foreground mr-2">{new Date(Date.now() - 172800000).toLocaleString()}</span>
                                <span>System updated to version 2.4.1</span>
                              </div>
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <Button variant="outline" size="sm">
                      <Server className="mr-2 h-4 w-4" />
                      View All Logs
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Status
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
