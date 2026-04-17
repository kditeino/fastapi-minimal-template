import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export type FbaSignInSchemaType = z.infer<typeof FbaSignInSchema>;

export const FbaSignInSchema = z.object({
  username: z.string().min(1, { message: 'Username is required!' }),
  password: z
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
  captcha: z.string().optional(),
});

// ----------------------------------------------------------------------

export function FbaSignInView() {
  const router = useRouter();
  const showPassword = useBoolean();
  const captchaLoading = useBoolean();

  const { signIn, getCaptcha } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captchaUuid, setCaptchaUuid] = useState<string>('');
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [captchaEnabled, setCaptchaEnabled] = useState(false);

  const methods = useForm<FbaSignInSchemaType>({
    resolver: zodResolver(FbaSignInSchema),
    defaultValues: {
      username: '',
      password: '',
      captcha: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const loadCaptcha = useCallback(async () => {
    captchaLoading.onTrue();
    try {
      const data = await getCaptcha();
      setCaptchaEnabled(data.is_enabled);
      if (data.is_enabled) {
        setCaptchaUuid(data.uuid);
        setCaptchaImage(
          data.image.startsWith('data:') ? data.image : `data:image/jpeg;base64,${data.image}`
        );
      }
    } catch {
      // Captcha load failure is non-fatal
    } finally {
      captchaLoading.onFalse();
    }
  }, [getCaptcha, captchaLoading]);

  useEffect(() => {
    loadCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signIn({
        username: data.username,
        password: data.password,
        uuid: captchaEnabled ? captchaUuid : undefined,
        captcha: captchaEnabled ? data.captcha : undefined,
      });

      router.push(paths.dashboard.root);
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
      if (captchaEnabled) {
        loadCaptcha();
      }
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="username"
        label="Username"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text
        name="password"
        label="Password"
        placeholder="6+ characters"
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify
                    icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {captchaEnabled && (
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Field.Text
            name="captcha"
            label="Captcha"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: 1 }}
          />

          <Tooltip title="Refresh captcha">
            <Box
              component="button"
              type="button"
              onClick={loadCaptcha}
              sx={{
                p: 0,
                border: 0,
                cursor: 'pointer',
                borderRadius: 1,
                overflow: 'hidden',
                flexShrink: 0,
                height: 56,
                width: 120,
                bgcolor: 'background.neutral',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {captchaLoading.value ? (
                <CircularProgress size={20} />
              ) : (
                <Box
                  component="img"
                  src={captchaImage}
                  alt="captcha"
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </Box>
          </Tooltip>
        </Box>
      )}

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Sign in..."
      >
        Sign in
      </Button>
    </Box>
  );

  const renderOAuth = () => (
    <>
      <Divider sx={{ my: 3, typography: 'overline', color: 'text.disabled' }}>
        Or continue with
      </Divider>

      <Box sx={{ gap: 1.5, display: 'flex' }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          href={`${import.meta.env.VITE_API_BASE_URL}/oauth2/github`}
          startIcon={<Iconify icon="socials:github" />}
        >
          GitHub
        </Button>

        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          href={`${import.meta.env.VITE_API_BASE_URL}/oauth2/google`}
          startIcon={<Iconify icon="socials:google" />}
        >
          Google
        </Button>
      </Box>
    </>
  );

  return (
    <>
      <FormHead
        title="Sign in to your account"
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      {renderOAuth()}
    </>
  );
}
