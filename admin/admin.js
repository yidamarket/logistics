// ========== admin/admin.js - 完整版 ==========
let currentUser = null;
let currentLang = 'fr';
let orders = [];
let clients = [];
let promotions = [];
let changeRequests = [];
let drivers = [];
let currentFilter = 'all';
let pointsConfig = null;
let currentOrderId = null;

const translations = {
    fr: {
        // ========== 导航 ==========
        thDebt: "Dette",
thLastPayment: "Dernier paiement",
editDebt: "Modifier dette",
filterUnpaid: "💰 Impayée",
        pageTitle: "Administration",
        navOrders: "Commandes",
        navClients: "Clients",
        navRequests: "Demandes",
        navPromotions: "Promotions",
        navPoints: "Points",
        navAssign: "Assigner",
        logout: "Déconnexion",
        thDebt: "Dette",
        thLastPayment: "Dernier paiement",
        editDebt: "Modifier dette",
        // ========== 统计卡片 ==========
        pendingLabel: "En attente",
        confirmedLabel: "Confirmée",
        deliveredLabel: "Livrée",
        revenueLabel: "Chiffre d'affaires",
        totalClientsLabel: "Total clients",
        verifiedLabel: "KBIS vérifié",
        pendingVerifyLabel: "En attente",
        
        // ========== 筛选 ==========
        filterAll: "Toutes",
        filterPending: "📝 En attente",
        filterConfirmed: "✅ Confirmée",
        filterDelivered: "🚚 Livrée",
        filterCancelled: "❌ Annulée",
        exportBtn: "📎 Exporter CSV",
        
        // ========== 订单表头 ==========
        thOrderNumber: "N° commande",
        thClient: "Client",
        thTotal: "Total",
        thDate: "Date",
        thDelivery: "Livraison",
        thPayment: "Paiement",
        thStatus: "Statut",
        thActions: "Actions",
        
        // ========== 客户表头 ==========
        thCompany: "Entreprise",
        thEmail: "Email",
        thPhone: "Téléphone",
        thKbis: "KBIS",
        thKbisStatus: "Statut KBIS",
        thAccountStatus: "Statut",
        thPoints: "Points",
        thClientActions: "Actions",
        
        // ========== 客户状态 ==========
        activeLabel: "Actif",
        frozenLabel: "Gelé",
        
        // ========== 按钮文字 ==========
        view: "Voir",
        confirm: "Confirmer",
        deliver: "Livrer",
        cancel: "Annuler",
        markPaid: "Marquer payé",
        verify: "Vérifier",
        freeze: "Geler",
        unfreeze: "Dégeler",
        edit: "Modifier",
        delete: "Supprimer",
        assign: "Assigner",
        reassign: "Réassigner",
        approve: "Approuver",
        reject: "Rejeter",
        
        // ========== 订单详情 ==========
        orderDetails: "Détails de la commande",
        items: "Articles",
        deliveryDate: "Date de livraison",
        deliveryTime: "Créneau horaire",
        status: "Statut",
        transportStatus: "Transport",
        notes: "Notes",
        orderDate: "Date de commande",
        total: "Total",
        confirmOrder: "✅ Confirmer",
        deliverOrder: "🚚 Livrer",
        cancelOrder: "❌ Annuler",
        markPaidOrder: "💰 Marquer payé",
        
        // ========== 提示消息 ==========
        confirmSuccess: "Commande confirmée",
        deliverSuccess: "Commande livrée",
        cancelSuccess: "Commande annulée",
        paidSuccess: "Paiement enregistré, points ajoutés",
        verifySuccess: "KBIS vérifié",
        requestApproved: "Demande approuvée",
        requestRejected: "Demande rejetée",
        
        // ========== 促销类型 ==========
        promoTypeDiscount: "Remise %",
        promoTypeSpendReduce: "Réduction montant",
        promoTypePointsMultiplier: "Multiplicateur points",
        promoTypeFreeShipping: "Livraison gratuite",
        
        // ========== 促销规则 ==========
        discountRule: "{percent}%",
        spendReduceRule: "{tiers}",
        pointsMultiplierRule: "x{multiplier}",
        freeShippingRule: "Gratuit",
        
        // ========== 促销表头 ==========
        promoName: "Nom",
        promoType: "Type",
        promoCode: "Code promo",
        promoRule: "Règle",
        promoPeriod: "Période",
        promoStatus: "Statut",
        promoActions: "Actions",
        
        // ========== 促销其他 ==========
        applicableAll: "Tous",
        applicableNew: "Nouveaux",
        active: "Actif",
        inactive: "Inactif",
        needCoupon: "Code promo requis",
        couponCode: "Code promo",
        usageLimit: "Limite utilisation",
        perUserLimit: "Par client",
        usageCount: "{used}/{limit}",
        generateCoupon: "Générer",
        addPromotionBtn: "+ Ajouter",
        stackable: "Autoriser la superposition",
        
        // ========== 请求管理 ==========
        requestClient: "Client",
        requestField: "Champ",
        requestOldValue: "Ancienne valeur",
        requestNewValue: "Nouvelle valeur",
        requestDate: "Date",
        
        // ========== 积分配置 ==========
        pointsConfigTitle: "Configuration des points",
        exchangeRateLabel: "1 Euro = ? Points",
        redeemRateLabel: "? Points = 1 Euro",
        registerBonusLabel: "Points à l'inscription",
        maxRedeemLabel: "% maximum par commande",
        pointsConfigSaved: "Configuration sauvegardée",
        savePointsConfigBtn: "Enregistrer",
        
        // ========== 司机分配 ==========
        assignDriverTitle: "Assigner un chauffeur",
        driverLabel: "Chauffeur",
        unassignedOrders: "Commandes à assigner",
        assignedOrders: "Commandes assignées",
        assignSuccess: "Chauffeur assigné",
        reassignSuccess: "Chauffeur réassigné",
        noDrivers: "Aucun chauffeur disponible",
        
        // ========== 通用 ==========
        couponCopied: "Code copié",
        error: "Erreur",
        noPermission: "Accès non autorisé",
        loading: "Chargement...",
        noData: "Aucune donnée"
    },
    zh: {
        // ========== 导航 ==========
        pageTitle: "后台管理",
        navOrders: "订单管理",
        navClients: "客户管理",
        navRequests: "修改申请",
        navPromotions: "优惠活动",
        navPoints: "积分设置",
        navAssign: "分配司机",
        logout: "退出登录",
        thDebt: "欠款",
        thLastPayment: "上次付款",
        editDebt: "修改欠款",
        filterUnpaid: "💰 未支付",
                
        
        
        // ========== 统计卡片 ==========
        pendingLabel: "待确认",
        confirmedLabel: "已确认",
        deliveredLabel: "已配送",
        revenueLabel: "营业额",
        totalClientsLabel: "客户总数",
        verifiedLabel: "已认证",
        pendingVerifyLabel: "待审核",
        
        // ========== 筛选 ==========
        filterAll: "全部",
        filterPending: "📝 待确认",
        filterConfirmed: "✅ 已确认",
        filterDelivered: "🚚 已配送",
        filterCancelled: "❌ 已取消",
        exportBtn: "📎 导出CSV",
        
        // ========== 订单表头 ==========
        thOrderNumber: "订单号",
        thClient: "客户",
        thTotal: "金额",
        thDate: "日期",
        thDelivery: "配送",
        thPayment: "支付",
        thStatus: "状态",
        thActions: "操作",
        
        // ========== 客户表头 ==========
        thCompany: "公司名称",
        thEmail: "邮箱",
        thPhone: "电话",
        thKbis: "KBIS号",
        thKbisStatus: "认证状态",
        thAccountStatus: "账户状态",
        thPoints: "积分",
        thClientActions: "操作",
        
        // ========== 客户状态 ==========
        activeLabel: "启用",
        frozenLabel: "冻结",
        
        // ========== 按钮文字 ==========
        view: "查看",
        confirm: "确认",
        deliver: "发货",
        cancel: "取消",
        markPaid: "标记已支付",
        verify: "认证",
        freeze: "冻结",
        unfreeze: "解冻",
        edit: "编辑",
        delete: "删除",
        assign: "分配",
        reassign: "重新分配",
        approve: "通过",
        reject: "拒绝",
        
        // ========== 订单详情 ==========
        orderDetails: "订单详情",
        items: "商品清单",
        deliveryDate: "配送日期",
        deliveryTime: "配送时段",
        status: "订单状态",
        transportStatus: "配送状态",
        notes: "备注",
        orderDate: "下单日期",
        total: "合计",
        confirmOrder: "✅ 确认订单",
        deliverOrder: "🚚 标记发货",
        cancelOrder: "❌ 取消订单",
        markPaidOrder: "💰 标记已支付",
        
        // ========== 提示消息 ==========
        confirmSuccess: "订单已确认",
        deliverSuccess: "订单已发货",
        cancelSuccess: "订单已取消",
        paidSuccess: "已标记支付，积分已增加",
        verifySuccess: "KBIS已认证",
        requestApproved: "申请已通过",
        requestRejected: "申请已拒绝",
        
        // ========== 促销类型 ==========
        promoTypeDiscount: "折扣活动",
        promoTypeSpendReduce: "满减活动",
        promoTypePointsMultiplier: "积分倍率",
        promoTypeFreeShipping: "免运费",
        
        // ========== 促销规则 ==========
        discountRule: "{percent}%",
        spendReduceRule: "{tiers}",
        pointsMultiplierRule: "{multiplier}倍",
        freeShippingRule: "包邮",
        
        // ========== 促销表头 ==========
        promoName: "名称",
        promoType: "类型",
        promoCode: "优惠码",
        promoRule: "规则",
        promoPeriod: "有效期",
        promoStatus: "状态",
        promoActions: "操作",
        
        // ========== 促销其他 ==========
        applicableAll: "全部",
        applicableNew: "新客户",
        active: "启用",
        inactive: "禁用",
        needCoupon: "需要优惠码",
        couponCode: "优惠码",
        usageLimit: "使用次数限制",
        perUserLimit: "每人限用",
        usageCount: "已用{used}/{limit}",
        generateCoupon: "生成",
        addPromotionBtn: "+ 添加",
        stackable: "允许叠加",
        
        // ========== 请求管理 ==========
        requestClient: "客户",
        requestField: "字段",
        requestOldValue: "原值",
        requestNewValue: "新值",
        requestDate: "申请日期",
        
        // ========== 积分配置 ==========
        pointsConfigTitle: "积分配置",
        exchangeRateLabel: "1欧元 = ? 积分",
        redeemRateLabel: "? 积分 = 1欧元",
        registerBonusLabel: "注册送积分",
        maxRedeemLabel: "每单最多抵扣比例",
        pointsConfigSaved: "配置已保存",
        savePointsConfigBtn: "保存",
        
        // ========== 司机分配 ==========
        assignDriverTitle: "分配司机",
        driverLabel: "司机",
        unassignedOrders: "待分配订单",
        assignedOrders: "已分配订单",
        assignSuccess: "司机已分配",
        reassignSuccess: "司机已重新分配",
        noDrivers: "暂无可用司机",
        
        // ========== 通用 ==========
        couponCopied: "优惠码已复制",
        error: "错误",
        noPermission: "无访问权限",
        loading: "加载中...",
        noData: "暂无数据"
    }
};

