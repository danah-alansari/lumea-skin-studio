#!/usr/bin/env python3
"""Inline styles.css + app.js into a single publishable HTML file (dist/lumea.html)."""
import re, os, pathlib

root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text()
css  = (root / 'styles.css').read_text()
js   = (root / 'app.js').read_text()

body = html.split('<body>', 1)[1].split('</body>', 1)[0]
body = body.replace('<script src="app.js"></script>', '')
title = re.search(r'<title>(.*?)</title>', html).group(1)
fonts = re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', html).group(0)
# external <script src> tags live in <head>; the artifact wrapper only keeps the
# body, so hoist them into the emitted page ahead of the inline app code
head = html.split('</head>', 1)[0]
head_scripts = "\n".join(re.findall(r'<script src="https://[^"]+"></script>', head))

out = f"""<title>{title}</title>
{fonts}
{head_scripts}
<style>
{css}
</style>
{body}
<script>
{js}
</script>
"""
(root / 'dist').mkdir(exist_ok=True)
target = root / 'dist' / 'lumea.html'
target.write_text(out)
print(f"built {target} — {len(out)/1024:.0f} KB")
