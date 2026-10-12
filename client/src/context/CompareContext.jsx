import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const [comparedProducts, setComparedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('smartcart_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareNotice, setCompareNotice] = useState(null);

  useEffect(() => {
    localStorage.setItem('smartcart_compare', JSON.stringify(comparedProducts));
  }, [comparedProducts]);

  const addToCompare = (product) => {
    if (!product) return;

    if (comparedProducts.some(p => p._id === product._id)) {
      setCompareNotice({ type: 'info', message: 'Product is already in your comparison tray.' });
      return;
    }

    if (comparedProducts.length >= 4) {
      setCompareNotice({ type: 'warning', message: 'You can compare a maximum of 4 products at once.' });
      return;
    }

    // Category consistency check
    if (comparedProducts.length > 0) {
      const currentCategory = comparedProducts[0].category?.toLowerCase();
      if (product.category?.toLowerCase() !== currentCategory) {
        setCompareNotice({
          type: 'error',
          message: `Cannot compare ${product.category} with ${currentCategory}. Clear existing items or compare within the same category.`,
        });
        return;
      }
    }

    setComparedProducts([...comparedProducts, product]);
    setCompareNotice({ type: 'success', message: `Added "${product.name}" to comparison.` });
  };

  const removeFromCompare = (productId) => {
    setComparedProducts(comparedProducts.filter(p => p._id !== productId));
  };

  const clearCompare = () => {
    setComparedProducts([]);
  };

  const isInCompare = (productId) => {
    return comparedProducts.some(p => p._id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        comparedProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        compareNotice,
        clearCompareNotice: () => setCompareNotice(null),
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within a CompareProvider');
  return context;
};
