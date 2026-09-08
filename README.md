# Teai - AI Voice Agent Platform

Teai is a Next.js-based platform for building, managing, and deploying intelligent AI voice agents. It leverages Google Genkit for AI orchestration and ElevenLabs for high-quality voice generation.

## Features

- **Instant Agent Creation**: Go from a text prompt to a full agent using GenAI.
- **Dynamic Conversational Flows**: AI agents that can stick to a script or deviate naturally.
- **ElevenLabs Integration**: Personal API key support for custom voice usage.
- **Knowledge Base**: Train agents on websites or document uploads.
- **Dashboard**: Full analytics, user management, and agent builder.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Google Genkit (Gemini 2.5 Flash)
- **Voice**: ElevenLabs API
- **Database**: Firebase (Firestore, Auth)
- **Styling**: Tailwind CSS, ShadCN UI

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/harshvardhan-singh-dhakad/Teai.git
    cd Teai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    Create a `.env.local` file:
    ```
    DEFAULT_ELEVENLABS_KEY=your_key_here
    NEXT_PUBLIC_BASE_URL=http://localhost:9002
    ```

4.  **Run development server**:
    ```bash
    npm run dev
    ```

## License
MIT
