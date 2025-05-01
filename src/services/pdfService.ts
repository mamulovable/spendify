
import * as pdfjs from 'pdfjs-dist';

// Get the version of pdfjs being used
const pdfJsVersion = pdfjs.version;
console.log('Using PDF.js version:', pdfJsVersion);

// Configure the worker using the correct approach for PDF.js v3.x
if (typeof window !== 'undefined') {
  // PDF.js 3.x uses a different worker file name and path structure
  // We'll use unpkg CDN with exact version match to ensure compatibility
  const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfJsVersion}/build/pdf.worker.min.js`;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  console.log(`PDF.js worker configured: ${workerSrc}`);
}

// Export interfaces
export interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category?: string;
  balance?: number;
  reference?: string;
  channel?: string;
}

export interface ProcessedStatement {
  transactions: BankTransaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  startDate?: string;
  endDate?: string;
  accountName?: string;
  accountNumber?: string;
}

/**
 * Extracts text content from a PDF file with improved line breaks handling
 */
export const extractTextFromPdf = async (file: File): Promise<string[]> => {
  console.log('Starting PDF extraction for file:', file.name, 'Size:', file.size);
  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log('File loaded as ArrayBuffer');
    
    // Load the PDF with proper configuration
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      // Using standard PDF.js config
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfJsVersion}/cmaps/`,
      cMapPacked: true
    });
    
    try {
      const pdf = await loadingTask.promise;
      console.log('PDF document loaded with', pdf.numPages, 'pages');
      
      const numPages = pdf.numPages;
      const textContent: string[] = [];
      
      for (let i = 1; i <= numPages; i++) {
        console.log(`Processing page ${i} of ${numPages}`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Extract text with line breaks preserved
        let lastY = null;
        let text = '';
        
        // Process text by lines based on y-position
        for (const item of content.items) {
          const itemObj = item as any;
          if (lastY !== null && lastY !== itemObj.transform[5]) {
            text += '\n'; // Add line break when y-position changes
          }
          text += itemObj.str;
          lastY = itemObj.transform[5];
        }
        
        console.log(`Extracted ${text.length} characters from page ${i}`);
        textContent.push(text);
      }
      
      console.log('PDF extraction complete. Total content length:', 
        textContent.reduce((sum, text) => sum + text.length, 0));
      
      return textContent;
    } catch (error) {
      console.warn('Primary extraction method failed:', error);
      
      // Try an alternative approach
      try {
        const pdf = await pdfjs.getDocument(arrayBuffer).promise;
        console.log('PDF loaded with alternative method, pages:', pdf.numPages);
        
        const numPages = pdf.numPages;
        const textContent: string[] = [];
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = content.items
            .map((item: any) => item.str)
            .join(' ');
          
          textContent.push(text);
        }
        
        return textContent;
      } catch (fallbackError) {
        console.error('Alternative extraction method also failed:', fallbackError);
        throw fallbackError;
      }
    }
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Process extracted text to identify transactions for Nigerian bank statements
 */
