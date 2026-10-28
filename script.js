/* ==========================================================
   BRASA — Burger House · script.js
   Front-end de demonstração: os dados ficam no localStorage.
   Pontos marcados com [BACKEND] serão trocados por chamadas
   à API em C# + MySQL na próxima etapa do projeto.
   ========================================================== */
'use strict';

/* ---------- Dados (trocar por GET /api/produtos) [BACKEND] ---------- */
const CATS = { burgers: 'Hambúrgueres', combos: 'Combos', sides: 'Acompanhamentos', drinks: 'Bebidas', desserts: 'Sobremesas' };
// img: nome do arquivo da foto. Para trocar a foto de um produto, altere só esta linha.
const PRODUCTS = [
  { id: 'brasa-original', name: 'Brasa Original', cat: 'burgers', price: 32.90, rating: '4,9', time: 25, img: 'p_original.jpg', desc: 'Blend 160g, queijo prato, alface, tomate e molho da casa.' },
  { id: 'double-smash', name: 'Double Smash', cat: 'burgers', price: 38.90, rating: '4,8', time: 25, img: 'p_double.jpg', desc: 'Dois smash burgers, cheddar derretido e cebola caramelizada.' },
  { id: 'bacon-fire', name: 'Bacon Fire', cat: 'burgers', price: 39.90, rating: '4,9', time: 30, img: 'p_bacon.jpg', desc: 'Bacon crocante, cheddar e molho defumado da casa.' },
  { id: 'cheddar-melt', name: 'Cheddar Melt', cat: 'burgers', price: 36.90, rating: '4,7', time: 25, img: 'p_cheddar.jpg', desc: 'Blend 160g, cheddar cremoso e cebola crispy.' },
  { id: 'bbq-supreme', name: 'BBQ Supreme', cat: 'burgers', price: 42.90, rating: '4,8', time: 30, img: 'p_bbq.jpg', desc: 'Blend 180g, barbecue artesanal e onion rings.' },
  { id: 'chicken-crispy', name: 'Chicken Crispy', cat: 'burgers', price: 34.90, rating: '4,6', time: 25, img: 'p_chicken.jpg', desc: 'Frango empanado crocante, alface e maionese defumada.' },
  { id: 'combo-brasa', name: 'Combo Brasa', cat: 'combos', price: 49.90, rating: '4,9', time: 35, img: 'combo_brasa.jpg', desc: 'Brasa Original, batata rústica e refrigerante.' },
  { id: 'combo-double', name: 'Combo Double', cat: 'combos', price: 56.90, rating: '4,9', time: 35, img: 'combo_double.jpg', desc: 'Double Smash, batata rústica e refrigerante.' },
  { id: 'batata-rustica', name: 'Batata Rústica', cat: 'sides', price: 18.90, rating: '4,8', time: 15, img: 'cat_fries.jpg', desc: 'Batatas rústicas com casca e sal grosso.' },
  { id: 'onion-rings', name: 'Onion Rings', cat: 'sides', price: 19.90, rating: '4,7', time: 15, img: 'p_onion.jpg', desc: 'Anéis de cebola empanados e bem crocantes.' },
  { id: 'nuggets', name: 'Nuggets', cat: 'sides', price: 17.90, rating: '4,6', time: 15, img: 'p_nuggets.jpg', desc: 'Nuggets de frango crocantes com molho da casa.' },
  { id: 'refrigerante-lata', name: 'Refrigerante Lata', cat: 'drinks', price: 7.90, rating: '4,8', time: 5, img: 'cat_drink.jpg', desc: 'Lata de 350 ml, bem gelada.' },
  { id: 'suco-natural', name: 'Suco Natural', cat: 'drinks', price: 10.90, rating: '4,7', time: 10, img: 'p_suco.jpg', desc: 'Suco de 300 ml feito na hora.' },
  { id: 'agua-mineral', name: 'Água Mineral', cat: 'drinks', price: 5.90, rating: '4,9', time: 5, img: 'p_agua.jpg', desc: 'Garrafa de 500 ml, sem gás.' },
  { id: 'brownie', name: 'Brownie', cat: 'desserts', price: 16.90, rating: '4,9', time: 15, img: 'cat_dessert.jpg', desc: 'Brownie de chocolate com calda quente.' },
  { id: 'milkshake', name: 'Milkshake', cat: 'desserts', price: 22.90, rating: '4,8', time: 15, img: 'p_milkshake.jpg', desc: 'Milkshake cremoso de baunilha, 400 ml.' }
];
const FEE = 5.90;               // taxa de entrega
const FREE_SHIP_MIN = 50;       // FRETEGRATIS vale a partir deste subtotal
const STATUS = ['Pendente', 'Em preparo', 'Saiu para entrega', 'Entregue'];
const NEXT_PAGES = ['index.html', 'cardapio.html', 'carrinho.html', 'pedidos.html', 'perfil.html'];

