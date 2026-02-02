## 2025-05-14 - [Form Accessibility and Tool Constraints]
**Learning:** In this Vite/React project, form labels were not linked to inputs, and decorative icons lacked `aria-hidden`. Additionally, the `read_file` tool's `offset` parameter (mentioned in memory) is not actually in the tool's schema, requiring `cat` or `sed` for large files.
**Action:** Always verify label-input linkage with `id` and `htmlFor`. Use bash tools like `sed` to read specific parts of large files when `read_file` truncates.
