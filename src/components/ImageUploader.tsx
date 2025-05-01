import { useState } from 'react';
import { processImageAndExtractTransactions } from '@/services/ocrService';
import { BankTransaction } from '@/services/pdfService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { saveAnalysis } from '@/services/storageService';
import { useNavigate } from 'react-router-dom';

export default function ImageUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const extractedTransactions = await processImageAndExtractTransactions(file);
      setTransactions(extractedTransactions);
      toast({
        title: 'Success',
        description: `Extracted ${extractedTransactions.length} transactions from the image.`,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to process the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTransactions = async () => {
    if (transactions.length === 0) {
      toast({
        title: 'No transactions',
        description: 'Please upload and process an image first.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Calculate totals
      const totalIncome = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

      // Group transactions by category
      const categories = transactions.reduce((acc, t) => {
        const existing = acc.find(c => c.category === t.category);
        if (existing) {
          existing.amount += t.amount;
        } else {
          acc.push({ category: t.category, amount: t.amount });
        }
        return acc;
      }, [] as { category: string; amount: number }[]);

      // Create analysis object
      const analysis = {
        id: Date.now().toString(),
        name: `Bank Statement Analysis - ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        totalIncome,
        totalExpense,
        categories,
        transactions,
      };

      await saveAnalysis(
        analysis.name,
        analysis.transactions,
        analysis.totalIncome,
        analysis.totalExpense,
        analysis.categories,
        [] // Empty insights array, will be generated later
      );
      
      toast({
        title: 'Success',
        description: 'Transactions saved successfully.',
      });

      // Navigate to the analysis page
      navigate('/dashboard/analyze');
    } catch (error) {
      console.error('Error saving transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to save transactions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Upload Bank Statement Image</h2>
        <div className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isProcessing}
            className="w-full"
          />
          {isProcessing && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing image...</span>
            </div>
          )}
        </div>
      </Card>

      {transactions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Extracted Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-left py-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{transaction.date}</td>
                    <td className="py-2">{transaction.description}</td>
                    <td className="py-2 text-right">
                      {transaction.amount.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${
                          transaction.type === 'credit'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleSaveTransactions}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Transactions
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
