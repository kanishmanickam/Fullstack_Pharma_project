// Mock data for MediStock AI application

export const medicines = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    batchNumber: "PCM001",
    expiryDate: "2024-03-15",
    quantity: 45,
    rackNumber: "A1",
    price: 5.50,
    reorderLevel: 50,
    supplier: "PharmaCorp Ltd",
    stockStatus: "low" // low, medium, high
  },
  {
    id: 2,
    name: "Amoxicillin 250mg",
    category: "Antibiotic",
    batchNumber: "AMX234",
    expiryDate: "2024-02-20",
    quantity: 120,
    rackNumber: "B3",
    price: 15.00,
    reorderLevel: 100,
    supplier: "MediSupply Inc",
    stockStatus: "medium"
  },
  {
    id: 3,
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    batchNumber: "IBU567",
    expiryDate: "2025-08-10",
    quantity: 250,
    rackNumber: "A2",
    price: 8.75,
    reorderLevel: 80,
    supplier: "HealthMeds Co",
    stockStatus: "high"
  },
  {
    id: 4,
    name: "Cetirizine 10mg",
    category: "Allergy",
    batchNumber: "CET890",
    expiryDate: "2024-01-30",
    quantity: 30,
    rackNumber: "C1",
    price: 6.25,
    reorderLevel: 40,
    supplier: "PharmaCorp Ltd",
    stockStatus: "low"
  },
  {
    id: 5,
    name: "Metformin 500mg",
    category: "Diabetes",
    batchNumber: "MET445",
    expiryDate: "2025-11-20",
    quantity: 180,
    rackNumber: "D2",
    price: 12.50,
    reorderLevel: 100,
    supplier: "DiabetesCare Inc",
    stockStatus: "high"
  },
  {
    id: 6,
    name: "Aspirin 75mg",
    category: "Cardiovascular",
    batchNumber: "ASP112",
    expiryDate: "2024-04-15",
    quantity: 85,
    rackNumber: "E1",
    price: 4.00,
    reorderLevel: 60,
    supplier: "CardioMeds Ltd",
    stockStatus: "medium"
  },
  {
    id: 7,
    name: "Vitamin D3 1000IU",
    category: "Supplement",
    batchNumber: "VIT778",
    expiryDate: "2026-12-31",
    quantity: 300,
    rackNumber: "F3",
    price: 10.00,
    reorderLevel: 150,
    supplier: "VitaHealth Co",
    stockStatus: "high"
  },
  {
    id: 8,
    name: "Cough Syrup 100ml",
    category: "Respiratory",
    batchNumber: "COU221",
    expiryDate: "2024-02-28",
    quantity: 25,
    rackNumber: "G1",
    price: 7.50,
    reorderLevel: 35,
    supplier: "RespiCare Inc",
    stockStatus: "low"
  }
];

export const customers = [
  {
    id: 1,
    name: "John Doe",
    type: "regular",
    phone: "+91 98765 43210",
    email: "john.doe@email.com",
    registeredDate: "2023-01-15",
    totalPurchases: 15
  },
  {
    id: 2,
    name: "Sarah Smith",
    type: "regular",
    phone: "+91 98765 43211",
    email: "sarah.smith@email.com",
    registeredDate: "2023-03-22",
    totalPurchases: 28
  },
  {
    id: 3,
    name: "Walking Customer",
    type: "walking",
    phone: "-",
    email: "-",
    registeredDate: "2024-02-01",
    totalPurchases: 1
  }
];

export const bills = [
  {
    id: "BILL001",
    date: "2024-02-01T10:30:00",
    customer: "John Doe",
    customerType: "regular",
    items: [
      { medicineName: "Paracetamol 500mg", quantity: 10, price: 5.50, total: 55.00 },
      { medicineName: "Ibuprofen 400mg", quantity: 5, price: 8.75, total: 43.75 }
    ],
    subtotal: 98.75,
    tax: 9.88,
    total: 108.63,
    paymentMethod: "GPay",
    status: "paid"
  },
  {
    id: "BILL002",
    date: "2024-02-01T14:15:00",
    customer: "Walking Customer",
    customerType: "walking",
    items: [
      { medicineName: "Cetirizine 10mg", quantity: 10, price: 6.25, total: 62.50 }
    ],
    subtotal: 62.50,
    tax: 6.25,
    total: 68.75,
    paymentMethod: "Cash",
    status: "paid"
  }
];

export const notifications = [
  {
    id: 1,
    type: "expiry",
    title: "Medicine Expiring Soon",
    message: "Cetirizine 10mg (Batch: CET890) expires on 2024-01-30",
    date: "2024-01-25T09:00:00",
    read: false,
    priority: "high"
  },
  {
    id: 2,
    type: "stock",
    title: "Low Stock Alert",
    message: "Paracetamol 500mg stock is below reorder level",
    date: "2024-01-28T11:30:00",
    read: false,
    priority: "medium"
  },
  {
    id: 3,
    type: "order",
    title: "New Order Placed",
    message: "Bill #BILL001 created successfully",
    date: "2024-02-01T10:30:00",
    read: true,
    priority: "low"
  }
];

export const stockIntelligence = {
  fastMoving: ["Paracetamol 500mg", "Ibuprofen 400mg", "Cetirizine 10mg"],
  slowMoving: ["Vitamin D3 1000IU", "Aspirin 75mg"],
  critical: ["Cough Syrup 100ml", "Cetirizine 10mg", "Paracetamol 500mg"],
  recommendations: [
    { medicine: "Paracetamol 500mg", action: "Order Immediately", quantity: 200, priority: "high" },
    { medicine: "Cough Syrup 100ml", action: "Order Immediately", quantity: 50, priority: "high" },
    { medicine: "Amoxicillin 250mg", action: "Monitor Stock", quantity: 0, priority: "medium" },
    { medicine: "Vitamin D3 1000IU", action: "Avoid Over Purchasing", quantity: 0, priority: "low" }
  ]
};

export const demandForecast = [
  { month: "Jan", demand: 450, actual: 420 },
  { month: "Feb", demand: 480, actual: 460 },
  { month: "Mar", demand: 510, actual: 0 },
  { month: "Apr", demand: 530, actual: 0 },
  { month: "May", demand: 490, actual: 0 },
  { month: "Jun", demand: 520, actual: 0 }
];

export const salesData = [
  { month: "Jan", sales: 45000, purchases: 38000 },
  { month: "Feb", sales: 52000, purchases: 42000 },
  { month: "Mar", sales: 48000, purchases: 40000 },
  { month: "Apr", sales: 55000, purchases: 45000 },
  { month: "May", sales: 58000, purchases: 47000 },
  { month: "Jun", sales: 62000, purchases: 50000 }
];

export const users = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    role: "owner",
    name: "Dr. Rajesh Kumar",
    email: "rajesh@medistock.com"
  },
  {
    id: 2,
    username: "staff",
    password: "staff123",
    role: "staff",
    name: "Priya Sharma",
    email: "priya@medistock.com"
  },
  {
    id: 3,
    username: "customer",
    password: "customer123",
    role: "customer",
    name: "John Doe",
    email: "john@email.com"
  }
];
