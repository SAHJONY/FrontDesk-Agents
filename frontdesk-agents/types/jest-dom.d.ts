// Load @testing-library/jest-dom/vitest type declarations.
// This extends vitest's Assertion and AsymmetricMatchersContaining interfaces
// with all jest-dom matchers (toBeInTheDocument, toHaveTextContent, etc.)
// via module augmentation — no manual declarations or jest namespace needed.
import '@testing-library/jest-dom/vitest'
