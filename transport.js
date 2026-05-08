
        (function() {
            const SUPABASE_URL = 'https://maxjuexqflwsnucqvkdf.supabase.co';
            const SUPABASE_KEY = 'sb_publishable_Skv1pqDmPG40gYFIDuQoGA_EUhMzXwV';
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

            // ==================== Session 管理 ====================
            function getSessionFromUrl() {
                const params = new URLSearchParams(window.location.search);
                const sessionData = params.get('session');
                if (sessionData) {
                    try {
                        return JSON.parse(decodeURIComponent(sessionData));
                    } catch (e) {
                        console.error('Erreur parsing session:', e);
                    }
                }
                return null;
            }

            function loadSession() {
                const data = localStorage.getItem('session') || sessionStorage.getItem('session');
                return data ? JSON.parse(data) : null;
            }

            const urlSession = getSessionFromUrl();
            const storageSession = loadSession();
            const session = urlSession || storageSession;

            if (!session) {
                window.location.href = 'index.html';
                return;
            }

            const currentUser = session.username;
            const currentUserType = session.userType;

            const typeLabels = {
                'admin': 'Admin',
                'manager': 'Manager',
                'secretaire': 'Secrétaire générale',
                'preparateur': 'Préparateur',
                'chauffeur': 'Chauffeur',
                'responsable': 'Responsable'
            };
            document.getElementById('currentUserDisplay').innerText = `👤 ${currentUser}`;
            document.getElementById('userTypeDisplay').innerText = `(${typeLabels[currentUserType] || currentUserType})`;

            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('app').style.display = 'block';

            // ==================== 常量定义 ====================
            const USER_TYPES = { 
                ADMIN: 'admin', 
                MANAGER: 'manager',
                SECRETAIRE: 'secretaire',
                PREPARATEUR: 'preparateur', 
                CHAUFFEUR: 'chauffeur',
                RESPONSABLE: 'responsable'
            };
            
            const FULL_ACCESS_TYPES = ['admin', 'manager', 'secretaire'];
            
            const ORDER_STATUS = { 
                EN_ATTENTE: 'en_attente', 
                PREPARE: 'prepare', 
                EN_COURS: 'en_cours', 
                LIVRE: 'livre' 
            };
            
            // 仓库地址（文本）
const DEPOT_ADDRESS = '98 Rue Anselme Rondenay, 94400 Vitry-sur-Seine, France';

// 仓库坐标（初始默认值，稍后会动态更新）
let START_POINT = { 
    address: DEPOT_ADDRESS, 
    lat: 48.7875,  // 临时值，会被覆盖
    lon: 2.3958 
};

// 动态获取仓库精确坐标
async function updateDepotCoordinates() {
    try {
        const geo = await geocodeAddress(DEPOT_ADDRESS);
        if (geo && geo.lat && geo.lon) {
            START_POINT = {
                address: DEPOT_ADDRESS,
                lat: geo.lat,
                lon: geo.lon
            };
            console.log('仓库坐标已更新:', START_POINT);
            
            // 如果地图已初始化，重新加载订单刷新地图
            if (map) {
                await loadOrders();
            }
        }
    } catch (e) {
        console.error('获取仓库坐标失败:', e);
    }
}

// 在初始化时调用
updateDepotCoordinates();

            // ==================== 全局变量 ====================
            let currentDate = new Date().toISOString().split('T')[0];
            let map = null;
            let mapMarkers = [];
            let routeLayer = null;
            let signaturePad = null;
            let currentOrderId = null, currentTransportId = null, currentEditOrderId = null, currentEditTaskId = null, currentEditUserId = null;
            let confirmResolve = null;
            let selectedDriver = null;
            let allNonDeliveredOrders = [];
            let currentPaletteTransportId = null;
            let paletteResolve = null;

// ==================== 智能导航（优先App，无App则网页版） ====================
window.openNavigation = function(address) {
    if (!address) return;
    
    let cleanAddress = address.trim();
    
    // 创建自定义弹窗
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 32px;
            width: 320px;
            max-width: 85%;
            padding: 24px 20px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            animation: fadeIn 0.2s ease-out;
        ">
            <div style="font-size: 48px; margin-bottom: 12px;">🗺️</div>
            <h3 style="color: #1d4a72; margin-bottom: 8px; font-size: 1.2rem;">Navigation</h3>
            <div style="background: #f5f5f5; border-radius: 16px; padding: 10px 12px; margin: 16px 0; font-size: 0.85rem; color: #666; word-break: break-all; text-align: left;">
                📍 <strong>Adresse:</strong><br>
                ${escapeHtmlSimple(cleanAddress)}
            </div>
            <p style="color: #999; font-size: 0.75rem; margin-bottom: 16px;">L'application s'ouvrira si installée, sinon version web</p>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button id="navGoogleBtn" style="
                    background: #4285f4;
                    color: white;
                    border: none;
                    padding: 14px 20px;
                    border-radius: 40px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: transform 0.1s;
                ">
                    <span>📍</span> Google Maps
                </button>
                
                <button id="navWazeBtn" style="
                    background: #33ccff;
                    color: white;
                    border: none;
                    padding: 14px 20px;
                    border-radius: 40px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: transform 0.1s;
                ">
                    <span>🧭</span> Waze
                </button>
                
                <button id="navCancelBtn" style="
                    background: #f0f0f0;
                    color: #666;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 40px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    margin-top: 8px;
                ">
                    Annuler
                </button>
            </div>
        </div>
        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        </style>
    `;
    
    document.body.appendChild(modal);
    
    function escapeHtmlSimple(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    // ========== Google Maps 智能打开 ==========
    const googleBtn = modal.querySelector('#navGoogleBtn');
    googleBtn.onclick = () => {
        // Google Maps App 协议
        const googleAppUrl = `comgooglemaps://?q=${encodeURIComponent(cleanAddress)}&directionsmode=driving`;
        const googleWebUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`;
        
        // 检测设备
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) {
            // iOS: 先尝试打开 App
            window.location.href = googleAppUrl;
            // 如果 2 秒后还在当前页面，说明没装 App，跳转网页版
            setTimeout(function() {
                window.open(googleWebUrl, '_blank');
            }, 2000);
        } else if (isAndroid) {
            // Android: 用 intent 协议
            const intentUrl = `intent://maps/search/?q=${encodeURIComponent(cleanAddress)}#Intent;scheme=https;package=com.google.android.apps.maps;end`;
            window.location.href = intentUrl;
            setTimeout(function() {
                window.open(googleWebUrl, '_blank');
            }, 2000);
        } else {
            // 电脑或其他设备：直接打开网页版
            window.open(googleWebUrl, '_blank');
        }
        
        document.body.removeChild(modal);
    };
    
    // ========== Waze 智能打开 ==========
    const wazeBtn = modal.querySelector('#navWazeBtn');
    wazeBtn.onclick = () => {
        // Waze App 协议
        const wazeAppUrl = `waze://?q=${encodeURIComponent(cleanAddress)}&navigate=yes`;
        const wazeWebUrl = `https://www.waze.com/ul?q=${encodeURIComponent(cleanAddress)}&navigate=yes`;
        
        // 检测设备
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS || isAndroid) {
            // 手机端：先尝试打开 App
            window.location.href = wazeAppUrl;
            // 如果 2 秒后还在当前页面，说明没装 Waze，跳转网页版
            setTimeout(function() {
                window.open(wazeWebUrl, '_blank');
            }, 2000);
        } else {
            // 电脑：直接打开网页版
            window.open(wazeWebUrl, '_blank');
        }
        
        document.body.removeChild(modal);
    };
    
    const cancelBtn = modal.querySelector('#navCancelBtn');
    cancelBtn.onclick = () => {
        document.body.removeChild(modal);
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
};
// ==================== DOM 元素 ====================
            const loginOverlay = document.getElementById('loginOverlay');
            const appContainer = document.getElementById('app');
            const loginUsername = document.getElementById('loginUsername');
            const loginPassword = document.getElementById('loginPassword');
            const loginBtn = document.getElementById('loginBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            const rememberMe = document.getElementById('rememberMe');
            const currentUserDisplay = document.getElementById('currentUserDisplay');
            const userTypeDisplay = document.getElementById('userTypeDisplay');
            const adminSection = document.getElementById('adminSection');
            const userTableBody = document.getElementById('userTableBody');
            const inputDatePicker = document.getElementById('inputDate');
            const loadingMessage = document.getElementById('loadingMessage');
            const addOrderSection = document.getElementById('addOrderSection');
            const customerName = document.getElementById('customerName');
            const customerPhone = document.getElementById('customerPhone');
            const customerAddr = document.getElementById('customerAddr');
            const driverSelect = document.getElementById('driverSelect');
            const timeType = document.getElementById('timeType');
            const timeInputContainer = document.getElementById('timeInputContainer');
            const addOrderBtn = document.getElementById('addOrderBtn');
            const optimizeBtn = document.getElementById('optimizeRouteBtn');
            const routeStepsList = document.getElementById('routeStepsList');
            const startPointInfo = document.getElementById('startPointInfo');
            const routeStatus = document.getElementById('routeStatus');
            const departureTimeInfo = document.getElementById('departureTimeInfo');
            const departureTimeDisplay = document.getElementById('departureTimeDisplay');
            const newUsername = document.getElementById('newUsername');
            const newPhone = document.getElementById('newPhone');
            const newPassword = document.getElementById('newPassword');
            const newUserType = document.getElementById('newUserType');
            const createUserBtn = document.getElementById('createUserBtn');
            const ordersByDriver = document.getElementById('ordersByDriver');
            const geocodeAllBtn = document.getElementById('geocodeAllBtn');
            const mapContainer = document.getElementById('mapContainer');
            const routePanel = document.getElementById('routePanel');
            const adminDriverSelector = document.getElementById('adminDriverSelector');
            const adminDriverSelect = document.getElementById('adminDriverSelect');
            
            const addTaskSection = document.getElementById('addTaskSection');
            const taskDescription = document.getElementById('taskDescription');
            const taskAssignee = document.getElementById('taskAssignee');
            const addTaskBtn = document.getElementById('addTaskBtn');
            const tasksList = document.getElementById('tasksList');
            
            const addTransportSection = document.getElementById('addTransportSection');
            const transportCompany = document.getElementById('transportCompany');
            const transportCustomer = document.getElementById('transportCustomer');
            const transportReference = document.getElementById('transportReference');
            const transportPaletteCount = document.getElementById('transportPaletteCount');
            const addTransportBtn = document.getElementById('addTransportBtn');
            const transportsList = document.getElementById('transportsList');
            
            const paletteCountModal = document.getElementById('paletteCountModal');
            const euroPaletteCount = document.getElementById('euroPaletteCount');
            const standardPaletteCount = document.getElementById('standardPaletteCount');
            const euroMinusBtn = document.getElementById('euroMinusBtn');
            const euroPlusBtn = document.getElementById('euroPlusBtn');
            const standardMinusBtn = document.getElementById('standardMinusBtn');
            const standardPlusBtn = document.getElementById('standardPlusBtn');
            const totalPaletteCount = document.getElementById('totalPaletteCount');
            const cancelPaletteBtn = document.getElementById('cancelPaletteBtn');
            const savePaletteBtn = document.getElementById('savePaletteBtn');
            
            const signatureModal = document.getElementById('signatureModal');
            const signatureCanvas = document.getElementById('signatureCanvas');
            const clearSignatureBtn = document.getElementById('clearSignatureBtn');
            const saveSignatureBtn = document.getElementById('saveSignatureBtn');
            const cancelSignatureBtn = document.getElementById('cancelSignatureBtn');
            const viewSignatureModal = document.getElementById('viewSignatureModal');
            const viewSignatureImage = document.getElementById('viewSignatureImage');
            const closeViewSignatureBtn = document.getElementById('closeViewSignatureBtn');
            const editOrderModal = document.getElementById('editOrderModal');
            const editOrderCustomer = document.getElementById('editOrderCustomer');
            const editOrderPhone = document.getElementById('editOrderPhone');
            const editOrderAddr = document.getElementById('editOrderAddr');
            const editOrderDriver = document.getElementById('editOrderDriver');
            const cancelEditOrderBtn = document.getElementById('cancelEditOrderBtn');
            const saveEditOrderBtn = document.getElementById('saveEditOrderBtn');
            const editTaskModal = document.getElementById('editTaskModal');
            const editTaskDescription = document.getElementById('editTaskDescription');
            const editTaskAssignee = document.getElementById('editTaskAssignee');
            const cancelEditTaskBtn = document.getElementById('cancelEditTaskBtn');
            const saveEditTaskBtn = document.getElementById('saveEditTaskBtn');
            const editUserModal = document.getElementById('editUserModal');
            const editUserUsername = document.getElementById('editUserUsername');
            const editUserPhone = document.getElementById('editUserPhone');
            const editUserPassword = document.getElementById('editUserPassword');
            const editUserType = document.getElementById('editUserType');
            const cancelEditUserBtn = document.getElementById('cancelEditUserBtn');
            const saveEditUserBtn = document.getElementById('saveEditUserBtn');
            const editTransportModal = document.getElementById('editTransportModal');
            const editTransportCompany = document.getElementById('editTransportCompany');
            const editTransportCustomer = document.getElementById('editTransportCustomer');
            const editTransportReference = document.getElementById('editTransportReference');
            const editTransportPaletteCount = document.getElementById('editTransportPaletteCount');
            const cancelEditTransportBtn = document.getElementById('cancelEditTransportBtn');
            const saveEditTransportBtn = document.getElementById('saveEditTransportBtn');
            const confirmModal = document.getElementById('confirmModal');
            const confirmTitle = document.getElementById('confirmTitle');
            const confirmMessage = document.getElementById('confirmMessage');
            const confirmYesBtn = document.getElementById('confirmYesBtn');
            const confirmNoBtn = document.getElementById('confirmNoBtn');

            // ==================== 权限检查函数 ====================
            function hasFullAccess() {
                return FULL_ACCESS_TYPES.includes(currentUserType);
            }

            function isAdmin() {
                return currentUserType === USER_TYPES.ADMIN;
            }

            function isManager() {
                return currentUserType === USER_TYPES.MANAGER;
            }

            function isSecretaire() {
                return currentUserType === USER_TYPES.SECRETAIRE;
            }

            function isPreparateur() {
                return currentUserType === USER_TYPES.PREPARATEUR;
            }

            function isChauffeur() {
                return currentUserType === USER_TYPES.CHAUFFEUR;
            }

            function isResponsable() {
                return currentUserType === USER_TYPES.RESPONSABLE;
            }

            // ==================== 确认对话框 ====================
            function showConfirm(title, message) {
                return new Promise((resolve) => {
                    confirmResolve = resolve;
                    confirmTitle.textContent = title;
                    confirmMessage.textContent = message;
                    confirmModal.style.display = 'flex';
                });
            }

            confirmYesBtn.addEventListener('click', () => {
                confirmModal.style.display = 'none';
                if (confirmResolve) confirmResolve(true);
            });

            confirmNoBtn.addEventListener('click', () => {
                confirmModal.style.display = 'none';
                if (confirmResolve) confirmResolve(false);
            });

            // ==================== 托盘计数对话框 ====================
            function showPaletteModal() {
                return new Promise((resolve) => {
                    paletteResolve = resolve;
                    euroPaletteCount.value = '0';
                    standardPaletteCount.value = '0';
                    updateTotal();
                    paletteCountModal.style.display = 'flex';
                });
            }

            function updateTotal() {
                const total = (parseInt(euroPaletteCount.value) || 0) + (parseInt(standardPaletteCount.value) || 0);
                totalPaletteCount.textContent = total;
            }

            euroPlusBtn.addEventListener('click', () => {
                euroPaletteCount.value = (parseInt(euroPaletteCount.value) || 0) + 1;
                updateTotal();
            });

            euroMinusBtn.addEventListener('click', () => {
                const val = (parseInt(euroPaletteCount.value) || 0) - 1;
                if (val >= 0) euroPaletteCount.value = val;
                updateTotal();
            });

            standardPlusBtn.addEventListener('click', () => {
                standardPaletteCount.value = (parseInt(standardPaletteCount.value) || 0) + 1;
                updateTotal();
            });

            standardMinusBtn.addEventListener('click', () => {
                const val = (parseInt(standardPaletteCount.value) || 0) - 1;
                if (val >= 0) standardPaletteCount.value = val;
                updateTotal();
            });

            cancelPaletteBtn.addEventListener('click', () => {
                paletteCountModal.style.display = 'none';
                if (paletteResolve) {
                    paletteResolve({ cancelled: true });
                    paletteResolve = null;
                }
            });

            savePaletteBtn.addEventListener('click', () => {
                paletteCountModal.style.display = 'none';
                if (paletteResolve) {
                    paletteResolve({
                        cancelled: false,
                        euro: parseInt(euroPaletteCount.value) || 0,
                        standard: parseInt(standardPaletteCount.value) || 0
                    });
                    paletteResolve = null;
                }
            });

            // ==================== 全局操作函数 ====================
            window.prepareOrder = async function(orderId) {
                const confirmed = await showConfirm('Préparer la commande', 'Confirmer la préparation ?');
                if (!confirmed) return;
                const { error } = await supabase
                    .from('orders')
                    .update({
                        status: ORDER_STATUS.PREPARE,
                        prepared_by: currentUser,
                        prepared_at: new Date().toISOString(),
                        sms_sent_to_customer: false
                    })
                    .eq('id', orderId);
                if (!error) await loadOrders();
            };

            window.departOrder = async function(orderId) {
                const confirmed = await showConfirm('Démarrer la livraison', 'Confirmer le départ ?');
                if (!confirmed) return;
                
                const { error } = await supabase
                    .from('orders')
                    .update({
                        status: ORDER_STATUS.EN_COURS,
                        driver_departure_at: new Date().toISOString(),
                        sms_sent_to_customer: false
                    })
                    .eq('id', orderId);
                    
                if (!error) {
                    await loadOrders();
                }
            };

            window.openSignatureModal = function(orderId) {
                currentOrderId = orderId;
                signatureModal.style.display = 'flex';
                if (!signaturePad) initSignaturePad();
                else signaturePad.clear();
            };

            window.completeTask = async function(taskId) {
                const confirmed = await showConfirm('Terminer la tâche', 'Confirmer ?');
                if (!confirmed) return;
                const { error } = await supabase
                    .from('tasks')
                    .update({
                        completed: true,
                        completed_at: new Date().toISOString(),
                        completed_by: currentUser
                    })
                    .eq('id', taskId);
                if (!error) await loadTasks();
            };

            window.departTransport = async function(transportId) {
                if (isChauffeur()) return;
                
                const confirmed = await showConfirm('Départ transport', 'Confirmer le départ du transport ?');
                if (!confirmed) return;
                
                const paletteRendu = await showConfirm('Palettes rendues', 'Les palettes ont-elles toutes été rendues ?');
                
                if (paletteRendu) {
                    const { error } = await supabase
                        .from('transports')
                        .update({
                            departed: true,
                            departed_at: new Date().toISOString(),
                            departed_by: currentUser,
                            palette_rendu: true,
                            palette_count: 0,
                            palette_count_euro: 0
                        })
                        .eq('id', transportId);
                    if (!error) await loadTransports();
                } else {
                    const paletteData = await showPaletteModal();
                    if (paletteData && !paletteData.cancelled) {
                        const { error } = await supabase
                            .from('transports')
                            .update({
                                departed: true,
                                departed_at: new Date().toISOString(),
                                departed_by: currentUser,
                                palette_rendu: false,
                                palette_count: paletteData.standard,
                                palette_count_euro: paletteData.euro
                            })
                            .eq('id', transportId);
                        if (!error) await loadTransports();
                    }
                }
            };

            window.editTransport = async function(transportId) {
                if (!hasFullAccess()) return;
                const { data, error } = await supabase
                    .from('transports')
                    .select('*')
                    .eq('id', transportId)
                    .single();
                if (data) {
                    currentTransportId = transportId;
                    editTransportCompany.value = data.company;
                    editTransportCustomer.value = data.customer || '';
                    editTransportReference.value = data.reference || '';
                    editTransportPaletteCount.value = data.palette_count || 0;
                    editTransportModal.style.display = 'flex';
                }
            };

            window.deleteTransport = async function(transportId) {
                if (!hasFullAccess()) return;
                const confirmed = await showConfirm('Supprimer', 'Supprimer ce transport ?');
                if (!confirmed) return;
                const { error } = await supabase
                    .from('transports')
                    .delete()
                    .eq('id', transportId);
                if (!error) await loadTransports();
            };

            window.editOrder = async function(orderId) {
                if (!hasFullAccess()) return;
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();
                if (data) {
                    currentEditOrderId = orderId;
                    editOrderCustomer.value = data.customer_name || '';
                    editOrderPhone.value = data.phone || '';
                    editOrderAddr.value = data.destination || '';
                    await loadDriversIntoSelect(editOrderDriver);
                    editOrderDriver.value = data.driver || '';
                    editOrderModal.style.display = 'flex';
                }
            };

            window.deleteOrder = async function(orderId) {
                if (!hasFullAccess()) return;
                const confirmed = await showConfirm('Supprimer', 'Supprimer cette commande ?');
                if (!confirmed) return;
                const { error } = await supabase
                    .from('orders')
                    .delete()
                    .eq('id', orderId);
                if (!error) await loadOrders();
            };

            window.editTask = async function(taskId) {
                const { data, error } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('id', taskId)
                    .single();
                if (data) {
                    if (isResponsable() && data.created_by !== currentUser) {
                        alert('Vous ne pouvez modifier que les tâches que vous avez créées');
                        return;
                    }
                    
                    currentEditTaskId = taskId;
                    editTaskDescription.value = data.description || '';
                    await loadTaskAssigneesIntoSelect(editTaskAssignee);
                    editTaskAssignee.value = data.assigned_to || '';
                    editTaskModal.style.display = 'flex';
                }
            };

            window.deleteTask = async function(taskId) {
                const { data, error } = await supabase
                    .from('tasks')
                    .select('created_by')
                    .eq('id', taskId)
                    .single();
                
                if (data) {
                    if (isResponsable() && data.created_by !== currentUser) {
                        alert('Vous ne pouvez supprimer que les tâches que vous avez créées');
                        return;
                    }
                    
                    const confirmed = await showConfirm('Supprimer', 'Supprimer cette tâche ?');
                    if (!confirmed) return;
                    
                    const { error } = await supabase
                        .from('tasks')
                        .delete()
                        .eq('id', taskId);
                    if (!error) await loadTasks();
                }
            };

            window.editUser = async function(username) {
                if (!hasFullAccess()) return;
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('username', username)
                    .single();
                if (data) {
                    currentEditUserId = username;
                    editUserUsername.value = data.username || '';
                    editUserPhone.value = data.phone || '';
                    editUserPassword.value = '';
                    editUserType.value = data.user_type || 'preparateur';
                    editUserModal.style.display = 'flex';
                }
            };

            window.deleteUser = async function(username) {
                if (!hasFullAccess()) return;
                const confirmed = await showConfirm('Supprimer', `Supprimer ${username} ?`);
                if (!confirmed) return;
                const { error } = await supabase
                    .from('users')
                    .delete()
                    .eq('username', username);
                if (!error) {
                    await loadUsers();
                    await loadDrivers();
                    await loadTaskAssignees();
                    await loadAdminDrivers();
                }
            };

            window.viewSignature = function(signatureData) {
                viewSignatureImage.src = signatureData;
                viewSignatureModal.style.display = 'flex';
            };

            window.returnToDepot = async function() {
                const confirmed = await showConfirm('Retour au dépôt', 'Confirmer le retour au dépôt ?');
                if (!confirmed) return;
                alert('✅ Bon retour au dépôt !');
            };

            closeViewSignatureBtn.addEventListener('click', () => {
                viewSignatureModal.style.display = 'none';
            });
         


            async function geocodeAddress(address) {
                try {
                    if (!address) return null;
                    
                    let searchAddress = address.trim();
                    
                    // 如果是纯数字邮编（5位数字）
                    if (/^\d{5}$/.test(searchAddress)) {
                        searchAddress = searchAddress + ', France';
                    }
                    
                    // 确保包含 France
                    if (!searchAddress.toLowerCase().includes('france')) {
                        searchAddress = searchAddress + ', France';
                    }
                    
                    console.log('地理编码地址:', searchAddress);
                    
                    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=3&countrycodes=fr&addressdetails=1&limit=1`;
                    
                    const response = await fetch(url, {
                        headers: { 'User-Agent': 'DeliveryApp/1.0' }
                    });
                    const data = await response.json();
                    
                    if (data && data.length > 0) {
                        const result = data[0];
                        return {
                            lat: parseFloat(result.lat),
                            lon: parseFloat(result.lon),
                            display_name: result.display_name
                        };
                    }
                    
                    // 降级：尝试去掉 France 再搜一次
                    const fallbackAddress = address.trim();
                    const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackAddress)}&limit=1`;
                    const fallbackResp = await fetch(fallbackUrl, { headers: { 'User-Agent': 'DeliveryApp/1.0' } });
                    const fallbackData = await fallbackResp.json();
                    
                    if (fallbackData && fallbackData.length > 0) {
                        return {
                            lat: parseFloat(fallbackData[0].lat),
                            lon: parseFloat(fallbackData[0].lon),
                            display_name: fallbackData[0].display_name
                        };
                    }
                    
                    console.warn('地址未找到:', address);
                    return null;
                    
                } catch (error) {
                    console.error('地理编码错误:', error);
                    return null;
                }
            }
            // ==================== 批量地理编码 ====================
            async function geocodeAllOrders() {
                const confirmed = await showConfirm('Géocodage', 'Géocoder toutes les adresses non géolocalisées ?');
                if (!confirmed) return;
                
                const { data: orders, error } = await supabase
                    .from('orders')
                    .select('*')
                    .is('lat', null);
                
                if (!orders || orders.length === 0) {
                    alert('Toutes les commandes ont déjà des coordonnées');
                    return;
                }
                
                let successCount = 0;
                for (const order of orders) {
                    const geo = await geocodeAddress(order.destination);
                    if (geo) {
                        await supabase
                            .from('orders')
                            .update({ lat: geo.lat, lon: geo.lon })
                            .eq('id', order.id);
                        successCount++;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                alert(`${successCount} / ${orders.length} adresses géocodées`);
                await loadOrders();
            }

            geocodeAllBtn.addEventListener('click', geocodeAllOrders);

            // ==================== 加载司机列表（并建立电话映射表）====================
            async function loadDrivers() {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('username, phone')
                        .eq('user_type', USER_TYPES.CHAUFFEUR);
                    if (data) {
                        // 构建司机电话映射表，供短信使用
                        window.driverPhoneMap = {};
                        data.forEach(driver => {
                            window.driverPhoneMap[driver.username] = driver.phone || '';
                        });
                        
                        // 保存当前司机的电话到全局变量
                        const currentChauffeur = data.find(d => d.username === currentUser);
                        if (currentChauffeur) {
                            window.chauffeurPhone = currentChauffeur.phone;
                            console.log('当前司机电话:', window.chauffeurPhone);
                        }
                        
                        // 填充司机选择下拉框
                        if (driverSelect) {
                            driverSelect.innerHTML = '<option value="">Choisir</option>';
                            data.forEach(driver => {
                                const option = document.createElement('option');
                                option.value = driver.username;
                                option.textContent = driver.phone ? `${driver.username} (${driver.phone})` : driver.username;
                                driverSelect.appendChild(option);
                            });
                        }
                    }
                } catch (e) {
                    console.error('loadDrivers异常:', e);
                }
            }

            async function loadAdminDrivers() {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('username, phone')
                        .eq('user_type', USER_TYPES.CHAUFFEUR);
                    
                    if (error) {
                        console.error('加载司机列表错误:', error);
                        return;
                    }
                    
                    if (data && adminDriverSelect) {
                        adminDriverSelect.innerHTML = '<option value="">Tous les chauffeurs</option>';
                        data.forEach(driver => {
                            const option = document.createElement('option');
                            option.value = driver.username;
                            option.textContent = driver.phone ? `${driver.username} (${driver.phone})` : driver.username;
                            adminDriverSelect.appendChild(option);
                        });
                    }
                } catch (e) {
                    console.error('loadAdminDrivers异常:', e);
                }
            }

            async function loadDriversIntoSelect(selectElement) {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('username, phone')
                        .eq('user_type', USER_TYPES.CHAUFFEUR);
                    if (data) {
                        selectElement.innerHTML = '<option value="">Choisir</option>';
                        data.forEach(driver => {
                            const option = document.createElement('option');
                            option.value = driver.username;
                            option.textContent = driver.phone ? `${driver.username} (${driver.phone})` : driver.username;
                            selectElement.appendChild(option);
                        });
                    }
                } catch (e) {
                    console.error('loadDriversIntoSelect异常:', e);
                }
            }

            // ==================== 加载任务负责人 ====================
            async function loadTaskAssignees() {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('username')
                        .in('user_type', [USER_TYPES.PREPARATEUR, USER_TYPES.CHAUFFEUR, USER_TYPES.RESPONSABLE, USER_TYPES.SECRETAIRE, USER_TYPES.MANAGER]);
                    if (data && taskAssignee) {
                        taskAssignee.innerHTML = '<option value="">Choisir</option>';
                        data.forEach(user => {
                            const option = document.createElement('option');
                            option.value = user.username;
                            option.textContent = user.username;
                            taskAssignee.appendChild(option);
                        });
                    }
                } catch (e) {
                    console.error('loadTaskAssignees异常:', e);
                }
            }

            async function loadTaskAssigneesIntoSelect(selectElement) {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('username')
                        .in('user_type', [USER_TYPES.PREPARATEUR, USER_TYPES.CHAUFFEUR, USER_TYPES.RESPONSABLE, USER_TYPES.SECRETAIRE, USER_TYPES.MANAGER]);
                    if (data) {
                        selectElement.innerHTML = '<option value="">Choisir</option>';
                        data.forEach(user => {
                            const option = document.createElement('option');
                            option.value = user.username;
                            option.textContent = user.username;
                            selectElement.appendChild(option);
                        });
                    }
                } catch (e) {
                    console.error('loadTaskAssigneesIntoSelect异常:', e);
                }
            }

            // ==================== 用户管理 ====================
            async function loadUsers() {
                if (!hasFullAccess()) {
                    return;
                }
                
                try {
                    console.log('正在加载用户列表...');
                    const { data, error } = await supabase
                        .from('users')
                        .select('*')
                        .order('created_at', { ascending: false });
                    
                    if (error) {
                        console.error('加载用户列表错误:', error);
                        return;
                    }
                    
                    if (data) {
                        console.log('找到用户:', data.length);
                        const filtered = data.filter(u => u.user_type !== 'admin');
                        renderUserTable(filtered);
                    }
                } catch (e) {
                    console.error('loadUsers异常:', e);
                }
            }

            function renderUserTable(users) {
                if (!userTableBody) return;
                
                let html = '';
                if (users.length === 0) {
                    html = '<tr><td colspan="4" style="text-align:center; padding:20px;">Aucun utilisateur</td> </tr>';
                } else {
                    users.forEach(user => {
                        const typeLabels = {
                            'preparateur': 'Préparateur',
                            'chauffeur': 'Chauffeur',
                            'responsable': 'Responsable',
                            'manager': 'Manager',
                            'secretaire': 'Secrétaire générale'
                        };
                        const typeLabel = typeLabels[user.user_type] || user.user_type;
                        html += `
                            <tr>
                                <td>${escapeHtml(user.username)}</td>
                                <td><span class="user-type ${user.user_type}">${typeLabel}</span></td>
                                <td>${user.phone ? escapeHtml(user.phone) : '—'}</td>
                                <td class="user-actions">
                                    ${hasFullAccess() ? `
                                        <button class="btn-icon" onclick="editUser('${user.username}')">✏️</button>
                                        <button class="btn-icon" onclick="deleteUser('${user.username}')">🗑️</button>
                                    ` : `
                                        <span style="color:#999; font-size:0.8rem;">(lecture seule)</span>
                                    `}
                                </td>
                            </tr>
                        `;
                    });
                }
                userTableBody.innerHTML = html;
            }

            createUserBtn.addEventListener('click', async () => {
                if (!hasFullAccess()) return;
                const username = newUsername.value.trim();
                const phone = newPhone?.value.trim() || '';
                const password = newPassword.value.trim();
                const userType = newUserType.value;
                if (!username || !password) return alert('Champs requis');
                
                const confirmed = await showConfirm('Créer', `Créer ${username} ?`);
                if (!confirmed) return;
                
                const { error } = await supabase
                    .from('users')
                    .insert([{ 
                        username, 
                        phone: phone || null,
                        password, 
                        user_type: userType 
                    }]);
                if (!error) {
                    newUsername.value = '';
                    if (newPhone) newPhone.value = '';
                    newPassword.value = '';
                    await loadUsers();
                    await loadDrivers();
                    await loadTaskAssignees();
                    await loadAdminDrivers();
                } else {
                    alert('Erreur: ' + error.message);
                }
            });

            cancelEditUserBtn.addEventListener('click', () => {
                editUserModal.style.display = 'none';
                currentEditUserId = null;
            });

            saveEditUserBtn.addEventListener('click', async () => {
                if (!hasFullAccess() || !currentEditUserId) return;
                const username = editUserUsername.value.trim();
                const phone = editUserPhone?.value.trim() || '';
                const password = editUserPassword.value.trim();
                const userType = editUserType.value;
                if (!username) {
                    alert('Nom requis');
                    return;
                }
                const updateData = { username, phone: phone || null, user_type: userType };
                if (password) updateData.password = password;
                const { error } = await supabase
                    .from('users')
                    .update(updateData)
                    .eq('username', currentEditUserId);
                if (!error) {
                    editUserModal.style.display = 'none';
                    currentEditUserId = null;
                    await loadUsers();
                    await loadDrivers();
                    await loadTaskAssignees();
                    await loadAdminDrivers();
                }
            });

            // ==================== 生成短信内容 ====================
            function generateSMSMessage(order, chauffeurName, chauffeurPhone) {
                let timeText = '';
                
                if (order.time_req) {
                    if (order.time_req.type === 'fixed') {
                        timeText = `à ${order.time_req.value}`;
                    } else if (order.time_req.type === 'before') {
                        timeText = `avant ${order.time_req.value}`;
                    } else if (order.time_req.type === 'range') {
                        timeText = `entre ${order.time_req.value.start} et ${order.time_req.value.end}`;
                    } else {
                        timeText = `entre 9h et 18h`;
                    }
                } else {
                    timeText = `entre 9h et 18h`;
                }
                
                // 生成三种语言的短信内容
             const frenchText = `📦 Notification Yida – Livraison aujourd'hui
Bonjour ${order.customer_name},

Nous vous informons que votre commande sera livrée aujourd'hui ${timeText}.

Livreur : ${chauffeurName}
Téléphone : ${chauffeurPhone || 'Non disponible'}

En cas de changement, merci de contacter le livreur.
Merci de rester joignable.
Nous vous souhaitons une excellente journée.

Cordialement,
Yida`;

const englishText = `📦 Yida Delivery Notification – Scheduled for today
Dear ${order.customer_name},

We would like to inform you that your order is scheduled for delivery today ${timeText}.

Driver: ${chauffeurName}
Phone: ${chauffeurPhone || 'Not available'}

In case of any changes, please contact the driver.
Please keep your phone accessible.
We wish you a pleasant day.

Kind regards,
Yida`;

const chineseText = `📦 Yida配送通知 – 今日送达
尊敬的 ${order.customer_name}，

您好！您的订单预计于今天 ${timeText} 送达。

配送员：${chauffeurName}
联系电话：${chauffeurPhone || '暂无电话'}

如有变动，请及时联系配送员。
请保持电话畅通。
祝您工作顺利，生活愉快！

Yida`; 
                // 合并三种语言，用分隔线分开
                return `${frenchText}\n\n---\n\n${englishText}\n\n---\n\n${chineseText}`;
            }

            // ==================== Leaflet 地图初始化 ====================
            function initMap() {
                if (!map) {
                    console.log('初始化 Leaflet 地图...');
                    try {
                        map = L.map('map').setView([START_POINT.lat, START_POINT.lon], 11);
                       L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
                        subdomains: 'abcd',
                        maxZoom: 19
                    }).addTo(map);
                        
                        console.log('Leaflet 地图初始化成功');
                    } catch (e) {
                        console.error('地图初始化失败:', e);
                    }
                }
            }

            // ==================== 更新地图标记 ====================
            async function updateMap(orders) {
                console.log('updateMap被调用，订单数量:', orders?.length);
                
                if (!map) {
                    console.log('地图未初始化，尝试初始化');
                    initMap();
                    return;
                }
                
                const canSeeMap = isChauffeur() || hasFullAccess();
                if (!canSeeMap) {
                    console.log('用户无权限查看地图');
                    return;
                }

                // 清除所有现有标记
                if (mapMarkers.length > 0) {
                    mapMarkers.forEach(marker => map.removeLayer(marker));
                    mapMarkers = [];
                }
                
                // 清除路线
                if (routeLayer) {
                    map.removeLayer(routeLayer);
                    routeLayer = null;
                }

                // 获取相关订单
                let relevantOrders = orders;
                if (isChauffeur()) {
                    relevantOrders = orders.filter(o => o.driver === currentUser);
                } else if (hasFullAccess() && selectedDriver) {
                    relevantOrders = orders.filter(o => o.driver === selectedDriver);
                }

                // 添加仓库标记
                const depotIcon = L.divIcon({
                    html: '🏢',
                    className: 'depot-marker',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });
                
                const depotMarker = L.marker([START_POINT.lat, START_POINT.lon], { icon: depotIcon })
                    .bindPopup(`<strong>🚚 Dépôt</strong><br>${escapeHtml(START_POINT.address)}`)
                    .addTo(map);
                mapMarkers.push(depotMarker);

                // 添加未交付订单标记
                const remainingOrders = relevantOrders.filter(o => o.status !== ORDER_STATUS.LIVRE && o.lat && o.lon);
                
                remainingOrders.forEach((point, index) => {
                    if (!point.lat || !point.lon) return;
                    
                    let color = '#ff9800';
                    if (point.status === ORDER_STATUS.EN_COURS) {
                        color = '#9c27b0';
                    } else if (point.status === ORDER_STATUS.PREPARE) {
                        color = '#2196f3';
                    }
                    
                    const markerIcon = L.divIcon({
                        html: `<div style="background-color: ${color}; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
                        className: '',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });
                    
                    let statusText = point.status === ORDER_STATUS.EN_COURS ? '🔵 En cours' : 
                                    point.status === ORDER_STATUS.PREPARE ? '⏳ Prêt' : '';
                    
                    const timeInfo = formatTimeRequirement(point);
                    
                    const marker = L.marker([parseFloat(point.lat), parseFloat(point.lon)], { icon: markerIcon })
                        .bindPopup(`
                            <strong>${index + 1}. ${escapeHtml(point.customer_name)}</strong><br>
                            📍 ${escapeHtml(point.destination)}<br>
                            ⏰ ${timeInfo}<br>
                            ${statusText}
                            ${point.phone ? `<br>📱 ${escapeHtml(point.phone)}` : ''}
                        `)
                        .addTo(map);
                    
                    mapMarkers.push(marker);
                });

                // 获取今日已交付订单
                const deliveredOrders = relevantOrders.filter(o => 
                    o.status === ORDER_STATUS.LIVRE && 
                    o.date === currentDate &&
                    o.lat && o.lon
                );

                // 计算当前位置
                let currentPosition = {
                    lat: START_POINT.lat,
                    lon: START_POINT.lon,
                    address: START_POINT.address
                };
                
                if (deliveredOrders.length > 0) {
                    const lastDelivered = [...deliveredOrders].sort((a, b) => new Date(b.delivered_at) - new Date(a.delivered_at))[0];
                    if (lastDelivered.lat && lastDelivered.lon) {
                        currentPosition = {
                            address: lastDelivered.destination,
                            lat: parseFloat(lastDelivered.lat),
                            lon: parseFloat(lastDelivered.lon)
                        };
                    }
                }

                // 添加当前位置标记
                if (isChauffeur() || (hasFullAccess() && selectedDriver)) {
                    const positionIcon = L.divIcon({
                        html: '🚚',
                        className: 'custom-marker',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });
                    
                    const posMarker = L.marker([currentPosition.lat, currentPosition.lon], { icon: positionIcon })
                        .bindPopup(`
                            <strong>📍 Position actuelle</strong><br>
                            ${currentPosition.address === START_POINT.address ? 'Départ' : 'Dernière livraison'}<br>
                            ${escapeHtml(currentPosition.address)}
                        `)
                        .addTo(map);
                    
                    mapMarkers.push(posMarker);
                }

                // 调整地图视野
                if (mapMarkers.length > 0) {
                    const group = L.featureGroup(mapMarkers);
                    map.fitBounds(group.getBounds().pad(0.1));
                }
            }

            // ==================== 显示路线 ====================
            function displayRoute(geometry) {
                if (!map) return;
                
                if (routeLayer) {
                    map.removeLayer(routeLayer);
                }
                
                routeLayer = L.geoJSON(geometry, {
                    style: {
                        color: '#2f6d9e',
                        weight: 5,
                        opacity: 0.8
                    }
                }).addTo(map);
            }

            // ==================== 获取OSRM路线 ====================
            async function getOSRMRoute(waypoints) {
                const waypointStr = waypoints.map(p => `${p[1]},${p[0]}`).join(';');
                
                try {
                    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${waypointStr}?overview=full&steps=true&geometries=geojson&annotations=true`);
                    const data = await response.json();
                    
                    if (data.routes && data.routes[0]) {
                        const legs = data.routes[0].legs;
                        const distances = legs.map(leg => leg.distance);
                        const durations = legs.map(leg => leg.duration);
                        
                        return {
                            distance: data.routes[0].distance,
                            duration: data.routes[0].duration,
                            geometry: data.routes[0].geometry,
                            distances: distances,
                            durations: durations,
                            legs: legs
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Erreur OSRM:', error);
                    return null;
                }
            }

            // ==================== 获取时间数值用于排序 ====================
            function getOrderTimeValue(order) {
                if (!order.time_req) return 9999;
                
                try {
                    if (order.time_req.type === 'fixed') {
                        const [hours, minutes] = order.time_req.value.split(':');
                        return parseInt(hours) * 60 + parseInt(minutes || 0);
                    } else if (order.time_req.type === 'before') {
                        const [hours, minutes] = order.time_req.value.split(':');
                        return parseInt(hours) * 60 + parseInt(minutes || 0) - 120;
                    } else if (order.time_req.type === 'range') {
                        const [startHours, startMinutes] = order.time_req.value.start.split(':');
                        return parseInt(startHours) * 60 + parseInt(startMinutes || 0);
                    }
                } catch (e) {
                    console.error('时间解析错误:', e);
                }
                
                return 9999;
            }

            // ==================== 智能路线优化 ====================
            optimizeBtn.addEventListener('click', async () => {
                const canOptimize = isChauffeur() || hasFullAccess();
                if (!canOptimize) {
                    alert('Vous n\'avez pas accès à l\'optimisation');
                    return;
                }

                let query = supabase
                    .from('orders')
                    .select('*')
                    .eq('date', currentDate)
                    .neq('status', ORDER_STATUS.LIVRE);
                
                if (isChauffeur()) {
                    query = query.eq('driver', currentUser);
                } else if (hasFullAccess() && selectedDriver) {
                    query = query.eq('driver', selectedDriver);
                } else if (hasFullAccess() && !selectedDriver) {
                    alert('Veuillez sélectionner un chauffeur');
                    return;
                }
                
                const { data: orders, error } = await query;
                if (!orders || orders.length === 0) {
                    alert('Aucune livraison à planifier');
                    return;
                }
                
                routeStatus.innerHTML = '🔄 Calcul...';
                
                const { data: allOrders } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('date', currentDate)
                    .eq('driver', orders[0].driver);
                
                const deliveredOrders = allOrders.filter(o => o.status === ORDER_STATUS.LIVRE);
                
                let currentStartPoint = START_POINT;
                if (deliveredOrders.length > 0) {
                    const lastDelivered = deliveredOrders[deliveredOrders.length - 1];
                    if (lastDelivered.lat && lastDelivered.lon) {
                        currentStartPoint = {
                            address: lastDelivered.destination,
                            lat: parseFloat(lastDelivered.lat),
                            lon: parseFloat(lastDelivered.lon)
                        };
                    }
                }
                
                const withCoords = orders.filter(o => o.lat && o.lon);
                if (withCoords.length === 0) {
                    alert('Aucune coordonnée GPS. Veuillez d\'abord géocoder les adresses.');
                    routeStatus.innerHTML = '❌ Échec';
                    return;
                }
                
                // 按时间要求排序
                const sortedOrders = [...withCoords].sort((a, b) => {
                    const timeA = getOrderTimeValue(a);
                    const timeB = getOrderTimeValue(b);
                    return timeA - timeB;
                });
                
                console.log('按时间排序后的订单:', sortedOrders.map(o => ({
                    client: o.customer_name,
                    time: formatTimeRequirement(o)
                })));
                
                const waypoints = [
                    [currentStartPoint.lat, currentStartPoint.lon],
                    ...sortedOrders.map(o => [parseFloat(o.lat), parseFloat(o.lon)]),
                    [START_POINT.lat, START_POINT.lon]
                ];
                
                const route = await getOSRMRoute(waypoints);
                
                if (route) {
                    displayRoute(route.geometry);
                    await updateMap(allOrders);
                    
                    const departureTime = new Date();
                    departureTime.setHours(8, 0, 0, 0);
                    departureTimeDisplay.textContent = departureTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    departureTimeInfo.style.display = 'inline-block';
                    
                    let stepsHtml = '';
                    let totalDistance = 0;
                    
                    const startTimeStr = departureTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    
                    stepsHtml += `
                        <li style="background: #e8f5e9; border-left: 4px solid #4caf50;">
                            <div style="display: flex; align-items: center;">
                                <span style="background:#4caf50; color:white; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:50%; margin-right:10px; font-weight:bold;">🚩</span>
                                <div>
                                    <strong>Position actuelle</strong><br>
                                    📍 ${escapeHtml(currentStartPoint.address)}<br>
                                    <span style="font-size:0.9rem; color:#666;">🕒 Départ à ${startTimeStr}</span>
                                </div>
                            </div>
                        </li>
                    `;
                    
                    let currentTime = new Date(departureTime);
                    
                    for (let i = 0; i < sortedOrders.length; i++) {
                        const order = sortedOrders[i];
                        
                        const segmentDistance = route.distances[i] / 1000;
                        const segmentDuration = route.durations[i];
                        
                        totalDistance += segmentDistance;
                        
                        currentTime = new Date(currentTime.getTime() + (segmentDuration * 1000));
                        
                        const arrivalTimeStr = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                        
                        const statusIcon = order.status === ORDER_STATUS.EN_COURS ? '🔵' : '⏳';
                        const statusColor = order.status === ORDER_STATUS.EN_COURS ? '#9c27b0' : '#ff9800';
                        
                        // 检查时间要求
                        let timeWarning = '';
                        let timeClass = '';
                        
                        if (order.time_req && order.time_req.type !== 'free') {
                            const requiredTime = getOrderTimeValue(order);
                            const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
                            
                            if (order.time_req.type === 'fixed' && currentMinutes > requiredTime) {
                                timeWarning = '<span class="time-warning">⚠️ Retard</span>';
                                timeClass = 'urgent';
                            } else if (order.time_req.type === 'before' && currentMinutes > requiredTime + 120) {
                                timeWarning = '<span class="time-warning">⚠️ Retard</span>';
                                timeClass = 'urgent';
                            } else if (order.time_req.type === 'range') {
                                const [endHours, endMinutes] = order.time_req.value.end.split(':');
                                const endTime = parseInt(endHours) * 60 + parseInt(endMinutes || 0);
                                if (currentMinutes > endTime) {
                                    timeWarning = '<span class="time-warning">⚠️ Retard</span>';
                                    timeClass = 'urgent';
                                }
                            }
                        }
                        
                        const timeRequirement = formatTimeRequirement(order);
                        
                        stepsHtml += `
                            <li style="border-left: 4px solid ${statusColor};">
                                <div style="display: flex; align-items: center;">
                                    <span style="background:${statusColor}; color:white; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:50%; margin-right:10px; font-weight:bold;">${i+1}</span>
                                    <div style="flex:1;">
                                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                            <strong>${statusIcon} ${escapeHtml(order.customer_name)}</strong>
                                            ${timeWarning}
                                        </div>
                                        📍 ${escapeHtml(order.destination)}<br>
                                        <span class="time-requirement ${timeClass}">⏰ ${timeRequirement}</span><br>
                                        <div style="display: flex; gap: 15px; margin-top: 5px; font-size:0.9rem; color:#666; flex-wrap: wrap;">
                                            <span>🚗 ${segmentDistance.toFixed(1)} km</span>
                                            <span>🕒 Arrivée prévue: ${arrivalTimeStr}</span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        `;
                        
                        currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
                    }
                    
                    if (sortedOrders.length > 0) {
                        const returnSegmentDistance = route.distances[sortedOrders.length] / 1000;
                        const returnSegmentDuration = route.durations[sortedOrders.length];
                        
                        totalDistance += returnSegmentDistance;
                        
                        currentTime = new Date(currentTime.getTime() + (returnSegmentDuration * 1000));
                        
                        const returnTimeStr = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                        
                        stepsHtml += `
                            <li style="background: #e3f2fd; border-left: 4px solid #2196f3;">
                                <div style="display: flex; align-items: center;">
                                    <span style="background:#2196f3; color:white; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:50%; margin-right:10px; font-weight:bold;">🏁</span>
                                    <div>
                                        <strong>Retour au dépôt</strong><br>
                                        📍 98 Rue Anselme Rondenay<br>
                                        <div style="display: flex; gap: 15px; margin-top: 5px; font-size:0.9rem; color:#666; flex-wrap: wrap;">
                                            <span>🚗 ${returnSegmentDistance.toFixed(1)} km</span>
                                            <span>🕒 Retour prévu: ${returnTimeStr}</span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        `;
                    }
                    
                    routeStepsList.innerHTML = stepsHtml;
                    
                    const totalDuration = Math.round((currentTime - departureTime) / (60 * 1000));
                    routeStatus.innerHTML = `✅ ${totalDistance.toFixed(1)} km, ${totalDuration} min`;
                    
                } else {
                    alert('Erreur de calcul avec OSRM');
                    routeStatus.innerHTML = '❌ Échec';
                }
            });

            if (adminDriverSelect) {
                adminDriverSelect.addEventListener('change', (e) => {
                    selectedDriver = e.target.value || null;
                    console.log('选择的司机:', selectedDriver);
                    loadOrders();
                });
            }

            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('session');
                sessionStorage.removeItem('session');
                window.location.href = 'index.html';
            });

            // ==================== 加载订单 ====================
            async function loadOrders() {
                loadingMessage.style.display = 'block';
                
                try {
                    let query = supabase
                        .from('orders')
                        .select('*')
                        .eq('date', currentDate)
                        .order('created_at', { ascending: false });
                    
                    if (isChauffeur()) {
                        query = query.eq('driver', currentUser);
                    } else if (hasFullAccess() && selectedDriver) {
                        query = query.eq('driver', selectedDriver);
                    }
                    
                    const { data, error } = await query;
                    
                    if (error) {
                        console.error('加载订单错误:', error);
                    }
                    
                    if (data) {
                        if (isPreparateur() || isResponsable() || (hasFullAccess() && !selectedDriver)) {
                            renderOrdersGroupedByDriver(data);
                        } else {
                            renderOrdersSimple(data);
                        }
                        await updateMap(data);
                        
                        if (isChauffeur()) {
                            allNonDeliveredOrders = data.filter(o => o.status !== ORDER_STATUS.LIVRE);
                        }
                    }
                } catch (e) {
                    console.error('loadOrders异常:', e);
                }
                
                loadingMessage.style.display = 'none';
            }
            

            




            function renderOrdersGroupedByDriver(orders) {
                const byDriver = {};
                orders.forEach(order => {
                    if (!byDriver[order.driver]) byDriver[order.driver] = [];
                    byDriver[order.driver].push(order);
                });
                let html = '';
                for (const [driver, driverOrders] of Object.entries(byDriver)) {
                    html += `<div class="driver-group"><h4>👤 ${escapeHtml(driver)}</h4>`;
                    driverOrders.forEach(order => {
                        html += renderOrderItem(order);
                    });
                    html += '</div>';
                }
                ordersByDriver.innerHTML = html || '<p>Aucune commande</p>';
            }

            function renderOrdersSimple(orders) {
                let html = '';
                orders.forEach(order => {
                    html += renderOrderItem(order);
                });
                ordersByDriver.innerHTML = html || '<p>Aucune commande</p>';
            }

          function renderOrderItem(order) {
    const timeDisplay = formatTimeRequirement(order);
    const statusLabels = {
        'en_attente': 'En attente',
        'prepare': 'Préparé',
        'en_cours': 'En cours',
        'livre': 'Livré'
    };
    
    let actions = '';
    let smsButton = '';
    
    // ========== 导航按钮（所有人可见，只要有地址） ==========
    let navigateButton = '';
    if (order.destination) {
        // 转义地址中的单引号
        const escapedAddress = order.destination.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        navigateButton = `<button class="btn-navigate" onclick="openNavigation('${escapedAddress}')">📍 Naviguer</button>`;
    }
    
    // ========== 1. 管理员权限（全部权限） ==========
    if (isAdmin()) {
        // EN_ATTENTE 状态：可以准备
        if (order.status === ORDER_STATUS.EN_ATTENTE) {
            actions += `<button class="btn-validate" onclick="prepareOrder('${order.id}')">✅ Préparer</button>`;
        }
        
        // PREPARE 状态：可以出发
        if (order.status === ORDER_STATUS.PREPARE) {
            actions += `<button class="btn-validate" onclick="departOrder('${order.id}')">🚚 Démarrer</button>`;
        }
        
        // EN_COURS 状态：可以送达
        if (order.status === ORDER_STATUS.EN_COURS) {
            actions += `<button class="btn-validate" onclick="openSignatureModal('${order.id}')">📝 Livrer</button>`;
        }
        
        // 所有状态都可以编辑和删除
        actions += `
            <button class="btn-edit" onclick="editOrder('${order.id}')">✏️</button>
            <button class="btn-delete" onclick="deleteOrder('${order.id}')">🗑️</button>
        `;
    }
    
    // ========== 2. 经理/秘书权限（原有权限 + 短信） ==========
    else if (isManager() || isSecretaire()) {
        // EN_ATTENTE 状态：可以准备
        if (order.status === ORDER_STATUS.EN_ATTENTE) {
            actions += `<button class="btn-validate" onclick="prepareOrder('${order.id}')">✅ Préparer</button>`;
        }
        
        // PREPARE 状态：不能出发，但可以发短信（秘书/经理）
        if (order.status === ORDER_STATUS.PREPARE && order.phone) {
            const driverPhone = window.driverPhoneMap?.[order.driver] || '';
            
            let timeTextForSms = '';
            if (order.time_req) {
                if (order.time_req.type === 'fixed') {
                    timeTextForSms = `à ${order.time_req.value}`;
                } else if (order.time_req.type === 'before') {
                    timeTextForSms = `avant ${order.time_req.value}`;
                } else if (order.time_req.type === 'range') {
                    timeTextForSms = `entre ${order.time_req.value.start} et ${order.time_req.value.end}`;
                } else {
                    timeTextForSms = `entre 9h et 18h`;
                }
            } else {
                timeTextForSms = `entre 9h et 18h`;
            }
            
          const frenchSms = `📦 Notification Yida – Livraison aujourd'hui
Bonjour ${order.customer_name},

Nous vous informons que votre commande sera livrée aujourd'hui ${timeTextForSms}.
Livreur : ${order.driver} 📞 ${driverPhone || 'Non disponible'}

En cas de changement, merci de contacter le livreur.`;

const englishSms = `📦 Yida Delivery Notification – Today
Dear ${order.customer_name},

We would like to inform you that your order is scheduled for delivery today ${timeTextForSms}.
Driver: ${order.driver} 📞 ${driverPhone || 'Not available'}

In case of any changes, please contact the driver.`;

const chineseSms = `📦 Yida配送通知 – 今日送达
尊敬的 ${order.customer_name}，

您好！您的订单预计于今天 ${timeTextForSms} 送达。
配送员：${order.driver} 📞 ${driverPhone || '暂无电话'}

如有变动，请及时联系配送员。`;
            
            const smsText = `${frenchSms}\n\n---\n\n${englishSms}\n\n---\n\n${chineseSms}`;
            const encodedSms = encodeURIComponent(smsText);
            const phoneNumber = order.phone.startsWith('0') ? order.phone : '0' + order.phone;
            
            smsButton = `
                <div class="sms-btn-container">
                    <a href="sms:${phoneNumber}?body=${encodedSms}" 
                       class="btn-validate" 
                       style="background:#4CAF50; text-decoration:none; display:inline-block;"
                       target="_blank">
                        📱 SMS client
                    </a>
                </div>
            `;
        }
        
        // EN_COURS 状态：可以送达
        if (order.status === ORDER_STATUS.EN_COURS) {
            actions += `<button class="btn-validate" onclick="openSignatureModal('${order.id}')">📝 Livrer</button>`;
        }
        
        // 可以编辑和删除
        actions += `
            <button class="btn-edit" onclick="editOrder('${order.id}')">✏️</button>
            <button class="btn-delete" onclick="deleteOrder('${order.id}')">🗑️</button>
        `;
    }
    
    // ========== 3. 仓库主管权限 ==========
    else if (isResponsable()) {
        // 仓库主管可以在 EN_ATTENTE 状态准备
        if (order.status === ORDER_STATUS.EN_ATTENTE) {
            actions += `<button class="btn-validate" onclick="prepareOrder('${order.id}')">✅ Préparer</button>`;
        }
    }
    
    // ========== 4. 配货员权限 ==========
    else if (isPreparateur()) {
        // 配货员可以在 EN_ATTENTE 状态准备
        if (order.status === ORDER_STATUS.EN_ATTENTE) {
            actions += `<button class="btn-validate" onclick="prepareOrder('${order.id}')">✅ Préparer</button>`;
        }
    }
    
    // ========== 5. 司机权限 ==========
    else if (isChauffeur()) {
        // 只能看到自己负责的订单
        if (order.driver === currentUser) {
            // PREPARE 状态：司机可以出发，也可以发短信
            if (order.status === ORDER_STATUS.PREPARE) {
                actions += `<button class="btn-validate" onclick="departOrder('${order.id}')">🚚 Démarrer</button>`;
                
                // 如果有客户电话，显示短信按钮
                if (order.phone) {
                    const chauffeurPhone = window.chauffeurPhone || '';
                    
                    let timeTextForSms = '';
                    if (order.time_req) {
                        if (order.time_req.type === 'fixed') {
                            timeTextForSms = `à ${order.time_req.value}`;
                        } else if (order.time_req.type === 'before') {
                            timeTextForSms = `avant ${order.time_req.value}`;
                        } else if (order.time_req.type === 'range') {
                            timeTextForSms = `entre ${order.time_req.value.start} et ${order.time_req.value.end}`;
                        } else {
                            timeTextForSms = `entre 9h et 18h`;
                        }
                    } else {
                        timeTextForSms = `entre 9h et 18h`;
                    }
                    
                    const frenchSms = `📦 [yida的订单] Livraison aujourd'hui\nBonjour ${order.customer_name}, votre commande sera livrée aujourd'hui ${timeTextForSms}.\nVotre livreur: ${currentUser} 📞 ${chauffeurPhone || 'Non disponible'}\nMerci de garder votre téléphone accessible.`;
                    const englishSms = `📦 [yida's order] Delivery today\nHello ${order.customer_name}, your order will be delivered today ${timeTextForSms}.\nYour driver: ${currentUser} 📞 ${chauffeurPhone || 'Not available'}\nPlease keep your phone accessible.`;
                    const chineseSms = `📦 [yida的订单] 今日配送\n您好 ${order.customer_name}，您的订单将于今天 ${timeTextForSms} 配送。\n您的司机: ${currentUser} 📞 ${chauffeurPhone || '暂无电话'}\n请保持电话畅通。`;
                    const smsText = `${frenchSms}\n\n---\n\n${englishSms}\n\n---\n\n${chineseSms}`;
                    const encodedSms = encodeURIComponent(smsText);
                    const phoneNumber = order.phone.startsWith('0') ? order.phone : '0' + order.phone;
                    
                    smsButton = `
                        <div class="sms-btn-container">
                            <a href="sms:${phoneNumber}?body=${encodedSms}" 
                               class="btn-validate" 
                               style="background:#4CAF50; text-decoration:none; display:inline-block;"
                               target="_blank">
                                📱 SMS client
                            </a>
                        </div>
                    `;
                }
            }
            
            // EN_COURS 状态：司机可以送达
            else if (order.status === ORDER_STATUS.EN_COURS) {
                actions += `<button class="btn-validate" onclick="openSignatureModal('${order.id}')">📝 Livrer</button>`;
            }
            
            // LIVRE 状态：检查是否所有订单都已完成，显示返回按钮
            else if (order.status === ORDER_STATUS.LIVRE) {
                const hasPendingOrders = allNonDeliveredOrders && allNonDeliveredOrders.length > 0;
                if (!hasPendingOrders) {
                    actions += `<button class="btn-validate" style="background:#2196f3;" onclick="returnToDepot()">🏁 Retour dépôt</button>`;
                }
            }
        }
    }
    
    // ========== 6. 签名查看按钮（对多种角色开放） ==========
    let signatureButton = '';
    if (order.signature && (isAdmin() || isManager() || isSecretaire() || isResponsable() || isChauffeur())) {
        signatureButton = `<button class="view-signature-btn" onclick="viewSignature('${order.signature}')">📝 Voir signature</button>`;
    }
    
    return `
        <div class="order-card ${order.status}">
            <div class="item-header">
                <span class="customer-name">${escapeHtml(order.customer_name)}</span>
                <span class="status-badge ${order.status}">${statusLabels[order.status]}</span>
            </div>
            <div class="order-details">
                <div>📍 ${escapeHtml(order.destination)}</div>
                <div>⏰ ${timeDisplay}</div>
                ${order.phone ? `<div>📱 ${escapeHtml(order.phone)}</div>` : ''}
            </div>
            <div class="order-meta">
                <span>📅 ${escapeHtml(order.created_by)} ${formatDateTime(order.created_at)}</span>
                ${order.prepared_at ? `<span>📦 ${escapeHtml(order.prepared_by)} ${formatDateTime(order.prepared_at)}</span>` : ''}
                ${order.driver_departure_at ? `<span>🚚 ${formatDateTime(order.driver_departure_at)}</span>` : ''}
                ${order.delivered_at ? `<span>✅ ${formatDateTime(order.delivered_at)}</span>` : ''}
            </div>
            <div class="order-actions">
                ${navigateButton}
                ${actions}
                ${smsButton}
                ${signatureButton}
            </div>
        </div>
    `;
}
            addOrderBtn.addEventListener('click', async () => {
                if (!hasFullAccess()) return;
                
                const name = customerName.value.trim();
                const phone = customerPhone?.value.trim() || '';
                const addr = customerAddr.value.trim();
                const driver = driverSelect.value;
                
                if (!name || !addr || !driver) return alert('Champs requis');
                
                const geoResult = await geocodeAddress(addr);
                if (!geoResult) {
                    const confirm = await showConfirm('Adresse non trouvée', 'Continuer sans coordonnées GPS ?');
                    if (!confirm) return;
                }
                
                const confirmed = await showConfirm('Ajouter', `Créer pour ${name} ?`);
                if (!confirmed) return;
                
                const timeReq = getTimeValue();
                
                const orderData = {
                    customer_name: name,
                    phone: phone || null,
                    destination: addr,
                    driver: driver,
                    date: currentDate,
                    time_req: timeReq,
                    created_by: currentUser,
                    created_at: new Date().toISOString(),
                    status: ORDER_STATUS.EN_ATTENTE,
                    sms_sent_to_customer: false
                };
                if (geoResult) {
                    orderData.lat = geoResult.lat;
                    orderData.lon = geoResult.lon;
                }
                
                const { error } = await supabase
                    .from('orders')
                    .insert([orderData]);
                if (!error) {
                    customerName.value = '';
                    if (customerPhone) customerPhone.value = '';
                    customerAddr.value = '';
                    await loadOrders();
                }
            });

            cancelEditOrderBtn.addEventListener('click', () => {
                editOrderModal.style.display = 'none';
                currentEditOrderId = null;
            });

            saveEditOrderBtn.addEventListener('click', async () => {
                if (!currentEditOrderId) return;
                const customer = editOrderCustomer.value.trim();
                const phone = editOrderPhone?.value.trim() || '';
                const addr = editOrderAddr.value.trim();
                const driver = editOrderDriver.value;
                if (!customer || !addr || !driver) {
                    alert('Champs requis');
                    return;
                }
                
                const geoResult = await geocodeAddress(addr);
                
                const updateData = {
                    customer_name: customer,
                    phone: phone || null,
                    destination: addr,
                    driver: driver
                };
                
                if (geoResult) {
                    updateData.lat = geoResult.lat;
                    updateData.lon = geoResult.lon;
                }
                
                const { error } = await supabase
                    .from('orders')
                    .update(updateData)
                    .eq('id', currentEditOrderId);
                if (!error) {
                    editOrderModal.style.display = 'none';
                    currentEditOrderId = null;
                    await loadOrders();
                }
            });

            async function loadTasks() {
                try {
                    let query = supabase
                        .from('tasks')
                        .select('*')
                        .order('created_at', { ascending: false });
                    
                    if (!hasFullAccess() && !isResponsable()) {
                        query = query.eq('assigned_to', currentUser);
                    }
                    
                    const { data, error } = await query;
                    if (data) renderTasks(data);
                } catch (e) {
                    console.error('loadTasks异常:', e);
                }
            }

       function renderTasks(tasks) {
    // 更新标签页红色数字
    var tabBtn = document.getElementById('tasksTabBtn');
    if (tabBtn) {
        var pendingCount = 0;
        for (var i = 0; i < tasks.length; i++) {
            if (!tasks[i].completed) pendingCount++;
        }
        var oldBadge = tabBtn.querySelector('.task-badge');
        if (pendingCount > 0) {
            if (oldBadge) {
                oldBadge.textContent = pendingCount;
            } else {
                var b = document.createElement('span');
                b.className = 'task-badge';
                b.textContent = pendingCount;
                tabBtn.appendChild(b);
            }
        } else if (oldBadge) {
            oldBadge.remove();
        }
    }
    
    // 分离已完成和未完成
    var pending = [];
    var done = [];
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].completed) {
            done.push(tasks[i]);
        } else {
            pending.push(tasks[i]);
        }
    }
    
    // 计算逾期天数（超过1天）并排序
    for (var i = 0; i < pending.length; i++) {
        var t = pending[i];
        var days = 0;
        if (t.created_at) {
            var created = new Date(t.created_at);
            var now = new Date();
            days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        }
        t._overdue = days > 1 ? days : 0;
    }
    pending.sort(function(a, b) { return b._overdue - a._overdue; });
    
    var html = '';
    
    // 未完成任务组
    html += '<div style="margin-bottom:15px;">';
    html += '<div onclick="var c=this.nextElementSibling;if(c.style.display===\'none\'){c.style.display=\'block\';this.querySelector(\'.toggle-icon\').innerHTML=\'▼\'}else{c.style.display=\'none\';this.querySelector(\'.toggle-icon\').innerHTML=\'▶\'}" style="background:#eef2f7;padding:10px 15px;border-radius:16px;cursor:pointer;display:flex;justify-content:space-between;">';
    html += '<strong>⏳ En cours (' + pending.length + ')</strong>';
    html += '<span class="toggle-icon">▼</span></div>';
    html += '<div style="padding-left:10px;display:block;">';
    if (pending.length === 0) {
        html += '<p>Aucune tâche en cours</p>';
    } else {
        for (var i = 0; i < pending.length; i++) {
            var t = pending[i];
            var overdueHtml = '';
            var cardStyle = '';
            if (t._overdue > 0) {
                cardStyle = 'background:#ffebee;border-left:6px solid #f44336;';
                overdueHtml = '<span style="background:#f44336;color:white;padding:2px 8px;border-radius:20px;font-size:0.7rem;margin-left:8px;">⚠️ Retard: ' + t._overdue + ' jour' + (t._overdue > 1 ? 's' : '') + '</span>';
            }
            var canComplete = !t.completed && t.assigned_to === currentUser;
            var canEdit = !t.completed && (hasFullAccess() || (isResponsable() && t.created_by === currentUser));
            var acts = '';
            if (canComplete) acts += '<button class="btn-validate" onclick="completeTask(\'' + t.id + '\')">✅ Fait</button>';
            if (canEdit) acts += '<button class="btn-edit" onclick="editTask(\'' + t.id + '\')">✏️</button><button class="btn-delete" onclick="deleteTask(\'' + t.id + '\')">🗑️</button>';
            var createdByText = t.created_by === currentUser ? '👤 Moi' : '👤 ' + escapeHtml(t.created_by);
            html += '<div class="task-card" style="' + cardStyle + 'margin:10px 0;padding:15px;border:1px solid #c7daf0;border-radius:20px;">';
            html += '<div class="item-header"><span class="customer-name">' + escapeHtml(t.description) + overdueHtml + '</span><span class="status-badge todo">⏳ En cours</span></div>';
            html += '<div class="order-meta"><span>👤 Assigné: ' + escapeHtml(t.assigned_to) + '</span><span>📅 Créé par: ' + createdByText + ' ' + formatDateTime(t.created_at) + '</span></div>';
            html += '<div class="order-actions">' + acts + '</div></div>';
        }
    }
    html += '</div></div>';
    
    // 已完成任务组
    html += '<div>';
    html += '<div onclick="var c=this.nextElementSibling;if(c.style.display===\'none\'){c.style.display=\'block\';this.querySelector(\'.toggle-icon\').innerHTML=\'▼\'}else{c.style.display=\'none\';this.querySelector(\'.toggle-icon\').innerHTML=\'▶\'}" style="background:#eef2f7;padding:10px 15px;border-radius:16px;cursor:pointer;display:flex;justify-content:space-between;">';
    html += '<strong>✅ Terminées (' + done.length + ')</strong>';
    html += '<span class="toggle-icon">▼</span></div>';
    html += '<div style="padding-left:10px;display:block;">';
    if (done.length === 0) {
        html += '<p>Aucune tâche terminée</p>';
    } else {
        for (var i = 0; i < done.length; i++) {
            var t = done[i];
            var createdByText = t.created_by === currentUser ? '👤 Moi' : '👤 ' + escapeHtml(t.created_by);
            html += '<div class="task-card completed" style="background:#e8f5e9;border-left:6px solid #4caf50;margin:10px 0;padding:15px;border:1px solid #c7daf0;border-radius:20px;">';
            html += '<div class="item-header"><span class="customer-name">' + escapeHtml(t.description) + '</span><span class="status-badge done">✅ Fait</span></div>';
            html += '<div class="order-meta"><span>👤 Assigné: ' + escapeHtml(t.assigned_to) + '</span><span>📅 Créé par: ' + createdByText + ' ' + formatDateTime(t.created_at) + '</span>';
            if (t.completed_at) html += '<span>✅ Complété par: ' + escapeHtml(t.completed_by) + ' ' + formatDateTime(t.completed_at) + '</span>';
            html += '</div></div>';
        }
    }
    html += '</div></div>';
    
    tasksList.innerHTML = html;
}

            addTaskBtn.addEventListener('click', async () => {
                if (!hasFullAccess() && !isResponsable()) return;
                
                const description = taskDescription.value.trim();
                const assignee = taskAssignee.value;
                if (!description || !assignee) return alert('Champs requis');
                
                const confirmed = await showConfirm('Ajouter', `Créer pour ${assignee} ?`);
                if (!confirmed) return;
                
                const { error } = await supabase
                    .from('tasks')
                    .insert([{
                        description: description,
                        assigned_to: assignee,
                        created_by: currentUser,
                        created_at: new Date().toISOString(),
                        completed: false
                    }]);
                if (!error) {
                    taskDescription.value = '';
                    taskAssignee.value = '';
                    await loadTasks();
                }
            });

            cancelEditTaskBtn.addEventListener('click', () => {
                editTaskModal.style.display = 'none';
                currentEditTaskId = null;
            });

            saveEditTaskBtn.addEventListener('click', async () => {
                if (!currentEditTaskId) return;
                const description = editTaskDescription.value.trim();
                const assignee = editTaskAssignee.value;
                if (!description || !assignee) {
                    alert('Champs requis');
                    return;
                }
                const { error } = await supabase
                    .from('tasks')
                    .update({
                        description: description,
                        assigned_to: assignee
                    })
                    .eq('id', currentEditTaskId);
                if (!error) {
                    editTaskModal.style.display = 'none';
                    currentEditTaskId = null;
                    await loadTasks();
                }
            });

            async function loadTransports() {
                if (isChauffeur()) return;
                try {
                    const { data, error } = await supabase
                        .from('transports')
                        .select('*')
                        .order('created_at', { ascending: false });
                    if (data) renderTransports(data);
                } catch (e) {
                    console.error('loadTransports异常:', e);
                }
            }

            function renderTransports(transports) {
                let html = '';
                if (transports.length === 0) {
                    html = '<p>Aucun transport</p>';
                } else {
                    transports.forEach(transport => {
                        const isDeparted = transport.departed;
                        
                        const canEdit = !isDeparted && hasFullAccess();
                        const canMarkDepart = !isDeparted && (hasFullAccess() || isPreparateur());
                        
                        let paletteInfo = '';
                        if (transport.palette_rendu !== null) {
                            if (transport.palette_rendu) {
                                paletteInfo = '<div class="palette-info" style="background: #c8e6c9;">✅ Toutes les palettes rendues</div>';
                            } else {
                                paletteInfo = '<div class="palette-info" style="background: #ffcdd2;">';
                                if (transport.palette_count_euro > 0) {
                                    paletteInfo += `<div class="palette-detail"><span class="palette-type">🇪🇺 Europe:</span> <span class="palette-value">${transport.palette_count_euro}</span></div>`;
                                }
                                if (transport.palette_count > 0) {
                                    paletteInfo += `<div class="palette-detail"><span class="palette-type">📏 Standard:</span> <span class="palette-value">${transport.palette_count}</span></div>`;
                                }
                                paletteInfo += '</div>';
                            }
                        } else if (transport.palette_count > 0 || transport.palette_count_euro > 0) {
                            paletteInfo = '<div class="palette-info">';
                            if (transport.palette_count_euro > 0) {
                                paletteInfo += `<div class="palette-detail"><span class="palette-type">🇪🇺 Europe:</span> <span class="palette-value">${transport.palette_count_euro}</span></div>`;
                            }
                            if (transport.palette_count > 0) {
                                paletteInfo += `<div class="palette-detail"><span class="palette-type">📏 Standard:</span> <span class="palette-value">${transport.palette_count}</span></div>`;
                            }
                            paletteInfo += '</div>';
                        }
                        
                        html += `
                            <div class="transport-card ${isDeparted ? 'departed' : ''}">
                                <div class="item-header">
                                    <span class="customer-name">${escapeHtml(transport.company)} - ${escapeHtml(transport.customer)}</span>
                                    <span class="status-badge ${isDeparted ? 'done' : 'todo'}">${isDeparted ? '✅ Parti' : '⏳ En attente'}</span>
                                </div>
                                <div class="order-meta">
                                    <span>📋 Réf: ${escapeHtml(transport.reference || '-')}</span>
                                    <span>📅 ${escapeHtml(transport.created_by)} ${formatDateTime(transport.created_at)}</span>
                                    ${transport.departed_at ? `<span>🚚 ${escapeHtml(transport.departed_by)} ${formatDateTime(transport.departed_at)}</span>` : ''}
                                </div>
                                ${paletteInfo}
                                <div class="order-actions">
                                    ${canMarkDepart ? `<button class="btn-validate" onclick="departTransport('${transport.id}')">🚚 Partir</button>` : ''}
                                    ${canEdit ? `<button class="btn-edit" onclick="editTransport('${transport.id}')">✏️</button>` : ''}
                                    ${canEdit ? `<button class="btn-delete" onclick="deleteTransport('${transport.id}')">🗑️</button>` : ''}
                                </div>
                            </div>
                        `;
                    });
                }
                transportsList.innerHTML = html;
            }

            addTransportBtn.addEventListener('click', async () => {
                if (!hasFullAccess() && !isPreparateur()) return;
                
                const company = transportCompany.value;
                const customer = transportCustomer.value.trim();
                const reference = transportReference.value.trim();
                const paletteCount = parseInt(transportPaletteCount.value) || 0;
                
                if (!customer) return alert('Nom client requis');
                
                const confirmed = await showConfirm('Ajouter', `Créer pour ${customer} ?`);
                if (!confirmed) return;
                
                const { error } = await supabase
                    .from('transports')
                    .insert([{
                        company: company,
                        customer: customer,
                        reference: reference,
                        palette_count: paletteCount,
                        created_by: currentUser,
                        created_at: new Date().toISOString(),
                        departed: false
                    }]);
                if (!error) {
                    transportCustomer.value = '';
                    transportReference.value = '';
                    transportPaletteCount.value = '0';
                    await loadTransports();
                }
            });

            cancelEditTransportBtn.addEventListener('click', () => {
                editTransportModal.style.display = 'none';
                currentTransportId = null;
            });

            saveEditTransportBtn.addEventListener('click', async () => {
                if (!hasFullAccess() || !currentTransportId) return;
                const { error } = await supabase
                    .from('transports')
                    .update({
                        company: editTransportCompany.value,
                        customer: editTransportCustomer.value.trim(),
                        reference: editTransportReference.value.trim(),
                        palette_count: parseInt(editTransportPaletteCount.value) || 0
                    })
                    .eq('id', currentTransportId);
                if (!error) {
                    editTransportModal.style.display = 'none';
                    currentTransportId = null;
                    await loadTransports();
                }
            });

            function initSignaturePad() {
                signaturePad = new SignaturePad(signatureCanvas, {
                    backgroundColor: 'rgb(255,255,255)',
                    penColor: 'rgb(0,0,0)'
                });
                function resizeCanvas() {
                    const ratio = Math.max(window.devicePixelRatio || 1, 1);
                    signatureCanvas.width = signatureCanvas.offsetWidth * ratio;
                    signatureCanvas.height = signatureCanvas.offsetHeight * ratio;
                    signatureCanvas.getContext("2d").scale(ratio, ratio);
                    signaturePad.clear();
                }
                resizeCanvas();
                window.addEventListener('resize', resizeCanvas);
            }

            clearSignatureBtn.addEventListener('click', () => signaturePad?.clear());
            cancelSignatureBtn.addEventListener('click', () => {
                signatureModal.style.display = 'none';
                currentOrderId = null;
                signaturePad?.clear();
            });

            saveSignatureBtn.addEventListener('click', async () => {
                if (!currentOrderId || !signaturePad || signaturePad.isEmpty()) {
                    alert('Signez svp');
                    return;
                }
                
                const confirmed = await showConfirm('Valider', 'Confirmer la livraison ?');
                if (!confirmed) return;
                
                const signatureData = signaturePad.toDataURL();
                const { error } = await supabase
                    .from('orders')
                    .update({
                        status: ORDER_STATUS.LIVRE,
                        delivered_at: new Date().toISOString(),
                        signature: signatureData
                    })
                    .eq('id', currentOrderId);
                    
                if (!error) {
                    allNonDeliveredOrders = allNonDeliveredOrders.filter(o => o.id !== currentOrderId);
                    
                    signatureModal.style.display = 'none';
                    currentOrderId = null;
                    signaturePad.clear();
                    await loadOrders();
                }
            });

            function getTimeValue() {
                const type = timeType.value;
                if (type === 'fixed') {
                    const fixed = document.getElementById('fixedTime');
                    return { type: 'fixed', value: fixed ? fixed.value : '10:00' };
                } else if (type === 'before') {
                    const before = document.getElementById('beforeTime');
                    return { type: 'before', value: before ? before.value : '18:00' };
                } else if (type === 'range') {
                    const start = document.getElementById('rangeStart');
                    const end = document.getElementById('rangeEnd');
                    return { type: 'range', value: { start: start?.value || '09:00', end: end?.value || '17:00' } };
                } else {
                    return { type: 'free', value: null };
                }
            }

            function formatTimeRequirement(order) {
                if (!order.time_req) return 'Libre';
                try {
                    if (order.time_req.type === 'fixed') return `Fixé à ${order.time_req.value}`;
                    if (order.time_req.type === 'before') return `Avant ${order.time_req.value}`;
                    if (order.time_req.type === 'range') return `${order.time_req.value.start} - ${order.time_req.value.end}`;
                } catch (e) {
                    console.error('时间格式化错误:', e);
                }
                return 'Libre';
            }

            function formatDateTime(timestamp) {
                if (!timestamp) return '';
                const date = new Date(timestamp);
                return date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            }

            function escapeHtml(unsafe) {
                if (!unsafe) return '';
                return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
            }

            function setDefaultDate() {
                const today = new Date().toISOString().split('T')[0];
                if (inputDatePicker) inputDatePicker.value = today;
            }

            function renderTimeInput() {
                const type = timeType.value;
                if (type === 'fixed') {
                    timeInputContainer.innerHTML = `<input type="time" id="fixedTime" value="10:00" style="width:100%; padding:14px; border-radius:24px; border:1px solid #b9cfe6;">`;
                } else if (type === 'before') {
                    timeInputContainer.innerHTML = `<input type="time" id="beforeTime" value="18:00" style="width:100%; padding:14px; border-radius:24px; border:1px solid #b9cfe6;"><span style="margin-left:10px;">avant</span>`;
                } else if (type === 'range') {
                    timeInputContainer.innerHTML = `<div style="display:flex; gap:5px;"><input type="time" id="rangeStart" value="09:00" style="flex:1; padding:14px; border-radius:24px; border:1px solid #b9cfe6;"><span> - </span><input type="time" id="rangeEnd" value="17:00" style="flex:1; padding:14px; border-radius:24px; border:1px solid #b9cfe6;"></div>`;
                } else {
                    timeInputContainer.innerHTML = `<span>Libre</span>`;
                }
            }

            if (timeType) timeType.addEventListener('change', renderTimeInput);

            inputDatePicker.addEventListener('change', (e) => {
                currentDate = e.target.value;
                loadOrders();
            });

            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
                });
            });

            setDefaultDate();
            if (timeType) renderTimeInput();

            // ==================== 初始化 ====================
            const isAdminUser = isAdmin();
            const isManagerUser = isManager();
            const isSecretaireUser = isSecretaire();
            const isPreparateurUser = isPreparateur();
            const isChauffeurUser = isChauffeur();
            const isResponsableUser = isResponsable();

            const hasAdminRights = hasFullAccess();

            // 用户管理部分
            if (hasAdminRights) {
                console.log('显示用户管理部分');
                adminSection.style.display = 'block';
                loadUsers();
            } else {
                adminSection.style.display = 'none';
            }
            
            // 管理员司机下拉菜单
            if (hasAdminRights) {
                loadAdminDrivers();
                adminDriverSelector.style.display = 'block';
            } else {
                adminDriverSelector.style.display = 'none';
            }

            // 地图和路线面板
            if (isChauffeurUser || hasAdminRights) {
                mapContainer.style.display = 'block';
                routePanel.style.display = 'block';
            }

            // 添加订单部分
            addOrderSection.style.display = hasAdminRights ? 'block' : 'none';
            geocodeAllBtn.style.display = hasAdminRights ? 'block' : 'none';

            // 加载数据
            Promise.all([
                loadDrivers(),
                loadOrders()
            ]).then(() => {
                console.log('司机和订单加载完成');
                if (isChauffeurUser) {
                    supabase
                        .from('orders')
                        .select('*')
                        .eq('date', currentDate)
                        .eq('driver', currentUser)
                        .neq('status', ORDER_STATUS.LIVRE)
                        .then(({ data }) => {
                            allNonDeliveredOrders = data || [];
                        });
                }
            }).catch(error => {
                console.error('数据加载错误:', error);
            });

            // 任务部分
            addTaskSection.style.display = (hasAdminRights || isResponsableUser) ? 'block' : 'none';
            loadTaskAssignees();
            loadTasks();

            // 运输部分
            addTransportSection.style.display = (hasAdminRights || isPreparateurUser) ? 'block' : 'none';
            if (!isChauffeurUser) {
                loadTransports();
            } else {
                const transportTab = document.querySelector('[data-tab="transports"]');
                if (transportTab) transportTab.style.display = 'none';
            }

            // 初始化地图
            setTimeout(initMap, 100);
                        // 获取仓库精确坐标
            updateDepotCoordinates();

            console.log('应用初始化完成，当前用户:', currentUser, '类型:', currentUserType);
     
