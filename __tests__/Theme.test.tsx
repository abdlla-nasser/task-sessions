import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a simple component to test theme functionality
const ThemeTest = () => {
  return (
    <div data-testid="theme-container" className="bg-gray-100 dark:bg-gray-900">
      <h1>Theme Test</h1>
    </div>
  );
};

describe('Theme Component', () => {
  it('renders with default theme classes', () => {
    render(<ThemeTest />);
    const container = screen.getByTestId('theme-container');
    expect(container).toHaveClass('bg-gray-100');
  });
});