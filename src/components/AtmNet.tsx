// ATM Software Labs: shared network footer strip (v1). Same markup as /workspace/unify/shared/atm-net.cjs; styles in index.css (.atm-net).
const SITES: [string, string, string][] = [
  ['labs', 'https://labs.trujillomingorance.com/', 'ATM Labs'],
  ['invest', 'https://invest.trujillomingorance.com/', 'INVEST'],
  ['charts', 'https://charts.trujillomingorance.com/', 'Markets Briefing'],
  ['ai', 'https://ai.trujillomingorance.com/', 'Trujillo AI'],
  ['guides', 'https://guides.trujillomingorance.com/', 'Guías'],
  ['tools', 'https://tools.trujillomingorance.com/', 'Tools'],
  ['rewrite', 'https://rewrite.trujillomingorance.com/', 'Rewrite'],
  ['alberto', 'https://alberto.trujillomingorance.com/', 'Alberto'],
];

export function AtmNet({ current }: { current: string }) {
  return (
    <div className="atm-net">
      <div className="atm-net__in">
        <a className="atm-net__brand" href="https://trujillomingorance.com/">ATM Software Labs</a>
        <nav aria-label="Sitios de ATM Software Labs">
          <ul className="atm-net__sites">
            {SITES.map(([k, u, n]) => (
              <li key={k}><a href={u} aria-current={k === current ? 'page' : undefined}>{n}</a></li>
            ))}
          </ul>
        </nav>
        <p className="atm-net__legal">© 2026 ATM Software Labs · Alberto Trujillo Mingorance · <a href="https://trujillomingorance.com/privacy">Privacidad</a> · <a href="https://trujillomingorance.com/terms">Términos</a></p>
      </div>
    </div>
  );
}