/* ---------- Utilitários ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => 'R$ ' + n.toFixed(2).replace('.', ',');
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const slug = s => norm(s).replace(/\s+/g, '-');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = id => PRODUCTS.find(p => p.id === id);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage indisponível */ } }
};
const page = document.body.dataset.page;

/* ---------- Tema claro / escuro ---------- */
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  store.set('brasa_theme', t);
  const sw = $('#themeSwitch');
  if (sw) sw.setAttribute('aria-checked', String(t === 'dark'));
}
$('#themeBtn')?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

/* ---------- Toast e modal ---------- */
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}
function openModal(html) {
  closeModal();
  const o = document.createElement('div');
  o.className = 'overlay';
  o.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(o);
  document.body.classList.add('noscroll');
  o.addEventListener('mousedown', e => { if (e.target === o) closeModal(); });
  $$('[data-close]', o).forEach(b => b.addEventListener('click', closeModal));
  return o.firstElementChild;
}
function closeModal() { $('.overlay')?.remove(); document.body.classList.remove('noscroll'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ---------- Conta (demo) [BACKEND: POST /api/login, /api/cadastro] ---------- */
const getAccount = () => store.get('brasa_account', null);
const isLogged = () => !!getAccount() && store.get('brasa_session', false);
function requireLogin() {
  if (isLogged()) return true;
  const here = location.pathname.split('/').pop() || 'index.html';
  location.href = 'login.html?next=' + encodeURIComponent(here);
  return false;
}
function safeNext() {
  const n = new URLSearchParams(location.search).get('next');
  return NEXT_PAGES.includes(n) ? n : 'index.html';
}
function renderAuth() {
  const a = $('#authArea'); if (!a) return;
  a.innerHTML = isLogged()
    ? `<a class="btn btn-ghost btn-sm" href="perfil.html">Olá, ${esc(getAccount().name.split(' ')[0])}</a>`
    : `<a class="btn btn-ghost btn-sm" href="login.html">Entrar</a><a class="btn btn-pri btn-sm" href="cadastro.html">Criar conta</a>`;
}

/* ---------- Carrinho [BACKEND: /api/carrinho] ---------- */
const getCart = () => store.get('brasa_cart', []);
function saveCart(c) { store.set('brasa_cart', c); updateCount(); }
function addToCart(id, qty = 1, note = '') {
  const c = getCart();
  const it = c.find(i => i.id === id && i.note === note);
  if (it) it.qty += qty; else c.push({ id, qty, note });
  saveCart(c);
  toast(`${byId(id).name} adicionado ao carrinho`);
}
function cartTotals() {
  const c = getCart();
  const sub = c.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
  const coupon = store.get('brasa_coupon', null);
  const disc = coupon === 'BRASA10' ? sub * 0.1 : 0;
  let fee = c.length ? FEE : 0;
  if (coupon === 'FRETEGRATIS' && sub >= FREE_SHIP_MIN) fee = 0;
  return { sub, disc, fee, total: Math.max(0, sub - disc + fee), count: c.reduce((s, i) => s + i.qty, 0) };
}
function updateCount() {
  const n = cartTotals().count;
  const a = $('#cartCount'); if (a) a.textContent = n;
  const b = $('#cartCountM'); if (b) b.textContent = n || '';
}

/* ---------- Componentes ---------- */
function cardHTML(p) {
  return `<article class="card">
    <button class="card-img" data-view="${p.id}" aria-label="Ver detalhes de ${esc(p.name)}"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"></button>
    <div class="card-body">
      <span class="meta">★ ${p.rating} · ${p.time} min</span>
      <h3 data-view="${p.id}">${esc(p.name)}</h3>
      <p>${esc(p.desc)}</p>
      <div class="card-foot"><strong class="price">${money(p.price)}</strong>
        <button class="add" data-add="${p.id}" aria-label="Adicionar ${esc(p.name)} ao carrinho">+</button></div>
    </div></article>`;
}
function openProduct(id) {
  const p = byId(id); let qty = 1;
  const m = openModal(`
    <div class="modal-top"><h2>${esc(p.name)}</h2><button class="close" data-close aria-label="Fechar">✕</button></div>
    <div class="pimg"><img src="${p.img}" alt="${esc(p.name)}"></div>
    <p class="muted">${esc(p.desc)}</p>
    <div class="qty-row"><strong class="price" style="font-size:28px">${money(p.price)}</strong>
      <div class="stepper"><button type="button" data-q="-1" aria-label="Diminuir">−</button><span id="mq">1</span><button type="button" data-q="1" aria-label="Aumentar">+</button></div></div>
    <div class="field"><label for="mnote">Observações <span class="counter" id="mnc">0/140</span></label>
      <div class="input-wrap"><input id="mnote" maxlength="140" placeholder="Ex.: sem cebola, ponto da carne bem passado"></div></div>
    <button class="btn btn-pri btn-block" id="madd">Adicionar ao carrinho · ${money(p.price)}</button>`);
  const upd = () => { $('#mq', m).textContent = qty; $('#madd', m).textContent = `Adicionar ao carrinho · ${money(p.price * qty)}`; };
  $$('[data-q]', m).forEach(b => b.addEventListener('click', () => { qty = Math.min(20, Math.max(1, qty + Number(b.dataset.q))); upd(); }));
  $('#mnote', m).addEventListener('input', e => { $('#mnc', m).textContent = `${e.target.value.length}/140`; });
  $('#madd', m).addEventListener('click', () => { addToCart(id, qty, $('#mnote', m).value.trim()); closeModal(); });
}
// Delegação: botões "+" e "ver produto" funcionam em qualquer página
document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]'); if (add) { addToCart(add.dataset.add); return; }
  const view = e.target.closest('[data-view]'); if (view) { openProduct(view.dataset.view); return; }
  const cp = e.target.closest('[data-copy]');
  if (cp) { navigator.clipboard?.writeText(cp.dataset.copy).catch(() => {}); toast(`Cupom ${cp.dataset.copy} copiado!`); }
});

