import React from 'react';
import { render, screen } from '@testing-library/react';
import App, { AppProps } from './App';
import fundConfig from './config/funds.json';

test('renders learn react link', () => {
  // Provide minimal required props
  const mockSetFunds: AppProps['setFunds'] = () => {};
  
  render(<App funds={fundConfig} setFunds={mockSetFunds} />);
  
  // Update this to some text you expect in your real app (replace "learn react" if not applicable)
  const linkElement = screen.getByText(/mutual fund nav chart dashboard/i);
  expect(linkElement).toBeInTheDocument();
});