// ==================== 新增功能 ====================

// 功能1：订单按司机折叠
var oldRender = renderOrdersGroupedByDriver;
renderOrdersGroupedByDriver = function(orders) {
    var byDriver = {};
    orders.forEach(function(o) { byDriver[o.driver] = byDriver[o.driver] || []; byDriver[o.driver].push(o); });
    var html = '';
    for (var d in byDriver) {
        var id = 'fold_' + d.replace(/[^a-zA-Z0-9]/g, '_');
        html += '<div style="margin-bottom:20px;">';
        html += '<div onclick="var el=document.getElementById(\''+id+'\');if(el.style.display===\'none\'){el.style.display=\'block\';this.querySelector(\'.toggle-icon\').innerHTML=\'▼\'}else{el.style.display=\'none\';this.querySelector(\'.toggle-icon\').innerHTML=\'▶\'}" style="background:#eef2f7;padding:10px 15px;border-radius:16px;cursor:pointer;display:flex;justify-content:space-between;">';
        html += '<strong>👤 '+escapeHtml(d)+' ('+byDriver[d].length+')</strong>';
        html += '<span class="toggle-icon">▼</span></div>';
        html += '<div id="'+id+'" style="padding-left:10px;display:block;">';
        byDriver[d].forEach(function(o) { html += renderOrderItem(o); });
        html += '</div></div>';
    }
    ordersByDriver.innerHTML = html;
};

