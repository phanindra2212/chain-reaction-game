# Deployment Guide

## 🚀 Quick Deploy to Render

### Option 1: Using render.yaml (Easiest)

1. **Push your code to GitHub** (including the `render.yaml` file)
2. **Go to [Render.com](https://render.com)**
3. **Click "New" → "Blueprint"**
4. **Connect your GitHub repository**
5. **Render will automatically detect and deploy both services**

### Option 2: Manual Deployment

### Prerequisites
- GitHub account with repository pushed
- Render account (free tier available)

### Step 1: Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `chain-reaction-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

6. Click "Create Web Service"

### Step 2: Deploy Frontend

1. Go to Render Dashboard
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `chain-reaction-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Add Environment Variable**:
     ```
     REACT_APP_SERVER_URL=https://your-backend-url.onrender.com
     ```

5. Click "Create Static Site"

### Step 3: Update CORS Settings

Once you have the URLs, update the backend CORS configuration:

1. Go to your backend service on Render
2. Add/Update environment variable:
   ```
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

3. Trigger a redeploy

## 🐳 Docker Deployment

### Option 1: Docker Compose (Local)

```bash
# Clone and build
git clone <repository-url>
cd chain-reaction-game
docker-compose up --build
```

### Option 2: Docker Cloud Deployment

1. **Build and tag images**
```bash
# Backend
docker build -t your-username/chain-reaction-backend ./backend

# Frontend  
docker build -t your-username/chain-reaction-frontend ./frontend

# Push to registry
docker push your-username/chain-reaction-backend
docker push your-username/chain-reaction-frontend
```

2. **Deploy with updated docker-compose.yml**
```yaml
version: '3.8'

services:
  backend:
    image: your-username/chain-reaction-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - FRONTEND_URL=https://your-domain.com

  frontend:
    image: your-username/chain-reaction-frontend
    ports:
      - "80:80"
    environment:
      - REACT_APP_SERVER_URL=https://your-backend-domain.com
```

## 🔧 Environment Configuration

### Production Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
```

#### Frontend (.env)
```env
REACT_APP_SERVER_URL=https://your-backend-domain.com
```

### WebRTC STUN Servers

For production voice chat, configure your own STUN/TURN servers:

```typescript
// In VoiceChat.tsx
const configuration = {
  iceServers: [
    { urls: 'stun:your-stun-server.com:19302' },
    { 
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ]
};
```

## 🔒 Security Considerations

### HTTPS Requirement
WebRTC requires HTTPS in production browsers. Ensure:
- Frontend served over HTTPS
- Backend supports HTTPS (via reverse proxy)
- Socket.IO connects over WSS (WebSocket Secure)

### Rate Limiting
Add rate limiting to prevent abuse:

```javascript
// In backend/src/index.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### CORS Configuration
Update CORS for production:

```javascript
// In backend/src/index.ts
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

## 📊 Monitoring and Health Checks

### Health Endpoints
Both services include health endpoints:
- Frontend: `GET /health`
- Backend: `GET /health`

### Docker Health Checks
```dockerfile
# In Dockerfiles
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1
```

### Render Health Checks
Render automatically uses the `/health` endpoint for monitoring.

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Trigger Render Deploy
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"serviceId": "your-service-id"}' \
            https://api.render.com/v1/services/your-service-id/deploys
```

## 🐛 Production Debugging

### Enable Debug Logging
```bash
# Backend
DEBUG=socket.io:* npm start

# Frontend (in browser console)
localStorage.setItem('debug', 'socket.io-client:*');
```

### Common Production Issues

1. **Socket.IO Connection Fails**
   - Check CORS configuration
   - Verify backend URL
   - Ensure WebSocket support

2. **Voice Chat Not Working**
   - Must use HTTPS
   - Check STUN server accessibility
   - Verify microphone permissions

3. **Performance Issues**
   - Monitor memory usage
   - Check for memory leaks
   - Optimize bundle size

## 📈 Scaling Considerations

### Backend Scaling
- Use Redis for Socket.IO adapter in multi-instance deployments
- Consider load balancing for high traffic
- Monitor CPU and memory usage

### Frontend Scaling
- Use CDN for static assets
- Implement proper caching headers
- Consider server-side rendering for SEO

### Database Scaling
- Add persistent storage for game statistics
- Implement user authentication
- Store game history and leaderboards

## 🎯 Production Checklist

- [ ] HTTPS configured for both frontend and backend
- [ ] Environment variables set correctly
- [ ] CORS properly configured
- [ ] Health checks passing
- [ ] Rate limiting implemented
- [ ] Error monitoring setup
- [ ] Backup strategy in place
- [ ] Domain names configured
- [ ] SSL certificates valid
- [ ] Performance testing completed
- [ ] Security audit performed

---

**Your Chain Reaction game is now ready for production! 🎮**