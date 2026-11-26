import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ThemeProvider } from '../hooks/ThemeProvider';
import { useTheme } from '../hooks/useTheme';
import Dashboard from '../pages/Dashboard/Dashboard';
import Profile from '../pages/Profile/Profile';
import Roadmap from '../pages/Roadmap/Roadmap';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    isAxiosError: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

beforeEach(() => {
  mockedAxios.get.mockReset();
  mockedAxios.post.mockReset();
  mockedAxios.put.mockReset();
  mockedAxios.delete.mockReset();
  mockedAxios.isAxiosError.mockReset();
});

const profile = {
  name: 'Alex Student',
  email: 'alex@example.com',
  university: 'Campus',
  degree: 'Computer Engineering',
  studyYear: 2,
  careerGoal: 'Developer',
  github: '',
  linkedin: '',
  profilePhoto: '',
};

const careerPath = {
  title: 'Frontend Developer',
  description: 'Build user interfaces',
  skills: ['React', 'TypeScript'],
};

type RoadmapCareer = {
  title: string;
  description?: string;
  skills: string[];
};

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}

function renderRoadmap(state: RoadmapCareer | null = careerPath) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/roadmap', state }]}>
      <LocationProbe />
      <Routes>
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/career-paths" element={<p>Career paths</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <LocationProbe />
      <Routes>
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </MemoryRouter>,
  );
}

function ThemeProbe() {
  const { theme } = useTheme();
  return <p>Current theme: {theme}</p>;
}

