#!/usr/bin/env python3
"""
Database initialization script for IFlyChat
This replaces Alembic migrations since we're using pure psycopg2
"""

import os
import sys
import asyncio
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from database import create_tables, test_connection, initialize_connection_pool
from dotenv import load_dotenv

async def main():
    """Initialize the database"""
    # Load environment variables
    load_dotenv()
    
    print("🔄 Initializing IFlyChat database...")
    
    try:
        # Initialize connection pool
        print("📡 Connecting to database...")
        initialize_connection_pool()
        
        # Test connection
        connection_ok = await test_connection()
        if not connection_ok:
            print("❌ Database connection failed")
            return False
        
        print("✅ Database connection successful")
        
        # Create tables
        print("🏗️ Creating database tables...")
        create_tables()
        print("✅ Database tables created successfully")
        
        print("🎉 Database initialization complete!")
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
