// config.js
if (typeof window.SUPABASE_URL === 'undefined') {
    window.SUPABASE_URL = 'https://maxjuexqflwsnucqvkdf.supabase.co';
    window.SUPABASE_KEY = 'sb_publishable_Skv1pqDmPG40gYFIDuQoGA_EUhMzXwV';
    
    // 修复：直接从 supabase 全局对象创建客户端
    window.supabase = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);

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

    window.saveSession = function(user) {
        const session = {
            id: user.id,
            username: user.username,
            userType: user.user_type
        };
        sessionStorage.setItem('session', JSON.stringify(session));
        return session;
    };

    window.loadSession = function() {
        const data = sessionStorage.getItem('session');
        return data ? JSON.parse(data) : null;
    };

    window.clearSession = function() {
        sessionStorage.removeItem('session');
    };

    window.logout = function() {
        window.clearSession();
        window.location.href = 'index.html';
    };

    // ========== 库存权限 ==========
    window.canAccessStock = function(userType) {
        const allowedTypes = ['admin', 'secretaire', 'manager'];
        return allowedTypes.includes(userType);
    };

    window.canModifyStock = function(userType) {
        const allowedTypes = ['admin', 'secretaire', 'manager'];
        return allowedTypes.includes(userType);
    };
}