// ========== 工具函数 ==========
function showToast(message, type = 'success') {
    const toast = document.getElementById('customToast');
    const icon = document.getElementById('toastIcon');
    const msg = document.getElementById('toastMessage');
    if (!toast) return;
    toast.classList.remove('success', 'error', 'warning');
    toast.classList.add(type);
    icon.textContent = type === 'success' ? '✅' : (type === 'error' ? '❌' : '⚠️');
    msg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function showConfirm(title, message, onConfirm) {
    const modal = document.getElementById('customConfirmModal');
    if (!modal) {
        if (confirm(title + '\n' + message)) onConfirm();
        return;
    }
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    modal.classList.add('active');
    const confirmBtn = document.getElementById('confirmOkBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    const handler = (confirmed) => {
        confirmBtn.removeEventListener('click', confirmHandler);
        cancelBtn.removeEventListener('click', cancelHandler);
        modal.classList.remove('active');
        if (confirmed && onConfirm) onConfirm();
    };
    const confirmHandler = () => handler(true);
    const cancelHandler = () => handler(false);
    confirmBtn.addEventListener('click', confirmHandler, { once: true });
    cancelBtn.addEventListener('click', cancelHandler, { once: true });
}

function formatPrice(price) {
    return parseFloat(price).toFixed(2);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'zh-CN');
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString(currentLang === 'fr' ? 'fr-FR' : 'zh-CN');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusClass(status) {
    switch(status) {
        case 'pending': return 'status-pending';
        case 'confirmed': return 'status-confirmed';
        case 'delivered': return 'status-delivered';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-pending';
    }
}

function getStatusLabel(status) {
    const labels = { pending: 'En attente', confirmed: 'Confirmée', delivered: 'Livrée', cancelled: 'Annulée' };
    if (currentLang === 'zh') {
        return { pending: '待确认', confirmed: '已确认', delivered: '已配送', cancelled: '已取消' }[status];
    }
    return labels[status];
}

function getPaymentLabel(status) {
    if (currentLang === 'fr') {
        return status === 'paid' ? 'Payé' : 'En attente';
    }
    return status === 'paid' ? '已支付' : '待支付';
}

function getPaymentClass(status) {
    return status === 'paid' ? 'payment-paid' : 'payment-unpaid';
}

function generateCouponCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let random = '';
    for (let i = 0; i < 6; i++) {
        random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `YIDA-${random}`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast(translations[currentLang].couponCopied, 'success');
}

async function loadOrders() {
    try {
        // 1. 获取所有客户订单
        const { data: customerOrders, error } = await window.supabase
            .from('customer_orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!customerOrders || customerOrders.length === 0) {
            orders = [];
            renderStats();
            renderOrdersTable();
            renderMobileOrders();
            return;
        }
        
        // 2. 获取所有有配送记录的订单（source_order_id 不为空）
        const orderIds = customerOrders.map(o => o.id);
        const { data: transportOrders } = await window.supabase
            .from('orders')
            .select('source_order_id, status, driver, delivered_at')
            .in('source_order_id', orderIds);
        
        // 3. 创建映射表
        const transportMap = new Map();
        if (transportOrders) {
            transportOrders.forEach(t => {
                transportMap.set(t.source_order_id, {
                    status: t.status,
                    driver: t.driver,
                    delivered_at: t.delivered_at
                });
            });
        }
        
        // 4. 合并数据：如果订单已确认且有配送记录，根据 orders 的状态决定显示什么
        orders = customerOrders.map(order => {
            let displayStatus = order.status;
            const transport = transportMap.get(order.id);
            
            // 如果订单已确认且有配送记录
            if (order.status === 'confirmed' && transport) {
                const orderStatus = transport.status;
                if (orderStatus === 'livre') {
                    displayStatus = 'delivered';
                } else if (orderStatus === 'cancelled') {
                    displayStatus = 'cancelled';
                } else {
                    // en_attente, prepare, en_cours 都显示为 confirmed
                    displayStatus = 'confirmed';
                }
            }
            
            return {
                ...order,
                display_status: displayStatus,
                transport_status: transport?.status || null,
                transport_driver: transport?.driver || null
            };
        });
        
        renderStats();
        renderOrdersTable();
        renderMobileOrders();
        await updatePendingBadge();
        await updateAssignNavBadge();
    } catch (err) {
        console.error(err);
        showToast(translations[currentLang].error, 'error');
    }
}
function renderStats() {
    const pending = orders.filter(o => o.display_status === 'pending').length;
    const confirmed = orders.filter(o => o.display_status === 'confirmed').length;
    const delivered = orders.filter(o => o.display_status === 'delivered').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('confirmedCount').textContent = confirmed;
    document.getElementById('deliveredCount').textContent = delivered;
    document.getElementById('totalRevenue').textContent = formatPrice(totalRevenue) + '€';
}
function getClientName(clientId) {
    const client = clients.find(c => c.id === clientId);
    return client ? client.company_name : 'Client inconnu';
}

function renderOrdersTable() {
    let filtered = orders;
    if (currentFilter !== 'all') {
        filtered = orders.filter(o => o.display_status === currentFilter);
    }
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">📭 Aucune commande</td><\/tr>';
        return;
    }
    const t = translations[currentLang];
    tbody.innerHTML = filtered.map(order => `
        <tr>
            <td><strong>${escapeHtml(order.order_number)}</strong></td>
            <td>${escapeHtml(getClientName(order.client_id))}</td>
            <td>${formatPrice(order.total_amount)} €</td>
            <td>${formatDate(order.created_at)}</td>
            <td>${formatDate(order.delivery_date)} ${order.delivery_time_slot}</td>
            <td><span class="payment-badge ${getPaymentClass(order.payment_status)}">${getPaymentLabel(order.payment_status)}</span></td>
            <td><span class="status-badge ${getStatusClass(order.display_status)}">${getStatusLabel(order.display_status)}</span></td>
            <td class="action-buttons">
                <button class="action-btn btn-view" onclick="showOrderDetail('${order.id}')">${t.view}</button>
                ${order.status === 'pending' ? `<button class="action-btn btn-confirm-sm" onclick="updateOrderStatus('${order.id}', 'confirmed')">${t.confirm}</button>` : ''}
                ${order.status === 'confirmed' ? `<button class="action-btn btn-deliver-sm" onclick="updateOrderStatus('${order.id}', 'delivered')">${t.deliver}</button>` : ''}
                ${order.status !== 'cancelled' && order.status !== 'delivered' ? `<button class="action-btn btn-cancel-sm" onclick="cancelOrder('${order.id}')">❌ ${t.cancel}</button>` : ''}
                ${order.payment_status !== 'paid' && order.status !== 'cancelled' ? `<button class="action-btn btn-paid-sm" onclick="markAsPaid('${order.id}')">💰 ${t.markPaid}</button>` : ''}
                ${order.status === 'confirmed' && !order.assigned_driver ? `<button class="action-btn btn-assign" onclick="showAssignModal('${order.id}')">🚚 ${t.assign}</button>` : ''}
            </td>
        </tr>
    `).join('');
}

