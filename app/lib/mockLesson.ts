// /lib/mockLesson.ts

import { Lesson } from "./lesson";

export const mockOnchainKitLesson: Lesson = {
  meta: {
    title: "Getting Started with OnchainKit",
    sourceUrl: "https://docs.base.org/builderkits/onchainkit/getting-started",
    estimatedDuration: "10 min",
    objectives: [
      "Understand what OnchainKit is",
      "Learn how to install OnchainKit",
      "Integrate OnchainKit into your project",
      "Explore key features like Sign-in With Ethereum",
    ],
  },
  modules: [
    {
      id: "module-1",
      type: "text",
      content:
        "OnchainKit is a developer toolset by Coinbase that simplifies building onchain apps with React. It provides hooks, UI components, and utilities like Sign-in With Ethereum (SIWE) and transaction helpers.",
    },
    {
      id: "module-2",
      type: "code",
      content: `npm install @coinbase/onchainkit`,
    },
    {
      id: "module-3",
      type: "text",
      content:
        "After installing OnchainKit, you can wrap your app with the OnchainProvider to enable onchain features.",
    },
    {
      id: "module-4",
      type: "code",
      content: `<OnchainProvider config={{ appId: 'YOUR_APP_ID' }}> ... </OnchainProvider>`,
    },
    {
      id: "module-5",
      type: "quiz",
      content: "What does OnchainKit help developers with?",
      quizOptions: [
        "Managing smart contracts",
        "Simplifying onchain app development",
        "Storing user data",
        "Deploying dApps to Base mainnet",
      ],
      correctAnswer: "Simplifying onchain app development",
    },
  ],
};
