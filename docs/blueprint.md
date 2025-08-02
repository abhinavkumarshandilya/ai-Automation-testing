# **App Name**: TestAutomator

## Core Features:

- Screenshot Display: Capture screenshots of the login page and display them in the app to visualize the UI elements and their states.
- URL Input: Accept user input for the test page URL, such as the Janitri Dashboard login page (https://dev-dash.janitri.in/).
- Locator Input and Display: Allow users to enter CSS selectors or other locators, so they can be shown in the interface, next to the captured screenshots.
- AI-Powered Locator Suggestions: Based on the screen image and selected locator, use an LLM to analyze whether that locator is reasonable and provide alternate suggestions. Incorporate RAG to inject documentation about recommended locator strategies into the tool prompt. The LLM acts as a tool suggesting better locators based on its reasoning about the screen image and documentation about locator strategies.

## Style Guidelines:

- Primary color: Deep indigo (#4B0082) to convey expertise and trustworthiness.
- Background color: Very light, desaturated indigo (#F0F8FF) for a clean, focused environment.
- Accent color: Violet (#8A2BE2) for interactive elements and highlights, providing a clear visual cue without overwhelming the user.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text, for a modern yet readable interface.
- Use a set of minimalist icons, monochromatic and in the violet accent color, for key functions like URL input, screenshot capture, and AI suggestions.
- The layout will be divided into clear, logical sections: URL input at the top, followed by screenshot display, locator input, and an AI suggestion panel.
- Subtle transitions and loading animations to provide feedback to the user, such as a progress bar when analyzing screenshots or locator suggestions.