/* ---------- Máscaras e validações ---------- */
const digits = s => s.replace(/\D/g, '');
const masks = {
  cpf: v => digits(v).slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
  phone: v => {
    v = digits(v).slice(0, 11);
    if (v.length > 10) return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    if (v.length > 6) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    if (v.length > 2) return v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    return v ? '(' + v : '';
  },
  birth: v => digits(v).slice(0, 8).replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2')
};
function validCPF(c) {
  c = digits(c);
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  for (let t = 9; t < 11; t++) {
    let s = 0;
    for (let i = 0; i < t; i++) s += Number(c[i]) * (t + 1 - i);
    if (((s * 10) % 11) % 10 !== Number(c[t])) return false;
  }
  return true;
}
function validDate(v) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v); if (!m) return false;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d && y >= 1900 && dt <= new Date();
}
const rules = {
  name: v => (v.trim().split(/\s+/).filter(w => w.length > 1).length >= 2 ? '' : 'Informe nome e sobrenome.'),
  cpf: v => (validCPF(v) ? '' : 'CPF inválido. Use o formato 000.000.000-00.'),
  phone: v => ([10, 11].includes(digits(v).length) ? '' : 'Telefone inválido. Use (00) 00000-0000.'),
  birth: v => (validDate(v) ? '' : 'Data inválida. Use DD/MM/AAAA.'),
  email: v => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Informe um e-mail válido. Ex.: nome@email.com'),
  password: v => (v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v) ? '' : 'Use no mínimo 8 caracteres, com letras e números.'),
  confirm: (v, f) => (v && v === f.elements.password.value ? '' : 'As senhas não conferem.'),
  loginPass: v => (v ? '' : 'Informe sua senha.'),
  address: v => (v.trim().length >= 8 ? '' : 'Informe rua, número e bairro.')
};
function checkField(f, form, show = true) {
  const inp = $('input', f), err = rules[f.dataset.field](inp.value, form);
  f.classList.toggle('is-error', show && !!err);
  f.classList.toggle('is-ok', show && !err && inp.value !== '');
  $('.msg', f).textContent = show ? (err || (inp.value ? '✓ Tudo certo' : '')) : '';
  return !err;
}
function bindForm(form, onSubmit) {
  const fields = $$('.field[data-field]', form);
  fields.forEach(f => {
    const inp = $('input', f), n = f.dataset.field, cnt = $('.counter', f);
    inp.addEventListener('input', () => {
      if (masks[n]) inp.value = masks[n](inp.value);
      if (cnt && inp.maxLength > 0) cnt.textContent = `${inp.value.length}/${inp.maxLength}`;
      if (f.dataset.touched) checkField(f, form);
      if (n === 'password' && form.elements.confirm?.value) checkField($('.field[data-field="confirm"]', form), form);
    });
    inp.addEventListener('blur', () => { f.dataset.touched = '1'; checkField(f, form); });
    $('.toggle-pass', f)?.addEventListener('click', e => {
      inp.type = inp.type === 'password' ? 'text' : 'password';
      e.target.textContent = inp.type === 'password' ? 'Mostrar' : 'Ocultar';
    });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    fields.forEach(f => { f.dataset.touched = '1'; if (!checkField(f, form)) ok = false; });
    if (!ok) { $('.is-error input', form)?.focus(); return; }
    onSubmit(form);
  });
}

