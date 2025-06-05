import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

// The store relies on IndexedDB, which is provided by fake-indexeddb in setup
// file. This test ensures the initial passphrase prompt renders correctly.
describe('App', () => {
  it('renders passphrase prompt', () => {
    render(<App />);
    expect(screen.getByText(/enter passphrase/i)).toBeInTheDocument();
  });
});
