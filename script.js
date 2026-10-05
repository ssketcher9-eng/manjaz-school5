const sections = [
  ['أبرز المنجزات','▤','#works','#add','إضافة'],
  ['الورش التدريبية','▧','#lessons','#add','إضافة'],
  ['الدروس التطبيقية','▣','#lessons','#add','إضافة'],
  ['التكريمات والحوافز','◇','#awards','#awards','عرض'],
  ['الشراكات','◎','#partners','#partners','عرض'],
  ['التقارير والإحصاءات','◔','#reports','#reports','عرض']
];
const homeSections = document.getElementById('homeSections');
homeSections.innerHTML = sections.map(s => `
  <article class="section-card">
    <h2><span>${s[1]}</span>${s[0]}</h2>
    <div class="section-actions">
      <a class="outline" href="${s[2]}">استعراض</a>
      <a class="fill" href="${s[3]}">${s[4]}</a>
    </div>
  </article>`).join('');

const pages = [...document.querySelectorAll('.page')];
const navLinks = [...document.querySelectorAll('nav a')];
function showPage(id){
  pages.forEach(p => p.classList.toggle('active-page', p.id === id));
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+id));
  document.getElementById('sidebar').classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
}
window.addEventListener('hashchange', () => showPage(location.hash.slice(1) || 'home'));
navLinks.forEach(a => a.addEventListener('click', e => { e.preventDefault(); location.hash = a.getAttribute('href').slice(1); }));
showPage(location.hash.slice(1) || 'home');

document.getElementById('menu').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

let works = JSON.parse(localStorage.getItem('manjazWorks') || '[]');
function renderWorks(){
  const q = (document.getElementById('search').value || '').trim().toLowerCase();
  const f = document.getElementById('filter').value;
  const filtered = works.filter(w => (!q || `${w.title} ${w.owner} ${w.description}`.toLowerCase().includes(q)) && (f === 'all' || w.category === f));
  document.getElementById('allWorks').innerHTML = filtered.length ? filtered.map(w => `<article class="card"><span class="tag">${w.category}</span><h3>${w.title}</h3><p>${w.description || 'بدون وصف.'}</p><small>${w.date || ''}${w.owner ? ' · '+w.owner : ''}</small></article>`).join('') : '<div class="empty">لا توجد منجزات مطابقة حاليًا.</div>';
  document.getElementById('totalCount').textContent = works.length;
}

document.getElementById('achievementForm').addEventListener('submit', e => {
  e.preventDefault();
  works.unshift({title:title.value,category:category.value,date:date.value,owner:owner.value,description:description.value});
  localStorage.setItem('manjazWorks', JSON.stringify(works));
  e.target.reset(); renderWorks(); location.hash='works';
});
document.getElementById('search').addEventListener('input', renderWorks);
document.getElementById('filter').addEventListener('change', renderWorks);
renderWorks();
