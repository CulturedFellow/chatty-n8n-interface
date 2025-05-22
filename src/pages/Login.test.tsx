import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react'; // Import waitFor
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Login from './Login'; // Adjust path as necessary

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion'); // Import actual to get component types if needed

  const mockMotion = (ComponentType) => 
    vi.fn(({ children, initial, animate, transition, variants, exit, ...rest }) => 
      React.createElement(ComponentType, rest, children)
    );

  return {
    ...actual, // Spread actual to keep other exports like AnimatePresence if not explicitly mocked
    motion: {
      div: mockMotion('div'),
      h1: mockMotion('h1'),
      p: mockMotion('p'),
      span: mockMotion('span'), // Added span as it's used in the loading spinner
      button: mockMotion('button'), // If motion.button is used
      // Add any other motion components used in Login.tsx
      // For a more generic approach, one could try to iterate over actual.motion keys
      // but specific mocks are safer.
    },
    // If AnimatePresence is used and needs specific mock behavior:
    AnimatePresence: vi.fn(({ children }) => React.createElement(React.Fragment, null, children)),
  };
});

// Mock useAuth hook
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ // Ensure this mock matches what the component expects
    signIn: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    user: null,
  }),
}));

// Mock useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page - Forgot Password Functionality', () => {
  // For Test 1, fake timers are not strictly necessary but harmless.
  // For Tests 2, 3, 4, we will not use fake timers.
  beforeEach(() => {
    mockNavigate.mockClear();
    if (vi.isMockFunction(Math.random)) {
      Math.random.mockRestore(); 
    }
    // For tests not using fake timers, ensure real timers are used if previously faked.
    // However, it's cleaner to manage fake timers per test or describe block if mixing.
    // For simplicity now, we'll avoid global fake timers for async tests.
    console.log('[Test LOG]: beforeEach setup complete (no global fake timers for async tests)');
  });

  afterEach(() => {
    // Ensure Math.random is restored if spied on
    if (vi.isMockFunction(Math.random)) {
      Math.random.mockRestore();
    }
    console.log('[Test LOG]: afterEach cleanup complete');
  });
  
  it('Test 1: should render the "Forgot Password?" link', () => {
    console.log('[Test 1 LOG]: Start');
    render(<Login />);
    expect(screen.getByText(/Forgot Password\?/i)).toBeInTheDocument();
    console.log('[Test 1 LOG]: End');
  });

  it('Test 2: should display loading indicator, then hide it after timeout', async () => {
    console.log('[Test 2 LOG]: Start');
    render(<Login />);
    const forgotPasswordLink = screen.getByText(/Forgot Password\?/i);
    
    console.log('[Test 2 LOG]: Clicking link');
    await userEvent.click(forgotPasswordLink);
    
    console.log('[Test 2 LOG]: Expecting "Sending..."');
    // With real timers, findByText will wait for its default timeout (or the specified one)
    await screen.findByText(/Sending\.\.\./i, {}, { timeout: 500 }); // Should appear quickly
    console.log('[Test 2 LOG]: "Sending..." found');

    console.log('[Test 2 LOG]: Waiting for timeout to complete (approx 2s) and UI to update');
    // Wait for the final state: loading text gone, and success/error message appears
    await waitFor(() => {
      const loadingText = screen.queryByText(/Sending\.\.\./i);
      const successText = screen.queryByText(/Password reset email sent successfully!/i);
      const errorText = screen.queryByText(/Failed to send password reset email/i);
      expect(loadingText === null && (successText !== null || errorText !== null)).toBe(true);
    }, { timeout: 3000 }); // Timeout for waitFor should be > 2000ms for the setTimeout
    console.log('[Test 2 LOG]: End');
  });

  it('Test 3: should display success message on successful password reset', async () => {
    console.log('[Test 3 LOG]: Start');
    const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.6); // Force success

    render(<Login />);
    const forgotPasswordLink = screen.getByText(/Forgot Password\?/i);

    console.log('[Test 3 LOG]: Clicking link');
    await userEvent.click(forgotPasswordLink);
    
    console.log('[Test 3 LOG]: Expecting "Sending..." briefly');
    await screen.findByText(/Sending\.\.\./i, {}, { timeout: 500 }); 

    console.log('[Test 3 LOG]: Waiting for success message');
    await waitFor(() => {
      expect(screen.getByText(/Password reset email sent successfully! Please check your inbox./i)).toBeInTheDocument();
    }, { timeout: 3000 }); // Timeout for waitFor should be > 2000ms
    console.log('[Test 3 LOG]: Success message found');
    expect(screen.queryByText(/Failed to send password reset email. Please try again./i)).not.toBeInTheDocument();
    console.log('[Test 3 LOG]: Error message NOT found');

    // mathRandomSpy.mockRestore(); // Already handled in afterEach
    console.log('[Test 3 LOG]: End');
  });

  it('Test 4: should display error message on failed password reset', async () => {
    console.log('[Test 4 LOG]: Start');
    const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.3); // Force failure

    render(<Login />);
    const forgotPasswordLink = screen.getByText(/Forgot Password\?/i);

    console.log('[Test 4 LOG]: Clicking link');
    await userEvent.click(forgotPasswordLink);

    console.log('[Test 4 LOG]: Expecting "Sending..." briefly');
    await screen.findByText(/Sending\.\.\./i, {}, { timeout: 500 });

    console.log('[Test 4 LOG]: Waiting for error message');
    await waitFor(() => {
      expect(screen.getByText(/Failed to send password reset email. Please try again./i)).toBeInTheDocument();
    }, { timeout: 3000 }); // Timeout for waitFor should be > 2000ms
    console.log('[Test 4 LOG]: Error message found');
    expect(screen.queryByText(/Password reset email sent successfully! Please check your inbox./i)).not.toBeInTheDocument();
    console.log('[Test 4 LOG]: Success message NOT found');
    
    // mathRandomSpy.mockRestore(); // Already handled in afterEach
    console.log('[Test 4 LOG]: End');
  });
});
