const SUPABASE_URL = 'https://jwsvfrqjmklanrcwviyr.supabase.co';const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_SJ4ZYyJa0oCnPygbUPTiHw_-MXnOANX';

(async function () {
  const { createClient } = await import(
    'https://esm.sh/@supabase/supabase-js@2'
  );

  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  window.manjazSupabase = supabase;

  const state = {
    user: null,
    role: 'guest',
    profile: null,
    works: []
  };

  /* =========================
     أدوات عامة
  ========================= */

  const $ = (selector) => document.querySelector(selector);

  function escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* =========================
     الأقسام الرئيسية
  ========================= */

  const sections = [
    ['أبرز المنجزات', '▤', '#works', '#add', 'إضافة'],
    ['الورش التدريبية', '▧', '#lessons', '#add', 'إضافة'],
    ['الدروس التطبيقية', '▣', '#lessons', '#add', 'إضافة'],
    ['التكريمات والحوافز', '◇', '#awards', '#awards', 'عرض'],
    ['الشراكات', '◎', '#partners', '#partners', 'عرض'],
    ['التقارير والإحصاءات', '◔', '#reports', '#reports', 'عرض']
  ];

  const homeSections = $('#homeSections');

  if (homeSections) {
    homeSections.innerHTML = sections.map(s => `
      <article class="section-card">
        <h2><span>${s[1]}</span>${s[0]}</h2>
        <div class="section-actions">
          <a class="outline" href="${s[2]}">استعراض</a>
          <a class="fill" href="${s[3]}">${s[4]}</a>
        </div>
      </article>
    `).join('');
  }

  /* =========================
     نظام التنقل
  ========================= */

  const pages = [...document.querySelectorAll('.page')];
  const navLinks = [...document.querySelectorAll('nav a')];

  function showPage(id) {
    const allowedAdminPage =
      (id === 'admin' || id === 'settings') &&
      state.role !== 'admin';

    if (allowedAdminPage) {
      id = 'home';
    }

    pages.forEach(page => {
      page.classList.toggle('active-page', page.id === id);
    });

    navLinks.forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === '#' + id
      );
    });

    const sidebar = $('#sidebar');

    if (sidebar) {
      sidebar.classList.remove('open');
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function goToPage(id) {
    location.hash = id;
  }

  window.addEventListener('hashchange', () => {
    showPage(location.hash.slice(1) || 'home');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);

      if (id === 'add' && !state.user) {
        e.preventDefault();
        openAuthModal('login');
        return;
      }

      if (
        (id === 'admin' || id === 'settings') &&
        state.role !== 'admin'
      ) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      location.hash = id;
    });
  });

  const menuButton = $('#menu');

  if (menuButton) {
    menuButton.addEventListener('click', () => {
      $('#sidebar')?.classList.toggle('open');
    });
  }

  /* =========================
     واجهة تسجيل الدخول
  ========================= */

  const authStyle = document.createElement('style');

  authStyle.textContent = `
    .manjaz-auth-box {
      display:flex;
      align-items:center;
      gap:8px;
      flex-wrap:wrap;
    }

    .manjaz-auth-btn {
      border:0;
      border-radius:10px;
      padding:9px 14px;
      cursor:pointer;
      font-family:inherit;
      font-size:14px;
    }

    .manjaz-login-btn {
      background:#1f2937;
      color:#fff;
    }

    .manjaz-logout-btn {
      background:#eee;
      color:#222;
    }

    .manjaz-user-name {
      font-size:13px;
      color:#555;
      max-width:220px;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    .manjaz-auth-modal {
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.55);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:99999;
      padding:20px;
    }

    .manjaz-auth-modal[hidden] {
      display:none;
    }

    .manjaz-auth-card {
      width:min(430px,100%);
      background:#fff;
      border-radius:18px;
      padding:25px;
      box-shadow:0 20px 60px rgba(0,0,0,.25);
      direction:rtl;
    }

    .manjaz-auth-card h2 {
      margin-top:0;
      margin-bottom:8px;
    }

    .manjaz-auth-card p {
      color:#666;
      font-size:14px;
      line-height:1.7;
    }

    .manjaz-auth-card label {
      display:block;
      margin:13px 0;
      font-size:14px;
    }

    .manjaz-auth-card input {
      width:100%;
      box-sizing:border-box;
      margin-top:6px;
      padding:11px;
      border:1px solid #ddd;
      border-radius:9px;
      font-family:inherit;
    }

    .manjaz-auth-submit {
      width:100%;
      border:0;
      padding:12px;
      border-radius:10px;
      background:#1f2937;
      color:#fff;
      cursor:pointer;
      font-family:inherit;
      margin-top:8px;
    }

    .manjaz-auth-switch {
      border:0;
      background:none;
      color:#555;
      cursor:pointer;
      font-family:inherit;
      margin-top:12px;
      text-decoration:underline;
    }

    .manjaz-auth-close {
      float:left;
      border:0;
      background:none;
      font-size:22px;
      cursor:pointer;
    }

    .manjaz-auth-message {
      margin-top:12px;
      font-size:13px;
      line-height:1.7;
    }

    .manjaz-auth-error {
      color:#b42318;
    }

    .manjaz-auth-success {
      color:#087443;
    }

    .admin-delete-btn {
      border:0;
      border-radius:8px;
      padding:7px 10px;
      cursor:pointer;
      background:#f3d6d6;
      color:#8b1e1e;
      font-family:inherit;
      margin-top:10px;
    }

    .admin-manager {
      margin-top:25px;
    }

    .admin-manager-list {
      display:grid;
      gap:12px;
      margin-top:15px;
    }

    .admin-manager-item {
      padding:15px;
      border:1px solid #ddd;
      border-radius:12px;
      background:#fff;
    }

    .admin-manager-item h4 {
      margin:0 0 6px;
    }

    .admin-manager-item small {
      color:#777;
    }
  `;

  document.head.appendChild(authStyle);

  document.body.insertAdjacentHTML(
    'beforeend',
    `
      <div id="authModal" class="manjaz-auth-modal" hidden>
        <div class="manjaz-auth-card">
          <button
            id="authClose"
            class="manjaz-auth-close"
            type="button"
          >×</button>

          <h2 id="authTitle">تسجيل الدخول</h2>

          <p id="authDescription">
            سجلي الدخول لإضافة منجزاتك إلى الموقع.
          </p>

          <form id="authForm">

            <label id="authNameWrap" hidden>
              الاسم
              <input
                id="authName"
                type="text"
                autocomplete="name"
              >
            </label>

            <label>
              البريد الإلكتروني
              <input
                id="authEmail"
                type="email"
                autocomplete="email"
                required
              >
            </label>

            <label>
              كلمة المرور
              <input
                id="authPassword"
                type="password"
                autocomplete="current-password"
                minlength="6"
                required
              >
            </label>

            <button
              id="authSubmit"
              class="manjaz-auth-submit"
              type="submit"
            >
              تسجيل الدخول
            </button>

          </form>

          <div
            id="authMessage"
            class="manjaz-auth-message"
          ></div>

          <button
            id="authSwitch"
            class="manjaz-auth-switch"
            type="button"
          >
            إنشاء حساب جديد
          </button>
        </div>
      </div>
    `
  );

  let authMode = 'login';

  function openAuthModal(mode = 'login') {
    authMode = mode;

    const modal = $('#authModal');
    const title = $('#authTitle');
    const description = $('#authDescription');
    const nameWrap = $('#authNameWrap');
    const submit = $('#authSubmit');
    const switchButton = $('#authSwitch');
    const message = $('#authMessage');

    message.textContent = '';
    message.className = 'manjaz-auth-message';

    if (authMode === 'signup') {
      title.textContent = 'إنشاء حساب';
      description.textContent =
        'أنشئي حسابك كعضوة لإضافة منجزاتك إلى الموقع.';
      nameWrap.hidden = false;
      submit.textContent = 'إنشاء الحساب';
      switchButton.textContent = 'لدي حساب بالفعل';
    } else {
      title.textContent = 'تسجيل الدخول';
      description.textContent =
        'سجلي الدخول لإضافة منجزاتك إلى الموقع.';
      nameWrap.hidden = true;
      submit.textContent = 'تسجيل الدخول';
      switchButton.textContent = 'إنشاء حساب جديد';
    }

    modal.hidden = false;
    setTimeout(() => $('#authEmail')?.focus(), 50);
  }

  function closeAuthModal() {
    $('#authModal').hidden = true;
  }

  $('#authClose').addEventListener('click', closeAuthModal);

  $('#authModal').addEventListener('click', e => {
    if (e.target.id === 'authModal') {
      closeAuthModal();
    }
  });

  $('#authSwitch').addEventListener('click', () => {
    openAuthModal(
      authMode === 'login'
        ? 'signup'
        : 'login'
    );
  });

  /* =========================
     زر الحساب في الهيدر
  ========================= */

  const headerActions =
    document.querySelector('.head-actions');

  const authBox = document.createElement('div');

  authBox.id = 'manjazAuthBox';
  authBox.className = 'manjaz-auth-box';

  if (headerActions) {
    headerActions.prepend(authBox);
  }

  function renderAuthUI() {
    if (!authBox) return;

    if (!state.user) {
      authBox.innerHTML = `
        <button
          class="manjaz-auth-btn manjaz-login-btn"
          id="openLoginButton"
          type="button"
        >
          تسجيل الدخول
        </button>
      `;

      $('#openLoginButton')?.addEventListener(
        'click',
        () => openAuthModal('login')
      );

      return;
    }

    const email = escapeHTML(
      state.user.email || ''
    );

    const roleText =
      state.role === 'admin'
        ? 'مديرة'
        : 'عضوة';

    authBox.innerHTML = `
      <span class="manjaz-user-name">
        ${email} · ${roleText}
      </span>

      <button
        class="manjaz-auth-btn manjaz-logout-btn"
        id="logoutButton"
        type="button"
      >
        تسجيل الخروج
      </button>
    `;

    $('#logoutButton')?.addEventListener(
      'click',
      async () => {
        await supabase.auth.signOut();
      }
    );
  }

  /* =========================
     صلاحيات الأعضاء والمديرات
  ========================= */

  function applyAccessControl() {
    const isAdmin = state.role === 'admin';

    const adminNav =
      document.querySelector('nav a[href="#admin"]');

    const settingsNav =
      document.querySelector('nav a[href="#settings"]');

    if (adminNav) {
      adminNav.style.display =
        isAdmin ? '' : 'none';
    }

    if (settingsNav) {
      settingsNav.style.display =
        isAdmin ? '' : 'none';
    }

    const currentPage =
      location.hash.slice(1) || 'home';

    if (
      (currentPage === 'admin' ||
        currentPage === 'settings') &&
      !isAdmin
    ) {
      goToPage('home');
    }

    renderAdminPanel();
  }

  /* =========================
     معرفة المستخدم الحالي
  ========================= */

  async function loadCurrentUser() {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    state.user = session?.user || null;
    state.role = 'guest';
    state.profile = null;

    if (state.user) {
      const {
        data: profile,
        error
      } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', state.user.id)
        .maybeSingle();

      if (!error && profile) {
        state.profile = profile;
        state.role = profile.role || 'member';
      } else {
        state.role = 'member';
      }
    }

    renderAuthUI();
    applyAccessControl();
  }

  /* =========================
     تسجيل الدخول / التسجيل
  ========================= */

  $('#authForm').addEventListener(
    'submit',
    async e => {
      e.preventDefault();

      const email =
        $('#authEmail').value.trim();

      const password =
        $('#authPassword').value;

      const message =
        $('#authMessage');

      const submit =
        $('#authSubmit');

      message.className =
        'manjaz-auth-message';

      message.textContent =
        'جارٍ التنفيذ...';

      submit.disabled = true;

      try {
        if (authMode === 'signup') {
          const name =
            $('#authName').value.trim();

          if (!name) {
            throw new Error(
              'اكتبي الاسم أولًا.'
            );
          }

          const {
            data,
            error
          } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name
              }
            }
          });

          if (error) {
            throw error;
          }

          if (data.session) {
            message.className =
              'manjaz-auth-message manjaz-auth-success';

            message.textContent =
              'تم إنشاء الحساب وتسجيل الدخول.';

            await loadCurrentUser();

            setTimeout(() => {
              closeAuthModal();
            }, 800);
          } else {
            message.className =
              'manjaz-auth-message manjaz-auth-success';

            message.textContent =
              'تم إنشاء الحساب. تحققي من بريدك الإلكتروني لتفعيل الحساب، ثم سجلي الدخول.';
          }
        } else {
          const {
            error
          } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            throw error;
          }

          message.className =
            'manjaz-auth-message manjaz-auth-success';

          message.textContent =
            'تم تسجيل الدخول.';

          await loadCurrentUser();

          setTimeout(() => {
            closeAuthModal();

            if (
              location.hash === '#add'
            ) {
              showPage('add');
            }
          }, 500);
        }
      } catch (error) {
        console.error(error);

        message.className =
          'manjaz-auth-message manjaz-auth-error';

        message.textContent =
          error.message ||
          'حدث خطأ غير متوقع.';
      } finally {
        submit.disabled = false;
      }
    }
  );

  supabase.auth.onAuthStateChange(
    async () => {
      await loadCurrentUser();
      await loadWorks();
    }
  );

  /* =========================
     المنجزات من Supabase
  ========================= */

  async function loadWorks() {
    let result =
      await supabase
        .from('achievements')
        .select('*')
        .order('created_at', {
          ascending: false
        });

    /*
      إذا لم يكن created_at موجودًا،
      نحاول القراءة بدون الترتيب.
    */

    if (result.error) {
      result =
        await supabase
          .from('achievements')
          .select('*');
    }

    if (result.error) {
      console.error(
        'Supabase achievements error:',
        result.error
      );

      state.works = [];

      const container = $('#allWorks');

      if (container) {
        container.innerHTML = `
          <div class="empty">
            تعذر تحميل المنجزات حاليًا.
          </div>
        `;
      }

      return;
    }

    state.works = result.data || [];

    renderWorks();
    renderAdminPanel();
  }

  function renderWorks() {
    const container = $('#allWorks');

    if (!container) return;

    const searchInput = $('#search');
    const filterInput = $('#filter');

    const q =
      (searchInput?.value || '')
        .trim()
        .toLowerCase();

    const filter =
      filterInput?.value || 'all';

    const filtered =
      state.works.filter(work => {
        const searchable =
          `${work.title || ''}
           ${work.owner || ''}
           ${work.description || ''}`
            .toLowerCase();

        const matchesSearch =
          !q || searchable.includes(q);

        const matchesFilter =
          filter === 'all' ||
          work.category === filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      });

    if (!filtered.length) {
      container.innerHTML = `
        <div class="empty">
          لا توجد منجزات مطابقة حاليًا.
        </div>
      `;
    } else {
      container.innerHTML =
        filtered.map(work => `
          <article
  class="card"
  data-work-id="${escapeHTML(work.id)}"
  role="button"
  tabindex="0"
>

            <span class="tag">
              ${escapeHTML(
                work.category || 'منجز'
              )}
            </span>

            <h3>
              ${escapeHTML(
                work.title || 'بدون عنوان'
              )}
            </h3>

            <p>
              ${escapeHTML(
                work.description ||
                'بدون وصف.'
              )}
            </p>

            <small>
              ${escapeHTML(
            work.achievement_date || ''
              )}
              ${
                work.submitter_name
                  ? ' · ' +
                    escapeHTML(work.submitter_name)
                  : ''
              }
            </small>

            ${
              state.role === 'admin'
                ? `
                  <br>
                  <button
                    class="admin-delete-btn"
                    data-delete-id="${escapeHTML(
                      work.id
                    )}"
                    type="button"
                  >
                    حذف المنجز
                  </button>
                `
                : ''
            }

          </article>
        `).join('');
    }

    const totalCount =
      $('#totalCount');

    if (totalCount) {
      totalCount.textContent =
        state.works.length;
    }
  }

  $('#search')?.addEventListener(
    'input',
    renderWorks
  );

  $('#filter')?.addEventListener(
    'change',
    renderWorks
  );

  /* =========================
     إضافة منجز
  ========================= */

  const achievementForm =
    $('#achievementForm');

  if (achievementForm) {
    achievementForm.addEventListener(
      'submit',
      async e => {
        e.preventDefault();

        if (!state.user) {
          openAuthModal('login');
          return;
        }

        const title =
          $('#title')?.value.trim();

        const category =
          $('#category')?.value;

        const date =
          $('#date')?.value || null;

        const ownerInput =
          $('#owner')?.value.trim();

        const description =
          $('#description')?.value.trim();

        if (!title) {
          alert(
            'اكتبي عنوان المنجز أولًا.'
          );
          return;
        }

        const owner =
          ownerInput ||
          state.profile?.full_name ||
          state.user.email ||
          '';

        const button =
          achievementForm.querySelector(
            'button[type="submit"]'
          );

        if (button) {
          button.disabled = true;
          button.textContent =
            'جارٍ الحفظ...';
        }

        try {
          /*
            نرسل created_by أولًا،
            لأنه يربط المنجز بصاحب الحساب.
          */

let payload = {
  title,
  category,
  achievement_date: date,
  submitter_name: owner,
  description,
  created_by: state.user.id
};

          let result =
            await supabase
              .from('achievements')
              .insert(payload)
              .select()
              .single();

          /*
            إذا كانت قاعدة البيانات الحالية
            لا تحتوي created_by، نحاول مرة ثانية
            بالحقول الأساسية.
          */

          if (
            result.error &&
            /created_by|column/i.test(
              result.error.message || ''
            )
          ) {
            delete payload.created_by;

            result =
              await supabase
                .from('achievements')
                .insert(payload)
                .select()
                .single();
          }

          if (result.error) {
            throw result.error;
          }

          achievementForm.reset();

          await loadWorks();

          goToPage('works');

          alert(
            'تم حفظ المنجز بنجاح.'
          );
        } catch (error) {
          console.error(error);

          alert(
            error.message ||
            'تعذر حفظ المنجز.'
          );
        } finally {
          if (button) {
            button.disabled = false;
            button.textContent =
              'حفظ المنجز';
          }
        }
      }
    );
  }

  /* =========================
     حذف المنجز للمديرة
  ========================= */

  $('#allWorks')?.addEventListener(
    'click',
    async e => {
      const button =
        e.target.closest(
          '[data-delete-id]'
        );

      if (!button) return;

      if (state.role !== 'admin') {
        return;
      }

      const id =
        button.dataset.deleteId;

      const confirmed =
        confirm(
          'هل أنتِ متأكدة من حذف هذا المنجز؟'
        );

      if (!confirmed) return;

      button.disabled = true;
      button.textContent =
        'جارٍ الحذف...';

      const { error } =
        await supabase
          .from('achievements')
          .delete()
          .eq('id', id);

      if (error) {
        console.error(error);

        alert(
          error.message ||
          'تعذر حذف المنجز.'
        );

        button.disabled = false;
        button.textContent =
          'حذف المنجز';

        return;
      }

      await loadWorks();
    }
  /* =========================
   فتح صفحة تفاصيل المنجز
========================= */

$('#allWorks')?.addEventListener(
  'click',
  e => {
    if (e.target.closest('[data-delete-id]')) {
      return;
    }

    const card = e.target.closest('[data-work-id]');

    if (!card) return;

    const workId = card.dataset.workId;

    if (!workId) return;

    window.location.href =
      `work.html?id=${encodeURIComponent(workId)}`;
  }
);
  /* =========================
     لوحة الإدارة
  ========================= */

  function renderAdminPanel() {
    const adminPage = $('#admin');

    if (!adminPage) return;

    if (state.role !== 'admin') {
      return;
    }

    let manager =
      $('#adminManager');

    if (!manager) {
      manager =
        document.createElement('div');

      manager.id =
        'adminManager';

      manager.className =
        'admin-manager';

      adminPage.appendChild(manager);
    }

    manager.innerHTML = `
      <h3>إدارة المنجزات</h3>

      <p>
        إجمالي المنجزات المسجلة:
        <strong>
          ${state.works.length}
        </strong>
      </p>

      <div class="admin-manager-list">
        ${
          state.works.length
            ? state.works
                .slice(0, 10)
                .map(work => `
                  <div class="admin-manager-item">

                    <h4>
                      ${escapeHTML(
                        work.title ||
                        'بدون عنوان'
                      )}
                    </h4>

                    <small>
                      ${escapeHTML(
                        work.owner || ''
                      )}
                    </small>

                    <br>

                    <button
                      class="admin-delete-btn"
                      data-admin-delete-id="${escapeHTML(
                        work.id
                      )}"
                      type="button"
                    >
                      حذف
                    </button>

                  </div>
                `)
                .join('')
            : `
              <div class="empty">
                لا توجد منجزات حتى الآن.
              </div>
            `
        }
      </div>
    `;

    manager
      .querySelectorAll(
        '[data-admin-delete-id]'
      )
      .forEach(button => {
        button.addEventListener(
          'click',
          async () => {
            const id =
              button.dataset
                .adminDeleteId;

            if (
              !confirm(
                'هل أنتِ متأكدة من حذف هذا المنجز؟'
              )
            ) {
              return;
            }

            const { error } =
              await supabase
                .from('achievements')
                .delete()
                .eq('id', id);

            if (error) {
              alert(
                error.message ||
                'تعذر الحذف.'
              );
              return;
            }

            await loadWorks();
          }
        );
      });
  }

  /* =========================
     بدء الموقع
  ========================= */

  await loadCurrentUser();
  await loadWorks();

  showPage(
    location.hash.slice(1) || 'home'
  );

})();
