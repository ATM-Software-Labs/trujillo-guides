'use client'

import { useState } from 'react'

type Props = {
  title: string
  authorName?: string
  handle?: string
  avatar?: string
  category?: string
  publishedAt?: number
}

export function GuideHeader({
  title,
  authorName = 'Alberto Trujillo Mingorance',
  handle = 'atrumin16',
  category = 'Guides'
}: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  const cleanHandle = (handle || 'atrumin16').replace(/^@/, '')

  return (
    <header className="mx-auto max-w-3xl px-6 pt-8">
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-white">{title}</h1>
      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-2 mb-6 border-b border-slate-800/80 pb-3">
        <span className="text-white font-medium">{authorName || 'Alberto Trujillo Mingorance'}</span>
        <span className="text-slate-600">·</span>
        <span className="text-cyan-400">@{cleanHandle}</span>
        <span className="text-slate-600">·</span>
        <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 text-[10px] uppercase tracking-wider">
          {category || 'Guides'}
        </span>
        <span className="text-slate-600">·</span>
        <button
          type="button"
          onClick={copy}
          className="hover:text-white transition-colors"
        >
          {copied ? 'Copiado' : 'Copiar enlace'}
        </button>
      </div>
    </header>
  )
}
