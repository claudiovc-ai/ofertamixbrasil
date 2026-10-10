
let all = [];

const $ = s => document.querySelector(s);

const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}[m]));

function render(list) {
  $('#count').textContent = `${list.length} produtos`;

  $('#products').innerHTML = list.map(p => {
    const rawImage = p.image || (Array.isArray(p.images) ? p.images[0] : '');
    const image = /^https?:\/\//i.test(rawImage) ? rawImage : '';

    return `
      <article class="card">
        <div class="product-photo" style="position:relative;width:100%;height:220px;background:#f5f5f5;overflow:hidden;">
          <img
            src="${esc(image)}"
            alt="${esc(p.name || 'Produto em oferta')}"
            loading="lazy"
            decoding="async"
            style="width:100%;height:100%;object-fit:contain;display:${image ? 'block' : 'none'};"
            onerror="this.style.display='none';this.nextElementSibling.style.display='grid';"
          >
          <div class="pic" style="width:100%;height:100%;display:${image ? 'none' : 'grid'};place-items:center;">
            FOTO EM BREVE
          </div>
        </div>

        <div class="body">
          <h3>${esc(p.name || 'Produto em oferta')}</h3>
          <p>${esc(p.description || '')}</p>
          ${p.price ? `<strong>${esc(p.price)}</strong>` : ''}
          <a
            class="buy"
            target="_blank"
            rel="nofollow sponsored noopener"
            href="${esc(p.affiliate || p.url || '#')}"
          >VER OFERTA</a>
        </div>
      </article>
    `;
  }).join('') || '<div class="panel">Nenhuma oferta encontrada.</div>';
}

function setupCats() {
  const cats = ['Todos', ...new Set(all.map(p => p.category).filter(Boolean))];

  $('#countCat').textContent = `${cats.length - 1} categorias`;

  $('#cats').innerHTML = cats.map(c =>
    `<button class="cat" data-cat="${esc(c)}">${esc(c)}</button>`
  ).join('');

  document.querySelectorAll('.cat').forEach(b => {
    b.onclick = () => {
      const category = b.dataset.cat;
      const filtered = category === 'Todos'
        ? all
        : all.filter(p => p.category === category);

      render(filtered);
    };
  });
}

fetch('products.json')
  .then(response => {
    if (!response.ok) throw new Error('Erro ao carregar produtos');
    return response.json();
  })
  .then(data => {
    all = Array.isArray(data) ? data : [];
    setupCats();
    render(all);
  })
  .catch(() => {
    $('#products').innerHTML =
      '<div class="panel">Não foi possível carregar o catálogo. Tente novamente mais tarde.</div>';
  });

$('#searchForm').addEventListener('submit', event => {
  event.preventDefault();

  const q = $('#search').value.trim().toLowerCase();

  render(all.filter(p =>
    `${p.name || ''} ${p.description || ''} ${p.category || ''}`
      .toLowerCase()
      .includes(q)
  ));
});
