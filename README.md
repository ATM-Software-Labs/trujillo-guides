# ATM Technical Guides and Production Runbooks

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Deployed-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://subdomain.yourdomain.com)
[![Status](https://img.shields.io/badge/Status-Operational-107c41?style=flat-square)](#)
[![Design](https://img.shields.io/badge/Design_System-Mica_Corporate-0078d4?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

Production Gateway: [subdomain.yourdomain.com](https://subdomain.yourdomain.com)

A collection of technical documentation, architectural blueprints, and production runbooks maintained by Your Name under Your Organization.

---

## Published Guides

### Zero-Cost Enterprise Email Architecture

Full production guide: [subdomain.yourdomain.com/guides/enterprise-email/](https://subdomain.yourdomain.com/guides/enterprise-email/)

This guide covers building a complete transactional and corporate email setup for startups and engineering teams without paying recurring seat licenses for Google Workspace or Microsoft 365.

Topics covered:
- DNS Records: Comprehensive DKIM (2048-bit RSA), SPF with strict enforcement (`-all`), DMARC policies (`p=reject`), and BIMI/Gravatar verified avatar delivery.
- Cloudflare Email Routing: Forwarding inbound corporate emails to personal or team inboxes with SPF alignment.
- Resend API & SMTP Relay: Sending outbound mail with custom domain authentication and high deliverability.
- Email Client Configuration: Connecting mobile and desktop mail clients (Gmail, Apple Mail, Thunderbird) using SMTP submission on port 587 (TLS).

---

## Technical Stack and Principles

- Static Engine: Semantic HTML5 and modern CSS with custom properties, glassmorphism card surfaces, and accessible typography.
- Edge Hosting: Cloudflare Pages with global anycast distribution and aggressive edge caching.
- Theme: Dark corporate slate (#080c14) with subtle acrylic borders and high-contrast text.
- Internationalization: Client-side language switcher supporting Spanish and English.
- Extensibility: Standardized article template (`guide-template.html`) making it straightforward to author and publish new documentation.

---

## Repository Structure

```
trujillo-guides/
├── .github/
│   └── workflows/
│       └── ci.yml       # Documentation integrity and asset verification
├── public/              # Static assets and HTML pages deployed to Cloudflare Pages
│   ├── guides/          # Technical deep-dives and production runbooks
│   │   └── enterprise-email/# Enterprise email architecture article and diagrams
│   ├── index.html       # Guides directory homepage with live search
│   └── 404.html         # Corporate 404 error handler
├── package.json         # Deployment scripts
└── wrangler.toml        # Cloudflare Pages deployment configuration
```

---

## Branching Model

- `main`: Production release branch. Changes pushed to `main` go live immediately.
- `develop`: Staging and editorial branch. Used for technical review and proofreading before publication.

---

## Deployment

```bash
# Using npm
npm run deploy

# Or directly via Wrangler
npx wrangler pages deploy public --project-name trujillo-guides --commit-dirty=true
```

---

## Author

Your Name  
- Website: [your-portfolio.com](https://your-portfolio.com)  
- GitHub: [@your-github-username](https://github.com/your-github-username)

---

## License

Copyright (c) 2026 Your Name. Released under the MIT License.

