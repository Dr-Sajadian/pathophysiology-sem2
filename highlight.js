// ========================================
// highlight.js - هایلایت با ذخیره‌سازی در Supabase
// ========================================

(function() {
    // ============ ۱. متغیرهای عمومی ============
    const db = window.supabase ? window.supabase.createClient(
        'https://ddbcwyuoghdyrfqyvnab.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkYmN3eXVvZ2hkeXJmcXl2bmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NzUyOTMsImV4cCI6MjEwNzI1MTI5M30.QID2XFnkYFs-afjAbhZ_e7QSzaBrLbDWXFRWl0BHnbo'
    ) : null;

    const PAGE_URL = window.location.pathname; // مثلاً /jalali-session1-hormones.html
    let currentUser = null;
    let savedHighlights = [];
    let activeColor = '#fde047';

    // ============ ۲. اضافه کردن CSS ============
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
        }
        .color-btn:hover { transform: scale(1.2); }
        .my-highlight {
            cursor: pointer;
            transition: opacity 0.2s;
        }
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
            font-size: 11px;
            color: #64748b;
            margin-left: auto;
            margin-right: 8px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        #sync-status.synced { color: #047857; }
        #sync-status.syncing { color: #d97706; }
        #sync-status.local { color: #64748b; }

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

    // ============ ۳. ساخت نوار ابزار ============
    let toolbarHidden = localStorage.getItem('highlightToolbarHidden') === 'true';

    const toolbar = document.createElement('div');
    toolbar.id = 'highlight-toolbar';
    toolbar.innerHTML = `
        <span style="color: #0c4a6e; font-weight: bold; font-size: 12px; margin-left: 5px;">رنگ هایلایت:</span>
        <button class="color-btn" data-color="#a7c957" style="background-color: #a7c957;" title="سبز پسته‌ای"></button>
        <button class="color-btn" data-color="#fde047" style="background-color: #fde047;" title="زرد"></button>
        <button class="color-btn" data-color="#ff8a8a" style="background-color: #ff8a8a;" title="قرمز روشن"></button>
        <button class="color-btn" data-color="#90e0ef" style="background-color: #90e0ef;" title="آبی آسمانی"></button>
        <button class="color-btn" data-color="#ffb74d" style="background-color: #ffb74d;" title="نارنجی روشن"></button>
        <span id="sync-status">☁️ در حال بارگذاری...</span>
        <button id="clear-highlights" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer;">پاک کردن همه</button>
        <button id="toggle-toolbar" title="مخفی کردن" style="background: #64748b; color: white; border: none; border-radius: 4px; padding: 4px 10px; font-size: 13px; cursor: pointer; font-weight: bold;">✕</button>
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

    // ============ ۴. دکمه‌های رنگ ============
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            activeColor = this.getAttribute('data-color');
            document.querySelectorAll('.color-btn').forEach(b => b.style.transform = 'scale(1)');
            this.style.transform = 'scale(1.3)';
        });
    });

    // ============ ۵. بررسی کاربر و بارگذاری ============
    async function init() {
        const syncStatus = document.getElementById('sync-status');

        if (!db) {
            syncStatus.textContent = '⚠️ Supabase در دسترس نیست';
            syncStatus.className = 'local';
            loadFromLocalStorage();
            return;
        }

        const { data: { session } } = await db.auth.getSession();
        currentUser = session?.user || null;

        if (currentUser) {
            // ✅ کاربر لاگین کرده → از Supabase بخون
            syncStatus.textContent = '☁️ در حال همگام‌سازی...';
            syncStatus.className = 'syncing';
            
            await loadFromSupabase();
            
            syncStatus.textContent = '✅ همگام‌سازی فعال';
            syncStatus.className = 'synced';
        } else {
            // ⚠️ کاربر مهمان → از localStorage بخون
            syncStatus.textContent = '📱 حالت محلی (بدون سینک)';
            syncStatus.className = 'local';
            
            loadFromLocalStorage();
        }
    }

    // ============ ۶. بارگذاری از localStorage ============
    function loadFromLocalStorage() {
        savedHighlights = JSON.parse(localStorage.getItem('myHighlights_v3')) || [];
        savedHighlights.forEach(item => {
            restoreHighlight(item.text, item.color, item.occurrence);
        });
    }

    // ============ ۷. بارگذاری از Supabase ============
    async function loadFromSupabase() {
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

    // ============ ۸. هایلایت کردن انتخاب ============
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

            // ذخیره در حافظه داخلی
            savedHighlights = savedHighlights.filter(h => 
                !(h.text === selectedText && h.occurrence === occurrence)
            );
            savedHighlights.push({ text: selectedText, color: activeColor, occurrence: occurrence });

            // اعمال هایلایت
            wrapSelection(selection, activeColor);

            // ذخیره‌سازی
            saveHighlight(selectedText, activeColor, occurrence);

            selection.removeAllRanges();
        }
    }

    // ============ ۹. ذخیره هایلایت ============
    async function saveHighlight(text, color, occurrence) {
        if (currentUser && db) {
            // ذخیره در Supabase
            const { data, error } = await db
                .from('highlights')
                .insert({
                    user_id: currentUser.id,
                    page_url: PAGE_URL,
                    text_content: text,
                    color: color,
                    occurrence: occurrence
                })
                .select()
                .single();

            if (error) {
                console.error('خطا در ذخیره:', error);
                // fallback به localStorage
                saveToLocalStorage(text, color, occurrence);
            } else {
                // آپدیت id توی حافظه داخلی
                const lastItem = savedHighlights[savedHighlights.length - 1];
                if (lastItem && lastItem.text === text) {
                    lastItem.id = data.id;
                }
            }
        } else {
            // ذخیره در localStorage
            saveToLocalStorage(text, color, occurrence);
        }
    }

    function saveToLocalStorage(text, color, occurrence) {
        const local = JSON.parse(localStorage.getItem('myHighlights_v3')) || [];
        local.push({ text, color, occurrence });
        localStorage.setItem('myHighlights_v3', JSON.stringify(local));
    }

    // ============ ۱۰. تابع wrapSelection ============
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

    // ============ ۱۱. محاسبه شماره تکرار ============
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

    // ============ ۱۲. بازیابی هایلایت ============
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

    // ============ ۱۳. حذف تکی ============
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
            if (currentUser && db) {
                const match = savedHighlights.find(h => 
                    h.text === textToRemove && 
                    hexToRgb(h.color) === currentColor
                );
                
                if (match && match.id) {
                    await db.from('highlights').delete().eq('id', match.id);
                }
                
                // حذف از حافظه
                const idx = savedHighlights.findIndex(h => h.id === match?.id);
                if (idx > -1) savedHighlights.splice(idx, 1);
            } else {
                // حذف از localStorage
                let local = JSON.parse(localStorage.getItem('myHighlights_v3')) || [];
                let removed = false;
                local = local.filter(item => {
                    if (!removed && item.text === textToRemove && hexToRgb(item.color) === currentColor) {
                        removed = true;
                        return false;
                    }
                    return true;
                });
                localStorage.setItem('myHighlights_v3', JSON.stringify(local));
                
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

    // ============ ۱۴. پاک کردن همه ============
    document.getElementById('clear-highlights').addEventListener('click', async function() {
        if (confirm('آیا مطمئن هستید که می‌خواهید همه هایلایت‌ها را پاک کنید؟')) {
            if (currentUser && db) {
                // حذف از Supabase
                await db.from('highlights').delete()
                    .eq('user_id', currentUser.id)
                    .eq('page_url', PAGE_URL);
            }
            localStorage.removeItem('myHighlights_v3');
            location.reload();
        }
    });

    // ============ ۱۵. شروع ============
    init();

})();
