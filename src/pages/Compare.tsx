import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSavedAnalyses } from '@/services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, Download } from 'lucide-react';
import { SavedAnalysis } from '@/types';
import Dashboard from '@/pages/Dashboard';
import { generateComparisonPDF } from '@/utils/pdfUtils';

export interface ComparisonData {
  category: string;
  [key: string]: string | number; // Allow dynamic keys for analysis titles
}

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category?: string;
}

function ComparePage() {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [selectedAnalysis1, setSelectedAnalysis1] = useState<string>('');
  const [selectedAnalysis2, setSelectedAnalysis2] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedAnalyses = async () => {
      try {
        const analyses = await getSavedAnalyses();
        setSavedAnalyses(analyses);
        setLoading(false);
      } catch (err) {
        setError('Failed to load saved analyses');
        setLoading(false);
      }
    };

    loadSavedAnalyses();
  }, []);

  const analysis1 = savedAnalyses.find(a => a.id === selectedAnalysis1);
  const analysis2 = savedAnalyses.find(a => a.id === selectedAnalysis2);

  const prepareComparisonData = (): ComparisonData[] => {
    if (!analysis1?.transactions || !analysis2?.transactions) return [];

    const result: ComparisonData[] = [];
    const categories = new Set<string>();

    // Collect all categories
    analysis1.transactions.forEach(tx => categories.add(tx.category || 'Miscellaneous'));
    analysis2.transactions.forEach(tx => categories.add(tx.category || 'Miscellaneous'));

    // Calculate totals for each category
    categories.forEach(category => {
      const amount1 = analysis1.transactions
        .filter(tx => (tx as Transaction).type === 'debit' && (tx.category || 'Miscellaneous') === category)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const amount2 = analysis2.transactions
        .filter(tx => (tx as Transaction).type === 'debit' && (tx.category || 'Miscellaneous') === category)
        .reduce((sum, tx) => sum + tx.amount, 0);

      result.push({
        category,
        [analysis1.name]: amount1,
        [analysis2.name]: amount2,
        difference: Math.abs(amount1 - amount2)
      });
    });

    return result.sort((a, b) => a.category.localeCompare(b.category));
  };

  const downloadPDF = async () => {
    if (!analysis1 || !analysis2) return;

    try {
      const comparisonData = prepareComparisonData();
      const doc = generateComparisonPDF(analysis1, analysis2, comparisonData);
      doc.save(`expense-comparison-${analysis1.name}-vs-${analysis2.name}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <Dashboard>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">{error}</p>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Compare Analyses</h1>
          {selectedAnalysis1 && selectedAnalysis2 && analysis1 && analysis2 && (
            <Button
              onClick={downloadPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">First Analysis</h2>
            <Select value={selectedAnalysis1} onValueChange={setSelectedAnalysis1}>
              <SelectTrigger>
                <SelectValue placeholder="Select first analysis" />
              </SelectTrigger>
              <SelectContent>
                {savedAnalyses.map((analysis) => (
                  <SelectItem key={analysis.id} value={analysis.id}>
                    {analysis.name} - {new Date(analysis.date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Second Analysis</h2>
            <Select value={selectedAnalysis2} onValueChange={setSelectedAnalysis2}>
              <SelectTrigger>
                <SelectValue placeholder="Select second analysis" />
              </SelectTrigger>
              <SelectContent>
                {savedAnalyses.map((analysis) => (
                  <SelectItem key={analysis.id} value={analysis.id}>
                    {analysis.name} - {new Date(analysis.date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedAnalysis1 && selectedAnalysis2 && analysis1 && analysis2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Summary Comparison</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Income</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">{analysis1.name}</p>
                          <p className="text-2xl font-bold">
                            ${analysis1.totalIncome.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{analysis2.name}</p>
                          <p className="text-2xl font-bold">
                            ${analysis2.totalIncome.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">{analysis1.name}</p>
                          <p className="text-2xl font-bold">
                            ${analysis1.totalExpense.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{analysis2.name}</p>
                          <p className="text-2xl font-bold">
                            ${analysis2.totalExpense.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Key Differences</h3>
                  <div className="space-y-2">
                    <p>
                      Income Difference: $
                      {Math.abs(analysis1.totalIncome - analysis2.totalIncome).toLocaleString()}
                      {analysis1.totalIncome > analysis2.totalIncome ? ' higher' : ' lower'} in {analysis1.name}
                    </p>
                    <p>
                      Expense Difference: $
                      {Math.abs(analysis1.totalExpense - analysis2.totalExpense).toLocaleString()}
                      {analysis1.totalExpense > analysis2.totalExpense ? ' higher' : ' lower'} in {analysis1.name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Category Comparison</h3>
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareComparisonData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={analysis1.name} fill="#4F46E5" />
                      <Bar dataKey={analysis2.name} fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Detailed Category Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-2">Category</th>
                        <th className="text-right p-2">{analysis1.name}</th>
                        <th className="text-right p-2">{analysis2.name}</th>
                        <th className="text-right p-2">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prepareComparisonData().map((item) => (
                        <tr key={item.category} className="border-t">
                          <td className="p-2">{item.category}</td>
                          <td className="text-right p-2">
                            ${(item[analysis1.name] as number).toLocaleString()}
                          </td>
                          <td className="text-right p-2">
                            ${(item[analysis2.name] as number).toLocaleString()}
                          </td>
                          <td className="text-right p-2">
                            ${Math.abs((item[analysis1.name] as number) - (item[analysis2.name] as number)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Dashboard>
  );
}

export default ComparePage; 