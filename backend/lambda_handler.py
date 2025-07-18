"""
Lambda entry point for the IFlyChat backend.
This file is used when deploying to AWS Lambda.
Now works with pure psycopg2 instead of SQLAlchemy.
"""
from mangum import Mangum
from server import app

# Create the Lambda handler
handler = Mangum(app, lifespan="off")

# For compatibility with different Lambda runtime environments
lambda_handler = handler
