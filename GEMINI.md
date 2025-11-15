# GEMINI.md

## Project Overview

This is a Next.js project that provides an AI-powered matchmaking tool. The application allows users to upload a CSV file containing a list of participants, and then generates matches between them with AI-generated explanations for each match.

The project uses the following technologies:

*   **Next.js**: A React framework for building server-rendered and statically generated web applications.
*   **Firebase Genkit**: A framework for building AI-powered features with Google's generative AI models.
*   **shadcn/ui**: A collection of re-usable UI components.
*   **Tailwind CSS**: A utility-first CSS framework for styling.
*   **Papaparse**: A library for parsing CSV files.
*   **Zod**: A TypeScript-first schema declaration and validation library.

## Building and Running

### Prerequisites

*   Node.js and npm (or pnpm/yarn)
*   Firebase project with Genkit enabled

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

1.  **Run the Next.js development server:**
    ```bash
    npm run dev
    ```
    This will start the web application on `http://localhost:9002`.

2.  **Run the Genkit development server:**
    ```bash
    npm run genkit:dev
    ```
    This will start the Genkit server, which is required for the AI features to work.

### Building for Production

To create a production build, run the following command:

```bash
npm run build
```

This will create an optimized build of the application in the `.next` directory.

To start the production server, run:

```bash
npm run start
```

## Development Conventions

### Linting

The project uses Next.js's built-in ESLint configuration. To run the linter, use the following command:

```bash
npm run lint
```

### Type Checking

The project uses TypeScript for type safety. To check for type errors, run the following command:

```bash
npm run typecheck
```

### AI Flows

The AI-powered features are implemented using Firebase Genkit. The AI flows are defined in the `src/ai/flows` directory. Each flow consists of a prompt and a flow function that orchestrates the interaction with the AI model.

### Server Actions

The application uses Next.js Server Actions to communicate with the backend and the AI services. The server actions are defined in the `src/lib/actions.ts` file.
