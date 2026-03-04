# AI Movie Insight Builder

Full-stack assignment project for Brew Hiring Assignment (Full-Stack Developer Internship Round 1).

## Assignment Coverage

This project implements the required flow:

- Input IMDb movie ID (example: `tt0133093`)
- Fetch movie details (title, poster, cast, year, rating, plot)
- Retrieve audience reviews from TMDB
- AI-based audience sentiment summary and sentiment class (`Positive`, `Mixed`, `Negative`)
- Responsive UI with validation, loading states, animations, and error handling

## Live Demo

Add deployed URL here after deployment:

- `https://your-app-url.vercel.app`

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- npm

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local` in project root:

```env
OMDB_API_KEY=your_omdb_key
TMDB_API_KEY=your_tmdb_key_or_v4_token
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Notes:

- TMDB supports both:
  - v3 API key (query param style)
  - v4 read access token (Bearer token style)
- If OpenAI quota is unavailable, app uses graceful fallback sentiment logic.

### 4. Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`.

### 5. Run Tests

```bash
npm test
```

### 6. Build for Production

```bash
npm run build
npm start
```

## Tech Stack Rationale

- **Next.js 14 (App Router)**:
  - Same TypeScript codebase for frontend + API routes
  - Fast iteration and straightforward deployment on Vercel
- **TypeScript**:
  - Strong typing for API responses, movie schema, and sentiment output
  - Fewer runtime data-shape bugs
- **Tailwind CSS**:
  - Fast, consistent UI development with low CSS overhead
- **Framer Motion**:
  - Smooth interaction and page transitions with maintainable declarative animations
- **OMDb + TMDB APIs**:
  - OMDb for reliable metadata
  - TMDB for review/cast enrichment
- **OpenAI API**:
  - Primary model-driven sentiment summary and classification
  - Local fallback keeps app functional during quota/service issues
- **Jest + ts-jest**:
  - Basic unit testing in TypeScript ecosystem as required

## Assumptions

- User enters a valid IMDb ID in `tt1234567` format.
- Third-party API keys are valid and configured in `.env.local`.
- TMDB reviews may be empty for some titles; fallback reviews are generated only when public signals are available.
- If both ratings and usable plot are missing, app avoids inventing reviews and shows insufficient-data behavior.
- In-memory rate limiting is acceptable for assignment scope (single-instance runtime).
- OpenAI can fail due network/quota; app still returns a usable sentiment result with fallback source.

## Features Implemented

### Core

- IMDb ID input with client-side validation
- Movie metadata rendering:
  - Title
  - Poster (safe fallback handling when unavailable)
  - Cast
  - Year and rating
  - Plot summary with `Read more / Show less`
- Audience review ingestion:
  - TMDB reviews (up to 20)
  - Synthetic fallback review generation (when appropriate)
- Sentiment analysis:
  - AI summary + class (`Positive` / `Mixed` / `Negative`)
  - Fallback analysis source when OpenAI unavailable

### UX / UI

- Responsive layout (mobile + desktop)
- Loading skeleton and disabled submit during request
- Friendly error states
- Animated transitions and sentiment badges
- Sentiment color coding:
  - Positive: green
  - Mixed: yellow
  - Negative: red

## API Endpoints

### `GET /api/movie?imdbId=ttXXXXXXX`

Returns movie metadata, cast, and reviews.

Error codes:

- `400`: Invalid IMDb ID
- `404`: Movie not found
- `429`: Rate limit exceeded
- `500`: Internal server error

### `POST /api/sentiment`

Request body:

```json
{
  "reviews": ["review 1", "review 2"]
}
```

Returns:

```json
{
  "success": true,
  "status": 200,
  "data": {
    "aiSummary": "Audience sentiment ...",
    "sentiment": "Mixed",
    "source": "openai"
  }
}
```

Error codes:

- `400`: Invalid review input / empty usable reviews
- `429`: Rate limit exceeded
- `500`: Internal server error

## Testing

Implemented basic unit tests using Jest:

- IMDb ID validation utility
- Sentiment keyword classification utility
- Review fallback behavior (TMDB available, synthetic fallback, insufficient signal handling)

Run:

```bash
npm test
```

## Deployment (Mandatory)

Recommended target: **Vercel** for Next.js.

### Steps

1. Push project to GitHub (private repository recommended for assignment).
2. Import repo in Vercel.
3. Add environment variables in Vercel project settings:
   - `OMDB_API_KEY`
   - `TMDB_API_KEY`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)
4. Deploy and verify:
   - valid IMDb ID flow
   - responsive UI
   - error handling paths

## Project Structure

```text
app/
  api/
    movie/route.ts
    sentiment/route.ts
  layout.tsx
  page.tsx
components/
  SearchForm.tsx
  MovieCard.tsx
  SentimentCard.tsx
  Loader.tsx
  ErrorMessage.tsx
lib/
  omdb.ts
  tmdb.ts
  openai.ts
  rateLimit.ts
  api.ts
types/
  movie.ts
utils/
  validate.ts
  sentimentHelper.ts
  reviewFallback.ts
__tests__/
  validate.test.ts
  reviewFallback.test.ts
```

## Notes for Reviewer

- This code follows JavaScript/TypeScript ecosystem constraints.
- Focus was kept on clean, maintainable implementation over over-engineered abstractions.
- Complex fallback paths include comments for clarity.

