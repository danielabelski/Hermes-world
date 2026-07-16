#!/usr/bin/env python3
"""Read-only Hermes state.db -> Hermes World event bridge.

The adapter reads only message metadata/new rows from the shared Hermes DB and
posts evidence-backed lifecycle edges to the existing local World hub. It does
not mutate Hermes, does not copy message content and ignores cron/WebUI rows.
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import time
import urllib.error
import urllib.request
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--db', default='/home/filip/.hermes/state.db')
    parser.add_argument('--endpoint', default='http://127.0.0.1:4176/api/world/events')
    parser.add_argument('--spool')
    parser.add_argument('--cursor', default='/tmp/hermes-world-gateway-cursor.json')
    parser.add_argument('--poll-ms', type=int, default=500)
    parser.add_argument('--replay-latest', action='store_true')
    parser.add_argument('--once', action='store_true')
    return parser.parse_args()


def spool(path: str, event: dict) -> bool:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open('a', encoding='utf-8') as handle:
        handle.write(json.dumps(event, separators=(',', ':')) + '\n')
        handle.flush()
    return True


def post(endpoint: str, event: dict) -> bool:
    request = urllib.request.Request(
        endpoint,
        data=json.dumps(event, separators=(',', ':')).encode('utf-8'),
        headers={'content-type': 'application/json', 'x-hermes-world-source': 'gateway-state-db'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(request, timeout=3) as response:
            return response.status == 202
    except (urllib.error.URLError, TimeoutError):
        return False


def load_state(path: Path, initial_id: int) -> dict:
    try:
        payload = json.loads(path.read_text(encoding='utf-8'))
        return {'cursor': int(payload.get('cursor', initial_id)), 'runs': dict(payload.get('runs') or {})}
    except (FileNotFoundError, ValueError, TypeError, json.JSONDecodeError):
        return {'cursor': initial_id, 'runs': {}}


def save_state(path: Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(state, separators=(',', ':')), encoding='utf-8')
    temp.replace(path)


def event(run_id: str, seq: int, event_type: str, session_id: str, created_at: float, payload=None) -> dict:
    return {
        'event_id': f'{run_id}:{seq}',
        'run_id': run_id,
        'seq': seq,
        'event': event_type,
        'created_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(created_at)),
        'session_id': session_id,
        'task_id': run_id,
        'profile': 'default',
        'source': 'hermes-gateway-state-db',
        'payload': payload or {},
    }


def main() -> None:
    args = parse_args()
    cursor_path = Path(args.cursor)
    conn = sqlite3.connect(f'file:{args.db}?mode=ro', uri=True, timeout=2)
    conn.row_factory = sqlite3.Row
    maximum = int(conn.execute('select coalesce(max(id), 0) from messages').fetchone()[0])
    state = load_state(cursor_path, maximum)
    deliver = (lambda item: spool(args.spool, item)) if args.spool else (lambda item: post(args.endpoint, item))
    if args.replay_latest:
        row = conn.execute("select id from messages where role='user' order by id desc limit 1").fetchone()
        if row:
            state = {'cursor': max(0, int(row['id']) - 1), 'runs': {}}

    while True:
        rows = conn.execute(
            """
            select m.id, m.session_id, m.role, m.timestamp, m.tool_name,
                   m.finish_reason, m.tool_calls, length(coalesce(m.content, '')) as content_length,
                   s.source
              from messages m join sessions s on s.id=m.session_id
             where m.id > ? and s.source not in ('cron', 'webui')
             order by m.id asc limit 200
            """,
            (state['cursor'],),
        ).fetchall()
        for row in rows:
            message_id = int(row['id'])
            sid = str(row['session_id'])
            role = str(row['role'] or '').lower()
            created_at = float(row['timestamp'] or time.time())
            run = state['runs'].get(sid)

            if role == 'user':
                run_id = f'gateway-{sid}-{message_id}'[:140]
                run = {'id': run_id, 'seq': 0, 'user_message_id': message_id}
                state['runs'][sid] = run
                for event_type in ('stream_start', 'reasoning'):
                    edge = event(run_id, run['seq'], event_type, sid, created_at)
                    if deliver(edge):
                        run['seq'] += 1
            elif run and role == 'tool':
                edge = event(run['id'], run['seq'], 'tool', sid, created_at, {'tool_name': str(row['tool_name'] or 'tool')[:120]})
                if deliver(edge):
                    run['seq'] += 1
            elif run and role == 'assistant':
                has_tool_call = str(row['finish_reason'] or '') == 'tool_calls' or bool(row['tool_calls'])
                if has_tool_call:
                    edge = event(run['id'], run['seq'], 'tool', sid, created_at, {'tool_name': 'hermes-runtime'})
                    if deliver(edge):
                        run['seq'] += 1
                elif int(row['content_length'] or 0) > 0:
                    edge = event(run['id'], run['seq'], 'done', sid, created_at)
                    if deliver(edge):
                        run['seq'] += 1
                        state['runs'].pop(sid, None)

            state['cursor'] = message_id
            save_state(cursor_path, state)
        if args.once:
            break
        time.sleep(max(0.2, args.poll_ms / 1000))


if __name__ == '__main__':
    main()
