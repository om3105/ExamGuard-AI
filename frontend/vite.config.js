import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { SEO_PAGES, SITE_URL } from './src/seoPages.js'

// Writes dist/<route>.html so indexable pages have their head tags before JS runs.
const staticSeoPages = () => ({
    name: 'static-seo-pages',
    apply: 'build',
    writeBundle({ dir }) {
        const html = readFileSync(join(dir, 'index.html'), 'utf-8')
        for (const [path, { title, description, indexable }] of Object.entries(SEO_PAGES)) {
            if (!indexable) continue
            const url = `${SITE_URL}${path}`
            const page = html
                .replace(/(<title[^>]*>).*?(?=<\/title>)/, `$1${title}`)
                .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
                .replace(/(<meta (?:name|property)="(?:og|twitter):url" content=")[^"]*/g, `$1${url}`)
                .replace(/(<meta (?:name|property)="(?:og|twitter):title" content=")[^"]*/g, `$1${title}`)
                .replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*/g, `$1${description}`)
            writeFileSync(join(dir, `${path}.html`), page)
        }
    },
})

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), staticSeoPages()],
})
