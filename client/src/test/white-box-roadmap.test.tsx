import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import Roadmap from '../pages/Roadmap/Roadmap';

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

const careerPath = {
  title: 'Frontend Developer',
  description: 'Build user interfaces',
  skills: ['React', 'TypeScript'],
};

function renderRoadmap() {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/roadmap', state: careerPath }]}
    >
      <Routes>
        <Route path="/roadmap" element={<Roadmap />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockedAxios.get.mockReset();
  mockedAxios.post.mockReset();
});

describe('Roadmap white-box progress paths', () => {
  test('starts with no completed steps when no progress is saved', async () => {
    renderRoadmap();

    expect(await screen.findByText('0 of 2 steps completed')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });

  test('filters non-string values from saved completion data', async () => {
    window.localStorage.setItem(
      'roadmap-Frontend Developer',
      JSON.stringify(['React', 42, null, 'TypeScript']),
    );

    renderRoadmap();

    expect(await screen.findByText('2 of 2 steps completed')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });

  test('returns empty progress when saved JSON is not an array', async () => {
    window.localStorage.setItem(
      'roadmap-Frontend Developer',
      JSON.stringify({ completed: ['React'] }),
    );

    renderRoadmap();

    expect(await screen.findByText('0 of 2 steps completed')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });

  test('returns empty progress when the saved JSON cannot be parsed', async () => {
    window.localStorage.setItem(
      'roadmap-Frontend Developer',
      '{invalid json',
    );

    renderRoadmap();

    expect(await screen.findByText('0 of 2 steps completed')).toBeInTheDocument();
  });

  test('returns empty progress when local storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage access denied');
    });

    renderRoadmap();

    expect(await screen.findByText('0 of 2 steps completed')).toBeInTheDocument();
  });

  test('undoes a completed step and persists its removal', async () => {
    window.localStorage.setItem(
      'roadmap-Frontend Developer',
      JSON.stringify(['React']),
    );
    const user = userEvent.setup();

    renderRoadmap();

    expect(await screen.findByText('1 of 2 steps completed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(screen.getByText('0 of 2 steps completed')).toBeInTheDocument();
    await waitFor(() => {
      expect(
        JSON.parse(
          window.localStorage.getItem('roadmap-Frontend Developer')!,
        ),
      ).toEqual([]);
    });
  });
});
