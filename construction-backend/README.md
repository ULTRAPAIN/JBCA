# Jai Bhavani Cement Agency - Backend API

A comprehensive backend API for a construction materials e-commerce platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Management**: Registration, authentication, role-based access control
- **Product Catalog**: Comprehensive product management with pricing tiers
- **Order Processing**: Complete order lifecycle management
- **Delivery Management**: Pincode-based delivery zone management
- **Admin Dashboard**: Analytics and comprehensive admin controls
- **Security**: JWT authentication, password hashing, input validation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Environment**: dotenv for configuration

## 📁 Project Structure

```
construction-backend/
├── config/
│   └── database.js          # Database connection configuration
├── middleware/
│   └── auth.js              # Authentication & authorization middleware
├── models/
│   ├── user.model.js        # User schema and model
│   ├── product.model.js     # Product schema and model
│   ├── order.model.js       # Order schema and model
│   └── deliveryZone.model.js # Delivery zone schema and model
├── routes/
│   ├── auth.routes.js       # Authentication routes
│   ├── product.routes.js    # Product routes
│   ├── order.routes.js      # Order routes
│   └── admin.routes.js      # Admin routes
├── scripts/
│   └── seed.js              # Database seeding script
├── server.js                # Main server file
├── package.json
└── .env.example             # Environment variables template
```

## ⚡ Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd construction-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/jaibhavani_cement
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

6. **Start the server**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| GET | `/auth/profile` | Get user profile | Private |
| PUT | `/auth/profile` | Update user profile | Private |
| POST | `/auth/change-password` | Change password | Private |

### Product Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/products` | Get all products | Public |
| GET | `/products/categories` | Get product categories | Public |
| GET | `/products/:id` | Get product by ID | Public |
| GET | `/products/:id/price` | Get product price by user role | Private |
| POST | `/products/bulk-prices` | Get bulk product prices | Private |

### Order Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/orders` | Create new order | Private |
| GET | `/orders/my-orders` | Get user's orders | Private |
| GET | `/orders/:id` | Get order by ID | Private |
| PUT | `/orders/:id/cancel` | Cancel order | Private |
| GET | `/orders/check-delivery/:pincode` | Check delivery availability | Public |

### Admin Endpoints

All admin endpoints require admin authentication (`/api/admin/*`)

#### Product Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/products` | Create product |
| PUT | `/admin/products/:id` | Update product |
| DELETE | `/admin/products/:id` | Delete product |

#### Order Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/orders` | Get all orders |
| PUT | `/admin/orders/:id` | Update order status |

#### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | Get all users |
| PUT | `/admin/users/:id/role` | Update user role |

#### Delivery Zone Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/delivery-zones` | Add delivery zone |
| GET | `/admin/delivery-zones` | Get delivery zones |
| PUT | `/admin/delivery-zones/:id` | Update delivery zone |
| DELETE | `/admin/delivery-zones/:id` | Delete delivery zone |

#### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Get dashboard analytics |

## 🔒 User Roles

- **registered**: Regular customers (standard pricing)
- **primary**: Primary customers (discounted pricing)
- **secondary**: Secondary customers (moderate discounts)
- **admin**: Full system access

## 📦 Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['registered', 'primary', 'secondary', 'admin'],
  addresses: [Address],
  phone: String,
  isActive: Boolean
}
```

### Product
```javascript
{
  name: String,
  description: String,
  images: [String],
  category: ['Cement', 'Sand', 'Gravel', 'Bricks', 'Steel', 'Other'],
  prices: {
    standard: Number,
    primary: Number,
    secondary: Number
  },
  unit: ['bag', 'ton', 'cubic_meter', 'piece', 'kg'],
  availability: Boolean,
  stock: Number
}
```

### Order
```javascript
{
  user: ObjectId,
  orderNumber: String,
  items: [OrderItem],
  totalAmount: Number,
  shippingAddress: Address,
  status: ['Processing', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'],
  paymentStatus: ['Pending', 'Paid', 'Failed', 'Refunded'],
  estimatedDelivery: Date,
  trackingHistory: [TrackingEntry]
}
```

## 🧪 Testing

### Test Credentials (after seeding)

- **Admin**: admin@jaibhavani.com / admin123
- **Primary Customer**: primary@example.com / password123
- **Secondary Customer**: secondary@example.com / password123
- **Regular Customer**: customer@example.com / password123

### Sample API Calls

#### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543214"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jaibhavani.com",
    "password": "admin123"
  }'
```

#### Get products:
```bash
curl -X GET http://localhost:5000/api/products
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jaibhavani_cement
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000
```

### PM2 Deployment
```bash
npm install -g pm2
pm2 start server.js --name "construction-backend"
pm2 startup
pm2 save
```

## 🔧 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Adding New Features

1. Create new models in `models/` directory
2. Add routes in `routes/` directory  
3. Update middleware if needed
4. Add proper error handling
5. Update documentation

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include JSDoc comments for functions
4. Update API documentation
5. Test thoroughly before committing

## 📄 License

ISC License - feel free to use this project for your construction materials business!

## 📞 Support

For questions or support, please contact the development team or create an issue in the repository.
