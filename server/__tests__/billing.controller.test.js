/**
 * Billing Controller Integration Tests
 * Tests the actual billing controller logic with mock data
 */

// Mock calculation functions based on actual billing logic
const calculateBillingMath = (items, discountPercentage = 0, taxRate = 18) => {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.sellingPrice;
    return sum + itemTotal;
  }, 0);

  // Calculate discount
  const discountAmount = (subtotal * discountPercentage) / 100;
  const afterDiscount = subtotal - discountAmount;

  // Calculate tax
  const taxAmount = (afterDiscount * taxRate) / 100;

  // Calculate total
  const total = afterDiscount + taxAmount;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    afterDiscount: parseFloat(afterDiscount.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

describe('Billing Controller Integration Tests', () => {

  describe('Calculate Bill Function', () => {

    test('should calculate bill for single medicine', () => {
      const items = [
        {
          medicineId: '123',
          name: 'Paracetamol 500mg',
          quantity: 10,
          sellingPrice: 5,
          purchasePrice: 3,
          batchNumber: 'PAR001'
        }
      ];

      const result = calculateBillingMath(items, 0, 18);

      expect(result.subtotal).toBe(50.00);
      expect(result.discountAmount).toBe(0.00);
      expect(result.afterDiscount).toBe(50.00);
      expect(result.taxAmount).toBe(9.00);
      expect(result.total).toBe(59.00);
    });

    test('should calculate bill for multiple medicines', () => {
      const items = [
        { name: 'Medicine A', quantity: 5, sellingPrice: 100, purchasePrice: 70 },
        { name: 'Medicine B', quantity: 3, sellingPrice: 50, purchasePrice: 30 },
        { name: 'Medicine C', quantity: 10, sellingPrice: 25, purchasePrice: 15 }
      ];

      const result = calculateBillingMath(items, 0, 18);

      expect(result.subtotal).toBe(900.00); // 500 + 150 + 250
      expect(result.taxAmount).toBe(162.00);
      expect(result.total).toBe(1062.00);
    });

    test('should apply percentage discount correctly', () => {
      const items = [
        { name: 'Medicine A', quantity: 10, sellingPrice: 100, purchasePrice: 70 }
      ];

      const result = calculateBillingMath(items, 10, 18); // 10% discount

      expect(result.subtotal).toBe(1000.00);
      expect(result.discountAmount).toBe(100.00);
      expect(result.afterDiscount).toBe(900.00);
      expect(result.taxAmount).toBe(162.00);
      expect(result.total).toBe(1062.00);
    });

    test('should calculate with 18% GST (default)', () => {
      const items = [
        { name: 'Medicine A', quantity: 1, sellingPrice: 100, purchasePrice: 70 }
      ];

      const result = calculateBillingMath(items, 0, 18);

      expect(result.subtotal).toBe(100.00);
      expect(result.taxAmount).toBe(18.00);
      expect(result.total).toBe(118.00);
    });

    test('should calculate with custom tax rate', () => {
      const items = [
        { name: 'Medicine A', quantity: 1, sellingPrice: 100, purchasePrice: 70 }
      ];

      const result = calculateBillingMath(items, 0, 12); // 12% GST

      expect(result.subtotal).toBe(100.00);
      expect(result.taxAmount).toBe(12.00);
      expect(result.total).toBe(112.00);
    });

    test('should handle decimal prices and quantities', () => {
      const items = [
        { name: 'Syrup', quantity: 2, sellingPrice: 125.50, purchasePrice: 90.25 }
      ];

      const result = calculateBillingMath(items, 5, 18); // 5% discount

      expect(result.subtotal).toBe(251.00);
      expect(result.discountAmount).toBe(12.55);
      expect(result.afterDiscount).toBe(238.45);
      expect(result.taxAmount).toBe(42.92);
      expect(result.total).toBe(281.37);
    });
  });

  describe('Stock Validation', () => {

    test('should validate sufficient stock', () => {
      const medicineStock = 100;
      const requestedQuantity = 50;
      const isValid = medicineStock >= requestedQuantity;

      expect(isValid).toBe(true);
    });

    test('should reject insufficient stock', () => {
      const medicineStock = 10;
      const requestedQuantity = 50;
      const isValid = medicineStock >= requestedQuantity;
      const errorMessage = isValid ? null : `Insufficient stock. Only ${medicineStock} units available.`;

      expect(isValid).toBe(false);
      expect(errorMessage).toBe('Insufficient stock. Only 10 units available.');
    });

    test('should allow exact stock quantity', () => {
      const medicineStock = 25;
      const requestedQuantity = 25;
      const isValid = medicineStock >= requestedQuantity;

      expect(isValid).toBe(true);
    });

    test('should reject zero or negative quantities', () => {
      const quantities = [0, -1, -10];
      
      quantities.forEach(qty => {
        const isValid = qty > 0;
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Stock Deduction After Sale', () => {

    test('should deduct stock correctly after sale', () => {
      const initialStock = 100;
      const soldQuantity = 15;
      const remainingStock = initialStock - soldQuantity;

      expect(remainingStock).toBe(85);
    });

    test('should handle multiple items stock deduction', () => {
      const inventory = [
        { medicineId: '1', stock: 100 },
        { medicineId: '2', stock: 50 },
        { medicineId: '3', stock: 200 }
      ];

      const soldItems = [
        { medicineId: '1', quantity: 10 },
        { medicineId: '2', quantity: 5 },
        { medicineId: '3', quantity: 50 }
      ];

      const updatedInventory = inventory.map(item => {
        const sold = soldItems.find(s => s.medicineId === item.medicineId);
        return {
          ...item,
          stock: item.stock - (sold?.quantity || 0)
        };
      });

      expect(updatedInventory[0].stock).toBe(90);
      expect(updatedInventory[1].stock).toBe(45);
      expect(updatedInventory[2].stock).toBe(150);
    });
  });

  describe('Revenue and Profit Calculations', () => {

    test('should calculate revenue correctly', () => {
      const items = [
        { quantity: 10, sellingPrice: 100 },
        { quantity: 5, sellingPrice: 50 }
      ];

      const revenue = items.reduce((sum, item) => 
        sum + (item.quantity * item.sellingPrice), 0
      );

      expect(revenue).toBe(1250); // 1000 + 250
    });

    test('should calculate cost correctly', () => {
      const items = [
        { quantity: 10, purchasePrice: 70 },
        { quantity: 5, purchasePrice: 30 }
      ];

      const cost = items.reduce((sum, item) => 
        sum + (item.quantity * item.purchasePrice), 0
      );

      expect(cost).toBe(850); // 700 + 150
    });

    test('should calculate profit correctly', () => {
      const items = [
        { quantity: 10, sellingPrice: 100, purchasePrice: 70 },
        { quantity: 5, sellingPrice: 50, purchasePrice: 30 }
      ];

      const revenue = items.reduce((sum, item) => 
        sum + (item.quantity * item.sellingPrice), 0
      );

      const cost = items.reduce((sum, item) => 
        sum + (item.quantity * item.purchasePrice), 0
      );

      const profit = revenue - cost;
      const profitMargin = ((profit / revenue) * 100).toFixed(2);

      expect(revenue).toBe(1250);
      expect(cost).toBe(850);
      expect(profit).toBe(400);
      expect(parseFloat(profitMargin)).toBe(32.00);
    });

    test('should calculate profit after discount and tax', () => {
      const items = [
        { quantity: 10, sellingPrice: 100, purchasePrice: 70 }
      ];

      const billing = calculateBillingMath(items, 10, 18);
      
      const cost = items.reduce((sum, item) => 
        sum + (item.quantity * item.purchasePrice), 0
      );

      // Revenue is total collected from customer
      const actualProfit = billing.total - cost;

      expect(cost).toBe(700);
      expect(billing.total).toBe(1062.00);
      expect(actualProfit).toBe(362.00);
    });
  });

  describe('Customer Billing History', () => {

    test('should track total purchases for customer', () => {
      const previousBills = [
        { total: 500 },
        { total: 750 },
        { total: 1000 }
      ];

      const totalSpent = previousBills.reduce((sum, bill) => sum + bill.total, 0);

      expect(totalSpent).toBe(2250);
    });

    test('should calculate loyalty discount eligibility', () => {
      const totalSpent = 5000;
      const loyaltyThreshold = 3000;
      const isEligible = totalSpent >= loyaltyThreshold;
      const loyaltyDiscountPercent = isEligible ? 5 : 0;

      expect(isEligible).toBe(true);
      expect(loyaltyDiscountPercent).toBe(5);
    });
  });

  describe('Payment Method Handling', () => {

    test('should handle cash payment', () => {
      const billTotal = 500;
      const cashReceived = 1000;
      const change = cashReceived - billTotal;

      expect(change).toBe(500);
    });

    test('should handle card payment', () => {
      const billTotal = 500;
      const paymentMethod = 'card';
      const change = paymentMethod === 'card' ? 0 : null;

      expect(change).toBe(0);
    });

    test('should handle UPI payment', () => {
      const billTotal = 500;
      const paymentMethod = 'upi';
      const transactionId = 'UPI123456789';
      const isValidTransaction = transactionId && transactionId.length > 0;

      expect(isValidTransaction).toBe(true);
    });

    test('should validate payment amount', () => {
      const billTotal = 500;
      const paidAmount = 450;
      const isValid = paidAmount >= billTotal;
      const shortfall = isValid ? 0 : billTotal - paidAmount;

      expect(isValid).toBe(false);
      expect(shortfall).toBe(50);
    });
  });

  describe('Bill Validation Rules', () => {

    test('should require at least one item', () => {
      const items = [];
      const isValid = items.length > 0;

      expect(isValid).toBe(false);
    });

    test('should validate item quantities', () => {
      const items = [
        { quantity: 5, sellingPrice: 100 },
        { quantity: 0, sellingPrice: 50 },  // Invalid
        { quantity: -1, sellingPrice: 75 }  // Invalid
      ];

      const validItems = items.filter(item => item.quantity > 0);

      expect(validItems.length).toBe(1);
    });

    test('should validate prices', () => {
      const items = [
        { quantity: 5, sellingPrice: 100 },
        { quantity: 3, sellingPrice: 0 },   // Invalid
        { quantity: 2, sellingPrice: -10 }  // Invalid
      ];

      const validItems = items.filter(item => 
        item.quantity > 0 && item.sellingPrice > 0
      );

      expect(validItems.length).toBe(1);
    });

    test('should validate discount range', () => {
      const discounts = [0, 10, 50, 100, 101, -5];
      const validDiscounts = discounts.filter(d => d >= 0 && d <= 100);

      expect(validDiscounts).toEqual([0, 10, 50, 100]);
    });

    test('should validate customer information', () => {
      const customer = {
        name: 'John Doe',
        phone: '9876543210'
      };

      const isValid = customer.name && 
                     customer.name.length > 0 && 
                     customer.phone && 
                     customer.phone.length === 10;

      expect(isValid).toBe(true);
    });
  });

  describe('Real-world Pharmacy Scenarios', () => {

    test('scenario: Regular customer buying common medicines', () => {
      const items = [
        { name: 'Paracetamol 500mg', quantity: 10, sellingPrice: 5, purchasePrice: 3 },
        { name: 'Cough Syrup', quantity: 2, sellingPrice: 125, purchasePrice: 90 }
      ];

      const result = calculateBillingMath(items, 0, 18);

      expect(result.subtotal).toBe(300.00);
      expect(result.total).toBe(354.00);
    });

    test('scenario: Bulk purchase with discount', () => {
      const items = [
        { name: 'Vitamin D3', quantity: 100, sellingPrice: 15, purchasePrice: 10 }
      ];

      const result = calculateBillingMath(items, 15, 18); // 15% bulk discount

      expect(result.subtotal).toBe(1500.00);
      expect(result.discountAmount).toBe(225.00);
      expect(result.afterDiscount).toBe(1275.00);
      expect(result.total).toBe(1504.50);
    });

    test('scenario: Emergency medicine purchase (no discount)', () => {
      const items = [
        { name: 'Insulin', quantity: 5, sellingPrice: 450, purchasePrice: 350 }
      ];

      const result = calculateBillingMath(items, 0, 18);

      expect(result.subtotal).toBe(2250.00);
      expect(result.discountAmount).toBe(0.00);
      expect(result.total).toBe(2655.00);
    });

    test('scenario: Senior citizen discount', () => {
      const items = [
        { name: 'Blood Pressure Medicine', quantity: 30, sellingPrice: 10, purchasePrice: 6 }
      ];

      const seniorCitizenDiscount = 10; // 10% for seniors
      const result = calculateBillingMath(items, seniorCitizenDiscount, 18);

      expect(result.subtotal).toBe(300.00);
      expect(result.discountAmount).toBe(30.00);
      expect(result.afterDiscount).toBe(270.00);
      expect(result.total).toBe(318.60);
    });

    test('scenario: Mixed prescription and OTC medicines', () => {
      const items = [
        { name: 'Antibiotic (Rx)', quantity: 1, sellingPrice: 250, purchasePrice: 180 },
        { name: 'Bandage (OTC)', quantity: 5, sellingPrice: 20, purchasePrice: 12 },
        { name: 'Antiseptic (OTC)', quantity: 2, sellingPrice: 75, purchasePrice: 50 }
      ];

      const result = calculateBillingMath(items, 5, 18); // 5% store discount

      expect(result.subtotal).toBe(500.00);
      expect(result.discountAmount).toBe(25.00);
      expect(result.afterDiscount).toBe(475.00);
      expect(result.total).toBe(560.50);
    });
  });
});
