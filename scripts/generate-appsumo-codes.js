// Generate AppSumo codes for different plan types
function generateAppSumoCodes() {
  const planCounts = {
    'basic_ltd': 1500,
    'premium_ltd': 1000,
    'ultimate_ltd': 500
  };
  
  const prefixes = {
    'basic_ltd': 'AS-BAS',
    'premium_ltd': 'AS-PRE',
    'ultimate_ltd': 'AS-ULT'
  };
  
  let allCodes = [];
  
  // Generate codes for each plan type
  for (const [plan, count] of Object.entries(planCounts)) {
    for (let i = 1; i <= count; i++) {
      const paddedNumber = String(i).padStart(11, '0');
      const code = `${prefixes[plan]}${paddedNumber}`;
      allCodes.push(code);
    }
  }
  
  return allCodes;
}

// Export codes to console
const codes = generateAppSumoCodes();
console.log(codes.join('\n'));