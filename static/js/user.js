// User Components

// User Navbar Component
const UserNavbar = {
    template: `
        <nav class="navbar navbar-expand-lg navbar-light bg-white">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">
                    <i class="fas fa-brain me-2"></i> Quiz Master
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: activeTab === 'home' }" href="#" @click.prevent="$emit('change-tab', 'home')">
                                <i class="fas fa-home me-1"></i> Home
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: activeTab === 'scores' }" href="#" @click.prevent="$emit('change-tab', 'scores')">
                                <i class="fas fa-trophy me-1"></i> Scores
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: activeTab === 'summary' }" href="#" @click.prevent="$emit('change-tab', 'summary')">
                                <i class="fas fa-chart-bar me-1"></i> Summary
                            </a>
                        </li>
                    </ul>
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Search quizzes..." v-model="searchQuery" @keyup.enter="search">
                                <button class="btn btn-outline-primary" type="button" @click="search">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </li>
                        <li class="nav-item ms-2">
                            <span class="nav-link text-success">Welcome {{ userName }}</span>
                        </li>
                        <li class="nav-item ms-2">
                            <a class="nav-link text-danger" href="#" @click.prevent="logout">
                                <i class="fas fa-sign-out-alt me-1"></i> Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `,
    props: ['activeTab', 'userName'],
    data() {
        return {
            searchQuery: ''
        }
    },
    methods: {
        search() {
            if (this.searchQuery.trim()) {
                this.$emit('search', this.searchQuery);
            }
        },
        logout() {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('user-id');
            localStorage.removeItem('user-name');
            localStorage.removeItem('user-email');
            this.$emit('logout');
        }
    }
};

