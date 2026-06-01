/**
 * seedAnalytics.js
 * ─────────────────────────────────────────────────────────────────
 * Generates 30 days of realistic Bills + InventoryHistory sale
 * records so the Dashboard & Analytics charts have data to render.
 *
 * Run AFTER seed.js:
 *   cd server && node seedAnalytics.js
 *
 * Safe to re-run: clears only Bills and InventoryHistory before re-seeding.
 * ─────────────────────────────────────────────────────────────────
 */

import dotenv from "dotenv";
import connectDB from "../config/database.js";
import { Medicine } from "../models/medicineModel.js";
import { Customer } from "../models/customerModel.js";
import { Bill } from "../models/billModel.js";
import { InventoryHistory } from "../models/inventoryHistoryModel.js";

dotenv.config();

// ── Helpers ──────────────────────────────────────────────────────

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

/** Generates a Date object for `daysAgo` days before now, at a random hour */
const daysAgoDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(rand(8, 21), rand(0, 59), rand(0, 59), 0);
  return d;
};

/** Simple bill-number generator */
let billSeq = 1000;
const nextBill = () => `BILL-SEED-${billSeq++}`;

// ── Seed function ─────────────────────────────────────────────────

const seedAnalytics = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // ── Fetch existing reference data ─────────────────────────────
    const medicines = await Medicine.find().lean();
    const customers = await Customer.find().lean();

    if (medicines.length === 0) {
      console.error("❌ No medicines found. Run seed.js first: node seed.js");
      process.exit(1);
    }

    // ── Clear previous analytics seed data ────────────────────────
    await Bill.deleteMany({ billNumber: /^BILL-SEED-/ });
    await InventoryHistory.deleteMany({ reason: "analytics-seed" });
    console.log("✓ Cleared previous analytics seed data");

    // ── Seed variables ────────────────────────────────────────────
    const bills = [];
    const historyRecords = [];

    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
      const date = daysAgoDate(daysAgo);

      // Simulate higher traffic on weekends
      const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const billsThisDay = isWeekend ? rand(8, 15) : rand(3, 8);

      for (let b = 0; b < billsThisDay; b++) {
        // Pick 1–4 random medicines per bill
        const numItems = rand(1, 4);
        const shuffled = [...medicines].sort(() => Math.random() - 0.5);
        const pickedMeds = shuffled.slice(0, numItems);

        const items = pickedMeds.map((m) => {
          const quantity = rand(1, 6);
          const price = m.sellingPrice;
          return {
            medicineId: m._id,
            name: m.name,
            batchNumber: m.batchNumber,
            quantity,
            price,
            total: Math.round(price * quantity * 100) / 100,
          };
        });

        const subtotal = items.reduce((s, i) => s + i.total, 0);
        const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
        const grandTotal = Math.round((subtotal + tax) * 100) / 100;

        // Pick a random customer for this transaction
        const customer = customers[rand(0, customers.length - 1)];

        const bill = {
          billNumber: nextBill(),
          customerId: customer?._id || null,
          customerName: customer?.name || "Walk-in Customer",
          customerType: customer?.customerType || "walking",
          items,
          subtotal: Math.round(subtotal * 100) / 100,
          tax,
          grandTotal,
          paymentMethod: ["cash", "gpay", "upi", "card"][rand(0, 3)],
          paymentStatus: "completed",
          createdAt: date,
          updatedAt: date,
        };

        bills.push(bill);

        // Create a matching InventoryHistory sale record per item
        items.forEach((item) => {
          historyRecords.push({
            medicineId: item.medicineId,
            medicineName: item.name,
            action: "sale",
            quantityChanged: -item.quantity,
            previousQuantity: 999, // placeholder — not critical for chart data
            newQuantity: 999 - item.quantity,
            reason: "analytics-seed",
            createdAt: date,
            updatedAt: date,
          });
        });
      }
    }

    // ── Bulk insert ───────────────────────────────────────────────
    await Bill.insertMany(bills, { ordered: false });
    console.log(`✓ Seeded ${bills.length} bills across 30 days`);

    await InventoryHistory.insertMany(historyRecords, { ordered: false });
    console.log(
      `✓ Seeded ${historyRecords.length} inventory history (sale) records`,
    );

    // ── Sync Customer Totals ──────────────────────────────────────
    // To ensure the DB is perfectly coherent, update each customer's
    // totalPurchases and totalSpent with what we just generated.
    const customerUpdates = customers.map((c) => {
      const customerBills = bills.filter(
        (b) => String(b.customerId) === String(c._id),
      );
      const totalPurchases = customerBills.length;
      const totalSpent =
        Math.round(
          customerBills.reduce((sum, b) => sum + b.grandTotal, 0) * 100,
        ) / 100;

      return {
        updateOne: {
          filter: { _id: c._id },
          update: { $set: { totalPurchases, totalSpent } },
        },
      };
    });

    if (customerUpdates.length > 0) {
      await Customer.bulkWrite(customerUpdates);
      console.log(
        `✓ Synced totalPurchases and totalSpent for ${customerUpdates.length} customers`,
      );
    }

    // ── Summary ───────────────────────────────────────────────────
    const totalRevenue = bills.reduce((s, b) => s + b.grandTotal, 0);

    console.log(`
  ╔════════════════════════════════════════════╗
  ║    Analytics Seeding Completed!            ║
  ╠════════════════════════════════════════════╣
  ║ Bills generated    : ${String(bills.length).padEnd(20)}║
  ║ History records    : ${String(historyRecords.length).padEnd(20)}║
  ║ Total revenue      : ₹${String(totalRevenue.toFixed(2)).padEnd(19)}║
  ╠════════════════════════════════════════════╣
  ║ Dashboard charts should now render data.   ║
  ║ Refresh the browser and click Refresh.     ║
  ╚════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error("Analytics seeding error:", error.message);
    process.exit(1);
  }
};

seedAnalytics();
