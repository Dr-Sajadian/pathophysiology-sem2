// کد قابلیت هایلایت با ۵ رنگ + حذف تکی با نگه داشتن
document.addEventListener('DOMContentLoaded', function() {
    // ۱. ساخت نوار ابزار بالای صفحه
    const toolbar = document.createElement('div');
    toolbar.id = 'highlight-toolbar';
    toolbar.innerHTML = `
        <span style="color: #0c4a6e; font-weight: bold; font-size: 12px; margin-left: 5px;">رنگ هایلایت:</span>
        <button class="color-btn" data-color="#a7c957" style="background-color: #a7c957;" title="سبز پسته‌ای"></button>
        <button class="color-btn" data-color="#fde047" style="background-color: #fde047;" title="زرد"></button>
        <button class="color-btn" data-color="#ff8a8a" style="background-color: #ff8a8a;" title="قرمز روشن"></button>
        <button class="color-btn" data-color="#90e0ef" style="background-color: #90e0ef;" title="آبی آسمانی"></button>
        <button class="color-btn" data-color="#ffb74d" style="background-color: #ffb74d;" title="نارنجی روشن"></button>
        <button id="clear-highlights" style="margin-right: auto; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer;">پاک کردن همه</button>
    `;
    document.body.appendChild(toolbar);

    let activeColor = '#fde047'; // رنگ پیش‌فرض (زرد)
    let savedHighlights = JSON.parse(localStorage.getItem('myHighlights_v2')) || [];

    // ۲. تنظیم رنگ فعال با کلیک روی دکمه‌ها
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            activeColor = this.getAttribute('data-color');
            document.querySelectorAll('.color-btn').forEach(b => b.style.transform = 'scale(1)');
            this.style.transform = 'scale(1.3)';
        });
    });

    // ۳. بارگذاری هایلایت‌های قبلی
    savedHighlights.forEach(item => {
        applyHighlightToDOM(item.text, item.color);
    });

    // ۴. هایلایت کردن متن با انتخاب کاربر
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    function handleSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
            // اگر روی یک متن هایلایت‌شده کلیک شده باشد، از هایلایت کردن مجدد خودداری کن
            if (selection.anchorNode && selection.anchorNode.parentNode.classList.contains('my-highlight')) {
                selection.removeAllRanges();
                return;
            }

            // اعمال هایلایت با رنگ فعال
            applyHighlightToDOM(selectedText, activeColor);
            
            // ذخیره در حافظه
            if (!savedHighlights.some(item => item.text === selectedText)) {
                savedHighlights.push({ text: selectedText, color: activeColor });
                localStorage.setItem('myHighlights_v2', JSON.stringify(savedHighlights));
            }
            
            selection.removeAllRanges();
        }
    }

    // ۵. تابع کمکی برای پیدا کردن متن و هایلایت کردنش با رنگ مشخص
    function applyHighlightToDOM(searchText, color) {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (node.parentNode.closest('#highlight-toolbar') || node.parentNode.tagName === 'SCRIPT' || node.parentNode.tagName === 'STYLE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );

        let node;
        const textNodes = [];
        while (node = walker.nextNode()) {
            if (node.nodeValue.includes(searchText)) {
                textNodes.push(node);
            }
        }

        textNodes.forEach(node => {
            const parent = node.parentNode;
            if (parent.classList.contains('my-highlight')) return;

            const regex = new RegExp(`(${searchText})`, 'gi');
            const parts = node.nodeValue.split(regex);

            const fragment = document.createDocumentFragment();
            parts.forEach(part => {
                if (part.toLowerCase() === searchText.toLowerCase()) {
                    const span = document.createElement('span');
                    span.className = 'my-highlight';
                    span.style.backgroundColor = color;
                    span.style.borderRadius = '3px';
                    span.style.padding = '0 2px';
                    span.style.cursor = 'pointer';
                    span.textContent = part;
                    
                    // اضافه کردن قابلیت حذف تکی
                    attachRemoveHandler(span);
                    
                    fragment.appendChild(span);
                } else {
                    fragment.appendChild(document.createTextNode(part));
                }
            });

            parent.replaceChild(fragment, node);
        });
    }

    // ۶. تابع جدید: اضافه کردن قابلیت حذف تکی (Long Press / Right Click)
    function attachRemoveHandler(element) {
        let pressTimer = null;

        // شروع نگه داشتن (موبایل)
        element.addEventListener('touchstart', function(e) {
            pressTimer = setTimeout(() => {
                removeSingleHighlight(element);
                if (navigator.vibrate) navigator.vibrate(50); // لرزش کوتاه
            }, 600); // ۶۰۰ میلی‌ثانیه نگه داشتن
        }, { passive: true });

        // لغو نگه داشتن اگر انگشت برداشته شد یا حرکت کرد
        element.addEventListener('touchend', function() {
            clearTimeout(pressTimer);
        });
        element.addEventListener('touchmove', function() {
            clearTimeout(pressTimer);
        });

        // کلیک راست (کامپیوتر)
        element.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            removeSingleHighlight(element);
        });
    }

    // ۷. تابع حذف یک هایلایت خاص
    function removeSingleHighlight(element) {
        const textToRemove = element.textContent;
        
        // گرفتن رنگ فعلی برای نمایش در پیغام
        const currentColor = element.style.backgroundColor;
        
        // تبدیل رنگ به نام فارسی برای پیغام زیباتر
        const colorNames = {
            'rgb(167, 201, 87)': 'سبز پسته‌ای',
            'rgb(253, 224, 71)': 'زرد',
            'rgb(255, 138, 138)': 'قرمز روشن',
            'rgb(144, 224, 239)': 'آبی آسمانی',
            'rgb(255, 183, 77)': 'نارنجی روشن'
        };
        const colorName = colorNames[currentColor] || 'این رنگ';

        if (confirm(`آیا می‌خواهید هایلایت ${colorName} متن «${textToRemove}» را پاک کنید؟`)) {
            // حذف از حافظه مرورگر
            savedHighlights = savedHighlights.filter(item => item.text !== textToRemove);
            localStorage.setItem('myHighlights_v2', JSON.stringify(savedHighlights));

            // حذف از DOM (تبدیل span به متن ساده)
            const parent = element.parentNode;
            const textNode = document.createTextNode(textToRemove);
            parent.replaceChild(textNode, element);
            
            // ادغام متن‌های همسایه برای جلوگیری از به‌هم‌ریختگی
            parent.normalize();
        }
    }

    // ۸. دکمه پاک کردن همه هایلایت‌ها
    document.getElementById('clear-highlights').addEventListener('click', function() {
        if (confirm('آیا مطمئن هستید که می‌خواهید همه هایلایت‌ها را پاک کنید؟')) {
            localStorage.removeItem('myHighlights_v2');
            location.reload();
        }
    });
});

// ۹. استایل‌های نوار ابزار
const style = document.createElement('style');
style.innerHTML = `
    #highlight-toolbar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        border-bottom: 1px solid rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 15px;
        z-index: 99999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        font-family: Vazirmatn, Tahoma, sans-serif;
        box-sizing: border-box;
    }
    .color-btn {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: transform 0.2s;
    }
    .color-btn:hover {
        transform: scale(1.2);
    }
    .my-highlight {
        cursor: pointer;
        transition: opacity 0.2s;
    }
    .my-highlight:active {
        opacity: 0.6;
    }
    body {
        padding-top: 50px !important;
    }

    /* قوانین مخصوص پرینت */
@media print {
    #highlight-toolbar {
        display: none !important;
    }
    .my-highlight {
        background-color: transparent !important;
        color: #000 !important;
        padding: 0 !important;
    }
    .back-btn, .nav-buttons {
        display: none !important;
    }
}
`;
document.head.appendChild(style);