// User Home Component (Upcoming Quizzes)
const UserHome = {
    template: `
        <div class="container-fluid py-4">
            <div class="alert alert-success" v-if="successMessage">{{ successMessage }}</div>
            <div class="alert alert-danger" v-if="errorMessage">{{ errorMessage }}</div>
            
            <div class="row mb-4">
                <div class="col-md-12">
                    <h2 class="mb-3">Upcoming Quizzes</h2>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            Available Quizzes
                        </div>
                        <div class="card-body">
                            <div v-if="upcomingQuizzes.length === 0" class="text-center p-4">
                                <p class="text-muted">No upcoming quizzes available at the moment.</p>
                            </div>
                            
                            <div class="table-responsive" v-else>
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Subject</th>
                                            <th>Chapter</th>
                                            <th>Date</th>
                                            <th>Duration</th>
                                            <th>Questions</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="quiz in upcomingQuizzes" :key="quiz.id">
                                            <td>{{ quiz.id }}</td>
                                            <td>{{ quiz.subject }}</td>
                                            <td>{{ quiz.chapter }}</td>
                                            <td>{{ formatDate(quiz.date_of_quiz) }}</td>
                                            <td>{{ quiz.time_duration }}</td>
                                            <td>{{ quiz.questionCount }}</td>
                                            <td>
                                                <button class="btn btn-sm btn-primary" @click="viewQuiz(quiz)">
                                                    View
                                                </button>
                                                <button 
                                                    class="btn btn-sm btn-success ms-1" 
                                                    @click="startQuiz(quiz)"
                                                    v-if="!userHasAttempted(quiz.id)"
                                                    :disabled="!isQuizAvailable(quiz)"
                                                >
                                                    Start
                                                </button>
                                                <button 
                                                    class="btn btn-sm btn-secondary ms-1"
                                                    disabled
                                                    v-else
                                                >
                                                    Attempted
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- View Quiz Modal -->
            <div class="modal" :class="{ 'show': showViewQuizModal }" tabindex="-1" role="dialog" :style="{ display: showViewQuizModal ? 'block' : 'none' }">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">Quiz Details</h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeViewQuizModal"></button>
                        </div>
                        <div class="modal-body">
                            <div v-if="selectedQuiz">
                                <div class="mb-3">
                                    <label class="form-label fw-bold">ID:</label>
                                    <p>{{ selectedQuiz.id }}</p>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-bold">Subject:</label>
                                    <p>{{ selectedQuiz.subject }}</p>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-bold">Chapter:</label>
                                    <p>{{ selectedQuiz.chapter }}</p>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-bold">Number of Questions:</label>
                                    <p>{{ selectedQuiz.questionCount }}</p>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-bold">Scheduled Date:</label>
                                    <p>{{ formatDate(selectedQuiz.date_of_quiz) }}</p>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-bold">Duration:</label>
                                    <p>{{ selectedQuiz.time_duration }}</p>
                                </div>
                                <div class="mb-3" v-if="selectedQuiz.remarks">
                                    <label class="form-label fw-bold">Remarks:</label>
                                    <p>{{ selectedQuiz.remarks }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="closeViewQuizModal">Close</button>
                            <button 
                                type="button" 
                                class="btn btn-success" 
                                @click="startSelectedQuiz"
                                v-if="selectedQuiz && !userHasAttempted(selectedQuiz.id)"
                                :disabled="selectedQuiz && !isQuizAvailable(selectedQuiz)"
                            >
                                Start Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Modal backdrop -->
            <div class="modal-backdrop fade show" v-if="showViewQuizModal"></div>
        </div>
    `,
    data() {
        return {
            subjects: [],
            chapters: [],
            quizzes: [],
            questions: [],
            scores: [],
            upcomingQuizzes: [],
            
            showViewQuizModal: false,
            selectedQuiz: null,
            
            successMessage: '',
            errorMessage: ''
        }
    },
    mounted() {
        this.loadData();
    },
    methods: {
        loadData() {
            // Load all required data
            Promise.all([
                axios.get('/api/subjects'),
                axios.get('/api/chapters'),
                axios.get('/api/quizzes'),
                axios.get('/api/questions'),
                axios.get('/api/scores')
            ])
            .then(responses => {
                this.subjects = responses[0].data;
                this.chapters = responses[1].data;
                this.quizzes = responses[2].data;
                this.questions = responses[3].data;
                this.scores = responses[4].data;
                
                // Process quiz data with additional info
                this.processQuizData();
            })
            .catch(error => {
                this.errorMessage = 'Failed to load data. Please try again.';
                console.error('Error loading data:', error);
            });
        },
        
        processQuizData() {
            // Create an array to hold processed quiz data
            const processedQuizzes = [];
            
            // Process each quiz
            this.quizzes.forEach(quiz => {
                const chapter = this.chapters.find(c => c.id === quiz.chapter_id);
                
                // Skip quizzes with invalid chapter references
                if (!chapter) return;
                
                const subject = this.subjects.find(s => s.id === chapter.subject_id);
                
                // Skip quizzes with invalid subject references
                if (!subject) return;
                
                const questionCount = this.questions.filter(q => q.quiz_id === quiz.id).length;
                
                // Add processed quiz to array
                processedQuizzes.push({
                    ...quiz,
                    chapter: chapter.name,
                    subject: subject.name,
                    questionCount: questionCount
                });
            });
            
            // Sort by date (most recent first)
            this.upcomingQuizzes = processedQuizzes.sort((a, b) => 
                new Date(b.date_of_quiz) - new Date(a.date_of_quiz)
            );
        },
        
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString();
        },
        
        userHasAttempted(quizId) {
            const userId = parseInt(localStorage.getItem('user-id'));
            return this.scores.some(score => score.quiz_id === quizId && score.user_id === userId);
        },
        
        isQuizAvailable(quiz) {
            // Check if quiz date has passed and if it's still within the duration window
            const quizDate = new Date(quiz.date_of_quiz);
            const now = new Date();
            
            // If quiz is in the future
            if (quizDate > now) {
                return false;
            }
            
            // Parse duration (HH:MM)
            const [hours, minutes] = quiz.time_duration.split(':').map(Number);
            const durationMs = (hours * 60 * 60 + minutes * 60) * 1000;
            
            // Check if quiz end time has passed
            const quizEndTime = new Date(quizDate.getTime() + durationMs);
            return now <= quizEndTime;
        },
        
        viewQuiz(quiz) {
            this.selectedQuiz = quiz;
            this.showViewQuizModal = true;
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '15px';
        },
        
        closeViewQuizModal() {
            this.showViewQuizModal = false;
            this.selectedQuiz = null;
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        },
        
        startQuiz(quiz) {
            // Emit event to start quiz
            this.$emit('start-quiz', quiz);
        },
        
        startSelectedQuiz() {
            this.closeViewQuizModal();
            this.startQuiz(this.selectedQuiz);
        }
    }
};

