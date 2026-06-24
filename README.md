# prelegal

A toolkit for generating legal documents. Currently includes a Mutual NDA Creator web app and a library of legal document templates.

## Projects

### Mutual NDA Creator (`frontend/`)

A Next.js web app for generating Mutual Non-Disclosure Agreements based on the [Common Paper MNDA Standard Terms v1.0](https://commonpaper.com/standards/mutual-nda/1.0/).

**Features:**
- Two-panel layout: form on the left, live preview on the right
- Fills in both parties' details, MNDA term, confidentiality term, governing law, and jurisdiction
- Download the completed document as `.md` or `.pdf`

**Stack:** Next.js 14, TypeScript, Tailwind CSS, react-markdown, html2pdf.js

#### Getting started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

#### Tests

```bash
cd frontend
npm test
```

48 tests across 3 suites:
- `src/lib/generateNDA.test.ts` — NDA markdown generation logic
- `src/types/nda.test.ts` — default data validation
- `src/components/NDAPreview.test.tsx` — component rendering

### Legal Document Templates (`templates/`)

A collection of open-source legal agreement templates sourced from [CommonPaper](https://github.com/CommonPaper) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

| File | Agreement |
|------|-----------|
| `Mutual-NDA.md` | Mutual Non-Disclosure Agreement |
| `CSA.md` | Cloud Service Agreement |
| `sla.md` | Service Level Agreement |
| `DPA.md` | Data Processing Agreement |
| `BAA.md` | Business Associate Agreement |
| `Software-License-Agreement.md` | Software License Agreement |
| `Pilot-Agreement.md` | Pilot Agreement |
| `Partnership-Agreement.md` | Partnership Agreement |
| `psa.md` | Professional Services Agreement |
| `design-partner-agreement.md` | Design Partner Agreement |
| `AI-Addendum.md` | AI Addendum |

See `catalog.json` for a machine-readable index of all templates.

## License

Templates are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See `templates/LICENSE`.
