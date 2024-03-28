import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import { CredentialsForm } from '../CredentialsForm';

function helperLineCount(container: HTMLElement): number {
  return container.querySelectorAll('.MuiFormHelperText-root').length;
}

describe('<CredentialsForm />', () => {
  it('keeps every helper line after a valid field loses focus, so the button does not move', async () => {
    const { container } = renderWithProviders(<CredentialsForm submitLabel="Sign in" onSubmit={vi.fn()} />);
    const before = helperLineCount(container);

    await userEvent.type(screen.getByLabelText('Email address'), 'johndoe@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'blogs-demo-2024');
    await userEvent.tab();

    expect(before).toBe(2);
    expect(helperLineCount(container)).toBe(before);
  });

  it('submits on the first click straight after typing', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(<CredentialsForm submitLabel="Sign in" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Email address'), 'johndoe@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'blogs-demo-2024');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