// Quiz Taking Component
const QuizTaking = {
    template: `
        <div class="container py-4">
            <div class="row mb-4">
                <div class="col-md-8">
                    <h3>{{ quiz.subject }}: {{ quiz.chapter }}</h3>
                </div>
                <div class="col-md-4 text-end">
                    <div class="quiz-timer" :class="timerClass">
                        <i class="fas fa-clock me-1"></i> {{ formatTime(timeRemaining) }}
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <div class="card mb-4">
                        <div class="card-header bg-primary text-white d-flex justify-content-between">
                            <span>Question {{ currentQuestionIndex + 1 }} of {{ quizQuestions.length }}</span>
                            <span>{{ getCurrentQuestionNumber() }}/{{ quizQuestions.length }}</span>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title mb-4">{{ currentQuestion.question_statement }}</h5>
                            
                            <div class="options-container">
                                <div 
                                    v-for="(option, index) in currentOptions" 
                                    :key="index"
                                    class="option-item"
                                    :class="{ 'selected': selectedOption === 'option' + (index + 1) }"
                                    @click="selectOption('option' + (index + 1))"
                                >
                                    <span class="option-label">{{ ['A', 'B', 'C', 'D'][index] }}</span>
                                    {{ option }}
                                </div>
                            </div>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button 
                                class="btn btn-secondary" 
                                :disabled="currentQuestionIndex === 0"
                                @click="previousQuestion"
                            >
                                <i class="fas fa-arrow-left me-1"></i> Previous
                            </button>
                            <button 
                                class="btn btn-primary" 
                                :disabled="currentQuestionIndex === quizQuestions.length - 1"
                                @click="nextQuestion"
                            >
                                Next <i class="fas fa-arrow-right ms-1"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-center">
                        <button 
                            class="btn btn-success btn-lg" 
                            @click="confirmSubmit"
                            :disabled="!canSubmit"
                        >
                            <i class="fas fa-check-circle me-1"></i> Submit Quiz
                        </button>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            Question Navigator
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div 
                                    v-for="(question, index) in quizQuestions" 
                                    :key="index"
                                    class="col-3 mb-2"
                                >
                                    <button 
                                        class="btn btn-sm w-100" 
                                        :class="getQuestionButtonClass(index)"
                                        @click="goToQuestion(index)"
                                    >
                                        {{ index + 1 }}
                                    </button>
                                </div>
                            </div>
                            
                            <div class="mt-3">
                                <div class="d-flex justify-content-between mb-2">
                                    <span><i class="fas fa-circle text-success"></i> Answered</span>
                                    <span>{{ answeredCount }}/{{ quizQuestions.length }}</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span><i class="fas fa-circle text-warning"></i> Current</span>
                                    <span>1</span>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span><i class="fas fa-circle text-danger"></i> Unanswered</span>
                                    <span>{{ quizQuestions.length - answeredCount }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Submit Confirmation Modal -->
            <div class="modal" :class="{ 'show': showSubmitModal }" tabindex="-1" role="dialog" :style="{ display: showSubmitModal ? 'block' : 'none' }">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-warning text-white">
                            <h5 class="modal-title">Confirm Submission</h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeSubmitModal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to submit your quiz?</p>
                            <p>You have answered {{ answeredCount }} out of {{ quizQuestions.length }} questions.</p>
                            <p v-if="quizQuestions.length - answeredCount > 0" class="text-danger">
                                Warning: You have {{ quizQuestions.length - answeredCount }} unanswered questions.
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="closeSubmitModal">Cancel</button>
                            <button type="button" class="btn btn-success" @click="submitQuiz">Submit Quiz</button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Modal backdrop for submit confirmation -->
            <div class="modal-backdrop fade show" v-if="showSubmitModal"></div>
            
            <!-- Quiz Result Modal -->
            <div class="modal" :class="{ 'show': showResultModal }" tabindex="-1" role="dialog" :style="{ display: showResultModal ? 'block' : 'none' }">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">Quiz Results</h5>
                            <button type="button" class="btn-close btn-close-white" @click="finishQuiz"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <h3>Your Score: {{ quizScore.toFixed(2) }}%</h3>
                                <div class="progress mt-2" style="height: 20px;">
                                    <div class="progress-bar" :class="scoreProgressBarClass" :style="{ width: quizScore + '%' }"></div>
                                </div>
                            </div>
                            
                            <div class="card mb-3" v-for="(question, index) in quizQuestions" :key="index">
                                <div class="card-header" :class="getQuestionResultHeaderClass(question, userAnswers[index])">
                                    <div class="d-flex justify-content-between">
                                        <span>Question {{ index + 1 }}</span>
                                        <span v-if="userAnswers[index] === question.correct_option">
                                            <i class="fas fa-check-circle me-1"></i> Correct
                                        </span>
                                        <span v-else-if="userAnswers[index]">
                                            <i class="fas fa-times-circle me-1"></i> Incorrect
                                        </span>
                                        <span v-else>
                                            <i class="fas fa-minus-circle me-1"></i> Unanswered
                                        </span>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <p class="card-text">{{ question.question_statement }}</p>
                                    <div class="ms-3">
                                        <p :class="getOptionClass(question, 'option1', userAnswers[index])">
                                            A) {{ question.option1 }}
                                        </p>
                                        <p :class="getOptionClass(question, 'option2', userAnswers[index])">
                                            B) {{ question.option2 }}
                                        </p>
                                        <p v-if="question.option3" :class="getOptionClass(question, 'option3', userAnswers[index])">
                                            C) {{ question.option3 }}
                                        </p>
                                        <p v-if="question.option4" :class="getOptionClass(question, 'option4', userAnswers[index])">
                                            D) {{ question.option4 }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" @click="finishQuiz">Back to Dashboard</button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Modal backdrop for result modal -->
            <div class="modal-backdrop fade show" v-if="showResultModal"></div>
        </div>
    `,
    props: ['quiz'],
    data() {
        return {
            quizQuestions: [],
            currentQuestionIndex: 0,
            userAnswers: [],
            timeRemaining: 0,
            timerInterval: null,
            
            showSubmitModal: false,
            showResultModal: false,
            
            quizScore: 0,
            
            errorMessage: ''
        }
    },
    computed: {
        currentQuestion() {
            return this.quizQuestions[this.currentQuestionIndex] || {};
        },
        
        currentOptions() {
            if (!this.currentQuestion) return [];
            
            return [
                this.currentQuestion.option1, 
                this.currentQuestion.option2,
                this.currentQuestion.option3,
                this.currentQuestion.option4
            ].filter(option => option); // Filter out null/undefined options
        },
        
        selectedOption() {
            return this.userAnswers[this.currentQuestionIndex] || '';
        },
        
        answeredCount() {
            return this.userAnswers.filter(answer => answer).length;
        },
        
        canSubmit() {
            return this.answeredCount > 0;
        },
        
        timerClass() {
            if (this.timeRemaining <= 300) return 'bg-danger text-white'; // Less than 5 minutes
            if (this.timeRemaining <= 600) return 'bg-warning text-dark'; // Less than 10 minutes
            return 'bg-light';
        },
        
        scoreProgressBarClass() {
            if (this.quizScore >= 80) return 'bg-success';
            if (this.quizScore >= 60) return 'bg-primary';
            if (this.quizScore >= 40) return 'bg-warning';
            return 'bg-danger';
        }
    },
    mounted() {
        this.loadQuizQuestions();
        this.startTimer();
    },
    beforeDestroy() {
        this.clearTimer();
    },
    methods: {
        loadQuizQuestions() {
            axios.get(`/api/quizzes/${this.quiz.id}/questions`)
                .then(response => {
                    this.quizQuestions = response.data;
                    this.userAnswers = new Array(this.quizQuestions.length).fill('');
                })
                .catch(error => {
                    this.errorMessage = 'Failed to load quiz questions.';
                    console.error('Error loading quiz questions:', error);
                });
        },
        
        startTimer() {
            // Parse duration (HH:MM) to seconds
            const [hours, minutes] = this.quiz.time_duration.split(':').map(Number);
            this.timeRemaining = hours * 3600 + minutes * 60;
            
            this.timerInterval = setInterval(() => {
                this.timeRemaining--;
                
                if (this.timeRemaining <= 0) {
                    this.clearTimer();
                    this.submitQuiz();
                }
            }, 1000);
        },
        
        clearTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        },
        
        formatTime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
        
        getCurrentQuestionNumber() {
            return this.currentQuestionIndex + 1;
        },
        
        selectOption(option) {
            this.$set(this.userAnswers, this.currentQuestionIndex, option);
        },
        
        previousQuestion() {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
            }
        },
        
        nextQuestion() {
            if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
                this.currentQuestionIndex++;
            }
        },
        
        goToQuestion(index) {
            this.currentQuestionIndex = index;
        },
        
        getQuestionButtonClass(index) {
            if (index === this.currentQuestionIndex) return 'btn-warning';
            if (this.userAnswers[index]) return 'btn-success';
            return 'btn-outline-danger';
        },
        
        confirmSubmit() {
            this.showSubmitModal = true;
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '15px';
        },
        
        closeSubmitModal() {
            this.showSubmitModal = false;
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        },
        
        calculateScore() {
            let correctCount = 0;
            
            this.quizQuestions.forEach((question, index) => {
                if (this.userAnswers[index] === question.correct_option) {
                    correctCount++;
                }
            });
            
            return (correctCount / this.quizQuestions.length) * 100;
        },
        
        submitQuiz() {
            this.clearTimer();
            this.closeSubmitModal();
            
            // Calculate score
            this.quizScore = this.calculateScore();
            
            // Convert to a decimal for the backend (0.0 to 1.0)
            const scoreDecimal = this.quizScore / 100;
            
            // Submit score to backend
            axios.post('/api/scores', {
                quiz_id: this.quiz.id,
                total_scored: scoreDecimal
            })
            .then(response => {
                // Show results modal
                this.showResultModal = true;
                document.body.classList.add('modal-open');
                document.body.style.overflow = 'hidden';
                document.body.style.paddingRight = '15px';
            })
            .catch(error => {
                console.error('Error submitting quiz score:', error);
                // Still show results even if saving failed
                this.showResultModal = true;
                document.body.classList.add('modal-open');
                document.body.style.overflow = 'hidden';
                document.body.style.paddingRight = '15px';
            });
        },
        
        getQuestionResultHeaderClass(question, userAnswer) {
            if (!userAnswer) return 'bg-secondary text-white';
            if (userAnswer === question.correct_option) return 'bg-success text-white';
            return 'bg-danger text-white';
        },
        
        getOptionClass(question, option, userAnswer) {
            if (option === question.correct_option) return 'text-success fw-bold';
            if (option === userAnswer && option !== question.correct_option) return 'text-danger text-decoration-line-through';
            return '';
        },
        
        finishQuiz() {
            this.showResultModal = false;
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            this.$emit('finish-quiz');
        }
    }
};

