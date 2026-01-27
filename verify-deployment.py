#!/usr/bin/env python3
"""
SentinelAI Deployment Verification Script
Checks if the system is production-ready
"""

import os
import sys
from pathlib import Path

# Colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def check(condition, message):
    """Print check result with color"""
    if condition:
        print(f"{GREEN}✓{RESET} {message}")
        return True
    else:
        print(f"{RED}✗{RESET} {message}")
        return False

def warn(message):
    """Print warning"""
    print(f"{YELLOW}⚠{RESET} {message}")

def main():
    print("=" * 60)
    print("🔍 SentinelAI Deployment Verification")
    print("=" * 60)
    print()
    
    checks_passed = 0
    checks_total = 0
    
    # Check Python version
    print("📦 Environment Checks")
    print("-" * 60)
    checks_total += 1
    if check(sys.version_info >= (3, 10), f"Python version {sys.version_info.major}.{sys.version_info.minor} >= 3.10"):
        checks_passed += 1
    
    # Check backend directory
    checks_total += 1
    backend_path = Path("backend")
    if check(backend_path.exists(), "Backend directory exists"):
        checks_passed += 1
    
    # Check frontend directory
    checks_total += 1
    frontend_path = Path("frontend")
    if check(frontend_path.exists(), "Frontend directory exists"):
        checks_passed += 1
    
    print()
    print("⚙️  Configuration Files")
    print("-" * 60)
    
    # Check backend .env.example
    checks_total += 1
    if check((backend_path / ".env.example").exists(), "Backend .env.example exists"):
        checks_passed += 1
    
    # Check backend .env
    checks_total += 1
    backend_env_exists = (backend_path / ".env").exists()
    if backend_env_exists:
        check(True, "Backend .env exists")
        checks_passed += 1
    else:
        warn("Backend .env missing - copy from .env.example")
    
    # Check frontend .env.example
    checks_total += 1
    if check((frontend_path / ".env.example").exists(), "Frontend .env.example exists"):
        checks_passed += 1
    
    # Check Dockerfile
    checks_total += 1
    if check((backend_path / "Dockerfile").exists(), "Backend Dockerfile exists"):
        checks_passed += 1
    
    # Check start.sh
    checks_total += 1
    if check((backend_path / "start.sh").exists(), "Backend start.sh exists"):
        checks_passed += 1
    
    # Check docker-compose.yml
    checks_total += 1
    if check(Path("docker-compose.yml").exists(), "docker-compose.yml exists"):
        checks_passed += 1
    
    print()
    print("📁 Dependencies")
    print("-" * 60)
    
    # Check requirements.txt
    checks_total += 1
    req_path = backend_path / "requirements.txt"
    if req_path.exists():
        with open(req_path) as f:
            content = f.read()
            has_dotenv = "python-dotenv" in content
            has_gunicorn = "gunicorn" in content
            if check(has_dotenv and has_gunicorn, "requirements.txt has python-dotenv and gunicorn"):
                checks_passed += 1
    
    # Check package.json
    checks_total += 1
    pkg_path = frontend_path / "package.json"
    if pkg_path.exists():
        import json
        with open(pkg_path) as f:
            pkg = json.load(f)
            has_scripts = "dev" in pkg.get("scripts", {}) and "build" in pkg.get("scripts", {})
            if check(has_scripts, "package.json has dev and build scripts"):
                checks_passed += 1
    
    print()
    print("🤖 Models & Data")
    print("-" * 60)
    
    # Check models directory
    models_path = backend_path / "models"
    checks_total += 1
    if check(models_path.exists(), "Models directory exists"):
        checks_passed += 1
        
        # Check for model files
        lstm_model = models_path / "lstm_autoencoder.pth"
        xgboost_model = models_path / "xgboost_classifier.json"
        
        if lstm_model.exists():
            check(True, "  LSTM model exists")
        else:
            warn("  LSTM model missing - run: python -m app.train.train_all")
        
        if xgboost_model.exists():
            check(True, "  XGBoost model exists")
        else:
            warn("  XGBoost model missing - run: python -m app.train.train_all")
    
    # Check data directory
    data_path = backend_path / "data"
    if data_path.exists():
        check(True, "Data directory exists")
    else:
        warn("Data directory missing - will be created on first training")
    
    print()
    print("📚 Documentation")
    print("-" * 60)
    
    checks_total += 1
    if check(Path("README.md").exists(), "README.md exists"):
        checks_passed += 1
    
    checks_total += 1
    if check(Path("DEPLOYMENT.md").exists(), "DEPLOYMENT.md exists"):
        checks_passed += 1
    
    print()
    print("=" * 60)
    print(f"📊 Results: {checks_passed}/{checks_total} checks passed")
    print("=" * 60)
    print()
    
    if checks_passed == checks_total:
        print(f"{GREEN}🎉 System is PRODUCTION READY!{RESET}")
        print()
        print("Next steps:")
        print("  1. Copy .env.example to .env and configure")
        print("  2. Train models: python -m app.train.train_all")
        print("  3. Start with: docker-compose up -d")
        return 0
    else:
        print(f"{YELLOW}⚠️  Some checks failed - review above{RESET}")
        print()
        print("Run setup script: bash setup.sh")
        return 1

if __name__ == "__main__":
    sys.exit(main())
