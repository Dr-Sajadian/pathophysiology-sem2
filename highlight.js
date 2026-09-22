// کد قابلیت هایلایت - نسخه نهایی
// فقط تکه انتخاب شده رو هایلایت میکنه (نه همه تکرارها)

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

    let activeColor = '#fde047';
    let savedHighlights = JSON.parse(localStorage.getItem('myHighlights_v3')) || [];

    // ۲. دکمه‌های رنگ
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            activeColor = this.getAttribute('data-color');
            document.querySelectorAll('.color-btn').forEach(b => b.style.transform = 'scale(1)');
            this.style.transform = 'scale(1.3)';
        });
    });

    // ۳. بازیابی هایلایت‌های قبلی
    savedHighlights.forEach(item => {
        restoreHighlight(item.text, item.color, item.occurrence);
    });

    // ۴. هایلایت کردن متن با انتخاب کاربر
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    function handleSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
            // اگه داخل نوار ابزار بود، رد کن
            if (selection.anchorNode && selection.anchorNode.parentNode.closest('#highlight-toolbar')) {
                return;
            }
            
            // اگه داخل یک هایلایت قبلی بود، رد کن
            if (selection.anchorNode && selection.anchorNode.parentNode.classList.contains('my-highlight')) {
                selection.removeAllRanges();
                return;
            }

            const range = selection.getRangeAt(0);
            const occurrence = getOccurrenceNumber(selectedText, range);

            // ذخیره در حافظه
            savedHighlights = savedHighlights.filter(h => 
                !(h.text === selectedText && h.occurrence === occurrence)
            );
            savedHighlights.push({ text: selectedText, color: activeColor, occurrence: occurrence });
            localStorage.setItem('myHighlights_v3', JSON.stringify(savedHighlights));

            // اعمال هایلایت
            wrapSelection(selection, activeColor);
            
            selection.removeAllRanges();
        }
    }

    // ۵. تابع هایلایت کردن انتخاب فعلی
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

    // ۶. محاسبه شماره تکرار انتخاب فعلی
    function getOccurrenceNumber(searchText, range) {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (node.parentNode.closest('#highlight-toolbar') || 
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

    // ۷. بازیابی هایلایت قبلی با شماره تکرار مشخص
    function restoreHighlight(searchText, color, occurrence) {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (node.parentNode.closest('#highlight-toolbar') || 
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
                    } catch (e) {
                        console.error('Restore error:', e);
                    }
                    return;
                }
                pos += searchText.length;
            }
        }
    }

    // ۸. اضافه کردن قابلیت حذف تکی (نگه داشتن / کلیک راست)
    function attachRemoveHandler(element) {
        let pressTimer = null;

        element.addEventListener('touchstart', function(e) {
            pressTimer = setTimeout(() => {
                removeSingleHighlight(element);
                if (navigator.vibrate) navigator.vibrate(50);
            }, 600);
        }, { passive: true });

        element.addEventListener('touchend', function() {
            clearTimeout(pressTimer);
        });
        element.addEventListener('touchmove', function() {
            clearTimeout(pressTimer);
        });

        element.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            removeSingleHighlight(element);
        });
    }

    // ۹. حذف یک هایلایت خاص
    function removeSingleHighlight(element) {
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
            // حذف از حافظه - اولین موردی که با این متن و رنگ مطابقت داره
            let removed = false;
            savedHighlights = savedHighlights.filter(item => {
                if (!removed && item.text === textToRemove && hexToRgb(item.color) === currentColor) {
                    removed = true;
                    return false;
                }
                return true;
            });
            localStorage.setItem('myHighlights_v3', JSON.stringify(savedHighlights));

            // حذف از DOM
            const parent = element.parentNode;
            const textNode = document.createTextNode(textToRemove);
            parent.replaceChild(textNode, element);
            parent.normalize();
        }
    }

    // ۱۰. تبدیل رنگ HEX به RGB برای مقایسه
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : 
            null;
    }

    // ۱۱. دکمه پاک کردن همه
    document.getElementById('clear-highlights').addEventListener('click', function() {
        if (confirm('آیا مطمئن هستید که می‌خواهید همه هایلایت‌ها را پاک کنید؟')) {
            localStorage.removeItem('myHighlights_v3');
            location.reload();
        }
    });
});

// ۱۲. استایل‌های نوار ابزار + قوانین پرینت
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

    /* ✅ قوانین مخصوص پرینت */
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
        body {
            padding-top: 0 !important;
        }
    }
`;
document.head.appendChild(style);
