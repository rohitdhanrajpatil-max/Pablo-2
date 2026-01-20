## 2024-07-25 - Inline Validation Over Alerts
**Learning:** Using `window.alert()` for form validation is disruptive and blocks user interaction. A better UX is to display a temporary, inline error message near the source of the error. This provides context without interrupting the user's flow.
**Action:** In the future, when encountering `alert()` for validation, I will replace it with a non-blocking inline message that disappears automatically.
