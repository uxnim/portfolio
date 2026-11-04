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
export {};
