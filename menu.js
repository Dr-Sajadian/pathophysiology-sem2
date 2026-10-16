// menu.js - منوی همبرگری + دکمه آپلود مشترک برای همه صفحات

(function() {
    // اگه منو از قبل اضافه شده، خارج شو
    if (document.getElementById('menuBtn')) return;

    // ========================================
    // ۱. اضافه کردن CSS
    // ========================================
    const style = document.createElement('style');
    style.innerHTML = `
        /* ===== منوی همبرگری ===== */
        .menu-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1.5px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 15px rgba(2, 132, 199, 0.2);
            cursor: pointer;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            transition: all 0.3s;
        }
        .menu-btn:hover { background: rgba(255, 255, 255, 0.85); transform: scale(1.05); }
        .menu-btn span {
            display: block;
            width: 20px;
            height: 2px;
            background: linear-gradient(135deg, #38bdf8, #0284c7);
            border-radius: 3px;
            transition: all 0.3s;
        }
        .menu-btn.open span:nth-child(1) { transform: rotate(45deg) translate(6px, 6px); }
        .menu-btn.open span:nth-child(2) { opacity: 0; }
        .menu-btn.open span:nth-child(3) { transform: rotate(-45deg) translate(6px, -6px); }

        .side-menu {
            position: fixed;
            top: 70px;
            right: 20px;
            width: 220px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1.5px solid rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 10px 35px rgba(2, 132, 199, 0.25);
            padding: 10px;
            z-index: 9999;
            opacity: 0;
            transform: translateY(-15px) scale(0.95);
            pointer-events: none;
            transition: all 0.3s ease;
            font-family: Vazirmatn, Tahoma, sans-serif;
            box-sizing: border-box;
        }
        .side-menu.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }
        .side-menu a, .side-menu button {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 15px;
            border-radius: 12px;
            text-decoration: none;
            color: #0c4a6e;
            font-family: Vazirmatn, sans-serif;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.2s;
            border: none;
            background: transparent;
            width: 100%;
            text-align: right;
            cursor: pointer;
            box-sizing: border-box;
        }
        .side-menu a:hover, .side-menu button:hover {
            background: rgba(56, 189, 248, 0.15);
            color: #0284c7;
        }
        .side-menu .icon { font-size: 18px; }
        .side-menu .divider { height: 1px; background: rgba(56, 189, 248, 0.25); margin: 8px 10px; }
        .side-menu .user-info {
            padding: 10px 15px;
            font-size: 12px;
            color: #0369a1;
            text-align: right;
            border-bottom: 1px solid rgba(56, 189, 248, 0.2);
            margin-bottom: 5px;
        }
        .side-menu .user-info strong { color: #0c4a6e; display: block; margin-bottom: 3px; font-size: 14px; }

        /* ===== دکمه آپلود شناور (فقط برای مربی/ادمین) ===== */
        .upload-fab {
            position: fixed;
            top: 20px;
            left: 20px;
            width: 45px;
            height: 45px;
            border-radius: 12px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border: 1.5px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 15px rgba(217, 119, 6, 0.4);
            cursor: pointer;
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            color: white;
            transition: all 0.3s;
        }
        .upload-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(217, 119, 6, 0.6); }
        .upload-fab.visible { display: flex; }

        /* ===== مودال آپلود ===== */
        .up-modal-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            padding: 20px;
            box-sizing: border-box;
        }
        .up-modal-overlay.open { display: flex; }
        .up-modal-box {
            background: white;
            border-radius: 24px;
            padding: 30px 25px;
            max-width: 450px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-height: 90vh;
            overflow-y: auto;
            font-family: Vazirmatn, Tahoma, sans-serif;
            box-sizing: border-box;
        }
        .up-modal-title {
            font-size: 20px;
            font-weight: 900;
            color: #0c4a6e;
            margin-bottom: 20px;
            text-align: center;
        }
        .up-storage-selector { display: flex; gap: 10px; margin-bottom: 20px; }
        .up-storage-option {
            flex: 1;
            padding: 15px 10px;
            border: 2px solid #e2e8f0;
            border-radius: 14px;
            cursor: pointer;
            text-align: center;
            transition: all 0.3s;
            background: #f8fafc;
            box-sizing: border-box;
        }
        .up-storage-option:hover { border-color: #38bdf8; background: #f0f9ff; }
        .up-storage-option.active {
            border-color: #0284c7;
            background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(2, 132, 199, 0.15));
            box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);
        }
        .up-storage-option .up-option-icon { font-size: 28px; margin-bottom: 6px; }
        .up-storage-option .up-option-name { font-size: 13px; font-weight: 900; color: #0c4a6e; }
        .up-storage-option .up-option-desc { font-size: 10px; color: #64748b; margin-top: 3px; }

        .up-modal-label {
            display: block;
            font-size: 13px;
            color: #475569;
            font-weight: bold;
            margin-bottom: 6px;
            text-align: right;
        }
        .up-modal-input, .up-modal-select {
            width: 100%;
            padding: 11px 14px;
            border: 1.5px solid rgba(56, 189, 248, 0.4);
            border-radius: 12px;
            background: #f8fafc;
            font-family: Vazirmatn, sans-serif;
            font-size: 14px;
            margin-bottom: 15px;
            box-sizing: border-box;
        }
        .up-modal-file {
            width: 100%;
            padding: 20px;
            border: 2px dashed rgba(56, 189, 248, 0.5);
            border-radius: 12px;
            background: #f0f9ff;
            font-family: Vazirmatn, sans-serif;
            font-size: 13px;
            margin-bottom: 15px;
            text-align: center;
            cursor: pointer;
            box-sizing: border-box;
        }
        .up-modal-buttons { display: flex; gap: 10px; margin-top: 10px; }
        .up-modal-btn {
            flex: 1;
            padding: 12px;
            border-radius: 12px;
            font-family: Vazirmatn, sans-serif;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            border: none;
            transition: all 0.3s;
        }
        .up-modal-btn.upload { background: linear-gradient(135deg, #38bdf8, #0284c7); color: white; }
        .up-modal-btn.cancel { background: #e2e8f0; color: #475569; }
        .up-modal-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .up-upload-status {
            text-align: center;
            font-size: 13px;
            margin-top: 10px;
            min-height: 20px;
            line-height: 1.6;
        }
        .up-upload-status.success { color: #047857; }
        .up-upload-status.error { color: #dc2626; }
        .up-field-group { display: none; }
        .up-field-group.active { display: block; }
    `;
    document.head.appendChild(style);

    // ========================================
    // ۲. اضافه کردن HTML منو و مودال به body
    // ========================================
    const html = `
        <!-- منوی همبرگری -->
        <button class="menu-btn" id="menuBtn" aria-label="منو">
            <span></span><span></span><span></span>
        </button>
        <div class="side-menu" id="sideMenu">
            <div class="user-info" id="userInfo" style="display: none;">
                <strong id="userName">کاربر</strong>
                <span id="userEmail">ایمیل</span>
            </div>
            <a href="index.html"><span class="icon">🏠</span> خانه</a>
            <a href="ghodad.html"><span class="icon">🧬</span> کورس غدد</a>
            <a href="gooaresh.html"><span class="icon">🫀</span> کورس گوارش</a>
            <div class="divider"></div>
            <div id="guestOptions">
                <a href="login.html"><span class="icon">🔐</span> ورود</a>
                <a href="register.html"><span class="icon">📝</span> ثبت‌نام</a>
            </div>
            <div id="userOptions" style="display: none;">
                <a href="profile.html"><span class="icon">👤</span> پنل کاربری</a>
                <a href="admin.html" id="adminMenuLink" style="display:none;"><span class="icon">👨‍💼</span> پنل مدیریت</a>
                <button id="logoutBtn"><span class="icon">🚪</span> خروج</button>
            </div>
        </div>

        <!-- دکمه آپلود شناور -->
        <button class="upload-fab" id="uploadFab" title="آپلود فایل">⬆️</button>

        <!-- مودال آپلود -->
        <div class="up-modal-overlay" id="uploadModal">
            <div class="up-modal-box">
                <h2 class="up-modal-title">📤 آپلود فایل جدید</h2>

                <label class="up-modal-label">کجا ذخیره شود؟</label>
                <div class="up-storage-selector">
                    <div class="up-storage-option active" data-storage="supabase">
                        <div class="up-option-icon">🗄️</div>
                        <div class="up-option-name">Supabase</div>
                        <div class="up-option-desc">حداکثر ۵۰ مگ</div>
                    </div>
                    <div class="up-storage-option" data-storage="github">
                        <div class="up-option-icon">🐙</div>
                        <div class="up-option-name">GitHub</div>
                        <div class="up-option-desc">حداکثر ۲۵ مگ</div>
                    </div>
                </div>

                <div class="up-field-group active" id="supabaseFields">
                    <label class="up-modal-label">نام نمایشی (فارسی):</label>
                    <input type="text" class="up-modal-input" id="displayName" placeholder="مثال: جزوه پاتولوژی جلسه اول">

                    <label class="up-modal-label">نام فایل (انگلیسی):</label>
                    <input type="text" class="up-modal-input" id="fileName" placeholder="مثال: pathology-lecture-1">

                    <label class="up-modal-label">پسوند فایل:</label>
                    <select class="up-modal-select" id="fileExt">
                        <option value=".pdf">PDF</option>
                        <option value=".html">HTML</option>
                        <option value=".jpg">JPG</option>
                        <option value=".png">PNG</option>
                        <option value=".zip">ZIP</option>
                        <option value=".docx">DOCX</option>
                        <option value=".pptx">PPTX</option>
                    </select>

                    <label class="up-modal-label">🎯 مقصد نهایی فایل:</label>
                    <select class="up-modal-select" id="destination" style="font-size:13px;padding:12px;">
                        <option value="">— انتخاب مقصد —</option>

                        <optgroup label="🧬 کورس غدد — مقدمات ۱۴۰۱">
                            <option value="ghodad|moghaddamat|jalali">👨‍🏫 استاد جلالی</option>
                            <option value="ghodad|moghaddamat|hosseini">👨‍🏫 استاد حسینی</option>
                            <option value="ghodad|moghaddamat|ramezani">👨‍🏫 استاد رمضانی</option>
                            <option value="ghodad|moghaddamat|naimi">👩‍🏫 استاد نعیمی</option>
                        </optgroup>

                        <optgroup label="🧬 کورس غدد — مقدمات ۱۴۰۲">
                            <option value="ghodad|moghaddamat|hosseini-1402">👨‍🏫 استاد حسینی ۱۴۰۲</option>
                            <option value="ghodad|moghaddamat|ramezani-1402">👨‍🏫 استاد رمضانی ۱۴۰۲</option>
                            <option value="ghodad|moghaddamat|naimi-1402">👩‍🏫 استاد نعیمی ۱۴۰۲</option>
                        </optgroup>

                        <optgroup label="💊 فارماکولوژی غدد">
                            <option value="ghodad|pharmacology|pharma-hypothalamic">🧠 Hypothalamic & Pituitary</option>
                            <option value="ghodad|pharmacology|pharma-thyroid">🦋 Thyroid & Anti-Thyroid</option>
                            <option value="ghodad|pharmacology|pharma-adrenal">💊 Adrenal Cortex</option>
                            <option value="ghodad|pharmacology|pharma-gonadal">🧬 Gonadal hormones</option>
                            <option value="ghodad|pharmacology|pharma-diabetes">🩸 Diabetes Mellitus</option>
                            <option value="ghodad|pharmacology|pharma-total">📚 مرور کل فارماکولوژی</option>
                        </optgroup>

                        <optgroup label="🔬 پاتولوژی غدد">
                            <option value="ghodad|pathology|">🔬 پاتولوژی غدد (عمومی)</option>
                        </optgroup>

                        <optgroup label="🫀 کورس گوارش — مقدمات">
                            <option value="gooaresh|gooaresh-moghaddamat|khedmat">👨‍🏫 استاد خدمت</option>
                            <option value="gooaresh|gooaresh-moghaddamat|ghamarchahre">👨‍🏫 استاد قمرچهره</option>
                            <option value="gooaresh|gooaresh-moghaddamat|nejati">👨‍🏫 استاد نجاتی</option>
                            <option value="gooaresh|gooaresh-moghaddamat|abyazi">👨‍🏫 استاد ابیضی</option>
                            <option value="gooaresh|gooaresh-moghaddamat|karbasi">👨‍🏫 استاد کرباسی</option>
                            <option value="gooaresh|gooaresh-moghaddamat|khanche">👨‍🏫 استاد خنچه</option>
                            <option value="gooaresh|gooaresh-moghaddamat|jahangiri">👨‍🏫 استاد جهانگیری</option>
                            <option value="gooaresh|gooaresh-moghaddamat|hosseini-ahangar">👨‍🏫 استاد حسینی آهنگر</option>
                        </optgroup>

                        <optgroup label="🫀 کورس گوارش — سایر">
                            <option value="gooaresh|gooaresh-pathology|">🔬 پاتولوژی گوارش</option>
                            <option value="gooaresh|gooaresh-pharmacology|">💊 فارماکولوژی گوارش</option>
                            <option value="gooaresh|gooaresh-liver-pathology|">🫁 پاتولوژی کبد</option>
                        </optgroup>
                    </select>
                </div>

                <div class="up-field-group" id="githubFields">
                    <label class="up-modal-label">توکن گیت‌هاب:</label>
                    <input type="password" class="up-modal-input" id="githubToken" placeholder="github_pat_...">
                    <p style="font-size:11px;color:#64748b;margin-top:-10px;margin-bottom:15px;text-align:right;">
                        یک بار وارد کنید، توی مرورگر ذخیره میشه.
                    </p>

                    <label class="up-modal-label">مسیر فایل در مخزن:</label>
                    <input type="text" class="up-modal-input" id="filePath" placeholder="مثال: pdfs/lecture1.pdf">
                </div>

                <label class="up-modal-label">انتخاب فایل:</label>
                <input type="file" class="up-modal-file" id="fileInput">

                <div class="up-upload-status" id="uploadStatus"></div>

                <div class="up-modal-buttons">
                    <button class="up-modal-btn cancel" id="cancelBtn">لغو</button>
                    <button class="up-modal-btn upload" id="uploadBtn">آپلود</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    // ========================================
    // ۳. متغیرهای عمومی
    // ========================================
    const menuBtn = document.getElementById('menuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const uploadFab = document.getElementById('uploadFab');
    const uploadModal = document.getElementById('uploadModal');

    const GITHUB_OWNER = 'Dr-Sajadian';
    const GITHUB_REPO = 'physiopathology-sem2';
    const GITHUB_BRANCH = 'main';

    // ========================================
    // ۴. باز و بسته کردن منو
    // ========================================
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        menuBtn.classList.toggle('open');
        sideMenu.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
        if (!sideMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            menuBtn.classList.remove('open');
            sideMenu.classList.remove('open');
        }
    });

    // ========================================
    // ۵. بررسی وضعیت کاربر
    // ========================================
    if (window.supabase) {
        const db = window.appDb || window.supabase.createClient(
            'https://ddbcwyuoghdyrfqyvnab.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkYmN3eXVvZ2hkeXJmcXl2bmFiIiwiaWF0IjoxNzkxNjc1MjkzLCJleHAiOjIxMDcyNTEyOTN9.QID2XFnkYFs-afjAbhZ_e7QSzaBrLbDWXFRWl0BHnbo',
            { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
        );
        // کلاینت واحد برای menu.js و highlight.js؛ از setSession دستی خودداری می‌کنیم.
        window.appDb = db;
        (async function checkUser() {
            const { data: { session } } = await db.auth.getSession();
            console.log('🔍 Session:', session ? 'موجود' : 'خالی', session?.user?.email || '');

            // 👇 اگه کاربر لاگین نکرده → فقط ورود و ثبت‌نام نشون بده
            if (!session) {
                document.getElementById('guestOptions').style.display = 'block';
                document.getElementById('userOptions').style.display = 'none';
                return;
            }

            const { data: profile } = await db
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            const userName = profile?.full_name || session.user.user_metadata?.full_name || 'کاربر';
            const userEmail = session.user.email;

            document.getElementById('userName').textContent = '👋 ' + userName;
            document.getElementById('userEmail').textContent = userEmail;
            document.getElementById('userInfo').style.display = 'block';
            document.getElementById('guestOptions').style.display = 'none';
            document.getElementById('userOptions').style.display = 'block';

            // 🔥 نمایش دکمه آپلود برای مربی‌ها و ادمین‌های تأییدشده
            if (profile && profile.status === 'approved' && 
                (profile.role === 'teacher' || profile.role === 'admin')) {
                uploadFab.classList.add('visible');
            }

            // نمایش لینک پنل مدیریت فقط برای ادمین
            if (profile && profile.role === 'admin' && profile.status === 'approved') {
                document.getElementById('adminMenuLink').style.display = 'flex';
            }

            // ===== منطق آپلود =====
            setupUpload(db);
        })();

        // ===== دکمه خروج =====
document.getElementById('logoutBtn')?.addEventListener('click', async function() {
    if (confirm('آیا می‌خواهید از حساب خود خارج شوید؟')) {
        await db.auth.signOut();
        window.location.href = 'login.html';
    }
});
    }

    // ========================================
    // ۶. منطق آپلود
    // ========================================
    function setupUpload(db) {
        const cancelBtn = document.getElementById('cancelBtn');
        const uploadBtn = document.getElementById('uploadBtn');
        const uploadStatus = document.getElementById('uploadStatus');
        const githubTokenInput = document.getElementById('githubToken');

        const savedToken = localStorage.getItem('github_token');
        if (savedToken) githubTokenInput.value = savedToken;

        let selectedStorage = 'supabase';

        document.querySelectorAll('.up-storage-option').forEach(opt => {
            opt.addEventListener('click', function() {
                document.querySelectorAll('.up-storage-option').forEach(o => o.classList.remove('active'));
                this.classList.add('active');
                selectedStorage = this.getAttribute('data-storage');

                if (selectedStorage === 'supabase') {
                    document.getElementById('supabaseFields').classList.add('active');
                    document.getElementById('githubFields').classList.remove('active');
                } else {
                    document.getElementById('supabaseFields').classList.remove('active');
                    document.getElementById('githubFields').classList.add('active');
                }
                uploadStatus.textContent = '';
                uploadStatus.className = 'up-upload-status';
            });
        });

        uploadFab.addEventListener('click', () => uploadModal.classList.add('open'));
        cancelBtn.addEventListener('click', () => { uploadModal.classList.remove('open'); resetModal(); });
        uploadModal.addEventListener('click', (e) => {
            if (e.target === uploadModal) { uploadModal.classList.remove('open'); resetModal(); }
        });

        function resetModal() {
            document.getElementById('displayName').value = '';
            document.getElementById('fileName').value = '';
            document.getElementById('filePath').value = '';
            document.getElementById('fileInput').value = '';
            document.getElementById('destination').value = '';
            uploadStatus.textContent = '';
            uploadStatus.className = 'up-upload-status';
            uploadBtn.disabled = false;
        }

        uploadBtn.addEventListener('click', async function() {
            const file = document.getElementById('fileInput').files[0];
            if (!file) {
                uploadStatus.textContent = 'لطفاً یک فایل انتخاب کنید';
                uploadStatus.className = 'up-upload-status error';
                return;
            }

            uploadBtn.disabled = true;
            uploadStatus.textContent = 'در حال آپلود...';
            uploadStatus.className = 'up-upload-status';

            try {
                if (selectedStorage === 'supabase') {
                    await uploadToSupabase(db, file);
                } else {
                    await uploadToGitHub(file);
                }
            } catch (err) {
                console.error(err);
                uploadStatus.textContent = '❌ خطا: ' + err.message;
                uploadStatus.className = 'up-upload-status error';
                uploadBtn.disabled = false;
            }
        });

        async function uploadToSupabase(db, file) {
            const displayName = document.getElementById('displayName').value.trim();
            const fileName = document.getElementById('fileName').value.trim();
            const ext = document.getElementById('fileExt').value;
            const destination = document.getElementById('destination').value;

            if (!displayName || !fileName) throw new Error('لطفاً نام نمایشی و نام فایل را پر کنید');
            if (!destination) throw new Error('لطفاً مقصد نهایی فایل را انتخاب کنید');

            const [section, subsection, teacher] = destination.split('|');
            const fullPath = fileName + ext;

            const { error: uploadError } = await db.storage
                .from('course-files')
                .upload(fullPath, file, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            const { error: dbError } = await db
                .from('files')
                .insert({
                    display_name: displayName,
                    file_path: fullPath,
                    file_type: ext.replace('.', ''),
                    section: section,
                    subsection: subsection,
                    teacher: teacher || null
                });

            if (dbError) throw dbError;

            uploadStatus.innerHTML = `✅ فایل با موفقیت آپلود شد!<br><small style="color:#64748b;">به صورت خودکار در صفحه مقصد نمایش داده می‌شود.</small>`;
            uploadStatus.className = 'up-upload-status success';

            setTimeout(() => {
                uploadModal.classList.remove('open');
                resetModal();
            }, 2000);
        }

        async function uploadToGitHub(file) {
            const token = githubTokenInput.value.trim();
            const filePath = document.getElementById('filePath').value.trim();

            if (!token || !filePath) throw new Error('لطفاً توکن و مسیر فایل را وارد کنید');
            if (file.size > 25 * 1024 * 1024) throw new Error('حجم فایل بیشتر از ۲۵ مگابایت است');

            localStorage.setItem('github_token', token);

            const base64 = await fileToBase64(file);
            const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

            let sha = null;
            try {
                const checkRes = await fetch(url + `?ref=${GITHUB_BRANCH}`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (checkRes.ok) {
                    const checkData = await checkRes.json();
                    sha = checkData.sha;
                }
            } catch (e) {}

            const body = {
                message: `آپلود فایل: ${filePath}`,
                content: base64,
                branch: GITHUB_BRANCH
            };
            if (sha) body.sha = sha;

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'خطا در آپلود');

            const publicUrl = `https://${GITHUB_OWNER.toLowerCase()}.github.io/${GITHUB_REPO}/${filePath}`;

            uploadStatus.innerHTML = `
                ✅ فایل در گیت‌هاب آپلود شد!<br><br>
                <strong>لینک:</strong><br>
                <input type="text" value="${publicUrl}" readonly
                    style="width:100%;padding:8px;border-radius:8px;border:1px solid #cbd5e1;font-size:11px;direction:ltr;margin-top:5px;background:#f1f5f9;"
                    onclick="this.select()">
            `;
            uploadStatus.className = 'up-upload-status success';
            uploadBtn.disabled = false;
        }

        function fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
    }
})();
