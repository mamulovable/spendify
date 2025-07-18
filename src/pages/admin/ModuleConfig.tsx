import { useState } from 'react';
import { useModuleConfig } from '@/hooks/useModuleConfig';
import { ModuleConfigCard } from '@/components/admin/ModuleConfigCard';
import { ModuleConfigDialog } from '@/components/admin/ModuleConfigDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

export default function ModuleConfig() {
  const { moduleDefinitions, isLoading } = useModuleConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  
  const handleEditModule = (moduleId: string) => {
    setEditingModuleId(moduleId);
  };
  
  const filteredModules = moduleDefinitions.filter((module) => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') {
      return matchesSearch;
    }
    
    // In a real implementation, you would filter based on enabled status
    // For now, we'll just return all modules
    return matchesSearch;
  });
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Module Configuration</h1>
          <p className="text-muted-foreground">
            Configure modules and their settings
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search modules..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Modules</TabsTrigger>
            <TabsTrigger value="enabled">Enabled</TabsTrigger>
            <TabsTrigger value="disabled">Disabled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">Loading modules...</div>
      ) : filteredModules.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No modules found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredModules.map((module) => (
            <ModuleConfigCard
              key={module.id}
              moduleId={module.id}
              onEditClick={handleEditModule}
            />
          ))}
        </div>
      )}
      
      {editingModuleId && (
        <ModuleConfigDialog
          open={!!editingModuleId}
          onOpenChange={(open) => {
            if (!open) setEditingModuleId(null);
          }}
          moduleId={editingModuleId}
        />
      )}
    </div>
  );
}