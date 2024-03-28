import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import { Layout } from '../Layout';
import { useDocumentTitle } from '../useDocumentTitle';

function TitledPage() {
  useDocumentTitle('Sign in');
  return <Layout>content</Layout>;
}

describe('<Layout />', () => {
  it('offers a skip link that targets the main landmark', () => {
    renderWithProviders(<Layout>content</Layout>);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });

  it('labels the account navigation', () => {
    renderWithProviders(<Layout>content</Layout>);
    expect(screen.getByRole('navigation', { name: 'Account' })).toBeInTheDocument();
  });

  it('names the browser tab after the page', () => {
    renderWithProviders(<TitledPage />);
    expect(document.title).toBe('Sign in · Blogs');
  });
});