/* ---------- Páginas ---------- */
function initHome() {
  $('#featured').innerHTML = PRODUCTS.slice(0, 4).map(cardHTML).join('');
}

function initMenu() {
  const qs = new URLSearchParams(location.search);
  let cat = CATS[qs.get('cat')] ? qs.get('cat') : 'all', q = qs.get('q') || '';
  const input = $('#q'), grid = $('#grid'), empty = $('#empty');
  input.value = q;
  function draw() {
    const list = PRODUCTS.filter(p => (cat === 'all' || p.cat === cat) && (!q || norm(p.name + ' ' + p.desc).includes(norm(q))));
    grid.innerHTML = list.map(cardHTML).join('');
    grid.hidden = !list.length; empty.hidden = list.length > 0;
    $('#count').textContent = list.length ? `${list.length} ${list.length === 1 ? 'produto' : 'produtos'}` : '';
    $$('.chip').forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
  }
  $$('.chip').forEach(c => c.addEventListener('click', () => { cat = c.dataset.cat; draw(); }));
  input.addEventListener('input', () => { q = input.value.trim(); draw(); });
  $('#clear').addEventListener('click', () => { cat = 'all'; q = ''; input.value = ''; draw(); input.focus(); });
  draw();
}

function initAuth(kind) {
  const form = $(kind === 'login' ? '#loginForm' : '#regForm');
  const err = $('#formError');
  bindForm(form, f => {
    err.hidden = true;
    if (kind === 'login') {
      const acc = getAccount(), email = f.elements.email.value.trim().toLowerCase();
      if (!acc) { err.textContent = 'Nenhuma conta encontrada neste navegador. Crie sua conta primeiro.'; err.hidden = false; return; }
      if (acc.email !== email || acc.password !== f.elements.password.value) { err.textContent = 'E-mail ou senha incorretos.'; err.hidden = false; return; }
      store.set('brasa_session', true);
      location.href = safeNext();
    } else {
      // [BACKEND] a senha deve ser enviada por HTTPS e guardada com hash (ex.: BCrypt) no MySQL
      store.set('brasa_account', {
        name: f.elements.name.value.trim().replace(/\s+/g, ' '), cpf: f.elements.cpf.value, phone: f.elements.phone.value,
        birth: f.elements.birth.value, email: f.elements.email.value.trim().toLowerCase(), password: f.elements.password.value, address: ''
      });
      store.set('brasa_session', true);
      location.href = safeNext();
    }
  });
}

