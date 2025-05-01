import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Upload, File, Image, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useStatement } from '@/contexts/StatementContext';
import { processBankStatement } from '@/services/pdfService';
import { processImageAndExtractTransactions } from '@/services/ocrService';

const UploadCard = () => {
  const { toast } = useToast();
  const { 
    setUploadedFile, 
    setStatementData, 
    setIsProcessing, 
    setError, 
    uploadedFile, 
    isProcessing 
  } = useStatement();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [extractionProgress, setExtractionProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    console.log("Processing file:", file.name);
    setProcessingError(null);
    setExtractionProgress(0);
    
    // Check file type
    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    
    if (!isPDF && !isImage) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF or image file.",
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    // Setup progress simulation
    const progressInterval = setInterval(() => {
      setExtractionProgress(prev => {
        const next = prev + (Math.random() * 5);
        return next > 90 ? 90 : next; // Max out at 90% until complete
      });
    }, 200);
    
    try {
      let result;
      if (isPDF) {
        console.log("Starting PDF processing...");
        result = await processBankStatement(file);
      } else {
        console.log("Starting image processing...");
        const transactions = await processImageAndExtractTransactions(file);
        result = {
          transactions,
          totalIncome: transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0),
          totalExpense: transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0),
        };
      }
      
      clearInterval(progressInterval);
      setExtractionProgress(100);
      
      if (result.transactions.length === 0) {
        setProcessingError(`No transactions found in the ${isPDF ? 'PDF' : 'image'}. Please try a different statement or format.`);
        toast({
          variant: "destructive",
          title: "No transactions found",
          description: `We couldn't find any transactions in this ${isPDF ? 'PDF' : 'image'}. Please ensure it's a bank statement with transaction data.`,
        });
        setIsProcessing(false);
        return;
      }
      
      setUploadComplete(true);
      setIsProcessing(false);
      
      // Update global state
      setUploadedFile(file);
      setStatementData(result);
      
      toast({
        title: "Processing complete",
        description: `Extracted ${result.transactions.length} transactions from statement.`,
      });
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Error processing file:", error);
      setIsProcessing(false);
      setExtractionProgress(0);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setError(errorMessage);
      setProcessingError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: `Could not extract data from the ${isPDF ? 'PDF' : 'image'}. Please try another file.`,
      });
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setStatementData(null);
    setUploadComplete(false);
    setProcessingError(null);
    setExtractionProgress(0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* PDF Upload Card */}
      <Card className={cn(
        "transition-all duration-300 border-2",
        isDragging ? "border-primary/50 bg-primary/5" : "border-border bg-card",
        uploadComplete ? "border-green-500/20 bg-green-50/50 dark:bg-green-950/10" : "",
        processingError ? "border-red-500/20 bg-red-50/50 dark:bg-red-950/10" : ""
      )}>
        <CardContent className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center text-center p-8 rounded-lg transition-all duration-300",
              isDragging ? "bg-primary/5" : ""
            )}
          >
            {!uploadedFile ? (
              <>
                <div className="mb-4 p-4 rounded-full bg-muted/50 animate-float">
                  <File className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Upload PDF Statement</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Drag and drop your PDF bank statement here, or click to browse
                </p>
                <Button 
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                  size="lg"
                  className="gap-2 animate-scale-in"
                >
                  <File className="w-4 h-4" />
                  Browse PDF Files
                </Button>
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            ) : (
              <div className="w-full">
                <div className="flex items-center mb-4">
                  <div className="flex-1 flex items-center">
                    <div className="animate-spin mr-3">
                      <File className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Processing...</p>
                      <div className="h-1 w-full bg-muted mt-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/80 rounded-full transition-all duration-300"
                          style={{ width: `${extractionProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Extracting transactions ({Math.round(extractionProgress)}%)
                      </p>
                    </div>
                  </div>
                </div>
                
                {processingError && (
                  <div className="animate-fade-in mt-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" /> 
                      Error processing file
                    </p>
                    <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                      {processingError}
                    </p>
                    <div className="mt-4">
                      <Button
                        className="w-full gap-2"
                        onClick={resetUpload}
                      >
                        <Upload className="w-4 h-4" />
                        Try Another File
                      </Button>
                    </div>
                  </div>
                )}
                
                {uploadComplete && (
                  <div className="animate-fade-in">
                    <p className="text-green-600 dark:text-green-400 text-sm mt-4 flex items-center">
                      <Check className="w-4 h-4 mr-1" /> 
                      Statement processed successfully!
                    </p>
                    <div className="mt-4">
                      <Button
                        className="w-full gap-2"
                        onClick={resetUpload}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Another
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Upload Card */}
      <Card className={cn(
        "transition-all duration-300 border-2",
        isDragging ? "border-primary/50 bg-primary/5" : "border-border bg-card"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg">
            <div className="mb-4 p-4 rounded-full bg-muted/50 animate-float">
              <Image className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Upload Statement Image</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Take a photo or upload an image of your bank statement
            </p>
            <Button 
              onClick={() => document.getElementById('image-upload')?.click()}
              size="lg"
              className="gap-2 animate-scale-in"
            >
              <Image className="w-4 h-4" />
              Browse Images
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <div className="col-span-full">
          <div className="flex items-center">
            <div className="animate-spin mr-3">
              <File className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Processing...</p>
              <div className="h-1 w-full bg-muted mt-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary/80 rounded-full transition-all duration-300"
                  style={{ width: `${extractionProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Extracting transactions ({Math.round(extractionProgress)}%)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadCard;
