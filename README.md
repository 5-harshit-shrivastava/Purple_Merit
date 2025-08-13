# Purple Merit Technologies - Logistics Management System

## Project Overview & Purpose

Purple Merit Technologies is a comprehensive logistics management system designed to streamline delivery operations, route optimization, and driver management. The platform provides real-time simulation capabilities, order tracking, and data analytics for efficient logistics operations.

### Key Features
- **Driver Management**: Complete CRUD operations for driver profiles
- **Route Optimization**: Advanced routing algorithms for delivery optimization
- **Order Tracking**: Real-time order status and delivery management
- **Simulation Engine**: Run logistics simulations to optimize operations
- **Data Analytics**: Comprehensive reporting and statistics
- **Authentication**: Secure JWT-based user authentication

## Tech Stack Used

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Helmet** for security
- **Morgan** for logging
- **Jest** for testing
- **Multer** for file uploads
- **CSV-Parser** for data processing

### Frontend
- **React 19** with modern hooks
- **Vite** for build tooling
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Recharts** for data visualization
- **Lucide React** for icons

### Development Tools
- **ESLint** for code linting
- **Nodemon** for development
- **CORS** for cross-origin requests

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PurpleMerit
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb purplemerit_db
   
   # Run database schema
   psql -d purplemerit_db -f schema.sql
   
   # Initialize database with sample data
   node scripts/initDB.js
   ```

4. **Environment Configuration**
   Create a `.env` file in the backend directory (see Environment Variables section)

5. **Start Backend Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

3. **Build for Production**
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/purplemerit_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration (for production)
FRONTEND_URL=https://your-frontend-domain.com
```

**Important**: Never commit actual environment variable values to version control.

## Deployment Instructions

### Backend Deployment

**Platform**: Heroku / Railway / Render / DigitalOcean

1. **Production Environment Setup**
   ```bash
   # Set NODE_ENV to production
   export NODE_ENV=production
   
   # Install production dependencies only
   npm ci --only=production
   ```

2. **Database Migration**
   ```bash
   # Run schema on production database
   psql $DATABASE_URL -f schema.sql
   ```

3. **Heroku Deployment**
   ```bash
   # Login to Heroku
   heroku login
   
   # Create Heroku app
   heroku create purplemerit-api
   
   # Add PostgreSQL addon
   heroku addons:create heroku-postgresql:mini
   
   # Set environment variables
   heroku config:set JWT_SECRET=your-production-jwt-secret
   heroku config:set JWT_EXPIRES_IN=24h
   heroku config:set NODE_ENV=production
   
   # Deploy
   git push heroku main
   
   # Run database migration
   heroku run psql $DATABASE_URL -f schema.sql
   ```

4. **Alternative: Railway Deployment**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway link
   railway up
   ```

### Frontend Deployment

**Platform**: Vercel / Netlify / Firebase Hosting

1. **Build for Production**
   ```bash
   cd frontend
   npm run build
   ```

2. **Vercel Deployment**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Netlify Deployment**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

4. **Update CORS Settings**
   Update backend environment variables with production frontend URL

### Live Deployment URLs
- **Frontend**: `https://purplemerit-frontend.vercel.app`
- **Backend API**: `https://purplemerit-api.herokuapp.com`
- **API Health Check**: `https://purplemerit-api.herokuapp.com/api/health`

## API Documentation

### Base URLs
- **Development**: `http://localhost:5000/api`
- **Production**: `https://purplemerit-api.herokuapp.com/api`
- **Live API Docs**: `https://purplemerit-api.herokuapp.com/api`

### Authentication Endpoints
```
POST /auth/register     - User registration
POST /auth/login        - User login
GET  /auth/profile      - Get user profile (protected)
```

### Driver Management
```
GET    /drivers         - Get all drivers
GET    /drivers/:id     - Get driver by ID
POST   /drivers         - Create new driver
PUT    /drivers/:id     - Update driver
DELETE /drivers/:id     - Delete driver
```

### Route Management
```
GET    /routes              - Get all routes
GET    /routes/:id          - Get route by ID
GET    /routes/route/:route_id - Get route by route_id
POST   /routes              - Create new route
PUT    /routes/:id          - Update route
DELETE /routes/:id          - Delete route
```

### Order Management
```
GET    /orders          - Get all orders
GET    /orders/:id      - Get order by ID
POST   /orders          - Create new order
PUT    /orders/:id      - Update order
DELETE /orders/:id      - Delete order
```

### Simulation Engine
```
POST /simulation/run    - Run logistics simulation
GET  /simulation/history - Get simulation history
```

### Data Management
```
POST /data/load-initial - Load initial sample data
POST /data/upload-csv   - Upload CSV data files
POST /data/load-json    - Load JSON data
GET  /data/stats        - Get system statistics
```

### Example API Requests

#### Register User (Production)
```bash
curl -X POST https://purplemerit-api.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

#### Login User (Production)
```bash
curl -X POST https://purplemerit-api.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

#### Create Driver (Protected Route - Production)
```bash
curl -X POST https://purplemerit-api.herokuapp.com/api/drivers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "John Driver",
    "email": "driver@example.com",
    "phone": "+1234567890",
    "license_number": "DL123456789"
  }'
```

#### Get All Drivers (Production)
```bash
curl -X GET https://purplemerit-api.herokuapp.com/api/drivers \
  -H "Authorization: Bearer your-jwt-token"
```

#### Run Simulation (Production)
```bash
curl -X POST https://purplemerit-api.herokuapp.com/api/simulation/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "simulation_type": "route_optimization",
    "parameters": {
      "driver_count": 5,
      "order_count": 20
    }
  }'
```

### Example API Responses

#### Successful Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "Authentication failed"
}
```

### API Testing

#### Running Backend Tests
```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

#### Health Check (Production)
```bash
curl https://purplemerit-api.herokuapp.com/api/health
```

#### Health Check (Local Development)
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Purple Merit Technologies API is running",
  "timestamp": "2025-01-13T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Postman Collection
For complete API testing, import the Postman collection available at:
`/docs/Purple_Merit_API.postman_collection.json` (if available)

Or use the built-in API documentation endpoints:
- **Production**: `GET https://purplemerit-api.herokuapp.com/api` - Returns complete API endpoint documentation
- **Local**: `GET http://localhost:5000/api` - Returns complete API endpoint documentation

### Live API Testing
You can test the live API directly using these hosted endpoints:
- **API Base**: `https://purplemerit-api.herokuapp.com/api`
- **Health Check**: `https://purplemerit-api.herokuapp.com/api/health`
- **API Documentation**: `https://purplemerit-api.herokuapp.com/api`

### Swagger/OpenAPI Documentation
The API includes built-in documentation available at:
- **Production**: `https://purplemerit-api.herokuapp.com/api`
- **Development**: `http://localhost:5000/api`

---

## Development Guidelines

### Code Quality
- Run `npm run lint` before committing
- Maintain test coverage above 80%
- Follow REST API conventions
- Use proper error handling

### Security
- All sensitive routes require JWT authentication
- Passwords are hashed using bcrypt
- CORS is properly configured
- Input validation using Joi schemas

### Contributing
1. Fork the repository
2. Create feature branch
3. Run tests and linting
4. Submit pull request

---

**Purple Merit Technologies** - Streamlining logistics operations with modern technology.
