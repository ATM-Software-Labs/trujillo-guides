import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import type { Components } from 'react-markdown'
import { TickerPill } from './TickerPill'
import { TradingViewWidget } from './TradingViewWidget'

function withTickers(text: string) {
  const parts: Array<string | { t: string }> = []
  const re = /(^|[\s(])\$([A-Z]{1,6}(?:-[A-Z]{1,4})?)\b/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    parts.push(text.slice(last, m.index) + m[1])
    parts.push({ t: m[2] })
    last = m.index + m[0].length
  }
  parts.push(text.slice(last))
  return parts
}

const components: Components = {
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm border-collapse border border-slate-700/60 rounded-xl overflow-hidden">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-800/80">{children}</thead>,
  th: ({ children }) => (
    <th className="bg-slate-800/80 px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-200 border-b border-slate-700/60">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-800/50 px-4 py-3 text-slate-300 hover:bg-slate-800/30 transition-colors">
      {children}
    </td>
  ),
  p: ({ children }) => {
    if (typeof children === 'string') {
      return (
        <p className="mb-3.5 text-neutral-300">
          {withTickers(children).map((p, i) =>
            typeof p === 'string' ? p : <TickerPill key={i} symbol={p.t} />
          )}
        </p>
      )
    }
    return <p className="mb-3.5 text-neutral-300">{children}</p>
  }
}

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  const tv = markdown.replace(
    /<(?:TradingViewWidget|tradingview)\s+symbol=["']([^"']+)["'](?:\s+interval=["']([^"']+)["'])?[^>]*\/?>/gi,
    (_m, symbol, interval) => `\n\n<div data-tv="${symbol}" data-iv="${interval || 'D'}"></div>\n\n`
  )

  return (
    <div className="prose-invert max-w-3xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          ...components,
          div: (props) => {
            const tvSym = (props as { 'data-tv'?: string })['data-tv']
            if (tvSym) {
              return <TradingViewWidget symbol={tvSym} interval={(props as { 'data-iv'?: string })['data-iv']} />
            }
            return <div {...props} />
          }
        }}
      >
        {tv}
      </ReactMarkdown>
    </div>
  )
}
