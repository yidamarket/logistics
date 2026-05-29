// ============================================================================
// 全局变量
// ============================================================================
let currentUser = null;
let currentUserId = null;
let currentUserType = null;
let currentCalendarDate = new Date();
let currentAttendanceDate = new Date();
let currentLanguage = 'zh';
let isManager = false;
let canEditAttendance = false;
let translations = {};

// ============================================================================
// 辅助函数
// ============================================================================
function t(key) {
    return translations[key] || key;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function showToast(message, type) {
    type = type || 'success';
    const toast = document.createElement('div');
    toast.className = 'custom-toast ' + type;
    toast.innerHTML = '<span>' + (type === 'success' ? '✅' : '❌') + '</span><span>' + message + '</span>';
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

function showModal(options) {
    return new Promise(function(resolve) {
        const modal = document.getElementById('customModal');
        const modalIcon = document.getElementById('modalIcon');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const selectContainer = document.getElementById('modalSelectContainer');
        const select = document.getElementById('modalSelect');
        const inputContainer = document.getElementById('modalInputContainer');
        const input = document.getElementById('modalInput');
        const actions = document.getElementById('modalActions');
        
        const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️', question: '❓' };
        modalIcon.textContent = icons[options.icon] || 'ℹ️';
        modalTitle.textContent = options.title || '';
        modalMessage.textContent = options.message || '';
        
        selectContainer.style.display = 'none';
        inputContainer.style.display = 'none';
        
        if (options.select) {
            selectContainer.style.display = 'block';
            select.innerHTML = options.select.options.map(function(opt) {
                return '<option value="' + opt.value + '">' + opt.label + '</option>';
            }).join('');
        }
        
        if (options.input) {
            inputContainer.style.display = 'block';
            input.value = options.inputValue || '';
            input.placeholder = options.inputPlaceholder || '';
        }
        
        actions.innerHTML = '';
        
        options.buttons.forEach(function(btn) {
            const button = document.createElement('button');
            button.className = 'custom-modal-btn ' + btn.type;
            button.textContent = btn.text;
            button.onclick = function() {
                modal.style.display = 'none';
                if (options.select) {
                    resolve({ button: btn.value, selectValue: select.value });
                } else if (options.input) {
                    resolve({ button: btn.value, inputValue: input.value });
                } else {
                    resolve(btn.value);
                }
            };
            actions.appendChild(button);
        });
        
        modal.style.display = 'flex';
    });
}
async function showConfirm(titleKey, messageKey) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customModal');
        const modalIcon = document.getElementById('modalIcon');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const actions = document.getElementById('modalActions');
        
        modalIcon.textContent = '❓';
        modalTitle.textContent = t(titleKey);
        modalMessage.textContent = t(messageKey);
        
        actions.innerHTML = '';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'custom-modal-btn primary';
        confirmBtn.textContent = t('confirm');
        confirmBtn.onclick = function() {
            modal.style.display = 'none';
            resolve(true);
        };
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'custom-modal-btn cancel';
        cancelBtn.textContent = t('cancel');
        cancelBtn.onclick = function() {
            modal.style.display = 'none';
            resolve(false);
        };
        
        actions.appendChild(confirmBtn);
        actions.appendChild(cancelBtn);
        
        modal.style.display = 'flex';
    });
}
// ============================================================================
// 三语翻译字典（完整版）
// ============================================================================
const translationsData = {
    zh: {
        // 角色
        request_cancel_success: '已提交取消申请，等待管理员审批',
        request_cancel_failed: '申请失败',
        admin: '管理员',
        manager: '经理',
        secretaire: '秘书',
        preparateur: '备货员',
        chauffeur: '司机',
        responsable: '主管',
        confirm_cancel_title: '确认取消',
        confirm_cancel_message: '确定要取消这个请假申请吗？',
        confirm_request_cancel_title: '申请取消',
        confirm_request_cancel_message: '确定要申请取消这个已批准的假期吗？',
        waiting_approval: '等待审批',
           missing_checkout: '❌ 缺少下班打卡',
        check_in_time: '默认下班时间',
        confirm_normal: '确认为正常',
        
        // 打卡
        check_in: '✅ 上班打卡',
        check_out: '🏠 下班打卡',
        break_start: '☕ 休息开始',
        break_end: '💪 休息结束',
        
        // 通用
        home: '首页',
        logout: '退出登录',
        loading: '加载中...',
        no_data: '暂无数据',
        confirm: '确认',
        cancel: '取消',
        edit: '编辑',
        save: '保存',
        approve: '批准',
        reject: '拒绝',
        days: '天',
        remaining_leave: '剩余假期',
        
        // Tab 标题
        tab_my_leaves: '我的请假',
        tab_team_calendar: '团队日历',
        tab_team_leaves: '待批请假',
        tab_balances: '余额管理',
        tab_attendance_stats: '出勤统计',
        tab_abnormal_hours: '工时异常',
        tab_pending_cancel: '待批取消',
        
        // 请假申请
        new_leave_request: '新建请假申请',
        leave_type: '请假类型',
        start_date: '开始日期',
        end_date: '结束日期',
        days_count: '工作天数',
        reason: '理由',
        proof_url: '证明文件URL',
        submit: '提交申请',
        request_cancel: '申请取消',
        
        // 我的信息
        my_balance: '我的余额',
        my_today_attendance: '今日打卡记录',
        my_leave_history: '我的请假历史',
        
        // 日历
        team_planning: '团队日程',
        prev_month: '上月',
        next_month: '下月',
        export_excel: '导出Excel',
        
        // 图例
        legend_present: '出勤',
        legend_absent: '缺勤',
        legend_leave: '请假',
        legend_holiday: '法定假日',
        legend_weekend: '周末',
        legend_mission: '外勤',
        legend_sick: '病假',
        legend_halfday: '半天',
        
        // 待批
        pending_leave_requests: '待批请假申请',
        pending_cancel_requests: '待审批取消申请',
        all_balances: '员工假期余额',
        
        // 出勤统计
        attendance_stats: '出勤统计',
        attendance_status: '出勤状态',
        
        // 状态
        present: '出勤',
        absent: '缺勤',
        mission: '外勤',
        sick: '病假',
        halfday: '半天',
        status_en_attente: '待审批',
        status_approuve: '已批准',
        status_refuse: '已拒绝',
        status_annule: '已取消',
        no_abnormal_records: '暂无工时异常记录',
        
        // 工时异常
        need_review_yes: '待审核',
        work_hours: '工作时长',
        approve_normal: '确认为正常',
        
        // Excel
        employee: '员工',
        role: '角色',
        day_unit: '日',
        present_days: '出勤天数',
        absent_days: '缺勤天数',
        mission_days: '外勤天数',
        day_off: '休',
        export_success: '导出成功',
        status_pending_cancel: '⏳ 申请取消中',
        expired: '已过期',
        work_hours_insufficient: '工作时长不足8小时',
        approved_normal: '已确认为正常',
        marked_absent: '已标记为缺勤',
        cancelled: '已取消',
        monthly_leave_added: '✅ 已添加2.5天假期',
        cancel_approved_refund: '已批准取消，已退还 {days} 天带薪假余额',
        cancel_approved_no_refund: '已批准取消（非带薪假，不涉及余额）',
        cancel_rejected: '已拒绝取消申请',
        legend_overtime: '加班'
    },
    
    en: {
        // Roles
        legend_overtime: 'Overtime',
        no_abnormal_records: 'No abnormal hours records',
        missing_checkout: '❌ Missing check-out',
        check_in_time: 'Default check-out time',
        confirm_normal: 'Confirm Normal',
        request_cancel_success: 'Cancellation request submitted, waiting for admin approval',
        request_cancel_failed: 'Request failed',
        admin: 'Admin',
        manager: 'Manager',
        secretaire: 'Secretary',
        preparateur: 'Preparer',
        chauffeur: 'Driver',
        responsable: 'Supervisor',
        confirm_cancel_title: 'Confirm Cancellation',
        confirm_cancel_message: 'Are you sure you want to cancel this leave request?',
        confirm_request_cancel_title: 'Request Cancellation',
        confirm_request_cancel_message: 'Are you sure you want to request cancellation of this approved leave?',
        waiting_approval: 'Waiting for approval',
        
        // Check in/out
        check_in: '✅ Check In',
        check_out: '🏠 Check Out',
        break_start: '☕ Break Start',
        break_end: '💪 Break End',
        
        // General
        home: 'Home',
        logout: 'Logout',
        loading: 'Loading...',
        no_data: 'No data',
        confirm: 'Confirm',
        cancel: 'Cancel',
        edit: 'Edit',
        save: 'Save',
        approve: 'Approve',
        reject: 'Reject',
        days: 'days',
        remaining_leave: 'Remaining',
        
        // Tab titles
        tab_my_leaves: 'My Leaves',
        tab_team_calendar: 'Team Calendar',
        tab_team_leaves: 'Pending Leaves',
        tab_balances: 'Balances',
        tab_attendance_stats: 'Attendance Stats',
        tab_abnormal_hours: 'Abnormal Hours',
        tab_pending_cancel: 'Pending Cancel',
        
        // Leave request
        new_leave_request: 'New Leave Request',
        leave_type: 'Leave Type',
        start_date: 'Start Date',
        end_date: 'End Date',
        days_count: 'Working Days',
        reason: 'Reason',
        proof_url: 'Proof URL',
        submit: 'Submit',
        request_cancel: 'Request Cancel',
        
        // My info
        my_balance: 'My Balance',
        my_today_attendance: "Today's Attendance",
        my_leave_history: 'My Leave History',
        
        // Calendar
        team_planning: 'Team Planning',
        prev_month: 'Prev',
        next_month: 'Next',
        export_excel: 'Export Excel',
        
        // Legend
        legend_present: 'Present',
        legend_absent: 'Absent',
        legend_leave: 'Leave',
        legend_holiday: 'Holiday',
        legend_weekend: 'Weekend',
        legend_mission: 'Mission',
        legend_sick: 'Sick',
        legend_halfday: 'Half Day',
        
        // Pending
        pending_leave_requests: 'Pending Leave Requests',
        pending_cancel_requests: 'Pending Cancel Requests',
        all_balances: 'Employee Balances',
        
        // Attendance stats
        attendance_stats: 'Attendance Statistics',
        attendance_status: 'Status',
        
        // Status
        present: 'Present',
        absent: 'Absent',
        mission: 'Mission',
        sick: 'Sick',
        halfday: 'Half Day',
        status_en_attente: 'Pending',
        status_approuve: 'Approved',
        status_refuse: 'Rejected',
        status_annule: 'Cancelled',
        
        // Abnormal hours
        need_review_yes: 'Pending Review',
        work_hours: 'Work Hours',
        approve_normal: 'Confirm Normal',
        
        // Excel
        employee: 'Employee',
        role: 'Role',
        day_unit: '',
        present_days: 'Present Days',
        absent_days: 'Absent Days',
        mission_days: 'Mission Days',
        day_off: 'Off',
        export_success: 'Export Success',
        status_pending_cancel: '⏳ Cancelling...',
        expired: 'Expired',
        work_hours_insufficient: 'Work hours less than 8 hours',
        approved_normal: 'Confirmed as normal',
        marked_absent: 'Marked as absent',
        cancelled: 'Cancelled',
        monthly_leave_added: '✅ 2.5 days added',
        cancel_approved_refund: 'Cancellation approved, {days} paid leave days refunded',
        cancel_approved_no_refund: 'Cancellation approved (unpaid leave, no refund)',
        cancel_rejected: 'Cancellation request rejected'
    },
    
    fr: {
        // Rôles
        legend_overtime: 'Heures sup.',
         missing_checkout: '❌ Pointage de fin manquant',
        check_in_time: 'Heure de départ par défaut',
        confirm_normal: 'Confirmer normal',
        no_abnormal_records: 'Aucune heure anormale',
        request_cancel_success: 'Demande d\'annulation soumise, en attente d\'approbation',
        request_cancel_failed: 'Échec de la demande',
        admin: 'Administrateur',
        manager: 'Manager',
        secretaire: 'Secrétaire',
        preparateur: 'Préparateur',
        chauffeur: 'Chauffeur',
        responsable: 'Responsable',
        confirm_cancel_title: 'Confirmer l\'annulation',
        confirm_cancel_message: 'Voulez-vous vraiment annuler cette demande de congé ?',
        confirm_request_cancel_title: 'Demander l\'annulation',
        confirm_request_cancel_message: 'Voulez-vous vraiment demander l\'annulation de ce congé approuvé ?',
        waiting_approval: 'En attente d\'approbation',
        
        // Pointage
        check_in: '✅ Arrivée',
        check_out: '🏠 Départ',
        break_start: '☕ Début pause',
        break_end: '💪 Fin pause',
        
        // Général
        home: 'Accueil',
        logout: 'Déconnexion',
        loading: 'Chargement...',
        no_data: 'Aucune donnée',
        confirm: 'Confirmer',
        cancel: 'Annuler',
        edit: 'Modifier',
        save: 'Enregistrer',
        approve: 'Approuver',
        reject: 'Refuser',
        days: 'jours',
        remaining_leave: 'Restant',
        
        // Titres des onglets
        tab_my_leaves: 'Mes congés',
        tab_team_calendar: 'Calendrier équipe',
        tab_team_leaves: 'Congés à valider',
        tab_balances: 'Soldes',
        tab_attendance_stats: 'Présences',
        tab_abnormal_hours: 'Heures anormales',
        tab_pending_cancel: 'Annulations à valider',
        
        // Demande de congé
        new_leave_request: 'Nouvelle demande congé',
        leave_type: 'Type de congé',
        start_date: 'Date début',
        end_date: 'Date fin',
        days_count: 'Jours ouvrés',
        reason: 'Motif',
        proof_url: 'Justificatif URL',
        submit: 'Soumettre',
        request_cancel: 'Demander annulation',
        
        // Mes infos
        my_balance: 'Mon solde',
        my_today_attendance: "Pointage aujourd'hui",
        my_leave_history: 'Historique congés',
        
        // Calendrier
        team_planning: 'Planning équipe',
        prev_month: 'Mois préc.',
        next_month: 'Mois suiv.',
        export_excel: 'Exporter Excel',
        
        // Légende
        legend_present: 'Présent',
        legend_absent: 'Absent',
        legend_leave: 'Congé',
        legend_holiday: 'Férié',
        legend_weekend: 'Weekend',
        legend_mission: 'Mission',
        legend_sick: 'Maladie',
        legend_halfday: 'Demi-journée',
        
        // En attente
        pending_leave_requests: 'Demandes de congé',
        pending_cancel_requests: 'Demandes d\'annulation',
        all_balances: 'Soldes employés',
        
        // Statistiques de présence
        attendance_stats: 'Statistiques',
        attendance_status: 'État',
        
        // Statuts
        present: 'Présent',
        absent: 'Absent',
        mission: 'Mission',
        sick: 'Malade',
        halfday: 'Demi-journée',
        status_en_attente: 'En attente',
        status_approuve: 'Approuvé',
        status_refuse: 'Refusé',
        status_annule: 'Annulé',
        
        // Heures anormales
        need_review_yes: 'À vérifier',
        work_hours: 'Heures travaillées',
        approve_normal: 'Confirmer normal',
        
        // Excel
        employee: 'Employé',
        role: 'Rôle',
        day_unit: '',
        present_days: 'Jours présents',
        absent_days: 'Jours absents',
        mission_days: 'Jours mission',
        day_off: 'Repos',
        export_success: 'Export réussi',
        status_pending_cancel: '⏳ Annulation en cours',
        expired: 'Expiré',
        work_hours_insufficient: 'Heures travaillées inférieures à 8h',
        approved_normal: 'Confirmé normal',
        marked_absent: 'Marqué absent',
        cancelled: 'Annulé',
        monthly_leave_added: '✅ 2.5 jours ajoutés',
        cancel_approved_refund: 'Annulation approuvée, {days} jours de congés payés remboursés',
        cancel_approved_no_refund: 'Annulation approuvée (sans solde, pas de remboursement)',
        cancel_rejected: 'Demande d\'annulation refusée'
    }
};
// ============================================================================
// 更新 Tab 角标
// ============================================================================
async function updateTabBadges() {
    if (!isManager) return;
    
    try {
        const { count: pendingLeaveCount } = await supabase
            .from('leave_details')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'en_attente');
        
       const { count: abnormalCount } = await supabase
            .from('attendance_anomalies')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
        
        const { count: pendingCancelCount } = await supabase
            .from('leave_details')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending_cancel');
        
        const teamTab = document.getElementById('teamTab');
        if (teamTab) {
            const span = teamTab.querySelector('span');
            const txt = translationsData[currentLanguage].tab_team_leaves || '待批请假';
            span.innerHTML = pendingLeaveCount > 0 ? txt + ' <span class="badge">' + pendingLeaveCount + '</span>' : txt;
        }
        
        const abnormalTab = document.getElementById('abnormalHoursTab');
        if (abnormalTab) {
            const span = abnormalTab.querySelector('span');
            const txt = translationsData[currentLanguage].tab_abnormal_hours || '工时异常';
            span.innerHTML = abnormalCount > 0 ? txt + ' <span class="badge">' + abnormalCount + '</span>' : txt;
        }
        
        const pendingCancelTab = document.getElementById('pendingCancelTab');
        if (pendingCancelTab) {
            const span = pendingCancelTab.querySelector('span');
            const txt = translationsData[currentLanguage].tab_pending_cancel || '待批取消';
            span.innerHTML = pendingCancelCount > 0 ? txt + ' <span class="badge">' + pendingCancelCount + '</span>' : txt;
        }
        
    } catch(e) {
        console.error('更新角标失败:', e);
    }
}

