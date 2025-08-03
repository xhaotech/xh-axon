#!/bin/bash

echo "🚀 XH-Axon API功能测试"
echo "=========================="

API_BASE="http://localhost:3100"

echo ""
echo "1️⃣ 测试健康检查..."
curl -s "${API_BASE}/health" | jq .

echo ""
echo "2️⃣ 获取所有集合..."
curl -s "${API_BASE}/api/collections" | jq '.[] | {id, name, description}'

echo ""
echo "3️⃣ 获取环境列表..."
curl -s "${API_BASE}/api/environments" | jq '.[] | {id, name, isActive}'

echo ""
echo "4️⃣ 创建新集合..."
NEW_COLLECTION=$(curl -s -X POST "${API_BASE}/api/collections" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试集合",
    "description": "通过脚本创建的测试集合"
  }')
echo $NEW_COLLECTION | jq .

COLLECTION_ID=$(echo $NEW_COLLECTION | jq -r '.id')
echo "新集合ID: $COLLECTION_ID"

echo ""
echo "5️⃣ 测试请求执行..."
curl -s -X POST "${API_BASE}/api/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "url": "/api/test",
    "headers": {"Content-Type": "application/json"}
  }' | jq .

echo ""
echo "6️⃣ 测试批量执行..."
curl -s -X POST "${API_BASE}/api/batch-execute" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {"id": "req-1", "name": "测试请求1"},
      {"id": "req-2", "name": "测试请求2"},
      {"id": "req-3", "name": "测试请求3"}
    ],
    "options": {"parallel": false, "delay": 100}
  }' | jq .

echo ""
echo "7️⃣ 删除测试集合..."
curl -s -X DELETE "${API_BASE}/api/collections/$COLLECTION_ID" | jq .

echo ""
echo "✅ 所有API测试完成！"
echo ""
echo "🌐 前端地址: http://localhost:3000"
echo "🔧 后端地址: http://localhost:3100"
echo "📖 功能说明: 查看 FEATURES.md 文件"
