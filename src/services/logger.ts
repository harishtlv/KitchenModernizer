/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function logToCLI(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level, message, data }),
    });
  } catch (err) {
    console.error('Failed to send log to CLI:', err);
  }
}
