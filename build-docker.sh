#!/bin/bash

echo "🐳 Building XH-Axon Docker Image..."

# 确保我们在正确的目录
cd "$(dirname "$0")"

# 清理之前的构建
echo "🧹 Cleaning up previous builds..."
docker system prune -f

# 构建 Docker 镜像
echo "🏗️  Building Docker image..."
docker build -t xh-axon:latest .

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo "📦 Image size:"
    docker images xh-axon:latest
    
    echo ""
    echo "🚀 To run the container:"
    echo "docker run -p 80:80 -p 3100:3100 xh-axon:latest"
    echo ""
    echo "🐙 Or use docker-compose:"
    echo "docker-compose up -d"
else
    echo "❌ Docker build failed!"
    exit 1
fi