function renderMobileOrders() {
    let filtered = orders;
    if (currentFilter !== 'all') {
        filtered = orders.filter(o => o.status === currentFilter);
    }
    const container = document.getElementById('mobileOrdersList');
    if (!container) return;
    if (filtered.length === 0) {
        container.innerHTML = '<div class="loading-cell">📭 Aucune commande</div>';
        return;
    }
    const t = translations[currentLang];
    container.innerHTML = filtered.map(order => `
        <div class="order-card">
            <div class="order-card-header">
                <span class="order-num">${escapeHtml(order.order_number)}</span>
                <span class="order-date">${formatDate(order.created_at)}</span>
                <div class="order-badges">
                 <span class="order-card-status ${getStatusClass(order.display_status)}">${getStatusLabel(order.display_status)}</span>
                    <span class="order-card-status ${getPaymentClass(order.payment_status)}">${getPaymentLabel(order.payment_status)}</span>
                </div>
            </div>
            <div class="order-card-content">
                <div class="order-card-client">${escapeHtml(getClientName(order.client_id))}</div>
                <div class="order-card-total">${formatPrice(order.total_amount)} €</div>
                <div class="order-card-date">📅 ${formatDate(order.delivery_date)} ${order.delivery_time_slot}</div>
            </div>
            <div class="order-card-actions">
                <button class="action-btn btn-view" onclick="showOrderDetail('${order.id}')">${t.view}</button>
                ${order.status === 'pending' ? `<button class="action-btn btn-confirm-sm" onclick="updateOrderStatus('${order.id}', 'confirmed')">${t.confirm}</button>` : ''}
                ${order.status === 'confirmed' ? `<button class="action-btn btn-deliver-sm" onclick="updateOrderStatus('${order.id}', 'delivered')">${t.deliver}</button>` : ''}
                ${order.status !== 'cancelled' && order.status !== 'delivered' ? `<button class="action-btn btn-cancel-sm" onclick="cancelOrder('${order.id}')">❌ ${t.cancel}</button>` : ''}
                <!-- 添加标记已支付按钮 -->
                ${order.payment_status !== 'paid' && order.status !== 'cancelled' ? `<button class="action-btn btn-paid-sm" onclick="markAsPaid('${order.id}')">💰 ${t.markPaid}</button>` : ''}
            </div>
        </div>
    `).join('');
}
async function showOrderDetail(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    currentOrderId = orderId;
    const t = translations[currentLang];
    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
        itemsHtml = order.items.map(item => {
            const name = currentLang === 'fr' ? item.name_fr : item.name_zh;
            return `<div class="detail-item"><span>${escapeHtml(name)} x ${item.quantity}</span><span>${formatPrice(item.price * item.quantity)} €</span></div>`;
        }).join('');
    }
    const hasDiscount = order.original_amount && order.original_amount > order.total_amount;
    document.getElementById('orderDetailContent').innerHTML = `
        <div class="detail-section">
            <h4>${t.items}</h4>
            <div class="detail-items">${itemsHtml || '<div>Aucun article</div>'}</div>
        </div>
        <div class="detail-section">
            <h4>${t.orderDetails}</h4>
            <div class="detail-info-row"><span class="detail-label">${t.orderNumber}</span><span>${escapeHtml(order.order_number)}</span></div>
            <div class="detail-info-row"><span class="detail-label">${t.orderDate}</span><span>${formatDateTime(order.created_at)}</span></div>
            <div class="detail-info-row"><span class="detail-label">${t.status}</span><span class="status-badge ${getStatusClass(order.display_status)}">${getStatusLabel(order.display_status)}</span></div>
            <div class="detail-info-row"><span class="detail-label">Paiement</span><span class="payment-badge ${getPaymentClass(order.payment_status)}">${getPaymentLabel(order.payment_status)}</span></div>
            ${hasDiscount ? `
                <div class="detail-info-row"><span class="detail-label">Sous-total</span><span>${formatPrice(order.original_amount)} €</span></div>
                <div class="detail-info-row"><span class="detail-label">Réduction</span><span style="color:#10b981;">-${formatPrice(order.original_amount - order.total_amount)} €</span></div>
            ` : ''}
            <div class="detail-info-row"><span class="detail-label">${t.total}</span><span style="font-weight:800;color:#e63946;">${formatPrice(order.total_amount)} €</span></div>
            <div class="detail-info-row"><span class="detail-label">${t.deliveryDate}</span><span>${formatDate(order.delivery_date)}</span></div>
            <div class="detail-info-row"><span class="detail-label">${t.deliveryTime}</span><span>${order.delivery_time_slot}</span></div>
            ${order.notes ? `<div class="detail-info-row"><span class="detail-label">${t.notes}</span><span>${escapeHtml(order.notes)}</span></div>` : ''}
        </div>
    `;
    document.getElementById('modalTitle').textContent = t.orderDetails;
    document.getElementById('orderDetailModal').classList.add('active');
}
// ========== 更新待分配订单角标（侧边栏） ==========
async function updateAssignNavBadge() {
    try {
        // 查询已确认但未分配司机的订单数量
        const { count, error } = await window.supabase
            .from('customer_orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'confirmed')
            .is('assigned_driver', null);
        
        if (error) throw error;
        
        const badge = document.getElementById('assignNavBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (err) {
        console.error('更新分配角标失败:', err);
    }
}
async function updateOrderStatus(orderId, newStatus) {
    const t = translations[currentLang];
    try {
        await window.supabase.from('customer_orders').update({ status: newStatus }).eq('id', orderId);
        
        // 更新角标
        await updatePendingBadge();      // 待确认角标减少
        if (newStatus === 'confirmed') {
            await updateAssignNavBadge(); // 待分配角标增加
        }
        
        await loadOrders();
        document.getElementById('orderDetailModal').classList.remove('active');
        showToast(newStatus === 'confirmed' ? t.confirmSuccess : t.deliverSuccess, 'success');
    } catch (err) {
        showToast(t.error, 'error');
    }
}
async function cancelOrder(orderId) {
    const t = translations[currentLang];
    showConfirm(t.cancel, t.cancelSuccess, async () => {
        try {
            await window.supabase.from('customer_orders').update({ status: 'cancelled', payment_status: 'unpaid' }).eq('id', orderId);
            
            // 更新角标
            await updatePendingBadge();      // 待确认角标（如果是pending状态取消）
            await updateAssignNavBadge();    // 待分配角标（如果是confirmed状态取消）
            
            await loadOrders();
            document.getElementById('orderDetailModal').classList.remove('active');
            showToast(t.cancelSuccess, 'success');
        } catch (err) {
            showToast(t.error, 'error');
        }
    });
}

async function markAsPaid(orderId) {
    const t = translations[currentLang];
    showConfirm(t.markPaid, 'Confirmer le paiement et ajouter les points ?', async () => {
        try {
            const { data: order } = await window.supabase.from('customer_orders').select('client_id, total_amount').eq('id', orderId).single();
            const { data: config } = await window.supabase.from('points_config').select('exchange_rate').limit(1);
            const exchangeRate = config?.[0]?.exchange_rate || 10;
            const pointsEarned = Math.floor(order.total_amount * exchangeRate);
            await window.supabase.from('customer_orders').update({ payment_status: 'paid', updated_at: new Date() }).eq('id', orderId);
            const { data: client } = await window.supabase.from('clients').select('points').eq('id', order.client_id).single();
            const newPoints = (client?.points || 0) + pointsEarned;
            await window.supabase.from('clients').update({ points: newPoints }).eq('id', order.client_id);
            await window.supabase.from('points_history').insert([{
                client_id: order.client_id, points: pointsEarned, type: 'earn', reason: 'order_paid', order_id: orderId
            }]);
            
            // ========== 更新客户欠款信息 ==========
            await updateClientsDebtAndPayment();
            
            await loadOrders();
            document.getElementById('orderDetailModal').classList.remove('active');
            showToast(`${t.paidSuccess} (+${pointsEarned} pts)`, 'success');
        } catch (err) {
            console.error(err);
            showToast(t.error, 'error');
        }
    });
}
function renderOrdersTable() {
    let filtered = orders;
    if (currentFilter !== 'all') {
        if (currentFilter === 'unpaid') {
            // 筛选未付款的订单：支付状态不是 paid，且不是已取消的订单
            filtered = orders.filter(o => o.payment_status !== 'paid' && o.status !== 'cancelled');
        } else {
            filtered = orders.filter(o => o.display_status === currentFilter);
        }
    }
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">📭 Aucune commande<\/td><\/tr>';
        return;
    }
    const t = translations[currentLang];
    tbody.innerHTML = filtered.map(order => `
        <tr>
            <td><strong>${escapeHtml(order.order_number)}</strong></td>
            <td>${escapeHtml(getClientName(order.client_id))}</td>
            <td>${formatPrice(order.total_amount)} €</td>
            <td>${formatDate(order.created_at)}</td>
            <td>${formatDate(order.delivery_date)} ${order.delivery_time_slot}</td>
            <td><span class="payment-badge ${getPaymentClass(order.payment_status)}">${getPaymentLabel(order.payment_status)}</span></td>
            <td><span class="status-badge ${getStatusClass(order.display_status)}">${getStatusLabel(order.display_status)}</span></td>
            <td class="action-buttons">
                <button class="action-btn btn-view" onclick="showOrderDetail('${order.id}')">${t.view}</button>
                ${order.status === 'pending' ? `<button class="action-btn btn-confirm-sm" onclick="updateOrderStatus('${order.id}', 'confirmed')">${t.confirm}</button>` : ''}
                ${order.status === 'confirmed' ? `<button class="action-btn btn-deliver-sm" onclick="updateOrderStatus('${order.id}', 'delivered')">${t.deliver}</button>` : ''}
                ${order.status !== 'cancelled' && order.status !== 'delivered' ? `<button class="action-btn btn-cancel-sm" onclick="cancelOrder('${order.id}')">❌ ${t.cancel}</button>` : ''}
                ${order.payment_status !== 'paid' && order.status !== 'cancelled' ? `<button class="action-btn btn-paid-sm" onclick="markAsPaid('${order.id}')">💰 ${t.markPaid}</button>` : ''}
                ${order.status === 'confirmed' && !order.assigned_driver ? `<button class="action-btn btn-assign" onclick="showAssignModal('${order.id}')">🚚 ${t.assign}</button>` : ''}
            </td>
        </tr>
    `).join('');
}
function renderMobileOrders() {
    let filtered = orders;
    if (currentFilter !== 'all') {
        if (currentFilter === 'unpaid') {
            // 筛选未付款的订单：支付状态不是 paid，且不是已取消的订单
            filtered = orders.filter(o => o.payment_status !== 'paid' && o.status !== 'cancelled');
        } else {
            filtered = orders.filter(o => o.status === currentFilter);
        }
    }
    const container = document.getElementById('mobileOrdersList');
    if (!container) return;
    if (filtered.length === 0) {
        container.innerHTML = '<div class="loading-cell">📭 Aucune commande</div>';
        return;
    }
    const t = translations[currentLang];
    container.innerHTML = filtered.map(order => `
        <div class="order-card">
            <div class="order-card-header">
                <span class="order-num">${escapeHtml(order.order_number)}</span>
                <span class="order-date">${formatDate(order.created_at)}</span>
                <div class="order-badges">
                 <span class="order-card-status ${getStatusClass(order.display_status)}">${getStatusLabel(order.display_status)}</span>
                    <span class="order-card-status ${getPaymentClass(order.payment_status)}">${getPaymentLabel(order.payment_status)}</span>
                </div>
            </div>
            <div class="order-card-content">
                <div class="order-card-client">${escapeHtml(getClientName(order.client_id))}</div>
                <div class="order-card-total">${formatPrice(order.total_amount)} €</div>
                <div class="order-card-date">📅 ${formatDate(order.delivery_date)} ${order.delivery_time_slot}</div>
            </div>
            <div class="order-card-actions">
                <button class="action-btn btn-view" onclick="showOrderDetail('${order.id}')">${t.view}</button>
                ${order.status === 'pending' ? `<button class="action-btn btn-confirm-sm" onclick="updateOrderStatus('${order.id}', 'confirmed')">${t.confirm}</button>` : ''}
                ${order.status === 'confirmed' ? `<button class="action-btn btn-deliver-sm" onclick="updateOrderStatus('${order.id}', 'delivered')">${t.deliver}</button>` : ''}
                ${order.status !== 'cancelled' && order.status !== 'delivered' ? `<button class="action-btn btn-cancel-sm" onclick="cancelOrder('${order.id}')">❌ ${t.cancel}</button>` : ''}
                ${order.payment_status !== 'paid' && order.status !== 'cancelled' ? `<button class="action-btn btn-paid-sm" onclick="markAsPaid('${order.id}')">💰 ${t.markPaid}</button>` : ''}
            </div>
        </div>
    `).join('');
}
// ========== 更新待确认订单角标 ==========
// ========== 更新待确认订单角标（增强版） ==========
async function updatePendingBadge() {
    try {
        const { count, error } = await window.supabase
            .from('customer_orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
        
        if (error) throw error;
        
        const badge = document.getElementById('pendingCountBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline-block';
                badge.style.backgroundColor = '#e63946';
                badge.style.color = 'white';
                badge.style.borderRadius = '30px';
                badge.style.padding = '2px 8px';
                badge.style.fontSize = '11px';
                badge.style.fontWeight = '600';
                badge.style.marginLeft = '5px';
            } else {
                badge.style.display = 'none';
            }
            console.log(`待确认角标更新: ${count}`);
        }
    } catch (err) {
        console.error('更新待确认角标失败:', err);
    }
}

// ========== 更新待分配订单角标（增强版） ==========
async function updateAssignNavBadge() {
    try {
        const { count, error } = await window.supabase
            .from('customer_orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'confirmed')
            .is('assigned_driver', null);
        
        if (error) throw error;
        
        const badge = document.getElementById('assignNavBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'inline-block';
                badge.style.backgroundColor = '#e63946';
                badge.style.color = 'white';
                badge.style.borderRadius = '30px';
                badge.style.padding = '2px 8px';
                badge.style.fontSize = '11px';
                badge.style.fontWeight = '600';
                badge.style.position = 'absolute';
                badge.style.right = '16px';
                badge.style.top = '50%';
                badge.style.transform = 'translateY(-50%)';
            } else {
                badge.style.display = 'none';
            }
            console.log(`待分配角标更新: ${count}`);
        }
    } catch (err) {
        console.error('更新分配角标失败:', err);
    }
}
function renderMobileRequests() {
    const container = document.getElementById('mobileRequestsList');
    if (!container) return;
    
    if (changeRequests.length === 0) {
        const noDataText = translations[currentLang].noData;
        container.innerHTML = `<div class="loading-cell">📭 ${noDataText}</div>`;
        return;
    }
    
    const t = translations[currentLang];
    const fieldNames = { 
        password: currentLang === 'fr' ? 'Mot de passe' : '密码',
        address: currentLang === 'fr' ? 'Adresse' : '地址',
        phone: currentLang === 'fr' ? 'Téléphone' : '电话',
        kbis_number: currentLang === 'fr' ? 'KBIS' : 'KBIS号'
    };
    container.innerHTML = changeRequests.map(req => `
        <div class="request-card">
            <div class="request-card-header">
                <span class="request-client">${escapeHtml(req.clients?.company_name || '-')}</span>
                <span class="request-date">${formatDate(req.created_at)}</span>
            </div>
            <div class="request-card-body">
                <div class="request-field">${fieldNames[req.field_name] || req.field_name}</div>
                <div class="request-values">
                    <span class="request-old">${escapeHtml(req.old_value || '-')}</span>
                    <span class="request-new">→ ${escapeHtml(req.new_value)}</span>
                </div>
            </div>
            <div class="request-card-actions">
                <button class="action-btn btn-approve" onclick="approveRequest('${req.id}', '${req.field_name}', '${req.client_id}', '${escapeHtml(req.new_value).replace(/'/g, "\\'")}')">✅ ${t.approve}</button>
                <button class="action-btn btn-reject" onclick="rejectRequest('${req.id}')">❌ ${t.reject}</button>
            </div>
        </div>
    `).join('');
}
// ========== 客户管理 ==========
async function loadClients() {
    try {
        const { data, error } = await window.supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        clients = data || [];
        renderClientsStats();
        renderClientsTable();
        renderMobileClients();
    } catch (err) {
        console.error(err);
    }
}

function renderClientsStats() {
    const total = clients.length;
    const verified = clients.filter(c => c.kbis_verified === true).length;
    const pending = clients.filter(c => !c.kbis_verified).length;
    document.getElementById('totalClients').textContent = total;
    document.getElementById('verifiedClients').textContent = verified;
    document.getElementById('pendingVerify').textContent = pending;
}

function renderClientsTable() {
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;
    if (clients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="loading-cell">${translations[currentLang].noData}</td></tr>`;
        return;
    }
    const t = translations[currentLang];
    tbody.innerHTML = clients.map(client => {
        // 格式化上次付款时间
        let lastPaymentDisplay = '-';
        if (client.last_payment_date) {
            const date = new Date(client.last_payment_date);
            lastPaymentDisplay = date.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'zh-CN');
        }
        
        // 欠款金额样式
        const debtAmount = client.debt_amount || 0;
        const debtClass = debtAmount > 0 ? 'debt-positive' : 'debt-zero';
        const debtDisplay = debtAmount > 0 ? `${formatPrice(debtAmount)} €` : '0 €';
        
        return `
        <tr>
            <td><strong>${escapeHtml(client.company_name)}</strong></td>
            <td>${escapeHtml(client.email)}</td>
            <td>${escapeHtml(client.phone || '-')}</td>
            <td>${escapeHtml(client.kbis_number || '-')}</td>
            <td>${client.kbis_verified ? '<span class="kbis-badge kbis-verified">✅ ' + t.verifiedLabel + '</span>' : '<span class="kbis-badge kbis-pending">⏳ ' + t.pendingVerifyLabel + '</span>'}</td>
            <td>${client.is_active !== false ? '<span class="status-badge status-active">🟢 ' + t.activeLabel + '</span>' : '<span class="status-badge status-frozen">🔴 ' + t.frozenLabel + '</span>'}</td>
            <td>${client.points || 0}</td>
            <td class="${debtClass}">${debtDisplay}</td>
            <td>${lastPaymentDisplay}</td>
            <td class="action-buttons">
                ${!client.kbis_verified ? `<button class="action-btn btn-verify" onclick="verifyKbis('${client.id}')">${t.verify}</button>` : ''}
                ${client.is_active !== false ? 
                    `<button class="action-btn btn-freeze" onclick="toggleClientStatus('${client.id}', false)">🔒 ${t.freeze}</button>` : 
                    `<button class="action-btn btn-unfreeze" onclick="toggleClientStatus('${client.id}', true)">🔓 ${t.unfreeze}</button>`}
                <button class="action-btn btn-edit-debt" onclick="editClientDebt('${client.id}', ${debtAmount})">💰 ${t.editDebt || 'Modifier dette'}</button>
            </td>
        </tr>
        `;
    }).join('');
}
async function verifyKbis(clientId) {
    const t = translations[currentLang];
    try {
        await window.supabase.from('clients').update({ kbis_verified: true }).eq('id', clientId);
        await loadClients();
        showToast(t.verifySuccess, 'success');
    } catch (err) {
        showToast(t.error, 'error');
    }
}

async function toggleClientStatus(clientId, isActive) {
    const actionText = isActive ? (currentLang === 'fr' ? 'dégeler' : '解冻') : (currentLang === 'fr' ? 'geler' : '冻结');
    showConfirm('Confirmation', `Êtes-vous sûr de vouloir ${actionText} ce client ?`, async () => {
        const t = translations[currentLang];
        try {
            await window.supabase.from('clients').update({ is_active: isActive }).eq('id', clientId);
            await loadClients();
            showToast(isActive ? (currentLang === 'fr' ? 'Client dégelé' : '客户已解冻') : (currentLang === 'fr' ? 'Client gelé' : '客户已冻结'), 'success');
        } catch (err) {
            showToast(t.error, 'error');
        }
    });
}

// ========== 修改请求管理 ==========
async function loadChangeRequests() {
    try {
        const { data, error } = await window.supabase
            .from('client_change_requests')
            .select('*, clients!inner(company_name)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (error) throw error;
        changeRequests = data || [];
        renderRequestsTable();
        renderMobileRequests();
    } catch (err) {
        console.error(err);
    }
}

function renderRequestsTable() {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;
    if (changeRequests.length === 0) {
        const noDataText = translations[currentLang].noData;
        tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">📭 ${noDataText}<\/td><\/tr>`;
        return;
    }
    const t = translations[currentLang];
    const fieldNames = { 
        password: currentLang === 'fr' ? 'Mot de passe' : '密码',
        address: currentLang === 'fr' ? 'Adresse' : '地址',
        phone: currentLang === 'fr' ? 'Téléphone' : '电话',
        kbis_number: currentLang === 'fr' ? 'KBIS' : 'KBIS号'
    };
    tbody.innerHTML = changeRequests.map(req => `
        <tr>
            <td>${escapeHtml(req.clients?.company_name || '-')}</td>
            <td>${fieldNames[req.field_name] || req.field_name}</td>
            <td>${escapeHtml(req.old_value || '-')}</td>
            <td>${escapeHtml(req.new_value)}</td>
            <td>${formatDate(req.created_at)}</td>
            <td class="action-buttons">
                <button class="action-btn btn-approve" onclick="approveRequest('${req.id}', '${req.field_name}', '${req.client_id}', '${escapeHtml(req.new_value).replace(/'/g, "\\'")}')">✅ ${t.approve}</button>
                <button class="action-btn btn-reject" onclick="rejectRequest('${req.id}')">❌ ${t.reject}</button>
            </td>
        </tr>
    `).join('');
}

async function approveRequest(requestId, fieldName, clientId, newValue) {
    const t = translations[currentLang];
    try {
        await window.supabase.from('clients').update({ [fieldName]: newValue }).eq('id', clientId);
        await window.supabase.from('client_change_requests').update({ status: 'approved', processed_at: new Date() }).eq('id', requestId);
        await loadChangeRequests();
        await loadClients();
        showToast(t.requestApproved, 'success');
    } catch (err) {
        showToast(t.error, 'error');
    }
}

async function rejectRequest(requestId) {
    const t = translations[currentLang];
    try {
        await window.supabase.from('client_change_requests').update({ status: 'rejected', processed_at: new Date() }).eq('id', requestId);
        await loadChangeRequests();
        showToast(t.requestRejected, 'success');
    } catch (err) {
        showToast(t.error, 'error');
    }
}

// ========== 活动管理 ==========
async function loadPromotions() {
    try {
        const { data, error } = await window.supabase.from('promotions').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        promotions = data || [];
        renderPromotionsTable();
    } catch (err) {
        console.error(err);
        showToast(translations[currentLang].error, 'error');
    }
}

function renderPromotionsTable() {
    const tbody = document.getElementById('promotionsTableBody');
    const mobileContainer = document.getElementById('mobilePromotionsList');
    
    if (!tbody) return;
    
    if (promotions.length === 0) {
        const noDataText = translations[currentLang].noData;
        tbody.innerHTML = `<tr><td colspan="7" class="loading-cell">📭 ${noDataText}<\/td><\/tr>`;
        if (mobileContainer) mobileContainer.innerHTML = '<div class="loading-cell">📭 Aucune promotion</div>';
        return;
    }
    
    const t = translations[currentLang];
    
    // 获取促销类型显示文本的函数
    function getPromoTypeLabel(type) {
        const typeMap = {
            'discount': t.promoTypeDiscount,
            'spend_reduce': t.promoTypeSpendReduce,
            'points_multiplier': t.promoTypePointsMultiplier,
            'free_shipping': t.promoTypeFreeShipping,
            'buy_n_get_m': currentLang === 'fr' ? '🎁 Achetez N, obtenez M gratuit' : '🎁 买N送M'
        };
        return typeMap[type] || type;
    }
    
    // 获取规则显示文本的函数
    function getRuleHtml(promo) {
        if (promo.type === 'discount') {
            return `${promo.discount_percent}%`;
        } 
        else if (promo.type === 'spend_reduce') {
            const tiers = promo.spend_reduce_tiers;
            if (tiers) {
                const parsed = typeof tiers === 'string' ? JSON.parse(tiers) : tiers;
                return parsed.map(tier => `${tier.min}€→-${tier.reduce}€`).join(', ');
            }
            return '-';
        } 
        else if (promo.type === 'points_multiplier') {
            return `x${promo.points_multiplier}`;
        } 
        else if (promo.type === 'free_shipping') {
            return currentLang === 'fr' ? 'Gratuit' : '免运费';
        } 
        else if (promo.type === 'buy_n_get_m') {
            const buyN = promo.buy_n || 3;
            const getM = promo.get_m || 1;
            return currentLang === 'fr' 
                ? `Achetez ${buyN} = ${getM} gratuit` 
                : `买${buyN}送${getM}`;
        }
        return '-';
    }
    
    // 桌面端表格
    tbody.innerHTML = promotions.map(promo => {
        const ruleHtml = getRuleHtml(promo);
        const isActive = promo.is_active && new Date(promo.start_date) <= new Date() && new Date(promo.end_date) >= new Date();
        const name = currentLang === 'fr' ? promo.name : (promo.name_zh || promo.name);
        
        return `
            <tr>
                <td><strong>${escapeHtml(name)}</strong></td>
                <td>${getPromoTypeLabel(promo.type)}</td>
                <td>${promo.need_coupon ? `<span style="font-family:monospace;cursor:pointer;" onclick="copyToClipboard('${promo.coupon_code}')">📋 ${escapeHtml(promo.coupon_code || '-')}</span>` : '-'}</td>
                <td>${ruleHtml}</td>
                <td><small>${formatDate(promo.start_date)}<br>→ ${formatDate(promo.end_date)}</small></td>
                <td><span class="status-badge ${isActive ? 'promo-active' : 'promo-inactive'}">${isActive ? t.active : t.inactive}</span></td>
                <td class="action-buttons">
                    <button class="action-btn btn-edit" onclick="editPromotion('${promo.id}')">✏️ ${t.edit}</button>
                    <button class="action-btn btn-delete" onclick="deletePromotion('${promo.id}')">🗑️ ${t.delete}</button>
                </td>
            </tr>
        `;
    }).join('');
    
    // 手机端卡片
    if (mobileContainer) {
        mobileContainer.innerHTML = promotions.map(promo => {
            const ruleHtml = getRuleHtml(promo);
            const isActive = promo.is_active && new Date(promo.start_date) <= new Date() && new Date(promo.end_date) >= new Date();
            const name = currentLang === 'fr' ? promo.name : (promo.name_zh || promo.name);
            
            return `
                <div class="promo-card">
                    <div class="promo-card-header">
                        <span class="promo-name">${escapeHtml(name)}</span>
                        <span class="promo-status ${isActive ? 'promo-active' : 'promo-inactive'}">${isActive ? t.active : t.inactive}</span>
                    </div>
                    <div class="promo-card-body">
                        <div class="promo-type">${getPromoTypeLabel(promo.type)}</div>
                        <div class="promo-rule">${ruleHtml}</div>
                        ${promo.need_coupon ? `<div class="promo-code" onclick="copyToClipboard('${promo.coupon_code}')">📋 ${escapeHtml(promo.coupon_code)}</div>` : ''}
                        <div class="promo-date">${formatDate(promo.start_date)} → ${formatDate(promo.end_date)}</div>
                    </div>
                    <div class="promo-card-actions">
                        <button class="action-btn btn-edit" onclick="editPromotion('${promo.id}')">✏️ ${t.edit}</button>
                        <button class="action-btn btn-delete" onclick="deletePromotion('${promo.id}')">🗑️ ${t.delete}</button>
                    </div>
                </div>
            `;
        }).join('');
    }
}
function renderMobileClients() {
    const container = document.getElementById('mobileClientsList');
    if (!container) return;
    
    if (clients.length === 0) {
        container.innerHTML = '<div class="loading-cell">📭 Aucun client</div>';
        return;
    }
    
    const t = translations[currentLang];
    container.innerHTML = clients.map(client => {
        const debtAmount = client.debt_amount || 0;
        let lastPaymentDisplay = '-';
        if (client.last_payment_date) {
            const date = new Date(client.last_payment_date);
            lastPaymentDisplay = date.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'zh-CN');
        }
        
        return `
        <div class="client-card">
            <div class="client-card-header">
                <span class="client-name">${escapeHtml(client.company_name)}</span>
                <span class="client-status ${client.is_active !== false ? 'status-active' : 'status-frozen'}">${client.is_active !== false ? '🟢 Actif' : '🔴 Gelé'}</span>
            </div>
            <div class="client-card-body">
                <div class="client-email">📧 ${escapeHtml(client.email)}</div>
                <div class="client-phone">📞 ${escapeHtml(client.phone || '-')}</div>
                <div class="client-kbis">📄 ${escapeHtml(client.kbis_number || '-')}</div>
                <div class="client-kbis-status">${client.kbis_verified ? '<span class="kbis-badge kbis-verified">✅ Vérifié</span>' : '<span class="kbis-badge kbis-pending">⏳ En attente</span>'}</div>
                <div class="client-points">⭐ ${client.points || 0} points</div>
                <div class="client-debt ${debtAmount > 0 ? 'debt-positive' : ''}">💰 Dette: ${formatPrice(debtAmount)} €</div>
                <div class="client-last-payment">📅 Dernier paiement: ${lastPaymentDisplay}</div>
            </div>
            <div class="client-card-actions">
                ${!client.kbis_verified ? `<button class="action-btn btn-verify" onclick="verifyKbis('${client.id}')">${t.verify}</button>` : ''}
                ${client.is_active !== false ? 
                    `<button class="action-btn btn-freeze" onclick="toggleClientStatus('${client.id}', false)">🔒 ${t.freeze}</button>` : 
                    `<button class="action-btn btn-unfreeze" onclick="toggleClientStatus('${client.id}', true)">🔓 ${t.unfreeze}</button>`}
                <button class="action-btn btn-edit-debt" onclick="editClientDebt('${client.id}', ${debtAmount})">💰 ${t.editDebt || 'Modifier dette'}</button>
            </div>
        </div>
    `;
    }).join('');
}

