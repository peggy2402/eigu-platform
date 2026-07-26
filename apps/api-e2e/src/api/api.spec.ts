import axios from 'axios';

const TEST_USER_ID = 'e2e-test-user';
let authToken: string;
let projectId: string;
let sceneId: string;
let characterId: string;
let assetId: string;

async function loginAsTestUser() {
  const res = await axios.post('/auth/login', {
    email: 'e2e@test.com',
    password: 'Test1234!',
  }).catch(() => null);

  if (res && res.data?.accessToken) {
    authToken = res.data.accessToken;
    return;
  }

  const reg = await axios.post('/auth/register', {
    email: 'e2e@test.com',
    password: 'Test1234!',
    name: 'E2E Tester',
  }).catch(() => null);

  if (reg && reg.data?.accessToken) {
    authToken = reg.data.accessToken;
    return;
  }

  // fallback: use a simple login
  authToken = 'test-token';
}

function headers() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

describe('AI Video Studio (E2E)', () => {
  beforeAll(async () => {
    await loginAsTestUser();
  });

  describe('Critical Path: Create Project → Scene → Character → Asset → Render → Queue', () => {
    it('GET /api should return hello', async () => {
      const res = await axios.get(`/api`);
      expect(res.status).toBe(200);
    });

    it('1. POST /ai-video/projects — create project', async () => {
      const res = await axios.post(
        '/ai-video/projects',
        { name: 'E2E Test Project', aspectRatio: '16:9', duration: 30 },
        { headers: headers() },
      );
      expect(res.status).toBe(201);
      expect(res.data.name).toContain('E2E Test Project');
      projectId = res.data.id;
    });

    it('2. GET /ai-video/projects — list projects', async () => {
      const res = await axios.get('/ai-video/projects', { headers: headers() });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.some((p: any) => p.id === projectId)).toBe(true);
    });

    it('3. GET /ai-video/projects/:id — get project', async () => {
      const res = await axios.get(`/ai-video/projects/${projectId}`, { headers: headers() });
      expect(res.status).toBe(200);
      expect(res.data.id).toBe(projectId);
    });

    it('4. PATCH /ai-video/projects/:id — rename project', async () => {
      const res = await axios.patch(
        `/ai-video/projects/${projectId}`,
        { name: 'E2E Renamed Project' },
        { headers: headers() },
      );
      expect(res.status).toBe(200);
      expect(res.data.name).toBe('E2E Renamed Project');
    });

    it('5. POST /ai-video/projects/:id/scenes — add scenes', async () => {
      const res1 = await axios.post(
        `/ai-video/projects/${projectId}/scenes`,
        { index: 0, prompt: 'Intro scene with a sunset', duration: 5, transition: 'fade' },
        { headers: headers() },
      );
      expect(res1.status).toBe(201);
      sceneId = res1.data.id;

      const res2 = await axios.post(
        `/ai-video/projects/${projectId}/scenes`,
        { index: 1, prompt: 'Second scene with a dramatic reveal', duration: 7, transition: 'cut' },
        { headers: headers() },
      );
      expect(res2.status).toBe(201);
    });

    it('6. PATCH /ai-video/scenes/:id — edit scene', async () => {
      const res = await axios.patch(
        `/ai-video/scenes/${sceneId}`,
        { prompt: 'Updated sunset intro', duration: 6 },
        { headers: headers() },
      );
      expect(res.status).toBe(200);
      expect(res.data.prompt).toBe('Updated sunset intro');
    });

    it('7. POST /ai-video/characters — create character', async () => {
      const res = await axios.post(
        '/ai-video/characters',
        { projectId, name: 'E2E Hero', prompt: 'A brave knight', style: 'realistic', age: 'young adult' },
        { headers: headers() },
      );
      expect(res.status).toBe(201);
      expect(res.data.name).toBe('E2E Hero');
      characterId = res.data.id;
    });

    it('8. GET /ai-video/characters?projectId= — list characters', async () => {
      const res = await axios.get(`/ai-video/characters?projectId=${projectId}`, { headers: headers() });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.some((c: any) => c.id === characterId)).toBe(true);
    });

    it('9. PATCH /ai-video/characters/:id — edit character', async () => {
      const res = await axios.patch(
        `/ai-video/characters/${characterId}`,
        { name: 'E2E Hero Updated' },
        { headers: headers() },
      );
      expect(res.status).toBe(200);
      expect(res.data.name).toBe('E2E Hero Updated');
    });

    it('10. DELETE /ai-video/characters/:id — delete character', async () => {
      const res = await axios.delete(`/ai-video/characters/${characterId}`, { headers: headers() });
      expect(res.status).toBe(200);
    });

    it('11. POST /ai-video/assets — upload asset', async () => {
      const formData = new FormData();
      const blob = new Blob(['fake-image-data'], { type: 'image/png' });
      formData.append('file', blob, 'test.png');
      formData.append('projectId', projectId);
      formData.append('type', 'image');

      const res = await axios.post('/ai-video/assets', formData, {
        headers: { ...headers(), 'Content-Type': 'multipart/form-data' },
      });
      expect(res.status).toBe(201);
      assetId = res.data.id;
    });

    it('12. GET /ai-video/assets?projectId= — list assets', async () => {
      const res = await axios.get(`/ai-video/assets?projectId=${projectId}`, { headers: headers() });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('13. DELETE /ai-video/assets/:id — delete asset', async () => {
      const res = await axios.delete(`/ai-video/assets/${assetId}`, { headers: headers() });
      expect(res.status).toBe(200);
    });

    it('14. GET /ai-video/providers — list providers', async () => {
      const res = await axios.get('/ai-video/providers', { headers: headers() });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('15. GET /ai-video/providers/health — provider health', async () => {
      const res = await axios.get('/ai-video/providers/health', { headers: headers() });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      if (res.data.length > 0) {
        expect(res.data[0]).toHaveProperty('status');
      }
    });

    it('16. GET /ai-video/projects/:id/cost-estimate — cost estimate', async () => {
      const res = await axios.get(`/ai-video/projects/${projectId}/cost-estimate`, { headers: headers() });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('estimates');
    });

    it('17. POST /ai-video/render — submit render', async () => {
      const res = await axios.post(
        '/ai-video/render',
        { projectId, provider: 'veo' },
        { headers: headers() },
      );
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('jobs');
    });

    it('18. GET /ai-video/jobs — list queue', async () => {
      const res = await axios.get('/ai-video/jobs', { headers: headers() });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('19. GET /ai-video/analytics/summary — analytics', async () => {
      const res = await axios.get('/ai-video/analytics/summary', { headers: headers() });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('totalProjects');
    });

    it('20. DELETE /ai-video/projects/:id — cleanup: soft delete project', async () => {
      const res = await axios.delete(`/ai-video/projects/${projectId}`, { headers: headers() });
      expect(res.status).toBe(200);
    });
  });

  describe('Error handling', () => {
    it('should return 404 for nonexistent project', async () => {
      const res = await axios.get('/ai-video/projects/nonexistent-id', {
        headers: headers(),
        validateStatus: () => true,
      });
      expect(res.status).toBe(404);
      expect(res.data).toHaveProperty('errorCode');
    });

    it('should return 404 for nonexistent scene', async () => {
      const res = await axios.get('/ai-video/scenes/nonexistent-id', {
        headers: headers(),
        validateStatus: () => true,
      });
      expect(res.status).toBe(404);
    });

    it('should reject project name with invalid characters', async () => {
      const res = await axios.post(
        '/ai-video/projects',
        { name: '' },
        { headers: headers(), validateStatus: () => true },
      );
      expect(res.status).toBe(400);
    });
  });

  describe('Voice / Subtitle / Music', () => {
    it('GET /ai-video/voice-library returns voices', async () => {
      const res = await axios.get('/ai-video/voice-library', { headers: headers() });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('GET /ai-video/music-library returns tracks', async () => {
      const res = await axios.get('/ai-video/music-library', { headers: headers() });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });
});
