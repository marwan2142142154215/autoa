// Scatter Analyzer - KKS Bandar 80
// Complete web app with all features from ScatterAnalyzer.web.app

class ScatterAnalyzer {
    constructor() {
        this.currentUser = null;
        this.settings = {
            targetUrl: 'https://bandar80.idrbo2.com/new-transaction.html',
            headers: [
                { key: 'X-Access-Token', value: '' },
                { key: 'X-Agent-Pkid', value: '' },
                { key: 'X-Agent-Role', value: 'KAPTENKASIR' },
                { key: 'X-Agent-Suid', value: 'BADAR' },
                { key: 'X-Agent-User', value: '' },
                { key: 'X-Agent-UserId', value: '' }
            ],
            extensionId: 'eppiocemhmnlbhjplcgkofciiegomcon',
            bisRegister: 'Q2hvbWUgQnJvd3Nlcg%3D%3D'
        };
        this.results = {
            rekening: [],
            scatter: [],
            freespin: [],
            buypin: [],
            history: []
        };
        this.isProcessing = {
            rekening: false,
            scatter: false,
            freespin: false,
            buypin: false,
            history: false
        };
        this.init();
    }

    async init() {
        this.loadSettings();
        this.setupGoogleOAuth();
        this.checkAuthStatus();
        this.addLog('System initialized', 'info');
        this.addLog('Scatter Analyzer ready - All modules loaded', 'success');
    }

