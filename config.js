// config.js
// 检查是否已经存在，避免重复声明
if (typeof window.SUPABASE_URL === 'undefined') {
    window.SUPABASE_URL = 'https://maxjuexqflwsnucqvkdf.supabase.co';
    window.SUPABASE_KEY = 'sb_publishable_Skv1pqDmPG40gYFIDuQoGA_EUhMzXwV';
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ========== 员工角色定义 ==========
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

    // ========== 员工会话管理 ==========
    // 保存员工会话
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

    // 加载员工会话
    window.loadSession = function() {
        const data = localStorage.getItem('session') || sessionStorage.getItem('session');
        return data ? JSON.parse(data) : null;
    };

    // 清除员工会话
    window.clearSession = function() {
        localStorage.removeItem('session');
        sessionStorage.removeItem('session');
    };

    // 检查员工登录
    window.checkAuth = function() {
        const session = window.loadSession();
        if (!session) {
            window.location.href = 'login.html';
            return null;
        }
        return session;
    };

    // 员工登出
    window.logout = function() {
        window.clearSession();
        window.location.href = 'login.html';
    };

    // ========== 库存权限 ==========
    // 检查是否有权限访问库存管理（admin / secretaire / manager）
    window.canAccessStock = function(userType) {
        const allowedTypes = ['admin', 'secretaire', 'manager'];
        return allowedTypes.includes(userType);
    };

    // 检查是否有权限修改库存（admin / manager）
    window.canModifyStock = function(userType) {
        const allowedTypes = ['admin', 'secretaire', 'manager'];
        return allowedTypes.includes(userType);
    };

    // ========== 后台管理权限 ==========
    // 检查是否有权限访问后台管理（admin / manager）
    window.canAccessAdmin = function(userType) {
        const allowedTypes = ['admin', 'secretaire', 'manager'];
        return allowedTypes.includes(userType);
    };

    // ========== 客户相关函数 ==========
    // 保存客户会话
    window.saveClientSession = function(client) {
        const session = {
            id: client.id,
            email: client.email,
            company_name: client.company_name,
            kbis_verified: client.kbis_verified
        };
        localStorage.setItem('client_session', JSON.stringify(session));
        return session;
    };

    // 加载客户会话
    window.checkClientAuth = function() {
        const session = localStorage.getItem('client_session');
        return session ? JSON.parse(session) : null;
    };

    // 清除客户会话
    window.clearClientSession = function() {
        localStorage.removeItem('client_session');
    };

    // 客户登出
    window.clientLogout = function() {
        window.clearClientSession();
        window.location.href = 'client_login.html';
    };
}