// ============================================================================
// 日期时间
// ============================================================================
function updateDateTime() {
    const now = new Date();
    const locale = currentLanguage === 'zh' ? 'zh-CN' : currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
    
    document.getElementById('currentDate').textContent = now.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('currentTime').textContent = now.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// ============================================================================
// 真实天气
// ============================================================================
async function fetchRealWeather() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.7872&longitude=2.3925&current_weather=true&timezone=Europe/Paris');
        const data = await response.json();
        const temp = Math.round(data.current_weather.temperature);
        const code = data.current_weather.weathercode;
        
        let icon = '☀️';
        if (code >= 51 && code <= 67) icon = '🌧️';
        else if (code >= 71 && code <= 77) icon = '❄️';
        else if (code >= 80 && code <= 99) icon = '⛈️';
        else if (code === 45 || code === 48) icon = '🌫️';
        
        document.getElementById('weatherDisplay').innerHTML = '<span class="weather-icon">' + icon + '</span><span class="weather-temp">' + temp + '°C</span><span class="weather-city">Vitry</span>';
    } catch(e) {
        document.getElementById('weatherDisplay').innerHTML = '<span class="weather-icon">☀️</span><span class="weather-temp">--°C</span><span class="weather-city">Vitry</span>';
    }
}

// ============================================================================
// 三语支持
// ============================================================================
function setLanguage(lang) {
    // 设置当前语言
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    translations = translationsData[lang];
    
    // 更新语言按钮样式
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 更新所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        const key = el.dataset.i18n;
        if (translations[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[key];
            } else {
                el.textContent = translations[key];
            }
        }
    });
    
    // 刷新动态内容
    refreshUIText();
    
    // 更新 Tab 角标（管理员）
    if (isManager) {
        updateTabBadges();
    }
    
    // 更新用户类型显示
    const roleName = translations[currentUserType] || currentUserType;
    document.getElementById('userTypeDisplay').innerHTML = roleName;
    
    // ========== 强制刷新所有列表（更新语言）==========
    loadMyAttendance();           // 刷新今日打卡记录
    loadMyLeaveRequests();        // 刷新我的请假历史
    loadMyBalance();              // 刷新余额
    
    if (isManager) {
        loadPendingLeaveRequests();   // 刷新待批请假列表
        loadPendingCancelRequests();  // 刷新待批取消列表
        loadAbnormalHours();          // 刷新工时异常列表
        loadAllBalances();            // 刷新余额管理列表
    }
    
    // 刷新团队日历（如果当前标签是日历）
    if (document.getElementById('tab-team-calendar') && 
        document.getElementById('tab-team-calendar').classList.contains('active')) {
        loadTeamCalendar();
    }
    
    // 刷新出勤统计（如果当前标签是出勤统计）
    if (document.getElementById('tab-attendance-stats') && 
        document.getElementById('tab-attendance-stats').classList.contains('active')) {
        // 刷新日期显示
        updateAttendanceDateDisplay();
        loadAttendanceTimeline(currentAttendanceDate);
    }
    
    // 如果不在任何特定标签，只刷新日期显示
    updateAttendanceDateDisplay();
}
function refreshUIText() {
    // 刷新余额显示等
    if (document.getElementById('myBalance')) loadMyBalance();
    if (document.getElementById('allBalances') && isManager) loadAllBalances();
    if (document.getElementById('teamCalendar')) loadTeamCalendar();
    if (document.getElementById('attendanceTimeline')) loadAttendanceTimeline(currentAttendanceDate);
    
    // 新增：刷新列表文字
    if (document.getElementById('myLeaveRequests')) loadMyLeaveRequests();
    if (isManager) {
        if (document.getElementById('pendingLeaveRequests')) loadPendingLeaveRequests();
        if (document.getElementById('pendingCancelList')) loadPendingCancelRequests();
        if (document.getElementById('abnormalHoursList')) loadAbnormalHours();
    }
}