async function editPromotion(promoId) {
    const promo = promotions.find(p => p.id === promoId);
    if (!promo) return;
    
    document.getElementById('promotionModalTitle').textContent = 'Modifier';
    document.getElementById('promotionId').value = promo.id;
    document.getElementById('promoNameFr').value = promo.name || '';
    document.getElementById('promoNameZh').value = promo.name_zh || '';
    document.getElementById('promoType').value = promo.type;
    
    // 根据类型填充字段
    if (promo.type === 'discount') {
        document.getElementById('discountPercent').value = promo.discount_percent || '';
    } else if (promo.type === 'spend_reduce') {
        if (promo.spend_reduce_tiers) {
            const tiers = typeof promo.spend_reduce_tiers === 'string' ? JSON.parse(promo.spend_reduce_tiers) : promo.spend_reduce_tiers;
            document.getElementById('spendReduceTiers').value = JSON.stringify(tiers);
        }
    } else if (promo.type === 'points_multiplier') {
        document.getElementById('pointsMultiplier').value = promo.points_multiplier || 2;
    } else if (promo.type === 'buy_n_get_m') {
        document.getElementById('buyN').value = promo.buy_n || 3;
        document.getElementById('getM').value = promo.get_m || 1;
    }
    
    // 优惠码相关
    document.getElementById('needCoupon').checked = promo.need_coupon || false;
    document.getElementById('couponCode').value = promo.coupon_code || '';
    document.getElementById('usageLimit').value = promo.usage_limit || 0;
    document.getElementById('perUserLimit').value = promo.per_user_limit || 1;
    document.getElementById('couponFields').style.display = promo.need_coupon ? 'block' : 'none';
    document.getElementById('stackable').checked = promo.stackable || false;
    document.getElementById('promoActive').checked = promo.is_active !== false;
    
    // 日期
    const startDate = promo.start_date ? new Date(promo.start_date) : new Date();
    const endDate = promo.end_date ? new Date(promo.end_date) : new Date();
    document.getElementById('startDate').value = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('endDate').value = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    
    // 先触发类型切换，显示正确的界面
    onPromoTypeChange();
    
    // 等待DOM更新后，再填充适用范围
    setTimeout(() => {
        if (promo.type === 'buy_n_get_m') {
            // 买N送M：选中已保存的商品
            if (promo.applicable_products && Array.isArray(promo.applicable_products)) {
                const productSelect = document.getElementById('applicableProducts');
                if (productSelect) {
                    for (let i = 0; i < productSelect.options.length; i++) {
                        const option = productSelect.options[i];
                        if (promo.applicable_products.includes(option.value)) {
                            option.selected = true;
                        }
                    }
                }
            }
        } else {
            // 其他类型：选中已保存的分类（使用正确的ID categoriesGroup）
            if (promo.applicable_categories && Array.isArray(promo.applicable_categories)) {
                // 先全部取消选中
                document.querySelectorAll('#categoriesGroup input[type="checkbox"]').forEach(cb => {
                    cb.checked = false;
                });
                // 选中已保存的分类
                promo.applicable_categories.forEach(cat => {
                    const cb = document.querySelector(`#categoriesGroup input[value="${cat}"]`);
                    if (cb) cb.checked = true;
                });
                // 如果没有选择任何分类，默认选"全部"
                if (promo.applicable_categories.length === 0) {
                    const allCb = document.querySelector('#categoriesGroup input[value="all"]');
                    if (allCb) allCb.checked = true;
                }
            } else {
                // 如果没有保存的分类，默认选"全部"
                const allCb = document.querySelector('#categoriesGroup input[value="all"]');
                if (allCb) allCb.checked = true;
            }
        }
    }, 100);
    
    // 适用用户
    const isNewUsersOnly = promo.applicable_users && promo.applicable_users.includes('new');
    const userRadio = document.querySelector(`input[name="applicableUsers"][value="${isNewUsersOnly ? 'new' : 'all'}"]`);
    if (userRadio) userRadio.checked = true;
    
    document.getElementById('promotionModal').classList.add('active');
}

