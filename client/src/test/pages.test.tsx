import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import AuthenticatedLayout from '../components/AuthenticatedLayout/AuthenticatedLayout';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import App from '../App';
import { ThemeProvider } from '../hooks/ThemeProvider';
import CareerPaths from '../pages/CareerPaths/CareerPaths';
import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Login/Login';
import Portfolio from '../pages/Portfolio/Portfolio';
import Profile from '../pages/Profile/Profile';
import Progress from '../pages/Progress/Progress';
import Projects from '../pages/Projects/Projects';
import Register from '../pages/Register/Register';
import Roadmap from '../pages/Roadmap/Roadmap';
import Skills from '../pages/Skills/Skills';

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

const skills = [
  { _id: 'skill-1', name: 'React', category: 'Software Development', level: 'Beginner' },
];

const progress = [
  { _id: 'progress-1', skill: skills[0], progress: 40 },
];

const project = {
  _id: 'project-1',
  title: 'Portfolio App',
  description: 'A project',
  technologies: ['React'],
  github: '',
  liveDemo: '',
  imageUrl: '',
};

const career = {
  _id: 'career-1',
  title: 'Frontend Developer',
  description: 'Build user interfaces',
  skills: ['React'],
};

const recommendation = {
  title: 'Frontend Developer',
  description: 'Build user interfaces',
  reasons: ['Matches your skills'],
  matchingSkills: ['React'],
  skillsToLearn: ['TypeScript'],
};

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}

function renderWithRouter(ui: React.ReactNode, initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocationProbe />
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

function renderWithTheme(ui: React.ReactNode, initialEntry = '/') {
  return renderWithRouter(
    <ThemeProvider>{ui}</ThemeProvider>,
    initialEntry
  );
}

function resolveApiDefaults() {
  mockedAxios.get.mockImplementation((url) => {
    if (url.includes('/api/skills')) return Promise.resolve({ data: skills });
    if (url.includes('/api/progress')) return Promise.resolve({ data: progress });
    if (url.includes('/api/profile')) {
      return Promise.resolve({
        data: {
          name: 'Alex Student',
          email: 'alex@example.com',
          university: 'Campus',
          degree: 'Computer Engineering',
          studyYear: 2,
          careerGoal: 'Developer',
        },
      });
    }
    if (url.includes('/api/projects')) return Promise.resolve({ data: [project] });
    if (url.includes('/api/career-paths/selected')) {
      return Promise.resolve({ data: { selectedCareer: career } });
    }
    if (url.includes('/api/career-paths')) return Promise.resolve({ data: [career] });
    return Promise.resolve({ data: [] });
  });
  mockedAxios.post.mockResolvedValue({ data: {} });
  mockedAxios.put.mockResolvedValue({ data: {} });
  mockedAxios.delete.mockResolvedValue({ data: {} });
  mockedAxios.isAxiosError.mockImplementation(
    (error) => Boolean(error && typeof error === 'object' && 'response' in error)
  );
}

beforeEach(() => {
  window.localStorage.setItem('token', 'test-token');
  resolveApiDefaults();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('Progress page', () => {
  test('loads progress, creates an entry, updates it, and deletes it', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({
      data: { _id: 'progress-2', skill: skills[0], progress: 0 },
    });
    mockedAxios.put.mockResolvedValueOnce({ data: { progress: 75 } });

    renderWithRouter(<Progress />);

    expect(await screen.findByRole('heading', { name: 'Learning Progress' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Skill'), 'skill-1');
    await user.click(screen.getByRole('button', { name: '+ Add Progress' }));
    expect(mockedAxios.post).toHaveBeenCalled();

    fireEvent.change(screen.getAllByLabelText('Adjust progress')[0], {
      target: { value: '75' },
    });
    await waitFor(() => expect(mockedAxios.put).toHaveBeenCalled());

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    expect(mockedAxios.delete).toHaveBeenCalled();
  });

  test('shows the API validation message when progress creation fails', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Progress already exists for this skill' } },
    });
    renderWithRouter(<Progress />);
    await screen.findByRole('heading', { name: 'Learning Progress' });
    await user.selectOptions(screen.getByLabelText('Skill'), 'skill-1');
    await user.click(screen.getByRole('button', { name: '+ Add Progress' }));
    expect(window.alert).toHaveBeenCalledWith(
      'Progress already exists for this skill'
    );
  });
});

describe('Skills page', () => {
  test('adds and deletes a skill through the UI', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({ data: { skill: skills[0] } });
    renderWithRouter(<Skills />);
    await screen.findByRole('heading', { name: 'My Skills' });

    await user.selectOptions(screen.getByLabelText('Skill category'), 'Software Development');
    await user.selectOptions(screen.getByLabelText('Skill'), 'React');
    await user.click(screen.getByRole('button', { name: '+ Add Skill' }));
    expect(mockedAxios.post).toHaveBeenCalled();

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/api/skills/skill-1'),
      expect.any(Object)
    );
  });

  test('rejects an add attempt until a category and skill are selected', async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    renderWithRouter(<Skills />);
    await screen.findByRole('heading', { name: 'My Skills' });
    await user.click(screen.getByRole('button', { name: '+ Add Skill' }));
    expect(alert).toHaveBeenCalledWith('Please select a degree, category, and skill.');
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
});

describe('Career paths page', () => {
  test('generates recommendations and navigates after selecting a career', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({ data: { recommendations: [recommendation] } });
    renderWithRouter(<CareerPaths />);
    await screen.findByRole('heading', { name: 'Explore Career Paths' });
    await user.click(screen.getByRole('button', { name: 'Generate recommendations' }));
    expect(screen.getAllByText('Frontend Developer').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: /Choose this career/ }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/roadmap'));
    expect(mockedAxios.put).toHaveBeenCalled();
  });

  test('displays an API error for failed recommendations', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Recommendations unavailable' } },
    });
    renderWithRouter(<CareerPaths />);
    await screen.findByRole('heading', { name: 'Explore Career Paths' });
    await user.click(screen.getByRole('button', { name: 'Generate recommendations' }));
    expect(await screen.findByText('Recommendations unavailable')).toBeInTheDocument();
  });
});

