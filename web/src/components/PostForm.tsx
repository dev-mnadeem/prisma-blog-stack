import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import { apiErrorMessage } from '../api/client';
import { PostDraft } from '../types/post';

const MIN_TITLE = 3;
const MIN_CONTENT = 10;

const schema = Yup.object({
  title: Yup.string()
    .trim()
    .min(MIN_TITLE, `Give it at least ${MIN_TITLE} characters`)
    .required('Title is required'),
  content: Yup.string()
    .trim()
    .min(MIN_CONTENT, `Write at least ${MIN_CONTENT} characters`)
    .required('Content is required'),
});

interface PostFormProps {
  initialValues?: PostDraft;
  submitLabel: string;
  onSubmit: (draft: PostDraft) => Promise<void>;
  onCancel: () => void;
}

export function PostForm({ initialValues, submitLabel, onSubmit, onCancel }: PostFormProps): JSX.Element {
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<PostDraft>({
    initialValues: initialValues ?? { title: '', content: '' },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      setError(null);
      try {
        await onSubmit({ title: values.title.trim(), content: values.content.trim() });
      } catch (submitError) {
        setError(apiErrorMessage(submitError, 'Could not save the post'));
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Stack spacing={3}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          fullWidth
          id="title"
          name="title"
          label="Title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title ? formik.errors.title : ' '}
        />
        <TextField
          fullWidth
          multiline
          minRows={12}
          id="content"
          name="content"
          label="Content"
          value={formik.values.content}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.content && Boolean(formik.errors.content)}
          helperText={formik.touched.content ? formik.errors.content : 'Blank lines start a new paragraph.'}
        />
        <Stack direction="row" spacing={2}>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Saving…' : submitLabel}
          </Button>
          <Button type="button" variant="text" color="inherit" onClick={onCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