export const processTransactions = (textContent: string[]): ProcessedStatement => {
  console.log('Starting transaction processing from extracted text');
  
  const transactions: BankTransaction[] = [];
  let totalIncome = 0;
  let totalExpense = 0;
  let accountName = '';
  let accountNumber = '';
  
  let statementStartDate: string | undefined;
  let statementEndDate: string | undefined;
  
  // Try to extract statement period and account info from the first page
  if (textContent.length > 0) {
    const firstPage = textContent[0];
    
    // Extract account name
    const accountNameMatch = firstPage.match(/Account Name\s*:\s*([^\n]+)/i) || 
                           firstPage.match(/Account Holder\s*:\s*([^\n]+)/i);
    if (accountNameMatch) {
      accountName = accountNameMatch[1].trim();
      console.log('Found account name/holder:', accountName);
    }
    
    // Extract account number
    const accountNumberMatch = firstPage.match(/Account Number\s*:\s*([0-9]+)/i);
    if (accountNumberMatch) {
      accountNumber = accountNumberMatch[1].trim();
      console.log('Found account number:', accountNumber);
    }
    
    // Extract statement period
    const periodMatch = firstPage.match(/Statement Period\s*:\s*([^\n]+)/i);
    if (periodMatch) {
      const periodText = periodMatch[1].trim();
      console.log('Found statement period:', periodText);
      
      // Try to parse start and end dates from period
      const dateRangeMatch = periodText.match(/([A-Za-z]+\s+\d{1,2},?\s+\d{4})\s*[-–]\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/);
      if (dateRangeMatch) {
        statementStartDate = dateRangeMatch[1];
        statementEndDate = dateRangeMatch[2];
        console.log('Parsed date range:', statementStartDate, 'to', statementEndDate);
      }
    }
  }

  // Process table rows in Nigerian bank statement format
  const tryExtractTable = (text: string) => {
    // Find common transaction table headers
    const tableHeaders = [
      'Date\\s+Description\\s+Type\\s+Amount\\s+Balance',
      'Trans Date\\s+Value Date\\s+Description\\s+Debit/Credit\\s+Balance',
      'Date\\s+Description\\s+Withdrawals\\s+Deposits\\s+Balance',
      'Date\\s+Details\\s+Debit\\s+Credit\\s+Balance'
    ];
    
    let hasTable = false;
    for (const headerPattern of tableHeaders) {
      if (new RegExp(headerPattern, 'i').test(text)) {
        hasTable = true;
        break;
      }
    }
    
    if (hasTable || text.includes('Transaction History')) {
      console.log('Found transaction table header - using enhanced table parsing logic');
      
      // Split content by lines
      const lines = text.split('\n');
      
      // Detect table start by finding a line that has multiple column headers
      let tableStartIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/Date|Trans Date|Description|Type|Amount|Balance|Debit|Credit|Withdrawals|Deposits/gi) 
            && lines[i].match(/(Date|Trans Date|Description|Type|Amount|Balance|Debit|Credit|Withdrawals|Deposits)/gi)?.length >= 3) {
          tableStartIndex = i;
          console.log('Found table header row at line', i, ':', lines[i]);
          break;
        }
      }
      
      if (tableStartIndex === -1) {
        // Try to find a line with "Transaction History" which often precedes the table
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('Transaction History')) {
            // The header is usually 1-3 lines after this title
            for (let j = i + 1; j <= i + 3 && j < lines.length; j++) {
              if (lines[j].match(/(Date|Description|Type|Amount|Balance|Debit|Credit)/gi)?.length >= 3) {
                tableStartIndex = j;
                console.log('Found table header after "Transaction History" at line', j, ':', lines[j]);
                break;
              }
            }
            break;
          }
        }
      }
      
      if (tableStartIndex >= 0) {
        // Determine the columns from the header
        const headerLine = lines[tableStartIndex];
        console.log('Analyzing header:', headerLine);
        
        // Identify column positions
        const headerPositions: {name: string, start: number, end: number}[] = [];
        
        // Common column names and their variations
        const columnPatterns = [
          { name: 'date', pattern: /\b(Date|Trans Date)\b/i },
          { name: 'description', pattern: /\b(Description|Details|Narration|Particulars)\b/i },
          { name: 'type', pattern: /\b(Type|Trans Type)\b/i },
          { name: 'debit', pattern: /\b(Debit|Withdrawal|Withdrawals|Out|Expense)\b/i },
          { name: 'credit', pattern: /\b(Credit|Deposit|Deposits|In|Income)\b/i },
          { name: 'amount', pattern: /\b(Amount|Amt)\b/i },
          { name: 'balance', pattern: /\b(Balance|Bal|Ending Balance)\b/i }
        ];

        // Try to find the positions of each column in the header
        for (const colInfo of columnPatterns) {
          const matches = [...headerLine.matchAll(new RegExp(colInfo.pattern, 'gi'))];
          for (const match of matches) {
            if (match.index !== undefined) {
              // Estimate the end of this column - either the start of the next word after a space, or end of line
              const nextWordMatch = headerLine.substring(match.index + match[0].length).match(/\s+\S/);
              const end = nextWordMatch 
                  ? match.index + match[0].length + nextWordMatch.index + 1 
                  : headerLine.length;
              
              headerPositions.push({
                name: colInfo.name,
                start: match.index,
                end: end
              });
              
              console.log(`Found column "${colInfo.name}" at position ${match.index}-${end}`);
            }
          }
        }
        
        // Sort header positions by start position
        headerPositions.sort((a, b) => a.start - b.start);
        
        // Now process each line after the header as a potential transaction
        for (let i = tableStartIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Skip empty lines or lines that don't look like transaction rows
          if (line.length < 5 || !/\d/.test(line)) continue;
          
          // Skip lines that look like page headers or footers
          if (line.match(/page|statement|generated|report|summary|total|balance/i) && !line.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/)) continue;
          
          try {
            // Extract values from each column based on positions
            const rowValues: Record<string, string> = {};
            
            for (let j = 0; j < headerPositions.length; j++) {
              const col = headerPositions[j];
              const nextCol = headerPositions[j + 1];
              
              // Get text in this column range
              let value = '';
              if (nextCol) {
                // If there's another column, extract text between this column start and next column start
                value = line.substring(
                  Math.min(col.start, line.length), 
                  Math.min(nextCol.start, line.length)
                ).trim();
              } else {
                // If this is the last column, take everything to the end
                value = line.substring(Math.min(col.start, line.length)).trim();
              }
              
              // If positions don't work well due to varied formatting, do a fallback
              if (!value && j === 0 && col.name === 'date') {
                // Try to extract date at the beginning
                const dateMatch = line.match(/^(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}[-\s][A-Za-z]{3}[-\s]\d{2,4})/);
                if (dateMatch) {
                  value = dateMatch[0];
                }
              }
              
              rowValues[col.name] = value;
            }
            
            console.log('Extracted row values:', rowValues);
            
            // Determine if we have a valid transaction
            if (rowValues.date && (rowValues.amount || rowValues.debit || rowValues.credit)) {
              let transDate = rowValues.date;
              let description = rowValues.description || '';
              let transType: 'debit' | 'credit' = 'debit';
              let amount = 0;
              let balance = parseFloat(rowValues.balance?.replace(/[^\d.-]/g, '') || '0');
              
              // Parse amount
              if (rowValues.amount) {
                const cleanAmount = rowValues.amount.replace(/[^\d.-]/g, '');
                amount = parseFloat(cleanAmount || '0');
                
                // Determine transaction type based on the type column or description
                if (rowValues.type) {
                  transType = rowValues.type.toLowerCase().includes('credit') ? 'credit' : 'debit';
                } else if (description.toLowerCase().includes('credit') || 
                          description.toLowerCase().includes('deposit')) {
                  transType = 'credit';
                }
              } 
              // If separate debit/credit columns
              else if (rowValues.debit || rowValues.credit) {
                if (rowValues.debit && rowValues.debit.replace(/[^\d.-]/g, '')) {
                  amount = parseFloat(rowValues.debit.replace(/[^\d.-]/g, '') || '0');
                  transType = 'debit';
                } else if (rowValues.credit && rowValues.credit.replace(/[^\d.-]/g, '')) {
                  amount = parseFloat(rowValues.credit.replace(/[^\d.-]/g, '') || '0');
                  transType = 'credit';
                }
              }
              
              // Only add if we have a valid amount
              if (amount > 0) {
                const transaction: BankTransaction = {
                  date: transDate,
                  description,
                  amount,
                  type: transType,
                  balance,
                  category: categorizeTransaction(description)
                };
                
                if (transType === 'credit') {
                  totalIncome += amount;
                } else {
                  totalExpense += amount;
                }
                
                console.log(`Found transaction from table: ${transDate} | ${description} | ${amount} | ${transType}`);
                transactions.push(transaction);
              }
            }
          } catch (err) {
            console.warn('Error processing transaction row:', err);
          }
        }
      }
    }
  };
  
  // Try to find tables in each page
  textContent.forEach((pageText, index) => {
    console.log(`Looking for transaction tables in page ${index + 1}`);
    tryExtractTable(pageText);
  });

  // If no transactions were found with table parsing, try line-by-line parsing with Nigerian patterns
  if (transactions.length === 0) {
    console.log('No transactions found with table parsing, trying line-by-line approach');
    
    // Multiple patterns to match transactions in different formats for Nigerian banks
    const patterns = [
      // Pattern for Nigerian bank transfers
      /(\d{1,2}\s+\w+\s+\d{4})\s+(\d{1,2}\s+\w+\s+\d{4})\s+Transfer\s+(to|from)\s+(.*?)\s+([-+]?[0-9,.]+)\s+([0-9,.]+)/gi,
      
      // Pattern for airtime and other transactions
      /(\d{1,2}\s+\w+\s+\d{4})\s+(\d{1,2}\s+\w+\s+\d{4})\s+Airtime\s+([-+]?[0-9,.]+)\s+([0-9,.]+)/gi,
      
      // Pattern for USSD transactions
      /(\d{1,2}\s+\w+\s+\d{4})\s+(\d{1,2}\s+\w+\s+\d{4})\s+USSD\s+Charge\s+([-+]?[0-9,.]+)\s+([0-9,.]+)/gi
    ];
    
    // Process each page with patterns
    textContent.forEach((pageText, pageIndex) => {
      console.log(`Trying pattern matching on page ${pageIndex + 1}`);
      
      for (const pattern of patterns) {
        let match;
        pattern.lastIndex = 0; // Reset regex index
        
        while ((match = pattern.exec(pageText)) !== null) {
          try {
            const transDate = match[1];
            const valueDate = match[2];
            let description = '';
            let amountStr = '';
            let balanceStr = '';
            
            if (pattern.source.includes('Transfer')) {
              const direction = match[3]; // "to" or "from"
              const partyName = match[4];
              description = `Transfer ${direction} ${partyName}`;
              amountStr = match[5];
              balanceStr = match[6];
            } else if (pattern.source.includes('Airtime')) {
              description = 'Airtime';
              amountStr = match[3];
              balanceStr = match[4];
            } else if (pattern.source.includes('USSD')) {
              description = 'USSD Charge';
              amountStr = match[3];
              balanceStr = match[4];
            }
            
            // Determine type and amount
            let type: 'debit' | 'credit' = 'debit';
            let amount = 0;
            
            if (amountStr.startsWith('+')) {
              type = 'credit';
              amount = parseFloat(amountStr.replace(/[+₦,]/g, ''));
              totalIncome += amount;
            } else if (amountStr.startsWith('-')) {
              type = 'debit';
              amount = parseFloat(amountStr.replace(/[-₦,]/g, ''));
              totalExpense += amount;
            } else {
              // If no prefix, determine by description
              if (description.toLowerCase().includes('from')) {
                type = 'credit';
              } else {
                type = 'debit';
              }
              amount = parseFloat(amountStr.replace(/[₦,]/g, ''));
              
              if (type === 'credit') {
                totalIncome += amount;
              } else {
                totalExpense += amount;
              }
            }
            
            const balance = parseFloat(balanceStr.replace(/[₦,]/g, ''));
            
            // Create transaction object
            const transaction: BankTransaction = {
              date: valueDate,
              description,
              amount,
              type,
              balance,
              category: categorizeTransaction(description)
            };
            
            console.log(`Found transaction with pattern: ${valueDate} | ${description} | ${amount} | ${type}`);
            transactions.push(transaction);
          } catch (error) {
            console.warn('Error processing pattern match:', error);
          }
        }
      }
    });
  }

  // If still no transactions found, try to find structured transaction data
  if (transactions.length === 0) {
    console.log('Trying to extract structured transaction data from account summary information');
    
    // Look for account summary sections in each page
    textContent.forEach((pageText) => {
      // Look for total deposits/withdrawals in summary
      const depositMatch = pageText.match(/Total Deposits:?\s*([^0-9]*)([\d,.]+)/i);
      const withdrawalMatch = pageText.match(/Total Withdrawals:?\s*([^0-9]*)([\d,.]+)/i);
      
      if (depositMatch && withdrawalMatch) {
        console.log('Found account summary with deposits and withdrawals');
        
        // Extract total values
        const totalDepositsStr = depositMatch[2].replace(/[,]/g, '');
        const totalWithdrawalsStr = withdrawalMatch[2].replace(/[,]/g, '');
        
        // Try to parse the numbers
        try {
          const totalDeposits = parseFloat(totalDepositsStr);
          const totalWithdrawals = parseFloat(totalWithdrawalsStr);
          
          if (!isNaN(totalDeposits) && !isNaN(totalWithdrawals)) {
            totalIncome += totalDeposits;
            totalExpense += totalWithdrawals;
            console.log(`Using summary totals - Deposits: ${totalDeposits}, Withdrawals: ${totalWithdrawals}`);
          }
        } catch (err) {
          console.warn('Error parsing summary totals:', err);
        }
      }
      
      // Try to find individual transactions in tabular format - look for date patterns at line start
      const lines = pageText.split('\n');
      
      // Check if this might be a table - look for multiple date-like entries
      const datePatterns = [
        /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/, // dd/mm/yyyy or dd-mm-yyyy format
        /^\d{1,2}[-\s][A-Za-z]{3}[-\s]\d{2,4}/, // dd-MMM-yyyy format
        /^\d{2}-[A-Za-z]{3}-\d{2}/ // common Nigerian date format: dd-MMM-yy
      ];
      
      let dateLineCount = 0;
      lines.forEach(line => {
        for (const pattern of datePatterns) {
          if (pattern.test(line.trim())) {
            dateLineCount++;
            break;
          }
        }
      });
      
      // If we have multiple date entries, this might be a transaction table
      if (dateLineCount >= 3) {
        console.log(`Found ${dateLineCount} potential transaction rows with date patterns`);
        
        // Process each line as a potential transaction
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          let isDateLine = false;
          
          // Check if this line starts with a date
          for (const pattern of datePatterns) {
            if (pattern.test(line)) {
              isDateLine = true;
              break;
            }
          }
          
          if (isDateLine) {
            try {
              // Parse the line - try to extract date, description, amount, and type
              const parts = line.split(/\s{2,}|\t/); // Split by 2+ spaces or tabs
              
              if (parts.length >= 3) {
                // First part should be the date
                const dateStr = parts[0].trim();
                
                // Description might be the second part or we might need to combine parts
                let description = parts[1].trim();
                let amountIndex = 2;
                
                // If we have many parts, try to detect which ones are the amounts
                if (parts.length > 3) {
                  // Find which parts contain currency values
                  const currencyParts = parts.map((p, idx) => ({
                    text: p.trim(),
                    index: idx,
                    hasCurrency: /[\d,.]+/.test(p.trim()) && !/^[0-9]{1,2}[-/][0-9]{1,2}/.test(p.trim()) // Has numbers but not a date
                  }));
                  
                  const numberParts = currencyParts.filter(p => p.hasCurrency);
                  
                  // If we found some currency parts
                  if (numberParts.length >= 2) {
                    // The description is likely everything between date and first currency value
                    const firstCurrencyIndex = numberParts[0].index;
                    if (firstCurrencyIndex > 1) {
                      description = parts.slice(1, firstCurrencyIndex).join(' ').trim();
                      amountIndex = firstCurrencyIndex;
                    }
                  }
                }
                
                // Try to determine if this is debit or credit
                // In many statements, there are separate columns for debit and credit
                let amount = 0;
                let type: 'debit' | 'credit' = 'debit';
                
                // Check if we have debit/credit column format
                const debitIndex = parts.findIndex(p => 
                  p.trim().match(/^[\d,.]+$/) && !p.trim().match(/^0+[.,]?0*$/) && 
                  (parts[amountIndex].trim() === '' || 
                   parts[amountIndex+1]?.trim() === '')
                );
                
                const creditIndex = parts.findIndex(p => 
                  p.trim().match(/^[\d,.]+$/) && !p.trim().match(/^0+[.,]?0*$/) && 
                  debitIndex >= 0 && p !== parts[debitIndex]
                );
                
                if (debitIndex >= 0 && creditIndex >= 0) {
                  // We have separate debit/credit columns
                  const debitValue = parseFloat(parts[debitIndex].trim().replace(/[^0-9.]/g, ''));
                  const creditValue = parseFloat(parts[creditIndex].trim().replace(/[^0-9.]/g, ''));
                  
                  if (creditValue > 0 && (debitValue === 0 || isNaN(debitValue))) {
                    amount = creditValue;
                    type = 'credit';
                    totalIncome += amount;
                  } else if (debitValue > 0) {
                    amount = debitValue;
                    type = 'debit';
                    totalExpense += amount;
                  }
                }
                // If we couldn't find separate columns, try to determine from description or other clues
                else {
                  // Get amount from the expected position
                  if (amountIndex < parts.length) {
                    const amountStr = parts[amountIndex].trim().replace(/[^0-9.,-]/g, '');
                    amount = parseFloat(amountStr);
                    
                    // Determine type from description or context
                    if (description.toLowerCase().includes('credit') || 
                        description.toLowerCase().includes('deposit') ||
                        description.toLowerCase().includes('salary')) {
                      type = 'credit';
                      totalIncome += amount;
                    } else {
                      totalExpense += amount;
                    }
                  }
                }
                
                // Get balance if available (usually the last number)
                let balance = 0;
                for (let j = parts.length - 1; j >= 0; j--) {
                  const partTxt = parts[j].trim();
                  if (/^[\d,.]+$/.test(partTxt.replace(/[^0-9.,]/g, ''))) {
                    balance = parseFloat(partTxt.replace(/[^0-9.]/g, ''));
                    break;
                  }
                }
                
                // Only add if we have a valid amount
                if (!isNaN(amount) && amount > 0) {
                  const transaction: BankTransaction = {
                    date: dateStr,
                    description,
                    amount,
                    type,
                    balance: isNaN(balance) ? undefined : balance,
                    category: categorizeTransaction(description)
                  };
                  
                  console.log(`Found transaction from structured data: ${dateStr} | ${description} | ${amount} | ${type}`);
                  transactions.push(transaction);
                }
              }
            } catch (err) {
              console.warn('Error processing structured data line:', err);
            }
          }
        }
      }
    });
  }

  // If still no transactions found, check for lines with specific patterns in Nigerian statements
  if (transactions.length === 0) {
    console.log('Trying additional pattern matching for Nigerian bank statements');
    
    textContent.forEach((pageText) => {
      const lines = pageText.split('\n');
      
      lines.forEach(line => {
        // Look for specific patterns in each line
        if (line.includes('Transfer to') || line.includes('Transfer from')) {
          try {
            // Extract dates, typically at the start of the line
            const datePattern = /(\d{1,2}\s+\w+\s+\d{4})/g;
            const dates = [...line.matchAll(datePattern)].map(m => m[0]);
            
            if (dates.length >= 2) {
              const transDate = dates[0];
              const valueDate = dates[1];
              
              // Extract description
              let description = '';
              if (line.includes('Transfer to')) {
                const toMatch = line.match(/Transfer to\s+(.*?)(?=\s+[-+])/);
                description = toMatch ? `Transfer to ${toMatch[1]}` : 'Transfer out';
              } else {
                const fromMatch = line.match(/Transfer from\s+(.*?)(?=\s+[-+])/);
                description = fromMatch ? `Transfer from ${fromMatch[1]}` : 'Transfer in';
              }
              
              // Extract amount
              const amountPattern = /([-+]?[0-9,.]+)/g;
              const amounts = [...line.matchAll(amountPattern)].map(m => m[0]);
              
              if (amounts.length >= 2) {
                const amountStr = amounts[0];
                const balanceStr = amounts[1];
                
                // Determine type and parse amount
                let type: 'debit' | 'credit';
                let amount: number;
                
                if (amountStr.startsWith('-') || line.includes('Transfer to')) {
                  type = 'debit';
                  amount = parseFloat(amountStr.replace(/[-₦,]/g, ''));
                  totalExpense += amount;
                } else {
                  type = 'credit';
                  amount = parseFloat(amountStr.replace(/[+₦,]/g, ''));
                  totalIncome += amount;
                }
                
                const balance = parseFloat(balanceStr.replace(/[₦,]/g, ''));
                
                // Extract channel if available
                const channelMatch = line.match(/(?:E-Channel|USSD|SMS)\s+(\S+)/);
                const channel = channelMatch ? channelMatch[0] : '';
                
                const transaction: BankTransaction = {
                  date: valueDate,
                  description,
                  amount,
                  type,
                  balance,
                  channel,
                  category: categorizeTransaction(description)
                };
                
                console.log(`Found transaction from line: ${valueDate} | ${description} | ${amount} | ${type}`);
                transactions.push(transaction);
              }
            }
          } catch (error) {
            console.warn('Error processing line:', error);
          }
        }
      });
    });
  }

  console.log(`Total transactions extracted: ${transactions.length}`);
  console.log(`Total income: $${totalIncome.toFixed(2)}, Total expense: $${totalExpense.toFixed(2)}`);
  
  // Sort transactions by date (newest first)
  transactions.sort((a, b) => {
    try {
      // Try to normalize date formats for proper sorting
      const dateA = new Date(normalizeDateString(a.date));
      const dateB = new Date(normalizeDateString(b.date));
      
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        console.warn('Invalid date format for sorting:', a.date, b.date);
        return 0;
      }
      
      return dateB.getTime() - dateA.getTime();
    } catch (error) {
      console.warn('Error sorting by date:', error);
      return 0;
    }
  });
  
  return {
    transactions,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    startDate: statementStartDate,
    endDate: statementEndDate,
    accountName,
    accountNumber
  };
};

