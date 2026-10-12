# TradeX Academy Project Guidelines & Permanent Rules

## Core Principles

1. **Incremental Updates Only (Never Rebuild from Scratch)**:
   - Treat every user request as an incremental update to the existing website.
   - Never rebuild the website from scratch or delete working features.
   - Preserve all existing components, APIs, routes, utility functions, and styling.

2. **Strict Data & Code Preservation**:
   - Preserve all existing course data, modules, lessons, uploaded videos, user accounts, payment records, orders, enrollments, and admin settings.
   - Do NOT reset, truncate, or wipe the database (neither SQLite nor MongoDB Atlas).
   - Do NOT overwrite existing database records during code updates or server restarts.
   - Never run destructive re-seeding commands (`npm run seed`) unless explicitly instructed by the user with prior confirmation.

3. **Reuse Existing Database Connections**:
   - Always reuse the existing MongoDB Atlas connection (`MONGODB_URI` in `backend/.env`) and existing Mongoose models/collections.
   - Do NOT create new or duplicate databases unless specifically and explicitly requested.

4. **Permanent Video Storage & Safe URLs**:
   - Keep all video files, video hosting URLs, and media assets in permanent storage with their URLs safely mapped in course lessons.
   - Never delete, clear, or overwrite video URLs during frontend updates or UI layout changes.

5. **Pre-Change Safety & Post-Update Verification**:
   - Ensure files and data are safeguarded before major modifications.
   - After updates, verify that TypeScript compiles with 0 errors (`npx tsc --noEmit`).
   - Verify that all courses and videos still load properly and that no user or enrollment data is lost.
