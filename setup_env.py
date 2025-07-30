#!/usr/bin/env python3
"""
Environment Setup Script
This script helps you set up your environment variables safely.
"""

import os
from pathlib import Path

def create_env_file():
    """Create a .env file with placeholder values."""
    env_path = Path('.env')
    
    if env_path.exists():
        print("⚠️  .env file already exists!")
        response = input("Do you want to overwrite it? (y/N): ")
        if response.lower() != 'y':
            print("Setup cancelled.")
            return
    
    env_content = """# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
OPENAI_API_BASE=https://api.openai.com/v1

# Add any other environment variables your application needs below
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ .env file created successfully!")
    print("\n📝 Next steps:")
    print("1. Edit the .env file and replace 'your_openai_api_key_here' with your actual OpenAI API key")
    print("2. Make sure to keep your .env file secure and never commit it to version control")
    print("3. The .env file is already in .gitignore to prevent accidental commits")

if __name__ == "__main__":
    print("🔧 Environment Setup Script")
    print("=" * 40)
    create_env_file() 