describe('Profile interaction branches', () => {
  beforeEach(() => {
    window.localStorage.setItem('token', 'test-token');
    mockedAxios.get.mockResolvedValue({ data: profile });
    mockedAxios.put.mockResolvedValue({ data: { user: profile } });
    mockedAxios.post.mockResolvedValue({ data: { profilePhoto: 'https://example.test/profile.png' } });
  });

  test('canceling profile edits restores the loaded values', async () => {
    const user = userEvent.setup();
    render(<Profile />);
    await screen.findByRole('heading', { name: 'My Profile' });

    await user.click(screen.getByRole('button', { name: 'Edit Profile' }));
    await user.clear(screen.getByLabelText('Full Name'));
    await user.type(screen.getByLabelText('Full Name'), 'Changed Name');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByRole('heading', { name: 'Alex Student' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Edit Information' })).not.toBeInTheDocument();
    expect(mockedAxios.put).not.toHaveBeenCalled();
  });

  test('keeps the edit form available and reports a failed profile save', async () => {
    const user = userEvent.setup();
    mockedAxios.put.mockRejectedValueOnce(new Error('save failed'));
    render(<Profile />);
    await screen.findByRole('heading', { name: 'My Profile' });
    await user.click(screen.getByRole('button', { name: 'Edit Profile' }));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not save your changes. Please try again.',
    );
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
  });

  test('rejects unsupported and oversized profile photos before making a request', async () => {
    const { container } = render(<Profile />);
    await screen.findByRole('heading', { name: 'My Profile' });
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    fireEvent.change(input!, {
      target: { files: [new File(['data'], 'portrait.gif', { type: 'image/gif' })] },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Choose a JPG, PNG, or WebP image.',
    );

    const largeFile = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      'large.png',
      { type: 'image/png' },
    );
    fireEvent.change(input!, { target: { files: [largeFile] } });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Image must be 5 MB or smaller.',
    );
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  test('uploads a valid photo, updates the avatar, and persists the profile', async () => {
    const { container } = render(<Profile />);
    await screen.findByRole('heading', { name: 'My Profile' });
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;

    fireEvent.change(input, {
      target: { files: [new File(['image'], 'portrait.png', { type: 'image/png' })] },
    });

    const avatar = await screen.findByRole('img', { name: 'Profile' });
    expect(avatar).toHaveAttribute('src', 'https://example.test/profile.png');
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/profile/photo'),
      expect.any(FormData),
      expect.objectContaining({ headers: expect.any(Object) }),
    );
    expect(JSON.parse(window.localStorage.getItem('user')!)).toMatchObject({
      name: profile.name,
      profilePhoto: 'https://example.test/profile.png',
    });
  });

  test('shows a retryable message when the photo upload request fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('upload failed'));
    const { container } = render(<Profile />);
    await screen.findByRole('heading', { name: 'My Profile' });
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;

    fireEvent.change(input, {
      target: { files: [new File(['image'], 'portrait.webp', { type: 'image/webp' })] },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not upload your photo. Please try again.',
    );
    expect(screen.getByRole('button', { name: 'Change Photo' })).toBeEnabled();
  });
});

describe('Roadmap conditional rendering and resource errors', () => {
  beforeEach(() => {
    window.localStorage.setItem('token', 'test-token');
    mockedAxios.get.mockResolvedValue({ data: { selectedCareer: null } });
    mockedAxios.post.mockResolvedValue({ data: { resources: { courses: [], books: [], duration: '1 week', practicalTask: 'Practise' } } });
  });

  test('loads saved progress, toggles a milestone, and persists the updated percentage', async () => {
    window.localStorage.setItem('roadmap-Frontend Developer', JSON.stringify(['React']));
    const user = userEvent.setup();
    renderRoadmap();

    expect(await screen.findByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('1 of 2 steps completed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mark Complete' }));

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('All steps completed!')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('roadmap-Frontend Developer')!)).toEqual([
      'React',
      'TypeScript',
    ]);
  });

  test('ignores malformed saved progress and renders career paths with no skills', async () => {
    window.localStorage.setItem('roadmap-Frontend Developer', '{bad json');
    renderRoadmap({ title: 'Empty Roadmap', skills: [] });

    expect(await screen.findByRole('heading', { name: 'Empty Roadmap Roadmap' })).toBeInTheDocument();
    expect(screen.getByText('No learning steps yet')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  test('shows the empty career state after the selected-career request fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('load failed'));
    renderRoadmap(null);

    expect(await screen.findByRole('heading', { name: 'No career path selected' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Explore Career Paths' }));
    expect(screen.getByText('Career paths')).toBeInTheDocument();
  });

  test('reports resource generation failure and retries when the step is reopened', async () => {
    const user = userEvent.setup();
    mockedAxios.post
      .mockRejectedValueOnce(new Error('provider failed'))
      .mockResolvedValueOnce({
        data: {
          resources: {
            courses: [],
            books: [{ title: 'Reference book', provider: 'Press', url: 'https://example.test/book', description: 'Reference' }],
            duration: '2 weeks',
            practicalTask: 'Build a component',
          },
        },
      });
    renderRoadmap();

    await screen.findByRole('heading', { name: 'Frontend Developer Roadmap' });
    await user.click(screen.getAllByRole('button', { name: 'Find Courses & Books' })[0]);
    expect(await screen.findByText('Could not generate recommendations. Please try again.')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Hide Resources' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'Find Courses & Books' })[0]);

    expect(await screen.findByText('No courses were recommended.')).toBeInTheDocument();
    expect(screen.getByText('Reference book')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View book' })).toHaveAttribute(
      'href',
      'https://example.test/book',
    );
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });
});

describe('Dashboard summary and navigation', () => {
  beforeEach(() => {
    window.localStorage.setItem('token', 'test-token');
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
  });

  test('shows fallback labels and accurately summarizes completed and partial progress', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/profile')) return Promise.resolve({ data: { name: '' } });
      return Promise.resolve({
        data: [
          { _id: 'finished', progress: 100, skill: null },
          { _id: 'in-progress', progress: 20, skill: { name: 'React' } },
        ],
      });
    });
    renderDashboard();

    expect(await screen.findByRole('heading', { name: 'Welcome back, Student!' })).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Skill')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    const completedCard = screen.getByText('Completed Skills').closest('article');
    expect(within(completedCard!).getByText('1')).toBeInTheDocument();
  });

  test('shows an empty progress state when dashboard data cannot be loaded', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('network unavailable'));
    renderDashboard();

    expect(await screen.findByRole('heading', { name: 'Welcome back, Student!' })).toBeInTheDocument();
    expect(screen.getByText('No learning progress yet. Add skills and track your progress to get started.')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  test('navigates from dashboard actions to their corresponding pages', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByRole('heading', { name: 'Dashboard' });

    await user.click(screen.getAllByRole('button', { name: 'Manage Skills' })[0]);
    expect(screen.getByTestId('location')).toHaveTextContent('/skills');
    await user.click(screen.getByRole('button', { name: 'View All' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/progress');
    await user.click(screen.getByRole('button', { name: 'Explore Careers' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/career-paths');
    await user.click(screen.getByRole('button', { name: 'My Projects' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/projects');
    await user.click(screen.getByRole('button', { name: 'View Portfolio' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/portfolio');
  });
});

describe('Theme provider persistence and system preference', () => {
  beforeEach(() => {
    window.localStorage.removeItem('theme');
  });

  test('uses a stored theme and updates the document theme color when toggled', async () => {
    const user = userEvent.setup();
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);
    window.localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <ThemeProbe />
        <ThemeToggle showLabel />
      </ThemeProvider>,
    );

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(meta).toHaveAttribute('content', '#242238');
    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(screen.getByText('Current theme: light')).toBeInTheDocument();
    expect(window.localStorage.getItem('theme')).toBe('light');
    expect(meta).toHaveAttribute('content', '#efeaff');
    meta.remove();
  });

  test('follows system theme changes until the user chooses a theme', async () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | undefined;
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      addEventListener: vi.fn((_event, handler) => {
        changeHandler = handler as (event: MediaQueryListEvent) => void;
      }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeProbe />
        <ThemeToggle showLabel />
      </ThemeProvider>,
    );

    expect(screen.getByText('Current theme: light')).toBeInTheDocument();
    act(() => changeHandler?.({ matches: true } as MediaQueryListEvent));
    expect(await screen.findByText('Current theme: dark')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    await waitFor(() => expect(screen.getByText('Current theme: light')).toBeInTheDocument());
    expect(window.matchMedia('(prefers-color-scheme: dark)').removeEventListener).toHaveBeenCalledWith(
      'change',
      changeHandler,
    );
  });

  test('continues using an in-memory theme when local storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeProbe />
        <ThemeToggle showLabel />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByText('Current theme: dark')).toBeInTheDocument();
  });
});
