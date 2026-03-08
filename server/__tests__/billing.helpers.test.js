/**
 * Helper Functions Unit Tests
 * Tests utility functions used in billing calculations
 */

describe('Billing Helper Functions', () => {

  describe('formatCurrency', () => {
    const formatCurrency = (amount) => {
      return `₹${parseFloat(amount).toFixed(2)}`;
    };

    test('should format whole numbers', () => {
      expect(formatCurrency(100)).toBe('₹100.00');
      expect(formatCurrency(1000)).toBe('₹1000.00');
    });

    test('should format decimal numbers', () => {
      expect(formatCurrency(99.99)).toBe('₹99.99');
      expect(formatCurrency(123.5)).toBe('₹123.50');
    });

    test('should round to 2 decimal places', () => {
      expect(formatCurrency(99.999)).toBe('₹100.00');
      expect(formatCurrency(123.456)).toBe('₹123.46');
    });

    test('should handle zero', () => {
      expect(formatCurrency(0)).toBe('₹0.00');
    });

    test('should handle negative numbers', () => {
      expect(formatCurrency(-50.25)).toBe('₹-50.25');
    });
  });

  describe('roundToDecimal', () => {
    const roundToDecimal = (value, decimals = 2) => {
      return parseFloat(value.toFixed(decimals));
    };

    test('should round to 2 decimals by default', () => {
      expect(roundToDecimal(123.456)).toBe(123.46);
      expect(roundToDecimal(99.994)).toBe(99.99);
    });

    test('should round to specified decimals', () => {
      expect(roundToDecimal(123.456, 1)).toBe(123.5);
      expect(roundToDecimal(123.456, 3)).toBe(123.456);
    });

    test('should handle whole numbers', () => {
      expect(roundToDecimal(100)).toBe(100.00);
    });
  });

  describe('calculateSubtotal', () => {
    const calculateSubtotal = (items) => {
      return items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
    };

    test('should calculate subtotal for single item', () => {
      const items = [{ quantity: 5, unitPrice: 100 }];
      expect(calculateSubtotal(items)).toBe(500);
    });

    test('should calculate subtotal for multiple items', () => {
      const items = [
        { quantity: 5, unitPrice: 100 },
        { quantity: 3, unitPrice: 50 },
        { quantity: 2, unitPrice: 75 }
      ];
      expect(calculateSubtotal(items)).toBe(800);
    });

    test('should return 0 for empty array', () => {
      expect(calculateSubtotal([])).toBe(0);
    });

    test('should handle decimal values', () => {
      const items = [
        { quantity: 3, unitPrice: 33.33 }
      ];
      expect(calculateSubtotal(items)).toBeCloseTo(99.99, 2);
    });
  });

  describe('calculateDiscount', () => {
    const calculateDiscount = (subtotal, discountPercentage) => {
      return (subtotal * discountPercentage) / 100;
    };

    test('should calculate percentage discount', () => {
      expect(calculateDiscount(1000, 10)).toBe(100);
      expect(calculateDiscount(500, 20)).toBe(100);
    });

    test('should return 0 for 0% discount', () => {
      expect(calculateDiscount(1000, 0)).toBe(0);
    });

    test('should calculate 100% discount', () => {
      expect(calculateDiscount(1000, 100)).toBe(1000);
    });

    test('should handle decimal discounts', () => {
      expect(calculateDiscount(1000, 12.5)).toBe(125);
    });
  });

  describe('calculateTax', () => {
    const calculateTax = (amount, taxRate) => {
      return (amount * taxRate) / 100;
    };

    test('should calculate 18% GST', () => {
      expect(calculateTax(1000, 18)).toBe(180);
    });

    test('should calculate 12% GST', () => {
      expect(calculateTax(1000, 12)).toBe(120);
    });

    test('should return 0 for 0% tax', () => {
      expect(calculateTax(1000, 0)).toBe(0);
    });

    test('should handle decimal tax rates', () => {
      expect(calculateTax(1000, 5.5)).toBe(55);
    });

    test('should handle decimal amounts', () => {
      const tax = calculateTax(99.99, 18);
      expect(tax).toBeCloseTo(18.00, 2);
    });
  });

  describe('validateQuantity', () => {
    const validateQuantity = (quantity) => {
      return typeof quantity === 'number' && 
             quantity > 0 && 
             Number.isInteger(quantity);
    };

    test('should accept positive integers', () => {
      expect(validateQuantity(1)).toBe(true);
      expect(validateQuantity(10)).toBe(true);
      expect(validateQuantity(100)).toBe(true);
    });

    test('should reject zero', () => {
      expect(validateQuantity(0)).toBe(false);
    });

    test('should reject negative numbers', () => {
      expect(validateQuantity(-1)).toBe(false);
      expect(validateQuantity(-10)).toBe(false);
    });

    test('should reject decimals', () => {
      expect(validateQuantity(1.5)).toBe(false);
      expect(validateQuantity(10.99)).toBe(false);
    });

    test('should reject non-numbers', () => {
      expect(validateQuantity('10')).toBe(false);
      expect(validateQuantity(null)).toBe(false);
      expect(validateQuantity(undefined)).toBe(false);
    });
  });

  describe('validatePrice', () => {
    const validatePrice = (price) => {
      return typeof price === 'number' && price > 0;
    };

    test('should accept positive numbers', () => {
      expect(validatePrice(10)).toBe(true);
      expect(validatePrice(99.99)).toBe(true);
      expect(validatePrice(0.01)).toBe(true);
    });

    test('should reject zero', () => {
      expect(validatePrice(0)).toBe(false);
    });

    test('should reject negative numbers', () => {
      expect(validatePrice(-10)).toBe(false);
      expect(validatePrice(-0.01)).toBe(false);
    });

    test('should reject non-numbers', () => {
      expect(validatePrice('100')).toBe(false);
      expect(validatePrice(null)).toBe(false);
      expect(validatePrice(undefined)).toBe(false);
    });
  });

  describe('validateDiscountPercentage', () => {
    const validateDiscountPercentage = (discount) => {
      return typeof discount === 'number' && 
             discount >= 0 && 
             discount <= 100;
    };

    test('should accept valid percentages', () => {
      expect(validateDiscountPercentage(0)).toBe(true);
      expect(validateDiscountPercentage(10)).toBe(true);
      expect(validateDiscountPercentage(50)).toBe(true);
      expect(validateDiscountPercentage(100)).toBe(true);
    });

    test('should reject negative percentages', () => {
      expect(validateDiscountPercentage(-1)).toBe(false);
      expect(validateDiscountPercentage(-10)).toBe(false);
    });

    test('should reject percentages over 100', () => {
      expect(validateDiscountPercentage(101)).toBe(false);
      expect(validateDiscountPercentage(150)).toBe(false);
    });

    test('should accept decimal percentages', () => {
      expect(validateDiscountPercentage(12.5)).toBe(true);
      expect(validateDiscountPercentage(99.9)).toBe(true);
    });
  });

  describe('calculateChange', () => {
    const calculateChange = (total, paid) => {
      return paid - total;
    };

    test('should calculate positive change', () => {
      expect(calculateChange(100, 150)).toBe(50);
      expect(calculateChange(99.50, 100)).toBe(0.50);
    });

    test('should return zero for exact payment', () => {
      expect(calculateChange(100, 100)).toBe(0);
    });

    test('should return negative for insufficient payment', () => {
      expect(calculateChange(100, 50)).toBe(-50);
      expect(calculateChange(100, 99)).toBe(-1);
    });

    test('should handle decimal values', () => {
      const change = calculateChange(99.99, 100);
      expect(change).toBeCloseTo(0.01, 2);
    });
  });

  describe('calculateProfitMargin', () => {
    const calculateProfitMargin = (sellingPrice, purchasePrice) => {
      const profit = sellingPrice - purchasePrice;
      return (profit / purchasePrice) * 100;
    };

    test('should calculate profit margin', () => {
      expect(calculateProfitMargin(150, 100)).toBe(50);
      expect(calculateProfitMargin(200, 100)).toBe(100);
    });

    test('should return 0 for no profit', () => {
      expect(calculateProfitMargin(100, 100)).toBe(0);
    });

    test('should return negative for loss', () => {
      expect(calculateProfitMargin(80, 100)).toBe(-20);
    });

    test('should handle decimal prices', () => {
      const margin = calculateProfitMargin(125.50, 100);
      expect(margin).toBe(25.5);
    });
  });

  describe('isStockSufficient', () => {
    const isStockSufficient = (available, required) => {
      return available >= required;
    };

    test('should return true when stock is sufficient', () => {
      expect(isStockSufficient(100, 50)).toBe(true);
      expect(isStockSufficient(100, 100)).toBe(true);
    });

    test('should return false when stock is insufficient', () => {
      expect(isStockSufficient(50, 100)).toBe(false);
      expect(isStockSufficient(0, 1)).toBe(false);
    });

    test('should handle edge cases', () => {
      expect(isStockSufficient(0, 0)).toBe(true);
      expect(isStockSufficient(1, 1)).toBe(true);
    });
  });

  describe('generateInvoiceNumber', () => {
    const generateInvoiceNumber = (prefix = 'INV') => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      return `${prefix}-${timestamp}-${random}`;
    };

    test('should generate unique invoice numbers', () => {
      const inv1 = generateInvoiceNumber();
      const inv2 = generateInvoiceNumber();
      
      expect(inv1).not.toBe(inv2);
    });

    test('should include prefix', () => {
      const invoice = generateInvoiceNumber('INV');
      expect(invoice.startsWith('INV-')).toBe(true);
    });

    test('should accept custom prefix', () => {
      const invoice = generateInvoiceNumber('BILL');
      expect(invoice.startsWith('BILL-')).toBe(true);
    });

    test('should generate valid format', () => {
      const invoice = generateInvoiceNumber();
      const parts = invoice.split('-');
      
      expect(parts.length).toBe(3);
      expect(parts[0]).toBe('INV');
      expect(parts[1]).toMatch(/^\d+$/); // timestamp
      expect(parts[2]).toMatch(/^\d+$/); // random
    });
  });

  describe('sanitizeBillData', () => {
    const sanitizeBillData = (data) => {
      return {
        ...data,
        items: data.items.map(item => ({
          ...item,
          quantity: Math.max(0, parseInt(item.quantity) || 0),
          unitPrice: Math.max(0, parseFloat(item.unitPrice) || 0)
        })),
        discountPercentage: Math.min(100, Math.max(0, parseFloat(data.discountPercentage) || 0)),
        taxRate: Math.max(0, parseFloat(data.taxRate) || 0)
      };
    };

    test('should sanitize valid data', () => {
      const data = {
        items: [
          { quantity: 5, unitPrice: 100 }
        ],
        discountPercentage: 10,
        taxRate: 18
      };

      const sanitized = sanitizeBillData(data);
      
      expect(sanitized.items[0].quantity).toBe(5);
      expect(sanitized.items[0].unitPrice).toBe(100);
      expect(sanitized.discountPercentage).toBe(10);
      expect(sanitized.taxRate).toBe(18);
    });

    test('should handle negative quantities', () => {
      const data = {
        items: [{ quantity: -5, unitPrice: 100 }],
        discountPercentage: 0,
        taxRate: 0
      };

      const sanitized = sanitizeBillData(data);
      expect(sanitized.items[0].quantity).toBe(0);
    });

    test('should handle invalid discount', () => {
      const data = {
        items: [{ quantity: 5, unitPrice: 100 }],
        discountPercentage: 150,
        taxRate: 18
      };

      const sanitized = sanitizeBillData(data);
      expect(sanitized.discountPercentage).toBe(100);
    });

    test('should handle string inputs', () => {
      const data = {
        items: [{ quantity: '5', unitPrice: '100.50' }],
        discountPercentage: '10',
        taxRate: '18'
      };

      const sanitized = sanitizeBillData(data);
      expect(sanitized.items[0].quantity).toBe(5);
      expect(sanitized.items[0].unitPrice).toBe(100.50);
      expect(sanitized.discountPercentage).toBe(10);
      expect(sanitized.taxRate).toBe(18);
    });
  });

  describe('Date and Time Helpers', () => {
    
    test('should format date correctly', () => {
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN');
      };

      const date = new Date('2026-03-08');
      const formatted = formatDate(date);
      
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test('should format time correctly', () => {
      const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-IN');
      };

      const date = new Date();
      const formatted = formatTime(date);
      
      expect(formatted).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });
  });
});
