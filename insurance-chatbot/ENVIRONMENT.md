# Environment Variables Configuration

This document outlines the environment variables needed for the Insurance Advisor AI Chatbot.

## Required Variables

### OpenAI API Configuration

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Required**: Your OpenAI API key for ChatGPT integration.

- Get your API key from: https://platform.openai.com/api-keys
- This is required for the chat functionality to work

## Optional Variables

### OpenAI Organization (if using organization account)

```bash
OPENAI_ORG_ID=your_org_id_here
```

### Application Configuration

```bash
NODE_ENV=development
```

**Default**: `development`
**Options**: `development`, `production`, `test`

### Custom API Configuration

```bash
OPENAI_BASE_URL=https://api.openai.com/v1
```

**Default**: `https://api.openai.com/v1`
**Use case**: For OpenAI-compatible APIs or custom endpoints

### Rate Limiting Configuration

```bash
CHAT_RATE_LIMIT_MAX_REQUESTS=15
CHAT_RATE_LIMIT_WINDOW_MS=60000
HEALTH_CHECK_RATE_LIMIT_MAX_REQUESTS=30
HEALTH_CHECK_RATE_LIMIT_WINDOW_MS=60000
```

**Defaults**:

- Chat: 15 requests per minute
- Health checks: 30 requests per minute

### Logging Configuration

```bash
LOG_LEVEL=info
```

**Default**: `info`
**Options**: `error`, `warn`, `info`, `debug`

### CORS Configuration

```bash
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**Default**: `*` (all origins allowed)
**Production**: Set to your specific domain(s)

## Setup Instructions

### For Local Development

1. Create a `.env.local` file in the project root
2. Add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your_actual_api_key_here
   ```

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the required variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: `production`

### For Netlify Deployment

1. Go to your Netlify site dashboard
2. Navigate to Site settings → Environment variables
3. Add the required variables

## Security Notes

- **Never commit API keys to version control**
- Use `.env.local` for local development (already in .gitignore)
- Set environment variables in your deployment platform
- Rotate API keys regularly
- Monitor API usage and costs

## Testing Configuration

To test if your environment is configured correctly:

1. Start the development server: `npm run dev`
2. Visit: `http://localhost:3000/api/chat`
3. You should see a health check response
4. Check the browser console for any configuration errors
