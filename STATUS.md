# STATUS.md

## Current Status (Nov 4, 2025)

**Root cause of production error**

The deployed Chatbot UI fork currently fails with a generic 500 server-side exception (digest 4068809989) on Vercel. Runtime logs in Vercel show the error originates from a server component during rendering, but the specific message is hidden in production builds. After investigating the code and environment configuration, the likely root causes are:

- The existing `chatbot-ui` codebase is tightly coupled to a `workspaces` concept and expects a `workspaces` table and associated logic. Our Supabase project does not currently include the `workspaces` table or rows, so the middleware and server components throw errors when trying to redirect or load a home workspace.
- Some required environment variables (such as `AUTH_SECRET`) were missing initially. These were added later, but the app still fails, suggesting other configuration mismatches.
- The codebase is large and includes features (assistants, tools, multi-workspace) beyond our simple requirements. This increases complexity and makes debugging more difficult.

**Quick fixes attempted**

- Added Supabase tables (`profiles`, `memories`, `uploads`) and row level security, created `sermons` storage bucket.
- Added environment variables in Vercel (OpenAI, Dify, Supabase keys, `AUTH_SECRET`).
- Verified no service keys are exposed on the client.
- Checked Vercel runtime logs for error details; however, the production build omits the specific error message and only shows a digest.

These steps did not resolve the error. Given the tight coupling to workspaces and the complexity of the upstream project, further debugging could exceed the allotted time and still not yield a stable app.

## Decision

Timeboxing and clarity guidelines recommend pivoting if a step blocks progress for more than 45 minutes. Since the existing Chatbot UI fork continues to throw server-side errors and its codebase is brittle/outdated relative to our simple requirements, we will pivot to a **clean fallback implementation**.

## Plan for fallback

1. **New Next.js 14 starter** – Initialize a minimal Next.js app (React 18, app router) with a dark ChatGPT-style layout: single input at bottom, scrollable chat area above, optional "+" button for file uploads. Use Tailwind CSS for styling.
2. **Supabase auth & DB integration** – Use Supabase email/password authentication. Set up client (`supabase-js`) on the frontend with the anon key and server client on API routes with the service role key. Create tables (`profiles`, `memories`, `uploads`) with RLS policies as already done.
3. **Server API routes**:
   - `POST /api/chat` – Accepts `{ messages, fileIds? }`, ensures the user is authenticated, retrieves any uploaded file text from Supabase, and proxies the request to Dify using the Dify API key and base URL. Stream responses back to the client via `NextResponse` and readable streams.
   - `POST /api/upload` – Accepts multipart file uploads, extracts text (using `pdf-parse`/`mammoth` for PDFs/DOCX/TXT), stores the raw file in Supabase Storage (bucket `sermons`) and returns a file ID.
4. **Per-user memory** – Save conversation summaries to the `memories` table keyed by user and topic. Load recent summaries when a new session starts and include them in the system prompt to Dify.
5. **Dify app** – Use the existing Dify app (`52a33212-b1c9-4034-bdbb-48e8316f9ae1`), with knowledge base and doctrinal alignment already configured. Disable citations.
6. **Environment variables** – Keep all keys (OpenAI, Dify, Supabase service role) in server-only envs. Expose only `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_ANON_KEY` to the client. Use a strong `AUTH_SECRET`.
7. **Testing & Deployment** – Test the new app locally (`npm run build && npm start`). Ensure login, chat, file upload, and memory features work without exposing secrets. Deploy to Vercel and confirm production works.

This fallback approach is simpler, decouples us from the brittle Chatbot UI code, and allows us to meet the user’s requirements with modern Next.js patterns.
