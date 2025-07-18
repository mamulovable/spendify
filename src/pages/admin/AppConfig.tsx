import { useState } from 'react';
import { useAppConfig } from '@/hooks/useAppConfig';
import { ConfigValueEditor } from '@/components/admin/ConfigValueEditor';
import { ConfigHistoryTable } from '@/components/admin/ConfigHistoryTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { History, Save } from 'lucide-react';

export default function AppConfig() {
  const {
    configCategories,
    appConfigs,
    configHistory,
    isLoading,
    isLoadingHistory,
    activeCategory,
    setActiveCategory,
    selectedConfig,
    setSelectedConfig,
    updateAppConfig,
    isUpdating,
    getAppConfigByKey,
    getConfigDefinition,
  } = useAppConfig();
  
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [showHistory, setShowHistory] = useState(false);
  
  const handleValueChange = (configKey: string, value: any) => {
    setEditedValues((prev) => ({
      ...prev,
      [configKey]: value,
    }));
  };
  
  const handleSave = (configKey: string) => {
    if (editedValues[configKey] !== undefined) {
      updateAppConfig({
        configKey,
        configValue: editedValues[configKey],
      });
    }
  };
  
  const handleViewHistory = (configId: string) => {
    setSelectedConfig(configId);
    setShowHistory(true);
  };
  
  const getCurrentValue = (configKey: string) => {
    const config = getAppConfigByKey(configKey);
    return editedValues[configKey] !== undefined
      ? editedValues[configKey]
      : config?.configValue;
  };
  
  const hasChanges = (configKey: string) => {
    return editedValues[configKey] !== undefined;
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Configuration</h1>
          <p className="text-muted-foreground">
            Manage system-wide configuration settings
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {configCategories.map((category) => (
                <Button
                  key={category.name}
                  variant={activeCategory === category.name ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveCategory(category.name)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-3 space-y-6">
          {showHistory && selectedConfig ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Configuration History</CardTitle>
                  <CardDescription>
                    View changes made to this configuration
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(false)}
                >
                  Back to Settings
                </Button>
              </CardHeader>
              <CardContent>
                <ConfigHistoryTable
                  history={configHistory || []}
                  isLoading={isLoadingHistory}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {configCategories
                .filter((category) => category.name === activeCategory)
                .map((category) => (
                  <Card key={category.name}>
                    <CardHeader>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {isLoading ? (
                        <div className="text-center py-4">Loading configurations...</div>
                      ) : (
                        category.configs.map((configDef) => {
                          const config = getAppConfigByKey(configDef.key);
                          const currentValue = getCurrentValue(configDef.key);
                          
                          return (
                            <div key={configDef.key} className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <h3 className="text-lg font-medium">{configDef.label}</h3>
                                  {configDef.description && (
                                    <p className="text-sm text-gray-500">{configDef.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {config && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewHistory(config.id)}
                                    >
                                      <History className="h-4 w-4 mr-1" />
                                      History
                                    </Button>
                                  )}
                                  <Button
                                    variant="default"
                                    size="sm"
                                    disabled={!hasChanges(configDef.key) || isUpdating}
                                    onClick={() => handleSave(configDef.key)}
                                  >
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                </div>
                              </div>
                              
                              <ConfigValueEditor
                                configDefinition={configDef}
                                value={currentValue}
                                onChange={(value) => handleValueChange(configDef.key, value)}
                                disabled={isUpdating}
                              />
                              
                              <Separator />
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}