// ============================================================================
// 权限设置
// ============================================================================
function setupPermissions() {
    const canApprove = isManager;
    
    const teamLeavesTab = document.getElementById('teamTab');
    const pendingAttendanceTab = document.getElementById('pendingAttendanceTab');
    const balancesTab = document.getElementById('balancesTab');
    const abnormalHoursTab = document.getElementById('abnormalHoursTab');
    const pendingCancelTab = document.getElementById('pendingCancelTab');
    
    if (teamLeavesTab) teamLeavesTab.style.display = canApprove ? 'inline-block' : 'none';
    if (pendingAttendanceTab) pendingAttendanceTab.style.display = 'none';
    if (balancesTab) balancesTab.style.display = canApprove ? 'inline-block' : 'none';
    if (abnormalHoursTab) abnormalHoursTab.style.display = canApprove ? 'inline-block' : 'none';
    if (pendingCancelTab) pendingCancelTab.style.display = canApprove ? 'inline-block' : 'none';
    
    const exportBtn = document.getElementById('exportExcelBtn');
    if (exportBtn) exportBtn.style.display = canApprove ? 'inline-block' : 'none';
}
// ============================================================================
// 请假类型加载
// ============================================================================
async function loadLeaveTypes() {
    const { data } = await supabase.from('leave_types').select('*').order('id');
    
    if (data) {
        const select = document.getElementById('leaveType');
        select.innerHTML = '<option value="">' + t('leave_type') + '...</option>';
        
        data.forEach(function(type) {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name_fr;
            option.dataset.needsProof = type.needs_proof;
            select.appendChild(option);
        });
        
        select.onchange = function(e) {
            const needsProof = e.target.selectedOptions[0]?.dataset.needsProof === 'true';
            document.getElementById('proofField').style.display = needsProof ? 'block' : 'none';
        };
    }
}

// ============================================================================
// 工作天数计算
// ============================================================================
async function calculateWorkingDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const { data: holidays } = await supabase.from('holidays').select('month_day');
    
    let days = 0;
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay();
        const md = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const isHoliday = holidays?.some(function(h) { return h.month_day === md; });
        
        if (dow !== 0 && dow !== 6 && !isHoliday) {
            days++;
        }
    }
    
    return days;
}

async function updateDays() {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    
    if (start && end) {
        const days = await calculateWorkingDays(start, end);
        document.getElementById('daysCount').value = days;
    } else {
        document.getElementById('daysCount').value = '0';
    }
}

document.getElementById('startDate')?.addEventListener('change', updateDays);
document.getElementById('endDate')?.addEventListener('change', updateDays);

// ============================================================================
// 每月自动添加假期
// ============================================================================
async function checkAndAddMonthlyLeave() {
    const today = new Date();
    if (today.getDate() !== 1) return;
    
    const todayStr = getTodayDate();
    const { data: setting } = await supabase.from('system_settings').select('value').eq('key', 'last_monthly_leave_added').single();
    
    if (setting?.value === todayStr) return;
    
    const { data: users } = await supabase.from('users').select('id, conges_payes');
    
    for (const user of users) {
        const newBalance = (user.conges_payes || 0) + 2.5;
        await supabase.from('users').update({ conges_payes: newBalance }).eq('id', user.id);
    }
    
    if (setting) {
        await supabase.from('system_settings').update({ value: todayStr }).eq('key', 'last_monthly_leave_added');
    } else {
        await supabase.from('system_settings').insert({ key: 'last_monthly_leave_added', value: todayStr });
    }
    
    showToast('✅ 2.5 jours ajoutés', 'success');
}

// ============================================================================
// 提交请假
// ============================================================================
document.getElementById('submitLeaveBtn')?.addEventListener('click', async function() {
    const typeId = parseInt(document.getElementById('leaveType').value);
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    const days = parseFloat(document.getElementById('daysCount').value);
    const reason = document.getElementById('reason').value || null;
    const proof = document.getElementById('proofUrl')?.value || null;
    
    // 验证必填字段
    if (!typeId || !start || !end || !days) {
        showToast('请填写所有必填字段', 'error');
        return;
    }
    
    // 不能申请过去的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(start);
    if (startDate < today) {
        showToast('不能申请过去的日期', 'error');
        return;
    }
    
    // ========== 检查请假日期冲突 ==========
    const { data: conflicts, error: conflictError } = await supabase
        .from('leave_requests')
        .select('id, status, start_date, end_date')
        .eq('user_id', currentUserId)
        .in('status', ['en_attente', 'approuve'])
        .lte('start_date', end)
        .gte('end_date', start);
    
    if (conflictError) {
        console.error('检查冲突失败:', conflictError);
    }
    
    if (conflicts && conflicts.length > 0) {
        let conflictMsg = '请假日期与已有申请冲突：\n';
        conflicts.forEach(function(c) {
            conflictMsg += '📅 ' + c.start_date + ' 至 ' + c.end_date + ' (' + (c.status === 'approuve' ? '已批准' : '待审批') + ')\n';
        });
        showToast(conflictMsg, 'error');
        return;
    }
    
    // ========== 检查余额（仅带薪假）==========
    const { data: leaveType } = await supabase
        .from('leave_types')
        .select('name_fr')
        .eq('id', typeId)
        .single();
    
    if (leaveType && leaveType.name_fr === 'Congés payés') {
        const { data: user } = await supabase
            .from('users')
            .select('conges_payes')
            .eq('id', currentUserId)
            .single();
        
        if (user && user.conges_payes < days) {
            showToast('余额不足，无法申请（当前余额：' + user.conges_payes + ' 天）', 'error');
            return;
        }
    }
    
    // 提交请假申请
    const { error } = await supabase.from('leave_requests').insert([{
        user_id: currentUserId,
        leave_type_id: typeId,
        start_date: start,
        end_date: end,
        days_count: days,
        reason: reason,
        proof_url: proof,
        status: 'en_attente'
    }]);
    
    if (!error) {
        showToast('申请已提交', 'success');
        
        // 清空表单
        document.getElementById('leaveType').value = '';
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('reason').value = '';
        document.getElementById('daysCount').value = '0';
        document.getElementById('proofField').style.display = 'none';
        
        // 刷新数据
        await loadMyLeaveRequests();
        await loadTeamCalendar();
        if (isManager) await updateTabBadges();
    } else {
        showToast('提交失败: ' + error.message, 'error');
    }
});

// ============================================================================
// 我的余额
// ============================================================================
async function loadMyBalance() {
    const { data: user } = await supabase.from('users').select('conges_payes').eq('id', currentUserId).single();
    
    if (user) {
        document.getElementById('myBalance').innerHTML = '<div class="balance-card">' +
            '<div class="balance-header"><span>' + t('remaining_leave') + '</span><span>' + new Date().getFullYear() + '</span></div>' +
            '<div class="balance-numbers"><div class="balance-item"><div class="balance-value">' + user.conges_payes + '</div><div class="balance-label">' + t('days') + '</div></div></div>' +
            '</div>';
    }
}

// ============================================================================
// 我的请假历史（使用 leave_details 视图）
// ============================================================================
async function loadMyLeaveRequests() {
    const { data } = await supabase
        .from('leave_details')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });
    
    const container = document.getElementById('myLeaveRequests');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state">' + t('no_data') + '</div>';
        return;
    }
    
    const statusLabels = {
        en_attente: t('status_en_attente'),
        approuve: t('status_approuve'),
        refuse: t('status_refuse'),
        annule: t('status_annule'),
        pending_cancel: t('status_pending_cancel')
    };
    
    const statusColors = {
        en_attente: '#f39c12',
        approuve: '#27ae60',
        refuse: '#e74c3c',
        annule: '#95a5a6',
        pending_cancel: '#f39c12'
    };
    
    const today = getTodayDate();
    
    container.innerHTML = data.map(function(req) {
        let actions = '';
        
        if (req.status === 'en_attente') {
            actions = '<div class="request-actions"><button class="btn-cancel" onclick="cancelLeaveRequest(' + req.id + ')">🗑️ ' + t('cancel') + '</button></div>';
        } else if (req.status === 'approuve') {
            // 只有结束日期在今天之后的假期才能申请取消
            if (req.end_date > today) {
                actions = '<div class="request-actions"><button class="btn-cancel" onclick="requestCancelLeave(' + req.id + ')">📝 ' + t('request_cancel') + '</button></div>';
            } else {
                actions = '<div class="request-actions"><button class="btn-cancel" disabled style="background:#95a5a6; cursor:not-allowed;">🔒 '+ t('expired')+'</button></div>';
            }
        } else if (req.status === 'pending_cancel') {
    actions = '<div class="request-actions"><button class="btn-cancel" disabled style="background:#95a5a6; cursor:not-allowed;">⏳ ' + t('waiting_approval') + '</button></div>';
}
        
        return '<div class="leave-request-card ' + req.status + '" style="border-left-color: ' + statusColors[req.status] + '">' +
            '<div class="request-header">' +
                '<span class="request-user">' + (req.leave_type_name || 'Congé') + '</span>' +
                '<span class="request-type" style="background: ' + statusColors[req.status] + '">' + statusLabels[req.status] + '</span>' +
            '</div>' +
            '<div class="request-dates">📅 ' + new Date(req.start_date).toLocaleDateString() + ' - ' + new Date(req.end_date).toLocaleDateString() + ' (' + req.days_count + ' ' + t('days') + ')</div>' +
            (req.reason ? '<div class="request-reason">💬 ' + escapeHtml(req.reason) + '</div>' : '') +
            actions +
        '</div>';
    }).join('');
}
window.cancelLeaveRequest = async function(id) {
    const confirmed = await showConfirm('confirm_cancel_title', 'confirm_cancel_message');
    if (!confirmed) return;
    
    // 先获取假期信息，判断是否是带薪假且已批准
    const { data: leave } = await supabase
        .from('leave_requests')
        .select('status, leave_type_id, days_count')
        .eq('id', id)
        .single();
    
    // 如果是已批准的带薪假，需要退还余额
    if (leave && leave.status === 'approuve') {
        const { data: leaveType } = await supabase
            .from('leave_types')
            .select('name_fr')
            .eq('id', leave.leave_type_id)
            .single();
        
        if (leaveType && leaveType.name_fr === 'Congés payés') {
            const { data: user } = await supabase
                .from('users')
                .select('conges_payes')
                .eq('id', currentUserId)
                .single();
            const newBalance = (user.conges_payes || 0) + leave.days_count;
            await supabase.from('users').update({ conges_payes: newBalance }).eq('id', currentUserId);
        }
    }
    
    const { error } = await supabase.from('leave_requests').update({ status: 'annule' }).eq('id', id);
    
    if (error) {
        showToast('取消失败: ' + error.message, 'error');
    } else {
        showToast(t('cancelled'), 'info');
        await loadMyLeaveRequests();
        await loadTeamCalendar();
        if (isManager) {
            await loadPendingLeaveRequests();
            await updateTabBadges();
        }
    }
};
window.approveCancelLeave = async function(id, daysCount, leaveTypeName, userId) {
    if (leaveTypeName === 'Congés payés') {
        const { data: user } = await supabase
            .from('users')
            .select('conges_payes')
            .eq('id', userId)
            .single();
        
        const newBalance = (user.conges_payes || 0) + daysCount;
        await supabase.from('users').update({ conges_payes: newBalance }).eq('id', userId);
        showToast(t('cancel_approved_refund').replace('{days}', daysCount), 'success');
    } else {
        showToast(t('cancel_approved_no_refund'), 'success');
    }
    
    await supabase.from('leave_requests').update({ status: 'annule' }).eq('id', id);
    
    // 延迟后刷新整个页面
    setTimeout(() => {
        location.reload();
    }, 500);
};
window.rejectCancelLeave = async function(id) {
    await supabase
        .from('leave_requests')
        .update({ status: 'approuve', cancel_reason: null })
        .eq('id', id);
    
    showToast(t('cancel_rejected'), 'info');
    
    setTimeout(() => {
        location.reload();
    }, 500);
};
window.rejectLeave = async function(id) {
    await supabase.from('leave_requests').update({
        status: 'refuse',
        approver_id: currentUserId,
        approved_at: new Date()
    }).eq('id', id);
    
    showToast(t('reject'), 'info');
    
    setTimeout(() => {
        location.reload();
    }, 500);
};
window.requestCancelLeave = async function(id) {
    const confirmed = await showConfirm('confirm_request_cancel_title', 'confirm_request_cancel_message');
    if (!confirmed) return;
    
    const { error } = await supabase
        .from('leave_requests')
        .update({ 
            status: 'pending_cancel',
            cancel_requested_at: new Date()
        })
        .eq('id', id);
    
    if (error) {
        showToast(t('request_cancel_failed') + ': ' + error.message, 'error');
    } else {
        showToast(t('request_cancel_success'), 'success');
        
        setTimeout(() => {
            location.reload();
        }, 500);
    }
};