/* Carrinho + checkout em modais */
function initCart() {
  const layout = $('#cartLayout'), empty = $('#cartEmpty');
  function draw() {
    const cart = getCart(), t = cartTotals();
    layout.hidden = !cart.length; empty.hidden = cart.length > 0;
    $('#cartTitleCount').textContent = cart.length ? `${t.count} ${t.count === 1 ? 'item' : 'itens'}` : '';
    $('#items').innerHTML = cart.map((it, i) => {
      const p = byId(it.id);
      return `<article class="item"><div class="item-img"><img src="${p.img}" alt="${esc(p.name)}"></div>
        <div><h3>${esc(p.name)}</h3><div class="unit">${money(p.price)} cada</div>${it.note ? `<div class="note">Obs.: ${esc(it.note)}</div>` : ''}</div>
        <div class="stepper"><button data-act="dec" data-i="${i}" aria-label="Diminuir quantidade">−</button><span>${it.qty}</span><button data-act="inc" data-i="${i}" aria-label="Aumentar quantidade">+</button></div>
        <div class="item-end"><strong>${money(p.price * it.qty)}</strong><button class="rm" data-act="rm" data-i="${i}">Remover</button></div></article>`;
    }).join('');
    $('#sub').textContent = money(t.sub);
    $('#discRow').hidden = !t.disc; $('#disc').textContent = '− ' + money(t.disc);
    $('#fee').textContent = t.fee ? money(t.fee) : 'Grátis';
    $('#total').textContent = money(t.total);
  }
  $('#items').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const c = getCart(), i = Number(b.dataset.i);
    if (b.dataset.act === 'inc') c[i].qty = Math.min(20, c[i].qty + 1);
    if (b.dataset.act === 'dec') c[i].qty = Math.max(1, c[i].qty - 1);
    if (b.dataset.act === 'rm') c.splice(i, 1);
    saveCart(c); draw();
  });
  const msg = $('#couponMsg'), cin = $('#couponIn');
  const applied = store.get('brasa_coupon', null);
  if (applied) { cin.value = applied; msg.textContent = `Cupom ${applied} aplicado.`; msg.className = 'coupon-msg ok'; }
  $('#couponForm').addEventListener('submit', e => {
    e.preventDefault();
    const code = cin.value.trim().toUpperCase(), t = cartTotals();
    if (!code) { store.set('brasa_coupon', null); msg.textContent = ''; draw(); return; }
    if (code === 'FRETEGRATIS' && t.sub < FREE_SHIP_MIN) { msg.textContent = `FRETEGRATIS vale para pedidos a partir de ${money(FREE_SHIP_MIN)}.`; msg.className = 'coupon-msg err'; return; }
    if (!['BRASA10', 'FRETEGRATIS'].includes(code)) { msg.textContent = 'Cupom inválido.'; msg.className = 'coupon-msg err'; return; }
    store.set('brasa_coupon', code); msg.textContent = `Cupom ${code} aplicado.`; msg.className = 'coupon-msg ok'; draw();
  });
  $('#checkout').addEventListener('click', () => { if (getCart().length && requireLogin()) openConfirm(); });
  draw();
}

