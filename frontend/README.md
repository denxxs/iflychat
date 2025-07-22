# IFlyChat Frontend

React-based legal AI chat interface built with Tailwind CSS and modern UI components.

## 🚀 App Runner Deployment

This repo is ready for AWS App Runner deployment:

1. **Runtime**: Node.js 20
2. **Build command**: `npm install && npm run build`
3. **Start command**: `serve -s build -l 3000`
4. **Port**: 3000

## 📦 Environment Variables

Create these environment variables in App Runner:

```
REACT_APP_API_URL=https://your-backend-url.awsapprunner.com
REACT_APP_ENVIRONMENT=production
```

## 🐳 Container Deployment

Alternatively, use the included Dockerfile:

```bash
docker build -t iflychat-frontend .
docker run -p 3000:3000 iflychat-frontend
```

## ⚙️ Local Development

```bash
npm install
npm start
```

## 🔧 Tech Stack

- React 18
- Tailwind CSS
- Radix UI Components
- React Router
- Axios for API calls
