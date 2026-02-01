## 2025-05-14 - [A11y Redundancy and Labeling]
**Learning:** Adding `aria-label` to buttons with clear visible text can be confusing for speech-input users if they don't match. Also, `aria-live` regions should avoid redundant hidden text if the content is already descriptive.
**Action:** Ensure `aria-label` matches visible text when possible and minimize redundant `sr-only` content in live regions.
