# Talikhata Backend API

A robust Node.js/Express.js backend API for the Talikhata customer transaction management system, built with MongoDB and JWT authentication.

## Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 📊 **MongoDB Database** - NoSQL database with automatic balance calculation
- 🛡️ **Security** - Helmet, CORS, rate limiting, and input validation
- 📝 **Validation** - Comprehensive request validation using express-validator
- 🔄 **Auto Balance Calculation** - Automatic customer balance updates on transaction changes
- 📈 **Statistics** - Detailed transaction and customer statistics
- 🔍 **Search & Filtering** - Advanced search and filtering capabilities
- 📄 **Pagination** - Efficient pagination for large datasets

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors, rate-limiting
- **Logging**: morgan

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/talikhata
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/talikhata

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/change-password` | Change password |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers (with pagination & search) |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create new customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer (soft delete) |
| GET | `/api/customers/:id/stats` | Get customer statistics |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get all transactions (with filtering) |
| GET | `/api/transactions/customer/:customerId` | Get customer transactions |
| GET | `/api/transactions/:id` | Get transaction by ID |
| POST | `/api/transactions` | Create new transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/transactions/stats/overview` | Get transaction statistics |

## Database Models

### User Model
- Email and password authentication
- Role-based access control
- Password hashing with bcrypt
- Account status management

### Customer Model
- Customer information management
- Automatic balance calculation
- Soft delete functionality
- Search and filtering support

### Transaction Model
- Transaction type (given/received)
- Amount and refund handling
- Automatic customer balance updates
- Date and time tracking

## Key Features

### Automatic Balance Calculation
The system automatically calculates and updates customer balances when transactions are created, updated, or deleted. This ensures data consistency and eliminates the balance mismatch issues you experienced with Supabase.

### Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration for frontend integration
- Helmet for security headers

### Data Validation
- Comprehensive input validation using express-validator
- MongoDB schema validation
- Custom validation for Bangladeshi phone numbers
- Email format validation
- Amount and refund validation

### Error Handling
- Centralized error handling middleware
- Detailed error messages for debugging
- Proper HTTP status codes
- Validation error details

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/talikhata |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | JWT token expiration | 7d |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Health Check
The API includes a health check endpoint at `/health` that returns server status and environment information.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure MongoDB Atlas or production MongoDB instance
4. Set appropriate CORS origins
5. Configure rate limiting for production load
6. Use environment variables for all sensitive configuration

## API Response Format

All API responses follow a consistent format:

```json
{
  "message": "Success message",
  "data": {
    // Response data
  },
  "pagination": {
    // Pagination info (if applicable)
  }
}
```

Error responses:
```json
{
  "error": "Error type",
  "message": "User-friendly error message",
  "details": [
    // Validation errors (if applicable)
  ]
}
```

## Migration from Supabase

This backend replaces your Supabase setup with:

1. **MongoDB** instead of PostgreSQL
2. **Automatic balance calculation** in the database layer
3. **JWT authentication** instead of Supabase Auth
4. **Express.js API** instead of Supabase client
5. **No Docker requirements** - runs directly with Node.js

The balance calculation is now handled automatically by MongoDB middleware, eliminating the race conditions and inconsistencies you experienced with the PostgreSQL triggers.

## Next Steps

1. Update your frontend to use this new API instead of Supabase
2. Update the API base URL in your frontend configuration
3. Implement JWT token storage and management in your frontend
4. Test all CRUD operations with the new backend
5. Deploy the backend to your preferred hosting platform

The backend is now ready to serve your Talikhata application with improved reliability and no Docker dependencies!

