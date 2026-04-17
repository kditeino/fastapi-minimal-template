import request from 'src/api/request';

export interface PluginInfo {
  plugin: {
    name: string;
    version: string;
    summary?: string;
    description?: string;
    author?: string;
    tags?: string[];
    database?: string[];
    enable: string; // '0' | '1'
  };
  app?: Record<string, any>;
  api?: Record<string, any>;
}

export async function getPlugins(): Promise<PluginInfo[]> {
  return request.get('/sys/plugins');
}

export async function getPlugin(plugin: string): Promise<Blob> {
  return request.get(`/sys/plugins/${plugin}`, { responseType: 'blob' });
}

export async function pluginChanged(): Promise<boolean> {
  return request.get('/sys/plugins/changed');
}

export async function installPlugin(params: {
  type: string;
  file?: File;
  repo_url?: string;
}): Promise<void> {
  const formData = new FormData();
  if (params.file) {
    formData.append('file', params.file);
  }
  return request.post('/sys/plugins', formData, {
    params: { type: params.type, repo_url: params.repo_url },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function uninstallPlugin(plugin: string): Promise<void> {
  return request.delete(`/sys/plugins/${plugin}`);
}

export async function updatePluginStatus(plugin: string): Promise<void> {
  return request.put(`/sys/plugins/${plugin}/status`);
}
