import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import UploadCard from '@/components/UploadCard';
import { useStatement } from '@/contexts/StatementContext';
import { useToast } from '@/components/ui/use-toast';

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadedFile, statementData, error } = useStatement();
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (statementData && uploadedFile) {
      setHasData(true);
    } else {
      setHasData(false);
    }
  }, [statementData, uploadedFile]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: error,
      });
    }
  }, [error, toast]);

  const handleAnalyzeClick = () => {
    if (hasData) {
      navigate('/dashboard/analyze');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Upload Your Statement</h1>
        <p className="text-gray-600 text-center mb-8">
          Upload your bank statement to get started.
        </p>
        
        <div className="grid gap-6">
          <UploadCard />

          {hasData && (
            <div className="flex flex-col items-center">
              <p className="text-lg mb-4 text-center">
                Ready to analyze your data?
              </p>
              <Button
                onClick={handleAnalyzeClick}
                className="flex items-center gap-2"
              >
                Analyze Data
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;

