// Rekening Checker Web App - KKS Bandar 80
// Hybrid Web App with Google OAuth and Extension Injection

class RekeningChecker {
    constructor() {
        this.currentUser = null;
        this.settings = {
            targetUrl: 'https://bandar80.idrbo2.com/new-transaction.html',
            headers: [],
            extensionId: 'eppiocemhmnlbhjplcgkofciiegomcon'
        };
        this.results = [];
        this.isChecking = false;
        this.init();
    }

    async init() {
        this.loadSettings();
        this.setupGoogleOAuth();
        this.checkAuthStatus();
        this.addLog('System initialized', 'info');
    }

    setupGoogleOAuth() {
        // Initialize Google OAuth
        window.googleAccountsID = {
            initialize: (config) => {
                console.log('Google OAuth initialized', config);
            },
            prompt: async () => {
                // Mock OAuth for development
                return {
                    credential: 'mock_credential_token'
                };
            }
        };
    }

    async checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                // Mock user data for development
                const userData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    picture: 'https://via.placeholder.com/40'
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
                picture: 'https://via.placeholder.com/40'
            };
            
            localStorage.setItem('auth_token', 'mock_token');
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
            btn.classList.add('text-white/80', 'hover:text-white');
        });
        
        // Show selected tab
        document.getElementById(tabName + 'Content').classList.remove('hidden');
        
        // Add active class to selected tab button
        const activeTab = document.getElementById(tabName + 'Tab');
        activeTab.classList.add('tab-active');
        activeTab.classList.remove('text-white/80', 'hover:text-white');
    }

    async checkAccounts() {
        if (this.isChecking) {
            this.addLog('Already checking accounts...', 'warning');
            return;
        }

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const pin = document.getElementById('pin').value;
        const userIdsText = document.getElementById('userIds').value;

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

        this.isChecking = true;
        this.results = [];
        this.updateCheckButton(true);
        this.showProgress(true);
        this.addLog(`Starting check for ${userIds.length} user IDs...`, 'info');

        try {
            // Create iframe for extension injection
            const iframe = await this.createExtensionIframe();
            
            // Process user IDs with extension injection
            for (let i = 0; i < userIds.length; i++) {
                const userId = userIds[i];
                this.updateProgress(i + 1, userIds.length);
                
                try {
                    const result = await this.checkSingleAccount(userId, username, password, pin, iframe);
                    this.results.push(result);
                    this.addLog(`[${userId}] ${result.success ? 'Success' : 'Failed'}: ${result.error || 'Data found'}`, 
                               result.success ? 'success' : 'error');
                } catch (error) {
                    this.results.push({
                        success: false,
                        user_id: userId,
                        error: error.message
                    });
                    this.addLog(`[${userId}] Error: ${error.message}`, 'error');
                }
            }

            // Clean up iframe
            if (iframe && iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }

            this.displayResults();
            this.addLog(`Check completed. Success: ${this.results.filter(r => r.success).length}, Failed: ${this.results.filter(r => !r.success).length}`, 'success');

        } catch (error) {
            this.addLog('Check failed: ' + error.message, 'error');
        } finally {
            this.isChecking = false;
            this.updateCheckButton(false);
            this.showProgress(false);
        }
    }

    async createExtensionIframe() {
        return new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = this.settings.targetUrl;
            
            iframe.onload = () => {
                try {
                    // Inject extension scripts into iframe
                    this.injectExtensionScripts(iframe.contentWindow);
                    resolve(iframe);
                } catch (error) {
                    reject(new Error('Failed to inject extension scripts: ' + error.message));
                }
            };

            iframe.onerror = () => {
                reject(new Error('Failed to load target URL'));
            };

            document.body.appendChild(iframe);
        });
    }

    injectExtensionScripts(iframeWindow) {
        const extensionId = this.settings.extensionId;
        
        // Inject extension scripts
        const scripts = [
            `chrome-extension://${extensionId}/content/location/location.js`,
            `chrome-extension://${extensionId}/libs/extend-native-history-api.js`,
            `chrome-extension://${extensionId}/libs/requests.js`
        ];

        scripts.forEach(scriptSrc => {
            const script = iframeWindow.document.createElement('script');
            script.src = scriptSrc;
            script.id = extensionId;
            iframeWindow.document.head.appendChild(script);
        });

        // Inject extension data
        const extensionData = {
            bis_register: 'Q2hvbWUgQnJvd3Nlcg%3D%3D',
            extension_id: extensionId
        };

        iframeWindow.localStorage.setItem('bis_register', extensionData.bis_register);
        iframeWindow.localStorage.setItem('extension_id', extensionData.extension_id);

        // Override localStorage to provide extension data
        iframeWindow.localStorage.getItem = function(key) {
            if (key === 'bis_register') return extensionData.bis_register;
            if (key === 'extension_id') return extensionData.extension_id;
            return Object.getPrototypeOf(this).getItem.call(this, key);
        };

        this.addLog('Extension scripts injected', 'success');
    }

    async checkSingleAccount(userId, username, password, pin, iframe) {
        const iframeWindow = iframe.contentWindow;
        const iframeDoc = iframe.contentDocument;

        return new Promise((resolve, reject) => {
            try {
                // Wait for page to load
                setTimeout(() => {
                    try {
                        // Find and fill login form
                        const usernameInput = iframeDoc.querySelector('input[name="entered_login"], input[id="entered_login"]');
                        const passwordInput = iframeDoc.querySelector('input[name="entered_password"], input[id="entered_password"]');
                        const pinInput = iframeDoc.querySelector('input[name="pin"], input[id="pin"]');

                        if (!usernameInput || !passwordInput) {
                            reject(new Error('Login form not found'));
                            return;
                        }

                        // Fill form
                        usernameInput.value = username;
                        passwordInput.value = password;
                        if (pinInput) {
                            pinInput.value = pin;
                        }

                        // Find and click submit button
                        const submitButton = iframeDoc.querySelector('button[type="submit"], button:contains("Login"), input[type="submit"]');
                        if (submitButton) {
                            submitButton.click();
                        } else {
                            usernameInput.form.submit();
                        }

                        // Wait for response and extract data
                        setTimeout(() => {
                            try {
                                const data = this.extractAccountData(iframeDoc, userId);
                                resolve({
                                    success: !!data,
                                    user_id: userId,
                                    data: data,
                                    timestamp: new Date().toISOString()
                                });
                            } catch (error) {
                                resolve({
                                    success: false,
                                    user_id: userId,
                                    error: 'Failed to extract data: ' + error.message
                                });
                            }
                        }, 3000);

                    } catch (error) {
                        reject(error);
                    }
                }, 2000);

            } catch (error) {
                reject(error);
            }
        });
    }

    extractAccountData(doc, userId) {
        // Try to extract account data using various selectors
        const data = {};

        // Bank name
        const bankSelectors = [
            'td:contains("Bank") + td',
            'div:contains("Bank") + div',
            'span:contains("Bank") + span',
            '[data-bank]',
            '.bank-name'
        ];

        for (const selector of bankSelectors) {
            const element = doc.querySelector(selector);
            if (element) {
                data.nama_bank = element.textContent.trim();
                break;
            }
        }

        // Account name
        const nameSelectors = [
            'td:contains("Nama") + td',
            'div:contains("Nama") + div',
            'span:contains("Nama") + span',
            '[data-name]',
            '.account-name'
        ];

        for (const selector of nameSelectors) {
            const element = doc.querySelector(selector);
            if (element) {
                data.nama_rek = element.textContent.trim();
                break;
            }
        }

        // Account number
        const numberSelectors = [
            'td:contains("No") + td',
            'div:contains("No") + div',
            'span:contains("No") + span',
            '[data-number]',
            '.account-number'
        ];

        for (const selector of numberSelectors) {
            const element = doc.querySelector(selector);
            if (element) {
                data.no_rek = element.textContent.trim();
                break;
            }
        }

        // If no data found, try regex on page source
        if (!data.nama_bank && !data.nama_rek && !data.no_rek) {
            const pageText = doc.body.textContent;
            
            // Bank name patterns
            const bankPatterns = [
                /Bank\s*[:\-]?\s*([A-Za-z\s]+)/i,
                /nama\s*bank\s*[:\-]?\s*([A-Za-z\s]+)/i
            ];
            
            for (const pattern of bankPatterns) {
                const match = pageText.match(pattern);
                if (match) {
                    data.nama_bank = match[1].trim();
                    break;
                }
            }

            // Account name patterns
            const namePatterns = [
                /Nama\s*Rekening\s*[:\-]?\s*([A-Za-z\s\.]+)/i,
                /Atas\s*Nama\s*[:\-]?\s*([A-Za-z\s\.]+)/i
            ];
            
            for (const pattern of namePatterns) {
                const match = pageText.match(pattern);
                if (match) {
                    data.nama_rek = match[1].trim();
                    break;
                }
            }

            // Account number patterns
            const numberPatterns = [
                /No\.?\s*Rekening\s*[:\-]?\s*(\d+)/i,
                /Nomor\s*Rekening\s*[:\-]?\s*(\d+)/i,
                /Account\s*Number\s*[:\-]?\s*(\d+)/i
            ];
            
            for (const pattern of numberPatterns) {
                const match = pageText.match(pattern);
                if (match) {
                    data.no_rek = match[1].trim();
                    break;
                }
            }
        }

        return Object.keys(data).length > 0 ? data : null;
    }

    updateCheckButton(checking) {
        const btn = document.getElementById('checkBtn');
        if (checking) {
            btn.innerHTML = '<div class="loading-spinner inline-block mr-2"></div>Memproses...';
            btn.disabled = true;
        } else {
            btn.innerHTML = '<i class="fas fa-search mr-2"></i> Cek Rekening';
            btn.disabled = false;
        }
    }

    showProgress(show) {
        const progressSection = document.getElementById('progressSection');
        if (show) {
            progressSection.classList.remove('hidden');
        } else {
            progressSection.classList.add('hidden');
        }
    }

    updateProgress(current, total) {
        const percentage = (current / total) * 100;
        document.getElementById('progressBar').style.width = percentage + '%';
        document.getElementById('progressText').textContent = `${current}/${total}`;
    }

    displayResults() {
        const container = document.getElementById('resultsContainer');
        
        if (this.results.length === 0) {
            container.innerHTML = '<p class="text-white/60">No results found</p>';
            return;
        }

        let html = `
            <div class="overflow-x-auto">
                <table class="w-full text-white">
                    <thead>
                        <tr class="border-b border-white/20">
                            <th class="px-4 py-3 text-left">User ID</th>
                            <th class="px-4 py-3 text-left">Status</th>
                            <th class="px-4 py-3 text-left">Bank</th>
                            <th class="px-4 py-3 text-left">Nama</th>
                            <th class="px-4 py-3 text-left">No. Rekening</th>
                            <th class="px-4 py-3 text-left">Time</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        this.results.forEach(result => {
            const statusClass = result.success ? 'text-green-400' : 'text-red-400';
            const statusText = result.success ? 'Success' : 'Failed';
            const data = result.data || {};
            
            html += `
                <tr class="border-b border-white/10 hover:bg-white/5">
                    <td class="px-4 py-3">${result.user_id}</td>
                    <td class="px-4 py-3 ${statusClass}">${statusText}</td>
                    <td class="px-4 py-3">${data.nama_bank || '-'}</td>
                    <td class="px-4 py-3">${data.nama_rek || '-'}</td>
                    <td class="px-4 py-3">${data.no_rek || '-'}</td>
                    <td class="px-4 py-3">${new Date(result.timestamp).toLocaleString()}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    clearResults() {
        this.results = [];
        document.getElementById('resultsContainer').innerHTML = '<p class="text-white/60">Belum ada hasil. Mulai pengecekan terlebih dahulu.</p>';
        this.addLog('Results cleared', 'info');
    }

    exportResults() {
        if (this.results.length === 0) {
            this.addLog('No results to export', 'warning');
            return;
        }

        const csv = this.convertToCSV(this.results);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rekening_check_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.addLog('Results exported to CSV', 'success');
    }

    convertToCSV(data) {
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
    }

    addHeader() {
        const container = document.getElementById('headersContainer');
        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex space-x-2';
        headerDiv.innerHTML = `
            <input type="text" placeholder="Key" class="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50">
            <input type="text" placeholder="Value" class="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50">
            <button onclick="removeHeader(this)" class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(headerDiv);
    }

    removeHeader(button) {
        button.parentElement.remove();
    }

    saveSettings() {
        this.settings.targetUrl = document.getElementById('targetUrl').value;
        this.settings.extensionId = document.getElementById('extensionId').value;
        
        // Collect headers
        const headerInputs = document.querySelectorAll('#headersContainer > div');
        this.settings.headers = [];
        headerInputs.forEach(div => {
            const inputs = div.querySelectorAll('input');
            const key = inputs[0].value.trim();
            const value = inputs[1].value.trim();
            if (key && value) {
                this.settings.headers.push({ key, value });
            }
        });

        localStorage.setItem('rekening_checker_settings', JSON.stringify(this.settings));
        this.addLog('Settings saved', 'success');
    }

    loadSettings() {
        const saved = localStorage.getItem('rekening_checker_settings');
        if (saved) {
            this.settings = JSON.parse(saved);
            document.getElementById('targetUrl').value = this.settings.targetUrl;
            document.getElementById('extensionId').value = this.settings.extensionId;
            
            // Load headers
            const container = document.getElementById('headersContainer');
            container.innerHTML = '';
            this.settings.headers.forEach(header => {
                const headerDiv = document.createElement('div');
                headerDiv.className = 'flex space-x-2';
                headerDiv.innerHTML = `
                    <input type="text" placeholder="Key" value="${header.key}" class="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50">
                    <input type="text" placeholder="Value" value="${header.value}" class="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50">
                    <button onclick="removeHeader(this)" class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                container.appendChild(headerDiv);
            });
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

function checkAccounts() {
    app.checkAccounts();
}

function clearResults() {
    app.clearResults();
}

function exportResults() {
    app.exportResults();
}

function addHeader() {
    app.addHeader();
}

function removeHeader(button) {
    app.removeHeader(button);
}

function saveSettings() {
    app.saveSettings();
}

function clearLogs() {
    app.clearLogs();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new RekeningChecker();
});

// Add custom :contains() selector for jQuery-like functionality
if (!document.querySelector) {
    document.querySelector = function(selector) {
        if (selector.includes(':contains(')) {
            // Simple implementation for :contains()
            const parts = selector.split(':contains(');
            const baseSelector = parts[0];
            const text = parts[1].replace(/[)']/g, '');
            
            const elements = document.querySelectorAll(baseSelector);
            for (let element of elements) {
                if (element.textContent.includes(text)) {
                    return element;
                }
            }
        }
        return document.querySelector(selector);
    };
}
