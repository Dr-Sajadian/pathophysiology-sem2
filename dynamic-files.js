// dynamic-files.js - نمایش خودکار فایل‌های آپلودشده

(function() {
    const container = document.getElementById('dynamic-files');
    if (!container) return;

    const section = container.getAttribute('data-section');
    const subsection = container.getAttribute('data-subsection');
    const teacher = container.getAttribute('data-teacher');

    if (!section) return;

    // مخفی کردن پیش‌فرض (تا زمانی که فایل لود بشه)
    container.style.display = 'none';
    
    // مخفی کردن عنوان قبلی کانتینر (اگه وجود داره)
    const prevElement = container.previousElementSibling;
    if (prevElement && prevElement.tagName === 'H2') {
        prevElement.style.display = 'none';
    }

    // اضافه کردن CSS
    const style = document.createElement('style');
    style.innerHTML = `
        #dynamic-files {
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 100%;
            max-width: 500px;
            margin-top: 15px;
            z-index: 1;
        }
        .dyn-card {
            background: rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1.5px solid rgba(255, 255, 255, 0.85);
            border-radius: 20px;
            padding: 18px 20px;
            text-decoration: none;
            color: inherit;
            display: flex;
            align-items: center;
            gap: 15px;
            transition: all 0.35s ease;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }
        .dyn-card:hover {
            background: rgba(255, 255, 255, 0.75);
            transform: translateY(-4px);
            box-shadow: 0 15px 35px rgba(14, 165, 233, 0.25);
        }
        .dyn-icon {
            width: 50px; height: 50px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            flex-shrink: 0;
            box-shadow: 0 5px 12px rgba(0, 0, 0, 0.12);
        }
        .dyn-icon.pdf  { background: linear-gradient(135deg, #ef4444, #991b1b); }
        .dyn-icon.html { background: linear-gradient(135deg, #38bdf8, #0284c7); }
        .dyn-icon.jpg, .dyn-icon.png { background: linear-gradient(135deg, #a7c957, #588157); }
        .dyn-icon.zip, .dyn-icon.docx, .dyn-icon.pptx { background: linear-gradient(135deg, #a78bfa, #7c3aed); }
        .dyn-content { flex: 1; text-align: right; }
        .dyn-title {
            font-size: 16px;
            font-weight: 900;
            color: #0c4a6e;
            margin-bottom: 4px;
        }
        .dyn-desc { font-size: 12px; color: #475569; }
        .dyn-arrow { color: #0284c7; font-size: 20px; font-weight: bold; }
    `;
    document.head.appendChild(style);

    // اتصال به Supabase
    const db = window.supabase.createClient(
        'https://ddbcwyuoghdyrfqyvnab.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkYmN3eXVvZ2hkeXJmcXl2bmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NzUyOTMsImV4cCI6MjEwNzI1MTI5M30.QID2XFnkYFs-afjAbhZ_e7QSzaBrLbDWXFRWl0BHnbo'
    );

    // خواندن فایل‌ها
    (async function loadFiles() {
        let query = db.from('files').select('*').eq('section', section);
        if (subsection) query = query.eq('subsection', subsection);
        if (teacher) query = query.eq('teacher', teacher);
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        // اگه خطا یا خالی بود، همه چیز مخفی بمونه
        if (error || !data || data.length === 0) {
            container.style.display = 'none';
            if (prevElement && prevElement.tagName === 'H2') {
                prevElement.style.display = 'none';
            }
            return;
        }

        // فایل وجود داره → نمایش بده
        container.innerHTML = data.map(file => {
            const publicUrl = `https://ddbcwyuoghdyrfqyvnab.supabase.co/storage/v1/object/public/course-files/${file.file_path}`;
            
            let iconEmoji = '📄';
            if (file.file_type === 'pdf') iconEmoji = '📄';
            else if (file.file_type === 'html') iconEmoji = '🌐';
            else if (file.file_type === 'jpg' || file.file_type === 'png') iconEmoji = '🖼️';
            else if (file.file_type === 'zip') iconEmoji = '📦';
            else if (file.file_type === 'docx') iconEmoji = '📝';
            else if (file.file_type === 'pptx') iconEmoji = '📊';

            const downloadAttr = file.file_type === 'pdf' ? 'download' : '';

            return `
                <a href="${publicUrl}" ${downloadAttr} target="_blank" class="dyn-card">
                    <div class="dyn-icon ${file.file_type}">${iconEmoji}</div>
                    <div class="dyn-content">
                        <div class="dyn-title">${file.display_name}</div>
                        <div class="dyn-desc">${file.file_type.toUpperCase()} • کلیک برای مشاهده</div>
                    </div>
                    <div class="dyn-arrow">‹</div>
                </a>
            `;
        }).join('');

        // حالا که فایل هست، بخش رو نمایش بده
        container.style.display = 'flex';
        if (prevElement && prevElement.tagName === 'H2') {
            prevElement.style.display = 'block';
        }
    })();
})();