function openConfirm() {
  const t = cartTotals(), cart = getCart(), acc = getAccount();
  const m = openModal(`
    <div class="modal-top"><h2>Confirmar pedido</h2><button class="close" data-close aria-label="Fechar">✕</button></div>
    <div class="sec-t">Resumo do pedido</div>
    ${cart.map(i => `<div class="mrow"><span>${i.qty}× ${esc(byId(i.id).name)}</span><b>${money(byId(i.id).price * i.qty)}</b></div>`).join('')}
    ${t.disc ? `<div class="mrow"><span>Desconto (${esc(store.get('brasa_coupon', ''))})</span><b>− ${money(t.disc)}</b></div>` : ''}
    <div class="mrow"><span>Taxa de entrega</span><b>${t.fee ? money(t.fee) : 'Grátis'}</b></div>
    <div class="sec-t">Endereço de entrega</div>
    <div class="field" data-field="address"><div class="input-wrap"><input id="maddr" aria-label="Endereço de entrega" placeholder="Rua, número, bairro, cidade" value="${esc(acc.address || '')}" maxlength="120"></div><p class="msg" role="alert"></p></div>
    <div class="sec-t">Forma de pagamento (demonstrativa)</div>
    <div class="pay"><label><input type="radio" name="pay" value="PIX" checked><span>PIX</span></label>
      <label><input type="radio" name="pay" value="Cartão"><span>Cartão</span></label>
      <label><input type="radio" name="pay" value="Dinheiro na entrega"><span>Dinheiro</span></label></div>
    <div class="mtotal"><span>Total</span><b>${money(t.total)}</b></div>
    <div class="modal-btns"><button class="btn btn-ghost" data-close>Voltar</button><button class="btn btn-pri" id="confirmBtn">Confirmar pedido</button></div>`);
  $('#confirmBtn', m).addEventListener('click', () => {
    const f = $('.field', m), inp = $('#maddr', m), err = rules.address(inp.value);
    f.classList.toggle('is-error', !!err); $('.msg', f).textContent = err;
    if (err) { inp.focus(); return; }
    // [BACKEND] POST /api/pedidos
    const seq = store.get('brasa_seq', 1042) + 1; store.set('brasa_seq', seq);
    const order = {
      number: '#BR-' + seq, date: new Date().toISOString(), status: 'Pendente',
      items: cart.map(i => ({ id: i.id, qty: i.qty, note: i.note, name: byId(i.id).name, price: byId(i.id).price, img: byId(i.id).img })),
      sub: t.sub, disc: t.disc, fee: t.fee, total: t.total, address: inp.value.trim(), payment: $('input[name="pay"]:checked', m).value
    };
    store.set('brasa_orders', [order, ...store.get('brasa_orders', [])]);
    if (!acc.address) store.set('brasa_account', { ...acc, address: order.address });
    saveCart([]); store.set('brasa_coupon', null);
    openModal(`<div class="success" style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
      <div class="ok-ic" style="width:88px;height:88px;border-radius:50%;display:grid;place-items:center;font-size:44px;color:var(--ok);border:2px solid var(--ok)">✓</div>
      <h2>Pedido realizado com sucesso</h2><p class="muted">Número do pedido</p><div class="num" style="font:700 36px 'Space Grotesk',sans-serif;color:var(--pri)">${order.number}</div>
      <p>Previsão de entrega: 30–40 min</p><a class="btn btn-pri btn-block" href="pedidos.html">Ver meus pedidos</a></div>`);
  });
}

/* Meus pedidos */
const fmtDate = iso => { const d = new Date(iso); return d.toLocaleDateString('pt-BR') + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };
function initOrders() {
  if (!requireLogin()) return;
  let filter = 'Todos';
  const list = $('#orders'), empty = $('#ordersEmpty'), none = $('#ordersNone');
  const chips = ['Todos', ...STATUS, 'Cancelado'];
  $('#statusChips').innerHTML = chips.map(s => `<button class="chip" data-s="${s}">${s}</button>`).join('');
  function draw() {
    const all = store.get('brasa_orders', []), shown = all.filter(o => filter === 'Todos' || o.status === filter);
    $('#statusChips').hidden = !all.length; empty.hidden = all.length > 0;
    none.hidden = !all.length || shown.length > 0;
    $$('.chip', $('#statusChips')).forEach(c => c.classList.toggle('active', c.dataset.s === filter));
    list.innerHTML = shown.map(o => `<article class="order"><div class="order-top"><div><h3>Pedido ${o.number}</h3><span class="date">${fmtDate(o.date)}</span></div><span class="badge st-${slug(o.status)}">${o.status}</span></div>
      <div class="order-mid"><div class="thumbs">${o.items.slice(0, 3).map(i => `<img src="${i.img}" alt="">`).join('')}</div>
      <p>${o.items.map(i => `${i.qty}× ${esc(i.name)}`).join('<br>')}</p></div>
      <div class="order-bot"><div><small>Total</small><strong>${money(o.total)}</strong></div><button class="btn btn-soft btn-sm" data-det="${o.number}">Ver detalhes</button></div></article>`).join('');
  }
  $('#statusChips').addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) { filter = c.dataset.s; draw(); } });
  list.addEventListener('click', e => { const b = e.target.closest('[data-det]'); if (b) details(b.dataset.det); });
  function details(num) {
    const orders = store.get('brasa_orders', []), o = orders.find(x => x.number === num), idx = STATUS.indexOf(o.status);
    const m = openModal(`
      <div class="modal-top"><h2>Pedido ${o.number}</h2><button class="close" data-close aria-label="Fechar">✕</button></div>
      <div style="display:flex;gap:12px;align-items:center"><span class="badge st-${slug(o.status)}">${o.status}</span><span class="muted">${fmtDate(o.date)}</span></div>
      ${o.status === 'Cancelado' ? '<p class="muted">Este pedido foi cancelado.</p>' : `<div class="timeline">${STATUS.map((s, i) => `<div class="${i <= idx ? 'done' : ''}"><i></i>${s}</div>`).join('')}</div>`}
      ${o.items.map(i => `<div class="mrow"><span>${i.qty}× ${esc(i.name)}${i.note ? ` <small>(${esc(i.note)})</small>` : ''}</span><b>${money(i.price * i.qty)}</b></div>`).join('')}
      ${o.disc ? `<div class="mrow"><span>Desconto</span><b>− ${money(o.disc)}</b></div>` : ''}
      <div class="mrow"><span>Taxa de entrega</span><b>${o.fee ? money(o.fee) : 'Grátis'}</b></div>
      <div class="mtotal"><span>Total</span><b>${money(o.total)}</b></div>
      <p class="muted">Endereço: ${esc(o.address)}<br>Pagamento: ${esc(o.payment)} (demonstrativo)</p>
      <div class="modal-btns">${o.status === 'Pendente' ? '<button class="btn btn-danger" id="cancelO">Cancelar pedido</button>' : ''}
        ${idx > -1 && idx < STATUS.length - 1 ? '<button class="btn btn-soft" id="advO">Avançar status (demo)</button>' : ''}
        <button class="btn btn-ghost" data-close>Fechar</button></div>`);
    const save = () => { store.set('brasa_orders', orders); draw(); details(num); };
    $('#cancelO', m)?.addEventListener('click', () => { o.status = 'Cancelado'; save(); });
    $('#advO', m)?.addEventListener('click', () => { o.status = STATUS[idx + 1]; save(); });
  }
  draw();
}

