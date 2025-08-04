#!/bin/bash

echo "🚀 Starting XH-Axon Services..."

# Kill any existing processes on ports 3000 and 3100
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3100 | xargs kill -9 2>/dev/null || true

echo "📋 Cleared existing processes on ports 3000 and 3100"

# Start frontend
echo "🌐 Starting frontend on port 3000..."
cd /Users/cnwangzd/Documents/cnwangzd/wangzd/小浩科技/项目管理/xhtech/xh-axon
pnpm dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Start backend
echo "⚙️  Starting backend on port 3100..."
cd /Users/cnwangzd/Documents/cnwangzd/wangzd/小浩科技/项目管理/xhtech/xh-axon/backend
node simple-server.js > ../backend.log 2>&1 &
BACKEND_PID=$!

echo "✅ Services started!"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend PID: $BACKEND_PID"
echo "Frontend logs: frontend.log"
echo "Backend logs: backend.log"

# Wait a moment for services to start
sleep 3

# Check if services are running
echo "🔍 Checking service status..."
if curl -s -I http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend failed to start"
fi

if curl -s -I http://localhost:3100 > /dev/null; then
    echo "✅ Backend is running on http://localhost:3100"
else
    echo "❌ Backend failed to start"
fi

echo "🎉 Service restart complete!"
