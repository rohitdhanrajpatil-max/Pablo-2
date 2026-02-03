## 2025-02-03 - Missing entry point in index.html
**Learning:** The application's `index.html` is missing a script tag to load the entry point (`index.tsx`), which prevents the React application from mounting. This blocks automated testing and preview verification.
**Action:** Always check `index.html` for a proper script module tag when the application fails to render in a preview environment.

## 2025-02-03 - Playwright in Headless Environment
**Learning:** Programmatic testing of voice-based features is difficult in headless environments because the `SpeechRecognition` API is often unavailable or requires user interaction permissions.
**Action:** Focus on verifying the DOM structure and ARIA attributes for voice-related components instead of the full capture flow.
