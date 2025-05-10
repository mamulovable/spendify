import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Configure system settings and integrations
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="ai-features">AI Features</Label>
                <Switch id="ai-features" />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="beta-features">Beta Features</Label>
                <Switch id="beta-features" />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <Switch id="maintenance-mode" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
                <Input id="max-file-size" type="number" defaultValue={10} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="concurrent-processes">
                  Max Concurrent Processes
                </Label>
                <Input
                  id="concurrent-processes"
                  type="number"
                  defaultValue={5}
                />
              </div>
            </CardContent>
          </Card>
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

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Google Cloud Vision API</Label>
                <Input placeholder="API Key" type="password" />
                <div className="flex items-center space-x-2">
                  <Switch id="gcv-enabled" />
                  <Label htmlFor="gcv-enabled">Enabled</Label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>OpenAI API</Label>
                <Input placeholder="API Key" type="password" />
                <div className="flex items-center space-x-2">
                  <Switch id="openai-enabled" />
                  <Label htmlFor="openai-enabled">Enabled</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Rate Limiting</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Requests per minute"
                    type="number"
                    defaultValue={60}
                  />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>API Keys</Label>
                <div className="flex items-center space-x-2">
                  <Input placeholder="Generate new API key" readOnly />
                  <Button variant="outline">Generate</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