// 功能2：用户列表折叠（只折叠表格，保留添加表单）
// 功能2：用户列表折叠（保留所有功能，只添加折叠）
if (adminSection && !adminSection.querySelector('.user-fold-header')) {
    // 保存原始内容
    var h3Element = adminSection.querySelector('h3');
    var addFormElement = adminSection.querySelector('.add-user-form');
    var tableElement = adminSection.querySelector('.users-table');
    
    if (h3Element && addFormElement && tableElement) {
        // 创建折叠头
        var headerDiv = document.createElement('div');
        headerDiv.className = 'user-fold-header';
        headerDiv.style.cssText = 'background:#eef2f7;padding:10px 15px;border-radius:16px;cursor:pointer;display:flex;justify-content:space-between;margin-bottom:10px;';
        headerDiv.innerHTML = '<strong>👥 Gestion des utilisateurs</strong><span class="toggle-icon">▼</span>';
        
        // 内容容器
        var contentDiv = document.createElement('div');
        contentDiv.id = 'userTableFoldContent';
        contentDiv.style.display = 'block';
        
        // 移动元素到内容容器（不是复制，是移动）
        adminSection.removeChild(h3Element);
        adminSection.removeChild(addFormElement);
        adminSection.removeChild(tableElement);
        
        contentDiv.appendChild(h3Element);
        contentDiv.appendChild(addFormElement);
        contentDiv.appendChild(tableElement);
        
        // 清空并重新构建
        adminSection.innerHTML = '';
        adminSection.appendChild(headerDiv);
        adminSection.appendChild(contentDiv);
        
        // 重新绑定折叠事件
        headerDiv.onclick = function() {
            var content = this.nextElementSibling;
            if (content.style.display === 'none') {
                content.style.display = 'block';
                this.querySelector('.toggle-icon').innerHTML = '▼';
            } else {
                content.style.display = 'none';
                this.querySelector('.toggle-icon').innerHTML = '▶';
            }
        };
    }
}

