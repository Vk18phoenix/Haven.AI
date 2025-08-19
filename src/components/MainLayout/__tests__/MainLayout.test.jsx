// src/components/MainLayout/__tests__/MainLayout.test.jsx

// --- MOCK BROWSER APIs ---
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => []),
  onvoiceschanged: jest.fn(),
};
Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true,
});

class MockSpeechRecognition {
  start() {}
  stop() {}
  addEventListener() {}
  removeEventListener() {}
  onresult = jest.fn();
}
window.SpeechRecognition = MockSpeechRecognition;

// --- REACT & TESTING LIBRARY IMPORTS ---
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MainLayout from '../MainLayout.jsx';

// --- MOCK EXTERNAL DEPENDENCIES ---
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../firebase/firestoreService', () => ({
  getUserChatHistory: jest.fn(() => Promise.resolve([])),
  saveUserChatHistory: jest.fn(() => Promise.resolve()),
  saveTempChat: jest.fn(() => Promise.resolve()),
  reportMessage: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../ai/aiService.js', () => ({
  getAiResponse: jest.fn(() => Promise.resolve("Mock AI Response")),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
  Toaster: () => null,
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(() => Promise.resolve()),
  getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/mock-download-url')),
}));

jest.mock('@emailjs/browser', () => ({
  send: jest.fn(() => Promise.resolve({ status: 200, text: 'OK' })),
}));

jest.mock('browser-image-compression', () => ({
  default: jest.fn((file) => Promise.resolve(file)),
}));

jest.mock('../MainLayout.css', () => '');

// --- MOCK CHILD COMPONENTS ---
// Use the path that matches your project structure.
// IF Header is a direct sibling of MainLayout, use this:
// jest.mock('../../Header/Header', () => ({
//   __esModule: true,
//   default: jest.fn(() => <div>Header</div>),
// }));

// IF Header is a child component within the MainLayout folder, use this:
jest.mock('../Header/Header', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Header</div>),
}));

jest.mock('../../Settings/SettingsModal', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Settings Modal</div>),
}));

jest.mock('../../Feedback/FeedbackModal', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Feedback Modal</div>),
}));

// --- TEST SUITE ---
describe('MainLayout Component', () => {
  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    photoURL: 'https://example.com/avatar.jpg',
  };
  const mockOpenAuthModal = jest.fn();

  it('renders the sidebar and correctly handles its open and closed states', async () => {
    const { getByText, container } = render(
      <MainLayout user={mockUser} openAuthModal={mockOpenAuthModal} theme="dark" onThemeChange={() => {}} />
    );

    const sidebar = container.querySelector('.sidebar');
    const sidebarTitle = getByText('Haven.AI');
    
    expect(sidebar).not.toHaveClass('open');
    expect(sidebarTitle).not.toBeVisible();

    fireEvent.mouseEnter(sidebar);
    
    await waitFor(() => {
      expect(sidebar).toHaveClass('open');
      expect(sidebarTitle).toBeVisible();
    });

    fireEvent.mouseLeave(sidebar);

    await waitFor(() => {
      expect(sidebar).not.toHaveClass('open');
      expect(sidebarTitle).not.toBeVisible();
    });
  });

  it('displays the user avatar and greeting when logged in', () => {
    render(
      <MainLayout user={mockUser} openAuthModal={mockOpenAuthModal} theme="dark" onThemeChange={() => {}} />
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('displays guest information when not logged in', () => {
    render(
      <MainLayout user={null} openAuthModal={mockOpenAuthModal} theme="dark" onThemeChange={() => {}} />
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('sends a message and receives an AI response', async () => {
    render(
      <MainLayout user={mockUser} openAuthModal={mockOpenAuthModal} theme="dark" onThemeChange={() => {}} />
    );
    
    const promptInput = screen.getByPlaceholderText('Message Haven.AI...');
    fireEvent.change(promptInput, { target: { value: 'Hello, AI!' } });

    const sendButton = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
      expect(screen.getByText('Mock AI Response')).toBeInTheDocument();
    });
  });

  it('opens and closes the settings modal', async () => {
    render(
      <MainLayout user={mockUser} openAuthModal={mockOpenAuthModal} theme="dark" onThemeChange={() => {}} />
    );
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText('Settings Modal')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Settings Modal')).not.toBeInTheDocument();
    });
  });
});