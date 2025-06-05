/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

// The store relies on IndexedDB, which is provided by fake-indexeddb in setup
// file. This test ensures the initial passphrase prompt renders correctly.
describe('App', () => {
  it('renders passphrase prompt', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /passphrase/i });
    expect(heading).toBeInTheDocument();
  });
});