describe('Authenticated layout', () => {
  test('logs out and navigates to login', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Routes>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<p>Dashboard content</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>,
      '/dashboard'
    );
    await user.click(screen.getByRole('button', { name: 'Log out' }));
    expect(window.localStorage.getItem('token')).toBeNull();
    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });
});

describe('Profile page', () => {
  test('loads and saves profile changes', async () => {
    const user = userEvent.setup();
    mockedAxios.put.mockResolvedValueOnce({
      data: { user: { name: 'Updated Student', email: 'alex@example.com' } },
    });
    renderWithRouter(<Profile />);
    expect(await screen.findByRole('heading', { name: 'My Profile' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit Profile' }));
    await user.clear(screen.getByLabelText('Full Name'));
    await user.type(screen.getByLabelText('Full Name'), 'Updated Student');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(mockedAxios.put).toHaveBeenCalled();
  });

  test('shows the profile error state when loading fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('network failure'));
    renderWithRouter(<Profile />);
    expect(await screen.findByText('Could not load your profile. Please try again.')).toBeInTheDocument();
  });
});

describe('Projects page', () => {
  test('loads projects and creates a project', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({ data: { ...project, _id: 'project-2' } });
    renderWithRouter(<Projects />);
    expect(await screen.findByRole('heading', { name: 'My Projects' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Project title *'), 'New Project');
    await user.click(screen.getByRole('button', { name: '+ Add Project' }));
    expect(mockedAxios.post).toHaveBeenCalled();
  });

  test('shows an error when project loading fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('network failure'));
    renderWithRouter(<Projects />);
    expect(await screen.findByRole('heading', { name: 'My Projects' })).toBeInTheDocument();
    expect(screen.queryByText('Portfolio App')).not.toBeInTheDocument();
  });
});

describe('Roadmap page', () => {
  test('loads a selected career and requests learning resources', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        resources: {
          courses: [{ title: 'TypeScript Course', provider: 'Example', url: '', description: 'Learn TS' }],
          books: [], duration: '2 weeks', practicalTask: 'Build a component',
        },
      },
    });
    renderWithRouter(<Roadmap />, '/roadmap');
    expect(await screen.findByRole('heading', { name: 'Frontend Developer Roadmap' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Find Courses & Books' }));
    expect(await screen.findByText('TypeScript Course')).toBeInTheDocument();
    expect(mockedAxios.post).toHaveBeenCalled();
  });
});

describe('Login and registration pages', () => {
  test('validates login email before making an API request', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Login />);
    await user.type(screen.getByLabelText('Email address'), 'invalid-email');
    await user.type(screen.getByLabelText('Password'), 'Password1!');
    fireEvent.submit(screen.getByLabelText('Email address').closest('form')!);
    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  test('shows registration password validation feedback', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Register />);
    await user.type(screen.getByLabelText('Full name'), 'Alex Student');
    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), 'weak');
    fireEvent.submit(screen.getByLabelText('Password').closest('form')!);
    expect(await screen.findByText('Please choose a password that meets all the requirements.')).toBeInTheDocument();
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
});

