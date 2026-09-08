# Teai - AI Voice Agent Platform

Teai is a Next.js-based platform for building, managing, and deploying intelligent AI voice agents. It leverages Google Genkit for AI orchestration and ElevenLabs for high-quality voice generation.

## Features

- **Instant Agent Creation**: Go from a text prompt to a full agent using GenAI.
- **Conversational Flows**: Build structured dialogue for static or dynamic AI interactions.
- **ElevenLabs Integration**: Use state-of-the-art TTS with personal API key support.
- **Multi-channel Testing**: Test your agents via Chat, Web Call, or Phone Call.
- **Integrated Knowledge Base**: Train agents on website content or uploaded files.
- **SaaS Ready**: Includes Billing, Analytics, and Admin management.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Google Genkit, Gemini 2.5 Flash
- **Voice**: ElevenLabs API
- **Database/Auth**: Firebase (Firestore, Authentication)
- **UI**: Tailwind CSS, ShadCN UI, Lucide Icons

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone [your-repo-url]
    cd teai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    Create a `.env.local` file and add:
    ```
    DEFAULT_ELEVENLABS_KEY=your_elevenlabs_key
    NEXT_PUBLIC_BASE_URL=http://localhost:9002
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## License

MIT
