// ===== 生成 Markdown 源文件 =====
// 在 Node.js 环境下运行：node generate-markdown.js
// 将生成 100 篇 Markdown 文章到 articles/ 目录

const fs = require('fs');
const path = require('path');

// 复制 articles-data.js 中的数据结构（简化版）
const CATEGORIES = [
    { id: 'intro', name: '总论' },
    { id: 'caowei', name: '曹魏' },
    { id: 'shuhan-dongwu', name: '蜀汉·东吴' },
    { id: 'xijin', name: '西晋' },
    { id: 'dongjin', name: '东晋' },
    { id: 'shiliuguo', name: '十六国' },
    { id: 'nanchao-song', name: '南朝·宋' },
    { id: 'nanchao-qiliangchen', name: '南朝·齐梁陈' },
    { id: 'beichao-wei', name: '北朝·北魏' },
    { id: 'beichao-dongxibei', name: '北朝·东西魏北齐周' },
    { id: 'wenhua', name: '文化思想' },
    { id: 'zhidu', name: '制度经济' },
    { id: 'suichao', name: '隋朝统一' }
];

// 读取文章数据
const dataPath = path.join(__dirname, '..', 'site', 'js', 'articles-data.js');
const dataContent = fs.readFileSync(dataPath, 'utf-8');

// 用 eval 提取数据（简单方式）
// 由于文件中定义了 const，我们使用 require 的方式
// 实际上我们需要把文件临时改成一个模块，或者用 Function eval
// 简单起见直接从字符串中正则提取 eval
const evalCode = dataContent
    .replace('const CATEGORIES', 'var CATEGORIES')
    .replace('const TIMELINE', 'var TIMELINE')
    .replace('const DYNASTIES', 'var DYNASTIES')
    .replace('const ARTICLES', 'var ARTICLES');

eval(evalCode);

// 生成目录
function generateTOC() {
    let md = `# 魏晋南北朝系列 · 三百年风云\n\n`;
    md += `## 📜 文章目录\n\n`;
    md += `从曹魏到隋朝统一 · 公元220年–589年 · 共100篇\n\n`;
    md += `---\n\n`;

    for (const cat of CATEGORIES) {
        const articles = ARTICLES.filter(a => a.category === cat.id);
        if (articles.length === 0) continue;

        md += `### ${cat.name}\n\n`;
        for (const article of articles) {
            md += `- **第${article.id}篇** [${article.title}](${String(article.id).padStart(3, '0')}-${article.title.replace(/[：:，。、？\s]+/g, '-')}.md)  \n  ${article.summary}\n\n`;
        }
        md += `---\n\n`;
    }

    return md;
}

// 生成单篇文章
function generateArticle(article) {
    const cat = CATEGORIES.find(c => c.id === article.category);
    const categoryName = cat ? cat.name : article.eras[0];

    // 将 HTML 标签转换回 Markdown 格式
    let body = article.content
        .replace(/<h3>/g, '### ')
        .replace(/<\/h3>/g, '\n')
        .replace(/<strong>/g, '**')
        .replace(/<\/strong>/g, '**')
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n');

    let md = `# 第${article.id}篇 · ${article.title}\n\n`;
    md += `> **专题**：${categoryName}  \n`;
    md += `> **标签**：${article.eras.join('、')}\n\n`;
    md += `---\n\n`;
    md += body;
    md += `\n\n---\n\n`;
    md += `*本文为"魏晋南北朝系列"第${article.id}篇。*\n`;

    return md;
}

// 写入文件
const articlesDir = path.join(__dirname, '..', 'articles');
if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
}

// 生成目录
const toc = generateTOC();
fs.writeFileSync(path.join(articlesDir, 'README.md'), toc, 'utf-8');
console.log('✅ 目录已生成: articles/README.md');

// 生成每一篇文章
for (const article of ARTICLES) {
    const filename = `${String(article.id).padStart(3, '0')}-${article.title.replace(/[：:，。、？\s]+/g, '-')}.md`;
    const content = generateArticle(article);
    fs.writeFileSync(path.join(articlesDir, filename), content, 'utf-8');
    console.log(`✅ 第${article.id}篇已生成: articles/${filename}`);
}

console.log('\n🎉 全部100篇Markdown文章已生成完毕！');