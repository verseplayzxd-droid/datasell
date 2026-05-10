const generateReferralCode = (name) => {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DS-${clean}-${rand}`;
};

const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

module.exports = { generateReferralCode, formatCurrency };
