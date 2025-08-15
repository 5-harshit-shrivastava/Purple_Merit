# Purple Merit - Render Deployment Guide

## Backend Deployment on Render

### Prerequisites
- Render account
- PostgreSQL database (Neon.tech already configured)

### Backend Setup
1. **Create New Web Service**
   - Connect your GitHub repository
   - Choose the `backend` folder as the root directory
   - Or use manual deployment by uploading the backend folder

2. **Environment Variables**
   Set these environment variables in Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=your_neon_database_url
   JWT_SECRET=your-secure-jwt-secret-key
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

3. **Build Configuration**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18 (specified in .nvmrc)

4. **Database Setup**
   - The app uses Neon PostgreSQL (already configured)
   - Make sure DATABASE_URL is set correctly
   - Database tables will be created automatically on first run

### Backend Features
- ✅ Express.js API server
- ✅ PostgreSQL with Neon.tech
- ✅ JWT Authentication
- ✅ Rate limiting
- ✅ CORS configured
- ✅ Helmet security
- ✅ Request validation
- ✅ Error handling
- ✅ Health check endpoint

---

## Frontend Deployment on Render

### Frontend Setup
1. **Create New Static Site**
   - Connect your GitHub repository
   - Choose the `frontend` folder as the root directory

2. **Build Configuration**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: 18 (specified in .nvmrc)

3. **Environment Variables**
   Set in Render dashboard:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```

### Frontend Features
- ✅ React 18 with Vite
- ✅ TailwindCSS styling
- ✅ React Router for navigation
- ✅ Axios for API calls
- ✅ Recharts for data visualization
- ✅ JWT authentication
- ✅ Responsive design

---

## Deployment Steps

### 1. Deploy Backend First
1. Go to Render Dashboard
2. Create new "Web Service"
3. Connect GitHub repository
4. Set root directory to `backend`
5. Configure environment variables
6. Deploy

### 2. Deploy Frontend
1. Create new "Static Site" 
2. Connect same GitHub repository
3. Set root directory to `frontend`
4. Set `VITE_API_BASE_URL` to your backend URL
5. Deploy

### 3. Update CORS
After frontend is deployed, update the backend's `FRONTEND_URL` environment variable with the actual frontend URL.

---

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://your-frontend.onrender.com
```

### Frontend (.env.production)
```
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

---

## Health Checks

### Backend Health Check
- **URL**: `https://your-backend.onrender.com/api/health`
- **Response**: JSON with status and timestamp

### Frontend Health Check
- **URL**: `https://your-frontend.onrender.com`
- **Expected**: Application loads successfully

---

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update `FRONTEND_URL` in backend environment variables
2. **Database Connection**: Verify `DATABASE_URL` is correct
3. **Build Failures**: Check Node.js version (should be 18+)
4. **API Errors**: Verify backend is deployed and healthy

### Debug Commands
```bash
# Check backend health
curl https://your-backend.onrender.com/api/health

# Check API documentation
curl https://your-backend.onrender.com/api
```

---

## Features Included

### Backend API Endpoints
- **Auth**: Login, Register, Profile
- **Drivers**: CRUD operations
- **Routes**: CRUD operations
- **Orders**: CRUD operations
- **Simulation**: Run simulations, view history
- **Data**: Load initial data, upload CSV, statistics

### Frontend Pages
- **Dashboard**: Analytics and charts
- **Drivers**: Driver management
- **Routes**: Route management
- **Orders**: Order management
- **Simulation**: Run delivery simulations
- **Auth**: Login and registration

### Security Features
- JWT authentication
- Request rate limiting
- Input validation
- SQL injection protection
- CORS configuration
- Helmet security headers