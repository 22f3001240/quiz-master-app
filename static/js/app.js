// Main Vue Application

// Set Axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
// Check for auth token and add to headers if exists
const token = localStorage.getItem('auth-token');
if (token) {
    axios.defaults.headers.common['Authentication-Token'] = token;
}

// Main App Component
const App = {
    template: `
        <div class="app-container d-flex flex-column min-vh-100">
            <!-- Auth Components -->
            <template v-if="!isAuthenticated">
                <component :is="authComponent" @switch-mode="switchAuthMode" @logged-in="handleLogin"></component>
            </template>
            
            <!-- User/Admin Dashboard Components -->
            <template v-else>
                <component :is="dashboardComponent" @logout="handleLogout"></component>
            </template>
        </div>
    `,
    data() {
        return {
            isAuthenticated: false,
            authMode: 'login',
            userRole: ''
        }
    },
    computed: {
        authComponent() {
            return this.authMode === 'login' ? Login : Register;
        },
        dashboardComponent() {
            return this.userRole === 'admin' ? AdminDashboard : UserDashboard;
        }
    },
    created() {
        // Check if user is authenticated on page load
        this.checkAuthentication();
    },
    methods: {
        checkAuthentication() {
            const token = localStorage.getItem('auth-token');
            const email = localStorage.getItem('user-email');
            
            if (token) {
                this.isAuthenticated = true;
                // Determine user role
                this.userRole = email === 'user0@admin.com' ? 'admin' : 'user';
            } else {
                this.isAuthenticated = false;
                this.userRole = '';
            }
        },
        
        switchAuthMode(mode) {
            this.authMode = mode;
        },
        
        handleLogin(role) {
            this.isAuthenticated = true;
            this.userRole = role;
        },
        
        handleLogout() {
            // Clear auth state
            this.isAuthenticated = false;
            this.userRole = '';
            this.authMode = 'login';
            
            // Clear auth header
            delete axios.defaults.headers.common['Authentication-Token'];
        }
    }
};

// Initialize Vue
new Vue({
    el: '#app',
    template: '<App />',
    components: {
        App
    }
});