// User Scores Component
const UserScores = {
    template: `
        <div class="container-fluid py-4">
            <div class="row mb-4">
                <div class="col-md-12">
                    <h2 class="mb-3">Quiz Scores</h2>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            Your Quiz Attempts
                        </div>
                        <div class="card-body">
                            <div v-if="quizScores.length === 0" class="text-center p-4">
                                <p class="text-muted">You haven't attempted any quizzes yet.</p>
                            </div>
                            
                            <div class="table-responsive" v-else>
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Subject</th>
                                            <th>Chapter</th>
                                            <th>Date Attempted</th>
                                            <th>Score</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="score in quizScores" :key="score.id">
                                            <td>{{ score.id }}</td>
                                            <td>{{ score.subject }}</td>
                                            <td>{{ score.chapter }}</td>
                                            <td>{{ formatDate(score.time_stamp_of_attempt) }}</td>
                                            <td>{{ (score.total_scored * 100).toFixed(2) }}%</td>
                                            <td>
                                                <span :class="getScoreStatusClass(score.total_scored)">
                                                    {{ getScoreStatus(score.total_scored) }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="d-flex justify-content-end mt-3">
                                <button @click="exportCSV" class="btn btn-outline-primary">
                                    <i class="fas fa-download me-1"></i> Export CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            subjects: [],
            chapters: [],
            quizzes: [],
            scores: [],
            quizScores: [],
            
            errorMessage: ''
        }
    },
    mounted() {
        this.loadData();
    },
    methods: {
        loadData() {
            // Load all required data
            Promise.all([
                axios.get('/api/subjects'),
                axios.get('/api/chapters'),
                axios.get('/api/quizzes'),
                axios.get('/api/scores')
            ])
            .then(responses => {
                this.subjects = responses[0].data;
                this.chapters = responses[1].data;
                this.quizzes = responses[2].data;
                this.scores = responses[3].data;
                
                // Process scores with additional info
                this.processScoreData();
            })
            .catch(error => {
                this.errorMessage = 'Failed to load data. Please try again.';
                console.error('Error loading data:', error);
            });
        },
        
        processScoreData() {
            // Create an array to hold processed score data
            const processedScores = [];
            
            // Process each score
            this.scores.forEach(score => {
                const quiz = this.quizzes.find(q => q.id === score.quiz_id);
                
                // Skip scores with invalid quiz references
                if (!quiz) return;
                
                const chapter = this.chapters.find(c => c.id === quiz.chapter_id);
                
                // Skip scores with invalid chapter references
                if (!chapter) return;
                
                const subject = this.subjects.find(s => s.id === chapter.subject_id);
                
                // Skip scores with invalid subject references
                if (!subject) return;
                
                // Add processed score to array
                processedScores.push({
                    ...score,
                    chapter: chapter.name,
                    subject: subject.name,
                    quiz_name: `${subject.name} - ${chapter.name}`
                });
            });
            
            // Sort by date (most recent first)
            this.quizScores = processedScores.sort((a, b) => 
                new Date(b.time_stamp_of_attempt) - new Date(a.time_stamp_of_attempt)
            );
        },
        
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString();
        },
        
        getScoreStatus(score) {
            const percentage = score * 100;
            if (percentage >= 80) return 'Excellent';
            if (percentage >= 70) return 'Good';
            if (percentage >= 60) return 'Satisfactory';
            if (percentage >= 50) return 'Pass';
            return 'Needs Improvement';
        },
        
        getScoreStatusClass(score) {
            const percentage = score * 100;
            if (percentage >= 80) return 'badge bg-success';
            if (percentage >= 70) return 'badge bg-primary';
            if (percentage >= 60) return 'badge bg-info';
            if (percentage >= 50) return 'badge bg-warning text-dark';
            return 'badge bg-danger';
        },
        
        exportCSV() {
            // In a real app, this would trigger a backend job
            // For now, we'll just show a success message
            alert('CSV export job has been triggered. You will receive a notification when it is ready.');
        }
    }
};

// User Summary Component
const UserSummary = {
    template: `
        <div class="container-fluid py-4">
            <div class="row mb-4">
                <div class="col-md-12">
                    <h2 class="mb-3">Your Performance Summary</h2>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <h5 class="card-title text-muted">Total Quizzes Attempted</h5>
                            <p class="stat-number">{{ stats.totalAttempts }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <h5 class="card-title text-muted">Average Score</h5>
                            <p class="stat-number">{{ stats.averageScore.toFixed(2) }}%</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <h5 class="card-title text-muted">Highest Score</h5>
                            <p class="stat-number">{{ stats.highestScore.toFixed(2) }}%</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-primary text-white">
                            Subject Performance
                        </div>
                        <div class="card-body">
                            <canvas ref="subjectScoresChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-success text-white">
                            Monthly Activity
                        </div>
                        <div class="card-body">
                            <canvas ref="monthlyActivityChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            Recent Performance
                        </div>
                        <div class="card-body">
                            <div v-if="recentScores.length === 0" class="text-center p-4">
                                <p class="text-muted">No quiz attempts recorded yet.</p>
                            </div>
                            
                            <div class="table-responsive" v-else>
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Subject - Chapter</th>
                                            <th>Date</th>
                                            <th>Score</th>
                                            <th>Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="score in recentScores" :key="score.id">
                                            <td>{{ score.quiz_name }}</td>
                                            <td>{{ formatDate(score.time_stamp_of_attempt) }}</td>
                                            <td>{{ (score.total_scored * 100).toFixed(2) }}%</td>
                                            <td>
                                                <div class="progress">
                                                    <div 
                                                        class="progress-bar" 
                                                        :class="getProgressBarClass(score.total_scored)" 
                                                        :style="{ width: (score.total_scored * 100) + '%' }"
                                                    ></div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            subjects: [],
            chapters: [],
            quizzes: [],
            scores: [],
            
            subjectScoresChart: null,
            monthlyActivityChart: null,
            
            stats: {
                totalAttempts: 0,
                averageScore: 0,
                highestScore: 0
            },
            
            recentScores: []
        }
    },
    mounted() {
        this.loadData();
    },
    methods: {
        loadData() {
            // Load all required data
            Promise.all([
                axios.get('/api/subjects'),
                axios.get('/api/chapters'),
                axios.get('/api/quizzes'),
                axios.get('/api/scores')
            ])
            .then(responses => {
                this.subjects = responses[0].data;
                this.chapters = responses[1].data;
                this.quizzes = responses[2].data;
                this.scores = responses[3].data;
                
                // Process data for charts and stats
                this.processData();
                
                // Create charts
                this.$nextTick(() => {
                    this.createCharts();
                });
            })
            .catch(error => {
                console.error('Error loading data:', error);
            });
        },
        
        processData() {
            // Create an array to hold processed score data
            const processedScores = [];
            
            // Process each score
            this.scores.forEach(score => {
                const quiz = this.quizzes.find(q => q.id === score.quiz_id);
                
                // Skip scores with invalid quiz references
                if (!quiz) return;
                
                const chapter = this.chapters.find(c => c.id === quiz.chapter_id);
                
                // Skip scores with invalid chapter references
                if (!chapter) return;
                
                const subject = this.subjects.find(s => s.id === chapter.subject_id);
                
                // Skip scores with invalid subject references
                if (!subject) return;
                
                // Add processed score to array
                processedScores.push({
                    ...score,
                    chapter: chapter.name,
                    subject: subject.name,
                    quiz_name: `${subject.name} - ${chapter.name}`
                });
            });
            
            // Calculate statistics
            if (processedScores.length > 0) {
                this.stats.totalAttempts = processedScores.length;
                
                const totalScore = processedScores.reduce((sum, score) => sum + score.total_scored * 100, 0);
                this.stats.averageScore = totalScore / processedScores.length;
                
                this.stats.highestScore = Math.max(...processedScores.map(score => score.total_scored * 100));
            }
            
            // Get recent scores (last 5)
            this.recentScores = [...processedScores]
                .sort((a, b) => new Date(b.time_stamp_of_attempt) - new Date(a.time_stamp_of_attempt))
                .slice(0, 5);
        },
        
        createCharts() {
            this.createSubjectPerformanceChart();
            this.createMonthlyActivityChart();
        },
        
        createSubjectPerformanceChart() {
            // Group scores by subject
            const subjectScores = {};
            
            this.scores.forEach(score => {
                const quiz = this.quizzes.find(q => q.id === score.quiz_id);
                if (!quiz) return;
                
                const chapter = this.chapters.find(c => c.id === quiz.chapter_id);
                if (!chapter) return;
                
                const subject = this.subjects.find(s => s.id === chapter.subject_id);
                if (!subject) return;
                
                if (!subjectScores[subject.name]) {
                    subjectScores[subject.name] = {
                        scores: [],
                        average: 0
                    };
                }
                
                subjectScores[subject.name].scores.push(score.total_scored * 100);
            });
            
            // Calculate average score for each subject
            Object.keys(subjectScores).forEach(subject => {
                const scores = subjectScores[subject].scores;
                if (scores.length > 0) {
                    const total = scores.reduce((sum, score) => sum + score, 0);
                    subjectScores[subject].average = total / scores.length;
                }
            });
            
            // Create chart data
            const labels = Object.keys(subjectScores);
            const data = labels.map(label => subjectScores[label].average);
            
            // Create chart
            if (this.$refs.subjectScoresChart) {
                const ctx = this.$refs.subjectScoresChart.getContext('2d');
                
                this.subjectScoresChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Average Score (%)',
                            data: data,
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(153, 102, 255, 0.7)',
                                'rgba(255, 159, 64, 0.7)',
                                'rgba(255, 99, 132, 0.7)'
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 99, 132, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                });
            }
        },
        
        createMonthlyActivityChart() {
            // Group attempts by month
            const monthlyActivity = {};
            
            this.scores.forEach(score => {
                if (!score.time_stamp_of_attempt) return;
                
                const date = new Date(score.time_stamp_of_attempt);
                const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
                
                if (!monthlyActivity[monthYear]) {
                    monthlyActivity[monthYear] = 0;
                }
                
                monthlyActivity[monthYear]++;
            });
            
            // Create chart data
            const labels = Object.keys(monthlyActivity).sort((a, b) => {
                const dateA = new Date(a);
                const dateB = new Date(b);
                return dateA - dateB;
            });
            
            const data = labels.map(label => monthlyActivity[label]);
            
            // Create chart
            if (this.$refs.monthlyActivityChart) {
                const ctx = this.$refs.monthlyActivityChart.getContext('2d');
                
                this.monthlyActivityChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Quiz Attempts',
                            data: data,
                            fill: false,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            tension: 0.1,
                            borderWidth: 2,
                            pointBackgroundColor: 'rgba(75, 192, 192, 1)'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }
        },
        
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString();
        },
        
        getProgressBarClass(score) {
            const percentage = score * 100;
            if (percentage >= 80) return 'bg-success';
            if (percentage >= 60) return 'bg-primary';
            if (percentage >= 40) return 'bg-warning';
            return 'bg-danger';
        }
    }
};

