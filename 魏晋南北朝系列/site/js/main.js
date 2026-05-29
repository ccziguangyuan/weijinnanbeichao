// ===== DOM 引用 =====
const timelineContainer = document.getElementById('timelineContainer');
const filterBar = document.getElementById('filterBar');
const articlesGrid = document.getElementById('articlesGrid');
const articleModal = document.getElementById('articleModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');
const articleReader = document.getElementById('articleReader');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    renderTimeline();
    renderFilterBar();
    renderArticles();
    renderDynastyChart();
    setupEventListeners();
});

// ===== 渲染时间线 =====
function renderTimeline() {
    timelineContainer.innerHTML = TIMELINE.map((item, index) => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-era">${item.era}</div>
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-desc">${item.desc}</div>
            </div>
        </div>
    `).join('');
}

// ===== 渲染分类筛选栏 =====
function renderFilterBar() {
    const buttons = [
        `<button class="filter-btn active" data-category="all">全部</button>`,
        ...CATEGORIES.map(cat => 
            `<button class="filter-btn" data-category="${cat.id}">${cat.name}</button>`
        )
    ];
    filterBar.innerHTML = buttons.join('');
}

// ===== 渲染文章网格 =====
function renderArticles(category = 'all') {
    const filtered = category === 'all' 
        ? ARTICLES 
        : ARTICLES.filter(a => a.category === category);
    
    articlesGrid.innerHTML = filtered.map(article => {
        const cat = CATEGORIES.find(c => c.id === article.category);
        return `
            <div class="article-card" data-id="${article.id}">
                <div class="article-card-number">第 ${article.id} 篇</div>
                <div class="article-card-title">${article.title}</div>
                <div class="article-card-era">${cat ? cat.name : article.eras[0]}</div>
                <div class="article-card-summary">${article.summary}</div>
            </div>
        `;
    }).join('');
}

// ===== 渲染朝代更迭图 =====
function renderDynastyChart() {
    const chart = document.getElementById('dynastyChart');
    chart.innerHTML = DYNASTIES.map(d => `
        <div class="dynasty-item">
            <div class="dy-name">${d.name}</div>
            <div class="dy-years">${d.years}</div>
        </div>
    `).join('');
}

// ===== 打开文章阅读器 =====
function openArticle(articleId) {
    const article = ARTICLES.find(a => a.id === articleId);
    if (!article) return;

    const cat = CATEGORIES.find(c => c.id === article.category);
    const categoryName = cat ? cat.name : article.eras[0];

    articleReader.innerHTML = `
        <div class="article-meta">
            <div class="article-number">第 ${article.id} 篇 · ${categoryName}</div>
            <h1 class="article-title">${article.title}</h1>
            <div class="article-eras">
                ${article.eras.map(era => `<span class="article-era-badge">${era}</span>`).join('')}
            </div>
        </div>
        <div class="article-body">${article.content}</div>
    `;

    articleModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

// ===== 关闭文章阅读器 =====
function closeArticle() {
    articleModal.classList.remove('open');
    document.body.style.overflow = '';
}

// ===== 事件监听 =====
function setupEventListeners() {
    // 筛选按钮点击
    filterBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderArticles(btn.dataset.category);
    });

    // 文章卡片点击
    articlesGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.article-card');
        if (!card) return;
        openArticle(parseInt(card.dataset.id));
    });

    // 关闭弹窗
    modalClose.addEventListener('click', closeArticle);
    modalOverlay.addEventListener('click', closeArticle);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeArticle();
    });

    // 移动端导航栏切换
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // 导航栏滚动效果
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 100);
    });

    // 导航链接点击关闭移动端菜单
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            navLinks.classList.remove('open');
        }
    });
}