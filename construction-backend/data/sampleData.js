// Fallback sample data for when database is not available
const sampleProducts = [
  {
    _id: "507f1f77bcf86cd799439011",
    name: "Portland Cement",
    description: "High-quality Portland cement for all construction needs",
    category: "Cement",
    price: 420,
    prices: {
      registered: 420,
      primary: 400,
      secondary: 380
    },
    specifications: {
      grade: "OPC 53",
      strength: "53 MPa",
      packSize: "50 Kg"
    },
    images: ["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400"],
    availability: true,
    inStock: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    _id: "507f1f77bcf86cd799439012",
    name: "Steel Rebar",
    description: "High-grade steel reinforcement bars for concrete construction",
    category: "Other",
    price: 65000,
    prices: {
      registered: 65000,
      primary: 62000,
      secondary: 59000
    },
    specifications: {
      grade: "Fe 500",
      diameter: "12mm",
      length: "12 meters"
    },
    images: ["https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400"],
    availability: true,
    inStock: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    _id: "507f1f77bcf86cd799439013",
    name: "Stone Aggregate Mix",
    description: "Premium stone aggregate mix for immediate use",
    category: "Stone Aggregates",
    price: 4500,
    prices: {
      registered: 4500,
      primary: 4300,
      secondary: 4100
    },
    specifications: {
      grade: "M25",
      slump: "100-150mm",
      aggregate: "20mm down"
    },
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"],
    availability: true,
    inStock: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    _id: "507f1f77bcf86cd799439014",
    name: "Construction Sand",
    description: "Clean, graded sand perfect for construction and masonry work",
    category: "Sand & Aggregates",
    price: 1800,
    prices: {
      registered: 1800,
      primary: 1700,
      secondary: 1600
    },
    specifications: {
      type: "River Sand",
      gradation: "Zone II",
      moisture: "< 5%"
    },
    images: ["https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400"],
    availability: true,
    inStock: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
];

const sampleUsers = [
  {
    _id: "507f1f77bcf86cd799439021",
    name: "John Doe",
    email: "john@example.com",
    role: "registered",
    phone: "+91 9876543210",
    createdAt: new Date("2024-01-01")
  },
  {
    _id: "507f1f77bcf86cd799439022",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    phone: "+91 9876543211",
    createdAt: new Date("2024-01-01")
  }
];

const sampleOrders = [
  {
    _id: "507f1f77bcf86cd799439031",
    user: "507f1f77bcf86cd799439021",
    orderNumber: "ORD-2024-001",
    items: [
      {
        product: "507f1f77bcf86cd799439011",
        quantity: 10,
        price: 420
      }
    ],
    totalAmount: 4200,
    status: "pending",
    createdAt: new Date("2024-01-01")
  }
];

module.exports = {
  sampleProducts,
  sampleUsers,
  sampleOrders
};
