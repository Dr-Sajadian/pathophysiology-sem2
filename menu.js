// menu.js - منوی همبرگری مشترک برای همه صفحات

(function() {
    // اگه منو از قبل اضافه شده، خارج شو (برای جلوگیری از تکرار)
    if (document.getElementById('menuBtn')) return;

    // ۱. اضافه کردن CSS منو
    const style = document.createElement('style');
    style.innerHTML = `
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
        .menu-btn:hover {
            background: rgba(255, 255, 255, 0.85);
            transform: scale(1.05);
        }
        .menu-btn span {
            display: block;
            width: 20px;
            height: 2px;
            background: linear-gradient(135deg, #38bdf8, #0284c7);
            border-radius: 3px;
            transition: all 0.3s;
        }
        .menu-btn.open span:nth-child(1) {
            transform: rotate(45deg) translate(6px, 6px);
        }
        .menu-btn.open span:nth-child(2) {
            opacity: 0;
        }
        .menu-btn.open span:nth-child(3) {
            transform: rotate(-45deg) translate(6px, -6px);
        }

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
        .side-menu.open {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }
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
        .side-menu .icon {
            font-size: 18px;
        }
        .side-menu .divider {
            height: 1px;
            background: rgba(56, 189, 248, 0.25);
            margin: 8px 10px;
        }
        .side-menu .user-info {
            padding: 10px 15px;
            font-size: 12px;
            color: #0369a1;
            text-align: right;
            border-bottom: 1px solid rgba(56, 189, 248, 0.2);
            margin-bottom: 5px;
        }
        .side-menu .user-info strong {
            color: #0c4a6e;
            display: block;
            margin-bottom: 3px;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);

    // ۲. اضافه کردن HTML منو به body
    const menuHTML = `
        <button class="menu-btn" id="menuBtn" aria-label="منو">
            <span></span>
            <span></span>
            <span></span>
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
                <button id="logoutBtn"><span class="icon">🚪</span> خروج</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', menuHTML);

    // ۳. باز و بسته کردن منو
    const menuBtn = document.getElementById('menuBtn');
    const sideMenu = document.getElementById('sideMenu');

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

    // ۴. بررسی وضعیت لاگین کاربر
    if (window.supabase) {
        const db = window.supabase.createClient(
            'https://ddbcwyuoghdyrfqyvnab.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkYmN3eXVvZ2hkeXJmcXl2bmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NzUyOTMsImV4cCI6MjEwNzI1MTI5M30.QID2XFnkYFs-afjAbhZ_e7QSzaBrLbDWXFRWl0BHnbo'
        );

        (async function checkUser() {
            const { data: { session } } = await db.auth.getSession();

            if (session) {
                const userName = session.user.user_metadata?.full_name || 'کاربر';
                const userEmail = session.user.email;

                document.getElementById('userName').textContent = '👋 ' + userName;
                document.getElementById('userEmail').textContent = userEmail;
                document.getElementById('userInfo').style.display = 'block';
                document.getElementById('guestOptions').style.display = 'none';
                document.getElementById('userOptions').style.display = 'block';
            }
        })();

        document.getElementById('logoutBtn')?.addEventListener('click', async function() {
            if (confirm('آیا می‌خواهید از حساب خود خارج شوید؟')) {
                await db.auth.signOut();
                window.location.href = 'login.html';
            }
        });
    }
})();
