# Purple Merit Technologies - Logistics Management System

## 1. Project Overview & Purpose

Purple Merit Technologies is a comprehensive logistics management system designed to optimize delivery operations through intelligent simulation and real-time analytics. The platform enables companies to:

- **Manage Driver Fleet**: Track driver performance, work hours, and availability
- **Route Optimization**: Create and manage delivery routes with traffic analysis
- **Order Management**: Process orders with automated driver allocation
- **Smart Simulations**: Run delivery simulations with Purple Merit's proprietary rules
- **Performance Analytics**: Monitor KPIs including efficiency scores, profits, and delivery performance
- **Real-time Dashboard**: Visualize logistics data with interactive charts and metrics

### Key Features
- 🚚 **Driver Management**: Comprehensive driver profiles with work hour tracking and fatigue monitoring
- 🗺️ **Route Planning**: Distance-based routing with traffic level considerations
- 📦 **Order Processing**: Automated order assignment with profit calculations
- 🎯 **Business Rules Engine**: Implementation of Purple Merit's 6 core business rules
- 📊 **Analytics Dashboard**: Real-time performance metrics and trend analysis
- 🔐 **Secure Authentication**: JWT-based user authentication and authorization
- 💰 **Financial Tracking**: Profit/loss calculation with bonuses and penalties
- ⚡ **Real-time Simulations**: Run what-if scenarios for optimal resource allocation

## 2. Setup Steps

### Prerequisites
- Node.js (v20 or higher)
- PostgreSQL database
- Git

### Quick Start
1. Clone the repository
2. Set up environment variables for both backend and frontend
3. Install dependencies for both services
4. Configure database connection
5. Start development servers
6. Access the application at localhost URLs

## 3. Tech Stack Used

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Neon.tech hosting
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi for request validation
- **Security**: Helmet, CORS, Rate Limiting (express-rate-limit)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv
- **Logging**: Morgan
- **Testing**: Jest, Supertest
- **File Processing**: Multer, CSV-Parser

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts & Visualization**: Recharts
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useContext)

### DevOps & Deployment
- **Hosting**: Render.com
- **Version Control**: Git/GitHub
- **Database Hosting**: Neon.tech (PostgreSQL)
- **CI/CD**: Render auto-deployment from GitHub

### Development Tools
- **Package Manager**: npm
- **Development Server**: Nodemon (backend), Vite dev server (frontend)
- **Code Quality**: ESLint
- **API Testing**: Built-in health checks and documentation endpoints

## 4. Setup Instructions (Frontend & Backend)

### Prerequisites
- Node.js (v20 or higher)
- Git
- PostgreSQL database (or Neon.tech account)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/PurpleMerit.git
   cd PurpleMerit/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (see Environment Variables section)
   ```

4. **Database Setup**
   - The application uses Neon.tech PostgreSQL (cloud-hosted)
   - Database tables are created automatically on first run
   - No manual schema setup required

5. **Initialize with demo data (optional)**
   ```bash
   node scripts/addDemoUser.js
   node scripts/addTestData.js
   ```

6. **Start Backend Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

   The API will be available at `http://localhost:50001`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env.local` file:
   ```bash
   # Copy from .env.local.example if available
   echo "VITE_API_BASE_URL=http://localhost:50001/api" > .env.local
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

### Verification Steps
1. Backend health check: `http://localhost:50001/api/health`
2. Frontend application: `http://localhost:5173`
3. Try registering a new user or use demo credentials

## 5. Environment Variables (list without actual values)

### Backend (.env)
Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development|production
PORT=50001

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# CORS Configuration (for production)
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env.local)
Create a `.env.local` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:50001/api
```

### Production Environment Variables

#### Backend (Render)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=your-production-neon-database-url
JWT_SECRET=secure-production-secret-key
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://your-frontend-render-url.onrender.com
```

#### Frontend (Render)
```env
VITE_API_BASE_URL=https://your-backend-render-url.onrender.com/api
```

**Security Note**: Never commit actual environment variable values to version control. Use example files and documentation instead.

## 6. Deployment Instructions

### Platform: Render.com
Both backend and frontend are configured for deployment on Render.com with automatic CI/CD from GitHub.

### Backend Deployment on Render

1. **Create New Web Service**
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `PurpleMerit` repository

2. **Configure Service Settings**
   ```
   Name: purplemerit-backend
   Environment: Node
   Region: Ohio (US East)
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables**
   In the Environment tab, add these variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=your-neon-database-url
   JWT_SECRET=your-production-jwt-secret
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=https://your-frontend-service.onrender.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your backend will be available at: `https://your-backend-service.onrender.com`

### Frontend Deployment on Render

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect the same GitHub repository
   - Select the `PurpleMerit` repository

2. **Configure Build Settings**
   ```
   Name: purplemerit-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Set Environment Variables**
   ```
   VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for build and deployment (5-10 minutes)
   - Your frontend will be available at: `https://your-frontend-service.onrender.com`

### Post-Deployment Steps

1. **Update CORS Settings**
   - Go back to backend service environment variables
   - Update `FRONTEND_URL` with the actual frontend URL
   - Save changes (triggers automatic redeploy)

2. **Verify Deployment**
   - Test backend health: `https://your-backend-service.onrender.com/api/health`
   - Test frontend application: `https://your-frontend-service.onrender.com`
   - Try user registration and login

3. **Initialize Demo Data (Optional)**
   - The demo user script runs automatically
   - Or manually trigger via backend logs if needed

### Production Configuration Features
- ✅ Automatic HTTPS certificates
- ✅ Auto-deployment from GitHub commits
- ✅ Environment variable management
- ✅ Build logs and monitoring
- ✅ Custom domain support (optional)
- ✅ Database connection with Neon.tech

## 7. API Documentation

