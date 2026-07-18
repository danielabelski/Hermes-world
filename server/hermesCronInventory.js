const JOB_HEADER = /^\s{2}([a-f0-9]+) \[(active|paused)\]\s*$/i;

const asJobsPayload = (payload) => {
  const jobs = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.jobs)
      ? payload.jobs
      : Array.isArray(payload?.crons)
        ? payload.crons
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
  return Array.isArray(payload) ? { jobs } : { ...(payload || {}), jobs };
};

const hasValue = (value) => value !== null && value !== undefined && value !== '';

const fillMissingFields = (primary, fallback) => {
  const merged = { ...(fallback || {}) };
  for (const [key, value] of Object.entries(primary || {})) {
    if (hasValue(value) || !Object.hasOwn(merged, key)) merged[key] = value;
  }
  return merged;
};

/**
 * Hermes WebUI is authoritative because /crons and /crons/recent are produced
 * from the same active profile and timestamp source. The CLI inventory is only
 * a gap-filler for fields/jobs absent from WebUI; it must never overwrite a
 * valid WebUI completion timestamp or status.
 */
export function mergeHermesCronInventories(primaryPayload, fallbackPayload) {
  const primary = asJobsPayload(primaryPayload);
  const fallback = asJobsPayload(fallbackPayload);
  const fallbackById = new Map(
    fallback.jobs
      .filter((job) => hasValue(job?.id))
      .map((job) => [String(job.id), job]),
  );
  const primaryIds = new Set();
  const jobs = primary.jobs.map((job) => {
    const id = hasValue(job?.id) ? String(job.id) : '';
    if (id) primaryIds.add(id);
    return id && fallbackById.has(id)
      ? fillMissingFields(job, fallbackById.get(id))
      : job;
  });
  for (const job of fallback.jobs) {
    const id = hasValue(job?.id) ? String(job.id) : '';
    if (!id || !primaryIds.has(id)) jobs.push(job);
  }
  return { ...primary, jobs };
}

export function parseHermesCronList(output = '') {
  const jobs = [];
  let current = null;
  const flush = () => {
    if (current?.id && current?.name) jobs.push(current);
    current = null;
  };

  for (const line of String(output).split(/\r?\n/)) {
    const header = line.match(JOB_HEADER);
    if (header) {
      flush();
      current = { id: header[1], enabled: header[2].toLowerCase() === 'active' };
      continue;
    }
    if (!current) continue;
    const name = line.match(/^\s+Name:\s+(.+?)\s*$/);
    if (name) current.name = name[1];
    const schedule = line.match(/^\s+Schedule:\s+(.+?)\s*$/);
    if (schedule) current.schedule = schedule[1];
    const lastRun = line.match(/^\s+Last run:\s+(\S+)\s+(\S+)\s*$/);
    if (lastRun) {
      current.last_run_at = lastRun[1];
      current.last_status = lastRun[2];
    }
  }
  flush();
  return { jobs };
}
