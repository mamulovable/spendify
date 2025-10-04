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
      You are a financial data extraction AI.
      Analyze the provided bank statement image and extract all transactions.
      Your output MUST be a valid JSON object that adheres to the following schema:
      {
        "type": "object",
        "properties": {
          "transactions": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "date": { "type": "string", "format": "date" },
                "description": { "type": "string" },
                "amount": { "type": "number" },
                "type": { "type": "string", "enum": ["income", "expense"] },
                "category": { "type": "string" }
              },
              "required": ["date", "description", "amount", "type", "category"]
            }
          }
        },
        "required": ["transactions"]
      }
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
          response_mime_type: "application/json",
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
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(`Failed to analyze the statement. Please ensure the image is clear and not a protected document. Error: ${errorMessage}`);
  }
};
