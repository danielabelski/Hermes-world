import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeHermesCronInventories, parseHermesCronList } from './hermesCronInventory.js';

test('parses names and completion evidence from Hermes cron list', () => {
  const payload = parseHermesCronList(`
  67b8294196c1 [active]
    Name:      job-scraper-morning
    Schedule:  30 9 * * *
    Last run:  2026-07-18T09:31:40.644559+02:00  ok

  0dd677f8f794 [paused]
    Name:      cost-optimazer
    Last run:  2026-07-17T23:30:08.282301+02:00  error
`);
  assert.equal(payload.jobs.length, 2);
  assert.deepEqual(payload.jobs[0], {
    id: '67b8294196c1', enabled: true, name: 'job-scraper-morning', schedule: '30 9 * * *',
    last_run_at: '2026-07-18T09:31:40.644559+02:00', last_status: 'ok',
  });
  assert.equal(payload.jobs[1].name, 'cost-optimazer');
  assert.equal(payload.jobs[1].last_status, 'error');
});

test('keeps WebUI cron timestamps and status authoritative while filling missing fields from CLI', () => {
  const payload = mergeHermesCronInventories({ jobs: [{
    id: '67b8294196c1',
    name: 'job-scraper-morning',
    last_run_at: '2026-07-18T09:31:34.154202+02:00',
    last_status: 'ok',
  }] }, { jobs: [{
    id: '67b8294196c1',
    name: 'job-scraper-morning',
    schedule: '30 9 * * *',
    last_run_at: '2026-07-18T09:31:40.644559+02:00',
    last_status: 'error',
  }, {
    id: 'cli-only',
    name: 'CLI fallback',
  }] });

  assert.equal(payload.jobs.length, 2);
  assert.deepEqual(payload.jobs[0], {
    id: '67b8294196c1',
    name: 'job-scraper-morning',
    schedule: '30 9 * * *',
    last_run_at: '2026-07-18T09:31:34.154202+02:00',
    last_status: 'ok',
  });
  assert.equal(payload.jobs[1].id, 'cli-only');
});
