export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatCategoryName = (category) => {
  if (!category) return '';
  const map = {
    smartphones: 'Smartphones',
    laptops: 'Laptops',
    headphones: 'Headphones',
    smartwatches: 'Smartwatches',
    monitors: 'Monitors',
    tablets: 'Tablets',
  };
  return map[category.toLowerCase()] || category;
};
