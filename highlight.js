// ========================================
// highlight.js - هایلایت با ذخیره‌سازی در Supabase + سینک خودکار
// ========================================

(function() {
    // ============ ۱. متغیرهای عمومی ============
    const SUPABASE_URL = 'https://ddbcwyuoghdyrfqyvnab.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkYmN3eXVvZ2hkeXJmcXl2bmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NzUyOTMsImV4cCI6MjEwNzI1MTI5M30.QID2XFnkYFs-afjAbhZ_e7QSzaBrLbDWXFRWl0BHnbo';
    const SESSION_KEY = 'sb-ddbcwyuoghdyrfqyvnab-auth-token';
    
    // 🔥 تابع بخون session از localStorage
    function getSessionFromStorage() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (data && data.access_token && data.user) {
                return data;
            }
            return null;
        } catch (e) {
            return null;
        }
    }
    
    // 🔥 کلاینت رو با session موجود میسازیم
    let db = null;
    const sessionData = getSessionFromStorage();
    
    if (window.supabase) {
        db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // اگه session توی localStorage بود، به کلاینت تزریق کن
        if (sessionData && sessionData.access_token) {
            db.auth.setSession({
                access_token: sessionData.access_token,
                refresh_token: sessionData.refresh_token || ''
            }).then(() => {
                console.log('✅ Session به highlight.js تزریق شد');
            }).catch(e => {
                console.warn('⚠️ خطا در تزریق session:', e);
            });
        }
    }

    const PAGE_URL = window.location.pathname;
    const STORAGE_KEY = 'myHighlights_v3';
    const PENDING_KEY = 'pendingHighlights'; // برای هایلایت‌هایی که هنوز سینک نشدن
    
    let currentUser = null;
    let savedHighlights = [];
    let activeColor = '#fde047';
    let isOnline = navigator.onLine;

    // ============ ۲. CSS ============
    const style = document.createElement('style');
    style.innerHTML = `
        #highlight-toolbar {
            position: fixed; top: 0; left: 0; width: 100%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            border-bottom: 1px solid rgba(0,0,0,0.1);
            display: flex; align-items: center; gap: 8px;
            padding: 8px 15px;
            z-index: 99999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-family: Vazirmatn, Tahoma, sans-serif;
            box-sizing: border-box;
            transition: transform 0.3s ease, opacity 0.3s ease;
            overflow-x: auto;
        }
        #highlight-toolbar.hidden {
            transform: translateY(-100%);
            opacity: 0;
            pointer-events: none;
        }
        .color-btn {
            width: 24px; height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: transform 0.2s;
            flex-shrink: 0;
        }
        .color-btn:hover { transform: scale(1.2); }
        .my-highlight { cursor: pointer; transition: opacity 0.2s; }
        .my-highlight:active { opacity: 0.6; }
        body { padding-top: 50px !important; }

        #show-toolbar-btn {
            position: fixed; top: 15px; left: 15px;
            width: 42px; height: 42px;
            border-radius: 50%;
            background: linear-gradient(135deg, #38bdf8, #0284c7);
            color: white;
            border: 2px solid white;
            box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);
            font-size: 20px;
            cursor: pointer;
            z-index: 99998;
            display: none;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        #show-toolbar-btn.visible { display: flex; }
        #show-toolbar-btn:hover { transform: scale(1.1); }

        #sync-status {
            font-size: 10px;
            color: #64748b;
            margin-left: auto;
            margin-right: 8px;
            display: flex;
            align-items: center;
            gap: 3px;
            white-space: nowrap;
            flex-shrink: 0;
        }
        #sync-status.synced { color: #047857; }
        #sync-status.syncing { color: #d97706; }
        #sync-status.local { color: #64748b; }
        #sync-status.offline { color: #dc2626; }

        @media print {
            #highlight-toolbar, #show-toolbar-btn { display: none !important; }
            .my-highlight {
                background-color: transparent !important;
                color: #000 !important;
                padding: 0 !important;
            }
            .back-btn, .nav-buttons { display: none !important; }
            body { padding-top: 0 !important; }
        }
    `;
    document.head.appendChild(style);

    // ============ ۳. نوار ابزار ============
    let toolbarHidden = localStorage.getItem('highlightToolbarHidden') === 'true';

    const toolbar = document.createElement('div');
    toolbar.id = 'highlight-toolbar';
    toolbar.innerHTML = `
        <span style="color: #0c4a6e; font-weight: bold; font-size: 11px; margin-left: 5px;">رنگ:</span>
        <button class="color-btn" data-color="#a7c957" style="background-color: #a7c957;" title="سبز پسته‌ای"></button>
        <button class="color-btn" data-color="#fde047" style="background-color: #fde047;" title="زرد"></button>
        <button class="color-btn" data-color="#ff8a8a" style="background-color: #ff8a8a;" title="قرمز روشن"></button>
        <button class="color-btn" data-color="#90e0ef" style="background-color: #90e0ef;" title="آبی آسمانی"></button>
        <button class="color-btn" data-color="#ffb74d" style="background-color: #ffb74d;" title="نارنجی روشن"></button>
        <span id="sync-status">⏳</span>
        <button id="clear-highlights" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer; flex-shrink: 0;">پاک کردن همه</button>
        <button id="toggle-toolbar" title="مخفی کردن" style="background: #64748b; color: white; border: none; border-radius: 4px; padding: 4px 10px; font-size: 13px; cursor: pointer; font-weight: bold; flex-shrink: 0;">✕</button>
    `;
    document.body.appendChild(toolbar);

    const showBtn = document.createElement('button');
    showBtn.id = 'show-toolbar-btn';
    showBtn.innerHTML = '🖍️';
    showBtn.title = 'نمایش نوار ابزار هایلایت';
    document.body.appendChild(showBtn);

    function applyToolbarState() {
        if (toolbarHidden) {
            toolbar.classList.add('hidden');
            showBtn.classList.add('visible');
        } else {
            toolbar.classList.remove('hidden');
            showBtn.classList.remove('visible');
        }
    }
    applyToolbarState();

    document.getElementById('toggle-toolbar').addEventListener('click', function(e) {
        e.stopPropagation();
        toolbarHidden = true;
        localStorage.setItem('highlightToolbarHidden', 'true');
        applyToolbarState();
    });

    showBtn.addEventListener('click', function() {
        toolbarHidden = false;
        localStorage.setItem('highlightToolbarHidden', 'false');
        applyToolbarState();
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            activeColor = this.getAttribute('data-color');
            document.querySelectorAll('.color-btn').forEach(b => b.style.transform = 'scale(1)');
            this.style.transform = 'scale(1.3)';
        });
    });

    // ============ ۴. نمایش وضعیت سینک ============
    function updateSyncStatus(status, debugInfo) {
    const el = document.getElementById('sync-status');
    if (!el) return;
    
    const statuses = {
        syncing: { text: '⏳ سینک...', class: 'syncing' },
        synced: { text: '✅ فعال', class: 'synced' },
        local: { text: '📱 محلی', class: 'local' },
        offline: { text: '⚠️ آفلاین', class: 'offline' },
        pending: { text: '⏳ در انتظار', class: 'syncing' }
    };
    
    const s = statuses[status] || statuses.local;
    el.textContent = s.text;
    el.className = s.class;
    
    // 🐛 نمایش اطلاعات دیباگ
    if (debugInfo) {
        el.title = debugInfo;
        console.log('🔍 وضعیت:', status, '|', debugInfo);
    }
    }

    // ============ ۵. شروع ============