async function loadPendingCancelRequests() {
    if (!isManager) return;
    
    const { data, error } = await supabase
        .from('leave_details')
        .select('*')
        .eq('status', 'pending_cancel')
        .order('created_at', { ascending: false });
    
    const container = document.getElementById('pendingCancelList');
    
    if (!container) return;
    
    if (error) {
        console.error('加载待批取消失败:', error);
        container.innerHTML = '<div class="empty-state">❌ 加载失败</div>';
        return;
    }
    
    if (!data || data.length === 0) {
    container.innerHTML = '<div class="empty-state">✅ ' + t('no_pending_cancel') + '</div>';
    return;
}
    
    container.innerHTML = data.map(function(r) {
        const isPaidLeave = r.leave_type_name === 'Congés payés';
        const balanceText = isPaidLeave 
            ? '<div style="color:#e67e22;">💰 批准后将退还 ' + r.days_count + ' 天余额</div>' 
            : '<div style="color:#666;">📋 非带薪假，不退还余额</div>';
        
        return '<div class="leave-request-card en_attente">' +
            '<div class="request-header">' +
                '<span class="request-user">👤 ' + (r.user_name || '用户ID:' + r.user_id) + '</span>' +
                '<span class="request-type" style="background:#f39c12;">⏳ 申请取消</span>' +
            '</div>' +
            '<div class="request-dates">📅 ' + new Date(r.start_date).toLocaleDateString() + ' - ' + new Date(r.end_date).toLocaleDateString() + ' (' + r.days_count + ' ' + t('days') + ')</div>' +
            '<div><strong>' + t('leave_type') + ':</strong> ' + (r.leave_type_name || '未知') + '</div>' +
            balanceText +
            '<div class="request-actions">' +
                '<button class="btn-validate" onclick="approveCancelLeave(' + r.id + ', ' + r.days_count + ', \'' + r.leave_type_name + '\', ' + r.user_id + ')">✅ ' + t('approve') + '</button>' +
                '<button class="btn-refuse" onclick="rejectCancelLeave(' + r.id + ')">❌ ' + t('reject') + '</button>' +
            '</div>' +
        '</div>';
    }).join('');
}
// ============================================================================
// 今日打卡记录
// ============================================================================
async function loadMyAttendance() {
    const today = getTodayDate();
    const historyDiv = document.getElementById('attendanceHistory');
    
    if (!historyDiv) return;
    
    try {
        const { data, error } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('user_id', currentUserId)
            .eq('record_date', today)
            .order('action_time', { ascending: true });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            historyDiv.innerHTML = '<div class="history-item">📭 ' + t('no_data') + '</div>';
            return;
        }
        
        const typeMap = {
            check_in: t('check_in'),
            check_out: t('check_out'),
            break_start: t('break_start'),
            break_end: t('break_end')
        };
        
        const typeClass = {
            check_in: 'check_in',
            check_out: 'check_out',
            break_start: 'break_start',
            break_end: 'break_end'
        };
        
        historyDiv.innerHTML = data.map(function(record) {
            const time = new Date(record.action_time).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            return '<div class="history-item">' +
                '<span class="history-time">🕐 ' + time + '</span>' +
                '<span class="history-type ' + typeClass[record.action_type] + '">' + typeMap[record.action_type] + '</span>' +
            '</div>';
        }).join('');
        
    } catch(e) {
        console.error('加载打卡记录失败:', e);
        historyDiv.innerHTML = '<div class="history-item">⚠️ 加载失败</div>';
    }
}

// ============================================================================
// 团队日历
// ============================================================================
window.changeMonth = async function(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    await loadTeamCalendar();
};

// ============================================================================
// 团队日历（参考异常表）
// ============================================================================
window.changeMonth = async function(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    await loadTeamCalendar();
};

