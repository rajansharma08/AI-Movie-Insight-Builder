# AI Movie Insight Builder

A production-ready full-stack application that analyzes movie sentiment using AI-powered insights from audience reviews.

## Overview

Enter an IMDb movie ID (e.g., `tt0133093`), and the application:
- Fetches comprehensive movie metadata from OMDb API
- Retrieves audience reviews from The Movie Database (TMDB)
- Analyzes sentiment using OpenAI's GPT-3.5
- Presents results in a beautiful, modern UI with smooth animations

## Tech Stack

### Frontend
- **Next.js 14** - App Router for modern React development
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and interactions

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **OpenAI API** - Sentiment analysis
- **OMDb API** - Movie metadata
- **TMDB API** - Audience reviews

### DevOps & Tools
- **Vercel** - Production deployment
- **Jest** - Unit testing
- **ESLint** - Code quality

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Environment Variables

Create a `.env.local` file and add your API keys:

```env
# OMDb API - Get key from https://www.omdbapi.com/apikey.aspx
OMDB_API_KEY=your_omdb_api_key

# TMDB API - Get key from https://www.themoviedb.org/settings/api
TMDB_API_KEY=your_tmdb_api_key

# OpenAI API - Get key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Obtaining API Keys:**

1. **OMDb API**
   - Visit https://www.omdbapi.com/apikey.aspx
   - Free tier available with rate limits

2. **TMDB API**
   - Create account at https://www.themoviedb.org
   - Go to Settings → API
   - Use v3 API key

3. **OpenAI API**
   - Create account at https://platform.openai.com
   - Generate API key from https://platform.openai.com/api-keys
   - Ensure you have credit or payment method set up

### 3. Development

```bash
# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

### 4. Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### 5. Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## Tech Stack Rationale

- **Next.js 14 (App Router)**: Single TypeScript ecosystem for UI + API routes, reducing integration overhead and keeping deployment simple.
- **TypeScript**: Enforces safer contracts for movie payloads, API responses, and sentiment objects, improving maintainability.
- **Tailwind CSS**: Fast and consistent styling with low CSS maintenance overhead.
- **Framer Motion**: Declarative animation system for polished UX without custom animation boilerplate.
- **OMDb + TMDB**: OMDb gives metadata quickly; TMDB provides audience reviews and richer cast context.
- **OpenAI API**: Primary sentiment summarization engine; local fallback keeps the app resilient when quota/service issues occur.
- **Jest + ts-jest**: Lightweight unit testing in the same TypeScript toolchain.

## Assumptions

- The user provides a valid IMDb ID in the `tt1234567` format.
- API keys are configured through `.env.local` and are valid at runtime.
- TMDB may not always return reviews; in that case fallback generation is used only when enough public signals exist (rating/plot).
- If public signals are insufficient (for example `N/A` rating and no usable plot), the app avoids inventing reviews and shows an insufficient-data path.
- Rate limiting is in-memory, which is acceptable for local/demo deployments; shared stores (like Redis) are recommended for multi-instance production.
- OpenAI can fail due quota/network; the app should still return a usable sentiment result via fallback logic.

## Project Architecture

```
ai-movie-insight/
├── app/
│   ├── api/
│   │   ├── movie/route.ts      # Fetch movie data & reviews
│   │   └── sentiment/route.ts  # Analyze sentiment with AI
│   ├── page.tsx                # Main page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── SearchForm.tsx          # IMDb ID input form
│   ├── MovieCard.tsx           # Movie details display
│   ├── SentimentCard.tsx       # Sentiment analysis results
│   ├── Loader.tsx              # Loading spinner
│   └── ErrorMessage.tsx        # Error display
├── lib/
│   ├── omdb.ts                 # OMDb API client
│   ├── tmdb.ts                 # TMDB API client
│   ├── openai.ts               # OpenAI API client
│   ├── api.ts                  # API utilities
│   └── rateLimit.ts            # Rate limiting middleware
├── utils/
│   ├── validate.ts             # Input validation
│   └── sentimentHelper.ts      # Sentiment utilities
├── types/
│   └── movie.ts                # TypeScript interfaces
└── __tests__/
    └── validate.test.ts        # Unit tests
```

## API Endpoints

### GET /api/movie?imdbId=ttXXXXXXX

Fetches movie metadata and reviews.

**Query Parameters:**
- `imdbId` (required) - IMDb ID in format `tt0000000`

**Response:**
```json
{
  "success": true,
  "status": 200,
  "data": {
    "title": "Movie Title",
    "poster": "https://...",
    "year": "2023",
    "rating": "8.5/10",
    "plot": "Movie description...",
    "cast": ["Actor 1", "Actor 2"],
    "reviews": ["Review text 1", "Review text 2"]
  }
}
```

**Error Responses:**
- `400` - Invalid IMDb ID format
- `404` - Movie not found
- `429` - Rate limit exceeded
- `500` - Server error