function onPromoTypeChange() {
    const type = document.getElementById('promoType').value;
    
    // 显示/隐藏各类型特定字段
    document.getElementById('discountFields').style.display = type === 'discount' ? 'block' : 'none';
    document.getElementById('spendReduceFields').style.display = type === 'spend_reduce' ? 'block' : 'none';
    document.getElementById('pointsMultiplierFields').style.display = type === 'points_multiplier' ? 'block' : 'none';
    document.getElementById('freeShippingFields').style.display = type === 'free_shipping' ? 'block' : 'none';
    document.getElementById('buyNGetMFields').style.display = type === 'buy_n_get_m' ? 'block' : 'none';
    
    // 切换适用范围显示
    toggleApplicableFields();
}
// 加载商品列表用于促销选择
async function loadProductsForPromotion() {
    try {
        const { data, error } = await window.supabase
            .from('products')
            .select('id, name_fr, name_zh')
            .order('name_fr', { ascending: true });
        
        if (error) throw error;
        
        const select = document.getElementById('applicableProducts');
        if (select && data) {
            const isFrench = currentLang === 'fr';
            select.innerHTML = data.map(product => {
                const name = isFrench ? product.name_fr : product.name_zh;
                return `<option value="${product.id}">${escapeHtml(name || product.id)}</option>`;
            }).join('');
            
            if (data.length === 0) {
                select.innerHTML = '<option value="">Aucun produit disponible</option>';
            }
        }
    } catch (err) {
        console.error('加载商品失败:', err);
    }
}
async function savePromotion(e) {
    e.preventDefault();
    
    const id = document.getElementById('promotionId').value;
    const name = document.getElementById('promoNameFr').value.trim();
    const nameZh = document.getElementById('promoNameZh').value.trim();
    const type = document.getElementById('promoType').value;
    const needCoupon = document.getElementById('needCoupon').checked;
    let couponCode = null;
    if (needCoupon) {
        couponCode = document.getElementById('couponCode').value.trim();
        if (!couponCode) {
            couponCode = generateCouponCode();
        }
    }
    
    const usageLimit = parseInt(document.getElementById('usageLimit').value) || 0;
    const perUserLimit = parseInt(document.getElementById('perUserLimit').value) || 1;
    const stackable = document.getElementById('stackable').checked;
    const isActive = document.getElementById('promoActive').checked;
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    
    // 根据促销类型获取适用范围
    let applicableCategories = [];
    let applicableProducts = null;
    
    if (type === 'buy_n_get_m') {
        // 买N送M：选择具体商品
        const productSelect = document.getElementById('applicableProducts');
        applicableProducts = [];
        if (productSelect) {
            for (let i = 0; i < productSelect.options.length; i++) {
                if (productSelect.options[i].selected && productSelect.options[i].value) {
                    applicableProducts.push(productSelect.options[i].value);
                }
            }
        }
        if (applicableProducts.length === 0) {
            showToast(currentLang === 'fr' ? 'Veuillez sélectionner au moins un produit' : '请至少选择一个商品', 'warning');
            return;
        }
        applicableCategories = [];
    } else {
        // 其他类型：选择分类（使用正确的ID categoriesGroup）
        document.querySelectorAll('#categoriesGroup input[type="checkbox"]:checked').forEach(cb => {
            if (cb.value !== 'all') {
                applicableCategories.push(cb.value);
            }
        });
        applicableProducts = null;
    }
    
    // 获取适用用户
    const applicableUsers = document.querySelector('input[name="applicableUsers"]:checked')?.value === 'new' ? ['new'] : ['all'];
    
    // 构建数据对象
    const promoData = {
        name: name,
        name_zh: nameZh,
        type: type,
        need_coupon: needCoupon,
        coupon_code: couponCode,
        usage_limit: usageLimit,
        per_user_limit: perUserLimit,
        stackable: stackable,
        is_active: isActive,
        start_date: startDate,
        end_date: endDate,
        applicable_categories: applicableCategories,
        applicable_users: applicableUsers,
        applicable_products: applicableProducts
    };
    
    // 根据类型添加字段
    if (type === 'discount') {
        const discountPercent = parseInt(document.getElementById('discountPercent').value);
        if (isNaN(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
            showToast(currentLang === 'fr' ? 'Veuillez entrer un pourcentage valide (1-100)' : '请输入有效百分比 (1-100)', 'warning');
            return;
        }
        promoData.discount_percent = discountPercent;
    } 
    else if (type === 'spend_reduce') {
        const tiersStr = document.getElementById('spendReduceTiers').value;
        if (!tiersStr || !tiersStr.trim()) {
            showToast(currentLang === 'fr' ? 'Veuillez entrer les niveaux de réduction' : '请输入满减档次', 'warning');
            return;
        }
        try {
            const tiers = JSON.parse(tiersStr);
            if (!Array.isArray(tiers) || tiers.length === 0) throw new Error();
            promoData.spend_reduce_tiers = tiersStr;
        } catch(e) {
            showToast(currentLang === 'fr' ? 'Format JSON invalide. Exemple: [{"min":100,"reduce":10}]' : 'JSON格式无效，例如: [{"min":100,"reduce":10}]', 'error');
            return;
        }
    } 
    else if (type === 'points_multiplier') {
        const pointsMultiplier = parseInt(document.getElementById('pointsMultiplier').value);
        if (isNaN(pointsMultiplier) || pointsMultiplier < 1) {
            showToast(currentLang === 'fr' ? 'Multiplicateur doit être ≥ 1' : '倍数必须 ≥ 1', 'warning');
            return;
        }
        promoData.points_multiplier = pointsMultiplier;
    }
    else if (type === 'free_shipping') {
        promoData.free_shipping = true;
    }
    else if (type === 'buy_n_get_m') {
        const buyN = parseInt(document.getElementById('buyN').value);
        const getM = parseInt(document.getElementById('getM').value);
        
        if (isNaN(buyN) || buyN < 2) {
            showToast(currentLang === 'fr' ? 'Veuillez entrer une quantité valide (≥ 2)' : '请输入有效数量 (≥ 2)', 'warning');
            return;
        }
        if (isNaN(getM) || getM < 1) {
            showToast(currentLang === 'fr' ? 'Veuillez entrer une quantité offerte valide (≥ 1)' : '请输入赠送数量 (≥ 1)', 'warning');
            return;
        }
        
        promoData.buy_n = buyN;
        promoData.get_m = getM;
    }
    
    // 验证日期
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        showToast(currentLang === 'fr' ? 'Dates invalides' : '日期无效', 'warning');
        return;
    }
    
    if (startDate >= endDate) {
        showToast(currentLang === 'fr' ? 'La date de fin doit être après la date de début' : '结束日期必须晚于开始日期', 'warning');
        return;
    }
    
    console.log('发送数据:', promoData);
    
    try {
        let result;
        if (id) {
            result = await window.supabase
                .from('promotions')
                .update(promoData)
                .eq('id', id);
        } else {
            result = await window.supabase
                .from('promotions')
                .insert([promoData]);
        }
        
        if (result.error) throw result.error;
        
        await loadPromotions();
        document.getElementById('promotionModal').classList.remove('active');
        showToast(currentLang === 'fr' ? '✅ Promotion sauvegardée' : '✅ 促销已保存', 'success');
        
        if (!id) {
            document.getElementById('promotionForm').reset();
            document.getElementById('couponFields').style.display = 'none';
        }
        
    } catch (err) {
        console.error('Erreur:', err);
        showToast(currentLang === 'fr' ? 'Erreur: ' + (err.message || err) : '错误: ' + (err.message || err), 'error');
    }
}
async function deletePromotion(promoId) {
    showConfirm('Confirmation', 'Supprimer cette promotion ?', async () => {
        try {
            await window.supabase.from('promotions').delete().eq('id', promoId);
            await loadPromotions();
            showToast('Promotion supprimée', 'success');
        } catch (err) {
            showToast('Erreur', 'error');
        }
    });
}
// 商品搜索过滤
function filterProductsList() {
    const searchTerm = document.getElementById('productSearchInput').value.toLowerCase();
    const productSelect = document.getElementById('applicableProducts');
    
    if (!productSelect) return;
    
    for (let i = 0; i < productSelect.options.length; i++) {
        const option = productSelect.options[i];
        const text = option.text.toLowerCase();
        if (searchTerm === '' || text.includes(searchTerm)) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    }
}

