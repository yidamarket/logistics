// ============================================================================
// 全局变量
// ============================================================================
let currentUser = null;
let currentUserId = null;
let currentUserType = null;
let currentCalendarDate = new Date();
let currentLanguage = 'zh';
let isManager = false;
let canEditAttendance = false;
let translations = {};
let isCalendarLoading = false;  // 添加这一行
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
        
        // 重置显示状态
        selectContainer.style.display = 'none';
        inputContainer.style.display = 'none';
        
        // 先设置 select 和 input
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
        
        // 最后设置 message（确保不被覆盖）
        if (options.isHtml) {
            modalMessage.innerHTML = options.message || '';
        } else {
            modalMessage.textContent = options.message || '';
        }
        
        actions.innerHTML = '';
        
        options.buttons.forEach(function(btn) {
            const button = document.createElement('button');
            button.className = 'custom-modal-btn ' + btn.type;
            button.textContent = btn.text;
            button.onclick = function() {
                let formData = null;
                if (options.isHtml) {
                    formData = {};
                    const inputs = modalMessage.querySelectorAll('input, select, textarea');
                    inputs.forEach(function(el) {
                        if (el.name) {
                            formData[el.name] = el.value;
                        }
                    });
                }
                
                modal.style.display = 'none';
                if (options.select) {
                    resolve({ button: btn.value, selectValue: select.value, formData: formData });
                } else if (options.input) {
                    resolve({ button: btn.value, inputValue: input.value, formData: formData });
                } else {
                    resolve({ button: btn.value, formData: formData });
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
// 三语翻译字典
// ============================================================================
const translationsData = {
    zh: {
        // ========== 角色 ==========
        admin: '管理员',
        manager: '经理',
        secretaire: '秘书',
        preparateur: '备货员',
        chauffeur: '司机',
        responsable: '主管',
        employe: '员工',
        
        // ========== 通用 ==========
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
        time: '时间',
        unknown: '未知',
        active: '在职',
        inactive: '离职',
        status: '状态',
        create: '创建',
        created: '已创建',
        saved: '已保存',
        error: '错误',
        delete: '删除',
        confirm_delete_title: '确认删除',
        confirm_delete_message: '确定要删除该员工吗？此操作不可恢复！',
        cannot_delete_self: '不能删除自己的账号',
        employee_deleted: '员工已删除',
        last_modified: '最后修改',
        close: '关闭',
        
        // ========== 标签页 ==========
        tab_my_leaves: '我的请假',
        tab_team_calendar: '团队日历',
        tab_team_leaves: '待批请假',
        tab_balances: '余额管理',
        tab_attendance_stats: '出勤统计',
        tab_abnormal_hours: '工时异常',
        tab_pending_cancel: '待批取消',
        tab_employee_management: '员工管理',
        tab_pending_attendance: '待批打卡',
        tab_my_profile: '我的资料',
        
        // ========== 打卡 ==========
        check_in: '✅ 上班打卡',
        check_out: '🏠 下班打卡',
        break_start: '☕ 休息开始',
        break_end: '💪 休息结束',
        missing_checkout: '❌ 缺少下班打卡',
        check_in_time: '上班时间',
        default_checkout_time: '默认下班时间',
        confirm_normal: '确认为正常',
        work_hours: '工作时长',
        work_hours_insufficient: '工作时长不足8小时',
        approved_normal: '已确认为正常',
        marked_absent: '已标记为缺勤',
        
        // ========== 请假 ==========
        new_leave_request: '新建请假申请',
        leave_type: '请假类型',
        start_date: '开始日期',
        end_date: '结束日期',
        days_count: '工作天数',
        reason: '理由',
        proof_url: '证明文件URL',
        submit: '提交申请',
        request_cancel: '申请取消',
        will_deduct_balance: '将扣除余额',
        no_deduction: '不扣余额',
        cancelled: '已取消',
        expired: '已过期',
        waiting_approval: '等待审批',
        approved_by: '批准人',
        rejected_by: '拒绝人',
        
        // ========== 请假状态 ==========
        status_en_attente: '待审批',
        status_approuve: '已批准',
        status_refuse: '已拒绝',
        status_annule: '已取消',
        status_pending_cancel: '申请取消中',
        
        // ========== 待批 ==========
        pending_leave_requests: '待批请假申请',
        pending_cancel_requests: '待审批取消申请',
        all_balances: '员工假期余额',
        no_pending_cancel: '暂无待批取消申请',
        
        // ========== 请假确认弹窗 ==========
        confirm_cancel_title: '确认取消',
        confirm_cancel_message: '确定要取消这个请假申请吗？',
        confirm_request_cancel_title: '申请取消',
        confirm_request_cancel_message: '确定要申请取消这个已批准的假期吗？',
        request_cancel_success: '已提交取消申请，等待管理员审批',
        request_cancel_failed: '申请失败',
        cancel_approved_refund: '已批准取消，已退还 {days} 天带薪假余额',
        cancel_approved_no_refund: '已批准取消（非带薪假，不涉及余额）',
        cancel_rejected: '已拒绝取消申请',
        
        // ========== 我的信息 ==========
        my_balance: '我的余额',
        my_today_attendance: '今日打卡记录',
        my_leave_history: '我的请假历史',
        my_profile: '我的资料',
        change_password: '修改密码',
        save_changes: '保存修改',
        profile_updated: '个人资料已更新',
        
        // ========== 日历 ==========
        team_planning: '团队日程',
        prev_month: '上月',
        next_month: '下月',
        export_excel: '导出Excel',
        
        // ========== 图例 ==========
        legend_present: '✅ 出勤',
        legend_absent: '❌ 缺勤',
        legend_conges_payes: '🏖️ 带薪假',
        legend_maladie: '🤒 病假',
        legend_maternite_paternite: '👶 产假/陪产假',
        legend_sans_solde: '💰 无薪假',
        legend_school: '📚 学校假',
        legend_mariage: '💍 婚假',
        legend_deces: '🕊️ 丧假',
        legend_evenement: '🏠 家庭事件',
        legend_holiday: '🎉 法定假日',
        legend_weekend: '🌙 周末',
        legend_mission: '🚚 外勤',
        legend_halfday: '½ 半天',
        legend_abnormal: '⚠️ 异常(不足8小时/缺下班卡)',
        confirm_password: '确认密码',
        new_password: '新密码',
        leave_blank_to_keep: '留空则不修改',
        password_mismatch: '两次输入的密码不一致',


        // ========== 出勤统计 ==========
        attendance_stats: '出勤统计',
        attendance_status: '出勤状态',
        present: '出勤',
        absent: '缺勤',
        mission: '外勤',
        sick: '病假',
        halfday: '半天',
        confirm_delete: '确认删除',
        delete_warning: '此操作不可恢复，员工的所有数据将被永久删除！',
        
        // ========== 工时异常 ==========
        need_review_yes: '待审核',
        no_abnormal_records: '暂无工时异常记录',
        edit_attendance: '编辑出勤',
        restored_default: '已恢复默认状态',
        record_checkout_time: '补录下班时间',
        checkout_recorded: '已补录下班时间',
        no_check_in_found: '未找到上班打卡记录',
        select_checkout_time: '请选择实际下班时间',
        abnormal_fixed: '异常处理：确认为正常',
        fix_abnormal: '处理异常（补录下班时间）',
        current_status: '当前状态',
        
        // ========== Excel ==========
        employee: '员工',
        role: '角色',
        day_unit: '日',
        present_days: '出勤天数',
        absent_days: '缺勤天数',
        mission_days: '外勤天数',
        day_off: '休',
        export_success: '导出成功',
        not_set: '未设置',
        readonly_fields_note: '合同类型、入职日期等敏感信息不可修改，请联系管理员',
        
        // ========== 假期添加 ==========
        monthly_leave_added: '✅ 已添加2.5天假期',
        
        // ========== 员工管理 ==========
        employee_management: '员工管理',
        add_employee: '新增员工',
        edit_employee: '编辑员工',
        username: '用户名',
        password: '密码',
        phone: '电话',
        email: '邮箱',
        address: '地址',
        contract_type: '合同类型',
        marital_status: '婚姻状况',
        single: '单身',
        married: '已婚',
        divorced: '离异',
        widowed: '丧偶',
        birth_date: '出生日期',
        hire_date: '入职日期',
        nationality: '国籍',
        conges_payes: '带薪假期',
        emergency_contact: '紧急联系人',
        emergency_phone: '紧急电话',
        photo_url: '照片URL',
        employee_created: '员工已创建',
        username_required: '请填写用户名',
        user_type: '员工类型'
    },
    
    en: {
        // ========== Roles ==========
        admin: 'Admin',
        manager: 'Manager',
        secretaire: 'Secretary',
        preparateur: 'Preparer',
        chauffeur: 'Driver',
        responsable: 'Supervisor',
        employe: 'Employee',
        // 在 en 中添加
        confirm_password: 'Confirm Password',
        new_password: 'New Password',
        leave_blank_to_keep: 'Leave blank to keep unchanged',
        password_mismatch: 'Passwords do not match',


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
        time: 'Time',
        unknown: 'Unknown',
        active: 'Active',
        inactive: 'Inactive',
        status: 'Status',
        create: 'Create',
        created: 'Created',
        saved: 'Saved',
        error: 'Error',
        delete: 'Delete',
        confirm_delete_title: 'Confirm Delete',
        confirm_delete_message: 'Are you sure you want to delete this employee? This action cannot be undone!',
        cannot_delete_self: 'Cannot delete your own account',
        employee_deleted: 'Employee deleted',
        last_modified: 'Last modified',
        close: 'Close',
        
        // ========== Tab titles ==========
        tab_my_leaves: 'My Leaves',
        tab_team_calendar: 'Team Calendar',
        tab_team_leaves: 'Pending Leaves',
        tab_balances: 'Balances',
        tab_attendance_stats: 'Attendance Stats',
        tab_abnormal_hours: 'Abnormal Hours',
        tab_pending_cancel: 'Pending Cancel',
        tab_employee_management: 'Employee Management',
        tab_pending_attendance: 'Pending Attendance',
        tab_my_profile: 'My Profile',
        
        // ========== Check in/out ==========
        check_in: '✅ Check In',
        check_out: '🏠 Check Out',
        break_start: '☕ Break Start',
        break_end: '💪 Break End',
        missing_checkout: '❌ Missing check-out',
        check_in_time: 'Check-in time',
        default_checkout_time: 'Default check-out time',
        confirm_normal: 'Confirm Normal',
        work_hours: 'Work hours',
        work_hours_insufficient: 'Work hours less than 8 hours',
        approved_normal: 'Confirmed as normal',
        marked_absent: 'Marked as absent',
        
        // ========== Leave request ==========
        new_leave_request: 'New Leave Request',
        leave_type: 'Leave Type',
        start_date: 'Start Date',
        end_date: 'End Date',
        days_count: 'Working Days',
        reason: 'Reason',
        proof_url: 'Proof URL',
        submit: 'Submit',
        request_cancel: 'Request Cancel',
        will_deduct_balance: 'Balance will be deducted',
        no_deduction: 'No deduction',
        cancelled: 'Cancelled',
        expired: 'Expired',
        waiting_approval: 'Waiting for approval',
        approved_by: 'Approved by',
        rejected_by: 'Rejected by',
        
        // ========== Leave status ==========
        status_en_attente: 'Pending',
        status_approuve: 'Approved',
        status_refuse: 'Rejected',
        status_annule: 'Cancelled',
        status_pending_cancel: 'Cancelling...',
        
        // ========== Pending ==========
        pending_leave_requests: 'Pending Leave Requests',
        pending_cancel_requests: 'Pending Cancel Requests',
        all_balances: 'Employee Balances',
        no_pending_cancel: 'No pending cancel requests',
        
        // ========== Cancel confirmation ==========
        confirm_cancel_title: 'Confirm Cancellation',
        confirm_cancel_message: 'Are you sure to cancel this leave request?',
        confirm_request_cancel_title: 'Request Cancellation',
        confirm_request_cancel_message: 'Are you sure to request cancellation of this approved leave?',
        request_cancel_success: 'Cancellation request submitted',
        request_cancel_failed: 'Request failed',
        cancel_approved_refund: 'Cancellation approved, {days} paid leave days refunded',
        cancel_approved_no_refund: 'Cancellation approved (unpaid leave)',
        cancel_rejected: 'Cancellation request rejected',
        
        // ========== My info ==========
        my_balance: 'My Balance',
        my_today_attendance: "Today's Attendance",
        my_leave_history: 'My Leave History',
        my_profile: 'My Profile',
        change_password: 'Change Password',
        save_changes: 'Save Changes',
        profile_updated: 'Profile updated',
        
        // ========== Calendar ==========
        team_planning: 'Team Planning',
        prev_month: 'Prev',
        next_month: 'Next',
        export_excel: 'Export Excel',
        
        // ========== Legend ==========
        legend_present: '✅ Present',
        legend_absent: '❌ Absent',
        legend_conges_payes: '🏖️ Paid leave',
        legend_maladie: '🤒 Sick leave',
        legend_maternite_paternite: '👶 Maternity/Paternity',
        legend_sans_solde: '💰 Unpaid leave',
        legend_school: '📚 School leave',
        legend_mariage: '💍 Marriage leave',
        legend_deces: '🕊️ Bereavement',
        legend_evenement: '🏠 Family events',
        legend_holiday: '🎉 Public holiday',
        legend_weekend: '🌙 Weekend',
        legend_mission: '🚚 Field work',
        legend_halfday: '½ Half day',
        legend_abnormal: '⚠️ Anomaly (less than 8h/missing check-out)',
        
        // ========== Attendance stats ==========
        attendance_stats: 'Attendance Statistics',
        attendance_status: 'Status',
        present: 'Present',
        absent: 'Absent',
        mission: 'Mission',
        sick: 'Sick',
        halfday: 'Half Day',
        confirm_delete: 'Confirm Delete',
        delete_warning: 'This action cannot be undone! All employee data will be permanently deleted!',
        
        // ========== Abnormal hours ==========
        need_review_yes: 'Pending Review',
        no_abnormal_records: 'No abnormal hours records',
        edit_attendance: 'Edit Attendance',
        restored_default: 'Restored to default',
        record_checkout_time: 'Record Check-out Time',
        checkout_recorded: 'Check-out recorded at',
        no_check_in_found: 'No check-in record found',
        select_checkout_time: 'Please select actual check-out time',
        abnormal_fixed: 'Abnormal fixed: confirmed as normal',
        fix_abnormal: 'Fix abnormal (record check-out time)',
        current_status: 'Current status',
        
        // ========== Excel ==========
        employee: 'Employee',
        role: 'Role',
        day_unit: '',
        present_days: 'Present Days',
        absent_days: 'Absent Days',
        mission_days: 'Mission Days',
        day_off: 'Off',
        export_success: 'Export Success',
        not_set: 'Not set',
        readonly_fields_note: 'Contract type, hire date and other sensitive information cannot be modified. Please contact administrator.',
        
        // ========== Monthly leave ==========
        monthly_leave_added: '✅ 2.5 days added',
        
        // ========== Employee management ==========
        employee_management: 'Employee Management',
        add_employee: 'Add Employee',
        edit_employee: 'Edit Employee',
        username: 'Username',
        password: 'Password',
        phone: 'Phone',
        email: 'Email',
        address: 'Address',
        contract_type: 'Contract Type',
        marital_status: 'Marital Status',
        single: 'Single',
        married: 'Married',
        divorced: 'Divorced',
        widowed: 'Widowed',
        birth_date: 'Birth Date',
        hire_date: 'Hire Date',
        nationality: 'Nationality',
        conges_payes: 'Paid Leave',
        emergency_contact: 'Emergency Contact',
        emergency_phone: 'Emergency Phone',
        photo_url: 'Photo URL',
        employee_created: 'Employee created',
        username_required: 'Username required',
        user_type: 'User Type'
    },
    
    fr: {
        // ========== Rôles ==========
        admin: 'Administrateur',
        manager: 'Manager',
        secretaire: 'Secrétaire',
        preparateur: 'Préparateur',
        chauffeur: 'Chauffeur',
        responsable: 'Responsable',
        employe: 'Employé',
        confirm_password: 'Confirmer le mot de passe',
        new_password: 'Nouveau mot de passe',
        leave_blank_to_keep: 'Laisser vide pour ne pas changer',
        password_mismatch: 'Les mots de passe ne correspondent pas',
        // ========== Général ==========
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
        time: 'Heure',
        unknown: 'Inconnu',
        active: 'Actif',
        inactive: 'Inactif',
        status: 'Statut',
        create: 'Créer',
        created: 'Créé',
        saved: 'Enregistré',
        error: 'Erreur',
        delete: 'Supprimer',
        confirm_delete_title: 'Confirmer la suppression',
        confirm_delete_message: 'Voulez-vous vraiment supprimer cet employé ? Cette action est irréversible !',
        cannot_delete_self: 'Impossible de supprimer votre propre compte',
        employee_deleted: 'Employé supprimé',
        last_modified: 'Dernière modification',
        close: 'Fermer',
        
        // ========== Titres des onglets ==========
        tab_my_leaves: 'Mes congés',
        tab_team_calendar: 'Calendrier équipe',
        tab_team_leaves: 'Congés à valider',
        tab_balances: 'Soldes',
        tab_attendance_stats: 'Présences',
        tab_abnormal_hours: 'Heures anormales',
        tab_pending_cancel: 'Annulations à valider',
        tab_employee_management: 'Gestion employés',
        tab_pending_attendance: 'Pointages en attente',
        tab_my_profile: 'Mon profil',
        
        // ========== Pointage ==========
        check_in: '✅ Arrivée',
        check_out: '🏠 Départ',
        break_start: '☕ Début pause',
        break_end: '💪 Fin pause',
        missing_checkout: '❌ Pointage de fin manquant',
        check_in_time: 'Heure d\'arrivée',
        default_checkout_time: 'Heure de départ par défaut',
        confirm_normal: 'Confirmer normal',
        work_hours: 'Heures travaillées',
        work_hours_insufficient: 'Heures travaillées inférieures à 8h',
        approved_normal: 'Confirmé normal',
        marked_absent: 'Marqué absent',
        
        // ========== Demande de congé ==========
        new_leave_request: 'Nouvelle demande congé',
        leave_type: 'Type de congé',
        start_date: 'Date début',
        end_date: 'Date fin',
        days_count: 'Jours ouvrés',
        reason: 'Motif',
        proof_url: 'Justificatif URL',
        submit: 'Soumettre',
        request_cancel: 'Demander annulation',
        will_deduct_balance: 'Solde sera déduit',
        no_deduction: 'Aucune déduction',
        cancelled: 'Annulé',
        expired: 'Expiré',
        waiting_approval: 'En attente d\'approbation',
        approved_by: 'Approuvé par',
        rejected_by: 'Refusé par',
        
        // ========== Statuts des congés ==========
        status_en_attente: 'En attente',
        status_approuve: 'Approuvé',
        status_refuse: 'Refusé',
        status_annule: 'Annulé',
        status_pending_cancel: 'Annulation en cours',
        
        // ========== En attente ==========
        pending_leave_requests: 'Demandes de congé',
        pending_cancel_requests: 'Demandes d\'annulation',
        all_balances: 'Soldes employés',
        no_pending_cancel: 'Aucune demande d\'annulation en attente',
        
        // ========== Confirmation d'annulation ==========
        confirm_cancel_title: 'Confirmer l\'annulation',
        confirm_cancel_message: 'Annuler cette demande de congé ?',
        confirm_request_cancel_title: 'Demander l\'annulation',
        confirm_request_cancel_message: 'Demander l\'annulation de ce congé approuvé ?',
        request_cancel_success: 'Demande d\'annulation soumise',
        request_cancel_failed: 'Échec de la demande',
        cancel_approved_refund: 'Annulation approuvée, {days} jours de congés payés remboursés',
        cancel_approved_no_refund: 'Annulation approuvée (sans solde)',
        cancel_rejected: 'Demande d\'annulation refusée',
        
        // ========== Mes infos ==========
        my_balance: 'Mon solde',
        my_today_attendance: "Pointage aujourd'hui",
        my_leave_history: 'Historique congés',
        my_profile: 'Mon profil',
        change_password: 'Changer le mot de passe',
        save_changes: 'Enregistrer',
        profile_updated: 'Profil mis à jour',
        
        // ========== Calendrier ==========
        team_planning: 'Planning équipe',
        prev_month: 'Mois préc.',
        next_month: 'Mois suiv.',
        export_excel: 'Exporter Excel',
        
        // ========== Légende ==========
        legend_present: '✅ Présent',
        legend_absent: '❌ Absent',
        legend_conges_payes: '🏖️ Congés payés',
        legend_maladie: '🤒 Maladie',
        legend_maternite_paternite: '👶 Congé maternité/paternité',
        legend_sans_solde: '💰 Congé sans solde',
        legend_school: '📚 École',
        legend_mariage: '💍 Congés mariage',
        legend_deces: '🕊️ Congés décès',
        legend_evenement: '🏠 Événements familiaux',
        legend_holiday: '🎉 Férié',
        legend_weekend: '🌙 Weekend',
        legend_mission: '🚚 Mission',
        legend_halfday: '½ Demi-journée',
        legend_abnormal: '⚠️ Anomalie (moins de 8h/sortie manquante)',
        
        // ========== Statistiques de présence ==========
        attendance_stats: 'Statistiques',
        attendance_status: 'État',
        present: 'Présent',
        absent: 'Absent',
        mission: 'Mission',
        sick: 'Malade',
        halfday: 'Demi-journée',
        confirm_delete: 'Confirmer la suppression',
        delete_warning: 'Cette action est irréversible ! Toutes les données de l\'employé seront définitivement supprimées !',
        
        // ========== Heures anormales ==========
        need_review_yes: 'À vérifier',
        no_abnormal_records: 'Aucune heure anormale',
        edit_attendance: 'Modifier la présence',
        restored_default: 'Rétabli par défaut',
        record_checkout_time: 'Enregistrer l\'heure de départ',
        checkout_recorded: 'Départ enregistré à',
        no_check_in_found: 'Aucun pointage d\'arrivée trouvé',
        select_checkout_time: 'Sélectionnez l\'heure de départ réelle',
        abnormal_fixed: 'Anomalie corrigée : confirmé normal',
        fix_abnormal: 'Corriger l\'anomalie (enregistrer l\'heure de départ)',
        current_status: 'Statut actuel',
        
        // ========== Excel ==========
        employee: 'Employé',
        role: 'Rôle',
        day_unit: '',
        present_days: 'Jours présents',
        absent_days: 'Jours absents',
        mission_days: 'Jours mission',
        day_off: 'Repos',
        export_success: 'Export réussi',
        not_set: 'Non défini',
        readonly_fields_note: 'Type de contrat, date d\'embauche et autres informations sensibles ne peuvent pas être modifiés. Veuillez contacter l\'administrateur.',
        
        // ========== Ajout mensuel ==========
        monthly_leave_added: '✅ 2.5 jours ajoutés',
        
        // ========== Gestion employés ==========
        employee_management: 'Gestion employés',
        add_employee: 'Ajouter employé',
        edit_employee: 'Modifier employé',
        username: 'Nom d\'utilisateur',
        password: 'Mot de passe',
        phone: 'Téléphone',
        email: 'Email',
        address: 'Adresse',
        contract_type: 'Type de contrat',
        marital_status: 'Situation familiale',
        single: 'Célibataire',
        married: 'Marié(e)',
        divorced: 'Divorcé(e)',
        widowed: 'Veuf/Veuve',
        birth_date: 'Date de naissance',
        hire_date: 'Date d\'embauche',
        nationality: 'Nationalité',
        conges_payes: 'Congés payés',
        emergency_contact: 'Contact d\'urgence',
        emergency_phone: 'Tél. urgence',
        photo_url: 'URL photo',
        employee_created: 'Employé créé',
        username_required: 'Veuillez saisir le nom',
        user_type: 'Type d\'utilisateur'
    }
};
// 加载我的资料
async function loadMyProfile() {
    const { data: emp, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUserId)
        .single();
    
    if (error || !emp) {
        showToast(t('error'), 'error');
        return;
    }
    
    // 可修改字段
    document.getElementById('profile_username').value = emp.username || '';
    document.getElementById('profile_phone').value = emp.phone || '';
    document.getElementById('profile_email').value = emp.email || '';
    document.getElementById('profile_address').value = emp.address || '';
    document.getElementById('profile_birth_date').value = emp.birth_date || '';
    document.getElementById('profile_nationality').value = emp.nationality || 'Française';
    document.getElementById('profile_emergency_contact').value = emp.emergency_contact || '';
    document.getElementById('profile_emergency_phone').value = emp.emergency_phone || '';
    document.getElementById('profile_photo_url').value = emp.photo_url || '';
    document.getElementById('profile_new_password').value = '';
    
    // 只读字段（显示但不让修改）
    document.getElementById('profile_user_type').value = t(emp.user_type) || emp.user_type;
    document.getElementById('profile_contract_type').value = emp.contract_type || 'CDI';
    document.getElementById('profile_hire_date').value = emp.hire_date || t('not_set');
    
    // 设置头像
    const avatarDiv = document.getElementById('profileAvatar');
    if (emp.photo_url) {
        avatarDiv.innerHTML = `<img src="${emp.photo_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
        avatarDiv.textContent = emp.username.charAt(0).toUpperCase();
    }
    
    // 婚姻状况选项翻译
    const maritalSelect = document.getElementById('profile_marital_status');
    maritalSelect.innerHTML = `
        <option value="single">${t('single')}</option>
        <option value="married">${t('married')}</option>
        <option value="divorced">${t('divorced')}</option>
        <option value="widowed">${t('widowed')}</option>
    `;
    maritalSelect.value = emp.marital_status || 'single';
}
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
    
    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');
    if (dateEl) dateEl.textContent = now.toLocaleDateString(locale, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    if (timeEl) timeEl.textContent = now.toLocaleTimeString(locale, {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}

// ============================================================================
// 天气
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
        
        const weatherDiv = document.getElementById('weatherDisplay');
        if (weatherDiv) weatherDiv.innerHTML = '<span class="weather-icon">' + icon + '</span><span class="weather-temp">' + temp + '°C</span><span class="weather-city">Vitry</span>';
    } catch(e) {
        const weatherDiv = document.getElementById('weatherDisplay');
        if (weatherDiv) weatherDiv.innerHTML = '<span class="weather-icon">☀️</span><span class="weather-temp">--°C</span><span class="weather-city">Vitry</span>';
    }
}

// ============================================================================
// 三语支持
// ============================================================================
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    translations = translationsData[lang];
    
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
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
    
    refreshUIText();
    if (isManager) updateTabBadges();
    
    const roleName = translations[currentUserType] || currentUserType;
    const userTypeEl = document.getElementById('userTypeDisplay');
    if (userTypeEl) userTypeEl.innerHTML = roleName;
    
    loadMyAttendance();
    loadMyLeaveRequests();
    loadMyBalance();
    
    if (isManager) {
        loadPendingLeaveRequests();
        loadPendingCancelRequests();
    }
    
    // 刷新日历（防抖处理）
    if (document.getElementById('tab-team-calendar')?.classList.contains('active')) {
        setTimeout(function() {
            loadTeamCalendar();
        }, 100);
    }
}

function refreshUIText() {
    if (document.getElementById('myBalance')) loadMyBalance();
    if (document.getElementById('teamCalendar')) loadTeamCalendar();
    if (document.getElementById('myLeaveRequests')) loadMyLeaveRequests();
    if (isManager) {
        if (document.getElementById('pendingLeaveRequests')) loadPendingLeaveRequests();
        if (document.getElementById('pendingCancelList')) loadPendingCancelRequests();
        if (document.getElementById('tab-employee-management')?.classList.contains('active')) {
            loadEmployeeList();
        }
    }
}
// ============================================================================
// 权限设置
// ============================================================================
function setupPermissions() {
    const canApprove = isManager;
    
    const teamLeavesTab = document.getElementById('teamTab');
    const pendingCancelTab = document.getElementById('pendingCancelTab');
    const employeeManagementTab = document.getElementById('employeeManagementTab');  // 添加这行
    const balancesTab = document.getElementById('balancesTab');
    const attendanceStatsTab = document.getElementById('attendanceStatsTab');
    const abnormalHoursTab = document.getElementById('abnormalHoursTab');
    const pendingAttendanceTab = document.getElementById('pendingAttendanceTab');
    
    if (teamLeavesTab) teamLeavesTab.style.display = canApprove ? 'inline-block' : 'none';
    if (pendingCancelTab) pendingCancelTab.style.display = canApprove ? 'inline-block' : 'none';
    
    // ========== 员工管理：只有管理员可以看到 ==========
    if (employeeManagementTab) {
        employeeManagementTab.style.display = canApprove ? 'inline-block' : 'none';
    }
    // ========== 添加结束 ==========
    
    if (balancesTab) balancesTab.style.display = 'none';
    if (attendanceStatsTab) attendanceStatsTab.style.display = 'none';
    if (abnormalHoursTab) abnormalHoursTab.style.display = 'none';
    if (pendingAttendanceTab) pendingAttendanceTab.style.display = 'none';
    
    const exportBtn = document.getElementById('exportExcelBtn');
    if (exportBtn) exportBtn.style.display = 'none';
}
// ============================================================================
// 请假类型加载
// ============================================================================
async function loadLeaveTypes() {
    const { data } = await supabase.from('leave_types').select('*').order('id');
    
    if (data) {
        const select = document.getElementById('leaveType');
        if (select) {
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
                const proofField = document.getElementById('proofField');
                if (proofField) proofField.style.display = needsProof ? 'block' : 'none';
            };
        }
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
        if (dow !== 0 && dow !== 6 && !isHoliday) days++;
    }
    return days;
}

async function updateDays() {
    const start = document.getElementById('startDate')?.value;
    const end = document.getElementById('endDate')?.value;
    const daysCount = document.getElementById('daysCount');
    if (start && end && daysCount) {
        const days = await calculateWorkingDays(start, end);
        daysCount.value = days;
    } else if (daysCount) {
        daysCount.value = '0';
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
    const typeId = parseInt(document.getElementById('leaveType')?.value);
    const start = document.getElementById('startDate')?.value;
    const end = document.getElementById('endDate')?.value;
    const days = parseFloat(document.getElementById('daysCount')?.value);
    const reason = document.getElementById('reason')?.value || null;
    const proof = document.getElementById('proofUrl')?.value || null;
    
    if (!typeId || !start || !end || !days) {
        showToast('请填写所有必填字段', 'error');
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(start);
    if (startDate < today) {
        showToast('不能申请过去的日期', 'error');
        return;
    }
    
    const { data: conflicts } = await supabase
        .from('leave_requests')
        .select('id, status, start_date, end_date')
        .eq('user_id', currentUserId)
        .in('status', ['en_attente', 'approuve'])
        .lte('start_date', end)
        .gte('end_date', start);
    
    if (conflicts && conflicts.length > 0) {
        showToast('请假日期与已有申请冲突', 'error');
        return;
    }
    
    const { data: leaveType } = await supabase
        .from('leave_types')
        .select('name_fr')
        .eq('id', typeId)
        .single();
    
    if (leaveType && leaveType.name_fr === 'Congés payés') {
        const { data: user } = await supabase.from('users').select('conges_payes').eq('id', currentUserId).single();
        if (user && user.conges_payes < days) {
            showToast('余额不足，无法申请', 'error');
            return;
        }
    }
    
    const { error } = await supabase.from('leave_requests').insert([{
        user_id: currentUserId, leave_type_id: typeId,
        start_date: start, end_date: end, days_count: days,
        reason: reason, proof_url: proof, status: 'en_attente'
    }]);
    
    if (!error) {
        showToast('申请已提交', 'success');
        document.getElementById('leaveType').value = '';
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('reason').value = '';
        document.getElementById('daysCount').value = '0';
        const proofField = document.getElementById('proofField');
        if (proofField) proofField.style.display = 'none';
        
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
    const balanceDiv = document.getElementById('myBalance');
    if (user && balanceDiv) {
        balanceDiv.innerHTML = '<div class="balance-card">' +
            '<div class="balance-header"><span>' + t('remaining_leave') + '</span><span>' + new Date().getFullYear() + '</span></div>' +
            '<div class="balance-numbers"><div class="balance-item"><div class="balance-value">' + user.conges_payes + '</div><div class="balance-label">' + t('days') + '</div></div></div>' +
            '</div>';
    }
}
// ============================================================================
// 员工管理模块
// ============================================================================
// ============================================================================
// 加载员工列表
// ============================================================================
async function loadEmployeeList() {
    if (!isManager) return;
    
    const { data: employees, error } = await supabase
        .from('users')
        .select('*')
        .order('username');
    
    const container = document.getElementById('employeeList');
    if (!container) return;
    
    if (error || !employees || employees.length === 0) {
        container.innerHTML = '<div class="empty-state">' + t('no_data') + '</div>';
        return;
    }
    
    // 搜索过滤
    const searchInput = document.getElementById('employeeSearchInput');
    let filteredEmployees = employees;
    if (searchInput && searchInput.value) {
        const searchTerm = searchInput.value.toLowerCase();
        filteredEmployees = employees.filter(emp => 
            emp.username.toLowerCase().includes(searchTerm) ||
            (emp.phone && emp.phone.includes(searchTerm)) ||
            (emp.email && emp.email.toLowerCase().includes(searchTerm))
        );
    }
    
    container.innerHTML = filteredEmployees.map(emp => `
        <div class="employee-card" data-id="${emp.id}" style="background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s; display: flex; gap: 16px; align-items: center;">
            <div class="employee-avatar" style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">
                ${emp.photo_url ? `<img src="${emp.photo_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : emp.username.charAt(0).toUpperCase()}
            </div>
            <div class="employee-info" style="flex: 1;">
                <div class="employee-name" style="font-weight: 600; font-size: 16px;">${escapeHtml(emp.username)}</div>
                <div class="employee-type" style="font-size: 13px; color: #666;">${t(emp.user_type) || emp.user_type}</div>
                <div class="employee-contact" style="font-size: 12px; color: #999;">${emp.phone || ''} ${emp.email || ''}</div>
            </div>
            <div class="employee-status" style="font-size: 12px; padding: 4px 10px; border-radius: 20px; ${emp.active ? 'background: #d4edda; color: #155724;' : 'background: #f8d7da; color: #721c24;'}">
                ${emp.active ? t('active') : t('inactive')}
            </div>
            <button class="employee-edit-btn" onclick="openEditEmployeeModal(${emp.id})" style="background: #667eea; color: white; border: none; padding: 8px 16px; border-radius: 30px; cursor: pointer; font-size: 12px;">✏️ ${t('edit')}</button>
        </div>
    `).join('');
    
    // 绑定搜索事件
    if (searchInput && !searchInput.hasListener) {
        searchInput.hasListener = true;
        searchInput.addEventListener('input', () => loadEmployeeList());
    }
}
// ============================================================================
// 员工管理 - 独立弹窗
// ============================================================================
// 显示员工详情编辑弹窗
// 显示员工详情编辑弹窗
window.openEditEmployeeModal = async function(userId) {
    const { data: emp, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error || !emp) {
        showToast(t('error'), 'error');
        return;
    }
    
    const { data: adminUser } = await supabase
        .from('users')
        .select('username')
        .eq('id', currentUserId)
        .single();
    
    const userTypeOptions = [
        { value: 'chauffeur', label: t('chauffeur') },
        { value: 'employe', label: t('employe') },
        { value: 'preparateur', label: t('preparateur') },
        { value: 'secretaire', label: t('secretaire') },
        { value: 'manager', label: t('manager') },
        { value: 'admin', label: t('admin') }
    ];
    
    const maritalOptions = [
        { value: 'single', label: t('single') },
        { value: 'married', label: t('married') },
        { value: 'divorced', label: t('divorced') },
        { value: 'widowed', label: t('widowed') }
    ];
    
    const contractOptions = [
        { value: 'CDI', label: 'CDI' },
        { value: 'CDD', label: 'CDD' },
        { value: 'Interim', label: 'Intérim' },
        { value: 'Stage', label: 'Stage' }
    ];
    
    const formHtml = `
        <div class="employee-edit-form" style="display: grid; gap: 12px; max-height: 60vh; overflow-y: auto; padding: 4px;">
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <label><strong>${t('username')}</strong></label>
                    <input type="text" name="username" value="${escapeHtml(emp.username)}" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                </div>
                <div style="flex: 1;">
                    <label><strong>${t('user_type')}</strong></label>
                    <select name="user_type" class="modal-select" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                        ${userTypeOptions.map(opt => `<option value="${opt.value}" ${emp.user_type === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <label><strong>🔐 ${t('password')}</strong> <span style="font-size: 11px; color: #999;">(${t('leave_blank_to_keep')})</span></label>
                    <input type="password" name="password" class="modal-input" placeholder="${t('new_password')}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                </div>
                <div style="flex: 1;">
                    <!-- 占位空白，保持布局 -->
                </div>
            </div>
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <label><strong>${t('phone')}</strong></label>
                    <input type="text" name="phone" value="${emp.phone || ''}" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                </div>
                <div style="flex: 1;">
                    <label><strong>${t('email')}</strong></label>
                    <input type="email" name="email" value="${emp.email || ''}" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                </div>
            </div>
            <div>
                <label><strong>${t('address')}</strong></label>
                <textarea name="address" class="modal-textarea" rows="2" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">${emp.address || ''}</textarea>
            </div>
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <label><strong>${t('contract_type')}</strong></label>
                    <select name="contract_type" class="modal-select" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                        ${contractOptions.map(opt => `<option value="${opt.value}" ${emp.contract_type === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                    </select>
                </div>
                <div style="flex: 1;">
                    <label><strong>${t('marital_status')}</strong></label>
                    <select name="marital_status" class="modal-select" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                        ${maritalOptions.map(opt => `<option value="${opt.value}" ${emp.marital_status === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <label><strong>${t('birth_date')}</strong></label>
                    <input type="date" name="birth_date" value="${emp.birth_date || ''}" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                </div>
                <div style="flex: 1;">
                    <label><strong>${t('hire_date')}</strong></label>
                    <input type="date" name="hire_date" value="${emp.hire_date || ''}" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                </div>
            </div>
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <label><strong>${t('nationality')}</strong></label>
                    <input type="text" name="nationality" value="${emp.nationality || 'Française'}" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                </div>
                <div style="flex: 1;">
                    <label><strong>${t('conges_payes')}</strong></label>
                    <input type="number" step="0.5" name="conges_payes" value="${emp.conges_payes}" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                </div>
            </div>
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <label><strong>${t('emergency_contact')}</strong></label>
                    <input type="text" name="emergency_contact" value="${emp.emergency_contact || ''}" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                </div>
                <div style="flex: 1;">
                    <label><strong>${t('emergency_phone')}</strong></label>
                    <input type="text" name="emergency_phone" value="${emp.emergency_phone || ''}" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                </div>
            </div>
            <div>
                <label><strong>${t('photo_url')}</strong></label>
                <input type="text" name="photo_url" value="${emp.photo_url || ''}" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;" placeholder="https://...">
            </div>
            <div>
                <label><strong>${t('status')}</strong></label>
                <select name="active" class="modal-select" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                    <option value="true" ${emp.active === true ? 'selected' : ''}>✅ ${t('active')}</option>
                    <option value="false" ${emp.active === false ? 'selected' : ''}>❌ ${t('inactive')}</option>
                </select>
            </div>
            <div style="font-size: 12px; color: #999; padding-top: 8px; border-top: 1px solid #eee;">
                🔧 ${t('last_modified')}: ${adminUser?.username || currentUser} (${new Date().toLocaleString()})
            </div>
        </div>
    `;
    
    const result = await showModal({
        icon: 'info',
        title: '✏️ ' + t('edit_employee') + ': ' + emp.username,
        isHtml: true,
        message: formHtml,
        buttons: [
            { text: '💾 ' + t('save'), type: 'primary', value: 'save' },
            { text: '🗑️ ' + t('delete'), type: 'danger', value: 'delete' },
            { text: t('cancel'), type: 'cancel', value: 'cancel' }
        ]
    });
    
    if (result.button === 'save') {
        const formContainer = document.querySelector('.employee-edit-form');
        if (formContainer) {
            const newPassword = formContainer.querySelector('[name="password"]').value;
            
            const updates = {
                username: formContainer.querySelector('[name="username"]').value,
                user_type: formContainer.querySelector('[name="user_type"]').value,
                phone: formContainer.querySelector('[name="phone"]').value,
                email: formContainer.querySelector('[name="email"]').value,
                address: formContainer.querySelector('[name="address"]').value,
                contract_type: formContainer.querySelector('[name="contract_type"]').value,
                marital_status: formContainer.querySelector('[name="marital_status"]').value,
                birth_date: formContainer.querySelector('[name="birth_date"]').value || null,
                hire_date: formContainer.querySelector('[name="hire_date"]').value || null,
                nationality: formContainer.querySelector('[name="nationality"]').value,
                conges_payes: parseFloat(formContainer.querySelector('[name="conges_payes"]').value),
                emergency_contact: formContainer.querySelector('[name="emergency_contact"]').value,
                emergency_phone: formContainer.querySelector('[name="emergency_phone"]').value,
                photo_url: formContainer.querySelector('[name="photo_url"]').value,
                active: formContainer.querySelector('[name="active"]').value === 'true'
            };
            
            if (newPassword) {
                updates.password = newPassword;
            }
            
            const { error: updateError } = await supabase
                .from('users')
                .update(updates)
                .eq('id', userId);
            
            if (updateError) {
                showToast('❌ ' + t('error') + ': ' + updateError.message, 'error');
            } else {
                showToast('✅ ' + t('saved'), 'success');
                document.getElementById('customModal').style.display = 'none';
                await loadEmployeeList();
                await loadAllBalances();
                if (userId === currentUserId) {
                    currentUserType = updates.user_type;
                    document.getElementById('userTypeDisplay').innerHTML = t(updates.user_type);
                }
            }
        } else {
            showToast('❌ ' + t('error'), 'error');
        }
    }
    else if (result.button === 'delete') {
        const deleteConfirmHtml = `
            <div style="text-align: center; padding: 10px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
                <div style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #e74c3c;">${t('confirm_delete_title')}</div>
                <div style="font-size: 14px; color: #666; margin-bottom: 20px;">${t('confirm_delete_message')}</div>
                <div style="background: #fef3c7; border-radius: 12px; padding: 12px; margin-bottom: 20px;">
                    <div style="font-size: 13px; color: #92400e;">⚠️ ${t('delete_warning')}</div>
                </div>
            </div>
        `;
        
        const deleteResult = await showModal({
            icon: 'warning',
            title: t('confirm_delete_title'),
            isHtml: true,
            message: deleteConfirmHtml,
            buttons: [
                { text: '✅ ' + t('confirm_delete'), type: 'danger', value: 'confirm' },
                { text: t('cancel'), type: 'cancel', value: 'cancel' }
            ]
        });
        
        if (deleteResult.button === 'confirm') {
            if (userId === currentUserId) {
                showToast('❌ ' + t('cannot_delete_self'), 'error');
                return;
            }
            
            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);
            
            if (deleteError) {
                showToast('❌ ' + t('error') + ': ' + deleteError.message, 'error');
            } else {
                showToast('✅ ' + t('employee_deleted'), 'success');
                document.getElementById('customModal').style.display = 'none';
                await loadEmployeeList();
                await loadAllBalances();
            }
        }
    }
};
// 关闭编辑员工弹窗
window.closeEditEmployeeModal = function() {
    document.getElementById('editEmployeeModal').style.display = 'none';
};

// 打开新增员工弹窗
window.openAddEmployeeModal = function() {
    // 用户类型选项（使用翻译）
    const userTypeOptions = [
        { value: 'chauffeur', label: t('chauffeur') },
        { value: 'employe', label: t('employe') },
        { value: 'preparateur', label: t('preparateur') },
        { value: 'secretaire', label: t('secretaire') },
        { value: 'manager', label: t('manager') },
        { value: 'admin', label: t('admin') }
    ];
    
    // 合同类型选项
    const contractOptions = [
        { value: 'CDI', label: 'CDI' },
        { value: 'CDD', label: 'CDD' },
        { value: 'Interim', label: 'Intérim' },
        { value: 'Stage', label: 'Stage' }
    ];
    
    const formHtml = `
        <div class="employee-add-form" style="display: grid; gap: 12px;">
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <label><strong>${t('username')} *</strong></label>
                    <input type="text" name="username" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;" placeholder="ex: Jean Dupont">
                </div>
                <div style="flex: 1;">
                    <label><strong>${t('password')} *</strong></label>
                    <input type="password" name="password" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;" value="password123">
                </div>
            </div>
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <label><strong>${t('user_type')}</strong></label>
                    <select name="user_type" class="modal-select" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                        ${userTypeOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                    </select>
                </div>
                <div style="flex: 1;">
                    <label><strong>${t('phone')}</strong></label>
                    <input type="text" name="phone" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                </div>
            </div>
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <label><strong>${t('email')}</strong></label>
                    <input type="email" name="email" class="modal-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                </div>
                <div style="flex: 1;">
                    <label><strong>${t('contract_type')}</strong></label>
                    <select name="contract_type" class="modal-select" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                        ${contractOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div>
                <label><strong>${t('address')}</strong></label>
                <textarea name="address" class="modal-textarea" rows="2" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;"></textarea>
            </div>
        </div>
    `;
    
    showModal({
        icon: 'info',
        title: '➕ ' + t('add_employee'),
        isHtml: true,
        message: formHtml,
        buttons: [
            { text: '✅ ' + t('create'), type: 'primary', value: 'create' },
            { text: t('cancel'), type: 'cancel', value: 'cancel' }
        ]
    }).then(async (result) => {
        if (result.button === 'create') {
            // 从 DOM 中获取表单值（弹窗还在，可以获取）
            const formContainer = document.querySelector('.employee-add-form');
            if (formContainer) {
                const username = formContainer.querySelector('[name="username"]').value;
                const password = formContainer.querySelector('[name="password"]').value || 'password123';
                
                if (!username) {
                    showToast('❌ ' + t('username_required'), 'error');
                    return;
                }
                
                const newEmployee = {
                    username: username,
                    password: password,
                    user_type: formContainer.querySelector('[name="user_type"]').value,
                    phone: formContainer.querySelector('[name="phone"]').value,
                    email: formContainer.querySelector('[name="email"]').value,
                    address: formContainer.querySelector('[name="address"]').value,
                    contract_type: formContainer.querySelector('[name="contract_type"]').value,
                    conges_payes: 25,
                    active: true,
                    face_registered: false,
                    created_at: new Date()
                };
                
                const { error: insertError } = await supabase
                    .from('users')
                    .insert([newEmployee]);
                
                if (insertError) {
                    showToast('❌ ' + t('error') + ': ' + insertError.message, 'error');
                } else {
                    showToast('✅ ' + t('employee_created'), 'success');
                    await loadEmployeeList();
                    await loadAllBalances();
                }
            } else {
                showToast('❌ ' + t('error') + ': 无法获取表单数据', 'error');
            }
        }
    });
};

// 关闭新增员工弹窗
window.closeAddEmployeeModal = function() {
    document.getElementById('addEmployeeModal').style.display = 'none';
};

// 保存新增员工
window.saveAddEmployee = async function() {
    const username = document.getElementById('new_username').value.trim();
    const password = document.getElementById('new_password').value;
    
    if (!username) {
        showToast('❌ ' + t('username_required'), 'error');
        return;
    }
    
    const newEmployee = {
        username: username,
        password: password,
        user_type: document.getElementById('new_user_type').value,
        phone: document.getElementById('new_phone').value,
        email: document.getElementById('new_email').value,
        address: document.getElementById('new_address').value,
        contract_type: document.getElementById('new_contract_type').value,
        conges_payes: 25,
        active: true,
        face_registered: false,
        created_at: new Date()
    };
    
    const { error } = await supabase
        .from('users')
        .insert([newEmployee]);
    
    if (error) {
        showToast('❌ ' + t('error') + ': ' + error.message, 'error');
    } else {
        showToast('✅ ' + t('employee_created'), 'success');
        closeAddEmployeeModal();
        await loadEmployeeList();
        await loadAllBalances();
    }
};

    



// ============================================================================
// 余额管理
// ============================================================================
async function loadAllBalances() {
    if (!isManager) return;
    
    const { data: users } = await supabase.from('users').select('id, username, conges_payes').order('username');
    const container = document.getElementById('allBalances');
    if (!container) return;
    
    if (!users || users.length === 0) {
        container.innerHTML = '<div class="empty-state">' + t('no_data') + '</div>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="balance-card" id="balance-${user.id}">
            <div class="balance-header"><span>${escapeHtml(user.username)}</span><span>${new Date().getFullYear()}</span></div>
            <div class="balance-numbers">
                <div class="balance-item">
                    <div class="balance-value" id="balance-value-${user.id}">${user.conges_payes}</div>
                    <div class="balance-label">${t('days')}</div>
                </div>
            </div>
        </div>
    `).join('');
}
// ============================================================================
// 我的请假历史
// ============================================================================
async function loadMyLeaveRequests() {
    const { data } = await supabase
        .from('leave_details')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });
    
    const container = document.getElementById('myLeaveRequests');
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state">' + t('no_data') + '</div>';
        return;
    }
    
    const statusLabels = {
        en_attente: t('status_en_attente'), approuve: t('status_approuve'),
        refuse: t('status_refuse'), annule: t('status_annule'),
        pending_cancel: t('status_pending_cancel')
    };
    const statusColors = {
        en_attente: '#f39c12', approuve: '#27ae60',
        refuse: '#e74c3c', annule: '#95a5a6', pending_cancel: '#f39c12'
    };
    const today = getTodayDate();
    
    container.innerHTML = data.map(function(req) {
        let actions = '';
        let approverInfo = '';
        
        // 显示批准人信息
        if (req.status === 'approuve' && req.approver_name) {
            approverInfo = `<div style="font-size: 12px; color: #666; margin-top: 8px;">✅ ${t('approved_by')}: ${req.approver_name} (${new Date(req.approved_at).toLocaleString()})</div>`;
        }
        
        if (req.status === 'en_attente') {
            actions = '<div class="request-actions"><button class="btn-cancel" onclick="cancelLeaveRequest(' + req.id + ')">🗑️ ' + t('cancel') + '</button></div>';
        } else if (req.status === 'approuve' && req.end_date > today) {
            actions = '<div class="request-actions"><button class="btn-cancel" onclick="requestCancelLeave(' + req.id + ')">📝 ' + t('request_cancel') + '</button></div>';
        } else if (req.status === 'pending_cancel') {
            actions = '<div class="request-actions"><button class="btn-cancel" disabled style="background:#95a5a6;">⏳ ' + t('waiting_approval') + '</button></div>';
        }
        
        return '<div class="leave-request-card ' + req.status + '" style="border-left-color: ' + statusColors[req.status] + '">' +
            '<div class="request-header"><span class="request-user">' + (req.leave_type_name || 'Congé') + '</span>' +
            '<span class="request-type" style="background: ' + statusColors[req.status] + '">' + statusLabels[req.status] + '</span></div>' +
            '<div class="request-dates">📅 ' + new Date(req.start_date).toLocaleDateString() + ' - ' + new Date(req.end_date).toLocaleDateString() + ' (' + req.days_count + ' ' + t('days') + ')</div>' +
            (req.reason ? '<div class="request-reason">💬 ' + escapeHtml(req.reason) + '</div>' : '') +
            approverInfo +
            actions + '</div>';
    }).join('');
}
// ============================================================================
// 取消/申请取消请假
// ============================================================================
window.cancelLeaveRequest = async function(id) {
    const confirmed = await showConfirm('confirm_cancel_title', 'confirm_cancel_message');
    if (!confirmed) return;
    
    const { data: leave } = await supabase.from('leave_requests').select('status, leave_type_id, days_count').eq('id', id).single();
    if (leave && leave.status === 'approuve') {
        const { data: leaveType } = await supabase.from('leave_types').select('name_fr').eq('id', leave.leave_type_id).single();
        if (leaveType && leaveType.name_fr === 'Congés payés') {
            const { data: user } = await supabase.from('users').select('conges_payes').eq('id', currentUserId).single();
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

window.requestCancelLeave = async function(id) {
    const confirmed = await showConfirm('confirm_request_cancel_title', 'confirm_request_cancel_message');
    if (!confirmed) return;
    
    const { error } = await supabase.from('leave_requests').update({ status: 'pending_cancel', cancel_requested_at: new Date() }).eq('id', id);
    if (error) {
        showToast(t('request_cancel_failed') + ': ' + error.message, 'error');
    } else {
        showToast(t('request_cancel_success'), 'success');
        setTimeout(() => location.reload(), 500);
    }
};
window.approveCancelLeave = async function(id, daysCount, leaveTypeName, userId) {
    if (leaveTypeName === 'Congés payés') {
        const { data: user } = await supabase.from('users').select('conges_payes').eq('id', userId).single();
        const newBalance = (user.conges_payes || 0) + daysCount;
        await supabase.from('users').update({ conges_payes: newBalance }).eq('id', userId);
        showToast(t('cancel_approved_refund').replace('{days}', daysCount), 'success');
    } else {
        showToast(t('cancel_approved_no_refund'), 'success');
    }
    
    await supabase.from('leave_requests').update({ 
        status: 'annule',
        cancel_processed_by: currentUserId,
        cancel_processed_at: new Date()
    }).eq('id', id);
    
    setTimeout(() => location.reload(), 500);
};

window.rejectCancelLeave = async function(id) {
    await supabase.from('leave_requests').update({ 
        status: 'approuve',
        cancel_rejected_by: currentUserId,
        cancel_rejected_at: new Date()
    }).eq('id', id);
    
    showToast(t('cancel_rejected'), 'info');
    setTimeout(() => location.reload(), 500);
};



window.rejectLeave = async function(id) {
    await supabase.from('leave_requests').update({ status: 'refuse', approver_id: currentUserId, approved_at: new Date() }).eq('id', id);
    showToast(t('reject'), 'info');
    setTimeout(() => location.reload(), 500);
};

async function loadPendingCancelRequests() {
    if (!isManager) return;
    
    const { data, error } = await supabase.from('leave_details').select('*').eq('status', 'pending_cancel').order('created_at', { ascending: false });
    const container = document.getElementById('pendingCancelList');
    if (!container) return;
    
    if (error || !data || data.length === 0) {
        container.innerHTML = `<div class="empty-state">✅ ${t('no_pending_cancel')}</div>`;
        return;
    }
    
    container.innerHTML = data.map(function(r) {
        const isPaidLeave = r.leave_type_name === 'Congés payés';
        const balanceText = isPaidLeave ? `<div style="color:#e67e22;">💰 ${t('cancel_approved_refund').replace('{days}', r.days_count)}</div>` : `<div style="color:#666;">📋 ${t('cancel_approved_no_refund')}</div>`;
        return '<div class="leave-request-card en_attente">' +
            '<div class="request-header"><span class="request-user">👤 ' + (r.user_name || '用户ID:' + r.user_id) + '</span>' +
            '<span class="request-type" style="background:#f39c12;">⏳ ' + t('status_pending_cancel') + '</span></div>' +
            '<div class="request-dates">📅 ' + new Date(r.start_date).toLocaleDateString() + ' - ' + new Date(r.end_date).toLocaleDateString() + ' (' + r.days_count + ' ' + t('days') + ')</div>' +
            '<div><strong>' + t('leave_type') + ':</strong> ' + (r.leave_type_name || '未知') + '</div>' + balanceText +
            '<div class="request-actions"><button class="btn-validate" onclick="approveCancelLeave(' + r.id + ', ' + r.days_count + ', \'' + r.leave_type_name + '\', ' + r.user_id + ')">✅ ' + t('approve') + '</button>' +
            '<button class="btn-refuse" onclick="rejectCancelLeave(' + r.id + ')">❌ ' + t('reject') + '</button></div></div>';
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
        
        const typeMap = { check_in: t('check_in'), check_out: t('check_out'), break_start: t('break_start'), break_end: t('break_end') };
        const typeClass = { check_in: 'check_in', check_out: 'check_out', break_start: 'break_start', break_end: 'break_end' };
        
        historyDiv.innerHTML = data.map(function(record) {
            const time = new Date(record.action_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return '<div class="history-item"><span class="history-time">🕐 ' + time + '</span><span class="history-type ' + typeClass[record.action_type] + '">' + typeMap[record.action_type] + '</span></div>';
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
// 团队日历 - 完整优化版本
// ============================================================================
// ============================================================================
// 团队日历 - 完整优化版本
// ============================================================================
async function loadTeamCalendar() {
    // 防止重复调用
    if (isCalendarLoading) return;
    isCalendarLoading = true;
    
    try {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        
        document.getElementById('currentMonthDisplay').textContent = currentCalendarDate.toLocaleDateString(
            currentLanguage === 'zh' ? 'zh-CN' : currentLanguage === 'fr' ? 'fr-FR' : 'en-US',
            { month: 'long', year: 'numeric' }
        );
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let { data: usersList } = await supabase.from('users').select('id, username, user_type').order('username');
        
        if (!isManager) {
            usersList = usersList?.filter(u => u.id === currentUserId) || [];
        }
        
        const { data: fixedHolidays } = await supabase.from('holidays').select('month_day');
        
        const start = year + '-' + String(month + 1).padStart(2, '0') + '-01';
        const end = year + '-' + String(month + 1).padStart(2, '0') + '-' + daysInMonth;
        
        // 并行查询优化
        const [attendanceRecords, leaveRequests, overrides, usersMap] = await Promise.all([
            supabase.from('attendance_records').select('*').gte('record_date', start).lte('record_date', end),
            supabase.from('leave_details').select('*').eq('status', 'approuve'),
            supabase.from('attendance_overrides').select('*').gte('override_date', start).lte('override_date', end),
            supabase.from('users').select('id, username')
        ]);
        
        // 构建用户映射表（用于显示修改人姓名）
        const userMap = new Map();
        if (usersMap.data) {
            usersMap.data.forEach(u => userMap.set(u.id, u.username));
        }
        
        const attendanceData = attendanceRecords.data || [];
        const leaveData = leaveRequests.data || [];
        const overrideData = overrides.data || [];
        
        // 构建映射
        const leaveMap = new Map();
        for (const leave of leaveData) {
            const leaveStart = new Date(leave.start_date);
            const leaveEnd = new Date(leave.end_date);
            for (let d = new Date(leaveStart); d <= leaveEnd; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                leaveMap.set(`${leave.user_id}_${dateStr}`, leave);
            }
        }
        
        // 构建打卡映射，同时保存 created_by 信息
        const attendanceMap = new Map();
        for (const r of attendanceData) {
            const key = `${r.user_id}_${r.record_date}`;
            if (!attendanceMap.has(key)) attendanceMap.set(key, []);
            attendanceMap.get(key).push({
                action_type: r.action_type,
                action_time: r.action_time,
                work_hours: r.work_hours,
                created_by: r.created_by
            });
        }
        
        const overrideMap = new Map();
        for (const r of overrideData) {
            overrideMap.set(`${r.user_id}_${r.override_date}`, r);
        }
        
        // 计算移动假日
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
        document.getElementById('calendarHeader').innerHTML = '<table>' + headers + '</tr>';
        
        const tbody = document.getElementById('calendarBody');
        tbody.innerHTML = '';
        
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();
        
        function getTimeOrNull(record) {
            return record ? new Date(record.action_time).toLocaleTimeString() : t('no_data');
        }
        
        // 构建表格行
        for (const user of usersList) {
            let rowHtml = '<td style="position:sticky; left:0; background:#e8f0fe; z-index:10;">' +
                '<span class="user-name">' + escapeHtml(user.username) + '</span>' +
            '</table>';
            
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
                const date = new Date(year, month, d);
                const md = String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isFixedHoliday = fixedHolidays?.some(h => h.month_day === md);
                const isMovable = isMovableHoliday(d, month, year);
                const isHoliday = isFixedHoliday || isMovable;
                
                const override = overrideMap.get(`${user.id}_${dateStr}`);
                if (override) {
                    let statusText = '';
                    let statusClass = '';
                    let statusLabel = '';
                    if (override.override_status === 'present') { statusText = '✓'; statusClass = 'status-working'; statusLabel = t('present'); }
                    else if (override.override_status === 'absent') { statusText = '✗'; statusClass = 'status-absent'; statusLabel = t('absent'); }
                    else if (override.override_status === 'mission') { statusText = '🚚'; statusClass = 'status-mission'; statusLabel = t('mission'); }
                    else if (override.override_status === 'sick') { statusText = '🤒'; statusClass = 'status-sick'; statusLabel = t('sick'); }
                    else if (override.override_status === 'halfday') { statusText = '½'; statusClass = 'status-halfday'; statusLabel = t('halfday'); }
                    else { statusText = '?'; statusClass = 'status-absent'; statusLabel = t('unknown'); }
                    
                    const setByName = userMap.get(override.set_by) || t('unknown');
                    const setTime = new Date(override.set_at).toLocaleString();
                    
                    const overrideTooltip = [
                        `📅 ${dateStr}`,
                        `👤 ${user.username}`,
                        `✏️ ${t('edit')}: ${statusLabel}`,
                        `👨‍💼 ${t('admin')}: ${setByName}`,
                        `⏱️ ${t('time')}: ${setTime}`
                    ];
                    
                    rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\', ' + isWeekend + ', ' + isHoliday + ')" title="' + escapeHtml(overrideTooltip.join('\n')) + '">' +
                        '<span class="' + statusClass + '">' + statusText + '</span>' +
                    '</td>';
                    continue;
                }
                
                const leave = leaveMap.get(`${user.id}_${dateStr}`);
                if (leave) {
                    let leaveIcon = '🏖️';
                    let leaveClass = 'status-leave';
                    const leaveTypeName = leave.leave_type_name || '';
                    
                    if (leaveTypeName === 'Congés payés') { leaveIcon = '🏖️'; leaveClass = 'status-leave-cp'; }
                    else if (leaveTypeName === 'Maladie') { leaveIcon = '🤒'; leaveClass = 'status-leave-sick'; }
                    else if (leaveTypeName === 'Congé maternité' || leaveTypeName === 'Congé paternité') { leaveIcon = '👶'; leaveClass = 'status-leave-family'; }
                    else if (leaveTypeName === 'Congé sans solde') { leaveIcon = '💰'; leaveClass = 'status-leave-unpaid'; }
                    else if (leaveTypeName === 'École') { leaveIcon = '📚'; leaveClass = 'status-leave-school'; }
                    else if (leaveTypeName === 'Congés mariage') { leaveIcon = '💍'; leaveClass = 'status-leave-family'; }
                    else if (leaveTypeName === 'Congés décès') { leaveIcon = '🕊️'; leaveClass = 'status-leave-family'; }
                    else if (leaveTypeName === 'Événements familiaux') { leaveIcon = '🏠'; leaveClass = 'status-leave-family'; }
                    
                    const leaveTooltip = [
                        `📅 ${dateStr}`,
                        `👤 ${user.username}`,
                        `📋 ${t('leave_type')}: ${leaveTypeName}`,
                        `📅 ${new Date(leave.start_date).toLocaleDateString()} - ${new Date(leave.end_date).toLocaleDateString()}`
                    ];
                    
                    if (leave.approver_name) {
                        leaveTooltip.push(`✅ ${t('approved_by')}: ${leave.approver_name}`);
                        if (leave.approved_at) {
                            leaveTooltip.push(`⏱️ ${t('time')}: ${new Date(leave.approved_at).toLocaleString()}`);
                        }
                    }
                    
                    rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\', ' + isWeekend + ', ' + isHoliday + ')" title="' + escapeHtml(leaveTooltip.join('\n')) + '">' +
                        '<span class="' + leaveClass + '">' + leaveIcon + '</span>' +
                    '</tr>';
                    continue;
                }
                
                if (isHoliday) {
                    const holidayTooltip = [
                        `📅 ${dateStr}`,
                        `👤 ${user.username}`,
                        `🎉 ${t('legend_holiday')}`
                    ];
                    rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\', ' + isWeekend + ', ' + isHoliday + ')" title="' + escapeHtml(holidayTooltip.join('\n')) + '">' +
                        '<span class="status-holiday">🎉</span>' +
                    '</td>';
                    continue;
                }
                
                if (isWeekend) {
                    const weekendTooltip = [
                        `📅 ${dateStr}`,
                        `👤 ${user.username}`,
                        `🌙 ${t('legend_weekend')}`
                    ];
                    rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\', ' + isWeekend + ', ' + isHoliday + ')" title="' + escapeHtml(weekendTooltip.join('\n')) + '">' +
                        '<span class="status-weekend">🌙</span>' +
                    '</td>';
                    continue;
                }
                
                const records = attendanceMap.get(`${user.id}_${dateStr}`) || [];
                const checkInRecord = records.find(r => r.action_type === 'check_in');
                const checkOutRecord = records.find(r => r.action_type === 'check_out');
                const breakStartRecord = records.find(r => r.action_type === 'break_start');
                const breakEndRecord = records.find(r => r.action_type === 'break_end');
                
                const tooltipLines = [
                    `📅 ${dateStr}`,
                    `👤 ${user.username}`,
                    `${t('check_in')}: ${getTimeOrNull(checkInRecord)}`,
                    `${t('break_start')}: ${getTimeOrNull(breakStartRecord)}`,
                    `${t('break_end')}: ${getTimeOrNull(breakEndRecord)}`,
                    `${t('check_out')}: ${getTimeOrNull(checkOutRecord)}`
                ];
                
                // 如果是管理员补录的下班记录，显示操作人
                if (checkOutRecord && checkOutRecord.created_by && checkOutRecord.created_by !== user.id) {
                    const operatorName = userMap.get(checkOutRecord.created_by) || t('unknown');
                    tooltipLines.push(`👨‍💼 ${t('admin')}: ${operatorName}`);
                }
                
                if (checkOutRecord && checkOutRecord.work_hours !== null) {
                    tooltipLines.push(`⏱️ ${t('work_hours')}: ${checkOutRecord.work_hours}h`);
                    if (checkOutRecord.work_hours < 8) {
                        tooltipLines.push(`⚠️ ${t('work_hours_insufficient')}`);
                    } else {
                        tooltipLines.push(`✅ ${t('present')}`);
                    }
                } else if (checkInRecord && !checkOutRecord) {
                    tooltipLines.push(`⚠️ ${t('missing_checkout')}`);
                }
                
                if (checkInRecord) {
                    if (checkOutRecord && checkOutRecord.work_hours >= 8) {
                        rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\', ' + isWeekend + ', ' + isHoliday + ')" title="' + escapeHtml(tooltipLines.join('\n')) + '">' +
                            '<span class="status-working">✓</span>' +
                        '</td>';
                    } else {
                        rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\', ' + isWeekend + ', ' + isHoliday + ')" title="' + escapeHtml(tooltipLines.join('\n')) + '">' +
                            '<span class="status-mission">⚠️</span>' +
                        '</tr>';
                    }
                    continue;
                }
                
                const absentTooltip = [
                    `📅 ${dateStr}`,
                    `👤 ${user.username}`,
                    `❌ ${t('absent')}`
                ];
                rowHtml += '<td class="status-cell" onclick="quickEditAttendance(' + user.id + ', \'' + dateStr + '\', ' + isWeekend + ', ' + isHoliday + ')" title="' + escapeHtml(absentTooltip.join('\n')) + '">' +
                    '<span class="status-absent">✗</span>' +
                '<tr>';
            }
            
            rowHtml += '</tr>';
            const tr = document.createElement('tr');
            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        }
        
        setTimeout(function() {
            if (year === currentYear && month === currentMonth) {
                const targetCell = document.querySelector('#calendarBody td.status-cell:nth-child(' + (currentDay + 1) + ')');
                if (targetCell) {
                    targetCell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }
        }, 150);
        
    } catch (error) {
        console.error('加载日历失败:', error);
    } finally {
        isCalendarLoading = false;
    }
}
// ============================================================================
// 统一编辑入口 - 支持周末/节假日限制
// ============================================================================
window.quickEditAttendance = async function(userId, dateStr, isWeekend, isHoliday) {
    if (!canEditAttendance) return;
    
    const isRestDay = isWeekend || isHoliday;
    
    // 获取当天信息
    const { data: checkIn } = await supabase
        .from('attendance_records')
        .select('action_time')
        .eq('user_id', userId)
        .eq('record_date', dateStr)
        .eq('action_type', 'check_in')
        .maybeSingle();
    
    let { data: checkOut } = await supabase
        .from('attendance_records')
        .select('action_time, work_hours, created_by, id')
        .eq('user_id', userId)
        .eq('record_date', dateStr)
        .eq('action_type', 'check_out')
        .maybeSingle();
    
    const { data: existingOverride } = await supabase
        .from('attendance_overrides')
        .select('override_status')
        .eq('user_id', userId)
        .eq('override_date', dateStr)
        .maybeSingle();
    
    const { data: user } = await supabase.from('users').select('username').eq('id', userId).single();
    
    // 构建美观的弹窗内容
    let currentInfo = `
        <div style="font-size: 14px; line-height: 1.8;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
                    ${user?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                    <div style="font-weight: 600; font-size: 16px;">${escapeHtml(user?.username || '')}</div>
                    <div style="color: #888; font-size: 12px;">${dateStr}</div>
                </div>
            </div>
            <div style="background: #f5f5f5; border-radius: 12px; padding: 12px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #666;">📅 ${t('check_in')}</span>
                    <span style="font-weight: 500;">${checkIn ? new Date(checkIn.action_time).toLocaleTimeString() : t('no_data')}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #666;">🏠 ${t('check_out')}</span>
                    <span style="font-weight: 500;">${checkOut ? new Date(checkOut.action_time).toLocaleTimeString() : t('no_data')}</span>
                </div>
                ${checkOut ? `<div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #ddd;">
                    <span style="color: #666;">⏱️ ${t('work_hours')}</span>
                    <span style="font-weight: 500; ${checkOut.work_hours < 8 ? 'color: #e67e22;' : 'color: #27ae60;'}">${checkOut.work_hours}h</span>
                </div>` : ''}
            </div>
    `;
    
    // 添加当天类型标识
    if (isRestDay) {
        const dayType = isHoliday ? '🎉 ' + t('legend_holiday') : '🌙 ' + t('legend_weekend');
        currentInfo += `<div style="background: #e8f0fe; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 13px;">
            📌 ${dayType}
        </div>`;
    }
    
    // 判断异常
    let missingCheckout = false;
    if (!isRestDay) {
        if (!checkOut && checkIn) {
            missingCheckout = true;
            currentInfo += `<div style="background: #fee2e2; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; color: #e74c3c; font-size: 13px;">
                ⚠️ ${t('missing_checkout')}
            </div>`;
        } else if (checkOut && checkOut.work_hours < 8) {
            currentInfo += `<div style="background: #fff3e0; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; color: #e67e22; font-size: 13px;">
                ⚠️ ${t('work_hours_insufficient')} (${checkOut.work_hours}h)
            </div>`;
        }
    }
    
    if (existingOverride) {
        const statusMap = { 
            present: '✅ ' + t('present'), 
            absent: '❌ ' + t('absent'), 
            mission: '🚚 ' + t('mission'), 
            sick: '🤒 ' + t('sick'), 
            halfday: '⏸️ ' + t('halfday') 
        };
        currentInfo += `<div style="background: #e8f5e9; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 13px;">
            📌 ${t('current_status')}: ${statusMap[existingOverride.override_status] || existingOverride.override_status}
        </div>`;
    }
    
    currentInfo += `</div>`;
    
    // 状态选项
    let statusOptions = [];
    
    if (isRestDay) {
        statusOptions = [
            { value: 'present', label: '✅ ' + t('present') + ' (加班)' },
            { value: 'mission', label: '🚚 ' + t('mission') },
            { value: 'halfday', label: '⏸️ ' + t('halfday') },
            { value: 'default', label: '🔄 ' + t('restored_default') }
        ];
    } else {
        statusOptions = [
            { value: 'present', label: '✅ ' + t('present') },
            { value: 'absent', label: '❌ ' + t('absent') },
            { value: 'mission', label: '🚚 ' + t('mission') },
            { value: 'sick', label: '🤒 ' + t('sick') },
            { value: 'halfday', label: '⏸️ ' + t('halfday') },
            { value: 'default', label: '🔄 ' + t('restored_default') }
        ];
        
        // 只在缺少下班打卡时显示补录选项
        if (missingCheckout && !existingOverride) {
            statusOptions.unshift({ value: 'fix', label: '🔧 ' + t('fix_abnormal') });
        }
    }
    
    const result = await showModal({
        icon: 'info',
        title: '✏️ ' + (t('edit_attendance') || '编辑出勤'),
        isHtml: true,
        message: currentInfo,
        select: { options: statusOptions },
        buttons: [
            { text: '💾 ' + t('save'), type: 'primary', value: 'save' },
            { text: '❌ ' + t('cancel'), type: 'cancel', value: 'cancel' }
        ]
    });
    
    if (result.button === 'cancel') return;
    
    // 处理异常（补录下班时间）
    if (result.selectValue === 'fix') {
        if (!checkIn) {
            showToast(t('no_check_in_found'), 'error');
            await loadTeamCalendar();
            return;
        }
        
        const timeOptions = [];
        for (let hour = 16; hour <= 20; hour++) {
            for (let minute of [0, 15, 30, 45]) {
                if (hour === 20 && minute > 0) continue;
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const checkOutTime = new Date(`${dateStr}T${timeStr}:00`);
                const checkInTime = new Date(checkIn.action_time);
                let workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
                workHours = Math.max(0, Math.round(workHours * 10) / 10);
                const label = workHours >= 8 ? `✅ ${timeStr} (${workHours}h)` : `⚠️ ${timeStr} (${workHours}h)`;
                timeOptions.push({ value: timeStr, label: label });
            }
        }
        
        const timeResult = await showModal({
            icon: 'info',
            title: '🔧 ' + (t('record_checkout_time') || '补录下班时间'),
            isHtml: true,  // 添加这一行！
            message: `<div style="padding: 8px; background: #f0f4ff; border-radius: 8px;">
                <strong>${t('check_in_time')}:</strong> ${new Date(checkIn.action_time).toLocaleTimeString()}
            </div>`,
            select: { options: timeOptions },
            buttons: [
                { text: '✅ ' + t('confirm'), type: 'primary', value: 'confirm' },
                { text: '❌ ' + t('cancel'), type: 'cancel', value: 'cancel' }
            ]
        });
        
        if (timeResult.button === 'cancel' || !timeResult.selectValue) {
            showToast(t('cancelled'), 'info');
            await loadTeamCalendar();
            return;
        }
        
        const checkOutTime = new Date(`${dateStr}T${timeResult.selectValue}:00`);
        const checkInTime = new Date(checkIn.action_time);
        let workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        workHours = Math.max(0, Math.round(workHours * 10) / 10);
        
        const { error: insertError } = await supabase.from('attendance_records').insert({
            user_id: userId, 
            username: user?.username,
            record_date: dateStr, 
            action_type: 'check_out',
            action_time: checkOutTime.toISOString(), 
            work_hours: workHours,
            need_review: false, 
            status: 'normal', 
            is_valid: true,
            created_by: currentUserId
        }).select();  // 添加 select() 返回插入的记录
        
        if (insertError) {
            showToast('❌ 插入失败: ' + insertError.message, 'error');
        } else {
            showToast(`✅ ${t('checkout_recorded')} ${timeResult.selectValue} (${workHours}h)`, 'success');
        }
        
        await loadTeamCalendar();
        await updateTabBadges();
        return;
    }
    
    // 恢复默认
    if (result.selectValue === 'default') {
        // 1. 删除覆盖记录
        await supabase.from('attendance_overrides').delete().eq('user_id', userId).eq('override_date', dateStr);
        
        // 2. 重新查询当天的下班记录（确保获取最新数据）
        const { data: latestCheckout } = await supabase
            .from('attendance_records')
            .select('id, created_by')
            .eq('user_id', userId)
            .eq('record_date', dateStr)
            .eq('action_type', 'check_out')
            .maybeSingle();
        
        // 删除管理员补录的下班记录（created_by 不等于用户自己且不为空）
        let deleted = false;
        if (latestCheckout && latestCheckout.created_by && latestCheckout.created_by !== userId) {
            const { error: deleteError } = await supabase
                .from('attendance_records')
                .delete()
                .eq('id', latestCheckout.id);
            
            if (!deleteError) {
                deleted = true;
            }
        }
        
        if (deleted) {
            showToast(`🔄 ${t('restored_default')}，已删除补录的下班记录`, 'success');
        } else {
            showToast(`🔄 ${t('restored_default')}`, 'success');
        }
        
        await loadTeamCalendar();
        await updateTabBadges();
        return;
    }
    
    // 手动设置状态
    await supabase.from('attendance_overrides').upsert({
        user_id: userId, 
        override_date: dateStr, 
        override_status: result.selectValue,
        set_by: currentUserId, 
        reason: 'manual_edit', 
        set_at: new Date()
    }, { onConflict: 'user_id, override_date' });
    
    showToast(`✅ ${t('saved')}`, 'success');
    await loadTeamCalendar();
    await updateTabBadges();
};

// ============================================================================
// 汉堡菜单控制
// ============================================================================

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
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state">' + t('no_data') + '</div>';
        return;
    }
    
    container.innerHTML = data.map(function(r) {
        // 已批准的显示批准人
        let approverInfo = '';
        if (r.status === 'approuve' && r.approver_name) {
            approverInfo = `<div style="font-size: 12px; color: #666; margin-top: 8px;">✅ ${t('approved_by')}: ${r.approver_name} (${new Date(r.approved_at).toLocaleString()})</div>`;
        }
        
        return '<div class="leave-request-card en_attente">' +
            '<div class="request-header"><span class="request-user">👤 ' + (r.user_name || '用户ID:' + r.user_id) + '</span>' +
            '<span class="request-type" style="background:#f39c12;">⏳ ' + t('status_en_attente') + '</span></div>' +
            '<div class="request-dates">📅 ' + new Date(r.start_date).toLocaleDateString() + ' - ' + new Date(r.end_date).toLocaleDateString() + ' (' + r.days_count + ' ' + t('days') + ')</div>' +
            '<div><strong>' + t('leave_type') + ':</strong> ' + (r.leave_type_name || '未知') + '</div>' +
            (r.leave_type_name === 'Congés payés' ? '<div style="color:#e67e22;">💰 ' + t('will_deduct_balance') + '</div>' : '<div style="color:#27ae60;">📋 ' + t('no_deduction') + '</div>') +
            (r.reason ? '<div class="request-reason">💬 ' + r.reason + '</div>' : '') +
            approverInfo +
            '<div class="request-actions"><button class="btn-validate" onclick="approveLeave(' + r.id + ', ' + r.user_id + ', ' + r.days_count + ', \'' + r.leave_type_name + '\')">✅ ' + t('approve') + '</button>' +
            '<button class="btn-refuse" onclick="rejectLeave(' + r.id + ')">❌ ' + t('reject') + '</button></div></div>';
    }).join('');
}
window.approveLeave = async function(leaveId, userId, daysCount, leaveTypeName) {
    const isPaidLeave = leaveTypeName === 'Congés payés';
    
    if (isPaidLeave) {
        const { data: user } = await supabase.from('users').select('conges_payes').eq('id', userId).single();
        const newBalance = (user.conges_payes || 0) - daysCount;
        if (newBalance < 0) {
            showToast('员工余额不足，无法批准', 'error');
            return;
        }
        await supabase.from('users').update({ conges_payes: newBalance }).eq('id', userId);
    }
    
    await supabase.from('leave_requests').update({ status: 'approuve', approver_id: currentUserId, approved_at: new Date() }).eq('id', leaveId);
    showToast(t('approve') + ' ✅', 'success');
    
    await loadPendingLeaveRequests();
    await loadTeamCalendar();
    await updateTabBadges();
};

// ============================================================================
// 事件监听
// ============================================================================
function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', async function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            const tabId = btn.dataset.tab;
            document.getElementById('tab-' + tabId).classList.add('active');
            
            if (tabId === 'team-calendar') {
                await loadTeamCalendar();
                await updateTabBadges();
            }
            if (tabId === 'team-leaves' && isManager) {
                await loadPendingLeaveRequests();
                await updateTabBadges();
            }
            if (tabId === 'pending-cancel' && isManager) {
                await loadPendingCancelRequests();
                await updateTabBadges();
            }
            if (tabId === 'employee-management' && isManager) {
                await loadEmployeeList();
            }
            if (tabId === 'my-profile') {
                await loadMyProfile();
            }
        });
    });
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
    
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        sessionStorage.removeItem('session');
        window.location.href = 'index.html';
    });
    
    // 新增员工按钮
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', () => window.openAddEmployeeModal());
    }
    
    // 保存我的资料按钮
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => saveMyProfile());
    }
}
// 保存我的资料
async function saveMyProfile() {
    const newPassword = document.getElementById('profile_new_password').value;
    
    const updates = {
        username: document.getElementById('profile_username').value,
        phone: document.getElementById('profile_phone').value,
        email: document.getElementById('profile_email').value,
        address: document.getElementById('profile_address').value,
        birth_date: document.getElementById('profile_birth_date').value || null,
        nationality: document.getElementById('profile_nationality').value,
        emergency_contact: document.getElementById('profile_emergency_contact').value,
        emergency_phone: document.getElementById('profile_emergency_phone').value,
        marital_status: document.getElementById('profile_marital_status').value,
        photo_url: document.getElementById('profile_photo_url').value
    };
    
    // 如果填写了新密码，更新密码
    if (newPassword && newPassword.trim() !== '') {
        updates.password = newPassword;
    }
    
    const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', currentUserId);
    
    if (error) {
        showToast('❌ ' + t('error') + ': ' + error.message, 'error');
    } else {
        showToast('✅ ' + t('profile_updated'), 'success');
        
        // 更新全局用户名显示
        if (updates.username) {
            currentUser = updates.username;
            document.getElementById('currentUserDisplay').innerHTML = '👤 ' + currentUser;
        }
        
        // 重新加载头像
        if (updates.photo_url) {
            const avatarDiv = document.getElementById('profileAvatar');
            if (avatarDiv) {
                avatarDiv.innerHTML = `<img src="${updates.photo_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            }
        }
        
        // 刷新员工列表（如果管理员页面打开了）
        if (isManager && document.getElementById('tab-employee-management')?.classList.contains('active')) {
            await loadEmployeeList();
        }
    }
}
// ============================================================================
// 初始化
// ============================================================================
document.addEventListener('DOMContentLoaded', async function() {
    if (!window.supabase) {
        window.location.href = 'index.html';
        return;
    }
    
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
    
    const userDisplay = document.getElementById('currentUserDisplay');
    if (userDisplay) userDisplay.innerHTML = '👤 ' + currentUser;
    
    const roleName = translationsData.zh[currentUserType] || currentUserType;
    const userTypeDisplay = document.getElementById('userTypeDisplay');
    if (userTypeDisplay) userTypeDisplay.innerHTML = roleName;
    
    const savedLang = localStorage.getItem('language') || 'zh';
    setLanguage(savedLang);
    setupPermissions();
    
    updateDateTime();
    setInterval(updateDateTime, 1000);
    fetchRealWeather();
    
    await loadLeaveTypes();
    await checkAndAddMonthlyLeave();
    
    await loadMyAttendance();
    await loadMyLeaveRequests();
    await loadMyBalance();
    await loadTeamCalendar();
    
    if (isManager) {
        await loadPendingLeaveRequests();
        await loadPendingCancelRequests();
        await updateTabBadges();
    }
    
    setupEventListeners();
     
});