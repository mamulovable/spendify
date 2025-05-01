import { supabase } from '@/lib/supabase';
import { generateFromImage } from './geminiProxyService';

export interface ExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
}

export interface ExtractionResult {
  transactions: ExtractedTransaction[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    period: {
      startDate: string;
      endDate: string;
    };
  };
}

export const bankStatementService = {
  async extractTransactions(imageBase64: string): Promise<ExtractionResult> {
    try {
      // Prepare the prompt for Gemini
      const prompt = `
        You are a financial data extraction expert. Analyze this bank statement image and:
        1. Extract all transactions with their dates, descriptions, and amounts
        2. Determine if each transaction is income or expense
        3. Suggest a category for each transaction
        4. Format the data as a valid JSON object

        Required JSON format:
        {
          "transactions": [
            {
              "date": "YYYY-MM-DD",
              "description": "string",
              "amount": number,
              "type": "income" | "expense",
              "category": "string"
            }
          ],
          "summary": {
            "totalIncome": number,
            "totalExpenses": number,
            "period": {
              "startDate": "YYYY-MM-DD",
              "endDate": "YYYY-MM-DD"
            }
          }
        }

        Rules:
        1. Ensure all dates are in YYYY-MM-DD format
        2. All amounts should be positive numbers
        3. Use "income" for deposits and "expense" for withdrawals
        4. Categorize transactions into: groceries, utilities, rent, salary, entertainment, transport, etc.
        5. Remove any personal identifying information
        6. Ensure the JSON is valid and properly formatted
        7. Make sure the output is only the JSON, with no additional text

        Extract all visible transactions from the image and return them as JSON.
      `;

      console.log("Image data length:", imageBase64.length);

      // Use the proxy service to call Gemini API with the image
      const extractedText = await generateFromImage(prompt, imageBase64, 0.1);

      // Parse the JSON response
      try {
        // Find JSON in the response (in case there's any surrounding text)
        const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in the response');
        }
        
        const jsonString = jsonMatch[0];
        const parsedData: ExtractionResult = JSON.parse(jsonString);
        return this.validateAndCleanData(parsedData);
      } catch (error) {
        console.error('Error parsing Gemini response:', error);
        console.error('Raw response:', extractedText);
        throw new Error('Failed to parse extracted data');
      }
    } catch (error) {
      console.error('Error extracting transactions:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to extract transactions: ${error.message}`);
      }
      throw error;
    }
  },

  validateAndCleanData(data: ExtractionResult): ExtractionResult {
    // Validate and clean each transaction
    const cleanTransactions = data.transactions.map(transaction => ({
      date: this.validateDate(transaction.date),
      description: this.sanitizeDescription(transaction.description),
      amount: Math.abs(Number(transaction.amount)),
      type: this.validateTransactionType(transaction.type),
      category: this.validateCategory(transaction.category)
    }));

    // Recalculate summary
    const summary = {
      totalIncome: cleanTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: cleanTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      period: {
        startDate: this.validateDate(data.summary.period.startDate),
        endDate: this.validateDate(data.summary.period.endDate)
      }
    };

    return {
      transactions: cleanTransactions,
      summary
    };
  },

  validateDate(date: string): string {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return parsed.toISOString().split('T')[0];
  },

  sanitizeDescription(description: string): string {
    return description
      .replace(/[^\w\s\-.,&()]/g, '') // Remove special characters except basic punctuation
      .trim()
      .slice(0, 100); // Limit length
  },

  validateTransactionType(type: string): 'income' | 'expense' {
    return type === 'income' ? 'income' : 'expense';
  },

  validateCategory(category?: string): string {
    const validCategories = [
      'groceries', 'utilities', 'rent', 'salary', 'entertainment',
      'transport', 'shopping', 'healthcare', 'other'
    ];
    return validCategories.includes(category?.toLowerCase() || '')
      ? category.toLowerCase()
      : 'other';
  },

  async saveTransactions(userId: string, transactions: ExtractedTransaction[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert(
          transactions.map(t => ({
            user_id: userId,
            date: t.date,
            description: t.description,
            amount: t.amount,
            type: t.type,
            category: t.category,
            source: 'bank_statement'
          }))
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error saving transactions:', error);
      throw error;
    }
  }
}; 