// 全选/取消全选商品
function toggleAllProducts(selectAll) {
    const productSelect = document.getElementById('applicableProducts');
    if (!productSelect) return;
    
    for (let i = 0; i < productSelect.options.length; i++) {
        productSelect.options[i].selected = selectAll;
    }
}

// 根据促销类型切换适用范围显示
// 根据促销类型切换适用范围显示
function toggleApplicableFields() {
    const type = document.getElementById('promoType').value;
    const productsGroup = document.getElementById('productsGroup');
    const categoriesGroup = document.getElementById('categoriesGroup');
    
    if (type === 'buy_n_get_m') {
        // 买N送M：显示商品选择，隐藏分类选择
        if (productsGroup) productsGroup.style.display = 'block';
        if (categoriesGroup) categoriesGroup.style.display = 'none';
    } else {
        // 其他类型：显示分类选择，隐藏商品选择
        if (productsGroup) productsGroup.style.display = 'none';
        if (categoriesGroup) categoriesGroup.style.display = 'block';
        // 清空商品选择
        const productSelect = document.getElementById('applicableProducts');
        if (productSelect) {
            for (let i = 0; i < productSelect.options.length; i++) {
                productSelect.options[i].selected = false;
            }
        }
        // 清空搜索框
        const searchInput = document.getElementById('productSearchInput');
        if (searchInput) searchInput.value = '';
    }
}
// ========== 积分配置 ==========
async function loadPointsConfig() {
    try {
        const { data, error } = await window.supabase.from('points_config').select('*').limit(1);
        if (error) throw error;
        pointsConfig = data?.[0] || null;
        if (pointsConfig) {
            document.getElementById('exchangeRate').value = pointsConfig.exchange_rate || 10;
            document.getElementById('redeemRate').value = pointsConfig.redeem_rate ? 1 / pointsConfig.redeem_rate : 100;
            document.getElementById('registerBonus').value = pointsConfig.register_bonus || 100;
            document.getElementById('maxRedeemPercent').value = pointsConfig.max_redeem_percent || 30;
        }
    } catch (err) {
        console.error(err);
    }
}

async function savePointsConfig() {
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value);
    const redeemRateValue = parseFloat(document.getElementById('redeemRate').value);
    const redeemRate = 1 / redeemRateValue;
    const registerBonus = parseInt(document.getElementById('registerBonus').value);
    const maxRedeemPercent = parseInt(document.getElementById('maxRedeemPercent').value);
    const t = translations[currentLang];
    try {
        if (pointsConfig?.id) {
            await window.supabase.from('points_config').update({
                exchange_rate: exchangeRate,
                redeem_rate: redeemRate,
                register_bonus: registerBonus,
                max_redeem_percent: maxRedeemPercent,
                updated_at: new Date()
            }).eq('id', pointsConfig.id);
        } else {
            await window.supabase.from('points_config').insert([{
                exchange_rate: exchangeRate,
                redeem_rate: redeemRate,
                register_bonus: registerBonus,
                max_redeem_percent: maxRedeemPercent
            }]);
        }
        showToast(t.pointsConfigSaved, 'success');
        await loadPointsConfig();
    } catch (err) {
        showToast(t.error, 'error');
    }
}

// ========== 分配司机 ==========
async function loadDrivers() {
    try {
        const { data, error } = await window.supabase.from('users').select('id, username').eq('user_type', 'chauffeur') .eq('active', true);
        if (error) throw error;
        drivers = data || [];
        const select = document.getElementById('driverSelect');
        if (select) {
            const t = translations[currentLang];
            select.innerHTML = `<option value="">${t.noDrivers}</option>` + drivers.map(d => `<option value="${d.username}">${escapeHtml(d.username)}</option>`).join('');
        }
    } catch (err) {
        console.error(err);
        drivers = [];
    }
}

async function loadUnassignedOrders() {
    try {
        const { data, error } = await window.supabase
            .from('customer_orders')
            .select('*, clients!inner(company_name, address, phone)')
            .eq('status', 'confirmed')
            .is('assigned_driver', null);
        if (error) throw error;
        renderUnassignedOrders(data || []);
    } catch (err) {
        console.error(err);
    }
}

function renderUnassignedOrders(ordersList) {
    const container = document.getElementById('unassignedOrdersList');
    if (!container) return;
    if (ordersList.length === 0) {
        container.innerHTML = '<div class="loading-cell">📭 Aucune commande à assigner</div>';
        return;
    }
    const t = translations[currentLang];
    container.innerHTML = ordersList.map(order => `
        <div class="assign-card">
            <div class="assign-card-info">
                <div class="assign-card-order">${escapeHtml(order.order_number)}</div>
                <div class="assign-card-customer">${escapeHtml(order.clients?.company_name || '-')}</div>
                <div class="assign-card-customer">📞 ${escapeHtml(order.clients?.phone || '-')}</div>
                <div class="assign-card-date">📅 ${formatDate(order.delivery_date)} ${order.delivery_time_slot}</div>
            </div>
            <button class="action-btn btn-assign" onclick="showAssignModal('${order.id}')">🚚 ${t.assign}</button>
        </div>
    `).join('');
}

async function loadAssignedOrders() {
    try {
        const { data, error } = await window.supabase
            .from('customer_orders')
            .select('*, clients!inner(company_name)')
            .not('assigned_driver', 'is', null)
            .order('assigned_at', { ascending: false });
        if (error) throw error;
        renderAssignedOrders(data || []);
    } catch (err) {
        console.error(err);
    }
}

function renderAssignedOrders(ordersList) {
    const container = document.getElementById('assignedOrdersList');
    if (!container) return;
    if (ordersList.length === 0) {
        container.innerHTML = '<div class="loading-cell">📭 Aucune commande assignée</div>';
        return;
    }
    const t = translations[currentLang];
    container.innerHTML = ordersList.map(order => `
        <div class="assign-card">
            <div class="assign-card-info">
                <div class="assign-card-order">${escapeHtml(order.order_number)}</div>
                <div class="assign-card-customer">${escapeHtml(order.clients?.company_name || '-')}</div>
                <div class="assign-card-customer">🚚 Chauffeur: ${escapeHtml(order.assigned_driver)}</div>
                <div class="assign-card-date">📅 ${formatDate(order.delivery_date)} ${order.delivery_time_slot}</div>
            </div>
            <button class="action-btn btn-assign" onclick="showAssignModal('${order.id}', true)">🔄 ${t.reassign}</button>
        </div>
    `).join('');
}

function showAssignModal(orderId, isReassign = false) {
    currentOrderId = orderId;
    loadDrivers();
    document.getElementById('assignDriverModal').classList.add('active');
}

