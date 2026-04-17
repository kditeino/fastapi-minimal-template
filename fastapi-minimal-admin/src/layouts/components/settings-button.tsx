import type { IconButtonProps } from '@mui/material/IconButton';

import { Icon } from '@iconify/react';

import IconButton from '@mui/material/IconButton';

import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

export function SettingsButton({ sx, ...other }: IconButtonProps) {
  const settings = useSettingsContext();

  const isDark = settings.state.mode === 'dark';

  const handleToggle = () => {
    settings.setField('mode', isDark ? 'light' : 'dark');
  };

  return (
    <IconButton
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={handleToggle}
      sx={[{ width: 40, height: 40 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Icon icon={isDark ? 'solar:sun-bold' : 'solar:moon-bold'} width={22} />
    </IconButton>
  );
}
