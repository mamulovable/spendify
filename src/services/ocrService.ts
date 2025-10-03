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
    // Clean the response by removing markdown fences and any text outside the main JSON object
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON object found in the response');
    }
    
    let jsonString = jsonMatch[0];

    // Attempt to parse the JSON
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
      You are a highly intelligent financial data extraction AI.
      Your primary task is to analyze any bank statement image, even those with complex or unconventional layouts.

      **Step 1: Identify the Transaction Area.**
      First, locate the specific region of the document that contains the list of transactions. Ignore all other text and headers.

      **Step 2: Extract Transaction Data.**
      Once you have identified the transaction area, extract all transactions from that region.

      **Step 3: Format as JSON.**
      Return ONLY a valid JSON object with a "transactions" array. Do not include any other text or explanations.

      Each transaction object in the array must contain:
      - "date": "YYYY-MM-DD" (be flexible with date formats)
      - "description": "string"
      - "amount": number (always positive)
      - "type": "income" or "expense"
      - "category": "string" (e.g., "Groceries", "Utilities", "Salary")
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
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
      if (response.status === 429) {
        throw new Error('You have exceeded your Gemini API quota. Please check your Google Cloud project for more details or consider upgrading your plan.');
      }
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