async function confirmAssign() {
    const driver = document.getElementById('driverSelect').value;
    if (!driver) {
        showToast('Veuillez sélectionner un chauffeur', 'warning');
        return;
    }
    const t = translations[currentLang];
    try {
        const { data: order } = await window.supabase
            .from('customer_orders')
            .select('*, clients!inner(*)')
            .eq('id', currentOrderId)
            .single();
        if (!order) throw new Error('Order not found');
        
        // ========== 让管理员确认/修改配送时间 ==========
        // 获取客户订单中的配送信息
        const defaultDate = order.delivery_date || new Date().toISOString().split('T')[0];
        const defaultTimeSlot = order.delivery_time_slot || 'flexible';
        
        // 创建确认弹窗
        const timeSlot = await showTimeSlotConfirm(defaultDate, defaultTimeSlot);
        if (!timeSlot) return; // 用户取消了
        
        // 更新 customer_orders 表（如果管理员修改了）
        await window.supabase
            .from('customer_orders')
            .update({ 
                assigned_driver: driver, 
                assigned_at: new Date(),
                delivery_date: timeSlot.date,
                delivery_time_slot: timeSlot.timeSlot
            })
            .eq('id', currentOrderId);
        
        // 检查是否已有配送记录
        const existingTransport = await window.supabase
            .from('orders')
            .select('id')
            .eq('source_order_id', currentOrderId)
            .maybeSingle();
        
        // ========== 将时间转换为 time_req 格式 ==========
        let timeReq = null;
        if (timeSlot.timeSlot && timeSlot.timeSlot !== 'flexible') {
            const [start, end] = timeSlot.timeSlot.split('-');
            timeReq = {
                type: 'range',
                value: {
                    start: start.trim(),
                    end: end.trim()
                }
            };
        }
        // 如果 flexible，timeReq 保持 null，司机端会显示 "Libre"
        
        const orderData = {
            customer_name: order.clients.company_name,
            phone: order.clients.phone,
            destination: order.clients.address,
            driver: driver,
            date: timeSlot.date,
            time_req: timeReq,
            status: 'en_attente',
            created_by: currentUser.username,
            order_source: 'customer_orders',
            source_order_id: currentOrderId,
            customer_id: order.client_id
        };
        
        if (existingTransport.data) {
            await window.supabase
                .from('orders')
                .update(orderData)
                .eq('source_order_id', currentOrderId);
        } else {
            await window.supabase
                .from('orders')
                .insert([orderData]);
        }
        
        document.getElementById('assignDriverModal').classList.remove('active');
        showToast(order.assigned_driver ? t.reassignSuccess : t.assignSuccess, 'success');
        await loadUnassignedOrders();
        await loadAssignedOrders();
        await loadOrders();
        // 分配成功后刷新角标
        await updateAssignNavBadge();
    } catch (err) {
        console.error(err);
        showToast(t.error, 'error');
    }
}
// ========== 新增：时间确认弹窗函数 ==========
// ========== 新增：时间确认弹窗函数 ==========
function showTimeSlotConfirm(defaultDate, defaultTimeSlot) {
    return new Promise((resolve) => {
        const t = translations[currentLang];
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10003;
            backdrop-filter: blur(4px);
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 24px; width: 380px; max-width: 85%; padding: 24px 20px;">
                <div style="font-size: 32px; margin-bottom: 12px; text-align: center;">📅</div>
                <h3 style="text-align: center; margin-bottom: 20px;">${t.confirmDelivery || 'Confirmer la livraison'}</h3>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: 600;">${t.deliveryDate || 'Date de livraison'}</label>
                    <input type="date" id="confirmDeliveryDate" class="form-input" value="${defaultDate}" style="width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0;">
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: 600;">${t.deliveryTime || 'Créneau horaire'}</label>
                    <select id="confirmDeliveryTimeSlot" class="form-input" style="width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <option value="flexible" ${defaultTimeSlot === 'flexible' ? 'selected' : ''}>🕒 Flexible</option>
                        <option value="09:00-10:00" ${defaultTimeSlot === '09:00-10:00' ? 'selected' : ''}>09:00 - 10:00</option>
                        <option value="10:00-11:00" ${defaultTimeSlot === '10:00-11:00' ? 'selected' : ''}>10:00 - 11:00</option>
                        <option value="11:00-12:00" ${defaultTimeSlot === '11:00-12:00' ? 'selected' : ''}>11:00 - 12:00</option>
                        <option value="12:00-13:00" ${defaultTimeSlot === '12:00-13:00' ? 'selected' : ''}>12:00 - 13:00</option>
                        <option value="13:00-14:00" ${defaultTimeSlot === '13:00-14:00' ? 'selected' : ''}>13:00 - 14:00</option>
                        <option value="14:00-15:00" ${defaultTimeSlot === '14:00-15:00' ? 'selected' : ''}>14:00 - 15:00</option>
                        <option value="15:00-16:00" ${defaultTimeSlot === '15:00-16:00' ? 'selected' : ''}>15:00 - 16:00</option>
                        <option value="16:00-17:00" ${defaultTimeSlot === '16:00-17:00' ? 'selected' : ''}>16:00 - 17:00</option>
                        <option value="17:00-18:00" ${defaultTimeSlot === '17:00-18:00' ? 'selected' : ''}>17:00 - 18:00</option>
                        <option value="18:00-19:00" ${defaultTimeSlot === '18:00-19:00' ? 'selected' : ''}>18:00 - 19:00</option>
                        <option value="19:00-20:00" ${defaultTimeSlot === '19:00-20:00' ? 'selected' : ''}>19:00 - 20:00</option>
                    </select>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button id="cancelTimeBtn" style="flex:1; background: #e2e8f0; color: #475569; border: none; padding: 12px; border-radius: 40px; font-weight: 600; cursor: pointer;">${t.cancel || 'Annuler'}</button>
                    <button id="confirmTimeBtn" style="flex:1; background: #e63946; color: white; border: none; padding: 12px; border-radius: 40px; font-weight: 600; cursor: pointer;">✅ ${t.confirm || 'Confirmer'}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('confirmTimeBtn').onclick = () => {
            const date = document.getElementById('confirmDeliveryDate').value;
            const timeSlot = document.getElementById('confirmDeliveryTimeSlot').value;
            document.body.removeChild(modal);
            resolve({ date, timeSlot });
        };
        
        document.getElementById('cancelTimeBtn').onclick = () => {
            document.body.removeChild(modal);
            resolve(null);
        };
    });
}
// ========== 自动更新客户欠款和上次付款时间 ==========
async function updateClientsDebtAndPayment() {
    try {
        // 1. 获取所有客户
        const { data: allClients, error: clientsError } = await window.supabase
            .from('clients')
            .select('id, company_name');
        
        if (clientsError) throw clientsError;
        
        let updatedCount = 0;
        
        for (const client of allClients) {
            // 2. 获取该客户所有已确认但未支付的订单总额（欠款）
            const { data: unpaidOrders, error: unpaidError } = await window.supabase
                .from('customer_orders')
                .select('total_amount')
                .eq('client_id', client.id)
                .eq('status', 'confirmed')
                .eq('payment_status', 'unpaid');
            
            if (unpaidError) continue;
            
            // 计算欠款总额
            let debtAmount = 0;
            if (unpaidOrders && unpaidOrders.length > 0) {
                debtAmount = unpaidOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
            }
            
            // 3. 获取该客户最近一次支付时间
            const { data: paidOrders, error: paidError } = await window.supabase
                .from('customer_orders')
                .select('updated_at')
                .eq('client_id', client.id)
                .eq('payment_status', 'paid')
                .order('updated_at', { ascending: false })
                .limit(1);
            
            let lastPaymentDate = null;
            if (paidOrders && paidOrders.length > 0 && paidOrders[0].updated_at) {
                lastPaymentDate = paidOrders[0].updated_at;
            }
            
            // 4. 更新客户表
            const updateData = { debt_amount: debtAmount };
            if (lastPaymentDate) {
                updateData.last_payment_date = lastPaymentDate;
            }
            
            const { error: updateError } = await window.supabase
                .from('clients')
                .update(updateData)
                .eq('id', client.id);
            
            if (!updateError && (debtAmount > 0 || lastPaymentDate)) {
                updatedCount++;
            }
        }
        
        console.log(`✅ 已更新 ${updatedCount} 个客户的欠款信息`);
        
        // 刷新客户列表显示
        await loadClients();
        
    } catch (err) {
        console.error('更新客户欠款失败:', err);
    }
}
function exportCSV() {
    let filtered = orders;
    if (currentFilter !== 'all') filtered = orders.filter(o => o.status === currentFilter);
    const headers = ['Order Number', 'Client', 'Total', 'Date', 'Delivery Date', 'Status'];
    const rows = filtered.map(o => [
        o.order_number,
        getClientName(o.client_id),
        o.total_amount,
        formatDate(o.created_at),
        `${formatDate(o.delivery_date)} ${o.delivery_time_slot}`,
        getStatusLabel(o.status)
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Exporté', 'success');
}
function showAddPromotionModal() {
    document.getElementById('promotionModalTitle').textContent = translations[currentLang].navPromotions;
    document.getElementById('promotionId').value = '';
    document.getElementById('promotionForm').reset();
    document.getElementById('needCoupon').checked = false;
    document.getElementById('couponFields').style.display = 'none';
    document.getElementById('discountFields').style.display = 'block';
    document.getElementById('spendReduceFields').style.display = 'none';
    document.getElementById('pointsMultiplierFields').style.display = 'none';
    document.getElementById('freeShippingFields').style.display = 'none';
    document.getElementById('buyNGetMFields').style.display = 'none';
    document.getElementById('promoActive').checked = true;
    
    // 清空商品选择
    const productSelect = document.getElementById('applicableProducts');
    if (productSelect) {
        for (let i = 0; i < productSelect.options.length; i++) {
            productSelect.options[i].selected = false;
        }
    }
    
    // 重置分类复选框（默认全选，表示不限制分类）
    const categoryCheckboxes = document.querySelectorAll('#promotionsPanel .checkbox-group input[type="checkbox"]');
    categoryCheckboxes.forEach(cb => {
        cb.checked = cb.value === 'all';
    });
    
    // 重置适用用户（默认全部）
    const allUserRadio = document.querySelector('input[name="applicableUsers"][value="all"]');
    if (allUserRadio) allUserRadio.checked = true;
    
    // 设置默认日期
    const now = new Date();
    const startDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('startDate').value = startDate;
    document.getElementById('endDate').value = endDate;
    
    // 确保适用范围显示正确（买N送M显示商品选择，其他显示分类选择）
    const type = document.getElementById('promoType').value;
    const categoriesGroup = document.getElementById('categoriesGroup');
    const productsGroup = document.getElementById('productsGroup');
    
    if (type === 'buy_n_get_m') {
        if (categoriesGroup) categoriesGroup.style.display = 'none';
        if (productsGroup) productsGroup.style.display = 'block';
    } else {
        if (categoriesGroup) categoriesGroup.style.display = 'block';
        if (productsGroup) productsGroup.style.display = 'none';
    }
    
    // 加载商品列表
    loadProductsForPromotion();
    
    document.getElementById('promotionModal').classList.add('active');
}
function updateUILanguage() {
    const t = translations[currentLang];
    
    // 安全设置文本内容的辅助函数
    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }
    
    function setHtml(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }
    
    // ==================== 导航栏 ====================
    setText('pageTitle', t.pageTitle);
    setText('navOrdersText', t.navOrders);
    setText('navClientsText', t.navClients);
    setText('navRequestsText', t.navRequests);
    setText('navPromotionsText', t.navPromotions);
    setText('navPointsText', t.navPoints);
    setText('navAssignText', t.navAssign);
    setText('logoutText', t.logout);
    
    // ==================== 统计卡片 ====================
    setText('pendingLabel', t.pendingLabel);
    setText('confirmedLabel', t.confirmedLabel);
    setText('deliveredLabel', t.deliveredLabel);
    setText('revenueLabel', t.revenueLabel);
    setText('totalClientsLabel', t.totalClientsLabel);
    setText('verifiedLabel', t.verifiedLabel);
    setText('pendingVerifyLabel', t.pendingVerifyLabel);
    
    // ==================== 筛选栏 ====================
    setText('filterAll', t.filterAll);
    setText('filterPending', t.filterPending);
    setText('filterConfirmed', t.filterConfirmed);
    setText('filterDelivered', t.filterDelivered);
    setText('filterCancelled', t.filterCancelled);
    setText('filterUnpaid', t.filterUnpaid);  // 新增未付款筛选按钮翻译
    setText('exportBtn', t.exportBtn);

    // ==================== 客户表头 ====================
    setText('thDebt', t.thDebt);
    setText('thLastPayment', t.thLastPayment);
        
    // ==================== 订单表头 ====================
    setText('thOrderNumber', t.thOrderNumber);
    setText('thClient', t.thClient);
    setText('thTotal', t.thTotal);
    setText('thDate', t.thDate);
    setText('thDelivery', t.thDelivery);
    setText('thPayment', t.thPayment);
    setText('thStatus', t.thStatus);
    setText('thActions', t.thActions);
    
    // ==================== 客户表头 ====================
    setText('thCompany', t.thCompany);
    setText('thEmail', t.thEmail);
    setText('thPhone', t.thPhone);
    setText('thKbis', t.thKbis);
    setText('thKbisStatus', t.thKbisStatus);
    setText('thAccountStatus', t.thAccountStatus);
    setText('thPoints', t.thPoints);
    setText('thClientActions', t.thClientActions);
    
    // ==================== 请求表头 ====================
    const reqHeaders = document.querySelectorAll('#requestsTable thead th');
    if (reqHeaders.length >= 6) {
        reqHeaders[0].textContent = t.requestClient;
        reqHeaders[1].textContent = t.requestField;
        reqHeaders[2].textContent = t.requestOldValue;
        reqHeaders[3].textContent = t.requestNewValue;
        reqHeaders[4].textContent = t.requestDate;
        reqHeaders[5].textContent = t.thActions;
    }
    setText('requestsPanelTitle', `📝 ${t.navRequests}`);
    
    // ==================== 促销表头 ====================
    const promoHeaders = document.querySelectorAll('#promotionsTable thead th');
    if (promoHeaders.length >= 7) {
        promoHeaders[0].textContent = t.promoName;
        promoHeaders[1].textContent = t.promoType;
        promoHeaders[2].textContent = t.promoCode;
        promoHeaders[3].textContent = t.promoRule;
        promoHeaders[4].textContent = t.promoPeriod;
        promoHeaders[5].textContent = t.promoStatus;
        promoHeaders[6].textContent = t.promoActions;
    }
    setText('promotionsPanelTitle', `🎁 ${t.navPromotions}`);
    const addPromoBtn = document.getElementById('addPromotionBtn');
    if (addPromoBtn) addPromoBtn.innerHTML = `+ ${t.addPromotionBtn}`;
    
    // ==================== 促销类型下拉菜单 ====================
    const promoTypeSelect = document.getElementById('promoType');
    if (promoTypeSelect) {
        const options = promoTypeSelect.options;
        if (options.length >= 5) {
            options[0].text = currentLang === 'fr' ? '📉 Remise en pourcentage (%)' : '📉 百分比折扣 (%)';
            options[1].text = currentLang === 'fr' ? '💰 Réduction sur montant (multi-niveaux)' : '💰 满减折扣 (多档)';
            options[2].text = currentLang === 'fr' ? '⭐ Multiplicateur de points' : '⭐ 积分倍数';
            options[3].text = currentLang === 'fr' ? '🚚 Livraison gratuite' : '🚚 免运费';
            options[4].text = currentLang === 'fr' ? '🎁 Achetez N, obtenez M gratuit' : '🎁 买N送M';
        }
    }
    
    // ==================== 促销模态框所有标签 ====================
    setText('promotionModalTitle', t.addPromotionBtn);
    setText('promoNameFrLabel', currentLang === 'fr' ? 'Nom (Français) *' : '法语名称 *');
    setText('promoNameZhLabel', currentLang === 'fr' ? '名称 (中文) *' : '中文名称 *');
    setText('promoTypeLabel', currentLang === 'fr' ? 'Type *' : '类型 *');
    setText('discountPercentLabel', currentLang === 'fr' ? 'Pourcentage de remise (%)' : '折扣百分比 (%)');
    setText('spendReduceTiersLabel', currentLang === 'fr' ? 'Niveaux de réduction (JSON)' : '满减档次 (JSON)');
    setText('pointsMultiplierLabel', currentLang === 'fr' ? 'Multiplicateur de points' : '积分倍数');
    setText('needCouponLabel', t.needCoupon);
    setText('couponCodeLabel', t.couponCode);
    setText('usageLimitLabel', t.usageLimit);
    setText('perUserLimitLabel', t.perUserLimit);
    setText('categoriesLabel', currentLang === 'fr' ? 'Catégories concernées' : '适用分类');
    setText('applicableUsersLabel', currentLang === 'fr' ? 'Clients concernés' : '适用客户');
    setText('applicableProductsLabel', currentLang === 'fr' ? '📦 Produits concernés' : '📦 适用商品');
    setText('stackableLabel', t.stackable);
    setText('startDateLabel', currentLang === 'fr' ? 'Date de début *' : '开始日期 *');
    setText('endDateLabel', currentLang === 'fr' ? 'Date de fin *' : '结束日期 *');
    setText('activeLabel', t.active);
    setText('savePromotionBtn', `💾 ${t.savePointsConfigBtn}`);
    
    const generateCouponBtn = document.getElementById('generateCouponBtn');
    if (generateCouponBtn) generateCouponBtn.textContent = t.generateCoupon;
    
    // 适用分类的复选框文字
    const categoryLabels = document.querySelectorAll('#categoriesGroup label');
    if (categoryLabels.length >= 7) {
        categoryLabels[0].innerHTML = currentLang === 'fr' ? '<input type="checkbox" value="dry" class="category-checkbox"> 🥨 Sec' : '<input type="checkbox" value="dry" class="category-checkbox"> 🥨 干货';
        categoryLabels[1].innerHTML = currentLang === 'fr' ? '<input type="checkbox" value="frozen" class="category-checkbox"> ❄️ Surgelé' : '<input type="checkbox" value="frozen" class="category-checkbox"> ❄️ 速冻';
        categoryLabels[2].innerHTML = currentLang === 'fr' ? '<input type="checkbox" value="fresh" class="category-checkbox"> 🥬 Frais' : '<input type="checkbox" value="fresh" class="category-checkbox"> 🥬 生鲜';
        categoryLabels[3].innerHTML = currentLang === 'fr' ? '<input type="checkbox" value="nonfood" class="category-checkbox"> 🧴 Non-alimentaire' : '<input type="checkbox" value="nonfood" class="category-checkbox"> 🧴 非食品';
        categoryLabels[4].innerHTML = currentLang === 'fr' ? '<input type="checkbox" value="drinks" class="category-checkbox"> 🍷 Boissons' : '<input type="checkbox" value="drinks" class="category-checkbox"> 🍷 酒水';
        categoryLabels[5].innerHTML = currentLang === 'fr' ? '<input type="checkbox" value="bangkok" class="category-checkbox"> 🏭 Bangkok Factory' : '<input type="checkbox" value="bangkok" class="category-checkbox"> 🏭 曼谷工厂特供';
        categoryLabels[6].innerHTML = currentLang === 'fr' ? '<input type="checkbox" value="all" id="allCategories" class="category-checkbox"> Tous' : '<input type="checkbox" value="all" id="allCategories" class="category-checkbox"> 全部';
    }
    
    // 适用用户的单选按钮文字
    const userRadioLabels = document.querySelectorAll('#applicableUsersGroup label');
    if (userRadioLabels.length >= 2) {
        userRadioLabels[0].innerHTML = currentLang === 'fr' ? '<input type="radio" name="applicableUsers" value="all" checked> Tous les clients' : '<input type="radio" name="applicableUsers" value="all" checked> 全部客户';
        userRadioLabels[1].innerHTML = currentLang === 'fr' ? '<input type="radio" name="applicableUsers" value="new"> Nouveaux clients uniquement' : '<input type="radio" name="applicableUsers" value="new"> 仅新客户';
    }
    
    // ==================== 积分配置 ====================
    const pointsTitle = document.querySelector('#pointsPanel .config-card h3');
    if (pointsTitle) pointsTitle.textContent = `⭐ ${t.pointsConfigTitle}`;
    setText('exchangeRateLabel', t.exchangeRateLabel);
    setText('redeemRateLabel', t.redeemRateLabel);
    setText('registerBonusLabel', t.registerBonusLabel);
    setText('maxRedeemLabel', t.maxRedeemLabel);
    const savePointsBtn = document.getElementById('savePointsConfigBtn');
    if (savePointsBtn) savePointsBtn.innerHTML = `💾 ${t.savePointsConfigBtn}`;
    
    // ==================== 分配司机 ====================
    const assignTitle = document.querySelector('#assignPanel .panel-header h2');
    if (assignTitle) assignTitle.textContent = `🚚 ${t.assignDriverTitle}`;
    const sectionTitles = document.querySelectorAll('#assignPanel .section-title');
    if (sectionTitles.length >= 2) {
        sectionTitles[0].innerHTML = `📋 ${t.unassignedOrders}`;
        sectionTitles[1].innerHTML = `✅ ${t.assignedOrders}`;
    }
    setText('driverLabel', t.driverLabel);
    setText('assignDriverModalTitle', `🚚 ${t.assignDriverTitle}`);
    const confirmAssignBtn = document.getElementById('confirmAssignBtn');
    if (confirmAssignBtn) confirmAssignBtn.innerHTML = `✅ ${t.assign}`;
    
    // ==================== 订单详情模态框 ====================
    setText('modalTitle', t.orderDetails);
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    if (confirmOrderBtn) confirmOrderBtn.innerHTML = `✅ ${t.confirm}`;
    const deliverOrderBtn = document.getElementById('deliverOrderBtn');
    if (deliverOrderBtn) deliverOrderBtn.innerHTML = `🚚 ${t.deliver}`;
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    if (cancelOrderBtn) cancelOrderBtn.innerHTML = `❌ ${t.cancel}`;
    const markPaidBtn = document.getElementById('markPaidBtn');
    if (markPaidBtn) markPaidBtn.innerHTML = `💰 ${t.markPaid}`;
    
    // ==================== 分配司机模态框 ====================
    setText('assignDriverModalTitle', `🚚 ${t.assignDriverTitle}`);
    setText('driverSelectLabel', t.driverLabel);
    
    // ==================== 自定义确认框 ====================
    const confirmTitle = document.getElementById('confirmTitle');
    if (confirmTitle) confirmTitle.textContent = currentLang === 'fr' ? 'Confirmation' : '确认';
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    if (confirmCancelBtn) confirmCancelBtn.textContent = currentLang === 'fr' ? 'Annuler' : '取消';
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    if (confirmOkBtn) confirmOkBtn.textContent = currentLang === 'fr' ? 'Confirmer' : '确定';
    
    // ==================== 配送时段下拉菜单 ====================
    const timeSlotSelect = document.getElementById('deliveryTimeSlot');
    if (timeSlotSelect) {
        const slots = timeSlotSelect.options;
        if (slots.length >= 2) {
            slots[0].text = currentLang === 'fr' ? '09:00 - 12:00' : '09:00 - 12:00';
            slots[1].text = currentLang === 'fr' ? '14:00 - 17:00' : '14:00 - 17:00';
        }
    }
    
    // ==================== 刷新表格数据 ====================
    renderOrdersTable();
    renderMobileOrders();
    renderClientsTable();
    renderPromotionsTable();
    renderRequestsTable();
}
// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let session = null;
    if (urlParams.has('session')) {
        try { session = JSON.parse(decodeURIComponent(urlParams.get('session'))); } catch(e) {}
    }
    if (!session) session = window.loadSession();
    if (!session) { window.location.href = '../index.html'; return; }
    // ========== 权限检查（管理员/经理/秘书/普通员工均可访问） ==========
 // ========== 权限检查（管理员/经理/秘书/普通员工均可访问） ==========
    const allowedAdminTypes = ['admin', 'manager', 'secretaire', 'employe'];
    if (!allowedAdminTypes.includes(session.userType)) {
        document.body.innerHTML = '<div style="text-align:center;padding:80px;"><h2>⛔ Accès non autorisé</h2><p>Seuls les administrateurs, managers, secrétaires et employés peuvent accéder à cette page.</p><a href="../../index.html">Retour</a></div>';
        return;
    }
    currentUser = session;
    document.getElementById('userName').textContent = session.username;
    
    const roleLabels = { 
    admin: currentLang === 'fr' ? 'Administrateur' : '管理员', 
    manager: currentLang === 'fr' ? 'Manager' : '经理',
    secretaire: currentLang === 'fr' ? 'Secrétaire générale' : '秘书长',
    employe: currentLang === 'fr' ? 'Employé' : '普通员工'
};
    document.getElementById('userRole').textContent = roleLabels[session.userType] || session.userType;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            updateUILanguage();
        });
    });
    document.querySelector('.lang-btn[data-lang="fr"]').classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = item.dataset.tab;
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
            const activePanel = document.getElementById(`${tabName}Panel`);
            if (activePanel) activePanel.classList.add('active');
            if (window.innerWidth <= 900) {
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('menuOverlay').classList.remove('active');
                document.getElementById('menuToggle').classList.remove('active');
            }
            if (tabName === 'clients') loadClients();
            if (tabName === 'requests') loadChangeRequests();
            if (tabName === 'promotions') loadPromotions();
            if (tabName === 'points') loadPointsConfig();
            if (tabName === 'assign') { loadUnassignedOrders(); loadAssignedOrders(); loadDrivers(); }
        });
    });

    document.getElementById('logoutBtn').addEventListener('click', () => { window.clearSession(); window.location.href = '../index.html'; });
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.status;
            renderOrdersTable();
            renderMobileOrders();
        });
    });
    document.getElementById('exportBtn').addEventListener('click', exportCSV);
    document.getElementById('closeModalBtn').addEventListener('click', () => document.getElementById('orderDetailModal').classList.remove('active'));
    document.getElementById('confirmOrderBtn').addEventListener('click', () => updateOrderStatus(currentOrderId, 'confirmed'));
    document.getElementById('deliverOrderBtn').addEventListener('click', () => updateOrderStatus(currentOrderId, 'delivered'));
    document.getElementById('cancelOrderBtn').addEventListener('click', () => cancelOrder(currentOrderId));
    document.getElementById('markPaidBtn').addEventListener('click', () => markAsPaid(currentOrderId));
    document.getElementById('addPromotionBtn').addEventListener('click', showAddPromotionModal);
    document.getElementById('closePromotionModalBtn').addEventListener('click', () => document.getElementById('promotionModal').classList.remove('active'));
    document.getElementById('promotionForm').addEventListener('submit', savePromotion);
    document.getElementById('promoType').addEventListener('change', onPromoTypeChange);
    document.getElementById('needCoupon').addEventListener('change', (e) => {
        document.getElementById('couponFields').style.display = e.target.checked ? 'block' : 'none';
        if (e.target.checked && !document.getElementById('couponCode').value) {
            document.getElementById('couponCode').value = generateCouponCode();
        }
    });
    document.getElementById('generateCouponBtn').addEventListener('click', () => {
        document.getElementById('couponCode').value = generateCouponCode();
    });
    document.getElementById('savePointsConfigBtn').addEventListener('click', savePointsConfig);
    document.getElementById('closeAssignModalBtn').addEventListener('click', () => document.getElementById('assignDriverModal').classList.remove('active'));
    document.getElementById('confirmAssignBtn').addEventListener('click', confirmAssign);

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('menuOverlay');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
    const sidebarClose = document.getElementById('sidebarClose');
    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    }

    await loadOrders();
    await updateAssignNavBadge();
    await updatePendingBadge();
    await loadClients();
    // 加载客户后，自动更新欠款信息
    await updateClientsDebtAndPayment();
    await loadPromotions();
    // 在 DOMContentLoaded 中，loadPromotions 之后添加
    await loadProductsForPromotion();
    await loadPointsConfig();
    updateUILanguage();
});
// 编辑客户欠款
window.editClientDebt = async function(clientId, currentDebt) {
    const newDebt = prompt(currentLang === 'fr' ? 'Modifier le montant de la dette (€) :' : '修改欠款金额 (€)：', currentDebt);
    if (newDebt === null) return;
    
    const debtAmount = parseFloat(newDebt);
    if (isNaN(debtAmount)) {
        showToast(currentLang === 'fr' ? 'Montant invalide' : '金额无效', 'error');
        return;
    }
    
    try {
        await window.supabase
            .from('clients')
            .update({ debt_amount: debtAmount })
            .eq('id', clientId);
        
        showToast(currentLang === 'fr' ? 'Dette mise à jour' : '欠款已更新', 'success');
        await loadClients();
    } catch (err) {
        showToast(currentLang === 'fr' ? 'Erreur' : '错误', 'error');
    }
};
// 全局函数
window.showOrderDetail = showOrderDetail;
window.updateOrderStatus = updateOrderStatus;
window.cancelOrder = cancelOrder;
window.markAsPaid = markAsPaid;
window.verifyKbis = verifyKbis;
window.toggleClientStatus = toggleClientStatus;
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;
window.editPromotion = editPromotion;
window.deletePromotion = deletePromotion;
window.showAssignModal = showAssignModal;
window.confirmAssign = confirmAssign;
window.copyToClipboard = copyToClipboard;