import axios, { AxiosError } from 'axios';
import type { URLScanResponse, MessageScanResponse } from '../types/api';



// Create a single Axios instance for all API calls
const api = axios.create({
  baseURL: '',
  timeout: 30000,
});

// Request interceptor: Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ts_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function analyseURL(url: string): Promise<URLScanResponse> {
  try {
    const response = await api.post<URLScanResponse>('/api/v1/cyber/url-scans', { url });
    return response.data;
  } catch (error) {
    throw extractError(error, 'URL analysis failed');
  }
}

export async function analyseMessage(message: string): Promise<MessageScanResponse> {
  try {
    const response = await api.post<MessageScanResponse>('/api/v1/cyber/message-scans', { message });
    return response.data;
  } catch (error) {
    throw extractError(error, 'Message analysis failed');
  }
}

export async function getIncidentGuidance(
  indicatorCodes: string[],
  context: 'URL' | 'MESSAGE'
): Promise<any> {
  try {
    const response = await api.post('/api/v1/cyber/incident-guidance', {
      indicator_codes: indicatorCodes,
      context: context,
    });
    return response.data;
  } catch (error) {
    throw extractError(error, 'Incident guidance failed');
  }
}

export async function generateReport(scanType: 'url' | 'message', scanData: any): Promise<any> {
  try {
    const response = await api.post('/api/v1/cyber/generate-report', {
      scan_type: scanType,
      scan_data: scanData,
    });
    return response.data;
  } catch (error) {
    throw extractError(error, 'Report generation failed');
  }
}

export async function scanDeepfakeVideo(file: File): Promise<any> {
  try {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post('/api/v1/media/deepfake-scan', form, {
      timeout: 120000, // 2 mins for video processing
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw extractError(error, 'Deepfake scan failed');
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    await api.get('/api/v1/health', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export async function getHealthDetail(): Promise<any> {
  const r = await api.get('/api/v1/health', { timeout: 5000 });
  return r.data;
}

function extractError(error: unknown, fallback: string): Error {
  if (error instanceof AxiosError) {
    if (error.response) {
      const detail = error.response.data?.detail || error.response.data?.error;
      if (detail) {
        if (Array.isArray(detail)) {
          const messages = detail.map((d: { msg: string }) => d.msg).join('; ');
          return new Error('Validation error: ' + messages);
        }
        return new Error(String(detail));
      }
      return new Error('Server error (' + error.response.status + '): ' + error.response.statusText);
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new Error('Request timed out. Please try again.');
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      return new Error('Cannot reach the backend server.');
    }
  }
  return new Error(fallback);
}