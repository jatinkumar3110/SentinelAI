#!/bin/bash
# SentinelAI Health Check Script

echo "🔍 SentinelAI System Health Check"
echo "=================================="
echo ""

# Check backend
echo "Checking Backend..."
if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy (http://localhost:8000)"
    echo "   API Docs: http://localhost:8000/docs"
else
    echo "❌ Backend is not responding"
    echo "   Expected at: http://localhost:8000"
fi

echo ""

# Check frontend
echo "Checking Frontend..."
if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy (http://localhost:3000)"
else
    echo "❌ Frontend is not responding"
    echo "   Expected at: http://localhost:3000"
fi

echo ""

# Check models
echo "Checking Models..."
if [ -d "backend/models" ] && [ "$(ls -A backend/models)" ]; then
    echo "✅ Models directory exists and has files"
    ls -lh backend/models/ | grep -E '\.(pth|json)$'
else
    echo "⚠️  Models directory is empty or doesn't exist"
    echo "   Run: python -m app.train.train_all"
fi

echo ""

# Check data
echo "Checking Data..."
if [ -d "backend/data" ] && [ "$(ls -A backend/data)" ]; then
    echo "✅ Data directory exists and has cached training data"
else
    echo "ℹ️  Data directory is empty (will be created on first training)"
fi

echo ""
echo "=================================="
echo "🎯 System Status Summary"
echo "=================================="