// ============================================================================
// 团队日历（完整重写版）
async function loadTeamCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    document.getElementById('currentMonthDisplay').textContent = currentCalendarDate.toLocaleDateString(
        currentLanguage === 'zh' ? 'zh-CN' : currentLanguage === 'fr' ? 'fr-FR' : 'en-US',
        { month: 'long', year: 'numeric' }
    );
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const { data: users } = await supabase.from('users').select('id, username, user_type').order('username');
    const { data: fixedHolidays } = await supabase.from('holidays').select('month_day');
    
    const start = year + '-' + String(month + 1).padStart(2, '0') + '-01';
    const end = year + '-' + String(month + 1).padStart(2, '0') + '-' + daysInMonth;
    
    // 获取所有数据
    const [attendanceRecords, leaveRequests, overrides, anomalies] = await Promise.all([
        supabase.from('attendance_records').select('*').gte('record_date', start).lte('record_date', end),
        supabase.from('leave_details').select('*').eq('status', 'approuve'),
        supabase.from('attendance_overrides').select('*').gte('override_date', start).lte('override_date', end),
        supabase.from('attendance_anomalies').select('*').eq('status', 'pending').gte('record_date', start).lte('record_date', end)
    ]);
    
    const attendanceData = attendanceRecords.data || [];
    const leaveData = leaveRequests.data || [];
    const overrideData = overrides.data || [];
    const anomalyData = anomalies.data || [];
    
    // 构建请假 Map - 展开日期范围，但标记为请假类型
    const leaveMap = new Map();
    for (const leave of leaveData) {
        const leaveStart = new Date(leave.start_date);
        const leaveEnd = new Date(leave.end_date);
        
        for (let d = new Date(leaveStart); d <= leaveEnd; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const key = `${leave.user_id}_${dateStr}`;
            leaveMap.set(key, leave);
        }
    }
    
    // 构建打卡 Map
    const attendanceMap = new Map();
    for (const r of attendanceData) {
        const key = `${r.user_id}_${r.record_date}`;
        if (!attendanceMap.has(key)) attendanceMap.set(key, []);
        attendanceMap.get(key).push(r);
    }
    
    // 构建手动覆盖 Map
    const overrideMap = new Map();
    for (const r of overrideData) {
        const key = `${r.user_id}_${r.override_date}`;
        overrideMap.set(key, r);
    }
    
    // 构建异常 Map
    const anomalyMap = new Map();
    for (const r of anomalyData) {
        const key = `${r.user_id}_${r.record_date}`;
        anomalyMap.set(key, r);
    }
    
    // 计算移动节假日
    function getEasterDate(y) {
        const a = y % 19;
        const b = Math.floor(y / 100);
        const c = y % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const monthNum = Math.floor((h + l - 7 * m + 114) / 31);
        const dayNum = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(y, monthNum - 1, dayNum);
    }
    
    const easter = getEasterDate(year);
    const movableHolidays = [
        new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 1),
        new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 39),
        new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 50)
    ];
    
    function isMovableHoliday(day, month, year) {
        return movableHolidays.some(d => d.getFullYear() === year && d.getMonth() === month && d.getDate() === day);
    }
    
    // 生成表头
    let headers = '<th style="position:sticky; left:0; background:#2f6d9e; z-index:11;">' + 
        (currentLanguage === 'zh' ? '员工' : currentLanguage === 'fr' ? 'Employé' : 'Employee') + '</th>';
    
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        headers += '<th' + (isWeekend ? ' style="background:#4a6f8f;"' : '') + ' data-day="' + d + '">' +
            '<span class="day-number">' + d + '</span>' +
            '<span class="day-week">' + date.toLocaleDateString(
                currentLanguage === 'zh' ? 'zh-CN' : currentLanguage === 'fr' ? 'fr-FR' : 'en-US',
                { weekday: 'short' }
            ) + '</span>' +
        '</th>';
    }
    document.getElementById('calendarHeader').innerHTML = '<tr>' + headers + '</tr>';
    
    // 生成表格内容
    const tbody = document.getElementById('calendarBody');
    tbody.innerHTML = '';
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    for (const user of users) {
        let rowHtml = '<td style="position:sticky; left:0; background:#e8f0fe; z-index:10;">' +
            '<span class="user-name">' + escapeHtml(user.username) + '</span>' +
        '</td>';
        
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            const date = new Date(year, month, d);
            const md = String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isFixedHoliday = fixedHolidays?.some(h => h.month_day === md);
            const isMovable = isMovableHoliday(d, month, year);
            const isHoliday = isFixedHoliday || isMovable;
            
            // 优先级1: 手动覆盖（管理员强制设置）
            const override = overrideMap.get(`${user.id}_${dateStr}`);
            if (override) {
                const map = { present: '✓', absent: '✗', mission: '🚚', sick: '🤒', halfday: '½' };
                const cls = { present: 'status-working', absent: 'status-absent', mission: 'status-mission', sick: 'status-sick', halfday: 'status-halfday' };
                const statusClass = cls[override.override_status] || 'status-absent';
                const statusText = map[override.override_status] || '?';
                rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\')">' +
                    '<span class="' + statusClass + '">' + statusText + '</span>' +
                '<\/td>';
                continue;
            }
            
            // 优先级2: 异常表（pending状态的异常）- 点击跳转
            const anomaly = anomalyMap.get(`${user.id}_${dateStr}`);
            if (anomaly) {
                rowHtml += '<td class="status-cell anomaly" onclick="gotoAbnormalHours()" style="cursor:pointer;" title="点击前往处理异常">' +
                    '<span class="status-mission">⚠️</span>' +
                '<\/td>';
                continue;
            }
            
            // 优先级3: 周末或节假日 - 优先于请假显示
            if (isWeekend) {
                rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\')">' +
                    '<span class="status-weekend">🌙</span>' +
                '<\/td>';
                continue;
            }
            
            if (isHoliday) {
                rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\')">' +
                    '<span class="status-holiday">🏖️</span>' +
                '<\/td>';
                continue;
            }
            
            // 优先级4: 已批准请假（只在工作日显示）
            const leave = leaveMap.get(`${user.id}_${dateStr}`);
            if (leave) {
                rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\')">' +
                    '<span class="status-leave">🏖️</span>' +
                '<\/td>';
                continue;
            }
            
            // 优先级5: 打卡记录
            const records = attendanceMap.get(`${user.id}_${dateStr}`) || [];
            const hasCheckIn = records.some(r => r.action_type === 'check_in');
            const checkOutRecord = records.find(r => r.action_type === 'check_out');
            
            if (hasCheckIn) {
                if (!checkOutRecord) {
                    rowHtml += '<td class="status-cell anomaly" onclick="gotoAbnormalHours()" style="cursor:pointer;" title="点击前往处理异常">' +
                        '<span class="status-mission">⚠️</span>' +
                    '<\/td>';
                } else if (checkOutRecord.work_hours && checkOutRecord.work_hours < 8) {
                    rowHtml += '<td class="status-cell anomaly" onclick="gotoAbnormalHours()" style="cursor:pointer;" title="点击前往处理异常">' +
                        '<span class="status-mission">⚠️</span>' +
                    '<\/td>';
                } else {
                    rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\')">' +
                        '<span class="status-working">✓</span>' +
                    '<\/td>';
                }
                continue;
            }
            
            // 优先级6: 缺勤
            rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\')">' +
                '<span class="status-absent">✗</span>' +
            '<\/td>';
        }
        tbody.innerHTML += '<tr>' + rowHtml + '</tr>';
    }
    
    // 滚动到当天
    setTimeout(function() {
        if (year === currentYear && month === currentMonth) {
            const targetCell = document.querySelector('#calendarBody td.status-cell:nth-child(' + (currentDay + 1) + ')');
            if (targetCell) {
                targetCell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, 150);
}

// ============================================================================
// 跳转到异常处理页面
// ============================================================================
function gotoAbnormalHours() {
    // 切换到 Abnormal Hours 标签页
    const abnormalTab = document.querySelector('.tab-btn[data-tab="abnormal-hours"]');
    if (abnormalTab) {
        abnormalTab.click();
        
        // 可选：滚动到异常列表顶部
        setTimeout(() => {
            const abnormalList = document.getElementById('abnormalHoursList');
            if (abnormalList) {
                abnormalList.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            showToast('请处理工时异常', 'info');
        }, 100);
    }
}
// ============================================================================
// 手动修改出勤
// ============================================================================
window.editUserAttendance = async function(userId, userName, year, month) {
    if (!canEditAttendance) return;
    
    const day = prompt('为 ' + userName + ' 选择日期 (1-31)', '1');
    if (!day) return;
    
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    quickEditAttendance(userId, dateStr);
};

// ============================================================================
// 快速修改出勤状态（仅用于非异常格子）
// ============================================================================
// ============================================================================
// 快速修改出勤状态（修复保存失败问题 - 适配表结构）
// ============================================================================
window.quickEditAttendance = async function(userId, dateStr) {
    if (!canEditAttendance) return;
    
    // 检查当天是否有 pending 异常
    const { data: anomaly } = await supabase
        .from('attendance_anomalies')
        .select('id, anomaly_type')
        .eq('user_id', userId)
        .eq('record_date', dateStr)
        .eq('status', 'pending')
        .maybeSingle();
    
    // 如果有异常，提示去异常页面处理
    if (anomaly) {
        const anomalyTypeText = anomaly.anomaly_type === 'missing_checkout' ? '缺少下班打卡' : '工时不足';
        showToast(`该日期存在异常: ${anomalyTypeText}，请前往"工时异常"页面处理`, 'error');
        gotoAbnormalHours();
        return;
    }
    
    // 检查当天是否有手动覆盖（如果有，显示当前状态）
    const { data: existingOverride } = await supabase
        .from('attendance_overrides')
        .select('override_status')
        .eq('user_id', userId)
        .eq('override_date', dateStr)
        .maybeSingle();
    
    const currentStatus = existingOverride?.override_status || 'default';
    
    // 状态选项映射
    const statusOptions = [
        { value: 'present', label: '✅ 正常出勤' },
        { value: 'absent', label: '❌ 缺勤' },
        { value: 'mission', label: '🚚 外勤' },
        { value: 'sick', label: '🤒 病假' },
        { value: 'halfday', label: '⏸️ 半天' },
        { value: 'default', label: '🔄 恢复默认（自动识别）' }
    ];
    
    // 显示当前状态
    const currentStatusText = statusOptions.find(o => o.value === currentStatus)?.label || '未设置';
    
    const result = await showModal({
        icon: 'info',
        title: '修改出勤状态',
        message: `日期: ${dateStr}\n当前状态: ${currentStatusText}`,
        select: {
            options: statusOptions
        },
        buttons: [
            { text: t('save'), type: 'primary', value: 'save' },
            { text: t('cancel'), type: 'cancel', value: 'cancel' }
        ]
    });
    
    if (result.button === 'cancel') return;
    
    const selectedStatus = result.selectValue;
    
    // ========== 处理恢复默认 ==========
    if (selectedStatus === 'default') {
        // 1. 删除手动覆盖记录
        const { error: deleteError } = await supabase
            .from('attendance_overrides')
            .delete()
            .eq('user_id', userId)
            .eq('override_date', dateStr);
        
        if (deleteError) {
            console.error('删除覆盖记录失败:', deleteError);
            showToast('恢复默认失败: ' + deleteError.message, 'error');
            return;
        }
        
        // 2. 重新扫描该日期，决定是否需要创建异常
        await rescanAnomalyForDate(userId, dateStr);
        
        showToast('已恢复默认状态', 'success');
    }
    
    // ========== 处理手动设置状态 ==========
    else {
        // 使用 upsert 并指定冲突处理（适配唯一约束）
        const { error: saveError } = await supabase
            .from('attendance_overrides')
            .upsert({
                user_id: userId,
                override_date: dateStr,
                override_status: selectedStatus,
                set_by: currentUserId,
                reason: 'manual_fix',
                set_at: new Date()  // 使用 set_at 而不是 updated_at
            }, {
                onConflict: 'user_id, override_date'  // 指定冲突时更新的字段
            });
        
        if (saveError) {
            console.error('保存覆盖记录失败:', saveError);
            showToast('保存失败: ' + saveError.message, 'error');
            return;
        }
        
        // 2. 清除该日期的 pending 异常（因为已经手动覆盖了）
        const { error: updateError } = await supabase
            .from('attendance_anomalies')
            .update({ 
                status: 'resolved', 
                resolved_by: currentUserId, 
                resolved_at: new Date() 
            })
            .eq('user_id', userId)
            .eq('record_date', dateStr)
            .eq('status', 'pending');
        
        if (updateError) {
            console.error('更新异常状态失败:', updateError);
            // 不阻塞主流程，只记录错误
        }
        
        showToast('已保存', 'success');
    }
    
    // 刷新所有相关视图
    await loadTeamCalendar();
    await loadAbnormalHours();
    await updateTabBadges();
    
    // 如果当前在出勤统计页面，也刷新
    if (document.getElementById('tab-attendance-stats') && 
        document.getElementById('tab-attendance-stats').classList.contains('active')) {
        await loadAttendanceTimeline(currentAttendanceDate);
    }
};

// ============================================================================
// 重新扫描单日异常（用于恢复默认时）
// ============================================================================
async function rescanAnomalyForDate(userId, dateStr) {
    // 获取用户信息
    const { data: user } = await supabase
        .from('users')
        .select('username, user_type')
        .eq('id', userId)
        .single();
    
    // 获取当天的上班打卡
    const { data: checkIns } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', userId)
        .eq('record_date', dateStr)
        .eq('action_type', 'check_in');
    
    const checkIn = checkIns?.[0];
    
    // 没有上班打卡，不需要创建异常（显示为缺勤即可）
    if (!checkIn) {
        // 删除该日期的 pending 异常
        await supabase
            .from('attendance_anomalies')
            .update({ status: 'resolved', resolved_by: currentUserId, resolved_at: new Date() })
            .eq('user_id', userId)
            .eq('record_date', dateStr)
            .eq('status', 'pending');
        return;
    }
    
    // 获取当天下班打卡
    const { data: checkOuts } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', userId)
        .eq('record_date', dateStr)
        .eq('action_type', 'check_out');
    
    const checkOut = checkOuts?.[0];
    
    // 判断昨天及之前的日期（只有过去日期才产生 missing_checkout 异常）
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let anomalyType = null;
    let workHours = null;
    
    if (checkOut && checkOut.work_hours && checkOut.work_hours < 8) {
        // 工时不足
        anomalyType = 'short_hours';
        workHours = checkOut.work_hours;
    } else if (!checkOut && dateStr <= yesterdayStr) {
        // 缺少下班打卡（仅过去日期）
        anomalyType = 'missing_checkout';
    }
    
    if (anomalyType) {
        // 有异常：upsert 为 pending
        await supabase.from('attendance_anomalies').upsert({
            user_id: userId,
            username: user?.username,
            user_type: user?.user_type,
            record_date: dateStr,
            anomaly_type: anomalyType,
            work_hours: workHours,
            status: 'pending'
        }, { onConflict: 'user_id, record_date, anomaly_type' });
    } else {
        // 无异常：标记为 resolved
        await supabase
            .from('attendance_anomalies')
            .update({ status: 'resolved', resolved_by: currentUserId, resolved_at: new Date() })
            .eq('user_id', userId)
            .eq('record_date', dateStr)
            .eq('status', 'pending');
    }
}

// ============================================================================
// 待批请假（管理员）
// ============================================================================
async function loadPendingLeaveRequests() {
    const { data } = await supabase
        .from('leave_details')
        .select('*')
        .eq('status', 'en_attente')
        .order('created_at', { ascending: false });
    
    const container = document.getElementById('pendingLeaveRequests');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state">' + t('no_data') + '</div>';
        return;
    }
    
    container.innerHTML = data.map(function(r) {
        return '<div class="leave-request-card en_attente">' +
            '<div class="request-header">' +
                '<span class="request-user">' + (r.user_name || '用户ID:' + r.user_id) + '</span>' +
                '<span class="request-type" style="background:#f39c12;">' + t('status_en_attente') + '</span>' +
            '</div>' +
            '<div class="request-dates">📅 ' + new Date(r.start_date).toLocaleDateString() + ' - ' + new Date(r.end_date).toLocaleDateString() + ' (' + r.days_count + ' ' + t('days') + ')</div>' +
            '<div><strong>' + t('leave_type') + ':</strong> ' + (r.leave_type_name || '未知') + '</div>' +
            (r.leave_type_name === 'Congés payés' ? '<div style="color:#e67e22;">💰 将扣除余额</div>' : '<div style="color:#27ae60;">📋 不扣余额</div>') +
            (r.reason ? '<div class="request-reason">💬 ' + r.reason + '</div>' : '') +
            '<div class="request-actions">' +
                '<button class="btn-validate" onclick="approveLeave(' + r.id + ', ' + r.user_id + ', ' + r.days_count + ', \'' + r.leave_type_name + '\')">✅ ' + t('approve') + '</button>' +
                '<button class="btn-refuse" onclick="rejectLeave(' + r.id + ')">❌ ' + t('reject') + '</button>' +
            '</div>' +
        '</div>';
    }).join('');
}

window.approveLeave = async function(leaveId, userId, daysCount, leaveTypeName) {
    console.log('批准请假:', { leaveId, userId, daysCount, leaveTypeName });
    
    const isPaidLeave = leaveTypeName === 'Congés payés';
    
    if (isPaidLeave) {
        // 获取员工的当前余额
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('conges_payes')
            .eq('id', userId)
            .single();
        
        if (userError) {
            console.error('获取员工信息失败:', userError);
            showToast('获取员工信息失败', 'error');
            return;
        }
        
        const newBalance = (user.conges_payes || 0) - daysCount;
        
        if (newBalance < 0) {
            showToast('员工余额不足，无法批准（当前余额：' + (user.conges_payes || 0) + ' 天）', 'error');
            return;
        }
        
        // 扣除员工的带薪假余额
        const { error: updateError } = await supabase
            .from('users')
            .update({ conges_payes: newBalance })
            .eq('id', userId);
        
        if (updateError) {
            console.error('更新余额失败:', updateError);
            showToast('更新余额失败', 'error');
            return;
        }
        
        console.log(`已扣除员工 ${userId} 的余额: ${user.conges_payes} -> ${newBalance}`);
    }
    
    // 批准请假申请
    const { error: leaveError } = await supabase
        .from('leave_requests')
        .update({
            status: 'approuve',
            approver_id: currentUserId,
            approved_at: new Date()
        })
        .eq('id', leaveId);
    
    if (leaveError) {
        console.error('批准请假失败:', leaveError);
        showToast('批准失败: ' + leaveError.message, 'error');
        return;
    }
    
    showToast(t('approve') + ' ✅', 'success');
    
    // 刷新所有相关数据
    await loadPendingLeaveRequests();
    await loadTeamCalendar();
    await loadAllBalances();
    await updateTabBadges();
    
    // 如果当前在日历标签页，确保刷新
    if (document.getElementById('tab-team-calendar') && 
        document.getElementById('tab-team-calendar').classList.contains('active')) {
        await loadTeamCalendar();
    }
};


// ============================================================================
// 工时异常
// ============================================================================
async function loadAbnormalHours() {
    if (!isManager) return;
    
    const { data: anomalies } = await supabase
        .from('attendance_anomalies')
        .select('*')
        .eq('status', 'pending')
        .order('record_date', { ascending: false });
    
    const container = document.getElementById('abnormalHoursList');
    if (!container) return;
    
    if (!anomalies || anomalies.length === 0) {
        container.innerHTML = '<div class="empty-state">✅ ' + t('no_abnormal_records') + '</div>';
        return;
    }
    
    container.innerHTML = anomalies.map(function(r) {
        let reasonText = '';
        if (r.anomaly_type === 'missing_checkout') {
            reasonText = '❌ ' + t('missing_checkout');
        } else {
            reasonText = '⚠️ ' + t('work_hours_insufficient') + ' (' + (r.work_hours || 0).toFixed(1) + 'h)';
        }
        
        return '<div class="leave-request-card en_attente">' +
            '<div class="request-header">' +
                '<span class="request-user">👤 ' + escapeHtml(r.username) + '</span>' +
                '<span class="request-type" style="background:#f39c12;">⚠️ ' + t('need_review_yes') + '</span>' +
            '</div>' +
            '<div class="request-dates">📅 ' + new Date(r.record_date).toLocaleDateString() + '</div>' +
            '<div class="request-reason">' + reasonText + '</div>' +
            '<div class="request-actions">' +
                '<button class="btn-validate" onclick="resolveAnomaly(' + r.id + ', \'' + r.anomaly_type + '\', ' + r.user_id + ', \'' + r.record_date + '\')">✅ ' + t('confirm_normal') + '</button>' +
                '<button class="btn-refuse" onclick="ignoreAnomaly(' + r.id + ')">❌ ' + t('marked_absent') + '</button>' +
            '</div>' +
        '</div>';
    }).join('');
}
async function scanAndRecordAnomalies() {
    if (!isManager) return;
    
    // 扫描最近30天
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = startDate.toISOString().split('T')[0];
    const today = getTodayDate();
    
    // 昨天及之前的日期（用于 missing_checkout）
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // 获取所有上班打卡（最近30天，包括今天）
    const { data: checkIns } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('action_type', 'check_in')
        .gte('record_date', startDateStr)
        .lte('record_date', today);
    
    // 获取所有下班打卡（最近30天，包括今天）
    const { data: checkOuts } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('action_type', 'check_out')
        .gte('record_date', startDateStr)
        .lte('record_date', today);
    
    // 获取已存在的异常记录
    const { data: existingAnomalies } = await supabase
        .from('attendance_anomalies')
        .select('user_id, record_date, anomaly_type')
        .gte('record_date', startDateStr);
    
    const existingKeySet = new Set();
    for (const a of existingAnomalies || []) {
        existingKeySet.add(`${a.user_id}_${a.record_date}_${a.anomaly_type}`);
    }
    
    const newAnomalies = [];
    
    for (const checkIn of checkIns || []) {
        const checkOut = checkOuts?.find(co => 
            co.user_id === checkIn.user_id && 
            co.record_date === checkIn.record_date
        );
        
        // 1. 处理工时不足（short_hours）- 所有日期都处理
        if (checkOut && checkOut.work_hours && checkOut.work_hours < 8) {
            const key = `${checkIn.user_id}_${checkIn.record_date}_short_hours`;
            if (!existingKeySet.has(key)) {
                newAnomalies.push({
                    user_id: checkIn.user_id,
                    username: checkIn.username,
                    user_type: checkIn.user_type,
                    record_date: checkIn.record_date,
                    anomaly_type: 'short_hours',
                    work_hours: checkOut.work_hours,
                    status: 'pending'
                });
            }
        }
        
        // 2. 处理缺少下班打卡（missing_checkout）- 只处理昨天及之前
        if (!checkOut && checkIn.record_date <= yesterdayStr) {
            const key = `${checkIn.user_id}_${checkIn.record_date}_missing_checkout`;
            if (!existingKeySet.has(key)) {
                newAnomalies.push({
                    user_id: checkIn.user_id,
                    username: checkIn.username,
                    user_type: checkIn.user_type,
                    record_date: checkIn.record_date,
                    anomaly_type: 'missing_checkout',
                    work_hours: null,
                    status: 'pending'
                });
            }
        }
    }
    
    // 批量插入新异常
    if (newAnomalies.length > 0) {
        const { error } = await supabase.from('attendance_anomalies').insert(newAnomalies);
        if (error) {
            console.error('插入异常记录失败:', error);
        } else {
            console.log(`✅ 新增 ${newAnomalies.length} 条异常记录`);
        }
    }
}
// 确认为正常（补打下班卡或标记为正常）
window.fixAbnormalAttendance = async function(userId, recordDate, type) {
    if (type === 'missing_checkout') {
        // 提示管理员输入下班时间
        const time = prompt('请输入下班时间 (格式: 18:00)', '18:00');
        if (!time) return;
        
        const [hours, minutes] = time.split(':');
        const checkOutTime = new Date(`${recordDate}T${hours}:${minutes}:00`);
        
        // 获取当天的上班打卡记录
        const { data: checkIn } = await supabase
            .from('attendance_records')
            .select('action_time')
            .eq('user_id', userId)
            .eq('record_date', recordDate)
            .eq('action_type', 'check_in')
            .single();
        
        if (checkIn) {
            // 计算工作时长
            const checkInTime = new Date(checkIn.action_time);
            let workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
            workHours = Math.max(0, Math.round(workHours * 10) / 10);
            
            // 创建下班打卡记录
            await supabase.from('attendance_records').insert({
                user_id: userId,
                record_date: recordDate,
                action_type: 'check_out',
                action_time: checkOutTime.toISOString(),
                work_hours: workHours,
                need_review: false,
                status: 'normal',
                is_valid: true
            });
        }
    }
    
    showToast(t('approved_normal'), 'success');
    await loadAbnormalHours();
    await loadTeamCalendar();
    await updateTabBadges();
};

// 标记为缺勤
window.markAsAbsent = async function(userId, recordDate) {
    // 删除当天的异常记录（如果有）
    await supabase
        .from('attendance_records')
        .delete()
        .eq('user_id', userId)
        .eq('record_date', recordDate)
        .eq('action_type', 'check_out');
    
    // 添加手动覆盖
    const { data: existing } = await supabase
        .from('attendance_overrides')
        .select('id')
        .eq('user_id', userId)
        .eq('override_date', recordDate)
        .maybeSingle();
    
    if (existing) {
        await supabase.from('attendance_overrides').update({
            override_status: 'absent',
            set_by: currentUserId,
            reason: t('marked_absent')
        }).eq('id', existing.id);
    } else {
        await supabase.from('attendance_overrides').insert({
            user_id: userId,
            override_date: recordDate,
            override_status: 'absent',
            set_by: currentUserId,
            reason: t('marked_absent')
        });
    }
    
    showToast(t('marked_absent'), 'info');
    await loadAbnormalHours();
    await loadTeamCalendar();
    await updateTabBadges();
};

window.rejectAbnormalHours = async function(id, userId, dateStr) {
    // 1. 删除异常记录
    await supabase.from('attendance_records').delete().eq('id', id);
    
    // 2. 检查是否已有覆盖记录
    const { data: existing } = await supabase
        .from('attendance_overrides')
        .select('id')
        .eq('user_id', userId)
        .eq('override_date', dateStr)
        .maybeSingle();
    
    // 3. 添加或更新缺勤覆盖
    if (existing) {
        await supabase.from('attendance_overrides').update({
            override_status: 'absent',
            set_by: currentUserId,
            reason: t('marked_absent')
        }).eq('id', existing.id);
    } else {
        await supabase.from('attendance_overrides').insert({
            user_id: userId,
            override_date: dateStr,
            override_status: 'absent',
            set_by: currentUserId,
            reason: t('marked_absent')
        });
    }
    
    showToast(t('marked_absent'), 'info');
    
    await loadAbnormalHours();
    await loadTeamCalendar();
    await updateTabBadges();
};
// ============================================================================
// 确认工时正常
// ============================================================================
window.confirmNormalHours = async function(id) {
    console.log('confirmNormalHours 被调用, ID:', id);
    
    // 先获取当前记录，确保有所有必要字段
    const { data: record, error: fetchError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('id', id)
        .single();
    
    if (fetchError) {
        console.error('获取记录失败:', fetchError);
        showToast('获取记录失败: ' + fetchError.message, 'error');
        return;
    }
    
    if (!record) {
        showToast('记录不存在', 'error');
        return;
    }
    
    // 更新时保留所有原有字段，只修改 need_review 和 status
    const { error } = await supabase
        .from('attendance_records')
        .update({
            need_review: false,
            status: 'normal',
            work_hours: record.work_hours,     // 保留原有
            user_id: record.user_id,           // 保留原有
            username: record.username,         // 保留原有
            user_type: record.user_type,       // 保留原有
            record_date: record.record_date,   // 保留原有
            action_type: record.action_type,   // 保留原有
            action_time: record.action_time,   // 保留原有
            is_valid: record.is_valid          // 保留原有
        })
        .eq('id', id);
    
    if (error) {
        console.error('更新失败:', error);
        showToast(t('error') + ': ' + error.message, 'error');
    } else {
        showToast(t('approved_normal'), 'success');
        await loadAbnormalHours();
        await loadTeamCalendar();
        await updateTabBadges();
    }
};
// 确认为正常（解决异常）
window.resolveAnomaly = async function(anomalyId, anomalyType, userId, recordDate) {
    let overrideStatus = 'present';  // 默认出勤
    
    if (anomalyType === 'missing_checkout') {
        // 提示输入下班时间
        const time = prompt('请输入下班时间 (格式: 18:00)', '18:00');
        if (!time) return;
        
        const [hours, minutes] = time.split(':');
        const checkOutTime = new Date(`${recordDate}T${hours}:${minutes}:00`);
        
        // 获取上班打卡
        const { data: checkIn } = await supabase
            .from('attendance_records')
            .select('action_time')
            .eq('user_id', userId)
            .eq('record_date', recordDate)
            .eq('action_type', 'check_in')
            .single();
        
        if (checkIn) {
            const checkInTime = new Date(checkIn.action_time);
            let workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
            workHours = Math.max(0, Math.round(workHours * 10) / 10);
            
            // 创建下班打卡记录
            await supabase.from('attendance_records').insert({
                user_id: userId,
                record_date: recordDate,
                action_type: 'check_out',
                action_time: checkOutTime.toISOString(),
                work_hours: workHours,
                need_review: false,
                status: 'normal',
                is_valid: true
            });
        }
        
        overrideStatus = 'present';
    } 
    else if (anomalyType === 'short_hours') {
        // 工时不足，确认为正常出勤
        overrideStatus = 'present';
    }
    
    // 1. 写入 attendance_overrides（管理员干预）
    const { data: existing } = await supabase
        .from('attendance_overrides')
        .select('id')
        .eq('user_id', userId)
        .eq('override_date', recordDate)
        .maybeSingle();
    
    if (existing) {
        await supabase.from('attendance_overrides').update({
            override_status: overrideStatus,
            set_by: currentUserId,
            reason: '异常处理：确认为正常'
        }).eq('id', existing.id);
    } else {
        await supabase.from('attendance_overrides').insert({
            user_id: userId,
            override_date: recordDate,
            override_status: overrideStatus,
            set_by: currentUserId,
            reason: '异常处理：确认为正常'
        });
    }
    
    // 2. 更新异常状态为已解决
    await supabase
        .from('attendance_anomalies')
        .update({ 
            status: 'resolved', 
            resolved_by: currentUserId, 
            resolved_at: new Date() 
        })
        .eq('id', anomalyId);
    
    showToast(t('approved_normal'), 'success');
    await loadAbnormalHours();
    await loadTeamCalendar();
    await updateTabBadges();
};
// 标记为缺勤（忽略异常）
window.ignoreAnomaly = async function(anomalyId) {
    // 获取异常详情
    const { data: anomaly } = await supabase
        .from('attendance_anomalies')
        .select('user_id, record_date')
        .eq('id', anomalyId)
        .single();
    
    if (!anomaly) return;
    
    // 1. 写入 attendance_overrides（标记为缺勤）
    const { data: existing } = await supabase
        .from('attendance_overrides')
        .select('id')
        .eq('user_id', anomaly.user_id)
        .eq('override_date', anomaly.record_date)
        .maybeSingle();
    
    if (existing) {
        await supabase.from('attendance_overrides').update({
            override_status: 'absent',
            set_by: currentUserId,
            reason: '异常处理：标记为缺勤'
        }).eq('id', existing.id);
    } else {
        await supabase.from('attendance_overrides').insert({
            user_id: anomaly.user_id,
            override_date: anomaly.record_date,
            override_status: 'absent',
            set_by: currentUserId,
            reason: '异常处理：标记为缺勤'
        });
    }
    
    // 2. 更新异常状态为已忽略
    await supabase
        .from('attendance_anomalies')
        .update({ 
            status: 'ignored', 
            resolved_by: currentUserId, 
            resolved_at: new Date() 
        })
        .eq('id', anomalyId);
    
    showToast(t('marked_absent'), 'info');
    await loadAbnormalHours();
    await loadTeamCalendar();
    await updateTabBadges();
};
// ============================================================================
// 余额管理
// ============================================================================
async function loadAllBalances() {
    const { data } = await supabase.from('users').select('id, username, conges_payes').order('username');
    const container = document.getElementById('allBalances');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state">' + t('no_data') + '</div>';
        return;
    }
    
    container.innerHTML = data.map(function(u) {
        return '<div class="balance-card" id="balance-' + u.id + '">' +
            (canEditAttendance ? '<button class="edit-balance-btn" onclick="editBalance(' + u.id + ', ' + u.conges_payes + ')">✏️</button>' : '') +
            '<div class="balance-header"><span>' + u.username + '</span><span>' + new Date().getFullYear() + '</span></div>' +
            '<div class="balance-numbers"><div class="balance-item"><div class="balance-value" id="balance-value-' + u.id + '">' + u.conges_payes + '</div><div class="balance-label">' + t('days') + '</div></div></div>' +
        '</div>';
    }).join('');
}

window.editBalance = async function(userId, current) {
    const newVal = prompt('修改余额 (当前: ' + current + ')', current);
    if (!newVal) return;
    
    const parsed = parseFloat(newVal);
    if (isNaN(parsed)) {
        showToast('请输入数字', 'error');
        return;
    }
    
    await supabase.from('users').update({ conges_payes: parsed }).eq('id', userId);
    showToast('余额已更新', 'success');
    document.getElementById('balance-value-' + userId).textContent = parsed;
};

// ============================================================================
// 出勤统计
// ============================================================================
function updateAttendanceDateDisplay() {
    let locale;
    if (currentLanguage === 'zh') {
        locale = 'zh-CN';
    } else if (currentLanguage === 'fr') {
        locale = 'fr-FR';
    } else {
        locale = 'en-US';
    }
    
    const str = currentAttendanceDate.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const dateElement = document.getElementById('currentAttendanceDate');
    const selectedElement = document.getElementById('selectedDateDisplay');
    if (dateElement) dateElement.textContent = str;
    if (selectedElement) selectedElement.textContent = str;
}
window.changeAttendanceDate = async function(delta) {
    currentAttendanceDate.setDate(currentAttendanceDate.getDate() + delta);
    updateAttendanceDateDisplay();
    await loadAttendanceTimeline(currentAttendanceDate);
};

async function loadAttendanceTimeline(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const selectedDate = `${year}-${month}-${day}`;
    
    let { data: users } = await supabase.from('users').select('id, username, user_type').order('username');
    
    if (!canEditAttendance) {
        users = users?.filter(u => u.id === currentUserId) || [];
    }
    
    const { data: holidays } = await supabase.from('holidays').select('month_day');
    const { data: attendanceRecords } = await supabase.from('attendance_records').select('*').eq('record_date', selectedDate);
    const { data: leaveRequests } = await supabase.from('leave_details').select('*').in('status', ['approuve']).lte('start_date', selectedDate).gte('end_date', selectedDate);
    const { data: overrides } = await supabase.from('attendance_overrides').select('*').eq('override_date', selectedDate);
    
    const timeline = document.getElementById('attendanceTimeline');
    
    if (!users || users.length === 0) {
        timeline.innerHTML = '<div class="empty-state">' + t('no_data') + '</div>';
        return;
    }
    
    const dateObj = new Date(selectedDate);
    const md = String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + String(dateObj.getDate()).padStart(2, '0');
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const isHoliday = holidays?.some(h => h.month_day === md);
    
    timeline.innerHTML = '';
    
    for (const user of users) {
        const override = overrides?.find(o => o.user_id === user.id);
        const leave = leaveRequests?.find(r => r.user_id === user.id);
        const checkIn = attendanceRecords?.find(r => r.user_id === user.id && r.action_type === 'check_in');
        const checkOut = attendanceRecords?.find(r => r.user_id === user.id && r.action_type === 'check_out');
        const breakStart = attendanceRecords?.find(r => r.user_id === user.id && r.action_type === 'break_start');
        const breakEnd = attendanceRecords?.find(r => r.user_id === user.id && r.action_type === 'break_end');
        
        let statusClass = '';
        let statusText = '';
        let recordsHtml = '';
        
        // 1. 手动覆盖
        if (override) {
            const statusType = override.override_status;
            const classMap = { present: 'present', absent: 'absent', mission: 'mission', sick: 'sick', halfday: 'halfday' };
            const textMap = { present: t('present'), absent: t('absent'), mission: t('mission'), sick: t('sick'), halfday: t('halfday') };
            const iconMap = { present: '✅', absent: '❌', mission: '🚚', sick: '🤒', halfday: '⏸️' };
            
            statusClass = classMap[statusType] || 'absent';
            statusText = (iconMap[statusType] || '📌') + ' ' + (textMap[statusType] || statusType);
            
            if (checkIn) {
                recordsHtml += '<div class="timeline-record check_in">' + t('check_in') + ': ' + new Date(checkIn.action_time).toLocaleTimeString() + '</div>';
            }
            if (checkOut) {
                recordsHtml += '<div class="timeline-record check_out">' + t('check_out') + ': ' + new Date(checkOut.action_time).toLocaleTimeString() + '</div>';
            }
        }
        // 2. 请假
        else if (leave) {
            statusClass = 'leave';
            statusText = '🏖️ ' + t('leave');
        }
        // 3. 有上班打卡
        else if (checkIn) {
            recordsHtml += '<div class="timeline-record check_in">' + t('check_in') + ': ' + new Date(checkIn.action_time).toLocaleTimeString() + '</div>';
            
            if (breakStart) {
                recordsHtml += '<div class="timeline-record break_start">' + t('break_start') + ': ' + new Date(breakStart.action_time).toLocaleTimeString() + '</div>';
            }
            if (breakEnd) {
                recordsHtml += '<div class="timeline-record break_end">' + t('break_end') + ': ' + new Date(breakEnd.action_time).toLocaleTimeString() + '</div>';
            }
            if (checkOut) {
                recordsHtml += '<div class="timeline-record check_out">' + t('check_out') + ': ' + new Date(checkOut.action_time).toLocaleTimeString() + '</div>';
            }
            
            // 判断异常类型
            if (!checkOut) {
                // 没有下班打卡
                statusText = '⚠️ ' + t('missing_checkout');
                statusClass = 'mission';
            } else if (checkOut.status === 'missing_checkout') {
                // 标记为缺少下班打卡
                statusText = '⚠️ ' + t('missing_checkout');
                statusClass = 'mission';
            } else if (checkOut.need_review === true || checkOut.status === 'abnormal') {
                // 工作时长不足
                const hours = checkOut.work_hours ? checkOut.work_hours.toFixed(1) : '?';
                statusText = '⚠️ ' + t('work_hours_insufficient') + ' (' + hours + 'h)';
                statusClass = 'mission';
            } else {
                // 正常出勤
                statusText = '✅ ' + t('present');
                statusClass = 'present';
            }
        }
        // 4. 周末或节假日
        else if (isWeekend || isHoliday) {
            statusClass = 'absent';
            if (isHoliday) {
                statusText = '📅 ' + t('legend_holiday');
            } else {
                statusText = '🌙 ' + t('legend_weekend');
            }
        }
        // 5. 工作日无任何打卡
        else {
            statusClass = 'absent';
            statusText = '❌ ' + t('absent');
        }
        
        timeline.innerHTML += `
            <div class="timeline-row">
                <div class="timeline-user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                <div class="timeline-user-info">
                    <div class="timeline-user-name">${escapeHtml(user.username)}</div>
                    <div class="timeline-user-type">${user.user_type}</div>
                    ${canEditAttendance ? `<button class="edit-attendance-btn-small" onclick="quickEditAttendance(${user.id}, '${selectedDate}')">✏️ ${t('edit')}</button>` : ''}
                </div>
                <div class="timeline-status ${statusClass}">${statusText}</div>
                <div class="timeline-records">${recordsHtml}</div>
            </div>
        `;
    }
}
async function rescanAnomalyForDate(userId, dateStr) {
    // 获取当天的上班打卡
    const { data: checkIns } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', userId)
        .eq('record_date', dateStr)
        .eq('action_type', 'check_in');
    
    const checkIn = checkIns?.[0];
    if (!checkIn) return; // 没有上班打卡，无异常
    
    // 获取当天下班打卡
    const { data: checkOuts } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', userId)
        .eq('record_date', dateStr)
        .eq('action_type', 'check_out');
    
    const checkOut = checkOuts?.[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let anomalyType = null;
    
    // 判断是否有异常
    if (checkOut && checkOut.work_hours && checkOut.work_hours < 8) {
        anomalyType = 'short_hours';
    } else if (!checkOut && dateStr <= yesterdayStr) {
        anomalyType = 'missing_checkout';
    }
    
    // 更新异常表
    if (anomalyType) {
        // 有异常：upsert 为 pending
        await supabase.from('attendance_anomalies').upsert({
            user_id: userId,
            username: checkIn.username,
            user_type: checkIn.user_type,
            record_date: dateStr,
            anomaly_type: anomalyType,
            work_hours: checkOut?.work_hours || null,
            status: 'pending'
        }, { onConflict: 'user_id, record_date, anomaly_type' });
    } else {
        // 无异常：删除或标记为 resolved
        await supabase
            .from('attendance_anomalies')
            .update({ status: 'resolved', resolved_by: currentUserId, resolved_at: new Date() })
            .eq('user_id', userId)
            .eq('record_date', dateStr)
            .eq('status', 'pending');
    }
}
// ============================================================================
// Excel 导出
// ============================================================================
// ============================================================================
// Excel 导出（根据当前语言输出）
// ============================================================================
document.getElementById('exportExcelBtn')?.addEventListener('click', async function() {
    if (!canEditAttendance) return;
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 获取所有数据
    const [usersResult, holidaysResult, attendanceResult, leaveResult, overrideResult, anomalyResult] = await Promise.all([
        supabase.from('users').select('id, username, user_type').order('username'),
        supabase.from('holidays').select('month_day'),
        supabase.from('attendance_records').select('*'),
        supabase.from('leave_details').select('*').eq('status', 'approuve'),
        supabase.from('attendance_overrides').select('*'),
        supabase.from('attendance_anomalies').select('*').eq('status', 'pending')
    ]);
    
    const users = usersResult.data || [];
    const holidays = holidaysResult.data || [];
    const attendanceRecords = attendanceResult.data || [];
    const leaveRequests = leaveResult.data || [];
    const overrides = overrideResult.data || [];
    const anomalies = anomalyResult.data || [];
    
    // 构建快速查找 Map
    const attendanceMap = new Map();
    for (const r of attendanceRecords) {
        const key = `${r.user_id}_${r.record_date}`;
        if (!attendanceMap.has(key)) attendanceMap.set(key, []);
        attendanceMap.get(key).push(r);
    }
    
    const leaveMap = new Map();
    for (const r of leaveRequests) {
        for (let d = new Date(r.start_date); d <= new Date(r.end_date); d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const key = `${r.user_id}_${dateStr}`;
            leaveMap.set(key, r);
        }
    }
    
    const overrideMap = new Map();
    for (const r of overrides) {
        const key = `${r.user_id}_${r.override_date}`;
        overrideMap.set(key, r);
    }
    
    const anomalyMap = new Map();
    for (const r of anomalies) {
        const key = `${r.user_id}_${r.record_date}`;
        anomalyMap.set(key, r);
    }
    
    const trans = translations;
    const excelData = [];
    
    // 表头
    const header = [trans.employee || '员工', trans.role || '角色'];
    for (let d = 1; d <= daysInMonth; d++) {
        header.push(d);
    }
    header.push(trans.present_days || '出勤天数');
    header.push(trans.absent_days || '缺勤天数');
    header.push(trans.leave_days || '请假天数');
    header.push(trans.incomplete_days || '打卡不全天数');
    header.push(trans.short_hours_days || '工时不足天数');
    excelData.push(header);
    
    // 判断是否是周末/节假日
    function isWeekend(date) {
        const day = new Date(date).getDay();
        return day === 0 || day === 6;
    }
    
    function isHoliday(dateStr, holidays) {
        const date = new Date(dateStr);
        const md = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        return holidays?.some(h => h.month_day === md) || false;
    }
    
    // 遍历每个用户
    for (const user of users) {
        const row = [user.username, user.user_type];
        let present = 0;
        let absent = 0;
        let leaveDays = 0;
        let incomplete = 0;
        let shortHours = 0;
        
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            const isWeekendDay = isWeekend(dateStr);
            const isHolidayDay = isHoliday(dateStr, holidays);
            
            // 1. 手动覆盖
            const override = overrideMap.get(`${user.id}_${dateStr}`);
            if (override) {
                if (override.override_status === 'present') {
                    present++;
                    row.push(trans.present || '出勤');
                } else if (override.override_status === 'absent') {
                    absent++;
                    row.push(trans.absent || '缺勤');
                } else if (override.override_status === 'halfday') {
                    present += 0.5;
                    row.push(trans.halfday || '半天');
                } else if (override.override_status === 'mission') {
                    incomplete++;
                    row.push(trans.mission || '外勤');
                } else if (override.override_status === 'sick') {
                    absent++;
                    row.push(trans.sick || '病假');
                }
                continue;
            }
            
            // 2. 异常记录
            const anomaly = anomalyMap.get(`${user.id}_${dateStr}`);
            if (anomaly) {
                if (anomaly.anomaly_type === 'missing_checkout') {
                    incomplete++;
                    row.push('⚠️ ' + (trans.missing_checkout || '缺少下班打卡'));
                } else if (anomaly.anomaly_type === 'short_hours') {
                    shortHours++;
                    row.push('⚠️ ' + (trans.work_hours_insufficient || '工时不足'));
                }
                continue;
            }
            
            // 3. 请假
            const leave = leaveMap.get(`${user.id}_${dateStr}`);
            if (leave) {
                leaveDays++;
                row.push(trans.leave || '请假');
                continue;
            }
            
            // 4. 周末或节假日
            if (isWeekendDay || isHolidayDay) {
                row.push(trans.day_off || '休');
                continue;
            }
            
            // 5. 打卡记录
            const records = attendanceMap.get(`${user.id}_${dateStr}`) || [];
            const hasCheckIn = records.some(r => r.action_type === 'check_in');
            const checkOutRecord = records.find(r => r.action_type === 'check_out');
            
            if (hasCheckIn) {
                if (!checkOutRecord) {
                    incomplete++;
                    row.push('⚠️ ' + (trans.missing_checkout || '缺少下班打卡'));
                } else if (checkOutRecord.work_hours && checkOutRecord.work_hours < 8) {
                    shortHours++;
                    row.push('⚠️ ' + (trans.work_hours_insufficient || '工时不足'));
                } else {
                    present++;
                    row.push(trans.present || '出勤');
                }
                continue;
            }
            
            // 6. 缺勤
            absent++;
            row.push(trans.absent || '缺勤');
        }
        
        row.push(present, absent, leaveDays, incomplete, shortHours);
        excelData.push(row);
    }
    
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    
    const sheetName = currentLanguage === 'zh'
        ? year + '年' + (month + 1) + '月考勤'
        : (currentLanguage === 'fr' ? 'Présences_' + year + '_' + (month + 1) : 'Attendance_' + year + '_' + (month + 1));
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, 'attendance_' + year + '_' + (month + 1) + '.xlsx');
    showToast(trans.export_success || '导出成功', 'success');
});

// ============================================================================
// 事件监听
// ============================================================================
function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', async function() {
            document.querySelectorAll('.tab-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(function(content) {
                content.classList.remove('active');
            });
            
            const tabId = btn.dataset.tab;
            document.getElementById('tab-' + tabId).classList.add('active');
            
            if (tabId === 'attendance-stats') {
                updateAttendanceDateDisplay();
                await loadAttendanceTimeline(currentAttendanceDate);
            }
            
            if (tabId === 'team-calendar') {
                await loadTeamCalendar();
            }
            
            if (tabId === 'team-leaves' && isManager) {
                await loadPendingLeaveRequests();
            }
            
            if (tabId === 'abnormal-hours' && isManager) {
                await loadAbnormalHours();
            }
            
            if (tabId === 'pending-cancel' && isManager) {
                await loadPendingCancelRequests();
            }
        });
    });
    
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            setLanguage(btn.dataset.lang);
        });
    });
    
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        sessionStorage.removeItem('session');
        window.location.href = 'index.html';
    });
}

