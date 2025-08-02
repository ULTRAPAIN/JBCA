# JaiBhavani Cement Agency - Deployment Guide

## 🚀 Quick Deployment Steps

### Prerequisites
- [ ] Git repository (GitHub/GitLab)
- [ ] MongoDB Atlas account
- [ ] Vercel/Netlify account
- [ ] Railway/Render account

### Backend Deployment (Railway - Recommended)

#### 1. Prepare Backend for Production

Create `.env.production` file in `construction-backend/`:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=https://your-frontend-domain.vercel.app
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

#### 2. Update package.json Scripts
Ensure your `construction-backend/package.json` has:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required for Node.js backend'"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

#### 3. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `construction-backend` folder
6. Add environment variables in Railway dashboard
7. Deploy!

### Frontend Deployment (Vercel)

#### 1. Prepare Frontend for Production

Update `Construction-frontend/src/services/api.js`:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.railway.app/api'
  : 'http://localhost:5000/api';
```

Create `Construction-frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.railway.app/api
VITE_APP_NAME=JaiBhavani Cement Agency
```

#### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your repository
4. Set root directory to `Construction-frontend`
5. Add environment variables
6. Deploy!

### Database Setup (MongoDB Atlas)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Create database user
4. Whitelist your IP (0.0.0.0/0 for cloud deployment)
5. Get connection string
6. Add to backend environment variables

---

## 🖥️ Option 2: VPS Deployment

### Server Requirements
- Ubuntu 20.04+ LTS
- 2GB RAM minimum
- Node.js 16+
- MongoDB (local or Atlas)
- Nginx
- PM2

### Setup Commands

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

---

## 📋 Production Checklist

### Security
- [ ] Remove all console.log statements ✅ (Already done)
- [ ] Set strong JWT secret
- [ ] Use HTTPS
- [ ] Set up CORS properly
- [ ] Hide sensitive environment variables

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Database indexing
- [ ] Image optimization

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Monitor uptime
- [ ] Database backup strategy

---

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/construction-db
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=JaiBhavani Cement Agency
```

---

## 🚨 Common Issues & Solutions

### CORS Errors
- Update CORS_ORIGIN in backend .env
- Check frontend API URL configuration

### Database Connection
- Whitelist server IP in MongoDB Atlas
- Check connection string format

### Build Failures
- Ensure all dependencies are in package.json
- Check Node.js version compatibility

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs
3. Verify environment variables
4. Test API endpoints directly

---

Ready to deploy? Let's start with the step-by-step process!
