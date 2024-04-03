import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import { PostForm } from '../PostForm';

describe('<PostForm />', () => {
  it('blocks submission and names the missing fields', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<PostForm submitLabel="Publish" onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Content is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a body that is too short to be a post', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<PostForm submitLabel="Publish" onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Title'), 'A title');
    await userEvent.type(screen.getByLabelText('Content'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));

    expect(await screen.findByText('Write at least 10 characters')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a trimmed draft once both fields are valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(<PostForm submitLabel="Publish" onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Title'), '  Indexes matter  ');
    await userEvent.type(screen.getByLabelText('Content'), '  A body long enough to pass.  ');
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Indexes matter',
        content: 'A body long enough to pass.',
      })
    );
  });

  it('shows the message the API sent when saving fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('offline'));
    renderWithProviders(<PostForm submitLabel="Publish" onSubmit={onSubmit} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Title'), 'A title');
    await userEvent.type(screen.getByLabelText('Content'), 'A body long enough to pass.');
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));

    expect(await screen.findByText('Could not save the post')).toBeInTheDocument();
  });
});