/**
 * Helper function to normalize date strings for consistent parsing
 */
const normalizeDateString = (dateStr: string): string => {
  // Handle formats like "12 Mar 2025"
  const monthNameFormat = /(\d{1,2})\s+(\w{3})\s+(\d{4})/;
  const monthNameMatch = dateStr.match(monthNameFormat);
  
  if (monthNameMatch) {
    const day = monthNameMatch[1];
    const month = monthNameMatch[2];
    const year = monthNameMatch[3];
    return `${day} ${month} ${year}`;
  }
  
  // Handle dd/mm/yyyy format
  const slashFormat = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
  const slashMatch = dateStr.match(slashFormat);
  
  if (slashMatch) {
    const day = slashMatch[1];
    const month = slashMatch[2];
    const year = slashMatch[3];
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Handle dd-mm-yyyy format
  const dashFormat = /(\d{1,2})-(\d{1,2})-(\d{4})/;
  const dashMatch = dateStr.match(dashFormat);
  
  if (dashMatch) {
    const day = dashMatch[1];
    const month = dashMatch[2];
    const year = dashMatch[3];
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Handle dd-MMM-yy format (common in Nigerian banks)
  const nigerianFormat = /(\d{1,2})-([A-Za-z]{3})-(\d{2})/;
  const nigerianMatch = dateStr.match(nigerianFormat);
  
  if (nigerianMatch) {
    const day = nigerianMatch[1];
    const month = nigerianMatch[2];
    const year = `20${nigerianMatch[3]}`; // Assume 20xx for yy format
    return `${day} ${month} ${year}`;
  }
  
  return dateStr;
};

/**
 * Enhanced categorize function with more categories and keywords
 */
export const categorizeTransaction = (description: string): string => {
  const lowerDesc = description.toLowerCase();
  
  const categories = [
    { name: 'Housing', keywords: ['rent', 'mortgage', 'hoa', 'property', 'housing', 'apartment', 'condo', 'lease', 'tenant'] },
    { name: 'Transportation', keywords: ['gas', 'uber', 'lyft', 'train', 'subway', 'bus', 'car', 'auto', 'vehicle', 'parking', 'toll', 'transport', 'taxi', 'fare'] },
    { name: 'Food & Dining', keywords: ['restaurant', 'café', 'cafe', 'coffee', 'doordash', 'grubhub', 'uber eat', 'food', 'grocery', 'meal', 'supermarket', 'dine', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'purchase', 'mart', 'market', 'pos', 'shop'] },
    { name: 'Shopping', keywords: ['amazon', 'walmart', 'target', 'costco', 'shop', 'store', 'buy', 'purchase', 'retail', 'market', 'mall', 'outlet', 'online', 'ecommerce'] },
    { name: 'Utilities', keywords: ['electric', 'water', 'gas', 'internet', 'phone', 'cell', 'utility', 'utilities', 'bill', 'cable', 'tv', 'service', 'provider', 'broadband'] },
    { name: 'Entertainment', keywords: ['movie', 'netflix', 'hulu', 'spotify', 'disney', 'game', 'entertain', 'theater', 'concert', 'event', 'ticket', 'show', 'streaming', 'subscription'] },
    { name: 'Health', keywords: ['doctor', 'pharmacy', 'medical', 'health', 'insurance', 'dental', 'vision', 'hospital', 'clinic', 'prescription', 'medicine', 'healthcare', 'therapy'] },
    { name: 'Education', keywords: ['tuition', 'book', 'course', 'class', 'school', 'university', 'college', 'education', 'student', 'loan', 'academic', 'degree', 'study'] },
    { name: 'Personal', keywords: ['haircut', 'salon', 'spa', 'gym', 'fitness', 'clothing', 'beauty', 'cosmetic', 'apparel', 'fashion'] },
    { name: 'Telecom', keywords: ['airtime', 'data', 'recharge', 'ussd', 'telecom', 'communication', 'mobile', 'phone', 'cellular', 'network', 'internet'] },
    { name: 'Income', keywords: ['salary', 'payroll', 'deposit', 'direct deposit', 'income', 'revenue', 'payment received', 'wage', 'earnings', 'compensation', 'bonus', 'credit'] },
    { name: 'Investments', keywords: ['invest', 'stock', 'dividend', 'bond', 'mutual fund', 'etf', 'retirement', 'ira', '401k', 'trading', 'portfolio'] },
    { name: 'Debt', keywords: ['loan', 'credit card', 'payment', 'interest', 'debt', 'finance charge', 'late fee', 'minimum payment'] },
    { name: 'Transfers', keywords: ['transfer', 'send money', 'receive money', 'wire', 'zelle', 'venmo', 'cashapp', 'paypal'] },
    { name: 'Cash', keywords: ['atm', 'cash', 'withdraw', 'withdrawal'] }
  ];

  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (lowerDesc.includes(keyword)) {
        return category.name;
      }
    }
  }

  return 'Miscellaneous';
};

