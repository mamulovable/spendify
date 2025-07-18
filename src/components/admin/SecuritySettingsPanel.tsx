import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SecuritySettings } from '@/types/security';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Save, Trash, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface SecuritySettingsPanelProps {
  settings: SecuritySettings | undefined;
  isLoading: boolean;
  onUpdate: (settings: SecuritySettings) => void;
  isUpdating: boolean;
}

export function SecuritySettingsPanel({ settings, isLoading, onUpdate, isUpdating }: SecuritySettingsPanelProps) {
  const [editedSettings, setEditedSettings] = useState<SecuritySettings | null>(null);
  const [newCountry, setNewCountry] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Initialize edited settings when settings are loaded
  React.useEffect(() => {
    if (settings && !editedSettings) {
      setEditedSettings({ ...settings });
    }
  }, [settings, editedSettings]);

  if (isLoading || !editedSettings) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin">
                <Loader2 className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Loading security settings...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleInputChange = (key: keyof SecuritySettings, value: any) => {
    setEditedSettings(prev => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
  };

  const handleAddCountry = () => {
    if (!newCountry.trim()) return;
    
    // Check if country code is valid (2 uppercase letters)
    if (!/^[A-Z]{2}$/.test(newCountry)) {
      toast({
        title: 'Invalid country code',
        description: 'Please enter a valid 2-letter country code (e.g., US, CA, GB)',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if country already exists
    if (editedSettings.allowedCountries.includes(newCountry)) {
      toast({
        title: 'Country already added',
        description: `${newCountry} is already in the allowed countries list`,
        variant: 'destructive',
      });
      return;
    }
    
    setEditedSettings(prev => {
      if (!prev) return null;
      return { 
        ...prev, 
        allowedCountries: [...prev.allowedCountries, newCountry] 
      };
    });
    setNewCountry('');
  };

  const handleRemoveCountry = (country: string) => {
    setEditedSettings(prev => {
      if (!prev) return null;
      return { 
        ...prev, 
        allowedCountries: prev.allowedCountries.filter(c => c !== country) 
      };
    });
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;
    
    // Check if email is valid
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast({
        title: 'Invalid email address',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if email already exists
    if (editedSettings.alertEmailRecipients.includes(newEmail)) {
      toast({
        title: 'Email already added',
        description: `${newEmail} is already in the recipients list`,
        variant: 'destructive',
      });
      return;
    }
    
    setEditedSettings(prev => {
      if (!prev) return null;
      return { 
        ...prev, 
        alertEmailRecipients: [...prev.alertEmailRecipients, newEmail] 
      };
    });
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    setEditedSettings(prev => {
      if (!prev) return null;
      return { 
        ...prev, 
        alertEmailRecipients: prev.alertEmailRecipients.filter(e => e !== email) 
      };
    });
  };

  const handleSave = () => {
    if (editedSettings) {
      onUpdate(editedSettings);
    }
  };

  const handleReset = () => {
    if (settings) {
      setEditedSettings({ ...settings });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Configure security settings and alert preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Login Security */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Login Security</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loginAttemptThreshold">Login Attempt Threshold</Label>
              <Input
                id="loginAttemptThreshold"
                type="number"
                min="1"
                max="10"
                value={editedSettings.loginAttemptThreshold}
                onChange={(e) => handleInputChange('loginAttemptThreshold', parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Number of failed login attempts before account lockout
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="loginLockoutDuration">Lockout Duration (minutes)</Label>
              <Input
                id="loginLockoutDuration"
                type="number"
                min="5"
                max="1440"
                value={editedSettings.loginLockoutDuration}
                onChange={(e) => handleInputChange('loginLockoutDuration', parseInt(e.target.value) || 5)}
              />
              <p className="text-xs text-muted-foreground">
                Duration of account lockout after exceeding threshold
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enableBruteForceProtection"
              checked={editedSettings.enableBruteForceProtection}
              onCheckedChange={(checked) => handleInputChange('enableBruteForceProtection', checked)}
            />
            <Label htmlFor="enableBruteForceProtection">Enable brute force protection</Label>
          </div>
        </div>
        
        <Separator />
        
        {/* Geo-IP Security */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Geo-IP Security</h3>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enableGeoIpCheck"
              checked={editedSettings.enableGeoIpCheck}
              onCheckedChange={(checked) => handleInputChange('enableGeoIpCheck', checked)}
            />
            <Label htmlFor="enableGeoIpCheck">Enable geo-location checking</Label>
          </div>
          
          <div className="space-y-2">
            <Label>Allowed Countries</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedSettings.allowedCountries.map((country) => (
                <Badge key={country} variant="secondary" className="flex items-center gap-1">
                  {country}
                  <button
                    type="button"
                    onClick={() => handleRemoveCountry(country)}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Country code (e.g., US)"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value.toUpperCase())}
                maxLength={2}
                className="uppercase"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddCountry}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add country</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Two-letter country codes (ISO 3166-1 alpha-2)
            </p>
          </div>
        </div>
        
        <Separator />
        
        {/* Anomaly Detection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Anomaly Detection</h3>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enableAnomalyDetection"
              checked={editedSettings.enableAnomalyDetection}
              onCheckedChange={(checked) => handleInputChange('enableAnomalyDetection', checked)}
            />
            <Label htmlFor="enableAnomalyDetection">Enable anomaly detection</Label>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Automatically detect unusual user behavior and potential security threats
          </p>
        </div>
        
        <Separator />
        
        {/* Alert Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Alert Notifications</h3>
          
          <div className="space-y-2">
            <Label>Email Recipients</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedSettings.alertEmailRecipients.map((email) => (
                <Badge key={email} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddEmail}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add email</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Recipients for security alert notifications
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isUpdating}
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="flex items-center gap-1"
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}