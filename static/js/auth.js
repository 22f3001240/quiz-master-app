// Authentication components for Login and Registration

// Login Component
const Login = {
    template: `
        <div class="container auth-container">
            <div class="card auth-card">
                <div class="auth-header text-center">
                    <h3><i class="fas fa-brain me-2"></i> Quiz Master</h3>
                    <h5>Login</h5>
                </div>
                <div class="card-body p-4">
                    <div class="alert alert-danger" v-if="error">{{ error }}</div>
                    <form @submit.prevent="login">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                                <input type="email" class="form-control" id="email" v-model="email" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                <input type="password" class="form-control" id="password" v-model="password" required>
                            </div>
                        </div>
                        <div class="d-grid gap-2 mb-3">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-sign-in-alt me-2"></i> Login
                            </button>
                        </div>
                        <div class="text-center">
                            <a href="#" class="text-decoration-none" @click.prevent="$emit('switch-mode', 'register')">
                                Dont have an account? Register!
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            error: ''
        }
    },
    methods: {
        login() {
            axios.post('/api/login', {
                email: this.email,
                password: this.password
            })
            .then(response => {
                // Save auth token
                localStorage.setItem('auth-token', response.data['auth-token']);
                localStorage.setItem('user-id', response.data.id);
                localStorage.setItem('user-name', response.data.full_name);
                localStorage.setItem('user-email', this.email);
                
                // Set auth header for future requests
                axios.defaults.headers.common['Authentication-Token'] = response.data['auth-token'];
                
                // Determine user role
                const isAdmin = this.email === 'user0@admin.com';
                this.$emit('logged-in', isAdmin ? 'admin' : 'user');
            })
            .catch(error => {
                if (error.response) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Login failed. Please try again.';
                }
            });
        }
    }
};

// Registration Component
const Register = {
    template: `
        <div class="container auth-container">
            <div class="card auth-card">
                <div class="auth-header text-center">
                    <h3><i class="fas fa-brain me-2"></i> Quiz Master</h3>
                    <h5>Registration</h5>
                </div>
                <div class="card-body p-4">
                    <div class="alert alert-danger" v-if="error">{{ error }}</div>
                    <div class="alert alert-success" v-if="success">{{ success }}</div>
                    <form @submit.prevent="register">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                                <input type="email" class="form-control" id="email" v-model="email" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                <input type="password" class="form-control" id="password" v-model="password" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="fullName" class="form-label">Full Name</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-user"></i></span>
                                <input type="text" class="form-control" id="fullName" v-model="fullName" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="qualification" class="form-label">Qualification</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-graduation-cap"></i></span>
                                <input type="text" class="form-control" id="qualification" v-model="qualification">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="dob" class="form-label">Date of Birth</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-calendar"></i></span>
                                <input type="date" class="form-control" id="dob" v-model="dob">
                            </div>
                        </div>
                        <div class="d-grid gap-2 mb-3">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-user-plus me-2"></i> Register
                            </button>
                        </div>
                        <div class="text-center">
                            <a href="#" class="text-decoration-none" @click.prevent="$emit('switch-mode', 'login')">
                                Already have an account? Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            fullName: '',
            qualification: '',
            dob: '',
            error: '',
            success: ''
        }
    },
    methods: {
        register() {
            axios.post('/api/register', {
                email: this.email,
                password: this.password,
                full_name: this.fullName,
                qualification: this.qualification,
                dob: this.dob
            })
            .then(response => {
                this.success = 'Registration successful! You can now login.';
                // Clear form
                this.email = '';
                this.password = '';
                this.fullName = '';
                this.qualification = '';
                this.dob = '';
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    this.$emit('switch-mode', 'login');
                }, 2000);
            })
            .catch(error => {
                if (error.response) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Registration failed. Please try again.';
                }
            });
        }
    }
};