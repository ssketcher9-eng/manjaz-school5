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
    works: [],
    targetSection: 'works'
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

  // تصغير صور المنجز قبل رفعها لتسريع ظهورها على البطاقات.
  async function optimizeAchievementImage(file) {
    if (!file || !file.type?.startsWith('image/')) return file;
    try {
      const bitmap = await createImageBitmap(file);
      const maxSide = 1400;
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      if (scale === 1 && file.size < 350 * 1024) {
        bitmap.close?.();
        return file;
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) {
        bitmap.close?.();
        return file;
      }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close?.();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.82));
      if (!blob || blob.size >= file.size) return file;
      const baseName = file.name.replace(/\.[^.]+$/, '') || 'achievement-cover';
      return new File([blob], baseName + '.webp', { type: 'image/webp', lastModified: Date.now() });
    } catch (error) {
      console.warn('تعذر تحسين الصورة، سيتم رفع الأصل:', error);
      return file;
    }
  }

  let aboutSettings = {
    banner_url: '',
    banner_background_url: '',
    banner_portrait_url: '',
    banner_title: 'الثانوية الخامسة بمكة المكرمة',
    banner_kicker: 'عن مدرستي | بوابة منجز',
    banner_subtitle: 'نحتفي بمنجزات طالباتنا ومعلماتنا، ونوثّق أثر التعليم والإبداع والشراكة المجتمعية.',
    banner_date: 'عام دراسي حافل بالإنجاز',
    banner_time: 'تعليم متميز وتعلّم فاعل',
    banner_location: 'مكة المكرمة',
    banner_primary_text: 'استعرضي منجزات المدرسة',
    banner_primary_url: '#works',
    banner_secondary_text: 'اكتشفي المدرسة',
    banner_secondary_url: '#home',
    banner_features: [
      { icon: '✦', text: 'تعليم وتعلّم' },
      { icon: '⌁', text: 'رعاية وتوجيه' },
      { icon: '↗', text: 'نشاط وابتكار' },
      { icon: '◎', text: 'شراكة مجتمعية' }
    ],
    vision: '',
    mission: '',
    students: '',
    education_type: 'عام',
    founded: '1428هـ',
    staff: []
  };

  function renderAboutSettings() {
    const logo = document.querySelector('.school-logo');
    if (logo) {
      if (aboutSettings.logo_url) logo.innerHTML = `<img src="${escapeHTML(aboutSettings.logo_url)}" alt="شعار المدرسة" style="width:100%;height:100%;object-fit:contain;border-radius:inherit">`;
      else logo.textContent = 'شعار';
    }
    const banner = $('#aboutBanner');
    const bannerImage = $('#aboutBannerImage');
    const backgroundUrl = aboutSettings.banner_background_url || aboutSettings.banner_url || '';
    if (bannerImage) {
      if (backgroundUrl) { bannerImage.src = backgroundUrl; bannerImage.hidden = false; }
      else { bannerImage.removeAttribute('src'); bannerImage.hidden = true; }
    }
    if (banner) banner.hidden = false;
    $('#aboutHeroTitle').textContent = aboutSettings.banner_title || 'منجزات تصنع المستقبل';
    $('#aboutHeroKicker').textContent = aboutSettings.banner_kicker || 'الثانوية الخامسة بمكة المكرمة';
    $('#aboutHeroSubtitle').textContent = aboutSettings.banner_subtitle || 'نحو تعليم متميز، وبيئة محفزة، وأثر مستدام.';
    $('#aboutHeroDate').textContent = aboutSettings.banner_date || 'عام دراسي متميز';
    $('#aboutHeroTime').textContent = aboutSettings.banner_time || 'تعلم وإبداع';
    $('#aboutHeroLocation').textContent = aboutSettings.banner_location || 'مكة المكرمة';
    const portrait = $('#aboutHeroPortrait');
    const portraitPlaceholder = $('#aboutHeroPortraitPlaceholder');
    if (portrait && aboutSettings.banner_portrait_url) { portrait.src = aboutSettings.banner_portrait_url; portrait.hidden = false; if (portraitPlaceholder) portraitPlaceholder.hidden = true; }
    else { if (portrait) { portrait.hidden = true; portrait.removeAttribute('src'); } if (portraitPlaceholder) portraitPlaceholder.hidden = false; }
    const safeBannerHref = value => { const href = String(value || '').trim(); return href.startsWith('#') || href.startsWith('https://') || href.startsWith('http://') ? href : '#works'; };
    const primary = $('#aboutHeroPrimary');
    const secondary = $('#aboutHeroSecondary');
    if (primary) { primary.textContent = aboutSettings.banner_primary_text || 'استعرضي المنجزات'; primary.href = safeBannerHref(aboutSettings.banner_primary_url || '#works'); const arrow = document.createElement('span'); arrow.textContent = '←'; primary.appendChild(arrow); }
    if (secondary) { secondary.textContent = aboutSettings.banner_secondary_text || 'اكتشفي المدرسة'; secondary.href = safeBannerHref(aboutSettings.banner_secondary_url || '#home'); }
    const featureGrid = $('#aboutHeroFeatures');
    if (featureGrid) {
      const features = Array.isArray(aboutSettings.banner_features) ? aboutSettings.banner_features : [];
      const defaults = [{icon:'✦',text:'تعليم متميز'},{icon:'⌁',text:'أثر مستدام'},{icon:'↗',text:'ابتكار وتمكين'},{icon:'◎',text:'شراكة مجتمعية'}];
      featureGrid.innerHTML = (features.length ? features : defaults).slice(0,4).map(item => '<div><b>' + escapeHTML(item.icon || '✦') + '</b><span>' + escapeHTML(item.text || '') + '</span></div>').join('');
    }
    $('#aboutVisionText').textContent = aboutSettings.vision || 'لم تُضف الرؤية بعد.';
    $('#aboutMissionText').textContent = aboutSettings.mission || 'لم تُضف الرسالة بعد.';
    $('#aboutStudentsStat').textContent = aboutSettings.students !== '' && aboutSettings.students != null ? aboutSettings.students : '—';
    $('#aboutEducationStat').textContent = aboutSettings.education_type || '—';
    $('#aboutFoundedStat').textContent = aboutSettings.founded || '—';
    const staffGrid = $('#aboutStaffGrid');
    if (staffGrid) {
      const staff = Array.isArray(aboutSettings.staff) ? aboutSettings.staff : [];
      staffGrid.innerHTML = staff.length
        ? staff.map(item => `<article class="about-staff-item"><span>${escapeHTML(item.title)}</span><strong>${escapeHTML(item.count || '—')}</strong></article>`).join('')
        : '<p>لم تُضف بيانات الكادر المدرسي والإداري بعد.</p>';
    }

    if (state.role === 'admin') {
      $('#aboutHeroTitleInput').value = aboutSettings.banner_title || '';
      $('#aboutHeroKickerInput').value = aboutSettings.banner_kicker || '';
      $('#aboutHeroSubtitleInput').value = aboutSettings.banner_subtitle || '';
      $('#aboutHeroDateInput').value = aboutSettings.banner_date || '';
      $('#aboutHeroTimeInput').value = aboutSettings.banner_time || '';
      $('#aboutHeroLocationInput').value = aboutSettings.banner_location || '';
      $('#aboutHeroPrimaryTextInput').value = aboutSettings.banner_primary_text || '';
      $('#aboutHeroPrimaryUrlInput').value = aboutSettings.banner_primary_url || '#works';
      $('#aboutHeroSecondaryTextInput').value = aboutSettings.banner_secondary_text || '';
      $('#aboutHeroSecondaryUrlInput').value = aboutSettings.banner_secondary_url || '#home';
      $('#aboutHeroFeaturesInput').value = (Array.isArray(aboutSettings.banner_features) ? aboutSettings.banner_features : []).map(item => (item.icon || '✦') + ' | ' + (item.text || '')).join('\n');
      $('#aboutVisionInput').value = aboutSettings.vision || '';
      $('#aboutMissionInput').value = aboutSettings.mission || '';
      $('#aboutStudentsInput').value = aboutSettings.students ?? '';
      $('#aboutEducationInput').value = aboutSettings.education_type || '';
      $('#aboutFoundedInput').value = aboutSettings.founded || '';
      $('#aboutStaffInput').value = (Array.isArray(aboutSettings.staff) ? aboutSettings.staff : []).map(item => `${item.title} | ${item.count || ''}`).join('\n');
    }
  }

  async function loadAboutSettings() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'about_page')
      .maybeSingle();

    if (error) {
      console.warn('تعذر تحميل إعدادات صفحة عن المدرسة:', error);
    } else if (data?.value && typeof data.value === 'object') {
      aboutSettings = { ...aboutSettings, ...data.value };
      // Replace legacy event-template copy with school-specific copy, without touching uploaded images or other About-page settings.
      const legacyText = [aboutSettings.banner_title, aboutSettings.banner_kicker, aboutSettings.banner_subtitle].join(' ').toLowerCase();
      if (/business game changer|corprights|10 days to go|empowering educators|2025/.test(legacyText)) {
        aboutSettings = {
          ...aboutSettings,
          banner_title: 'الثانوية الخامسة بمكة المكرمة',
          banner_kicker: 'عن مدرستي | بوابة منجز',
          banner_subtitle: 'نحتفي بمنجزات طالباتنا ومعلماتنا، ونوثّق أثر التعليم والإبداع والشراكة المجتمعية.',
          banner_date: aboutSettings.banner_date && !/2025|10 days/i.test(aboutSettings.banner_date) ? aboutSettings.banner_date : 'عام دراسي حافل بالإنجاز',
          banner_time: aboutSettings.banner_time || 'تعليم متميز وتعلّم فاعل',
          banner_location: 'مكة المكرمة',
          banner_primary_text: 'استعرضي منجزات المدرسة',
          banner_primary_url: '#works',
          banner_secondary_text: 'تعرّفي على المدرسة',
          banner_secondary_url: '#about',
          banner_features: [
            { icon: '✦', text: 'تعليم وتعلّم' },
            { icon: '⌁', text: 'رعاية وتوجيه' },
            { icon: '↗', text: 'نشاط وابتكار' },
            { icon: '◎', text: 'شراكة مجتمعية' }
          ]
        };
      }
    }
    renderAboutSettings();
  }

  const aboutSettingsForm = $('#aboutSettingsForm');
  if (aboutSettingsForm) {
    aboutSettingsForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (state.role !== 'admin') {
        alert('هذه الإعدادات متاحة للمديرة فقط.');
        return;
      }
      const button = $('#saveAboutSettings');
      const message = $('#aboutSettingsMessage');
      button.disabled = true;
      message.textContent = 'جارٍ الحفظ...';
      try {
        const uploadSchoolImage = async (inputId, existingUrl, folder, sizeLabel) => {
          const file = $('#' + inputId).files?.[0];
          if (!file) return existingUrl || '';
          if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            throw new Error('اختاري صورة JPG أو PNG أو WebP.');
          }
          if (file.size > 10 * 1024 * 1024) {
            throw new Error('حجم ' + sizeLabel + ' يتجاوز 10 ميجابايت.');
          }
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const path = folder + '/' + crypto.randomUUID() + '-' + safeName;
          const { error: uploadError } = await supabase.storage
            .from('school-assets')
            .upload(path, file, { contentType: file.type, upsert: false });
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from('school-assets').getPublicUrl(path);
          return publicUrlData?.publicUrl || '';
        };
        const logoUrl = await uploadSchoolImage('schoolLogoFile', aboutSettings.logo_url, 'school/logo', 'شعار المدرسة');
        const backgroundUrl = await uploadSchoolImage('aboutBannerFile', aboutSettings.banner_background_url || aboutSettings.banner_url, 'about/banner', 'صورة الخلفية');
        const portraitUrl = await uploadSchoolImage('aboutHeroPortraitFile', aboutSettings.banner_portrait_url, 'about/portrait', 'الصورة الرئيسية');

        const featureLines = $('#aboutHeroFeaturesInput').value.split('\\n').map(line => {
          const parts = line.split('|');
          return { icon: (parts[0] || '✦').trim(), text: parts.slice(1).join('|').trim() };
        }).filter(item => item.text).slice(0, 4);

        const nextSettings = {
          logo_url: logoUrl,
          banner_url: backgroundUrl,
          banner_background_url: backgroundUrl,
          banner_portrait_url: portraitUrl,
          banner_title: $('#aboutHeroTitleInput').value.trim(),
          banner_kicker: $('#aboutHeroKickerInput').value.trim(),
          banner_subtitle: $('#aboutHeroSubtitleInput').value.trim(),
          banner_date: $('#aboutHeroDateInput').value.trim(),
          banner_time: $('#aboutHeroTimeInput').value.trim(),
          banner_location: $('#aboutHeroLocationInput').value.trim(),
          banner_primary_text: $('#aboutHeroPrimaryTextInput').value.trim(),
          banner_primary_url: $('#aboutHeroPrimaryUrlInput').value.trim() || '#works',
          banner_secondary_text: $('#aboutHeroSecondaryTextInput').value.trim(),
          banner_secondary_url: $('#aboutHeroSecondaryUrlInput').value.trim() || '#home',
          banner_features: featureLines,
          vision: $('#aboutVisionInput').value.trim(),
          mission: $('#aboutMissionInput').value.trim(),
          students: $('#aboutStudentsInput').value.trim(),
          education_type: $('#aboutEducationInput').value.trim(),
          founded: $('#aboutFoundedInput').value.trim(),
          staff: $('#aboutStaffInput').value.split('\n').map(line => {
            const [title, count = ''] = line.split('|');
            return { title: (title || '').trim(), count: count.trim() };
          }).filter(item => item.title)
        };
        const { error: saveError } = await supabase
          .from('site_settings')
          .upsert({
            key: 'about_page',
            value: nextSettings,
            updated_by: state.user.id,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        if (saveError) throw saveError;
        aboutSettings = nextSettings;
        renderAboutSettings();
        $('#schoolLogoFile').value = '';
        $('#aboutBannerFile').value = '';
        $('#aboutHeroPortraitFile').value = '';
        message.textContent = 'تم حفظ الشعار وبيانات صفحة عن المدرسة والبنر.';
      } catch (error) {
        console.error(error);
        message.textContent = error.message || 'تعذر حفظ الإعدادات.';
      } finally {
        button.disabled = false;
      }
    });
  }

  function statusLabel(status) {
    const labels = { published: 'معتمد', approved: 'معتمد', pending: 'قيد المراجعة', under_review: 'قيد المراجعة', needs_edit: 'بحاجة إلى تعديل', rejected: 'غير معتمد' };
    return labels[status] || status || 'قيد المراجعة';
  }
  function statusClass(status) {
    if (status === 'published' || status === 'approved') return 'status-approved';
    if (status === 'needs_edit' || status === 'rejected') return 'status-revision';
    return 'status-pending';
  }

  const categorySectionMap = {
    'منجز': 'works',
    'تدريس': 'lessons',
    'توجيه طلابي': 'guidance',
    'نشاط طلابي': 'awards',
    'شراكة': 'partners',
    'نواتج تعلم': 'reports',
    'قيم': 'identity',
    'أولياء الأمور': 'family',
    'ورش': 'workshops',
    'ورشة تدريبية': 'workshops'
  };

  function categoryToSection(category) {
    return categorySectionMap[String(category || '').trim()] || '';
  }

  // القسم الذي بدأت منه الإضافة هو الذي يحدد مكان العرض؛ تغيير المجال لا ينقل المنجز تلقائيًا.

  // فتح نموذج الإضافة من القسم مع تحديد مجاله مسبقًا.
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-section-add]');
    if (!button) return;
    event.preventDefault();
    const category = button.dataset.sectionAdd;
    const sectionId = button.dataset.sectionId || 'works';
    state.targetSection = sectionId;
    const sectionInput = $('#achievementSection');
    if (sectionInput) sectionInput.value = sectionId;
    const categoryInput = $('#category');
    if (categoryInput) categoryInput.value = category;
    if (sectionInput) sectionInput.value = sectionId || categoryToSection(category) || 'works';
    goToPage('add');
  });

  /* =========================
     الأقسام الرئيسية
  ========================= */

  const sections = [
    ['منجزات نوعية مستدامة', '▤', '#works', '#add', 'إضافة', null, 'منجز'],
    ['ورش تدريبية تطويرية', '▧', '#workshops', '#workshops', 'إضافة', 'workshops'],
    ['تعليم متميز وتعلم فاعل', '▣', '#lessons', '#lessons', 'إضافة', null, 'تدريس'],
    ['نشاط طلابي متميز', '◇', '#awards', '#awards', 'إضافة', null, 'نشاط طلابي'],
    ['شراكة مجتمعية فاعلة', '◎', '#partners', '#partners', 'إضافة', null, 'شراكة'],
    ['نتائج التعلم نحو التميز والإتقان', '◔', '#reports', '#reports', 'إضافة', null, 'نواتج تعلم'],
    ['رعاية وتوجيه طلابي متميز', '♧', '#guidance', '#guidance', 'إضافة', null, 'توجيه طلابي'],
    ['هوية وطنية راسخة', '◇', '#identity', '#identity', 'إضافة', null, 'قيم'],
    ['تواصل أسري فعال', '◎', '#family', '#family', 'إضافة', null, 'أولياء الأمور']
  ];

  const homeSections = $('#homeSections');

  if (homeSections) {
    homeSections.innerHTML = sections.map(s => `
      <article class="section-card">
        <h2><span>${s[1]}</span>${s[0]}</h2>
        <div class="section-actions">
          <a class="outline" href="${s[2]}" ${s[5] === 'workshops' ? 'data-workshop-view' : ''}>استعراض</a>
          <a class="fill" href="${s[3]}" ${s[5] === 'workshops' ? 'data-workshop-add' : (s[6] ? `data-section-add="${s[6]}" data-section-id="${s[2].slice(1)}"` : '')}>${s[4]}</a>
        </div>
      </article>
    `).join('');

    homeSections.addEventListener('click', event => {
      const addWorkshop = event.target.closest('[data-workshop-add]');
      const viewWorkshops = event.target.closest('[data-workshop-view]');

      if (addWorkshop) {
        event.preventDefault();
        const category = $('#category');
        if (category) category.value = 'ورشة تدريبية';
        goToPage('workshops');
        document.querySelector('#newWorkshopBtn')?.click();
      } else if (viewWorkshops) {
        event.preventDefault();
        goToPage('workshops');
      }
    });
  }

  /* =========================
     نظام التنقل
  ========================= */

  const pages = [...document.querySelectorAll('.page')];
  const navLinks = [...document.querySelectorAll('nav a')];

  function showPage(id) {
    const allowedAdminPage =
      (id === 'admin' || id === 'dashboard' || id === 'settings') &&
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

      if (
        (id === 'admin' || id === 'dashboard' || id === 'settings') &&
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

  authStyle.textContent += `
    .status-badge{display:inline-block;margin:8px 5px;padding:5px 10px;border-radius:20px;font-size:12px;font-weight:700}
    .status-approved{background:#e2f5e9;color:#17663a}.status-pending{background:#fff2d8;color:#8a5a00}.status-revision{background:#fde7e7;color:#9d2525}
    .admin-review-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.admin-status-btn{border:0;border-radius:8px;padding:8px 11px;cursor:pointer;font-family:inherit}
    .admin-status-btn.approve{background:#dff4e5;color:#17663a}.admin-status-btn.revise{background:#fff0d5;color:#875500}
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

          <h2 id="authTitle">تسجيل دخول الإدارة</h2>

          <p id="authDescription">
            تسجيل الدخول مخصص للإدارة لإدارة المنجزات.
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


        </div>
      </div>
    `
  );

  let authMode = 'login';

  function openAuthModal(mode = 'login') {
    authMode = 'login';

    const modal = $('#authModal');
    const title = $('#authTitle');
    const description = $('#authDescription');
    const submit = $('#authSubmit');
    const message = $('#authMessage');

    message.textContent = '';
    message.className = 'manjaz-auth-message';

    if (authMode === 'signup') {
      title.textContent = 'إنشاء حساب';
      description.textContent =
        'أنشئي حسابك كعضوة لإضافة منجزاتك إلى الموقع.';
      submit.textContent = 'إنشاء الحساب';
    } else {
      title.textContent = 'تسجيل دخول الإدارة';
      description.textContent =
        'تسجيل الدخول مخصص للإدارة لإدارة المنجزات.';
      submit.textContent = 'تسجيل الدخول';
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

    // اجلب صور المرفقات حتى لو لم يُملأ عمود image_url في سجل المنجز.
    const workIds = state.works.map(work => work.id).filter(id => id != null);
    if (workIds.length) {
      const { data: attachmentRows, error: attachmentError } = await supabase
        .from('achievement_attachments')
        .select('achievement_id,file_path,mime_type,is_cover,created_at')
        .in('achievement_id', workIds)
        .order('created_at', { ascending: true });

      const coverByWork = new Map();

      if (attachmentError) {
        console.warn('تعذر تحميل بيانات مرفقات أغلفة المنجزات:', attachmentError);
      } else {
        const orderedAttachments = [...(attachmentRows || [])].sort((a, b) => Number(Boolean(b.is_cover)) - Number(Boolean(a.is_cover)));
        for (const file of orderedAttachments) {
          if (!file.mime_type || !file.mime_type.startsWith('image/')) continue;
          if (coverByWork.has(String(file.achievement_id))) continue;
          if (!file.file_path) continue;
          const { data: publicData } = supabase.storage.from('achievement-files').getPublicUrl(file.file_path);
          let coverUrl = publicData?.publicUrl || '';
          if (!coverUrl) {
            const { data: signedData, error: signedError } = await supabase.storage.from('achievement-files').createSignedUrl(file.file_path, 3600);
            if (!signedError) coverUrl = signedData?.signedUrl || '';
          }
          if (coverUrl) coverByWork.set(String(file.achievement_id), coverUrl);
        }
      }

      state.works = state.works.map(work => ({
        ...work,
        cover_image_url: work.image_url || coverByWork.get(String(work.id)) || ''
      }));
    }

    renderWorks();
    renderAdminPanel();
  }

  function renderSectionCards() {
    document.querySelectorAll('[data-section-cards]').forEach(container => {
      const category = container.dataset.sectionCards;
      const sectionId = container.dataset.sectionId || '';
      // اعرض المنجزات المعتمدة وقيد المراجعة داخل القسم، مع إظهار الحالة على البطاقة.
      const items = state.works.filter(work => {
        // موقع العرض يحدده القسم الذي بدأت منه الإضافة (department)، لا تصنيف المنجز.
        return work.department === sectionId || (!work.department && categoryToSection(work.category) === sectionId);
      });
      if (!items.length) {
        container.innerHTML = '<div class="empty">لا توجد منجزات في هذا القسم حتى الآن.</div>';
        return;
      }
      container.innerHTML = items.map(work => {
        const canManage = state.role === 'admin';
        return `<article class="card section-achievement-card" data-section-work-id="${escapeHTML(work.id)}" role="button" tabindex="0">
          ${(work.cover_image_url || work.image_url) ? `<div class="card-image-wrap"><img class="card-image" src="${escapeHTML(work.cover_image_url || work.image_url)}" alt="${escapeHTML(work.title || 'صورة المنجز')}" loading="lazy" onerror="this.closest('.card-image-wrap')?.remove()"></div>` : '<div class="section-card-placeholder">منجز</div>'}
          <div class="card-labels"><span class="tag">${escapeHTML(work.category || category)}</span><span class="status-badge ${statusClass(work.status)}">${escapeHTML(statusLabel(work.status))}</span></div>
          <h3>${escapeHTML(work.title || 'بدون عنوان')}</h3>
          <small>التاريخ: ${escapeHTML(work.achievement_date || '—')}</small>
          ${canManage ? `<div class="section-card-actions"><button type="button" data-section-open="${escapeHTML(work.id)}">التفاصيل</button></div>` : ''}
        </article>`;
      }).join('');
    });
  }

  function renderWorks() {
    renderSectionCards();
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
           ${work.submitter_name || work.owner || ''}
           ${work.description || ''}`
            .toLowerCase();

        const matchesSearch =
          !q || searchable.includes(q);

        const matchesFilter =
          filter === 'all' ||
          (filter === 'منجز' ? (work.department === 'works' || (!work.department && categoryToSection(work.category) === 'works')) : work.category === filter);

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
            ${(work.cover_image_url || work.image_url) ? `
              <div class="card-image-wrap">
                <img class="card-image" src="${escapeHTML(work.cover_image_url || work.image_url)}" alt="${escapeHTML(work.title || 'صورة المنجز')}" loading="lazy" onerror="this.closest('.card-image-wrap')?.remove()">
              </div>
            ` : ''}
            <div class="card-labels">
            <span class="tag">
              ${escapeHTML(
                work.category || 'منجز'
              )}
            </span>
            <span class="status-badge ${statusClass(work.status)}">${escapeHTML(statusLabel(work.status))}</span>
            </div>

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
      totalCount.textContent = state.works.length;
    }

    const publishedCount = $('#publishedCount');
    const pendingCount = $('#pendingCount');
    const approvedTotal = state.works.filter(work =>
      ['published', 'approved'].includes(work.status)
    ).length;
    const pendingTotal = state.works.filter(work =>
      ['pending', 'under_review'].includes(work.status)
    ).length;

    if (publishedCount) publishedCount.textContent = approvedTotal;
    if (pendingCount) pendingCount.textContent = pendingTotal;
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

  const achievementForm = $('#achievementForm');

  // السماح بإضافة مجموعات متعددة من الوسائط وحذف المجموعة قبل الحفظ.
  const mediaInputs = $('#mediaInputs');
  $('#addMediaButton')?.addEventListener('click', () => {
    if (!mediaInputs) return;
    const row = document.createElement('div');
    row.className = 'media-input-row';
    row.innerHTML = '<input class="achievement-media-input" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm,video/quicktime" multiple aria-label="مرفقات إضافية"><button class="secondary remove-media-button" type="button">حذف هذه المجموعة</button>';
    mediaInputs.appendChild(row);
  });

  mediaInputs?.addEventListener('click', event => {
    const removeButton = event.target.closest('.remove-media-button');
    if (removeButton) removeButton.closest('.media-input-row')?.remove();
  });

  if (achievementForm) {
    achievementForm.addEventListener('submit', async event => {
      event.preventDefault();

      const title = $('#title')?.value.trim();
      const category = $('#category')?.value;
      const date = $('#date')?.value || null;
      const ownerInput = $('#owner')?.value.trim();
      const description = $('#description')?.value.trim();
      const goal = $('#goal')?.value.trim() || '';
      const impact = $('#impact')?.value.trim() || '';
      const audience = $('#audience')?.value.trim() || '';
      const entity = $('#entity')?.value.trim() || '';
      const sectionId = state.targetSection || $('#achievementSection')?.value || 'works';
      const coverFile = $('#coverImage')?.files?.[0] || null;
      const files = Array.from(document.querySelectorAll('.achievement-media-input'))
        .flatMap(input => Array.from(input.files || []));

      if (!title) {
        alert('اكتبي عنوان المنجز أولًا.');
        return;
      }
      if (!category) {
        alert('اختاري القسم الذي يتبعه المنجز.');
        return;
      }
      if (!description) {
        alert('اكتبي وصف المنجز.');
        return;
      }
      if (!coverFile) {
        alert('صورة غلاف المنجز إلزامية. اختاري صورة قبل الحفظ.');
        $('#coverImage')?.focus();
        return;
      }

      const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const mediaTypes = [...imageTypes, 'application/pdf', 'video/mp4', 'video/webm', 'video/quicktime'];
      if (!imageTypes.includes(coverFile.type)) {
        alert('صورة الغلاف يجب أن تكون صورة بصيغة JPG أو PNG أو WEBP فقط.');
        return;
      }
      if (coverFile.size > 10 * 1024 * 1024) {
        alert('حجم صورة الغلاف أكبر من 10 MB.');
        return;
      }
      for (const file of files) {
        if (!mediaTypes.includes(file.type)) {
          alert(`نوع الملف غير مسموح: ${file.name}`);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          alert(`حجم الملف أكبر من 10 MB: ${file.name}`);
          return;
        }
      }

      const owner = ownerInput || state.profile?.full_name || state.user?.email || '';
      const button = achievementForm.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
        button.textContent = 'جارٍ الحفظ...';
      }

      try {
        const payload = {
          title, category, achievement_date: date, submitter_name: owner,
          description, goal, impact, audience, entity, department: sectionId,
          created_by: state.user?.id ?? null, status: 'pending'
        };

        const { data: achievement, error: saveError } = await supabase
          .from('achievements')
          .insert(payload)
          .select()
          .single();
        if (saveError) throw saveError;

        const uploadAndRegister = async (originalFile, isCover, position, total) => {
          if (button) button.textContent = isCover
            ? 'جارٍ تحسين ورفع صورة الغلاف...'
            : `جارٍ رفع الوسائط (${position}/${total})`;

          const file = await optimizeAchievementImage(originalFile);
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const filePath = `public/${achievement.id}/${crypto.randomUUID()}-${safeName}`;
          const { error: uploadError } = await supabase.storage
            .from('achievement-files')
            .upload(filePath, file, { contentType: file.type, upsert: false });
          if (uploadError) throw uploadError;

          const { error: metadataError } = await supabase
            .from('achievement_attachments')
            .insert({
              achievement_id: achievement.id,
              file_name: originalFile.name,
              file_path: filePath,
              mime_type: file.type,
              uploaded_by: state.user?.id ?? null,
              is_cover: isCover
            });
          if (metadataError) throw metadataError;
        };

        await uploadAndRegister(coverFile, true, 1, files.length);
        for (let i = 0; i < files.length; i++) {
          await uploadAndRegister(files[i], false, i + 1, files.length);
        }

        achievementForm.reset();
        if (mediaInputs) {
          mediaInputs.innerHTML = '<div class="media-input-row"><input class="achievement-media-input" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm,video/quicktime" multiple aria-label="مرفقات إضافية"><button class="secondary remove-media-button" type="button">حذف هذه المجموعة</button></div>';
        }
        const sectionInput = $('#achievementSection');
        if (sectionInput) sectionInput.value = 'works';
        state.targetSection = 'works';

        await loadWorks();
        goToPage(sectionId);
        alert('تم حفظ المنجز وصورة غلافه والوسائط الإضافية بنجاح، وهو الآن قيد المراجعة.');
      } catch (error) {
        console.error(error);
        alert(error.message || 'تعذر حفظ المنجز أو رفع المرفقات.');
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = 'حفظ المنجز';
        }
      }
    });
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
  );

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

    let detailsModal = document.getElementById('workDetailsModal');

    if (!detailsModal) {
      detailsModal = document.createElement('div');
      detailsModal.id = 'workDetailsModal';
      detailsModal.className = 'work-details-modal';
      detailsModal.setAttribute('role', 'dialog');
      detailsModal.setAttribute('aria-modal', 'true');
      detailsModal.setAttribute('aria-label', 'تفاصيل المنجز');
      detailsModal.innerHTML = `
        <div class="work-details-modal-panel">
          <button class="work-details-modal-close" type="button" aria-label="إغلاق">×</button>
          <iframe class="work-details-modal-frame" title="تفاصيل المنجز"></iframe>
        </div>
      `;
      document.body.appendChild(detailsModal);

      const closeDetailsModal = () => {
        detailsModal.classList.remove('is-open');
        document.body.classList.remove('details-modal-open');
        detailsModal.querySelector('iframe').src = 'about:blank';
      };

      detailsModal.querySelector('.work-details-modal-close')
        .addEventListener('click', closeDetailsModal);

      detailsModal.addEventListener('click', event => {
        if (event.target === detailsModal) closeDetailsModal();
      });

      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && detailsModal.classList.contains('is-open')) {
          closeDetailsModal();
        }
      });
    }

    detailsModal.querySelector('iframe').src =
      `work.html?id=${encodeURIComponent(workId)}&admin=${state.role === "admin" ? 1 : 0}&v=20261014-2`;
    detailsModal.classList.add('is-open');
    document.body.classList.add('details-modal-open');
  }
);
  // تفعيل بطاقات الأقسام بنفس نافذة تفاصيل المنجزات في صفحة الاستعراض.
  document.addEventListener('click', event => {
    const card = event.target.closest('[data-section-work-id]');
    if (!card) return;
    if (event.target.closest('button, a')) {
      if (event.target.closest('[data-section-open]')) {
        event.preventDefault();
      } else {
        return;
      }
    }
    const workId = card.dataset.sectionWorkId;
    if (!workId) return;

    let modal = document.getElementById('workDetailsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'workDetailsModal';
      modal.className = 'work-details-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'تفاصيل المنجز');
      modal.innerHTML = '<div class="work-details-modal-panel"><button class="work-details-modal-close" type="button" aria-label="إغلاق">×</button><iframe class="work-details-modal-frame" title="تفاصيل المنجز"></iframe></div>';
      document.body.appendChild(modal);
      const close = () => {
        modal.classList.remove('is-open');
        document.body.classList.remove('details-modal-open');
        modal.querySelector('iframe').src = 'about:blank';
      };
      modal.querySelector('.work-details-modal-close').addEventListener('click', close);
      modal.addEventListener('click', e => { if (e.target === modal) close(); });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
      });
    }
    modal.querySelector('iframe').src = 'work.html?id=' + encodeURIComponent(workId) + '&v=20261014-1';
    modal.classList.add('is-open');
    document.body.classList.add('details-modal-open');
  });

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
                        work.submitter_name || work.owner || ''
                      )}
                    </small>

                    <div class="admin-review-actions">
                      <button class="admin-status-btn approve" data-status-id="${escapeHTML(work.id)}" data-status-value="published" type="button">اعتماد</button>
                      <button class="admin-status-btn revise" data-status-id="${escapeHTML(work.id)}" data-status-value="needs_edit" type="button">إعادة للتعديل</button>
                    </div>
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

    manager.querySelectorAll('[data-status-id]').forEach(button => {
      button.addEventListener('click', async () => {
        const id = button.dataset.statusId;
        const status = button.dataset.statusValue;
        button.disabled = true;
        const { error } = await supabase.from('achievements').update({ status }).eq('id', id);
        if (error) {
          console.error(error);
          alert('تعذر تحديث الحالة. تأكدي من صلاحيات التعديل في Supabase.');
          button.disabled = false;
          return;
        }
        await loadWorks();
      });
    });

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
  await loadAboutSettings();

  showPage(
    location.hash.slice(1) || 'home'
  );

})();
