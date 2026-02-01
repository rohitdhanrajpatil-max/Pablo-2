## 2026-02-01 - Improved Accessibility in Guest Feedback Form
**Learning:** In projects using custom-styled inputs, labels are often disconnected from their input elements, breaking accessibility for screen readers and making the UI less intuitive for mouse users (who expect to be able to click a label to focus an input).
**Action:** Always ensure that every `label` has a corresponding `htmlFor` attribute that matches the `id` of its `input`.