### Base URLs
- **Development**: `http://localhost:50001/api`
- **Production**: `https://your-backend-service.onrender.com/api`

### Swagger/OpenAPI Specification
The API includes built-in documentation available at:
- **Production**: `https://your-backend-service.onrender.com/api`
- **Development**: `http://localhost:50001/api`

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Rate Limiting
- **Authentication endpoints**: 20 requests per 15 minutes per IP
- **General API endpoints**: 200 requests per 15 minutes per IP

---

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "manager"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "manager"
  }
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "manager"
  }
}
```

#### GET /auth/profile
Get current user profile (requires authentication).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "manager"
  }
}
```

---

### Driver Management Endpoints

#### GET /drivers
Get all drivers with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by driver status
- `limit` (optional): Limit number of results

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "license_number": "DL123456789",
      "phone": "+1234567890",
      "email": "alice@example.com",
      "status": "available",
      "current_shift_hours": 4.5,
      "past_7_day_work_hours": 35.2
    }
  ],
  "count": 1
}
```

#### POST /drivers
Create a new driver.

**Request:**
```json
{
  "name": "Bob Smith",
  "license_number": "DL987654321",
  "phone": "+1987654321",
  "email": "bob@example.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Driver created successfully",
  "data": {
    "id": 2,
    "name": "Bob Smith",
    "license_number": "DL987654321",
    "phone": "+1987654321",
    "email": "bob@example.com",
    "status": "available",
    "current_shift_hours": 0,
    "past_7_day_work_hours": 0
  }
}
```

#### PUT /drivers/:id
Update an existing driver.

#### DELETE /drivers/:id
Delete a driver.

---

### Route Management Endpoints

#### GET /routes
Get all delivery routes.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "route_id": "R001",
      "start_location": "Warehouse A",
      "end_location": "Customer District 1",
      "distance_km": 15.5,
      "traffic_level": "Medium",
      "base_time_minutes": 45
    }
  ],
  "count": 1
}
```

#### POST /routes
Create a new delivery route.

**Request:**
```json
{
  "route_id": "R002",
  "start_location": "Warehouse B",
  "end_location": "Customer District 2",
  "distance_km": 22.3,
  "traffic_level": "High",
  "base_time_minutes": 60
}
```

---

### Order Management Endpoints

#### GET /orders
Get all orders with optional filtering.

**Query Parameters:**
- `status`: Filter by order status
- `assigned_route`: Filter by route ID

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_id": "ORD001",
      "value_rs": 2500.00,
      "assigned_route": "R001",
      "delivery_timestamp": "2024-01-15T14:30:00.000Z",
      "status": "pending",
      "assigned_driver_id": null,
      "profit": null,
      "is_on_time": null
    }
  ],
  "count": 1
}
```

#### PUT /orders/:id
Update an existing order.

**Request:**
```json
{
  "value_rs": 2750.00,
  "assigned_route": "R002",
  "delivery_timestamp": "2024-01-15T16:00:00.000Z",
  "status": "assigned"
}
```

---

### Simulation Endpoints

#### POST /simulation/run
Execute a delivery simulation with Purple Merit rules.

**Request:**
```json
{
  "available_drivers": 5,
  "route_start_time": "2024-01-15T09:00:00.000Z",
  "max_hours_per_driver": 8
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Simulation completed successfully",
  "simulation_id": 12,
  "results": {
    "total_orders": 25,
    "orders_assigned": 23,
    "on_time_deliveries": 20,
    "efficiency_score": 87.0,
    "financial_summary": {
      "total_penalties": 150.00,
      "total_bonuses": 750.00,
      "total_fuel_cost": 2340.00,
      "overall_profit": 15840.00
    },
    "driver_utilization": [
      {
        "driver_id": 1,
        "driver_name": "Alice Johnson",
        "orders_assigned": 5,
        "hours_utilized": 7.5,
        "utilization_percentage": 93.75,
        "was_fatigued": false
      }
    ]
  }
}
```

#### GET /simulation/history
Get simulation history with pagination.

**Query Parameters:**
- `limit`: Number of results (default: 10)

---

### Health Check Endpoint

#### GET /health
Check API health status.

**Response (200):**
```json
{
  "success": true,
  "message": "Purple Merit Technologies API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

### Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Email is required", "Password must be at least 6 characters"]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

### Example Requests & Responses

#### Complete User Registration Flow
```bash
# 1. Register new user
curl -X POST http://localhost:50001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "manager"
  }'

# 2. Login with new user
curl -X POST http://localhost:50001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# 3. Use token for authenticated requests
curl -X GET http://localhost:50001/api/drivers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Postman Collection

A comprehensive Postman collection is available for testing all endpoints:

1. **Import the collection**: Use the API documentation endpoint to get OpenAPI spec
2. **Set environment variables**:
   - `baseUrl`: `http://localhost:50001/api` or your production URL
   - `authToken`: Your JWT token after login
3. **Test all endpoints** with sample data

### Purple Merit Business Rules Implementation

The simulation engine implements these core business rules:

1. **Late Delivery Penalty**: ₹50 penalty for deliveries >10 minutes late
2. **Driver Fatigue Rule**: 30% slower delivery time for drivers working >8 hours/day  
3. **High-Value Bonus**: 10% bonus for orders >₹1000 delivered on time
4. **Fuel Cost Calculation**: ₹5/km base + ₹2/km surcharge for high traffic
5. **Overall Profit Calculation**: Order value + bonuses - penalties - fuel costs
6. **Efficiency Score**: Percentage of on-time deliveries

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting (`npm test`, `npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Submit a pull request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation for endpoint details
- Review the deployment guide for hosting issues

---

**Purple Merit Technologies** - Optimizing logistics operations through intelligent simulation and real-time analytics.
