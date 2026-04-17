import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';

import { uploadFile } from 'src/api/sys/file';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function FileUploadView() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setResultUrl('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile(file);
      setResultUrl(result.url);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = () => {
    if (resultUrl) {
      navigator.clipboard.writeText(resultUrl);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        文件管理
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:import-bold" />}
              onClick={() => inputRef.current?.click()}
            >
              选择文件
            </Button>

            {file && (
              <Typography variant="body2" color="text.secondary">
                {file.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              disabled={!file}
              loading={uploading}
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              onClick={handleUpload}
            >
              上传
            </Button>
          </Box>

          {resultUrl && (
            <TextField
              fullWidth
              label="文件链接"
              value={resultUrl}
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCopy} edge="end">
                        <Iconify icon="solar:copy-bold" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
