import { useState } from "react";
import { Code2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApiDocs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative bg-slate-900 rounded-lg p-4 border border-slate-700 overflow-x-auto">
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 hover:bg-slate-800 rounded"
      >
        {copiedCode === id ? (
          <Check className="w-4 h-4 text-neon-green" />
        ) : (
          <Copy className="w-4 h-4 text-slate-400" />
        )}
      </button>
      <pre className="text-sm text-slate-300 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-8 h-8 text-neon-green" />
            <h1 className="text-4xl font-bold">API Documentation</h1>
          </div>
          <p className="text-slate-400">
            Build with Distro Buzz. Integrate music distribution into your platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Authentication */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Authentication</h2>
          <p className="text-slate-400">
            All API requests require a Bearer token in the Authorization header.
          </p>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Getting Your API Key</h3>
            <ol className="space-y-2 text-slate-400 list-decimal list-inside">
              <li>Sign in to your Distro Buzz account</li>
              <li>Go to Settings → API Keys</li>
              <li>Click "Generate New Key"</li>
              <li>Copy your key and store it securely</li>
            </ol>
          </div>

          <CodeBlock
            id="auth-example"
            language="bash"
            code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.distrobuzz.com/v1/tracks`}
          />
        </section>

        {/* Endpoints */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Core Endpoints</h2>

          {/* Create Distribution Job */}
          <div className="space-y-4 p-6 border border-slate-700 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-neon-green">POST /api/distribution/create</h3>
              <p className="text-slate-400 text-sm">Create a new distribution job for a track</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Request Body</h4>
              <CodeBlock
                id="create-dist-req"
                language="json"
                code={`{
  "trackId": "track_abc123",
  "platforms": ["spotify", "apple_music", "youtube"],
  "releaseDate": "2026-05-01",
  "metadata": {
    "title": "My Song",
    "artist": "My Name",
    "genre": "Electronic"
  }
}`}
              />
            </div>

            <div>
              <h4 className="font-semibold mb-2">Response</h4>
              <CodeBlock
                id="create-dist-res"
                language="json"
                code={`{
  "success": true,
  "jobId": "job_xyz789",
  "status": "queued",
  "platforms": 3,
  "estimatedTime": "2-4 hours"
}`}
              />
            </div>
          </div>

          {/* Get Job Status */}
          <div className="space-y-4 p-6 border border-slate-700 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-neon-green">GET /api/distribution/:jobId</h3>
              <p className="text-slate-400 text-sm">Get the status of a distribution job</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Response</h4>
              <CodeBlock
                id="get-status-res"
                language="json"
                code={`{
  "jobId": "job_xyz789",
  "status": "processing",
  "platforms": [
    {
      "name": "spotify",
      "status": "live",
      "url": "https://spotify.com/track/abc123"
    },
    {
      "name": "apple_music",
      "status": "processing",
      "progress": 75
    },
    {
      "name": "youtube",
      "status": "queued"
    }
  ],
  "coverage": "2/3"
}`}
              />
            </div>
          </div>

          {/* List Tracks */}
          <div className="space-y-4 p-6 border border-slate-700 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-neon-green">GET /api/tracks</h3>
              <p className="text-slate-400 text-sm">List all tracks for the authenticated artist</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Query Parameters</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>
                  <code className="text-neon-cyan">limit</code> - Number of results (default: 20)
                </div>
                <div>
                  <code className="text-neon-cyan">offset</code> - Pagination offset (default: 0)
                </div>
                <div>
                  <code className="text-neon-cyan">status</code> - Filter by status (live, processing, failed)
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Response</h4>
              <CodeBlock
                id="list-tracks-res"
                language="json"
                code={`{
  "tracks": [
    {
      "id": "track_abc123",
      "title": "My Song",
      "artist": "My Name",
      "status": "live",
      "coverage": "7/9",
      "createdAt": "2026-04-28T10:30:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}`}
              />
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Code Examples</h2>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">JavaScript / Node.js</h3>
            <CodeBlock
              id="js-example"
              language="javascript"
              code={`const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.distrobuzz.com/v1',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

// Create distribution job
async function distributeTrack(trackId) {
  try {
    const response = await client.post('/distribution/create', {
      trackId,
      platforms: ['spotify', 'apple_music', 'youtube'],
      metadata: {
        title: 'My Song',
        artist: 'My Name'
      }
    });
    console.log('Job created:', response.data.jobId);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

distributeTrack('track_abc123');`}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Python</h3>
            <CodeBlock
              id="py-example"
              language="python"
              code={`import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': f'Bearer {api_key}'}

def distribute_track(track_id):
    response = requests.post(
        'https://api.distrobuzz.com/v1/distribution/create',
        headers=headers,
        json={
            'trackId': track_id,
            'platforms': ['spotify', 'apple_music', 'youtube'],
            'metadata': {
                'title': 'My Song',
                'artist': 'My Name'
            }
        }
    )
    return response.json()

result = distribute_track('track_abc123')
print(f"Job created: {result['jobId']}")`}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">cURL</h3>
            <CodeBlock
              id="curl-example"
              language="bash"
              code={`curl -X POST https://api.distrobuzz.com/v1/distribution/create \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "trackId": "track_abc123",
    "platforms": ["spotify", "apple_music", "youtube"],
    "metadata": {
      "title": "My Song",
      "artist": "My Name"
    }
  }'`}
            />
          </div>
        </section>

        {/* Rate Limiting */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Rate Limiting</h2>
          <div className="space-y-4 p-6 border border-slate-700 rounded-lg">
            <p className="text-slate-400">
              API requests are rate-limited based on your plan:
            </p>
            <ul className="space-y-2 text-slate-400">
              <li>
                <strong className="text-white">Starter:</strong> 100 requests/hour
              </li>
              <li>
                <strong className="text-white">Pro:</strong> 1,000 requests/hour
              </li>
              <li>
                <strong className="text-white">Label:</strong> Unlimited
              </li>
            </ul>
            <p className="text-sm text-slate-500 pt-4">
              Rate limit info is returned in response headers: X-RateLimit-Limit, X-RateLimit-Remaining,
              X-RateLimit-Reset
            </p>
          </div>
        </section>

        {/* Error Handling */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Error Handling</h2>
          <div className="space-y-4">
            <CodeBlock
              id="error-example"
              language="json"
              code={`{
  "error": {
    "code": "INVALID_PLATFORM",
    "message": "Platform 'invalid_platform' is not supported",
    "details": {
      "supported": ["spotify", "apple_music", "youtube", ...]
    }
  }
}`}
            />
          </div>
        </section>

        {/* Support */}
        <section className="space-y-6 pb-12">
          <h2 className="text-2xl font-bold">Support</h2>
          <p className="text-slate-400">
            Need help? Check out our{" "}
            <a href="#" className="text-neon-green hover:underline">
              FAQ
            </a>
            {" "}or contact{" "}
            <a href="mailto:support@distrobuzz.com" className="text-neon-green hover:underline">
              support@distrobuzz.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