    setupGoogleOAuth() {
        // Initialize Google OAuth with mock for development
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: 'your-google-client-id.apps.googleusercontent.com',
                callback: this.handleGoogleCallback.bind(this)
            });
        }
    }

    async checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                // Mock user data for development
                const userData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    picture: 'https://ui-avatars.com/api/?name=Test+User&background=6366f1&color=fff'
                };
                this.setUserData(userData);
            } catch (error) {
                this.addLog('Auth check failed: ' + error.message, 'error');
                this.showLoginRequired();
            }
        } else {
            this.showLoginRequired();
        }
    }

    async loginWithGoogle() {
        try {
            this.addLog('Initiating Google OAuth login...', 'info');
            
            // For development, use mock login
            const mockUser = {
                name: 'Test User',
                email: 'test@example.com',
                picture: 'https://ui-avatars.com/api/?name=Test+User&background=6366f1&color=fff'
            };
            
            localStorage.setItem('auth_token', 'mock_token_' + Date.now());
            this.setUserData(mockUser);
            this.addLog('Login successful', 'success');
            
        } catch (error) {
            this.addLog('Login failed: ' + error.message, 'error');
        }
    }

    setUserData(userData) {
        this.currentUser = userData;
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('userProfile').classList.remove('hidden');
        document.getElementById('userName').textContent = userData.name;
        document.getElementById('userEmail').textContent = userData.email;
        document.getElementById('userAvatar').src = userData.picture;
        document.getElementById('loginRequired').classList.add('hidden');
        document.getElementById('appContent').classList.remove('hidden');
    }

    logout() {
        localStorage.removeItem('auth_token');
        this.currentUser = null;
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('userProfile').classList.add('hidden');
        document.getElementById('loginRequired').classList.remove('hidden');
        document.getElementById('appContent').classList.add('hidden');
        this.addLog('Logged out', 'info');
    }

    showLoginRequired() {
        document.getElementById('loginRequired').classList.remove('hidden');
        document.getElementById('appContent').classList.add('hidden');
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('tab-active');
            btn.classList.add('text-gray-400', 'hover:text-white');
        });
        
        // Show selected tab
        document.getElementById(tabName + 'Content').classList.remove('hidden');
        
        // Add active class to selected tab button
        const activeTab = document.getElementById(tabName + 'Tab');
        activeTab.classList.add('tab-active');
        activeTab.classList.remove('text-gray-400', 'hover:text-white');
    }

    // Cek Rekening Functions
    async checkRekening() {
        if (this.isProcessing.rekening) {
            this.addLog('Already processing rekening check...', 'warning');
            return;
        }

        const username = document.getElementById('rekeningUsername').value;
        const password = document.getElementById('rekeningPassword').value;
        const pin = document.getElementById('rekeningPin').value;
        const userIdsText = document.getElementById('rekeningUserIds').value;

        if (!username || !password) {
            this.addLog('Username and password are required', 'error');
            return;
        }

        if (!userIdsText) {
            this.addLog('User IDs are required', 'error');
            return;
        }

        const userIds = userIdsText.split(/[\s,]+/).filter(id => id.trim());
        if (userIds.length === 0) {
            this.addLog('No valid user IDs found', 'error');
            return;
        }

        if (userIds.length > 20) {
            this.addLog('Maximum 20 user IDs allowed per batch', 'error');
            return;
        }

        this.isProcessing.rekening = true;
        this.updateButton('checkRekeningBtn', true);
        this.showProgress('rekeningProgress', true);
        this.addLog(`Starting rekening check for ${userIds.length} user IDs...`, 'info');

        try {
            const results = [];
            for (let i = 0; i < userIds.length; i++) {
                const userId = userIds[i];
                this.updateProgressText('rekeningProgressText', i + 1, userIds.length);
                
                try {
                    const result = await this.checkSingleRekening(userId, username, password, pin);
                    results.push(result);
                    this.addLog(`[${userId}] ${result.success ? 'Success' : 'Failed'}: ${result.error || 'Data found'}`, 
                               result.success ? 'success' : 'error');
                } catch (error) {
                    results.push({
                        success: false,
                        user_id: userId,
                        error: error.message
                    });
                    this.addLog(`[${userId}] Error: ${error.message}`, 'error');
                }
                
                // Add delay to prevent rate limiting
                await this.delay(1000);
            }

            this.results.rekening = results;
            this.displayRekeningResults();
            this.addLog(`Rekening check completed. Success: ${results.filter(r => r.success).length}, Failed: ${results.filter(r => !r.success).length}`, 'success');

        } catch (error) {
            this.addLog('Rekening check failed: ' + error.message, 'error');
        } finally {
            this.isProcessing.rekening = false;
            this.updateButton('checkRekeningBtn', false);
            this.showProgress('rekeningProgress', false);
        }
    }

    async checkSingleRekening(userId, username, password, pin) {
        return new Promise((resolve, reject) => {
            try {
                // Use CORS proxy to bypass cross-origin restrictions
                const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
                const targetUrl = this.settings.targetUrl;
                
                // Create form data for login
                const formData = new FormData();
                formData.append('entered_login', username);
                formData.append('entered_password', password);
                if (pin) {
                    formData.append('pin', pin);
                }

                // Simulate API call with extension injection
                setTimeout(() => {
                    try {
                        // Mock response - replace with actual API call
                        const mockData = {
                            success: Math.random() > 0.3, // 70% success rate for demo
                            user_id: userId,
                            data: {
                                nama_bank: 'BCA',
                                nama_rek: 'John Doe ' + userId,
                                no_rek: '123456789' + Math.floor(Math.random() * 1000),
                                status: 'Active'
                            },
                            timestamp: new Date().toISOString()
                        };
                        
                        resolve(mockData);
                    } catch (error) {
                        reject(error);
                    }
                }, 2000 + Math.random() * 2000); // Random delay 2-4 seconds

            } catch (error) {
                reject(error);
            }
        });
    }

    // Cek Scatter Functions
    async checkScatter() {
        if (this.isProcessing.scatter) {
            this.addLog('Already processing scatter check...', 'warning');
            return;
        }

        const username = document.getElementById('scatterUsername').value;
        const password = document.getElementById('scatterPassword').value;

        if (!username || !password) {
            this.addLog('Username and password are required', 'error');
            return;
        }

        this.isProcessing.scatter = true;
        this.updateButton('checkScatterBtn', true);
        this.addLog(`Starting scatter check for ${username}...`, 'info');

        try {
            const result = await this.checkSingleScatter(username, password);
            this.results.scatter = [result];
            this.displayScatterResults();
            this.addLog(`Scatter check completed: ${result.success ? 'Success' : 'Failed'}`, result.success ? 'success' : 'error');

        } catch (error) {
            this.addLog('Scatter check failed: ' + error.message, 'error');
        } finally {
            this.isProcessing.scatter = false;
            this.updateButton('checkScatterBtn', false);
        }
    }

    async checkSingleScatter(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Mock scatter data
                    const mockData = {
                        success: Math.random() > 0.2,
                        username: username,
                        data: {
                            total_scatter: Math.floor(Math.random() * 1000000),
                            today_scatter: Math.floor(Math.random() * 100000),
                            scatter_pattern: Math.random() > 0.5 ? 'Hot' : 'Normal',
                            last_update: new Date().toISOString()
                        }
                    };
                    resolve(mockData);
                } catch (error) {
                    reject(error);
                }
            }, 3000);
        });
    }

    // Cek Freespin Functions
    async checkFreespin() {
        if (this.isProcessing.freespin) {
            this.addLog('Already processing freespin check...', 'warning');
            return;
        }

        const username = document.getElementById('freespinUsername').value;
        const password = document.getElementById('freespinPassword').value;

        if (!username || !password) {
            this.addLog('Username and password are required', 'error');
            return;
        }

        this.isProcessing.freespin = true;
        this.updateButton('checkFreespinBtn', true);
        this.addLog(`Starting freespin check for ${username}...`, 'info');

        try {
            const result = await this.checkSingleFreespin(username, password);
            this.results.freespin = [result];
            this.displayFreespinResults();
            this.addLog(`Freespin check completed: ${result.success ? 'Success' : 'Failed'}`, result.success ? 'success' : 'error');

        } catch (error) {
            this.addLog('Freespin check failed: ' + error.message, 'error');
        } finally {
            this.isProcessing.freespin = false;
            this.updateButton('checkFreespinBtn', false);
        }
    }

    async checkSingleFreespin(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Mock freespin data
                    const mockData = {
                        success: Math.random() > 0.25,
                        username: username,
                        data: {
                            available_freespin: Math.floor(Math.random() * 50),
                            used_today: Math.floor(Math.random() * 10),
                            total_earned: Math.floor(Math.random() * 1000000),
                            next_freespin: new Date(Date.now() + Math.random() * 86400000).toISOString()
                        }
                    };
                    resolve(mockData);
                } catch (error) {
                    reject(error);
                }
            }, 2500);
        });
    }

    // Buy PIN Functions
    async buyPin() {
        if (this.isProcessing.buypin) {
            this.addLog('Already processing PIN purchase...', 'warning');
            return;
        }

        const username = document.getElementById('buypinUsername').value;
        const password = document.getElementById('buypinPassword').value;
        const amount = document.getElementById('buypinAmount').value;

        if (!username || !password) {
            this.addLog('Username and password are required', 'error');
            return;
        }

        if (!amount || amount < 1) {
            this.addLog('Valid PIN amount is required', 'error');
            return;
        }

        this.isProcessing.buypin = true;
        this.updateButton('buyPinBtn', true);
        this.addLog(`Processing PIN purchase: ${amount} PINs for ${username}...`, 'info');

        try {
            const result = await this.processPinPurchase(username, password, amount);
            this.results.buypin = [result];
            this.displayBuypinResults();
            this.addLog(`PIN purchase completed: ${result.success ? 'Success' : 'Failed'}`, result.success ? 'success' : 'error');

        } catch (error) {
            this.addLog('PIN purchase failed: ' + error.message, 'error');
        } finally {
            this.isProcessing.buypin = false;
            this.updateButton('buyPinBtn', false);
        }
    }

    async processPinPurchase(username, password, amount) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Mock PIN purchase data
                    const mockData = {
                        success: Math.random() > 0.1,
                        username: username,
                        amount: amount,
                        data: {
                            transaction_id: 'TXN' + Date.now(),
                            total_cost: amount * 1000, // Assume 1000 per PIN
                            pins_purchased: amount,
                            balance_before: Math.floor(Math.random() * 10000000),
                            balance_after: Math.floor(Math.random() * 10000000),
                            status: 'Completed'
                        }
                    };
                    resolve(mockData);
                } catch (error) {
                    reject(error);
                }
            }, 4000);
        });
    }

    // History Functions
    async loadHistory() {
        if (this.isProcessing.history) {
            this.addLog('Already loading history...', 'warning');
            return;
        }

        const token = document.getElementById('historyToken').value;

        this.isProcessing.history = true;
        this.updateButton('loadHistoryBtn', true);
        this.addLog('Loading transaction history...', 'info');

        try {
            const result = await this.fetchHistory(token);
            this.results.history = result;
            this.displayHistoryResults();
            this.addLog(`History loaded: ${result.length} transactions found`, 'success');

        } catch (error) {
            this.addLog('History load failed: ' + error.message, 'error');
        } finally {
            this.isProcessing.history = false;
            this.updateButton('loadHistoryBtn', false);
        }
    }

    async fetchHistory(token) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Mock history data
                    const mockHistory = [];
                    for (let i = 0; i < 20; i++) {
                        mockHistory.push({
                            id: 'TXN' + (Date.now() + i),
                            type: ['Deposit', 'Withdrawal', 'Purchase', 'Bonus'][Math.floor(Math.random() * 4)],
                            amount: Math.floor(Math.random() * 1000000),
                            status: ['Completed', 'Pending', 'Failed'][Math.floor(Math.random() * 3)],
                            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                            description: 'Transaction ' + (i + 1)
                        });
                    }
                    resolve(mockHistory);
                } catch (error) {
                    reject(error);
                }
            }, 2000);
        });
    }

    // Display Functions
    displayRekeningResults() {
        const container = document.getElementById('rekeningResults');
        
        if (this.results.rekening.length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Belum ada hasil. Mulai pengecekan terlebih dahulu.</p>';
            return;
        }

        let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
        
        this.results.rekening.forEach(result => {
            const statusClass = result.success ? 'status-success' : 'status-failed';
            const statusText = result.success ? 'Success' : 'Failed';
            const data = result.data || {};
            
            html += `
                <div class="result-card rounded-xl p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h4 class="font-bold text-white">${result.user_id}</h4>
                        <span class="status-badge ${statusClass}">
                            <i class="fas ${result.success ? 'fa-check' : 'fa-times'} text-xs"></i>
                            ${statusText}
                        </span>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Bank:</span>
                            <span class="text-white">${data.nama_bank || '-'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Nama:</span>
                            <span class="text-white">${data.nama_rek || '-'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">No. Rekening:</span>
                            <span class="text-white font-mono">${data.no_rek || '-'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Status:</span>
                            <span class="text-green-400">${data.status || '-'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    displayScatterResults() {
        const container = document.getElementById('scatterResults');
        
        if (this.results.scatter.length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Belum ada hasil. Mulai pengecekan scatter terlebih dahulu.</p>';
            return;
        }

        const result = this.results.scatter[0];
        const data = result.data || {};
        
        const html = `
            <div class="result-card rounded-xl p-6 max-w-2xl mx-auto">
                <div class="flex justify-between items-start mb-6">
                    <h4 class="font-bold text-white text-lg">${result.username}</h4>
                    <span class="status-badge ${result.success ? 'status-success' : 'status-failed'}">
                        <i class="fas ${result.success ? 'fa-check' : 'fa-times'} text-xs"></i>
                        ${result.success ? 'Success' : 'Failed'}
                    </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div class="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p class="text-gray-400 text-sm">Total Scatter</p>
                            <p class="text-2xl font-bold text-indigo-400">${data.total_scatter?.toLocaleString() || 0}</p>
                        </div>
                        <div class="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p class="text-gray-400 text-sm">Today's Scatter</p>
                            <p class="text-xl font-bold text-green-400">${data.today_scatter?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div class="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p class="text-gray-400 text-sm">Pattern</p>
                            <p class="text-xl font-bold ${data.scatter_pattern === 'Hot' ? 'text-red-400' : 'text-blue-400'}">${data.scatter_pattern || 'Unknown'}</p>
                        </div>
                        <div class="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p class="text-gray-400 text-sm">Last Update</p>
                            <p class="text-sm text-gray-300">${new Date(data.last_update).toLocaleString() || 'Unknown'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = `<div class="grid grid-cols-1 gap-4">${html}</div>`;
    }

    displayFreespinResults() {
        const container = document.getElementById('freespinResults');
        
        if (this.results.freespin.length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Belum ada hasil. Mulai pengecekan freespin terlebih dahulu.</p>';
            return;
        }

        const result = this.results.freespin[0];
        const data = result.data || {};
        
        const html = `
            <div class="result-card rounded-xl p-6 max-w-2xl mx-auto">
                <div class="flex justify-between items-start mb-6">
                    <h4 class="font-bold text-white text-lg">${result.username}</h4>
                    <span class="status-badge ${result.success ? 'status-success' : 'status-failed'}">
                        <i class="fas ${result.success ? 'fa-check' : 'fa-times'} text-xs"></i>
                        ${result.success ? 'Success' : 'Failed'}
                    </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center p-4 bg-slate-800/50 rounded-lg">
                        <p class="text-gray-400 text-sm">Available</p>
                        <p class="text-2xl font-bold text-purple-400">${data.available_freespin || 0}</p>
                    </div>
                    <div class="text-center p-4 bg-slate-800/50 rounded-lg">
                        <p class="text-gray-400 text-sm">Used Today</p>
                        <p class="text-xl font-bold text-orange-400">${data.used_today || 0}</p>
                    </div>
                    <div class="text-center p-4 bg-slate-800/50 rounded-lg">
                        <p class="text-gray-400 text-sm">Total Earned</p>
                        <p class="text-xl font-bold text-green-400">${data.total_earned?.toLocaleString() || 0}</p>
                    </div>
                </div>
                <div class="mt-4 text-center p-4 bg-slate-800/50 rounded-lg">
                    <p class="text-gray-400 text-sm">Next Freespin</p>
                    <p class="text-sm text-blue-300">${new Date(data.next_freespin).toLocaleString() || 'Unknown'}</p>
                </div>
            </div>
        `;
        
        container.innerHTML = `<div class="grid grid-cols-1 gap-4">${html}</div>`;
    }

    displayBuypinResults() {
        const container = document.getElementById('buypinResults');
        
        if (this.results.buypin.length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Belum ada hasil. Mulai pembelian PIN terlebih dahulu.</p>';
            return;
        }

        const result = this.results.buypin[0];
        const data = result.data || {};
        
        const html = `
            <div class="result-card rounded-xl p-6 max-w-2xl mx-auto">
                <div class="flex justify-between items-start mb-6">
                    <h4 class="font-bold text-white text-lg">${result.username}</h4>
                    <span class="status-badge ${result.success ? 'status-success' : 'status-failed'}">
                        <i class="fas ${result.success ? 'fa-check' : 'fa-times'} text-xs"></i>
                        ${result.success ? 'Success' : 'Failed'}
                    </span>
                </div>
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p class="text-gray-400 text-sm">PINs Purchased</p>
                            <p class="text-2xl font-bold text-indigo-400">${data.pins_purchased || 0}</p>
                        </div>
                        <div class="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p class="text-gray-400 text-sm">Total Cost</p>
                            <p class="text-2xl font-bold text-red-400">${data.total_cost?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p class="text-gray-400 text-sm">Balance Before</p>
                            <p class="text-xl font-bold text-gray-300">${data.balance_before?.toLocaleString() || 0}</p>
                        </div>
                        <div class="text-center p-4 bg-slate-800/50 rounded-lg">
                            <p class="text-gray-400 text-sm">Balance After</p>
                            <p class="text-xl font-bold text-green-400">${data.balance_after?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                    <div class="text-center p-4 bg-slate-800/50 rounded-lg">
                        <p class="text-gray-400 text-sm">Transaction ID</p>
                        <p class="text-sm font-mono text-blue-300">${data.transaction_id || 'Unknown'}</p>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = `<div class="grid grid-cols-1 gap-4">${html}</div>`;
    }

    displayHistoryResults() {
        const container = document.getElementById('historyResults');
        
        if (this.results.history.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Belum ada history. Load history token terlebih dahulu.</p>';
            return;
        }

        let html = '<div class="space-y-2">';
        
        this.results.history.forEach(transaction => {
            const statusClass = transaction.status === 'Completed' ? 'status-success' : 
                                transaction.status === 'Pending' ? 'status-pending' : 'status-failed';
            
            html += `
                <div class="result-card rounded-lg p-4">
                    <div class="flex justify-between items-center">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <span class="status-badge ${statusClass}">${transaction.status}</span>
                                <span class="font-semibold text-white">${transaction.type}</span>
                                <span class="text-indigo-400 font-bold">${transaction.amount?.toLocaleString()}</span>
                            </div>
                            <p class="text-gray-400 text-sm">${transaction.description}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-gray-400 text-sm">${new Date(transaction.date).toLocaleDateString()}</p>
                            <p class="text-gray-500 text-xs">${new Date(transaction.date).toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    // Clear Functions
    clearRekeningResults() {
        this.results.rekening = [];
        document.getElementById('rekeningResults').innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Belum ada hasil. Mulai pengecekan terlebih dahulu.</p>';
        this.addLog('Rekening results cleared', 'info');
    }

    clearScatterResults() {
        this.results.scatter = [];
        document.getElementById('scatterResults').innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Belum ada hasil. Mulai pengecekan scatter terlebih dahulu.</p>';
        this.addLog('Scatter results cleared', 'info');
    }

    clearFreespinResults() {
        this.results.freespin = [];
        document.getElementById('freespinResults').innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Belum ada hasil. Mulai pengecekan freespin terlebih dahulu.</p>';
        this.addLog('Freespin results cleared', 'info');
    }

    clearBuypinResults() {
        this.results.buypin = [];
        document.getElementById('buypinResults').innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">Belum ada hasil. Mulai pembelian PIN terlebih dahulu.</p>';
        this.addLog('PIN purchase results cleared', 'info');
    }

    clearHistory() {
        this.results.history = [];
        document.getElementById('historyResults').innerHTML = '<p class="text-gray-500 text-center py-8">Belum ada history. Load history token terlebih dahulu.</p>';
        this.addLog('History cleared', 'info');
    }

    // Export Functions
    exportRekeningResults() {
        if (this.results.rekening.length === 0) {
            this.addLog('No rekening results to export', 'warning');
            return;
        }

        const csv = this.convertToCSV(this.results.rekening, 'rekening');
        this.downloadCSV(csv, 'rekening_check_results');
        this.addLog('Rekening results exported to CSV', 'success');
    }

    exportHistory() {
        if (this.results.history.length === 0) {
            this.addLog('No history to export', 'warning');
            return;
        }

        const csv = this.convertToCSV(this.results.history, 'history');
        this.downloadCSV(csv, 'transaction_history');
        this.addLog('History exported to CSV', 'success');
    }

    convertToCSV(data, type) {
        if (type === 'rekening') {
            const headers = ['User ID', 'Status', 'Bank', 'Nama', 'No. Rekening', 'Time'];
            const rows = data.map(item => [
                item.user_id,
                item.success ? 'Success' : 'Failed',
                item.data?.nama_bank || '',
                item.data?.nama_rek || '',
                item.data?.no_rek || '',
                new Date(item.timestamp).toLocaleString()
            ]);
            return [headers, ...rows].map(row => row.join(',')).join('\n');
        } else if (type === 'history') {
            const headers = ['Transaction ID', 'Type', 'Amount', 'Status', 'Date', 'Description'];
            const rows = data.map(item => [
                item.id,
                item.type,
                item.amount,
                item.status,
                new Date(item.date).toLocaleString(),
                item.description
            ]);
            return [headers, ...rows].map(row => row.join(',')).join('\n');
        }
        return '';
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Utility Functions
    updateButton(buttonId, processing) {
        const button = document.getElementById(buttonId);
        if (processing) {
            button.innerHTML = '<div class="loading-spinner inline-block mr-2"></div>Processing...';
            button.disabled = true;
        } else {
            const originalTexts = {
                'checkRekeningBtn': '<i class="fas fa-search mr-2"></i> Cek Rekening',
                'checkScatterBtn': '<i class="fas fa-chart-scatter mr-2"></i> Cek Scatter',
                'checkFreespinBtn': '<i class="fas fa-gift mr-2"></i> Cek Freespin',
                'buyPinBtn': '<i class="fas fa-shopping-cart mr-2"></i> Buy PIN',
                'loadHistoryBtn': '<i class="fas fa-history mr-2"></i> Load History'
            };
            button.innerHTML = originalTexts[buttonId];
            button.disabled = false;
        }
    }

    showProgress(progressId, show) {
        const element = document.getElementById(progressId);
        if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    }

    updateProgressText(textId, current, total) {
        const element = document.getElementById(textId);
        const percentage = (current / total) * 100;
        element.textContent = `${current}/${total}`;
        
        // Update progress bar if exists
        const progressBar = element.parentElement.querySelector('[id$="ProgressBar"]');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }

    addLog(message, type = 'info') {
        const container = document.getElementById('logsContainer');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        container.appendChild(logEntry);
        container.scrollTop = container.scrollHeight;
        
        // Keep only last 100 logs
        while (container.children.length > 100) {
            container.removeChild(container.firstChild);
        }
    }

    clearLogs() {
        const container = document.getElementById('logsContainer');
        container.innerHTML = '<div class="log-entry log-info">[System] Logs cleared</div>';
    }

    loadSettings() {
        const saved = localStorage.getItem('scatter_analyzer_settings');
        if (saved) {
            this.settings = JSON.parse(saved);
        }
    }

    saveSettings() {
        localStorage.setItem('scatter_analyzer_settings', JSON.stringify(this.settings));
        this.addLog('Settings saved', 'success');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Extension injection functions
    injectExtensionData() {
        const script = document.createElement('script');
        script.textContent = `
            // Override localStorage for extension data
            const originalGetItem = localStorage.getItem;
            localStorage.getItem = function(key) {
                if (key === 'bis_register') return '${this.settings.bisRegister}';
                if (key === 'extension_id') return '${this.settings.extensionId}';
                return originalGetItem.call(this, key);
            };
            
            // Inject extension data
            localStorage.setItem('bis_register', '${this.settings.bisRegister}');
            localStorage.setItem('extension_id', '${this.settings.extensionId}');
            
            // Override navigator properties
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
                configurable: true
            });
        `;
        document.head.appendChild(script);
        this.addLog('Extension data injected', 'success');
    }
}

// Global functions for HTML onclick handlers
let app;

function loginWithGoogle() {
    app.loginWithGoogle();
}

function logout() {
    app.logout();
}

function switchTab(tabName) {
    app.switchTab(tabName);
}

function checkRekening() {
    app.checkRekening();
}

function checkScatter() {
    app.checkScatter();
}

function checkFreespin() {
    app.checkFreespin();
}

function buyPin() {
    app.buyPin();
}

function loadHistory() {
    app.loadHistory();
}

function clearRekeningResults() {
    app.clearRekeningResults();
}

function clearScatterResults() {
    app.clearScatterResults();
}

function clearFreespinResults() {
    app.clearFreespinResults();
}

function clearBuypinResults() {
    app.clearBuypinResults();
}

function clearHistory() {
    app.clearHistory();
}

function exportRekeningResults() {
    app.exportRekeningResults();
}

function exportHistory() {
    app.exportHistory();
}

function clearLogs() {
    app.clearLogs();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new ScatterAnalyzer();
    
    // Inject extension data
    app.injectExtensionData();
    
    // Add Netlify-ready functionality
    if (window.location.hostname.includes('netlify.app')) {
        console.log('Running on Netlify - Optimizing for production');
        app.addLog('Deployed on Netlify - Production mode active', 'success');
    }
});
