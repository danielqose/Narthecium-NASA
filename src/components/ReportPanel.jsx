import { useState } from 'react';
import { reportFrom } from '../lib/engine.js';

export function ReportPanel({ snap, store, plan }) {
  const text = reportFrom(snap, store, plan);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="report">
      <h2>Ground note</h2>
      <p>One page for a flight surgeon when the link is up. It lists rings, the finding, the numbers, Brother’s Eye, and anything you already logged. It is a monitoring summary.</p>
      <div className="actions">
        <button className="btn" type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy the note'}
        </button>
      </div>
      <pre>{text}</pre>
    </article>
  );
}
