import { EmailMessage } from '../types';

function decodeBase64Url(base64UrlStr: string): string {
  if (!base64UrlStr) return '';
  try {
    const base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  } catch (err) {
    try {
      return atob(base64UrlStr.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return '';
    }
  }
}

function extractBodyFromPayload(payload: any): { text: string; html?: string } {
  let text = '';
  let html = '';

  if (!payload) return { text, html };

  const mimeType = payload.mimeType || '';

  if (payload.body && payload.body.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (mimeType.includes('text/plain')) {
      text = decoded;
    } else if (mimeType.includes('text/html')) {
      html = decoded;
      // Also extract plain text from html
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = decoded;
      text = tempDiv.textContent || tempDiv.innerText || '';
    }
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const partMime = part.mimeType || '';
      if (partMime === 'text/plain' && part.body && part.body.data && !text) {
        text = decodeBase64Url(part.body.data);
      } else if (partMime === 'text/html' && part.body && part.body.data && !html) {
        html = decodeBase64Url(part.body.data);
      } else if (part.parts) {
        const nested = extractBodyFromPayload(part);
        if (!text && nested.text) text = nested.text;
        if (!html && nested.html) html = nested.html;
      }
    }
  }

  // Fallback: if text is empty but html exists
  if (!text && html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    text = tempDiv.textContent || tempDiv.innerText || '';
  }

  return { text: text.trim(), html };
}

function parseSender(fromHeader: string): { name: string; email: string } {
  if (!fromHeader) return { name: 'Noma\'lum', email: '' };
  
  // Format: "John Doe <john@example.com>" or "john@example.com"
  const match = fromHeader.match(/^(.*?)(?:<([^>]+)>)?$/);
  if (match) {
    let name = (match[1] || '').trim().replace(/^"|"$/g, '');
    let email = match[2] ? match[2].trim() : '';
    if (!email && name.includes('@')) {
      email = name;
      name = email.split('@')[0];
    }
    return {
      name: name || email || 'Noma\'lum',
      email: email || name
    };
  }
  return { name: fromHeader, email: fromHeader };
}

export async function fetchGmailMessages(
  accessToken: string,
  options: { query?: string; maxResults?: number } = {}
): Promise<{ messages: EmailMessage[]; totalEstimated?: number }> {
  const maxResults = options.maxResults || 15;
  let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
  if (options.query) {
    url += `&q=${encodeURIComponent(options.query)}`;
  }

  const listRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!listRes.ok) {
    if (listRes.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    const errData = await listRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Xabarlarni yuklab bo‘lmadi');
  }

  const listData = await listRes.json();
  const rawList: Array<{ id: string; threadId: string }> = listData.messages || [];

  if (rawList.length === 0) {
    return { messages: [], totalEstimated: 0 };
  }

  // Fetch full details for the retrieved messages in parallel (limit batches to prevent 429)
  const detailPromises = rawList.slice(0, maxResults).map(async (item) => {
    try {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );
      if (!msgRes.ok) return null;
      const msgData = await msgRes.json();

      const headers: Record<string, string> = {};
      if (msgData.payload && msgData.payload.headers) {
        for (const h of msgData.payload.headers) {
          headers[h.name.toLowerCase()] = h.value;
        }
      }

      const subject = headers['subject'] || '(Mavzusi ko‘rsatilmagan)';
      const fromHeader = headers['from'] || '';
      const toHeader = headers['to'] || '';
      const dateHeader = headers['date'] || '';
      const { name: fromName, email: fromEmail } = parseSender(fromHeader);

      const labelIds: string[] = msgData.labelIds || [];
      const unread = labelIds.includes('UNREAD');
      const starred = labelIds.includes('STARRED');

      const { text: bodyText, html: bodyHtml } = extractBodyFromPayload(msgData.payload);

      const parsed: EmailMessage = {
        id: msgData.id,
        threadId: msgData.threadId,
        snippet: msgData.snippet || '',
        subject,
        from: fromHeader,
        fromName,
        fromEmail,
        to: toHeader,
        date: dateHeader,
        timestamp: parseInt(msgData.internalDate || '0', 10),
        unread,
        starred,
        labels: labelIds,
        bodyText: bodyText || msgData.snippet || '',
        bodyHtml,
      };

      return parsed;
    } catch (e) {
      console.error('Failed to fetch message details:', item.id, e);
      return null;
    }
  });

  const resolved = await Promise.all(detailPromises);
  const messages = resolved.filter((m): m is EmailMessage => m !== null);

  return {
    messages,
    totalEstimated: listData.resultSizeEstimate || messages.length,
  };
}
