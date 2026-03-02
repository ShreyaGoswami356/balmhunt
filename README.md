# Onwards

Onwards is a structured, time-bound reset program for high-performing professionals.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (server-side via `/api/chat`)

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root:

```env
OPENAI_API_KEY=your_openai_api_key
```

3. Start the app:

```bash
npm run dev
```

4. Open:

`http://localhost:3000`

## Key Routes

- `/` - Onwards landing page
- `/reset` - Session 1 intake flow
- `/session` - Structured session chat (12-response cap)
- `/api/chat` - Server-side OpenAI chat endpoint

## Notes

- API keys are never exposed to the client.
- Session mode is enforced server-side with structured progression.
- No database is used yet.
