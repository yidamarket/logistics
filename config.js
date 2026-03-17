// config.js
// 检查是否已经存在，避免重复声明
if (typeof window.SUPABASE_URL === 'undefined') {
    window.SUPABASE_URL = 'https://maxjuexqflwsnucqvkdf.supabase.co';
    window.SUPABASE_KEY = 'sb_publishable_Skv1pqDmPG40gYFIDuQoGA_EUhMzXwV';
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    window.USER_TYPES = {
        ADMIN: 'admin',
        PREPARATEUR: 'preparateur',
        CHAUFFEUR: 'chauffeur',
        RESPONSABLE: 'responsable',
        MANAGER: 'manager',
        SECRETAIRE: 'secretaire'
    };

    window.USER_TYPE_LABELS = {
        'admin': 'Administrateur',
        'preparateur': 'Préparateur',
        'chauffeur': 'Chauffeur',
        'responsable': 'Responsable',
        'manager': 'Manager',
        'secretaire': 'Secrétaire générale'
    };

    // 保存会话
    window.saveSession = function(user, remember) {
        const session = {
            id: user.id,
            username: user.username,
            userType: user.user_type
        };
        const data = JSON.stringify(session);
        if (remember) {
            localStorage.setItem('session', data);
        } else {
            sessionStorage.setItem('session', data);
        }
        return session;
    };

    // 加载会话
    window.loadSession = function() {
        const data = localStorage.getItem('session') || sessionStorage.getItem('session');
        return data ? JSON.parse(data) : null;
    };

    // 清除会话
    window.clearSession = function() {
        localStorage.removeItem('session');
        sessionStorage.removeItem('session');
    };

    // 检查登录
    window.checkAuth = function() {
        const session = loadSession();
        if (!session) {
            window.location.href = 'login.html';
            return null;
        }
        return session;
    };

    // 登出
    window.logout = function() {
        clearSession();
        window.location.href = 'login.html';
    };
}