# ✨ Pl.ai| The Fantastic Code Playground | GenAI Sandbox ✨

Low-key letting you vibe check AI models by just coding it. No cap, it hits different. 🚀✍️📊

![image](/public/Assets/a.png)
![image](/public/Assets/b.png)
![image](/public/Assets/c.png)
![image](/public/Assets/d.png)
![image](/public/Assets/e.png)
![image](/public/Assets/f.png)

## What's the Vibe? 🤔

You know how sometimes you just wanna poke at an AI model, test prompts, see what it *actually* does, without the whole setting-up-a-full-script headache? Bet. This is *that*.

It's a chill Next.js App Router project with a Monaco Editor (yes, like the one in VS Code 👀) where you can write simple API calls using a custom syntax like `Provider.Model.Method("Your Prompt Here")`. Hit the "Run" button, and boom – get the output right there.

It's your personal sandbox to experiment, see capabilities, and maybe feel like a tech wiz for a sec. Main character energy, for sure.

## The Flex List (Features) 🔥

*   ✍️ **Code Like a Pro:** Powered by the awesome Monaco Editor for syntax highlighting and that familiar VS Code feel. Slay.
*   ✨ **Custom Syntax:** Write direct calls like `Provider.Model.Method("Query")`. Clean, simple, no unnecessary boilerplate.
*   🧠 **Smart Autocompletion:** Get suggestions for Providers (like `Gemini`), Models (all the ones your API key can access!), and Methods (`generateContent`, `countTokens`, etc.) right as you type. It's kinda unhinged how easy it is.
*   🚀 **API Gateway:** Handles sending your custom code off to a Next.js API route that talks to the actual Google GenAI APIs (or others later!).
*   📊 **See the Output:** Get text responses, token counts, embedding previews, or image generation confirmations right there. No need to switch windows.
*   💅 **Next.js App Router:** Built with the latest Next.js architecture because, like, why wouldn't it be?
*   🌗 **Theme Aware:** Dark mode slays, light mode is... also an option. (Thanks, `next-themes`!)
*   🌐 **Monaco Workers:** Configured to load Monaco's heavy lifting in web workers to keep the UI snappy. (If you see worker errors, check the setup notes!)

## Getting Started (The Setup Era) 🛠️

Ready to dive in? It's not complicated, promise.

### The Non-Negotiables 👇

*   [Node.js](https://nodejs.org/) (LTS recommended)
*   npm, yarn, or pnpm

### Cloning the Repo 

```bash
git clone <your-repo-url-here>
cd <your-repo-folder-name>
```

### API Key Secrets (No Leaks! 🤫)

You need to tell the app your API key. Create a file named `.env.local` in the root of your project.

```dotenv
GEMINI_API_KEY='YOUR_GEMINI_API_KEY_HERE'
```

**DO NOT commit your `.env.local` file to Git!** It's already ignored by `.gitignore`, but double-check.

### Install the Dependencies (The Usual Suspects) 📦

Pick your package manager:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Firing it Up (Dev Mode Activated) 🔥

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Your app should now be live at `http://localhost:3000`.

## How to Use It (The Main Character Energy) 😎

1.  **POV:** You land on the page. You see a dropdown, a code editor, a button, and an output box.
2.  **Select Your Vibe:** Pick a Provider from the dropdown (currently just `Gemini`).
3.  **Code Your Destiny:** Click into the editor. It's where the magic happens. Start typing! The autocompletion is your bestie here.
    *   It starts blank or with just `Gemini`. Type a dot `.`.
    *   **Get Model Suggestions:** A list of models available via your API key will pop up (e.g., `gemini-pro`, `gemini-1.5-flash`, etc.). Select one. The text becomes `Gemini.your-selected-model.`.
    *   Type another dot `.`.
    *   **Get Method Suggestions:** A list of methods supported by that specific model will appear (e.g., `generateContent`, `countTokens`, `embedContent`, `generateImages`). Select one. The text becomes `Gemini.your-selected-model.yourMethod(`.
    *   Type your input **inside quotes** immediately after the opening parenthesis: `Gemini.gemini-pro.generateContent("Tell me a fun fact about otters.")`. Make sure your query is a valid string enclosed in single or double quotes!
4.  **Hit the Button:** Click the "Run" button.
5.  **Witness the Magic (Or Errors):** The output box will show the API response (text, count, embedding preview, or image confirmation) or any errors that occurred during parsing or the API call.

### Supported Roster (Season 1) 👇

This is just the beginning!

*   **Provider:**
    *   `Gemini`
*   **Methods (for compatible Gemini Models):**
    *   `generateContent("text query")`: Generates text based on your prompt.
    *   `countTokens("text query")`: Tells you how many tokens your text consumes.
    *   `embedContent("text query")`: Generates an embedding vector (shows a preview + dimension count).
    *   `generateImages("image prompt")`: Sends a prompt to an image model (like `imagen-3.0-generate-002`) and confirms if generation was successful. (Doesn't display the image in the text output currently).

*(Note: Make sure the model name you select supports the method you are calling! The autocompletion should help with this, but the API will error if they're incompatible).*

## Future Vibes (The Glow-Up Plan) 📈

This project is ripe for more! Ideas include:

*   Adding more AI Providers (OpenAI, Claude, etc.)
*   Supporting more API Methods (Web search, multimodal inputs - send text + images!)
*   Richer Output Display (Actually show generated images, structured data)
*   Handling more complex method arguments than just a single string.
*   Saving and loading snippets.
*   A cooler UI, obviously.

Feel free to pull up and contribute!

## Pull Up (Contributing) 👋

Wanna add a feature, fix a bug, or just make the code cleaner? Bet!

1.  Fork this repo.
2.  Create your feature branch (`git checkout -b feat/my-new-thing`).
3.  Commit your changes (`git commit -m 'feat: add my cool thing'`).
4.  Push to the branch (`git push origin feat/my-new-thing`).
5.  Open a Pull Request.

Keep your code clean and try to match the existing vibe. ✨

## Shoutouts (Big Thanks To) 🙏

*   [Monaco Editor](https://microsoft.github.io/monaco-editor/) - For the sick editor.
*   [@google/genai](https://github.com/google/generative-ai-nodejs) - For the easy Node.js client and Wonderful documentation. Check it out [here](https://github.com/googleapis/js-genai/tree/main)
*   [Next.js](https://nextjs.org/) - For the App Router goodness.
*   [Tailwind CSS](https://tailwindcss.com/) - For styling without the struggle.
*   [next-themes](https://github.com/pacocoursey/next-themes) - For dark mode that slays.

Made with good vibes and code by Rahul, Docs and AI.