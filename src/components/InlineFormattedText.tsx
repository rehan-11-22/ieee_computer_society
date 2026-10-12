import { Fragment, type ReactNode } from "react";

const INLINE_FORMAT_PATTERN = /(\*\*\*[^\n]+?\*\*\*|\*\*[^\n]+?\*\*|\*[^*\n]+?\*)/g;

export function renderInlineFormattedText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INLINE_FORMAT_PATTERN)) {
    const index = match.index;
    if (index > cursor) nodes.push(text.slice(cursor, index));

    const token = match[0];
    const key = `${index}-${token.length}`;
    if (token.startsWith("***")) {
      nodes.push(<strong key={key}><em>{token.slice(3, -3)}</em></strong>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    cursor = index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes.length > 0 ? nodes : [<Fragment key="plain">{text}</Fragment>];
}
