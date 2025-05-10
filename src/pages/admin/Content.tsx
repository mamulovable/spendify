import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface AITemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  lastUpdated: string;
}

interface FinancialTip {
  id: string;
  title: string;
  content: string;
  category: string;
  published: boolean;
  createdAt: string;
}

export default function Content() {
  const [activeTab, setActiveTab] = useState('ai-templates');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai-templates">AI Templates</TabsTrigger>
          <TabsTrigger value="financial-tips">Financial Tips</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-templates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>AI Response Templates</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Template Name</label>
                    <Input placeholder="Enter template name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input placeholder="Enter category" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea placeholder="Enter template content" rows={4} />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Template rows would go here */}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial-tips" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Financial Tips</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Tip
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input placeholder="Enter tip title" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input placeholder="Enter category" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea placeholder="Enter tip content" rows={4} />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Tip rows would go here */}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Notification template management content */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
