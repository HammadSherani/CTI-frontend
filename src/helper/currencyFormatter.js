export const formatCurrency = (amount) => {
  let country = 'Turkey'; // Default for seller side
  if (typeof window !== 'undefined') {
    country = localStorage.getItem('selectedCountry') || 'Turkey';
  }
  
  const val = Number(amount) || 0;
  
  if (country?.toLowerCase() === 'turkey') {
    return `${val.toFixed(2)} TRY`; // User requested "TRY"
  }
  
  if (country?.toLowerCase() === 'pakistan') {
     return `Rs. ${val.toFixed(2)}`;
  }

  // Fallback to USD
  return `$${val.toFixed(2)}`;
};
