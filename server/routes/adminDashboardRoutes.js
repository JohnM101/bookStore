// ============================================================
// ✅ server/routes/adminDashboardRoutes.js
// ============================================================
const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

// ============================================================
// 📊 Summary stats: total products, users, orders, revenue
// ============================================================
router.get("/summary", protect, admin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue: revenue,
    });
  } catch (err) {
    console.error("❌ Dashboard summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// 📈 Monthly Sales Chart Data
// ============================================================
router.get("/sales", protect, admin, async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { $month: "$paidAt" },
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const formatted = sales.map((s) => ({
      month: months[s._id - 1],
      total: s.total,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Sales chart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// 🕒 Latest 5 Paid Orders (Recent Orders Table)
// ============================================================
router.get("/recent-orders", protect, admin, async (req, res) => {
  try {
    const recentOrders = await Order.find({ isPaid: true })
      .populate("user", "firstName lastName email")
      .sort({ paidAt: -1 })
      .limit(5);

    res.json(recentOrders);
  } catch (err) {
    console.error("❌ Recent orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