// ============================================================================
// 初始化
// ============================================================================
document.addEventListener('DOMContentLoaded', async function() {
    if (!window.supabase) {
        window.location.href = 'index.html';
        return;
    }
    
    const supabase = window.supabase;
    const session = window.loadSession ? window.loadSession() : null;
    
    if (!session) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = session.username;
    currentUserId = session.id;
    currentUserType = session.userType;
    
    const canApprove = currentUserType === 'admin' || currentUserType === 'manager' || currentUserType === 'secretaire';
    isManager = canApprove;
    canEditAttendance = canApprove;
    
    document.getElementById('currentUserDisplay').innerHTML = '👤 ' + currentUser;
    
    const roleName = translationsData.zh[currentUserType] || currentUserType;
    document.getElementById('userTypeDisplay').innerHTML = roleName;
    
    const savedLang = localStorage.getItem('language') || 'zh';
    setLanguage(savedLang);
    setupPermissions();
    
    updateDateTime();
    setInterval(updateDateTime, 1000);
    fetchRealWeather();
  
    await loadLeaveTypes();
    await checkAndAddMonthlyLeave();
    
    // 所有人都加载这些
    await loadMyAttendance();
    await scanAndRecordAnomalies();
    await loadMyLeaveRequests();
    await loadMyBalance();
    
    await loadTeamCalendar();
    
   if (canApprove) {
    await loadPendingLeaveRequests();
    await loadAllBalances();
    await loadAbnormalHours();
    await loadPendingCancelRequests();
    await updateTabBadges();
}
   
    updateAttendanceDateDisplay();
    
    if (document.getElementById('tab-attendance-stats').classList.contains('active')) {
        await loadAttendanceTimeline(currentAttendanceDate);
    }
    
    setupEventListeners();
});