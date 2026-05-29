#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成 100 篇 Markdown 文章的 Python 脚本
运行：python scripts/generate-markdown.py
"""

import os
import re
import json

# 读取 articles-data.js 中的文章数据
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'site', 'js')
DATA_FILE = os.path.join(DATA_DIR, 'articles-data.js')

with open(DATA_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# 提取 CATEGORIES 数据
categories_match = re.search(r'const CATEGORIES = (\[.*?\]);', content, re.DOTALL)
if categories_match:
    categories_str = categories_match.group(1)
    # 将 JavaScript 对象转换为 Python 兼容格式
    categories_str = categories_str.replace("'", '"')
    categories_str = re.sub(r'(\w+):\s*', r'"\1":', categories_str)
    # 使用 json 模块解析
    # 但 js 对象有 id/name 属性，需要处理
    categories = []
    for item_match in re.finditer(r"\{[^}]+\}", categories_str):
        item_str = item_match.group()
        id_match = re.search(r'"id"\s*:\s*"([^"]+)"', item_str)
        name_match = re.search(r'"name"\s*:\s*"([^"]+)"', item_str)
        if id_match and name_match:
            categories.append((id_match.group(1), name_match.group(1)))

# 提取 ARTICLES 数据
# 将 JavaScript 对象数组转换为 Python 列表
articles_raw = re.search(r'const ARTICLES = (\[.*?\]);\s*$', content, re.DOTALL)
if not articles_raw:
    # 找到 ARTICLES 定义结束位置
    start = content.find('const ARTICLES = [')
    if start >= 0:
        # 找到最后一个 ] 前面
        end = content.rfind('];') + 1
        articles_str = content[start:end]
    else:
        articles_str = ''
else:
    articles_str = articles_raw.group(1)

# 提取每个文章对象
articles = []

# 更简单的处理方式：直接读取 HTML 文件中的内容
# 实际上我们直接从 js 文件中提取每个 article 的字段
article_pattern = re.compile(
    r"\{\s*id:\s*(\d+),\s*category:\s*'([^']+)',\s*eras:\s*\[([^\]]+)\],\s*title:\s*'([^']*)',\s*summary:\s*'([^']*)',\s*content:\s*`([^`]+)`,\s*order:\s*(\d+)\s*\}"
)

for match in article_pattern.finditer(content):
    article_id = int(match.group(1))
    category = match.group(2)
    eras_str = match.group(3)
    title = match.group(4)
    summary = match.group(5)
    body = match.group(6)
    
    eras = [e.strip().strip("'") for e in eras_str.split(',')]
    
    articles.append({
        'id': article_id,
        'category': category,
        'eras': eras,
        'title': title,
        'summary': summary,
        'content': body
    })

# 按照 id 排序
articles.sort(key=lambda x: x['id'])

# 获取分类名称
def get_cat_name(cat_id):
    for c_id, c_name in categories:
        if c_id == cat_id:
            return c_name
    return cat_id

# 对内容进行格式化：将 HTML 标签转为 Markdown
def html_to_markdown(html):
    text = html
    text = text.replace('<h3>', '### ')
    text = text.replace('</h3>', '\n')
    text = text.replace('<strong>', '**')
    text = text.replace('</strong>', '**')
    text = text.replace('<p>', '')
    text = text.replace('</p>', '\n\n')
    return text

# 生成目录
def generate_toc():
    md = '# 魏晋南北朝系列 · 三百年风云\n\n'
    md += '## 📜 文章目录\n\n'
    md += '从曹魏到隋朝统一 · 公元220年–589年 · 共100篇\n\n'
    md += '---\n\n'
    
    for cat_id, cat_name in categories:
        cat_articles = [a for a in articles if a['category'] == cat_id]
        if not cat_articles:
            continue
        md += f'### {cat_name}\n\n'
        for a in cat_articles:
            filename = f"{a['id']:03d}-{re.sub(r'[：:，。、？\s/]+', '-', a['title']).strip('-')}.md"
            md += f'- **第{a["id"]}篇** [{a["title"]}]({filename})  \n  {a["summary"]}\n\n'
        md += '---\n\n'
    
    return md

# 生成单篇文章
def generate_article(article):
    cat_name = get_cat_name(article['category'])
    body = html_to_markdown(article['content'])
    
    md = f'# 第{article["id"]}篇 · {article["title"]}\n\n'
    md += f'> **专题**：{cat_name}  \n'
    md += f'> **标签**：{"、".join(article["eras"])}\n\n'
    md += '---\n\n'
    md += body.strip()
    md += '\n\n---\n\n'
    md += f'*本文为"魏晋南北朝系列"第{article["id"]}篇。*\n'
    
    return md

# 写入文件
articles_dir = os.path.join(os.path.dirname(__file__), '..', 'articles')
os.makedirs(articles_dir, exist_ok=True)

# 生成目录
toc = generate_toc()
toc_path = os.path.join(articles_dir, 'README.md')
with open(toc_path, 'w', encoding='utf-8') as f:
    f.write(toc)
print(f'✅ 目录已生成: articles/README.md')

# 生成每一篇文章
for article in articles:
    safe_title = re.sub(r'[：:，。、？\s/]+', '-', article['title']).strip('-').rstrip('-')
    filename = f"{article['id']:03d}-{safe_title}.md"
    filepath = os.path.join(articles_dir, filename)
    
    content = generate_article(article)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'✅ 第{article["id"]:3d}篇已生成: articles/{filename}')

print(f'\n🎉 全部 {len(articles)} 篇 Markdown 文章已生成完毕！')