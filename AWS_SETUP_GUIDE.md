# AWS Setup Guide for IFlyChat

## Complete Step-by-Step AWS Configuration

### 1. Create AWS Account and IAM User

1. **Sign up for AWS**: Go to https://aws.amazon.com and create an account
2. **Create IAM User for API access**:
   - Go to AWS Console > IAM > Users > Create User
   - User name: `iflychat-api`
   - Select "Programmatic access"
   - Create user and save the Access Key ID and Secret Access Key

### 2. Set up S3 Bucket for File Storage

1. **Go to S3 Console**: AWS Console > S3
2. **Create Bucket**:
   - Click "Create bucket"
   - Bucket name: `iflychat-files-[your-unique-suffix]` (must be globally unique)
   - Region: `us-east-1` (or your preferred region)
   - Keep default settings for now
   - Click "Create bucket"

3. **Configure Bucket Permissions**:
   - Go to your bucket > Permissions tab
   - Click "Bucket policy" and add this policy (replace `YOUR-BUCKET-NAME`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "IFlyhatAPIAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/iflychat-api"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR-BUCKET-NAME",
                "arn:aws:s3:::YOUR-BUCKET-NAME/*"
            ]
        }
    ]
}
```

### 3. Set up Bedrock for AI

1. **Go to Bedrock Console**: AWS Console > Bedrock
2. **Enable Model Access**:
   - Go to "Model access" in the left sidebar
   - Click "Enable specific models"
   - Find "Anthropic" section and enable:
     - `Claude 3 Sonnet`
     - `Claude 3 Haiku` (optional, for faster responses)
   - Click "Save changes"
   - Wait for status to become "Access granted" (can take a few minutes)

### 4. Set up RDS PostgreSQL Database

1. **Go to RDS Console**: AWS Console > RDS
2. **Create Database**:
   - Click "Create database"
   - Engine: PostgreSQL
   - Version: 15.x (latest stable)
   - Templates: "Free tier" (for testing) or "Production" 
   - DB instance identifier: `iflychat-db`
   - Master username: `iflychat_admin`
   - Master password: Create a strong password
   - DB instance class: db.t3.micro (free tier) or larger
   - Storage: 20 GB (minimum)
   - VPC: Default VPC (or create new one)
   - Public access: Yes (for development, No for production)
   - VPC security groups: Create new
   - Database name: `iflychat`
   - Click "Create database"

3. **Configure Security Group**:
   - Go to EC2 > Security Groups
   - Find the security group created for your RDS instance
   - Add inbound rule:
     - Type: PostgreSQL
     - Port: 5432
     - Source: Your IP address (for development)

### 5. IAM Permissions for Your User

1. **Go to IAM Console**: AWS Console > IAM > Users
2. **Find your user** (`iflychat-api`) and click on it
3. **Add Permissions**:
   - Click "Add permissions" > "Attach policies directly"
   - Create a custom policy with these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject", 
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR-BUCKET-NAME",
                "arn:aws:s3:::YOUR-BUCKET-NAME/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:ListFoundationModels"
            ],
            "Resource": "*"
        }
    ]
}
```

### 6. Get Your Configuration Values

After setting everything up, gather these values for your `.env` file:

#### From IAM User:
- **AWS_ACCESS_KEY_ID**: Go to IAM > Users > your-user > Security credentials tab
- **AWS_SECRET_ACCESS_KEY**: From when you created the user (or create new one)
- **AWS_REGION**: The region where you created your resources (e.g., `us-east-1`)

#### From S3:
- **S3_BUCKET_NAME**: The name of the bucket you created

#### From RDS:
- **DATABASE_URL**: Go to RDS > Databases > your-database > Connectivity & security
  - Format: `postgresql://username:password@endpoint:5432/database_name`
  - Example: `postgresql://iflychat_admin:yourpassword@iflychat-db.abc123.us-east-1.rds.amazonaws.com:5432/iflychat`

#### From Bedrock:
- **BEDROCK_REGION**: Same as AWS_REGION (must be a region where Bedrock is available)
- **BEDROCK_MODEL_ID**: `anthropic.claude-3-sonnet-20240229-v1:0` (if you enabled Claude 3 Sonnet)

### 7. Update Your .env File

Replace the placeholder values in your `.env` file with the real values:

```bash
# Database Configuration (from RDS)
DATABASE_URL=postgresql://iflychat_admin:yourpassword@your-rds-endpoint:5432/iflychat

# AWS Configuration (from IAM user)
AWS_ACCESS_KEY_ID=AKIA... (your actual access key)
AWS_SECRET_ACCESS_KEY=abc123... (your actual secret key)
AWS_REGION=us-east-1
S3_BUCKET_NAME=iflychat-files-yoursuffix

# Bedrock Configuration
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# Application Configuration (can keep these as-is)
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt
```

### 8. Test Your Setup

After updating your `.env` file, you can test the database connection:

```bash
cd backend
python init_db.py
```

This will create all the necessary database tables.

### 9. Cost Considerations

- **S3**: ~$0.023 per GB per month + requests
- **RDS db.t3.micro**: Free tier for 12 months, then ~$13/month
- **Bedrock**: Pay per API call (Claude 3 Sonnet ~$3 per million input tokens)

### 10. Security Notes

- Never commit your `.env` file to git
- Use IAM roles instead of access keys in production
- Set up VPC and private subnets for production RDS
- Enable S3 bucket versioning and encryption
- Use AWS Secrets Manager for passwords in production
