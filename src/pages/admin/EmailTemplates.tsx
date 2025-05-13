import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter as DialogFooterUI } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { X } from 'lucide-react';

// Mock data for templates
const MOCK_TEMPLATES = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to Spendify Guru',
    body: 'Hi {{userName}},\nWelcome to Spendify Guru! Start analyzing your statements today.',
    updatedAt: '2025-05-01',
  },
  {
    id: '2',
    name: 'Password Reset',
    subject: 'Reset Your Password',
    body: 'Hi {{userName}},\nClick here to reset your password: {{resetLink}}',
    updatedAt: '2025-05-05',
  },
];

export default function EmailTemplates() {
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleAdd = () => {
    setEditingTemplate({ id: '', name: '', subject: '', body: '', updatedAt: '' });
    setDialogOpen(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleSave = () => {
    if (editingTemplate.id) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...editingTemplate, updatedAt: new Date().toISOString().slice(0, 10) } : t));
    } else {
      setTemplates([
        ...templates,
        { ...editingTemplate, id: Date.now().toString(), updatedAt: new Date().toISOString().slice(0, 10) },
      ]);
    }
    setDialogOpen(false);
    setEditingTemplate(null);
  };

  const handlePreview = (template) => {
    setPreview(template);
  };

  const handleSendTest = (template) => {
    alert(`Test email sent for template: ${template.name}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Template Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">Create, edit, preview, and send test emails using dynamic variables.</p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>{template.updatedAt}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => handlePreview(template)}>Preview</Button>
                      <Button size="sm" variant="outline" onClick={() => handleSendTest(template)}>Send Test</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(template.id)}><X className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default" onClick={handleAdd}>Add New Template</Button>
        </CardFooter>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTemplate?.id ? 'Edit Template' : 'Add New Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Template Name"
              value={editingTemplate?.name || ''}
              onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
            />
            <Input
              placeholder="Subject"
              value={editingTemplate?.subject || ''}
              onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
            />
            <Textarea
              placeholder="Email Body (use {{variable}} syntax)"
              value={editingTemplate?.body || ''}
              onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
              rows={6}
            />
          </div>
          <DialogFooterUI>
            <Button variant="default" onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          </DialogFooterUI>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview: {preview?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="font-semibold">Subject:</div>
            <div>{preview?.subject}</div>
            <div className="font-semibold mt-2">Body:</div>
            <pre className="bg-muted rounded p-2 whitespace-pre-wrap">{preview?.body}</pre>
          </div>
          <DialogFooterUI>
            <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
          </DialogFooterUI>
        </DialogContent>
      </Dialog>
    </div>
  );
}
