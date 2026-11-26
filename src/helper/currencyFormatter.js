// The platform works only in Turkey, so every price is shown in Turkish lira.
export const formatCurrency = (amount) => `${(Number(amount) || 0).toFixed(2)} TRY`;

// Just the currency label, for input prefixes.
export const getCurrencySymbol = () => 'TRY';
