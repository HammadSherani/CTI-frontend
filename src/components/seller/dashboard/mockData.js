// ─── Mock Data for Seller Dashboard ─────────────────────────────────────────
// Replace these with real API calls when backend endpoints are ready.

// Helper: generate last N days labels
const getDayLabels = (n) => {
  const labels = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  }
  return labels;
};

const last30 = getDayLabels(30);
const last7 = getDayLabels(7);

// ─── Summary Cards ───────────────────────────────────────────────────────────
export const summaryCardsData = [
  {
    label: "Total Sales",
    value: "$128,430",
    change: "+12.5%",
    trend: "up",
    icon: "solar:cart-large-2-bold-duotone",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Total Orders",
    value: "3,247",
    change: "+8.2%",
    trend: "up",
    icon: "solar:box-bold-duotone",
    color: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Total Earnings",
    value: "$96,322",
    change: "+15.3%",
    trend: "up",
    icon: "solar:dollar-minimalistic-bold-duotone",
    color: "from-violet-500 to-violet-600",
    bgLight: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    label: "Wallet Balance",
    value: "$12,750",
    change: "-3.1%",
    trend: "down",
    icon: "solar:wallet-money-bold-duotone",
    color: "from-amber-500 to-amber-600",
    bgLight: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

// ─── Sales Analytics ─────────────────────────────────────────────────────────
export const salesTrendData = last30.map((day, i) => ({
  date: day,
  sales: Math.floor(2000 + Math.random() * 4000 + Math.sin(i / 3) * 1500),
  revenue: Math.floor(1500 + Math.random() * 3000 + Math.cos(i / 4) * 1200),
}));

export const salesSummary = {
  today: "$4,280",
  last7Days: "$28,640",
  last30Days: "$128,430",
};

// ─── Orders Analytics ────────────────────────────────────────────────────────
export const orderStatusData = [
  { name: "Delivered", value: 1245, color: "#10b981" },
  { name: "Processing", value: 456, color: "#3b82f6" },
  { name: "Shipped", value: 324, color: "#8b5cf6" },
  { name: "Pending", value: 278, color: "#f59e0b" },
  { name: "On Hold", value: 89, color: "#6b7280" },
  { name: "Cancelled", value: 156, color: "#ef4444" },
];

export const ordersTrendData = last30.map((day, i) => ({
  date: day,
  orders: Math.floor(60 + Math.random() * 80 + Math.sin(i / 5) * 30),
}));

export const recentOrders = [
  { id: "ORD-7842", customer: "Ahmed Khan", product: "iPhone 15 Pro Max", amount: "$1,199", status: "Delivered", date: "Jun 22, 2026" },
  { id: "ORD-7841", customer: "Sarah Ali", product: "MacBook Air M3", amount: "$1,299", status: "Processing", date: "Jun 22, 2026" },
  { id: "ORD-7840", customer: "Bilal Hussain", product: "Samsung Galaxy S25", amount: "$999", status: "Shipped", date: "Jun 21, 2026" },
  { id: "ORD-7839", customer: "Fatima Zahra", product: "AirPods Pro 2", amount: "$249", status: "Pending", date: "Jun 21, 2026" },
  { id: "ORD-7838", customer: "Usman Tariq", product: "iPad Pro 13\"", amount: "$1,099", status: "Delivered", date: "Jun 20, 2026" },
  { id: "ORD-7837", customer: "Ayesha Malik", product: "Sony WH-1000XM5", amount: "$348", status: "On Hold", date: "Jun 20, 2026" },
  { id: "ORD-7836", customer: "Hassan Raza", product: "Dell XPS 15", amount: "$1,499", status: "Cancelled", date: "Jun 19, 2026" },
  { id: "ORD-7835", customer: "Zainab Shah", product: "Apple Watch Ultra 2", amount: "$799", status: "Delivered", date: "Jun 19, 2026" },
  { id: "ORD-7834", customer: "Imran Abbas", product: "Nintendo Switch OLED", amount: "$349", status: "Shipped", date: "Jun 18, 2026" },
  { id: "ORD-7833", customer: "Nadia Perveen", product: "Canon EOS R6 II", amount: "$2,499", status: "Processing", date: "Jun 18, 2026" },
  { id: "ORD-7832", customer: "Ali Hamza", product: "Bose QuietComfort", amount: "$279", status: "Delivered", date: "Jun 17, 2026" },
  { id: "ORD-7831", customer: "Maryam Javed", product: "LG 55\" OLED TV", amount: "$1,399", status: "Pending", date: "Jun 17, 2026" },
];

// ─── Earnings & Wallet ───────────────────────────────────────────────────────
export const earningsTrendData = last30.map((day, i) => ({
  date: day,
  earnings: Math.floor(1200 + Math.random() * 2500 + Math.sin(i / 4) * 800),
  commission: Math.floor(200 + Math.random() * 500),
}));

export const walletSummary = {
  available: "$12,750",
  pending: "$3,480",
  hold: "$1,220",
  totalWithdrawn: "$78,872",
};

export const recentTransactions = [
  { id: "TXN-5621", type: "Order Payment", amount: "+$1,199", status: "Completed", date: "Jun 22, 2026", method: "System" },
  { id: "TXN-5620", type: "Withdrawal", amount: "-$5,000", status: "Processing", date: "Jun 21, 2026", method: "Bank Transfer" },
  { id: "TXN-5619", type: "Order Payment", amount: "+$999", status: "Completed", date: "Jun 21, 2026", method: "System" },
  { id: "TXN-5618", type: "Refund", amount: "-$249", status: "Completed", date: "Jun 20, 2026", method: "System" },
  { id: "TXN-5617", type: "Order Payment", amount: "+$1,299", status: "Completed", date: "Jun 20, 2026", method: "System" },
  { id: "TXN-5616", type: "Commission", amount: "-$180", status: "Completed", date: "Jun 19, 2026", method: "System" },
  { id: "TXN-5615", type: "Order Payment", amount: "+$348", status: "Pending", date: "Jun 19, 2026", method: "System" },
  { id: "TXN-5614", type: "Withdrawal", amount: "-$3,000", status: "Completed", date: "Jun 18, 2026", method: "Bank Transfer" },
  { id: "TXN-5613", type: "Order Payment", amount: "+$799", status: "Completed", date: "Jun 18, 2026", method: "System" },
  { id: "TXN-5612", type: "Commission", amount: "-$120", status: "Completed", date: "Jun 17, 2026", method: "System" },
];

// ─── Product Analytics ───────────────────────────────────────────────────────
export const topSellingProducts = [
  { rank: 1, name: "iPhone 15 Pro Max", category: "Smartphones", sold: 342, revenue: "$410,058", rating: 4.8 },
  { rank: 2, name: "MacBook Air M3", category: "Laptops", sold: 218, revenue: "$283,182", rating: 4.9 },
  { rank: 3, name: "Samsung Galaxy S25", category: "Smartphones", sold: 189, revenue: "$188,811", rating: 4.6 },
  { rank: 4, name: "AirPods Pro 2", category: "Accessories", sold: 456, revenue: "$113,544", rating: 4.7 },
  { rank: 5, name: "iPad Pro 13\"", category: "Tablets", sold: 134, revenue: "$147,266", rating: 4.8 },
  { rank: 6, name: "Sony WH-1000XM5", category: "Audio", sold: 267, revenue: "$92,916", rating: 4.5 },
  { rank: 7, name: "Apple Watch Ultra 2", category: "Wearables", sold: 156, revenue: "$124,644", rating: 4.7 },
  { rank: 8, name: "Dell XPS 15", category: "Laptops", sold: 98, revenue: "$146,902", rating: 4.4 },
];

export const productPerformanceData = [
  { name: "iPhone 15 Pro Max", sales: 342, revenue: 410058 },
  { name: "MacBook Air M3", sales: 218, revenue: 283182 },
  { name: "Galaxy S25", sales: 189, revenue: 188811 },
  { name: "AirPods Pro 2", sales: 456, revenue: 113544 },
  { name: "iPad Pro 13\"", sales: 134, revenue: 147266 },
];

export const lowStockProducts = [
  { name: "iPhone 15 Pro Max - Gold", sku: "IPH15PM-GLD", stock: 5, threshold: 20, category: "Smartphones" },
  { name: "MacBook Air M3 - Midnight", sku: "MBA-M3-MID", stock: 3, threshold: 10, category: "Laptops" },
  { name: "AirPods Pro 2 - USB-C", sku: "APP2-USBC", stock: 8, threshold: 25, category: "Accessories" },
  { name: "Samsung Galaxy S25 Ultra", sku: "SGS25U-BLK", stock: 4, threshold: 15, category: "Smartphones" },
  { name: "Apple Watch Ultra 2 - Titanium", sku: "AWU2-TIT", stock: 2, threshold: 10, category: "Wearables" },
];

export const outOfStockProducts = [
  { name: "Sony PlayStation 5 Slim", sku: "PS5-SLIM", lastInStock: "Jun 15, 2026", demandLevel: "High", category: "Gaming" },
  { name: "Nintendo Switch OLED - White", sku: "NSW-OLED-W", lastInStock: "Jun 12, 2026", demandLevel: "Medium", category: "Gaming" },
  { name: "Google Pixel 9 Pro - Porcelain", sku: "GP9P-POR", lastInStock: "Jun 10, 2026", demandLevel: "High", category: "Smartphones" },
  { name: "Dyson V15 Detect", sku: "DYS-V15D", lastInStock: "Jun 8, 2026", demandLevel: "Low", category: "Home" },
];

// ─── Customer Analytics ──────────────────────────────────────────────────────
export const customerTypeData = [
  { month: "Jan", new: 120, returning: 280 },
  { month: "Feb", new: 145, returning: 310 },
  { month: "Mar", new: 168, returning: 345 },
  { month: "Apr", new: 132, returning: 390 },
  { month: "May", new: 189, returning: 420 },
  { month: "Jun", new: 210, returning: 455 },
];

export const topCustomers = [
  { name: "Ahmed Khan", email: "ahmed.k@email.com", orders: 28, totalSpent: "$18,450", lastOrder: "Jun 22, 2026" },
  { name: "Sarah Ali", email: "sarah.ali@email.com", orders: 22, totalSpent: "$14,820", lastOrder: "Jun 22, 2026" },
  { name: "Bilal Hussain", email: "bilal.h@email.com", orders: 19, totalSpent: "$12,340", lastOrder: "Jun 21, 2026" },
  { name: "Fatima Zahra", email: "fatima.z@email.com", orders: 17, totalSpent: "$11,290", lastOrder: "Jun 20, 2026" },
  { name: "Usman Tariq", email: "usman.t@email.com", orders: 15, totalSpent: "$9,870", lastOrder: "Jun 19, 2026" },
  { name: "Ayesha Malik", email: "ayesha.m@email.com", orders: 14, totalSpent: "$8,540", lastOrder: "Jun 18, 2026" },
  { name: "Hassan Raza", email: "hassan.r@email.com", orders: 12, totalSpent: "$7,650", lastOrder: "Jun 17, 2026" },
  { name: "Zainab Shah", email: "zainab.s@email.com", orders: 11, totalSpent: "$6,890", lastOrder: "Jun 16, 2026" },
];

// ─── Calendar & Upcoming Activities ──────────────────────────────────────────
export const calendarEvents = {
  "2026-06-23": [
    { type: "delivery", title: "5 Deliveries Due", description: "iPhone 15 Pro Max, MacBook Air M3, etc.", time: "09:00 AM" },
    { type: "payment", title: "Withdrawal Processing", description: "$5,000 bank transfer", time: "02:00 PM" },
  ],
  "2026-06-24": [
    { type: "delivery", title: "8 Deliveries Due", description: "Samsung Galaxy S25, AirPods Pro 2, etc.", time: "10:00 AM" },
    { type: "return", title: "2 Return Requests", description: "Order ORD-7820, ORD-7815", time: "11:30 AM" },
  ],
  "2026-06-25": [
    { type: "payment", title: "Weekly Settlement", description: "Expected $8,420 settlement", time: "12:00 PM" },
    { type: "event", title: "Flash Sale Starts", description: "Summer Flash Sale 2026", time: "12:00 AM" },
  ],
  "2026-06-26": [
    { type: "delivery", title: "3 Deliveries Due", description: "iPad Pro, Sony WH-1000XM5", time: "10:00 AM" },
  ],
  "2026-06-27": [
    { type: "event", title: "Inventory Audit", description: "Monthly stock verification", time: "09:00 AM" },
    { type: "payment", title: "Commission Deduction", description: "Monthly commission $2,340", time: "03:00 PM" },
  ],
  "2026-06-28": [
    { type: "delivery", title: "12 Deliveries Due", description: "Weekend rush orders", time: "08:00 AM" },
    { type: "return", title: "3 Return Pickups", description: "Scheduled returns collection", time: "11:00 AM" },
  ],
  "2026-06-30": [
    { type: "event", title: "Month-End Report", description: "Generate monthly performance report", time: "05:00 PM" },
    { type: "payment", title: "Monthly Settlement", description: "Expected $24,670 settlement", time: "06:00 PM" },
  ],
};

export const upcomingDeliveries = [
  { orderId: "ORD-7842", customer: "Ahmed Khan", items: 2, expectedDate: "Jun 23, 2026", status: "Out for Delivery" },
  { orderId: "ORD-7840", customer: "Bilal Hussain", items: 1, expectedDate: "Jun 24, 2026", status: "In Transit" },
  { orderId: "ORD-7838", customer: "Usman Tariq", items: 3, expectedDate: "Jun 24, 2026", status: "In Transit" },
  { orderId: "ORD-7835", customer: "Zainab Shah", items: 1, expectedDate: "Jun 25, 2026", status: "Ready to Ship" },
];

export const upcomingPayments = [
  { id: "PAY-301", type: "Weekly Settlement", amount: "$8,420", expectedDate: "Jun 25, 2026", status: "Scheduled" },
  { id: "PAY-302", type: "Withdrawal", amount: "$5,000", expectedDate: "Jun 23, 2026", status: "Processing" },
  { id: "PAY-303", type: "Monthly Settlement", amount: "$24,670", expectedDate: "Jun 30, 2026", status: "Scheduled" },
];

export const pendingReturns = [
  { orderId: "ORD-7820", customer: "Kamran Haider", product: "Bose QuietComfort", reason: "Defective", requestDate: "Jun 20, 2026" },
  { orderId: "ORD-7815", customer: "Sana Fatima", product: "Galaxy Buds3 Pro", reason: "Wrong Size", requestDate: "Jun 19, 2026" },
  { orderId: "ORD-7810", customer: "Waqas Ahmed", product: "Fitbit Charge 6", reason: "Changed Mind", requestDate: "Jun 18, 2026" },
];

export const sellerEvents = [
  { title: "Flash Sale Starts", date: "Jun 25, 2026", type: "promotion", description: "Summer Flash Sale 2026 - Up to 50% off" },
  { title: "Inventory Audit", date: "Jun 27, 2026", type: "operational", description: "Monthly stock verification required" },
  { title: "Month-End Report", date: "Jun 30, 2026", type: "reporting", description: "Generate and review monthly performance" },
  { title: "New Policy Update", date: "Jul 01, 2026", type: "policy", description: "Updated return and refund policies take effect" },
];