/* Perfil */
function initProfile() {
  if (!requireLogin()) return;
  const acc = getAccount(), form = $('#profileForm');
  const map = { name: 'name', cpf: 'cpf', phone: 'phone', birth: 'birth', email: 'email', address: 'address' };
  const fill = () => { Object.keys(map).forEach(k => { form.elements[k].value = getAccount()[k] || ''; }); };
  const setEdit = on => {
    $$('input', form).forEach(i => { i.disabled = !on; });
    $('#editBtn').hidden = on; $('#cancelBtn').hidden = !on; $('#saveBtn').hidden = !on;
    $$('.field', form).forEach(f => { f.classList.remove('is-error', 'is-ok'); $('.msg', f).textContent = ''; });
    $('#pTitle').textContent = on ? 'Editar dados' : 'Meus dados';
    if (on) $('input', form).focus();
  };
  $('#pName').textContent = acc.name; $('#pEmail').textContent = acc.email;
  $('#avatar').textContent = acc.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  fill(); setEdit(false);
  $('#editBtn').addEventListener('click', () => setEdit(true));
  $('#cancelBtn').addEventListener('click', () => { fill(); setEdit(false); });
  bindForm(form, f => {
    // [BACKEND] PUT /api/usuarios/{id}
    const a = getAccount();
    store.set('brasa_account', { ...a, name: f.elements.name.value.trim(), cpf: f.elements.cpf.value, phone: f.elements.phone.value, birth: f.elements.birth.value, email: f.elements.email.value.trim().toLowerCase(), address: f.elements.address.value.trim() });
    $('#pName').textContent = f.elements.name.value.trim(); $('#pEmail').textContent = f.elements.email.value;
    setEdit(false); toast('Dados atualizados com sucesso'); renderAuth();
  });
  $('#themeSwitch').setAttribute('aria-checked', String(document.documentElement.dataset.theme === 'dark'));
  $('#themeSwitch').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('#logout').addEventListener('click', () => { store.set('brasa_session', false); location.href = 'index.html'; });
}

/* ---------- Inicialização ---------- */
(function init() {
  $$('[data-nav]').forEach(a => { if (a.dataset.nav === ({ home: 'home', cardapio: 'cardapio', carrinho: 'carrinho', pedidos: 'pedidos', perfil: 'perfil' })[page]) a.setAttribute('aria-current', 'page'); });
  renderAuth(); updateCount();
  const sw = $('#themeSwitch'); if (sw) sw.setAttribute('aria-checked', String(document.documentElement.dataset.theme === 'dark'));
  if (page === 'home') initHome();
  if (page === 'cardapio') initMenu();
  if (page === 'login') initAuth('login');
  if (page === 'cadastro') initAuth('cadastro');
  if (page === 'carrinho') initCart();
  if (page === 'pedidos') initOrders();
  if (page === 'perfil') initProfile();
})();