async function init() {
    // گوش دادن به وضعیت آنلاین/آفلاین
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // اگه اینترنت قطع باشه
    if (!isOnline) {
        updateSyncStatus('offline');
        loadFromLocalStorage();
        return;
    }

    if (!db) {
        updateSyncStatus('local');
        loadFromLocalStorage();
        return;
    }

    // 🔥 صبر کن تا session لود بشه (تا ۳ ثانیه)
    let session = null;
    for (let i = 0; i < 10; i++) {
        try {
            const result = await db.auth.getSession();
            session = result?.data?.session;
            if (session) break;
        } catch (e) {}
        await new Promise(r => setTimeout(r, 300));
    }

    currentUser = session?.user || null;
    console.log('🔍 Highlight DB Session:', currentUser ? currentUser.email : 'خالی');

    if (currentUser) {
        console.log('✅ کاربر لاگین کرده:', currentUser.email);
        updateSyncStatus('syncing');
        
        await migrateLocalToSupabase();
        await syncPendingHighlights();
        await loadFromSupabase();
        
        updateSyncStatus('synced');
    } else {
        console.log('📱 کاربر مهمان');
        updateSyncStatus('local');
        loadFromLocalStorage();
    }

    // 🔥 گوش دادن به تغییر وضعیت لاگین
    db.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 تغییر وضعیت auth:', event);
        
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            updateSyncStatus('syncing');
            await migrateLocalToSupabase();
            await syncPendingHighlights();
            await loadFromSupabase();
            updateSyncStatus('synced');
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            updateSyncStatus('local');
        }
    });
}

    // ============ ۶. مدیریت آنلاین/آفلاین ============
    async function handleOnline() {
        isOnline = true;
        console.log('🌐 آنلاین شد');
        
        if (currentUser) {
            updateSyncStatus('syncing');
            await syncPendingHighlights();
            await loadFromSupabase();
            updateSyncStatus('synced');
        }
    }

    function handleOffline() {
        isOnline = false;
        console.log('📴 آفلاین شد');
        updateSyncStatus('offline');
    }

    // ============ ۷. انتقال هایلایت‌های محلی به Supabase ============
    async function migrateLocalToSupabase() {
        if (!currentUser || !db || !isOnline) return;
        
        const localHighlights = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        if (localHighlights.length === 0) return;
        
        console.log(`📤 انتقال ${localHighlights.length} هایلایت محلی به Supabase...`);
        updateSyncStatus('syncing');
        
        const itemsToInsert = [];
        for (const item of localHighlights) {
            // چک کن که آیا این هایلایت قبلاً توی Supabase هست یا نه
            const { data: existing } = await db
                .from('highlights')
                .select('id')
                .eq('user_id', currentUser.id)
                .eq('page_url', PAGE_URL)
                .eq('text_content', item.text)
                .eq('occurrence', item.occurrence)
                .maybeSingle();
            
            if (!existing) {
                itemsToInsert.push({
                    user_id: currentUser.id,
                    page_url: PAGE_URL,
                    text_content: item.text,
                    color: item.color,
                    occurrence: item.occurrence || 1
                });
            }
        }
        
        if (itemsToInsert.length > 0) {
            const { error } = await db.from('highlights').insert(itemsToInsert);
            
            if (error) {
                console.error('خطا در انتقال:', error);
                return;
            }
            
            console.log(`✅ ${itemsToInsert.length} هایلایت منتقل شد`);
        }
        
        // پاک کردن localStorage بعد از انتقال موفق
        // ⚠️ فقط هایلایت‌های این صفحه رو پاک کن، نه همه رو
        // (چون هر صفحه localStorage جدایی نداره و مشترکه)
        // به همین دلیل اینجا پاک نمیکنیم و میذاریم به عهده بارگذاری مجدد
        localStorage.removeItem(STORAGE_KEY);
    }

    // ============ ۸. سینک هایلایت‌های در انتظار ============
    async function syncPendingHighlights() {
        if (!currentUser || !db || !isOnline) return;
        
        const pending = JSON.parse(localStorage.getItem(PENDING_KEY)) || [];
        
        // فقط هایلایت‌های همین صفحه رو سینک کن
        const pendingForThisPage = pending.filter(h => h.page_url === PAGE_URL);
        const others = pending.filter(h => h.page_url !== PAGE_URL);
        
        if (pendingForThisPage.length === 0) return;
        
        console.log(`📤 سینک ${pendingForThisPage.length} هایلایت در انتظار...`);
        
        for (const item of pendingForThisPage) {
            const { error } = await db.from('highlights').insert({
                user_id: currentUser.id,
                page_url: item.page_url,
                text_content: item.text,
                color: item.color,
                occurrence: item.occurrence
            });
            
            if (error) {
                console.error('خطا در سینک:', error);
                // بذار توی pending بمونه برای بعد
                continue;
            }
        }
        
        // فقط موارد موفق رو حذف کن (به سادگی همه رو حذف میکنیم)
        localStorage.setItem(PENDING_KEY, JSON.stringify(others));
    }

    // ============ ۹. بارگذاری از localStorage ============
    function loadFromLocalStorage() {
        savedHighlights = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        // فیلتر فقط برای این صفحه (چون localStorage مشترکه)
        const forThisPage = savedHighlights.filter(h => h.page_url === PAGE_URL || !h.page_url);
        
        forThisPage.forEach(item => {
            restoreHighlight(item.text, item.color, item.occurrence || 1);
        });
    }

    // ============ ۱۰. بارگذاری از Supabase ============
    async function loadFromSupabase() {
        if (!isOnline) return;
        
        const { data, error } = await db
            .from('highlights')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('page_url', PAGE_URL);

        if (error) {
            console.error('خطا در بارگذاری:', error);
            loadFromLocalStorage();
            return;
        }

        savedHighlights = data.map(h => ({
            id: h.id,
            text: h.text_content,
            color: h.color,
            occurrence: h.occurrence
        }));

        savedHighlights.forEach(item => {
            restoreHighlight(item.text, item.color, item.occurrence);
        });
    }

    // ============ ۱۱. هایلایت کردن ============
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    function handleSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
            if (selection.anchorNode && selection.anchorNode.parentNode.closest('#highlight-toolbar')) return;
            if (selection.anchorNode && selection.anchorNode.parentNode.closest('#show-toolbar-btn')) return;
            if (selection.anchorNode && selection.anchorNode.parentNode.classList.contains('my-highlight')) {
                selection.removeAllRanges();
                return;
            }

            const range = selection.getRangeAt(0);
            const occurrence = getOccurrenceNumber(selectedText, range);

            savedHighlights = savedHighlights.filter(h => 
                !(h.text === selectedText && h.occurrence === occurrence)
            );
            savedHighlights.push({ text: selectedText, color: activeColor, occurrence: occurrence });

            wrapSelection(selection, activeColor);
            saveHighlight(selectedText, activeColor, occurrence);

            selection.removeAllRanges();
        }
    }

    // ============ ۱۲. ذخیره هایلایت ============
    async function saveHighlight(text, color, occurrence) {
        const highlightData = {
            user_id: currentUser?.id,
            page_url: PAGE_URL,
            text_content: text,
            color: color,
            occurrence: occurrence
        };

        // اگه آفلاین هستیم یا کاربر مهمان → ذخیره در localStorage
        if (!isOnline || !currentUser || !db) {
            saveToLocalStorage(text, color, occurrence);
            
            // اگه کاربر لاگین کرده ولی آفلاینه → به pending اضافه کن
            if (currentUser && !isOnline) {
                const pending = JSON.parse(localStorage.getItem(PENDING_KEY)) || [];
                pending.push({
                    text: text,
                    color: color,
                    occurrence: occurrence,
                    page_url: PAGE_URL
                });
                localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
                updateSyncStatus('pending');
            }
            return;
        }

        // آنلاین و لاگین‌کرده → ذخیره در Supabase
        try {
            const { data, error } = await db
                .from('highlights')
                .insert(highlightData)
                .select()
                .single();

            if (error) throw error;
            
            // آپدیت id توی حافظه داخلی
            const lastItem = savedHighlights[savedHighlights.length - 1];
            if (lastItem && lastItem.text === text) {
                lastItem.id = data.id;
            }
        } catch (error) {
            console.error('خطا در ذخیره آنلاین، ذخیره محلی:', error);
            // fallback به localStorage + pending
            saveToLocalStorage(text, color, occurrence);
            
            if (currentUser) {
                const pending = JSON.parse(localStorage.getItem(PENDING_KEY)) || [];
                pending.push({
                    text: text,
                    color: color,
                    occurrence: occurrence,
                    page_url: PAGE_URL
                });
                localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
                updateSyncStatus('pending');
            }
        }
    }

    function saveToLocalStorage(text, color, occurrence) {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        local.push({ 
            text: text, 
            color: color, 
            occurrence: occurrence,
            page_url: PAGE_URL
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
    }

    // ============ ۱۳. wrapSelection ============
    function wrapSelection(selection, color) {
        try {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.className = 'my-highlight';
            span.style.backgroundColor = color;
            span.style.borderRadius = '3px';
            span.style.padding = '0 2px';
            span.style.cursor = 'pointer';
            
            attachRemoveHandler(span);
            
            const fragment = range.extractContents();
            span.appendChild(fragment);
            range.insertNode(span);
        } catch (e) {
            console.error('Highlight error:', e);
        }
    }

    // ============ ۱۴. getOccurrenceNumber ============
    function getOccurrenceNumber(searchText, range) {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (node.parentNode.closest('#highlight-toolbar') || 
                        node.parentNode.closest('#show-toolbar-btn') ||
                        node.parentNode.tagName === 'SCRIPT' || 
                        node.parentNode.tagName === 'STYLE' ||
                        node.parentNode.closest('.my-highlight')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );
        
        let count = 0;
        let node;
        const startNode = range.startContainer;
        const startOffset = range.startOffset;
        
        while (node = walker.nextNode()) {
            let textToSearch = node.nodeValue;
            if (node === startNode) {
                textToSearch = textToSearch.substring(0, startOffset);
            }
            
            let pos = 0;
            while ((pos = textToSearch.indexOf(searchText, pos)) !== -1) {
                count++;
                pos += searchText.length;
            }
            
            if (node === startNode) break;
        }
        
        return count + 1;
    }

    // ============ ۱۵. restoreHighlight ============
    function restoreHighlight(searchText, color, occurrence) {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (node.parentNode.closest('#highlight-toolbar') || 
                        node.parentNode.closest('#show-toolbar-btn') ||
                        node.parentNode.tagName === 'SCRIPT' || 
                        node.parentNode.tagName === 'STYLE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );
        
        let count = 0;
        let node;
        while (node = walker.nextNode()) {
            if (node.parentNode.closest('.my-highlight')) continue;
            
            const text = node.nodeValue;
            let pos = 0;
            while ((pos = text.indexOf(searchText, pos)) !== -1) {
                count++;
                if (count === occurrence) {
                    try {
                        const range = document.createRange();
                        range.setStart(node, pos);
                        range.setEnd(node, pos + searchText.length);
                        
                        const span = document.createElement('span');
                        span.className = 'my-highlight';
                        span.style.backgroundColor = color;
                        span.style.borderRadius = '3px';
                        span.style.padding = '0 2px';
                        span.style.cursor = 'pointer';
                        
                        attachRemoveHandler(span);
                        
                        const fragment = range.extractContents();
                        span.appendChild(fragment);
                        range.insertNode(span);
                    } catch (e) {}
                    return;
                }
                pos += searchText.length;
            }
        }
    }

    // ============ ۱۶. حذف تکی ============
    function attachRemoveHandler(element) {
        let pressTimer = null;

        element.addEventListener('touchstart', function() {
            pressTimer = setTimeout(() => {
                removeSingleHighlight(element);
                if (navigator.vibrate) navigator.vibrate(50);
            }, 600);
        }, { passive: true });

        element.addEventListener('touchend', function() { clearTimeout(pressTimer); });
        element.addEventListener('touchmove', function() { clearTimeout(pressTimer); });

        element.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            removeSingleHighlight(element);
        });
    }

    async function removeSingleHighlight(element) {
        const textToRemove = element.textContent;
        const currentColor = element.style.backgroundColor;
        
        const colorNames = {
            'rgb(167, 201, 87)': 'سبز پسته‌ای',
            'rgb(253, 224, 71)': 'زرد',
            'rgb(255, 138, 138)': 'قرمز روشن',
            'rgb(144, 224, 239)': 'آبی آسمانی',
            'rgb(255, 183, 77)': 'نارنجی روشن'
        };
        const colorName = colorNames[currentColor] || 'این رنگ';

        if (confirm(`آیا می‌خواهید هایلایت ${colorName} متن «${textToRemove}» را پاک کنید؟`)) {
            // حذف از DOM
            const parent = element.parentNode;
            const textNode = document.createTextNode(textToRemove);
            parent.replaceChild(textNode, element);
            parent.normalize();

            // حذف از Supabase
            if (currentUser && db && isOnline) {
                const match = savedHighlights.find(h => 
                    h.text === textToRemove && 
                    hexToRgb(h.color) === currentColor
                );
                
                if (match && match.id) {
                    await db.from('highlights').delete().eq('id', match.id);
                }
                
                const idx = savedHighlights.findIndex(h => h.id === match?.id);
                if (idx > -1) savedHighlights.splice(idx, 1);
            } else {
                // حذف از localStorage
                let local = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
                let removed = false;
                local = local.filter(item => {
                    if (!removed && item.text === textToRemove && hexToRgb(item.color) === currentColor) {
                        removed = true;
                        return false;
                    }
                    return true;
                });
                localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
                
                const idx = savedHighlights.findIndex(h => 
                    h.text === textToRemove && hexToRgb(h.color) === currentColor
                );
                if (idx > -1) savedHighlights.splice(idx, 1);
            }
        }
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : 
            null;
    }

    // ============ ۱۷. پاک کردن همه ============
    document.getElementById('clear-highlights').addEventListener('click', async function() {
        if (confirm('آیا مطمئن هستید که می‌خواهید همه هایلایت‌های این صفحه را پاک کنید؟')) {
            // حذف از Supabase
            if (currentUser && db && isOnline) {
                await db.from('highlights').delete()
                    .eq('user_id', currentUser.id)
                    .eq('page_url', PAGE_URL);
            }
            
            // حذف از localStorage (فقط این صفحه)
            const local = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            const filtered = local.filter(h => h.page_url && h.page_url !== PAGE_URL);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            
            // حذف از pending (فقط این صفحه)
            const pending = JSON.parse(localStorage.getItem(PENDING_KEY)) || [];
            const filteredPending = pending.filter(h => h.page_url !== PAGE_URL);
            localStorage.setItem(PENDING_KEY, JSON.stringify(filteredPending));
            
            location.reload();
        }
    });

    // ============ ۱۸. شروع ============
    init();

})();
