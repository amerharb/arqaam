import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders 11 buttons', () => {
  render(<App />);
  for (let i = 0; i <= 10; i++) {
    const button = screen.getByText(i);
    expect(button).toBeInTheDocument();
  }
});
