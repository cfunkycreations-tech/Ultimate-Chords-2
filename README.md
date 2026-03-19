# Ultimate Chords 🎸

Ultimate Chords is a full-featured guitar tablature and lyrics application. It allows users to view, play, and generate guitar tabs for any song using advanced AI.

## Features

- **AI Tab Generation**: Generate accurate guitar tabs for any song on demand using Google's Gemini AI or OpenRouter.
- **Pro Tab Player**: An interactive tablature player with:
  - **High-Quality Audio**: Uses `soundfont-player` for realistic acoustic guitar tones.
  - **Real-time Playback**: Follow the playhead as the tab scrolls automatically.
  - **Speed Control**: Slow down the playback (0.5x, 0.7x) to practice difficult sections.
  - **Volume Control**: Adjust the master volume of the playback.
  - **Visual Highlighting**: Active measures are highlighted for better readability.
- **Guitar Tuner**: A built-in chromatic tuner that uses your microphone to help you tune your instrument.
- **Offline Caching**: Songs and tabs are cached locally, allowing you to access previously generated content even without an internet connection.
- **Multi-Provider AI**: Supports both native Google Gemini API and OpenRouter (using Gemini 2.0 Flash Lite Free).
- **Responsive Design**: Optimized for both desktop and mobile viewing.
- **Clean UI**: A modern, sleek interface built with Tailwind CSS and Lucide icons.

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (`@google/genai`) and OpenRouter API
- **Audio**: Web Audio API, `soundfont-player`
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key OR an OpenRouter API Key

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your API key(s):
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   OPENROUTER_API_KEY=your_openrouter_key_here
   ```
   *Note: The app will prioritize OpenRouter if both keys are provided.*
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/components`: Reusable UI components (ProTabPlayer, etc.)
- `src/lib`: Utility functions and the custom Tab Parser.
- `src/services`: Integration with external services like the Gemini API.
- `src/App.tsx`: Main application routing and layout.

## License

MIT
