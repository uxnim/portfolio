const viewer = document.querySelector('#viewer');
const content = document.querySelector('#viewer-content');
let opener = null;
document.querySelectorAll('[data-image], [data-diagram]').forEach(button => button.addEventListener('click', () => {
    if (!viewer || !content)
        return;
    opener = button;
    content.replaceChildren();
    if (button.dataset.image) {
        const img = document.createElement('img');
        img.src = button.dataset.image;
        img.alt = button.dataset.alt || '';
        content.append(img);
        viewer.dataset.kind = 'image';
    }
    else {
        const diagram = button.closest('.architecture')?.cloneNode(true);
        if (diagram) {
            diagram.querySelector('button')?.remove();
            content.append(diagram);
        }
        viewer.dataset.kind = 'diagram';
    }
    viewer.showModal();
    document.body.classList.add('modal-open');
}));
document.querySelector('[data-close]')?.addEventListener('click', () => viewer?.close());
viewer?.addEventListener('close', () => { document.body.classList.remove('modal-open'); opener?.focus(); });
viewer?.addEventListener('click', e => { if (e.target === viewer) {
    const r = viewer.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
        viewer.close();
} });
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
if (!reduce.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) {
        e.target.classList.add('in-view');
        observer.unobserve(e.target);
    } }), { threshold: 0.08 });
    document.querySelectorAll('.project-row, .case-section, .about').forEach(el => observer.observe(el));
}
const indexLinks = [...document.querySelectorAll('.case-index a')];
if (indexLinks.length) {
    const indexObserver = new IntersectionObserver(entries => { for (const e of entries)
        if (e.isIntersecting) {
            indexLinks.forEach(a => { if (a.hash === '#' + e.target.id)
                a.setAttribute('aria-current', 'location');
            else
                a.removeAttribute('aria-current'); });
        } }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('.case-section').forEach(s => indexObserver.observe(s));
}
const shareButton = document.querySelector('[data-share]');
const shareLabel = document.querySelector('[data-share-label]');
const shareStatus = document.querySelector('#share-status');
const shareDialog = document.querySelector('#share-dialog');
const shareUrlInput = document.querySelector('#share-url');
let shareFeedbackTimer;
function shareFeedback(message, label = 'Share') {
    clearTimeout(shareFeedbackTimer);
    if (shareLabel)
        shareLabel.textContent = label;
    if (shareStatus)
        shareStatus.textContent = message;
    shareFeedbackTimer = setTimeout(() => {
        if (shareLabel)
            shareLabel.textContent = 'Share';
        if (shareStatus)
            shareStatus.textContent = '';
    }, 3500);
}
if (shareButton && shareDialog && shareUrlInput) {
    shareButton.hidden = false;
    shareDialog.addEventListener('close', () => {
        document.body.classList.remove('modal-open');
        shareButton.focus({ preventScroll: true });
    });
    shareButton.addEventListener('click', async () => {
        if (shareButton.disabled)
            return;
        shareButton.disabled = true;
        shareFeedback('');
        const url = new URL(document.querySelector('link[rel="canonical"]')?.href || location.href);
        url.search = '';
        url.hash = '';
        const data = { title: document.title, text: '강민수의 포트폴리오입니다.', url: url.href };
        try {
            if (typeof navigator.share === 'function') {
                try {
                    if (!navigator.canShare || navigator.canShare(data)) {
                        await navigator.share(data);
                        shareFeedback('공유 창을 열었습니다.');
                        return;
                    }
                }
                catch (error) {
                    // Closing the native sheet is a cancellation, not a request to copy the link.
                    if (error instanceof DOMException && error.name === 'AbortError')
                        return;
                }
            }
            try {
                if (!navigator.clipboard?.writeText)
                    throw new Error('Clipboard unavailable');
                await navigator.clipboard.writeText(data.url);
                shareFeedback('포트폴리오 링크를 복사했습니다.', '링크 복사됨');
            }
            catch {
                shareUrlInput.value = data.url;
                shareDialog.showModal();
                document.body.classList.add('modal-open');
                shareUrlInput.focus();
                shareUrlInput.select();
            }
        }
        finally {
            shareButton.disabled = false;
        }
    });
}
// Start the hero entrance only once Pretendard is in, so the name never swaps fonts mid-motion.
const hero = document.querySelector('.home-hero');
if (hero) {
    const go = () => hero.classList.add('is-go');
    const fallback = setTimeout(go, 1200);
    document.fonts.load('400 1em Pretendard').then(() => { clearTimeout(fallback); go(); }, go);
}
export {};
