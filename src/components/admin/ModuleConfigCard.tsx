import { useState } from 'react';
import { useModuleConfig } from '@/hooks/useModuleConfig';
import { ModuleDefinition } from '@/types/moduleConfig';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ModuleConfigCardProps {
  moduleId: string;
  onEditClick: (moduleId: string) => void;
}

export function ModuleConfigCard({ moduleId, onEditClick }: ModuleConfigCardProps) {
  const { getMergedModuleData, toggleModuleEnabled, isToggling } = useModuleConfig();
  const [showDetails, setShowDetails] = useState(false);
  
  const moduleData = getMergedModuleData(moduleId);
  
  if (!moduleData) {
    return null;
  }
  
  const handleToggle = () => {
    toggleModuleEnabled({
      moduleId,
      enabled: !moduleData.enabled,
    });
  };
  
  const handleEditClick = () => {
    onEditClick(moduleId);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{moduleData.name}</CardTitle>
            <CardDescription>{moduleData.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={moduleData.enabled}
              onCheckedChange={handleToggle}
              disabled={isToggling}
            />
            <span className={moduleData.enabled ? 'text-green-600' : 'text-gray-500'}>
              {moduleData.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {moduleData.requiredPlan && moduleData.requiredPlan.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium mb-1">Required Plans</h4>
              <div className="flex flex-wrap gap-1">
                {moduleData.requiredPlan.map((plan) => (
                  <Badge key={plan} variant="outline">
                    {plan}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-medium mb-1">Required Plans</h4>
              <p className="text-sm text-gray-500">Available to all plans</p>
            </div>
          )}
          
          {showDetails && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium">Module Settings</h4>
              <div className="space-y-2">
                {Object.entries(moduleData.settings || {}).map(([key, value]) => {
                  const settingDef = (moduleData as ModuleDefinition).settings.find(s => s.key === key);
                  
                  if (!settingDef) return null;
                  
                  return (
                    <div key={key} className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-sm font-medium">{settingDef.label}</span>
                        {settingDef.description && (
                          <p className="text-xs text-gray-500">{settingDef.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {settingDef.type === 'boolean' ? (
                          <Badge variant={value ? 'default' : 'outline'}>
                            {value ? 'Enabled' : 'Disabled'}
                          </Badge>
                        ) : settingDef.type === 'multiselect' && Array.isArray(value) ? (
                          <div className="flex flex-wrap justify-end gap-1">
                            {value.map((v) => (
                              <Badge key={v} variant="outline">
                                {v}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm">{value}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {moduleData.updatedAt && (
                <div className="text-xs text-gray-500 text-right">
                  Last updated {formatDistanceToNow(new Date(moduleData.updatedAt), { addSuffix: true })}
                  {moduleData.lastUpdatedBy && ` by ${moduleData.lastUpdatedBy}`}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show Details
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditClick}
        >
          <Settings className="h-4 w-4 mr-1" />
          Configure
        </Button>
      </CardFooter>
    </Card>
  );
}