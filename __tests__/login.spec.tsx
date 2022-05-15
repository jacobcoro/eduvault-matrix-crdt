import { render, screen } from '@testing-library/react';
import Login from '../src/pages/login';
import '@testing-library/jest-dom';

describe('login', () => {
  it('renders login', () => {
    render(<Login />);
    const text = screen.getByText('Login');
    expect(text).toBeInTheDocument();
  });
});
