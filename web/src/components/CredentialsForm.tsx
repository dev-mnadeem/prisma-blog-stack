import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import { apiErrorMessage } from '../api/client';

const MIN_PASSWORD = 8;

export interface CredentialsFormValues {
  name?: string;
  email: string;
  password: string;
}

interface CredentialsFormProps {
  withName?: boolean;
  submitLabel: string;
  onSubmit: (values: CredentialsFormValues) => Promise<void>;
}

export function CredentialsForm({
  withName = false,
  submitLabel,
  onSubmit,
}: CredentialsFormProps): JSX.Element {
  const [error, setError] = useState<string | null>(null);

  const schema = Yup.object({
    ...(withName
      ? { name: Yup.string().trim().min(3, 'Use at least 3 characters').required('Name is required') }
      : {}),
    email: Yup.string().trim().email('Please enter a valid email').required('Email is required'),
    password: withName
      ? Yup.string()
          .min(MIN_PASSWORD, `Use at least ${MIN_PASSWORD} characters`)
          .required('Password is required')
      : Yup.string().required('Password is required'),
  });

  const formik = useFormik<CredentialsFormValues>({
    initialValues: { ...(withName ? { name: '' } : {}), email: '', password: '' },
    validationSchema: schema,
    onSubmit: async (values) => {
      setError(null);
      try {
        await onSubmit(values);
      } catch (submitError) {
        setError(apiErrorMessage(submitError, 'Could not sign you in'));
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {withName ? (
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Full name"
            autoComplete="name"
            value={formik.values.name ?? ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name ? formik.errors.name : ' '}
          />
        ) : null}
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email ? formik.errors.email : ' '}
        />
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete={withName ? 'new-password' : 'current-password'}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password ? formik.errors.password : ' '}
        />
        <Button type="submit" variant="contained" size="large" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? 'Working…' : submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}
