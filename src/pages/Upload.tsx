
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PieChart, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import UploadCard from '@/components/UploadCard';
import { useStatement } from '@/contexts/StatementContext';
import { useToast } from '@/components/ui/use-toast';

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadedFile, statementData, error } = useStatement();
  const [hasData, setHasData] = useState(false);

  // Debug logging for statement data
  useEffect(() => {
    console.log("Upload page - Current statement data:", statementData);
    console.log("Upload page - Current file:", uploadedFile?.name);

    if (statementData && uploadedFile) {
      console.log("Data and file available for analysis");
      setHasData(true);
    } else {
      setHasData(false);
    }
  }, [statementData, uploadedFile]);

  // Show error toast if processing fails
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: error,
      });
    }
  }, [error, toast]);

  // Redirect to analyze page automatically if data is available
  const handleAnalyzeClick = () => {
    if (hasData) {
      navigate('/analyze');
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto pt-32 px-6">
        <div className="text-center mb-12 animate-slide-down">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Upload Your Statement</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your bank statement to get started. We support PDF files from most major banks.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto animate-scale-in">
          <UploadCard />
        </div>
        
        {hasData && (
          <div className="mt-10 text-center animate-fade-in">
            <p className="text-lg mb-4">
              Ready to see your financial insights?
            </p>
            <p className="text-muted-foreground mb-6">
              We found {statementData?.transactions.length} transactions in your statement.
            </p>
            <Link to="/analyze">
              <Button size="lg" className="rounded-full px-6 gap-2" onClick={handleAnalyzeClick}>
                <PieChart className="w-4 h-4" />
                Analyze My Spending
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}
        
        <div className="mt-16">
          <div className="glass-effect rounded-lg p-6 border border-border/60 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-medium mb-2">Privacy & Security</h3>
            <p className="text-muted-foreground">
              Your financial data never leaves your device. All processing happens locally, ensuring your sensitive information remains private and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