/**
 * Main function to process a bank statement PDF
 */
export const processBankStatement = async (file: File): Promise<ProcessedStatement> => {
  console.log('=== PROCESSING BANK STATEMENT ===');
  console.log('File name:', file.name);
  console.log('File size:', (file.size / 1024).toFixed(2), 'KB');
  console.log('File type:', file.type);
  
  try {
    const textContent = await extractTextFromPdf(file);
    console.log('=== PDF TEXT EXTRACTION COMPLETE ===');
    console.log('Extracted', textContent.length, 'pages of text');
    
    // Show sample of first page text for debugging
    if (textContent.length > 0) {
      const firstPageSample = textContent[0].substring(0, 200) + '...';
      console.log('First page sample:', firstPageSample);
    }
    
    const processedData = processTransactions(textContent);
    console.log('=== TRANSACTION PROCESSING COMPLETE ===');
    console.log('Extracted transactions:', processedData.transactions.length);
    
    // If no transactions were found, try one last fallback - look for specific patterns in the Nigerian bank statement
    if (processedData.transactions.length === 0) {
      console.log('No transactions found with regular methods, trying final fallback');
      
      // Extract data from table using a more direct approach
      let fallbackTransactions: BankTransaction[] = [];
      
      // Look for lines that have patterns matching transactions in the PDF shown
      textContent.forEach(pageText => {
        const lines = pageText.split('\n');
        
        lines.forEach(line => {
          // Check for patterns like "Transfer to" or "Transfer from" followed by amounts
          if (line.match(/\d{2}\s+\w{3}\s+\d{4}.*Transfer\s+(to|from)/i)) {
            try {
              // Extract transaction details using more flexible approach
              const dateMatch = line.match(/^(\d{2}\s+\w{3}\s+\d{4})/);
              const isDebit = line.includes('Transfer to') || line.includes('-');
              const isCredit = line.includes('Transfer from') || line.includes('+');
              
              // Find amount using a looser pattern - find numbers with decimal points
              const amountMatches = [...line.matchAll(/[-+]?[\d,]+\.\d{2}/g)].map(m => m[0]);
              
              if (dateMatch && amountMatches.length > 0) {
                const valueDate = dateMatch[0];
                
                // Extract description
                let description = '';
                if (isDebit) {
                  const toMatch = line.match(/Transfer to\s+([^-+]+)/);
                  description = toMatch ? `Transfer to ${toMatch[1].trim()}` : 'Transfer out';
                } else {
                  const fromMatch = line.match(/Transfer from\s+([^-+]+)/);
                  description = fromMatch ? `Transfer from ${fromMatch[1].trim()}` : 'Transfer in';
                }
                
                // Extract amount and balance - typically the first two numbers
                let amount = 0;
                let balance = 0;
                
                // Clean and parse amount - remove currency symbols and commas
                const cleanAmount = amountMatches[0].replace(/[₦,]/g, '').replace(/^[-+]/, '');
                amount = parseFloat(cleanAmount);
                
                if (amountMatches.length > 1) {
                  const cleanBalance = amountMatches[1].replace(/[₦,]/g, '');
                  balance = parseFloat(cleanBalance);
                }
                
                // Extract channel if present
                const channelMatch = line.match(/E-Channel|USSD|SMS/);
                const channel = channelMatch ? channelMatch[0] : '';
                
                // Create transaction
                const transaction: BankTransaction = {
                  date: valueDate,
                  description,
                  amount,
                  type: isDebit ? 'debit' : 'credit',
                  balance,
                  channel,
                  category: categorizeTransaction(description)
                };
                
                console.log(`Fallback found: ${valueDate} | ${description} | ${amount} | ${isDebit ? 'debit' : 'credit'}`);
                fallbackTransactions.push(transaction);
                
                // Update totals
                if (isDebit) {
                  processedData.totalExpense += amount;
                } else {
                  processedData.totalIncome += amount;
                }
              }
            } catch (error) {
              console.warn('Error in fallback transaction parsing:', error);
            }
          }
        });
      });
      
      // Add fallback transactions to the processed data
      if (fallbackTransactions.length > 0) {
        processedData.transactions = fallbackTransactions;
        processedData.balance = processedData.totalIncome - processedData.totalExpense;
        console.log(`Found ${fallbackTransactions.length} transactions using fallback method`);
      }
    }
    
    return processedData;
  } catch (error) {
    console.error('=== ERROR PROCESSING BANK STATEMENT ===');
    console.error('Error details:', error);
    throw new Error(`Failed to process bank statement: ${error instanceof Error ? error.message : String(error)}`);
  }
};