// 功能3：任务逾期排序 + 红色数字 + 红绿背景
var oldRenderTasks = renderTasks;
renderTasks = function(tasks) {
    // 更新标签页红色数字
    var tabBtn = document.getElementById('tasksTabBtn');
    if (tabBtn) {
        var pendingCount = 0;
        for (var i = 0; i < tasks.length; i++) {
            if (!tasks[i].completed) pendingCount++;
        }
        var oldBadge = tabBtn.querySelector('.task-badge');
        if (pendingCount > 0) {
            if (oldBadge) {
                oldBadge.textContent = pendingCount;
            } else {
                var b = document.createElement('span');
                b.className = 'task-badge';
                b.textContent = pendingCount;
                tabBtn.appendChild(b);
            }
        } else if (oldBadge) {
            oldBadge.remove();
        }
    }
    
    // 分离已完成和未完成
    var pending = [];
    var done = [];
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].completed) {
            done.push(tasks[i]);
        } else {
            pending.push(tasks[i]);
        }
    }
    
    // 计算逾期天数（超过1天）并排序
    for (var i = 0; i < pending.length; i++) {
        var t = pending[i];
        var days = 0;
        if (t.created_at) {
            var created = new Date(t.created_at);
            var now = new Date();
            days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        }
        t._overdue = days > 1 ? days : 0;
    }
    pending.sort(function(a, b) { return b._overdue - a._overdue; });
    
    var html = '';
    
    // 未完成任务组
    html += '<div style="margin-bottom:15px;">';
    html += '<div onclick="var c=this.nextElementSibling;if(c.style.display===\'none\'){c.style.display=\'block\';this.querySelector(\'.toggle-icon\').innerHTML=\'▼\'}else{c.style.display=\'none\';this.querySelector(\'.toggle-icon\').innerHTML=\'▶\'}" style="background:#eef2f7;padding:10px 15px;border-radius:16px;cursor:pointer;display:flex;justify-content:space-between;">';
    html += '<strong>⏳ En cours (' + pending.length + ')</strong>';
    html += '<span class="toggle-icon">▼</span></div>';
    html += '<div style="padding-left:10px;display:block;">';
    if (pending.length === 0) {
        html += '<p>Aucune tâche en cours</p>';
    } else {
        for (var i = 0; i < pending.length; i++) {
            var t = pending[i];
            var overdueHtml = '';
            var cardStyle = '';
            if (t._overdue > 0) {
                cardStyle = 'background:#ffebee;border-left:6px solid #f44336;';
                overdueHtml = '<span style="background:#f44336;color:white;padding:2px 8px;border-radius:20px;font-size:0.7rem;margin-left:8px;">⚠️ Retard: ' + t._overdue + ' jour' + (t._overdue > 1 ? 's' : '') + '</span>';
            }
            var canComplete = !t.completed && t.assigned_to === currentUser;
            var canEdit = !t.completed && (hasFullAccess() || (isResponsable() && t.created_by === currentUser));
            var acts = '';
            if (canComplete) acts += '<button class="btn-validate" onclick="completeTask(\'' + t.id + '\')">✅ Fait</button>';
            if (canEdit) acts += '<button class="btn-edit" onclick="editTask(\'' + t.id + '\')">✏️</button><button class="btn-delete" onclick="deleteTask(\'' + t.id + '\')">🗑️</button>';
            var createdByText = t.created_by === currentUser ? '👤 Moi' : '👤 ' + escapeHtml(t.created_by);
            html += '<div class="task-card" style="' + cardStyle + 'margin:10px 0;padding:15px;border:1px solid #c7daf0;border-radius:20px;">';
            html += '<div class="item-header"><span class="customer-name">' + escapeHtml(t.description) + overdueHtml + '</span><span class="status-badge todo">⏳ En cours</span></div>';
            html += '<div class="order-meta"><span>👤 Assigné: ' + escapeHtml(t.assigned_to) + '</span><span>📅 Créé par: ' + createdByText + ' ' + formatDateTime(t.created_at) + '</span></div>';
            html += '<div class="order-actions">' + acts + '</div></div>';
        }
    }
    html += '</div></div>';
    
    // 已完成任务组（绿色背景）
    html += '<div>';
    html += '<div onclick="var c=this.nextElementSibling;if(c.style.display===\'none\'){c.style.display=\'block\';this.querySelector(\'.toggle-icon\').innerHTML=\'▼\'}else{c.style.display=\'none\';this.querySelector(\'.toggle-icon\').innerHTML=\'▶\'}" style="background:#eef2f7;padding:10px 15px;border-radius:16px;cursor:pointer;display:flex;justify-content:space-between;">';
    html += '<strong>✅ Terminées (' + done.length + ')</strong>';
    html += '<span class="toggle-icon">▼</span></div>';
    html += '<div style="padding-left:10px;display:block;">';
    if (done.length === 0) {
        html += '<p>Aucune tâche terminée</p>';
    } else {
        for (var i = 0; i < done.length; i++) {
            var t = done[i];
            var createdByText = t.created_by === currentUser ? '👤 Moi' : '👤 ' + escapeHtml(t.created_by);
            html += '<div class="task-card completed" style="background:#e8f5e9;border-left:6px solid #4caf50;margin:10px 0;padding:15px;border:1px solid #c7daf0;border-radius:20px;">';
            html += '<div class="item-header"><span class="customer-name">' + escapeHtml(t.description) + '</span><span class="status-badge done">✅ Fait</span></div>';
            html += '<div class="order-meta"><span>👤 Assigné: ' + escapeHtml(t.assigned_to) + '</span><span>📅 Créé par: ' + createdByText + ' ' + formatDateTime(t.created_at) + '</span>';
            if (t.completed_at) html += '<span>✅ Complété par: ' + escapeHtml(t.completed_by) + ' ' + formatDateTime(t.completed_at) + '</span>';
            html += '</div></div>';
        }
    }
    html += '</div></div>';
    
    tasksList.innerHTML = html;
};
   })();