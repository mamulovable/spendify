/**
 * This service acts as a proxy to the Gemini API to better handle authentication 
 * and error reporting for both text and vision-based models.
 */

// Mock responses for when the API is not available
const mockResponses = {
  text: "This is a mock response because the Gemini API is not available. Please check your API key configuration.",
  image: `{
    "transactions": [
      {
        "date": "2023-01-01",
        "description": "Sample Transaction 1",
        "amount": 100.00,
        "type": "income",
        "category": "salary"
      },
      {
        "date": "2023-01-02",
        "description": "Sample Transaction 2",
        "amount": 50.00,
        "type": "expense",
        "category": "groceries"
      }
    ],
    "summary": {
      "totalIncome": 100.00,
      "totalExpenses": 50.00,
      "period": {
        "startDate": "2023-01-01",
        "endDate": "2023-01-31"
      }
    }
  }`
};

// Flag to track if we should use mock responses
let useMockResponses = false;

/**
 * Base function to call the Gemini API with proper error handling
 */
async function callGeminiAPI(
  endpoint: string,
  apiVersion: string = 'v1beta',
  body: any,
  model: string = 'gemini-1.5-flash'
) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('Gemini API key is not configured, using mock responses');
    useMockResponses = true;
    return { candidates: [{ content: { parts: [{ text: mockResponses.text }] } }] };
  }
  
  // Validate API key format
  if (!apiKey.startsWith('AIzaSy') || apiKey.length < 35) {
    console.error('Invalid Gemini API key format. The key should start with "AIzaSy" and be about 39 characters long.');
    console.warn('Using mock responses due to invalid API key format');
    useMockResponses = true;
    return { candidates: [{ content: { parts: [{ text: "Your Gemini API key appears to be invalid. Please check the .env file and make sure you have a valid API key from Google AI Studio (https://aistudio.google.com/)." }] } }] };
  }
  
  console.log(`Using Gemini API key: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`API Key length: ${apiKey.length}`);
  
  // Full endpoint URL with API key as query parameter
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:${endpoint}?key=${apiKey}`;
  
  try {
    console.log(`Calling Gemini API: ${url.replace(apiKey, 'REDACTED')}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { rawError: errorText };
      }
      
      console.error('Gemini API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      // If we get a 401 error, switch to mock responses
      if (response.status === 401) {
        console.warn('Authentication error with Gemini API, using mock responses');
        useMockResponses = true;
        return { candidates: [{ content: { parts: [{ text: "Authentication error with Gemini API. Your API key may be invalid or expired. Please check the .env file and make sure you have a valid API key from Google AI Studio (https://aistudio.google.com/)." }] } }] };
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // If there's any error, switch to mock responses
    console.warn('Error with Gemini API, using mock responses');
    useMockResponses = true;
    return { candidates: [{ content: { parts: [{ text: mockResponses.text }] } }] };
  }
}

/**
 * Generate content using the Gemini text model
 */
export async function generateText(prompt: string, temperature: number = 0.2) {
  if (useMockResponses) {
    return mockResponses.text;
  }
  
  const response = await callGeminiAPI('generateContent', 'v1beta', {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature,
      topK: 5,
      topP: 0.5,
      maxOutputTokens: 2048,
    }
  });
  
  if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response format from Gemini API');
  }
  
  return response.candidates[0].content.parts[0].text;
}

/**
 * Generate content using the Gemini vision model (text + image)
 */
export async function generateFromImage(
  prompt: string, 
  imageBase64: string,
  temperature: number = 0.1
) {
  if (useMockResponses) {
    return mockResponses.image;
  }
  
  // Make sure image data is properly formatted
  const imageData = imageBase64.startsWith('data:') 
    ? imageBase64.split(',')[1] 
    : imageBase64;
    
  const response = await callGeminiAPI('generateContent', 'v1beta', {
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
      temperature,
      topK: 1,
      topP: 0.1,
      maxOutputTokens: 4096,
    }
  });
  
  if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response format from Gemini API');
  }
  
  return response.candidates[0].content.parts[0].text;
} 