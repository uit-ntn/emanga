import { Fragment } from 'react';

/**
 * Minimal, safe Markdown renderer for manga descriptions.
 * Supports paragraphs, line breaks, **bold**, *italic*, [links](url) and bare URLs.
 * Produces React nodes – never injects raw HTML.
 */
const INLINE = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|(https?:\/\/[^\s<]+))/g;

function inline(text, keyPrefix) {
  const out = [];
  let last = 0;
  let m;
  let i = 0;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${i++}`;
    if (m[2]) {
      out.push(
        <a key={key} href={m[3]} target="_blank" rel="noreferrer noopener">
          {m[2]}
        </a>
      );
    } else if (m[4]) out.push(<strong key={key}>{m[4]}</strong>);
    else if (m[5] || m[6]) out.push(<em key={key}>{m[5] || m[6]}</em>);
    else if (m[7]) {
      out.push(
        <a key={key} href={m[7]} target="_blank" rel="noreferrer noopener">
          {m[7]}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function cleanDescription(text = '') {
  // Some descriptions end with a "---" separator followed by link lists
  return text.split(/\n\s*-{3,}\s*\n/)[0].replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
}

export default function RichText({ text, className }) {
  const paragraphs = cleanDescription(text)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className={className}>
      {paragraphs.map((p, pi) => (
        <p key={pi}>
          {p.split('\n').map((line, li) => (
            <Fragment key={li}>
              {li > 0 && <br />}
              {inline(line, `${pi}-${li}`)}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
