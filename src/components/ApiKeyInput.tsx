
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getGeminiApiKey, setGeminiApiKey, hasGeminiApiKey } from '@/services/insightService';
import { Key } from 'lucide-react';

interface ApiKeyInputProps {
  onKeySubmit?: () => void;
}

const ApiKeyInput = ({ onKeySubmit }: ApiKeyInputProps) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [hasStoredKey, setHasStoredKey] = useState(false);

  useEffect(() => {
    // Check if we already have a stored key
    const hasKey = hasGeminiApiKey();
    setHasStoredKey(hasKey);
    
    if (hasKey) {
      setApiKey(getGeminiApiKey());
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please enter your Gemini API key to generate insights."
      });
      return;
    }

    setGeminiApiKey(apiKey.trim());
    setHasStoredKey(true);
    
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved."
    });

    if (onKeySubmit) {
      onKeySubmit();
    }
  };

  const handleClear = () => {
    setGeminiApiKey('');
    setApiKey('');
    setHasStoredKey(false);
    
    toast({
      title: "API Key Cleared",
      description: "Your Gemini API key has been removed."
    });
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Key className="w-5 h-5" />
          Gemini API Key
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Enter your Gemini API key to enable AI-powered insights. Your key is stored locally on your device.
            </p>
            <Input
              type="password"
              placeholder="Enter your Gemini API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
            {hasStoredKey && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ API key is saved
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {hasStoredKey && (
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear Key
            </Button>
          )}
          <Button type="submit">
            {hasStoredKey ? 'Update Key' : 'Save Key'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ApiKeyInput;
