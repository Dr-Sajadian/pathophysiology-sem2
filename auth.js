// فایل محافظت از صفحات - این کد در همه صفحاتی که بهش لینک میدن اجرا میشه

const db = window.supabase.createClient(
    'https://ddbcwyuoghdyrfqyvnab.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkYmN3eXVvZ2hkeXJmcXl2bmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NzUyOTMsImV4cCI6MjEwNzI1MTI5M30.QID2XFnkYFs-afjAbhZ_e7QSzaBrLbDWXFRWl0BHnbo'
);

// بررسی لاگین بودن کاربر
(async function() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
    }
})();
