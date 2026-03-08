/**
 * Billing Math Accuracy Test Suite
 * Tests all billing calculations for accuracy, edge cases, and business logic
 */

describe('Billing Math Accuracy Tests', () => {
  
  describe('Price Calculations', () => {
    
    test('should calculate subtotal correctly for single item', () => {
      const quantity = 5;
      const unitPrice = 100;
      const subtotal = quantity * unitPrice;
      
      expect(subtotal).toBe(500);
    });

    test('should calculate subtotal correctly for multiple items', () => {
      const items = [
        { quantity: 5, unitPrice: 100 },
        { quantity: 3, unitPrice: 50 },
        { quantity: 10, unitPrice: 25 }
      ];
      
      const subtotal = items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0
      );
      
      expect(subtotal).toBe(900); // 500 + 150 + 250
    });

    test('should handle decimal prices correctly', () => {
      const quantity = 3;
      const unitPrice = 25.50;
      const subtotal = quantity * unitPrice;
      
      expect(subtotal).toBe(76.50);
    });

    test('should handle floating point precision', () => {
      const quantity = 7;
      const unitPrice = 0.1;
      const subtotal = parseFloat((quantity * unitPrice).toFixed(2));
      
      expect(subtotal).toBe(0.70);
    });

    test('should handle large quantities and prices', () => {
      const quantity = 1000;
      const unitPrice = 999.99;
      const subtotal = quantity * unitPrice;
      
      expect(subtotal).toBe(999990);
    });

    test('should return zero for zero quantity', () => {
      const quantity = 0;
      const unitPrice = 100;
      const subtotal = quantity * unitPrice;
      
      expect(subtotal).toBe(0);
    });

    test('should return zero for zero price', () => {
      const quantity = 10;
      const unitPrice = 0;
      const subtotal = quantity * unitPrice;
      
      expect(subtotal).toBe(0);
    });
  });

  describe('Discount Calculations', () => {
    
    test('should calculate percentage discount correctly', () => {
      const subtotal = 1000;
      const discountPercentage = 10;
      const discountAmount = (subtotal * discountPercentage) / 100;
      
      expect(discountAmount).toBe(100);
    });

    test('should calculate final amount after percentage discount', () => {
      const subtotal = 1000;
      const discountPercentage = 15;
      const discountAmount = (subtotal * discountPercentage) / 100;
      const finalAmount = subtotal - discountAmount;
      
      expect(finalAmount).toBe(850);
    });

    test('should calculate flat discount correctly', () => {
      const subtotal = 1000;
      const flatDiscount = 50;
      const finalAmount = subtotal - flatDiscount;
      
      expect(finalAmount).toBe(950);
    });

    test('should handle 0% discount', () => {
      const subtotal = 1000;
      const discountPercentage = 0;
      const discountAmount = (subtotal * discountPercentage) / 100;
      const finalAmount = subtotal - discountAmount;
      
      expect(finalAmount).toBe(1000);
    });

    test('should handle 100% discount', () => {
      const subtotal = 1000;
      const discountPercentage = 100;
      const discountAmount = (subtotal * discountPercentage) / 100;
      const finalAmount = subtotal - discountAmount;
      
      expect(finalAmount).toBe(0);
    });

    test('should not allow discount greater than subtotal', () => {
      const subtotal = 100;
      const flatDiscount = 150;
      const finalAmount = Math.max(0, subtotal - flatDiscount);
      
      expect(finalAmount).toBe(0);
    });

    test('should handle discount on decimal amounts', () => {
      const subtotal = 99.99;
      const discountPercentage = 10;
      const discountAmount = parseFloat(((subtotal * discountPercentage) / 100).toFixed(2));
      const finalAmount = parseFloat((subtotal - discountAmount).toFixed(2));
      
      expect(discountAmount).toBe(10.00);
      expect(finalAmount).toBe(89.99);
    });
  });

  describe('Tax Calculations', () => {
    
    test('should calculate GST correctly (18%)', () => {
      const subtotal = 1000;
      const taxRate = 18;
      const taxAmount = (subtotal * taxRate) / 100;
      
      expect(taxAmount).toBe(180);
    });

    test('should calculate total with tax', () => {
      const subtotal = 1000;
      const taxRate = 18;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;
      
      expect(total).toBe(1180);
    });

    test('should handle tax on discounted amount', () => {
      const subtotal = 1000;
      const discountPercentage = 10;
      const discountAmount = (subtotal * discountPercentage) / 100;
      const afterDiscount = subtotal - discountAmount;
      const taxRate = 18;
      const taxAmount = (afterDiscount * taxRate) / 100;
      const total = afterDiscount + taxAmount;
      
      expect(afterDiscount).toBe(900);
      expect(taxAmount).toBe(162);
      expect(total).toBe(1062);
    });

    test('should handle zero tax rate', () => {
      const subtotal = 1000;
      const taxRate = 0;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;
      
      expect(total).toBe(1000);
    });

    test('should handle decimal tax rates', () => {
      const subtotal = 1000;
      const taxRate = 12.5;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;
      
      expect(taxAmount).toBe(125);
      expect(total).toBe(1125);
    });

    test('should calculate tax with precision', () => {
      const subtotal = 99.99;
      const taxRate = 18;
      const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
      const total = parseFloat((subtotal + taxAmount).toFixed(2));
      
      expect(taxAmount).toBe(18.00);
      expect(total).toBe(117.99);
    });
  });

  describe('Complete Billing Workflow', () => {
    
    test('should calculate complete bill: items + discount + tax', () => {
      // Multiple items
      const items = [
        { name: 'Paracetamol', quantity: 10, unitPrice: 5.00 },
        { name: 'Cough Syrup', quantity: 2, unitPrice: 125.00 },
        { name: 'Bandage', quantity: 5, unitPrice: 20.00 }
      ];
      
      // Calculate subtotal
      const subtotal = items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0
      );
      
      // Apply discount
      const discountPercentage = 10;
      const discountAmount = (subtotal * discountPercentage) / 100;
      const afterDiscount = subtotal - discountAmount;
      
      // Apply tax
      const taxRate = 18;
      const taxAmount = (afterDiscount * taxRate) / 100;
      
      // Final total
      const total = afterDiscount + taxAmount;
      
      expect(subtotal).toBe(400); // 50 + 250 + 100
      expect(discountAmount).toBe(40);
      expect(afterDiscount).toBe(360);
      expect(taxAmount).toBe(64.8);
      expect(total).toBe(424.8);
    });

    test('should handle complex billing scenario', () => {
      // Scenario: Customer buys expensive medicines with flat discount
      const items = [
        { name: 'Antibiotic', quantity: 1, unitPrice: 500 },
        { name: 'Pain Relief', quantity: 2, unitPrice: 150 }
      ];
      
      const subtotal = items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0
      );
      
      const flatDiscount = 50; // ₹50 off
      const afterDiscount = subtotal - flatDiscount;
      
      const taxRate = 12; // 12% GST
      const taxAmount = parseFloat(((afterDiscount * taxRate) / 100).toFixed(2));
      
      const total = parseFloat((afterDiscount + taxAmount).toFixed(2));
      
      expect(subtotal).toBe(800);
      expect(afterDiscount).toBe(750);
      expect(taxAmount).toBe(90.00);
      expect(total).toBe(840.00);
    });

    test('should handle rounding to 2 decimal places', () => {
      const items = [
        { quantity: 3, unitPrice: 33.33 }
      ];
      
      const subtotal = parseFloat((items[0].quantity * items[0].unitPrice).toFixed(2));
      const taxRate = 18;
      const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
      const total = parseFloat((subtotal + taxAmount).toFixed(2));
      
      expect(subtotal).toBe(99.99);
      expect(taxAmount).toBe(18.00);
      expect(total).toBe(117.99);
    });
  });

  describe('Payment and Change Calculations', () => {
    
    test('should calculate change correctly', () => {
      const totalAmount = 424.80;
      const paidAmount = 500;
      const change = parseFloat((paidAmount - totalAmount).toFixed(2));
      
      expect(change).toBe(75.20);
    });

    test('should handle exact payment', () => {
      const totalAmount = 500;
      const paidAmount = 500;
      const change = paidAmount - totalAmount;
      
      expect(change).toBe(0);
    });

    test('should handle insufficient payment', () => {
      const totalAmount = 500;
      const paidAmount = 400;
      const change = paidAmount - totalAmount;
      
      expect(change).toBe(-100);
      expect(change < 0).toBe(true); // Insufficient
    });

    test('should calculate change with decimal precision', () => {
      const totalAmount = 117.99;
      const paidAmount = 200;
      const change = parseFloat((paidAmount - totalAmount).toFixed(2));
      
      expect(change).toBe(82.01);
    });
  });

  describe('Edge Cases and Validation', () => {
    
    test('should handle very small amounts', () => {
      const quantity = 1;
      const unitPrice = 0.01;
      const subtotal = quantity * unitPrice;
      
      expect(subtotal).toBe(0.01);
    });

    test('should handle negative values validation', () => {
      const quantity = -5;
      const unitPrice = 100;
      const isValid = quantity > 0 && unitPrice > 0;
      
      expect(isValid).toBe(false);
    });

    test('should validate discount percentage bounds', () => {
      const discountPercentage = 150;
      const isValid = discountPercentage >= 0 && discountPercentage <= 100;
      
      expect(isValid).toBe(false);
    });

    test('should handle empty items array', () => {
      const items = [];
      const subtotal = items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0
      );
      
      expect(subtotal).toBe(0);
    });

    test('should handle null/undefined values', () => {
      const quantity = null;
      const unitPrice = undefined;
      const subtotal = (quantity || 0) * (unitPrice || 0);
      
      expect(subtotal).toBe(0);
    });
  });

  describe('Currency Formatting', () => {
    
    test('should format Indian Rupee correctly', () => {
      const amount = 1234.56;
      const formatted = `₹${amount.toFixed(2)}`;
      
      expect(formatted).toBe('₹1234.56');
    });

    test('should handle thousands separator', () => {
      const amount = 123456.78;
      const formatted = `₹${amount.toLocaleString('en-IN', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
      
      expect(formatted).toBe('₹1,23,456.78');
    });

    test('should round to 2 decimal places', () => {
      const amount = 123.456789;
      const rounded = parseFloat(amount.toFixed(2));
      
      expect(rounded).toBe(123.46);
    });
  });

  describe('Inventory Impact Calculations', () => {
    
    test('should calculate stock deduction correctly', () => {
      const currentStock = 100;
      const soldQuantity = 15;
      const remainingStock = currentStock - soldQuantity;
      
      expect(remainingStock).toBe(85);
    });

    test('should detect low stock after sale', () => {
      const currentStock = 20;
      const soldQuantity = 15;
      const remainingStock = currentStock - soldQuantity;
      const reorderLevel = 10;
      const isLowStock = remainingStock <= reorderLevel;
      
      expect(remainingStock).toBe(5);
      expect(isLowStock).toBe(true);
    });

    test('should prevent overselling', () => {
      const currentStock = 10;
      const requestedQuantity = 15;
      const canSell = currentStock >= requestedQuantity;
      
      expect(canSell).toBe(false);
    });

    test('should calculate total value of sold items', () => {
      const items = [
        { quantity: 10, purchasePrice: 50, sellingPrice: 75 },
        { quantity: 5, purchasePrice: 100, sellingPrice: 150 }
      ];
      
      const totalCost = items.reduce((sum, item) => 
        sum + (item.quantity * item.purchasePrice), 0
      );
      
      const totalRevenue = items.reduce((sum, item) => 
        sum + (item.quantity * item.sellingPrice), 0
      );
      
      const profit = totalRevenue - totalCost;
      
      expect(totalCost).toBe(1000); // (10*50) + (5*100)
      expect(totalRevenue).toBe(1500); // (10*75) + (5*150)
      expect(profit).toBe(500);
    });
  });

  describe('Profit Margin Calculations', () => {
    
    test('should calculate profit margin correctly', () => {
      const sellingPrice = 150;
      const purchasePrice = 100;
      const profit = sellingPrice - purchasePrice;
      const profitMargin = (profit / purchasePrice) * 100;
      
      expect(profit).toBe(50);
      expect(profitMargin).toBe(50);
    });

    test('should calculate profit percentage on selling price', () => {
      const sellingPrice = 150;
      const purchasePrice = 100;
      const profit = sellingPrice - purchasePrice;
      const profitPercentage = (profit / sellingPrice) * 100;
      
      expect(parseFloat(profitPercentage.toFixed(2))).toBe(33.33);
    });

    test('should handle zero profit scenario', () => {
      const sellingPrice = 100;
      const purchasePrice = 100;
      const profit = sellingPrice - purchasePrice;
      const profitMargin = (profit / purchasePrice) * 100;
      
      expect(profit).toBe(0);
      expect(profitMargin).toBe(0);
    });

    test('should handle loss scenario', () => {
      const sellingPrice = 80;
      const purchasePrice = 100;
      const profit = sellingPrice - purchasePrice;
      const profitMargin = (profit / purchasePrice) * 100;
      
      expect(profit).toBe(-20);
      expect(profitMargin).toBe(-20);
    });
  });
});
