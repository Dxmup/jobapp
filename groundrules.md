# Ground Rules for JobCraft Development

We are in the v0 development environment.

Never create or use placeholder data unless explicitly instructed to. 

Start with the most simple solution first. 

**Framework and Libraries:** I default to the Next.js App Router, Tailwind CSS, shadcn/ui components, and Lucide React icons unless specified otherwise.

**Code Structure:**
- I use kebab-case for file names.
- I group React components inside a single `` block per response.
- I maintain the same project ID across `` blocks unless working on a completely different project.
- I use the `tsx file="file_path"` syntax to create React components.
- I use my ability to edit files quickly for small changes to existing code blocks.
- I use the `/scripts` folder for executable Python and Node.js code.

**Styling:** I try to use the shadcn/ui library and generate responsive designs.

**Images and Media:**
- I use `/placeholder.svg?height={height}&width={width}&query={query}` for placeholder images.
- I use the `filetype file="path/to/file.ext" url="[BLOB_URL]"` syntax to embed non-text files.
- I use icons from the "lucide-react" package.

**Accessibility:** I implement accessibility best practices.

**Database:** I use Supabase for database interactions, using the `@supabase/supabase-js` package.

**AI Integrations:** I use the AI SDK to build AI applications using AI integrations.

**Authentication:** I use cookie-based authentication.

**Existing Files:** I do not regenerate existing files unless modifications are needed.

**Executable Scripts:** I use the `/scripts` folder for executable Python and Node.js code.

**Diagrams:** I use Mermaid diagramming language to render diagrams and flowcharts.

**Math:** I use LaTeX to render mathematical equations and formulas.

**Suggested Actions:** I suggest 3-5 relevant follow-up actions after responding.

**Workspace:** I remember that the current workspace is "JobCraft" and reference any provided resources and instructions.

**Version Control:** I am aware of the current version of the project and any restorations or copies made.

**Live Audio Interviews:** I remember that the project uses live audio interviews with Gemini Live API, not text-based interviews.

**Testing:** I remember to test the code and verify that it works as expected.

**Error Handling:** I implement error handling and logging.

**Authentication:** I use cookie-based authentication.

**Environment Variables:** I use the existing environment variables and do not create .env files.

**Inline SQL:** I use the Inline SQL code block for both read and write SQL operations.

**File Actions:** I use `<MoveFile>` and `<DeleteFile>` to move and delete files in a React project.

**Code Style:** I use ES6+ syntax and the built-in `fetch` for HTTP requests in Node.js.

**Contextual Awareness:** I am aware of the current time and date.

**Domain Knowledge:** I use domain knowledge retrieved via RAG to provide accurate responses.

If you have any questions or need any clarification, ask before taking any actions.

Crafting a full and correct solution is far more valuable than being quick. It is ok to take more time to get the answer right rather than find the answer quickly. Have an engineer's mindset and tolerance for errors.
