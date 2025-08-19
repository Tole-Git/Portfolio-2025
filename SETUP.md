# Setup Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Gemini API key

## Environment Configuration

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

## Installation

```bash
git clone [your-repo-url]
cd Portfolio-2025
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Architecture

### Frontend
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations

### AI Integration
- Google Gemini API for chat functionality
- Server-side streaming for real-time responses
- Context-aware conversation handling
- Error handling and graceful degradation

## Customization

### AI Responses
Edit the system prompt in `src/app/api/chat/route.ts`:
```typescript
const systemPrompt = `You are Tony Le's AI assistant...`
```

### Animation Timing
Adjust durations in `src/app/page.tsx`:
```typescript
setTimeout(() => {
  setChatAtBottom(true);
}, 800);
```

### Content
Update professional information in the About Me sections within `page.tsx`.

## Troubleshooting

**API Key Issues**
- Verify the key is set correctly in `.env.local`
- Restart the development server
- Check API quota limits in Google AI Studio

**Performance Issues**
- Use a modern browser with hardware acceleration
- Check browser dev tools for bottlenecks
- Consider reducing animation complexity on mobile

**Streaming Issues**
- Verify API key permissions
- Check network requests in browser inspector
- Ensure deployment platform supports streaming

## Production Deployment

### Environment Variables
```bash
GEMINI_API_KEY=your_production_key
NODE_ENV=production
```

### Optimizations
- Enable gzip compression
- Configure CDN for static assets
- Monitor API usage
- Set up error tracking

### Security
- Keep API keys secure
- Implement request validation
- Add CORS protection
- Monitor usage patterns
