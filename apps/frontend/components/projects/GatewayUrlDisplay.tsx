'use client';

import { useState } from 'react';

export default function GatewayUrlDisplay({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm font-medium text-gray-700 mb-2">Gateway Base URL</p>
      <div className="flex items-center gap-3 bg-gray-50 rounded px-4 py-3">
        <code className="text-sm text-gray-800 flex-1 break-all">{url}</code>
        <button
          onClick={handleCopy}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 shrink-0"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Append your configured route paths to this URL, e.g. <code>{url}/api/documents</code>
      </p>
    </div>
  );
}
