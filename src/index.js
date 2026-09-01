const ALLOWED_BASE = 'appPgG1gwtIqJweV9';
const AIRTABLE_API = 'https://api.airtable.com/v0';

const ALLOWED_ORIGINS = [
  'https://codeline.city',
  'https://www.codeline.city',
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(corsOrigin),
      });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const parts = url.pathname.replace(/^\/airtable\//, '').split('/');
    const baseId = parts[0];
    const tableId = parts[1];

    if (baseId !== ALLOWED_BASE) {
      return new Response('Forbidden', { status: 403 });
    }

    if (!tableId) {
      return new Response('Missing tableId', { status: 400 });
    }

    const airtableUrl = `${AIRTABLE_API}/${baseId}/${tableId}${url.search}`;

    const airtableRes = await fetch(airtableUrl, {
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const body = await airtableRes.text();

    return new Response(body, {
      status: airtableRes.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(corsOrigin),
      },
    });
  },
};

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}
