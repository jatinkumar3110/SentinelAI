#!/bin/bash
# SentinelAI One-Click Setup Script

set -e  # Exit on error

echo "🚀 SentinelAI Production Setup"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v python &> /dev/null; then
    echo -e "${RED}❌ Python not found${NC}"
    exit 1
fi

PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✅ Python ${PYTHON_VERSION}${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"

echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists, skipping${NC}"
fi

echo "Installing Python dependencies..."
pip install -q -r requirements.txt
echo -e "${GREEN}✅ Python dependencies installed${NC}"

# Create directories
mkdir -p backend/models backend/data
echo -e "${GREEN}✅ Created models and data directories${NC}"

# Train models if not exists
if [ ! -f "backend/models/lstm_autoencoder.pth" ]; then
    echo "Training ML models (this may take a few minutes)..."
    python -m app.train.train_all
    echo -e "${GREEN}✅ Models trained successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Models already exist, skipping training${NC}"
fi

cd ..

echo ""

# Frontend setup
echo "🎨 Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists, skipping${NC}"
fi

echo "Installing Node dependencies..."
npm install
echo -e "${GREEN}✅ Node dependencies installed${NC}"

cd ..

echo ""
echo "=============================="
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo "=============================="
echo ""
echo "🚀 To start the application:"
echo ""
echo "  Backend:"
echo "    cd backend"
echo "    python -m app.main"
echo "    → http://localhost:8000"
echo ""
echo "  Frontend:"
echo "    cd frontend"
echo "    npm run dev"
echo "    → http://localhost:3000"
echo ""
echo "  Or use Docker:"
echo "    docker-compose up -d"
echo ""
echo "📚 Documentation:"
echo "  - README.md"
echo "  - DEPLOYMENT.md"
echo "  - API Docs: http://localhost:8000/docs"
echo ""
