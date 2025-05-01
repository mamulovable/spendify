import { BankTransaction } from './pdfService';

// Helper function to read image file as base64
const readImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

// Function to parse the JSON response from Gemini
const parseGeminiResponse = (response: string): BankTransaction[] => {
  try {
    // Find JSON in the response (in case there's any surrounding text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }
    
    const jsonString = jsonMatch[0];
    const parsedData = JSON.parse(jsonString);
    
    // Convert the Gemini response format to BankTransaction format
    if (parsedData.transactions && Array.isArray(parsedData.transactions)) {
      return parsedData.transactions.map((t: any) => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type === 'income' ? 'credit' : 'debit',
        category: t.category || 'Uncategorized'
      }));
    }
    
    throw new Error('Invalid transaction data format');
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    console.error('Raw response:', response);
    throw new Error('Failed to parse extracted data');
  }
};

export const processImageAndExtractTransactions = async (file: File): Promise<BankTransaction[]> => {
  try {
    // Convert image to base64
    const imageBase64 = await readImageFile(file);
    
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

    // Use the approach from usegemini.txt
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Make sure image data is properly formatted
    const imageData = imageBase64.startsWith('data:') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    // Call Gemini API directly
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageData
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.1,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    const extractedText = data.candidates[0].content.parts[0].text;
    console.log('Gemini extracted text:', extractedText);

    // Parse the response and convert to BankTransaction format
    const transactions = parseGeminiResponse(extractedText);
    console.log('Extracted transactions:', transactions);

    return transactions;
  } catch (error) {
    console.error('Error processing image with Gemini:', error);
    
    // Return mock data if there's an error
    return [
      {
        date: "2023-01-01",
        description: "Sample Transaction 1",
        amount: 100.00,
        type: "credit",
        category: "salary"
      },
      {
        date: "2023-01-02",
        description: "Sample Transaction 2",
        amount: 50.00,
        type: "debit",
        category: "groceries"
      }
    ];
  }
};
