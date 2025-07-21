# Database Initialization Lambda

This Lambda function should be run ONCE before deploying the main application to set up database tables.

## 📦 Files needed in Lambda package:

- `lambda_handler.py` (already exists)
- `init_db.py` 
- `models.py`
- `database.py`
- All dependencies from `requirements.txt`

## 🚀 Deployment:

1. Create Lambda function
2. Set same environment variables as main app
3. Upload zip package with above files
4. Run once
5. Then deploy main App Runner services

## ⚠️ Important:

This only needs to run once during initial setup. Do NOT include in main application container.
