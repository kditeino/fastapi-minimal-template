import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export type FooterProps = BoxProps;

export function Footer({ sx, ...other }: FooterProps) {
  return <Box component="footer" sx={sx} {...other} />;
}

export function HomeFooter({ sx, ...other }: FooterProps) {
  return <Box component="footer" sx={sx} {...other} />;
}