describe('Dashboard and portfolio pages', () => {
  test('renders dashboard data and navigation actions', async () => {
    renderWithRouter(<Dashboard />);
    expect(await screen.findByRole('heading', { name: /Welcome back, Alex Student/ })).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  test('renders portfolio data from profile, skills, and projects', async () => {
    renderWithRouter(<Portfolio />);
    expect(await screen.findByRole('heading', { name: 'Alex Student' })).toBeInTheDocument();
    expect(screen.getAllByText('React').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Portfolio App').length).toBeGreaterThan(0);
  });
});

describe('Additional page branches', () => {
  test('redirects protected routes without a token and renders them with a token', async () => {
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<p>Private content</p>} />
          </Route>
          <Route path="/login" element={<p>Login route</p>} />
        </Routes>
      </MemoryRouter>
    );
    window.localStorage.removeItem('token');
    cleanup();
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<p>Private content</p>} />
          </Route>
          <Route path="/login" element={<p>Login route</p>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Login route')).toBeInTheDocument();

    window.localStorage.setItem('token', 'protected-token');
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<p>Private content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Private content')).toBeInTheDocument();
  });

  test('renders the application login route', () => {
    window.history.pushState({}, '', '/login');
    render(<ThemeProvider><App /></ThemeProvider>);
    expect(screen.getByRole('heading', { name: 'Continue your journey.' })).toBeInTheDocument();
  });

  test('shows the progress empty state when no skills or progress exist', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    renderWithRouter(<Progress />);
    expect(await screen.findByText('You have no skills yet. Add a skill on the Skills page first.')).toBeInTheDocument();
    expect(screen.getByText('No progress tracked yet')).toBeInTheDocument();
  });

  test('handles progress update and deletion failures', async () => {
    const user = userEvent.setup();
    mockedAxios.put.mockRejectedValueOnce(new Error('update failed'));
    mockedAxios.delete.mockRejectedValueOnce(new Error('delete failed'));
    renderWithRouter(<Progress />);
    await screen.findByRole('heading', { name: 'Learning Progress' });
    fireEvent.change(screen.getAllByLabelText('Adjust progress')[0], { target: { value: '55' } });
    await waitFor(() => expect(mockedAxios.put).toHaveBeenCalled());
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    expect(window.alert).toHaveBeenCalledWith('Failed to delete progress.');
  });

  test('handles skill add, edit, and delete failures', async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    mockedAxios.post.mockRejectedValueOnce(new Error('add failed'));
    renderWithRouter(<Skills />);
    await screen.findByRole('heading', { name: 'My Skills' });
    await user.selectOptions(screen.getByLabelText('Skill category'), 'Software Development');
    await user.selectOptions(screen.getByLabelText('Skill'), 'React');
    await user.click(screen.getByRole('button', { name: '+ Add Skill' }));
    expect(alert).toHaveBeenCalledWith('Failed to add skill. Please try again.');

    mockedAxios.put.mockRejectedValueOnce(new Error('edit failed'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(alert).toHaveBeenCalledWith('Failed to update skill. Please try again.');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    expect(mockedAxios.delete).not.toHaveBeenCalled();
  });

  test('handles skill deletion failure after confirmation', async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    mockedAxios.delete.mockRejectedValueOnce(new Error('delete failed'));
    renderWithRouter(<Skills />);
    await screen.findByRole('heading', { name: 'My Skills' });
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    expect(alert).toHaveBeenCalledWith('Failed to delete skill. Please try again.');
  });

  test('shows the career-path empty state when loading returns no paths', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    renderWithRouter(<CareerPaths />);
    expect(await screen.findByText('No career paths available yet')).toBeInTheDocument();
  });

  test('shows an error when saving a selected career fails', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({ data: { recommendations: [recommendation] } });
    mockedAxios.put.mockRejectedValueOnce(new Error('save failed'));
    renderWithRouter(<CareerPaths />);
    await screen.findByRole('heading', { name: 'Explore Career Paths' });
    await user.click(screen.getByRole('button', { name: 'Generate recommendations' }));
    await user.click(screen.getByRole('button', { name: /Choose this career/ }));
    expect(await screen.findByText('Could not save your career selection. Please try again.')).toBeInTheDocument();
  });

  test('loads the roadmap empty state when no career is selected', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({ data: { selectedCareer: null } });
    renderWithRouter(<Roadmap />, '/roadmap');
    expect(await screen.findByRole('heading', { name: 'No career path selected' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Explore Career Paths' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/career-paths');
  });

  test('shows a roadmap resource error and allows completing a step', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce(new Error('AI unavailable'));
    renderWithRouter(<Roadmap />, '/roadmap');
    await screen.findByRole('heading', { name: 'Frontend Developer Roadmap' });
    await user.click(screen.getByRole('button', { name: 'Find Courses & Books' }));
    expect(await screen.findByText('Could not generate recommendations. Please try again.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mark Complete' }));
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  test('validates a missing login password', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Login />);
    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    fireEvent.submit(screen.getByLabelText('Email address').closest('form')!);
    expect(await screen.findByText('Password is required.')).toBeInTheDocument();
  });

  test('shows a login API error and supports successful navigation', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } });
    renderWithTheme(<Login />);
    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1!');
    fireEvent.submit(screen.getByLabelText('Email address').closest('form')!);
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');

    mockedAxios.post.mockResolvedValueOnce({ data: { token: 'new-token', user: { name: 'Alex' } } });
    fireEvent.submit(screen.getByLabelText('Email address').closest('form')!);
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/dashboard'));
  });

  test('shows registration API errors and success feedback', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce({ response: { data: { message: 'Email already exists' } } });
    renderWithTheme(<Register />);
    await user.type(screen.getByLabelText('Full name'), 'Alex Student');
    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), 'StrongPass1!');
    fireEvent.submit(screen.getByLabelText('Password').closest('form')!);
    expect(await screen.findByRole('alert')).toHaveTextContent('Email already exists');

    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    fireEvent.submit(screen.getByLabelText('Password').closest('form')!);
    expect(await screen.findByText('Your account has been created. You can now sign in.')).toBeInTheDocument();
  });

  test('shows the profile photo validation error and supports cancelling edits', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Profile />);
    await screen.findByRole('heading', { name: 'My Profile' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(['bad'], 'bad.gif', { type: 'image/gif' })] } });
    expect(await screen.findByText('Choose a JPG, PNG, or WebP image.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit Profile' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument();
  });

  test('shows profile save errors', async () => {
    const user = userEvent.setup();
    mockedAxios.put.mockRejectedValueOnce(new Error('save failed'));
    renderWithRouter(<Profile />);
    await screen.findByRole('heading', { name: 'My Profile' });
    await user.click(screen.getByRole('button', { name: 'Edit Profile' }));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByText('Could not save your changes. Please try again.')).toBeInTheDocument();
  });

  test('validates project title and handles edit/delete failures', async () => {
    const user = userEvent.setup();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    renderWithRouter(<Projects />);
    await screen.findByRole('heading', { name: 'My Projects' });
    await user.click(screen.getByRole('button', { name: '+ Add Project' }));
    expect(alert).toHaveBeenCalledWith('Project title is required.');

    mockedAxios.put.mockRejectedValueOnce(new Error('update failed'));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(alert).toHaveBeenCalledWith('Failed to save project.');

    mockedAxios.delete.mockRejectedValueOnce(new Error('delete failed'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(alert).toHaveBeenCalledWith('Failed to delete project.');
  });

  test('handles dashboard loading failure and portfolio loading failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('dashboard failed'));
    renderWithRouter(<Dashboard />);
    expect(await screen.findByText('Welcome back, Student!')).toBeInTheDocument();
    expect(screen.getByText('No learning progress yet. Add skills and track your progress to get started.')).toBeInTheDocument();

    mockedAxios.get.mockRejectedValueOnce(new Error('portfolio failed'));
    renderWithRouter(<Portfolio />);
    expect(await screen.findByText('Could not load your portfolio. Please try again.')).toBeInTheDocument();
  });
});
