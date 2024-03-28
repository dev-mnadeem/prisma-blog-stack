const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', DATE_FORMAT).format(new Date(iso));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
