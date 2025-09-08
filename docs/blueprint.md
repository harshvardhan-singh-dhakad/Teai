# **App Name**: Teai: AI Voice Agent Platform

## Core Features:

- AI Agent Creation from Text Prompt: Create a new AI agent from a user-provided text prompt using Genkit AI flows.
- Prompt Enhancement: Enhance user-provided prompts to create detailed prompts for AI agent creation. LLM is a tool for the enhancement.
- Draft Agent Management: Manage draft AI agents, storing them in LocalStorage until publication.
- Published Agent Management: Manage published AI agents, storing them in Firebase Firestore with status updates and editing capabilities.
- Agent Editor Interface: Provide a tabbed interface in edit mode for agent configuration: Details, Integrations, Configurations and Post-Call settings.
- AI Assistant Chatbot: Include an AI-powered chatbot within the agent editor page to assist users in agent creation and answer questions, using the LLM as a tool to retrieve the information and formulate responses.
- Agent Testing Simulator: Allow users to test their agents, with integration to the simulator

## Style Guidelines:

- Color palette derived from the concept of a 'voice in the dark'. The background is a very dark desaturated purple-blue. The primary is a vibrant purple. The accent is a brighter blue. Primary color: Vibrant purple (#A663CC) for a modern feel.
- Background color: Very dark desaturated blue-purple (#1A1A2E) for a sleek, modern dark theme.
- Accent color: Bright Blue (#63B5FF) for highlights and interactive elements.
- Font pairing: 'Space Grotesk' (sans-serif) for headings and 'Inter' (sans-serif) for body text.
- Note: currently only Google Fonts are supported.
- Use Lucide-react icons for a consistent and modern look.
- Implement a sidebar navigation for main sections and a header with a user profile dropdown and theme toggle.
- Incorporate subtle animations and transitions for a smooth user experience.