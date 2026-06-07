export const getStockStatus = (qty: number) => {
    if (qty <= 0) return 'stockout';
    if (qty <= 10) return 'low_stock';
    return 'in_stock';
  };