### POST /api/sentiment

Analyzes sentiment from reviews using OpenAI.

**Request Body:**
```json
{
  "reviews": ["Review text 1", "Review text 2"]
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "data": {
    "aiSummary": "Overall sentiment summary...",
    "sentiment": "Positive"
  }
}
```

**Sentiment Values:** `Positive`, `Mixed`, `Negative`

**Error Responses:**
- `400` - Invalid request format
- `429` - Rate limit exceeded
- `500` - Server error

## Rate Limiting

API routes include built-in rate limiting:
- `/api/movie` - 20 requests per minute per IP
- `/api/sentiment` - 15 requests per minute per IP

Rate limits are enforced using in-memory storage and reset after the specified window.

## Deployment to Vercel

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository with code pushed

### Deploy Steps

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Click "Import"

2. **Environment Variables**
   - Add environment variables in project settings:
     - `OMDB_API_KEY`
     - `TMDB_API_KEY`
     - `OPENAI_API_KEY`
     - `NEXT_PUBLIC_APP_URL` (your Vercel domain)

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - View live at https://your-project.vercel.app

### Post-Deployment
- Verify all API integrations work
- Test sentiment analysis
- Monitor API usage and quota

## Code Quality & Best Practices

### TypeScript
- Strict mode enabled
- No `any` types
- Full type coverage

### Error Handling
- Try-catch blocks for all API calls
- User-friendly error messages
- Graceful fallbacks

### Performance
- ISR (Incremental Static Regeneration) for cached API responses
- Client-side component optimization with React.memo
- Lazy loading for heavy computations

### Security
- Environment variables for sensitive keys
- No credentials in version control
- Input validation on all endpoints
- Request timeout handling

## Testing

### Unit Tests

Unit tests validate core utilities:

```bash
npm test
```

Tests cover:
- IMDb ID validation
- Sentiment classification
- Input sanitization

### Manual Testing

**Test Scenarios:**

1. **Valid Movie**
   - Input: `tt0133093` (The Matrix)
   - Expected: Full movie details with sentiment

2. **Invalid ID**
   - Input: `invalid`
   - Expected: 400 error with helpful message

3. **Non-existent Movie**
   - Input: `tt9999999`
   - Expected: 404 error

4. **Rate Limiting**
   - Send 21+ requests in 60 seconds
   - Expected: 429 error on 21st request

## Assumptions & Design Decisions

### 1. **In-Memory Rate Limiting**
   - Simple implementation for MVP
   - Suitable for single-server deployment
   - For multi-server, replace with Redis

### 2. **Review Limit**
   - Up to top 20 reviews fetched from TMDB
   - Helps keep sentiment context rich without excessive payload size
   - If TMDB reviews are unavailable, synthetic fallback is used only when public signals are sufficient

### 3. **Sentiment Classification**
   - OpenAI is used as the primary sentiment engine
   - If OpenAI is unavailable (quota/network), local fallback summary + classification is used
   - Prevents hard failure while keeping output meaningful

### 4. **Caching Strategy**
   - ISR with 1-hour revalidation for OMDb
   - Reduces API costs
   - Users always get fresh movie metadata

### 5. **Client-Side Validation**
   - IMDb ID format validated before submission
   - Reduces unnecessary API calls
   - Improves UX with immediate feedback

### 6. **Error Boundaries**
   - Individual API failures don't halt other operations
   - TMDB failure doesn't prevent OMDb results
   - OpenAI failure falls back to keyword analysis

## Common Issues & Solutions

### Issue: "API Key Missing" Error
**Solution:** Verify `.env.local` has correct keys without quotes

### Issue: TMDB Reviews Not Loading
**Solution:** Ensure TMDB API key is active and has read permissions

### Issue: Sentiment Analysis Fails
**Solution:** Check OpenAI API balance and key permissions

### Issue: Rate Limit Errors (429)
**Solution:** Implemented per-endpoint with generous limits. Check test frequency.

## Future Enhancements

- [ ] Redis integration for distributed rate limiting
- [ ] Database for caching previous searches
- [ ] User authentication and favorites
- [ ] Detailed review breakdown by rating
- [ ] Comparative analysis across multiple movies
- [ ] Export analysis as PDF
- [ ] Dark/Light theme toggle

## Performance Metrics

Target metrics for production:
- API response: < 2 seconds
- Page load: < 3 seconds (with review fetching)
- Sentiment analysis: < 1 second (OpenAI)
- Rate limit checks: < 10ms

## Support & Documentation

For issues or questions:
- Check `.env.example` for configuration template
- Review API error messages in browser console
- Verify API credentials are active
- Check API quota limits

## License

MIT License - Feel free to use for commercial or personal projects.

## Contributing

To contribute improvements:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

**Built with ❤️ using Next.js 14 and Modern Web Technologies**
