import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /heart rpg delve map planner/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<App />);
    const welcomeText = screen.getByText(/welcome to the heart rpg delve map planning tool/i);
    expect(welcomeText).toBeInTheDocument();
  });
});