import { useEffect } from 'react';

const SITE_NAME = 'Blogs';

/** Screen-reader users hear the tab title on every route change, so each page names itself. */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