// User Dashboard Component
const UserDashboard = {
    template: `
        <div>
            <user-navbar :active-tab="activeTab" :user-name="userName" @change-tab="changeTab" @search="search" @logout="logout"></user-navbar>
            
            <component v-if="!takingQuiz" :is="currentComponent" @start-quiz="startQuiz"></component>
            <quiz-taking v-else :quiz="selectedQuiz" @finish-quiz="finishQuiz"></quiz-taking>
        </div>
    `,
    components: {
        'user-navbar': UserNavbar,
        'user-home': UserHome,
        'user-scores': UserScores,
        'user-summary': UserSummary,
        'quiz-taking': QuizTaking
    },
    data() {
        return {
            activeTab: 'home',
            searchQuery: '',
            userName: localStorage.getItem('user-name') || 'User',
            
            takingQuiz: false,
            selectedQuiz: null
        }
    },
    computed: {
        currentComponent() {
            switch(this.activeTab) {
                case 'home': return 'user-home';
                case 'scores': return 'user-scores';
                case 'summary': return 'user-summary';
                default: return 'user-home';
            }
        }
    },
    methods: {
        changeTab(tab) {
            this.activeTab = tab;
        },
        search(query) {
            this.searchQuery = query;
            // Implementation would depend on how search is handled
            console.log(`Searching for: ${query}`);
            // Filtering is best done in the component where the data is displayed
            if (this.$refs.currentComponent && typeof this.$refs.currentComponent.setSearchText === 'function') {
                this.$refs.currentComponent.setSearchText(query);
            }
        },
        logout() {
            this.$emit('logout');
        },
        startQuiz(quiz) {
            this.selectedQuiz = quiz;
            this.takingQuiz = true;
        },
        finishQuiz() {
            this.takingQuiz = false;
            this.selectedQuiz = null;
            this.activeTab = 'scores';
        }
    }
};