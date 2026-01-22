# ⚛️ Chain Reaction - Multiplayer Web Game

A real-time multiplayer chain reaction game built with React, TypeScript, Node.js, and Socket.IO. Support 2-10 players with voice chat, text chat, and smooth animations.

## 🎮 Game Features

- **Real-time Multiplayer**: 2-10 players can play simultaneously
- **Chain Reaction Mechanics**: Strategic gameplay with explosive chain reactions
- **Customizable Board Sizes**: Small (6×8), Medium (8×10), Large (10×12)
- **Voice Chat**: WebRTC-based peer-to-peer voice communication
- **Text Chat**: Real-time chat during gameplay
- **Smooth Animations**: 60 FPS animations for explosions and interactions
- **Responsive Design**: Works on desktop and mobile devices
- **Room System**: Create or join rooms with unique IDs

## 🎯 How to Play

1. **Objective**: Be the last player with dots on the board
2. **Starting**: Each player gets 3 colored dots randomly placed
3. **Making Moves**: Place dots on empty cells or your own cells
4. **Chain Reactions**: When a cell reaches 4 dots, it explodes!
   - The exploding cell becomes empty
   - It spreads 1 dot to each neighbor (up, down, left, right)
   - All spread dots become your color
   - Chain reactions continue recursively
5. **Winning**: Last player with dots on the board wins!

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Shared Types  │
│                 │    │                 │    │                 │
│ React + TS      │◄──►│ Node.js +       │◄──►│ TypeScript      │
│ Socket.IO Client│    │ Express +       │    │ Interfaces      │
│ WebRTC          │    │ Socket.IO       │    │                 │
│                 │    │ Game Engine     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Components

- **Frontend**: React + TypeScript with Socket.IO client
- **Backend**: Node.js + Express + Socket.IO server
- **Game Engine**: Chain reaction logic and state management
- **Shared**: TypeScript interfaces for type safety

## 🚀 Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Socket.IO Client**: Real-time communication
- **WebRTC**: Peer-to-peer voice chat
- **CSS3**: Smooth animations and transitions

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Socket.IO**: Real-time bidirectional communication
- **TypeScript**: Type-safe server code
- **UUID**: Unique room ID generation

### DevOps
- **Docker**: Containerized deployment
- **Nginx**: Reverse proxy and static file serving
- **Docker Compose**: Multi-container orchestration

## 📦 Project Structure

```
chain-reaction-game/
├── shared/                 # Shared TypeScript types
│   ├── types.ts           # Game interfaces
│   ├── index.ts           # Exports
│   └── package.json
├── backend/               # Node.js server
│   ├── src/
│   │   ├── game/         # Game engine
│   │   ├── socket/       # Socket.IO handlers
│   │   └── index.ts      # Server entry
│   ├── Dockerfile
│   └── package.json
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # Socket service
│   │   ├── styles/       # CSS styles
│   │   └── App.tsx       # Main app
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml    # Multi-container setup
└── README.md
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional, for containerized development)

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd chain-reaction-game
```

2. **Install shared dependencies**
```bash
cd shared
npm install
npm run build
```

3. **Setup backend**
```bash
cd ../backend
npm install
npm run dev
```

4. **Setup frontend**
```bash
cd ../frontend
npm install
npm start
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Docker Development

1. **Build and run with Docker Compose**
```bash
docker-compose up --build
```

2. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🌐 Production Deployment

### Render.com Deployment

#### Backend Deployment

1. **Create a new Web Service on Render**
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Name**: chain-reaction-backend
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     - `NODE_ENV`: production
     - `PORT`: 3001

4. **Add Environment Variables:**
   - `FRONTEND_URL`: Your frontend URL (e.g., https://chain-reaction-frontend.onrender.com)

#### Frontend Deployment

1. **Create a new Static Site on Render**
2. **Configure the site:**
   - **Name**: chain-reaction-frontend
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment Variables**:
     - `REACT_APP_SERVER_URL`: Your backend URL (e.g., https://chain-reaction-backend.onrender.com)

#### Custom Domain (Optional)

1. **Add custom domains** in Render dashboard
2. **Configure DNS** records as instructed by Render
3. **Update CORS settings** in backend if needed

### Docker Deployment

1. **Build and push images**
```bash
# Build backend
docker build -t chain-reaction-backend ./backend

# Build frontend
docker build -t chain-reaction-frontend ./frontend

# Tag and push to registry
docker tag chain-reaction-backend your-registry/chain-reaction-backend
docker tag chain-reaction-frontend your-registry/chain-reaction-frontend
docker push your-registry/chain-reaction-backend
docker push your-registry/chain-reaction-frontend
```

2. **Deploy with Docker Compose**
```bash
# Update docker-compose.yml with your registry URLs
docker-compose up -d
```

## 🔧 Configuration

### Environment Variables

#### Backend
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS

#### Frontend
- `REACT_APP_SERVER_URL`: Backend Socket.IO URL

### WebRTC Configuration

The voice chat uses Google's STUN servers by default:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

For production, consider using your own STUN/TURN servers.

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Type Checking
```bash
# Backend
cd backend
npm run typecheck

# Frontend
cd frontend
npm run typecheck
```

## 📊 Performance

### Optimization Features
- **React.memo**: Prevent unnecessary re-renders
- **useCallback**: Optimize event handlers
- **Object Pooling**: Efficient particle management
- **Diff-based Sync**: Only send changed cells
- **Gzip Compression**: Reduce bundle size
- **Lazy Loading**: Code splitting for better performance

### Monitoring
- Health check endpoints
- Performance metrics
- Error tracking (implement as needed)

## 🔒 Security

### Implemented Measures
- **CORS**: Cross-origin resource sharing protection
- **Input Validation**: Server-side move validation
- **Rate Limiting**: Implement as needed
- **Secure Headers**: XSS protection, content security policy

### Recommendations
- Add authentication for private rooms
- Implement rate limiting for Socket.IO events
- Add HTTPS in production
- Consider adding abuse reporting

## 🐛 Troubleshooting

### Common Issues

1. **Socket.IO Connection Issues**
   - Check backend URL configuration
   - Verify CORS settings
   - Check firewall rules

2. **Voice Chat Not Working**
   - Ensure HTTPS for WebRTC (required in most browsers)
   - Check microphone permissions
   - Verify STUN server accessibility

3. **Performance Issues**
   - Monitor memory usage during chain reactions
   - Check for memory leaks in animations
   - Optimize bundle size

4. **Deployment Issues**
   - Verify environment variables
   - Check build logs
   - Ensure proper port configuration

### Debug Mode

Enable debug logging:
```bash
# Backend
DEBUG=socket.io:* npm run dev

# Frontend
localStorage.setItem('debug', 'socket.io-client:*')
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Socket.IO team for excellent real-time communication
- React community for amazing UI framework
- WebRTC for peer-to-peer communication capabilities

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the game rules documentation

---

**Enjoy playing Chain Reaction! 🎮**