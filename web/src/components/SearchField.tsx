import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';

interface SearchFieldProps {
  value: string;
  onSearch: (term: string) => void;
}

export function SearchField({ value, onSearch }: SearchFieldProps): JSX.Element {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    onSearch(draft.trim());
  };

  return (
    <form onSubmit={submit} role="search">
      <TextField
        fullWidth
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search posts"
        label="Search posts"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
    </form>
  );
}
