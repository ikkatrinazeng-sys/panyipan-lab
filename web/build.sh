#!/usr/bin/env bash
# 打包网页版：把 miniprogram/ 里的排盘引擎打成单文件，嵌进模板，输出 web/panyipan.html
# 依赖：npm i iztro esbuild（在 web/ 目录下执行一次）
set -euo pipefail
cd "$(dirname "$0")"
npx esbuild entry.js --bundle --format=iife --global-name=Engine --target=es2017 --minify --outfile=engine.bundle.js
python3 - <<'PY'
tpl = open('index.template.html', encoding='utf-8').read()
eng = open('engine.bundle.js', encoding='utf-8').read()
body = tpl.replace('/*ENGINE*/', eng)
head = '<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style>\n'
open('panyipan.html', 'w', encoding='utf-8').write(head + body.replace('<title>', '<title>', 1) + '\n</html>\n')
PY
rm -f engine.bundle.js
echo "已生成 web/panyipan.html"
