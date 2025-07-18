import { useState, useEffect } from 'react';
import { ConfigDefinition } from '@/types/appConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ConfigValueEditorProps {
  configDefinition: ConfigDefinition;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export function ConfigValueEditor({
  configDefinition,
  value,
  onChange,
  disabled = false,
}: ConfigValueEditorProps) {
  const [jsonString, setJsonString] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  // Initialize JSON string when value changes
  useEffect(() => {
    if (configDefinition.type === 'json' && value) {
      try {
        setJsonString(JSON.stringify(value, null, 2));
        setJsonError(null);
      } catch (error) {
        setJsonString('{}');
        setJsonError('Invalid JSON value');
      }
    }
  }, [configDefinition.type, value]);
  
  // Handle JSON changes
  const handleJsonChange = (jsonStr: string) => {
    setJsonString(jsonStr);
    try {
      const parsedJson = JSON.parse(jsonStr);
      onChange(parsedJson);
      setJsonError(null);
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };
  
  // Handle multiselect changes
  const handleMultiselectAdd = (newValue: string) => {
    if (!value.includes(newValue)) {
      onChange([...value, newValue]);
    }
  };
  
  const handleMultiselectRemove = (valueToRemove: string) => {
    onChange(value.filter((v: string) => v !== valueToRemove));
  };
  
  switch (configDefinition.type) {
    case 'text':
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );
      
    case 'number':
      return (
        <Input
          type="number"
          value={value || 0}
          onChange={(e) => onChange(Number(e.target.value))}
          min={configDefinition.validation?.min}
          max={configDefinition.validation?.max}
          disabled={disabled}
        />
      );
      
    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={value || false}
            onCheckedChange={onChange}
            disabled={disabled}
          />
          <span>{value ? 'Enabled' : 'Disabled'}</span>
        </div>
      );
      
    case 'select':
      return (
        <Select
          value={value || ''}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {configDefinition.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      
    case 'multiselect':
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {(value || []).map((val: string) => (
              <Badge key={val} variant="secondary" className="px-2 py-1">
                {configDefinition.options?.find((o) => o.value === val)?.label || val}
                <button
                  type="button"
                  onClick={() => handleMultiselectRemove(val)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {(value || []).length === 0 && (
              <span className="text-sm text-gray-500">No options selected</span>
            )}
          </div>
          <Select
            value=""
            onValueChange={handleMultiselectAdd}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add option" />
            </SelectTrigger>
            <SelectContent>
              {configDefinition.options
                ?.filter((option) => !(value || []).includes(option.value))
                .map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      );
      
    case 'json':
      return (
        <div className="space-y-2">
          <Textarea
            value={jsonString}
            onChange={(e) => handleJsonChange(e.target.value)}
            className="font-mono text-sm h-[200px]"
            disabled={disabled}
          />
          {jsonError && (
            <p className="text-sm text-red-500">{jsonError}</p>
          )}
        </div>
      );
      
    default:
      return (
        <Input
          value={JSON.stringify(value)}
          disabled={true}
        />
      );
  }
}