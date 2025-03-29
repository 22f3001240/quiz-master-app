// Admin Components

// Admin Navbar Component
const AdminNavbar = {
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
                            <a class="nav-link" :class="{ active: activeTab === 'quiz' }" href="#" @click.prevent="$emit('change-tab', 'quiz')">
                                <i class="fas fa-question-circle me-1"></i> Quiz
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
                                <input type="text" class="form-control" placeholder="Search..." v-model="searchQuery" @keyup.enter="searchAction">
                                <button class="btn btn-outline-primary" type="button" @click="searchAction">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </li>
                        <li class="nav-item ms-2">
                            <span class="nav-link text-success">Welcome Admin</span>
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
    props: ['activeTab'],
    data() {
        return {
            searchQuery: ''
        }
    },
    methods: {
        searchAction() {
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

// Admin Home Component (Subject Management)
const AdminHome = {
    template: `
        <div class="container-fluid py-4">
            <div class="alert alert-success" v-if="successMessage">{{ successMessage }}</div>
            <div class="alert alert-danger" v-if="errorMessage">{{ errorMessage }}</div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <h2 class="mb-3">Subject Management</h2>
                </div>
                <div class="col-md-6 text-end">
                    <button class="btn btn-primary" @click="showAddSubjectModal = true">
                        <i class="fas fa-plus-circle me-1"></i> New Subject
                    </button>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-4" v-for="subject in filteredSubjects" :key="subject.id">
                    <div class="card">
                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 class="m-0">{{ subject.name }}</h5>
                            <div>
                                <button class="btn btn-sm btn-light me-1" @click="editSubject(subject)">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" @click="confirmDeleteSubject(subject)">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <p>{{ subject.description }}</p>
                            <hr>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Chapter Name</th>
                                            <th>Quizzes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="chapter in getChaptersForSubject(subject.id)" :key="chapter.id">
                                            <td>{{ chapter.name }}</td>
                                            <td>{{ getQuizCountForChapter(chapter.id) }}</td>
                                            <td>
                                                <button class="btn btn-sm btn-outline-primary me-1" @click="editChapter(chapter)">
                                                    <i class="fas fa-edit"></i> Edit
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteChapter(chapter)">
                                                    <i class="fas fa-trash"></i> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <button class="btn btn-sm btn-success" @click="showAddChapter(subject)">
                                <i class="fas fa-plus"></i> Chapter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Add Subject Modal -->
            <div class="modal" :class="{ 'fade': !showAddSubjectModal, 'show': showAddSubjectModal }" tabindex="-1" role="dialog" :style="{ display: showAddSubjectModal ? 'block' : 'none' }">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                {{ editingSubject ? 'Edit Subject' : 'New Subject' }}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeSubjectModal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveSubject">
                                <div class="mb-3">
                                    <label for="subjectName" class="form-label">Name</label>
                                    <input type="text" class="form-control" id="subjectName" v-model="newSubject.name" required>
                                </div>
                                <div class="mb-3">
                                    <label for="subjectDescription" class="form-label">Description</label>
                                    <textarea class="form-control" id="subjectDescription" v-model="newSubject.description" rows="3"></textarea>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <button type="button" class="btn btn-secondary" @click="closeSubjectModal">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="showAddSubjectModal" class="modal-backdrop fade show"></div>
            
            <!-- Add Chapter Modal -->
            <div class="modal" :class="{ 'fade': !showAddChapterModal, 'show': showAddChapterModal }" tabindex="-1" role="dialog" :style="{ display: showAddChapterModal ? 'block' : 'none' }">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                {{ editingChapter ? 'Edit Chapter' : 'New Chapter' }}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeChapterModal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveChapter">
                                <div class="mb-3">
                                    <label for="chapterName" class="form-label">Name</label>
                                    <input type="text" class="form-control" id="chapterName" v-model="newChapter.name" required>
                                </div>
                                <div class="mb-3">
                                    <label for="chapterDescription" class="form-label">Description</label>
                                    <textarea class="form-control" id="chapterDescription" v-model="newChapter.description" rows="3"></textarea>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <button type="button" class="btn btn-secondary" @click="closeChapterModal">Cancel</button>
                                    <button type="submit" class="btn btn-success">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="showAddChapterModal" class="modal-backdrop fade show"></div>
            
            <!-- Delete Confirmation Modal -->
            <div class="modal" :class="{ 'fade': !showDeleteModal, 'show': showDeleteModal }" tabindex="-1" role="dialog" :style="{ display: showDeleteModal ? 'block' : 'none' }">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">Confirm Delete</h5>
                            <button type="button" class="btn-close btn-close-white" @click="showDeleteModal = false"></button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to delete this {{ deleteType }}?</p>
                            <p><strong>{{ deleteItemName }}</strong></p>
                            <p>This action cannot be undone.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
                            <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="showDeleteModal" class="modal-backdrop fade show"></div>
        </div>
    `,
    data() {
        return {
            subjects: [],
            chapters: [],
            quizzes: [],
            questions: [],
            
            showAddSubjectModal: false,
            showAddChapterModal: false,
            showDeleteModal: false,
            
            newSubject: {
                name: '',
                description: ''
            },
            
            newChapter: {
                name: '',
                description: '',
                subject_id: null
            },
            
            selectedSubject: null,
            editingSubject: false,
            editingChapter: false,
            
            deleteType: '',
            deleteItemId: null,
            deleteItemName: '',
            
            successMessage: '',
            errorMessage: '',
            
            searchText: ''
        }
    },
    computed: {
        filteredSubjects() {
            if (!this.searchText) {
                return this.subjects;
            }
            
            const searchLower = this.searchText.toLowerCase();
            return this.subjects.filter(subject => 
                subject.name.toLowerCase().includes(searchLower) || 
                (subject.description && subject.description.toLowerCase().includes(searchLower))
            );
        }
    },
    mounted() {
        this.loadSubjects();
        this.loadChapters();
        this.loadQuizzes();
        this.loadQuestions();
    },
    methods: {
        // Load data
        loadSubjects() {
            axios.get('/api/subjects')
                .then(response => {
                    this.subjects = response.data;
                })
                .catch(error => {
                    this.errorMessage = 'Failed to load subjects.';
                    console.error('Error loading subjects:', error);
                });
        },
        
        loadChapters() {
            axios.get('/api/chapters')
                .then(response => {
                    this.chapters = response.data;
                })
                .catch(error => {
                    this.errorMessage = 'Failed to load chapters.';
                    console.error('Error loading chapters:', error);
                });
        },
        
        loadQuizzes() {
            axios.get('/api/quizzes')
                .then(response => {
                    this.quizzes = response.data;
                })
                .catch(error => {
                    this.errorMessage = 'Failed to load quizzes.';
                    console.error('Error loading quizzes:', error);
                });
        },
        
        loadQuestions() {
            axios.get(`/api/questions`)
                .then(response => {
                    this.questions = response.data;
                })
                .catch(error => {
                    this.errorMessage = 'Failed to load questions.';
                    console.error('Error loading questions:', error);
                });
        },
        
        // Helper methods
        getChaptersForSubject(subjectId) {
            return this.chapters.filter(chapter => chapter.subject_id === subjectId);
        },
        
        getQuizzesForChapter(chapterId) {
            return this.quizzes.filter(quiz => quiz.chapter_id === chapterId);
        },
        
        getQuestionsForQuiz(quizId) {
            return this.questions.filter(question => question.quiz_id === quizId);
        },
        
        getQuizCountForChapter(chapterId) {
            return this.quizzes.filter(quiz => quiz.chapter_id === chapterId).length;
        },
        
        // Subject CRUD
        saveSubject() {
            const method = this.editingSubject ? 'put' : 'post';
            const url = this.editingSubject ? `/api/subjects/${this.newSubject.id}` : '/api/subjects';
            
            axios[method](url, {
                name: this.newSubject.name,
                description: this.newSubject.description
            })
            .then(response => {
                this.successMessage = this.editingSubject ? 'Subject updated successfully!' : 'Subject created successfully!';
                this.closeSubjectModal();
                this.loadSubjects();
                
                // Clear message after 3 seconds
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            })
            .catch(error => {
                this.errorMessage = error.response ? error.response.data.message : 'Failed to save subject.';
                console.error('Error saving subject:', error);
            });
        },
        
        editSubject(subject) {
            this.editingSubject = true;
            this.newSubject = { ...subject };
            this.showAddSubjectModal = true;
        },
        
        confirmDeleteSubject(subject) {
            this.deleteType = 'subject';
            this.deleteItemId = subject.id;
            this.deleteItemName = subject.name;
            this.showDeleteModal = true;
        },
        
        closeSubjectModal() {
            this.showAddSubjectModal = false;
            this.editingSubject = false;
            this.newSubject = {
                name: '',
                description: ''
            };
        },
        
        // Chapter CRUD
        showAddChapter(subject) {
            this.selectedSubject = subject;
            this.editingChapter = false;
            this.newChapter = {
                name: '',
                description: '',
                subject_id: subject.id
            };
            this.showAddChapterModal = true;
        },
        
        saveChapter() {
            const method = this.editingChapter ? 'put' : 'post';
            const url = this.editingChapter ? `/api/chapters/${this.newChapter.id}` : '/api/chapters';
            
            axios[method](url, {
                name: this.newChapter.name,
                description: this.newChapter.description,
                subject_id: this.newChapter.subject_id
            })
            .then(response => {
                this.successMessage = this.editingChapter ? 'Chapter updated successfully!' : 'Chapter created successfully!';
                this.closeChapterModal();
                this.loadChapters();
                
                // Clear message after 3 seconds
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            })
            .catch(error => {
                this.errorMessage = error.response ? error.response.data.message : 'Failed to save chapter.';
                console.error('Error saving chapter:', error);
            });
        },
        
        editChapter(chapter) {
            this.editingChapter = true;
            this.newChapter = { ...chapter };
            this.showAddChapterModal = true;
        },
        
        confirmDeleteChapter(chapter) {
            this.deleteType = 'chapter';
            this.deleteItemId = chapter.id;
            this.deleteItemName = chapter.name;
            this.showDeleteModal = true;
        },
        
        closeChapterModal() {
            this.showAddChapterModal = false;
            this.editingChapter = false;
            this.newChapter = {
                name: '',
                description: '',
                subject_id: null
            };
        },
        
        // Handle delete confirmation
        confirmDelete() {
            let url = '';
            if (this.deleteType === 'subject') {
                url = `/api/subjects/${this.deleteItemId}`;
            } else if (this.deleteType === 'chapter') {
                url = `/api/chapters/${this.deleteItemId}`;
            }
            
            if (url) {
                axios.delete(url)
                    .then(response => {
                        this.successMessage = `${this.deleteType.charAt(0).toUpperCase() + this.deleteType.slice(1)} deleted successfully!`;
                        if (this.deleteType === 'subject') {
                            this.loadSubjects();
                        } else if (this.deleteType === 'chapter') {
                            this.loadChapters();
                        }
                        this.showDeleteModal = false;
                        
                        // Clear message after 3 seconds
                        setTimeout(() => {
                            this.successMessage = '';
                        }, 3000);
                    })
                    .catch(error => {
                        this.errorMessage = error.response ? error.response.data.message : `Failed to delete ${this.deleteType}.`;
                        console.error(`Error deleting ${this.deleteType}:`, error);
                        this.showDeleteModal = false;
                    });
            }
        },
        
        // Handle search
        setSearchText(text) {
            this.searchText = text;
        }
    }
};

// Admin Quiz Management Component
const AdminQuiz = {
    template: `
        <div class="container-fluid py-4">
            <div class="alert alert-success" v-if="successMessage">{{ successMessage }}</div>
            <div class="alert alert-danger" v-if="errorMessage">{{ errorMessage }}</div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <h2 class="mb-3">Quiz Management</h2>
                </div>
                <div class="col-md-6 text-end">
                    <button class="btn btn-primary" @click="showAddQuizModal = true">
                        <i class="fas fa-plus-circle me-1"></i> New Quiz
                    </button>
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            All Quizzes
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Chapter</th>
                                            <th>Subject</th>
                                            <th>Date</th>
                                            <th>Duration</th>
                                            <th>Questions</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="quiz in filteredQuizzes" :key="quiz.id">
                                            <td>{{ quiz.id }}</td>
                                            <td>{{ getChapterName(quiz.chapter_id) }}</td>
                                            <td>{{ getSubjectForChapter(quiz.chapter_id) }}</td>
                                            <td>{{ formatDate(quiz.date_of_quiz) }}</td>
                                            <td>{{ quiz.time_duration }}</td>
                                            <td>{{ getQuestionsForQuiz(quiz.id).length }}</td>
                                            <td>
                                                <button class="btn btn-sm btn-outline-primary me-1" @click="viewQuizQuestions(quiz)">
                                                    <i class="fas fa-question-circle"></i> Questions
                                                </button>
                                                <button class="btn btn-sm btn-outline-success me-1" @click="editQuiz(quiz)">
                                                    <i class="fas fa-edit"></i> Edit
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteQuiz(quiz)">
                                                    <i class="fas fa-trash"></i> Delete
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
            
            <!-- Questions View Modal -->
            <div class="modal" :class="{ 'fade': !showQuestionsModal, 'show': showQuestionsModal }" tabindex="-1" role="dialog" :style="{ display: showQuestionsModal ? 'block' : 'none' }">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-info text-white">
                            <h5 class="modal-title">
                                Questions for {{ selectedQuiz ? getChapterName(selectedQuiz.chapter_id) + ' Quiz' : '' }}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeQuestionsModal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="d-flex justify-content-end mb-3">
                                <button class="btn btn-success btn-sm" @click="showAddQuestionModal = true">
                                    <i class="fas fa-plus"></i> Add Question
                                </button>
                            </div>
                            
                            <div v-if="quizQuestions.length === 0" class="text-center p-4">
                                <p class="text-muted">No questions added to this quiz yet.</p>
                            </div>
                            
                            <div v-for="(question, index) in quizQuestions" :key="question.id" class="card mb-3">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h6 class="m-0">Question {{ index + 1 }}</h6>
                                    <div>
                                        <button class="btn btn-sm btn-outline-primary me-1" @click="editQuestion(question)">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteQuestion(question)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <p class="fw-bold">{{ question.question_statement }}</p>
                                    <div class="ms-3">
                                        <p :class="{ 'text-success': question.correct_option === 'option1' }">
                                            A) {{ question.option1 }}
                                        </p>
                                        <p :class="{ 'text-success': question.correct_option === 'option2' }">
                                            B) {{ question.option2 }}
                                        </p>
                                        <p v-if="question.option3" :class="{ 'text-success': question.correct_option === 'option3' }">
                                            C) {{ question.option3 }}
                                        </p>
                                        <p v-if="question.option4" :class="{ 'text-success': question.correct_option === 'option4' }">
                                            D) {{ question.option4 }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="showQuestionsModal" class="modal-backdrop fade show"></div>
            
            <!-- Add Quiz Modal -->
            <div class="modal" :class="{ 'fade': !showAddQuizModal, 'show': showAddQuizModal }" tabindex="-1" role="dialog" :style="{ display: showAddQuizModal ? 'block' : 'none' }">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                {{ editingQuiz ? 'Edit Quiz' : 'New Quiz' }}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeQuizModal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveQuiz">
                                <div class="mb-3">
                                    <label for="quizSubject" class="form-label">Subject</label>
                                    <select class="form-select" id="quizSubject" v-model="selectedSubjectId" required @change="updateChapterOptions">
                                        <option value="" disabled selected>Select Subject</option>
                                        <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="quizChapter" class="form-label">Chapter</label>
                                    <select class="form-select" id="quizChapter" v-model="newQuiz.chapter_id" required>
                                        <option value="" disabled selected>Select Chapter</option>
                                        <option v-for="chapter in filteredChapters" :key="chapter.id" :value="chapter.id">{{ chapter.name }}</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="quizDate" class="form-label">Date</label>
                                    <input type="datetime-local" class="form-control" id="quizDate" v-model="quizDatetime" required>
                                </div>
                                <div class="mb-3">
                                    <label for="quizDuration" class="form-label">Duration (HH:MM)</label>
                                    <input type="text" class="form-control" id="quizDuration" v-model="newQuiz.time_duration" required 
                                           placeholder="00:30" pattern="[0-9]{2}:[0-9]{2}">
                                </div>
                                <div class="mb-3">
                                    <label for="quizRemarks" class="form-label">Remarks</label>
                                    <textarea class="form-control" id="quizRemarks" v-model="newQuiz.remarks" rows="2"></textarea>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <button type="button" class="btn btn-secondary" @click="closeQuizModal">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="showAddQuizModal" class="modal-backdrop fade show"></div>
            
            <!-- Add Question Modal -->
            <div class="modal" :class="{ 'fade': !showAddQuestionModal, 'show': showAddQuestionModal }" tabindex="-1" role="dialog" :style="{ display: showAddQuestionModal ? 'block' : 'none' }">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">
                                {{ editingQuestion ? 'Edit Question' : 'New Question' }}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeQuestionModal"></button>
                        </div>
                        <div class="modal-body">
                            <form @submit.prevent="saveQuestion">
                                <div class="mb-3">
                                    <label for="questionStatement" class="form-label">Question</label>
                                    <textarea class="form-control" id="questionStatement" v-model="newQuestion.question_statement" rows="2" required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="option1" class="form-label">Option 1</label>
                                    <input type="text" class="form-control" id="option1" v-model="newQuestion.option1" required>
                                </div>
                                <div class="mb-3">
                                    <label for="option2" class="form-label">Option 2</label>
                                    <input type="text" class="form-control" id="option2" v-model="newQuestion.option2" required>
                                </div>
                                <div class="mb-3">
                                    <label for="option3" class="form-label">Option 3</label>
                                    <input type="text" class="form-control" id="option3" v-model="newQuestion.option3">
                                </div>
                                <div class="mb-3">
                                    <label for="option4" class="form-label">Option 4</label>
                                    <input type="text" class="form-control" id="option4" v-model="newQuestion.option4">
                                </div>
                                <div class="mb-3">
                                    <label for="correctOption" class="form-label">Correct Option</label>
                                    <select class="form-select" id="correctOption" v-model="newQuestion.correct_option" required>
                                        <option value="" disabled selected>Select Correct Option</option>
                                        <option value="option1">Option 1</option>
                                        <option value="option2">Option 2</option>
                                        <option value="option3">Option 3</option>
                                        <option value="option4">Option 4</option>
                                    </select>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <button type="button" class="btn btn-secondary" @click="closeQuestionModal">Cancel</button>
                                    <button type="submit" class="btn btn-success">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="showAddQuestionModal" class="modal-backdrop fade show"></div>
            
            <!-- Delete Confirmation Modal -->
            <div class="modal" :class="{ 'fade': !showDeleteModal, 'show': showDeleteModal }" tabindex="-1" role="dialog" :style="{ display: showDeleteModal ? 'block' : 'none' }">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">Confirm Delete</h5>
                            <button type="button" class="btn-close btn-close-white" @click="showDeleteModal = false"></button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to delete this {{ deleteType }}?</p>
                            <p v-if="deleteType === 'quiz'"><strong>Quiz for {{ deleteItemName }}</strong></p>
                            <p v-else><strong>Question: {{ deleteItemName }}</strong></p>
                            <p>This action cannot be undone.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
                            <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="showDeleteModal" class="modal-backdrop fade show"></div>
        </div>
    `,
    data() {
        return {
            subjects: [],
            chapters: [],
            quizzes: [],
            questions: [],
            
            showAddQuizModal: false,
            showQuestionsModal: false,
            showAddQuestionModal: false,
            showDeleteModal: false,
            
            selectedQuiz: null,
            quizQuestions: [],
            
            selectedSubjectId: '',
            
            newQuiz: {
                chapter_id: '',
                time_duration: '',
                remarks: ''
            },
            
            quizDatetime: '',
            
            newQuestion: {
                quiz_id: '',
                question_statement: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                correct_option: ''
            },
            
            editingQuiz: false,
            editingQuestion: false,
            
            deleteType: '',
            deleteItemId: null,
            deleteItemName: '',
            
            successMessage: '',
            errorMessage: '',
            
            searchText: ''
        }
    },
    mounted() {
        this.loadSubjects();
        this.loadChapters();
        this.loadQuizzes();
        this.loadQuestions();
    },
    computed: {
        filteredChapters() {
            if (!this.selectedSubjectId) return [];
            return this.chapters.filter(chapter => chapter.subject_id === parseInt(this.selectedSubjectId));
        },
        filteredQuizzes() {
            if (!this.searchText) {
                return this.quizzes;
            }
            
            const searchLower = this.searchText.toLowerCase();
            return this.quizzes.filter(quiz => {
                const chapter = this.chapters.find(c => c.id === quiz.chapter_id);
                const subject = chapter ? this.subjects.find(s => s.id === chapter.subject_id) : null;
                const quizQuestions = this.questions.filter(q => q.quiz_id === quiz.id);
                const hasMatchingQuestion = quizQuestions.some(q => 
                    q.question_statement.toLowerCase().includes(searchLower) ||
                    q.option1.toLowerCase().includes(searchLower) ||
                    q.option2.toLowerCase().includes(searchLower) ||
                    (q.option3 && q.option3.toLowerCase().includes(searchLower)) ||
                    (q.option4 && q.option4.toLowerCase().includes(searchLower))
                );
                
                return (
                    (String(quiz.id).includes(searchLower)) ||
                    (quiz.remarks && quiz.remarks.toLowerCase().includes(searchLower)) ||
                    (chapter && chapter.name.toLowerCase().includes(searchLower)) ||
                    (subject && subject.name.toLowerCase().includes(searchLower)) ||
                    hasMatchingQuestion
                );
            });
        }
    },
    methods: {
        // Load data
        loadSubjects() {
            axios.get('/api/subjects')
                .then(response => {
                    this.subjects = response.data;
                })
                .catch(error => {
                    this.errorMessage = 'Failed to load subjects.';
                    console.error('Error loading subjects:', error);
                });
        },
        
        loadChapters() {
            axios.get('/api/chapters')
                .then(response => {
                    this.chapters = response.data;
                })
                .catch(error => {
                    this.errorMessage = 'Failed to load chapters.';
                    console.error('Error loading chapters:', error);
                });
        },
        
        loadQuizzes() {
            axios.get('/api/quizzes')
                .then(response => {
                    this.quizzes = response.data;
                })
                .catch(error => {
                    this.errorMessage = 'Failed to load quizzes.';
                    console.error('Error loading quizzes:', error);
                });
        },
        
        loadQuestions() {
            axios.get(`/api/questions`)
                .then(response => {
                    this.questions = response.data;
                })
                .catch(error => {
                    this.errorMessage = 'Failed to load questions.';
                    console.error('Error loading questions:', error);
                });
        },
        
        // Helper methods
        getChapterName(chapterId) {
            const chapter = this.chapters.find(ch => ch.id === chapterId);
            return chapter ? chapter.name : 'Unknown';
        },
        
        getSubjectForChapter(chapterId) {
            const chapter = this.chapters.find(ch => ch.id === chapterId);
            if (!chapter) return 'Unknown';
            
            const subject = this.subjects.find(sub => sub.id === chapter.subject_id);
            return subject ? subject.name : 'Unknown';
        },
        
        getQuestionsForQuiz(quizId) {
            return this.questions.filter(question => question.quiz_id === quizId);
        },
        
        formatDate(dateString) {
            if (!dateString) return '';
            try {
                // Use system local time without enforcing time zone
                const date = new Date(dateString);
                return date.toLocaleString();
            } catch (e) {
                console.error("Date formatting error:", e);
                return dateString;
            }
        },
        
        updateChapterOptions() {
            this.newQuiz.chapter_id = '';
        },
        
        // Quiz CRUD
        viewQuizQuestions(quiz) {
            this.selectedQuiz = quiz;
            
            // Load questions directly from API to ensure up-to-date data
            axios.get(`/api/quizzes/${quiz.id}/questions`)
                .then(response => {
                    this.quizQuestions = response.data;
                    this.showQuestionsModal = true;
                })
                .catch(error => {
                    this.errorMessage = 'Failed to load quiz questions.';
                    console.error('Error loading quiz questions:', error);
                });
        },
        
        closeQuestionsModal() {
            this.showQuestionsModal = false;
            this.selectedQuiz = null;
            this.quizQuestions = [];
        },
        
        saveQuiz() {
            const method = this.editingQuiz ? 'put' : 'post';
            const url = this.editingQuiz ? `/api/quizzes/${this.newQuiz.id}` : '/api/quizzes';
            
            // Format date for API - use local time without timezone conversion
            let formattedDate = this.quizDatetime;
            if (this.quizDatetime) {
                const date = new Date(this.quizDatetime);
                // Format as YYYY-MM-DD HH:MM:SS
                formattedDate = date.getFullYear() + '-' +
                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                    String(date.getDate()).padStart(2, '0') + ' ' +
                    String(date.getHours()).padStart(2, '0') + ':' +
                    String(date.getMinutes()).padStart(2, '0') + ':' +
                    String(date.getSeconds()).padStart(2, '0');
            }
            
            axios[method](url, {
                chapter_id: this.newQuiz.chapter_id,
                time_duration: this.newQuiz.time_duration,
                date_of_quiz: formattedDate,
                remarks: this.newQuiz.remarks
            })
            .then(response => {
                this.successMessage = this.editingQuiz ? 'Quiz updated successfully!' : 'Quiz created successfully!';
                this.closeQuizModal();
                this.loadQuizzes();
                
                // Clear message after 3 seconds
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            })
            .catch(error => {
                this.errorMessage = error.response ? error.response.data.message : 'Failed to save quiz.';
                console.error('Error saving quiz:', error);
            });
        },
        
        editQuiz(quiz) {
            this.editingQuiz = true;
            this.newQuiz = { ...quiz };
            
            // Find the subject_id for the current chapter
            const chapter = this.chapters.find(ch => ch.id === quiz.chapter_id);
            if (chapter) {
                this.selectedSubjectId = chapter.subject_id;
            }
            
            // Format date for input
            if (quiz.date_of_quiz) {
                const date = new Date(quiz.date_of_quiz);
                this.quizDatetime = date.toISOString().slice(0, 16);
            }
            
            this.showAddQuizModal = true;
        },
        
        confirmDeleteQuiz(quiz) {
            this.deleteType = 'quiz';
            this.deleteItemId = quiz.id;
            this.deleteItemName = this.getChapterName(quiz.chapter_id);
            this.showDeleteModal = true;
        },
        
        closeQuizModal() {
            this.showAddQuizModal = false;
            this.editingQuiz = false;
            this.selectedSubjectId = '';
            this.newQuiz = {
                chapter_id: '',
                time_duration: '',
                remarks: ''
            };
            this.quizDatetime = '';
        },
        
        // Question CRUD
        saveQuestion() {
            const method = this.editingQuestion ? 'put' : 'post';
            const url = this.editingQuestion ? `/api/questions/${this.newQuestion.id}` : '/api/questions';
            
            // Set quiz_id if adding new question
            if (!this.editingQuestion) {
                this.newQuestion.quiz_id = this.selectedQuiz.id;
            }
            
            axios[method](url, this.newQuestion)
            .then(response => {
                this.successMessage = this.editingQuestion ? 'Question updated successfully!' : 'Question added successfully!';
                this.closeQuestionModal();
                
                // Refresh questions
                this.loadQuestions();
                
                // Refresh questions list for the quiz
                if (this.selectedQuiz) {
                    axios.get(`/api/quizzes/${this.selectedQuiz.id}/questions`)
                        .then(response => {
                            this.quizQuestions = response.data;
                        })
                        .catch(error => {
                            console.error('Error refreshing questions:', error);
                        });
                }
                
                // Clear message after 3 seconds
                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            })
            .catch(error => {
                this.errorMessage = error.response ? error.response.data.message : 'Failed to save question.';
                console.error('Error saving question:', error);
            });
        },
        
        editQuestion(question) {
            this.editingQuestion = true;
            this.newQuestion = { ...question };
            this.showAddQuestionModal = true;
        },
        
        confirmDeleteQuestion(question) {
            this.deleteType = 'question';
            this.deleteItemId = question.id;
            this.deleteItemName = question.question_statement.slice(0, 50) + (question.question_statement.length > 50 ? '...' : '');
            this.showDeleteModal = true;
        },
        
        closeQuestionModal() {
            this.showAddQuestionModal = false;
            this.editingQuestion = false;
            this.newQuestion = {
                quiz_id: '',
                question_statement: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                correct_option: ''
            };
        },
        
        // Handle delete confirmation
        confirmDelete() {
            let url = '';
            if (this.deleteType === 'quiz') {
                url = `/api/quizzes/${this.deleteItemId}`;
            } else if (this.deleteType === 'question') {
                url = `/api/questions/${this.deleteItemId}`;
            }
            
            if (url) {
                axios.delete(url)
                    .then(response => {
                        this.successMessage = `${this.deleteType.charAt(0).toUpperCase() + this.deleteType.slice(1)} deleted successfully!`;
                        
                        if (this.deleteType === 'quiz') {
                            this.loadQuizzes();
                        } else if (this.deleteType === 'question') {
                            this.loadQuestions();
                            
                            // Refresh questions list for the quiz
                            if (this.selectedQuiz) {
                                axios.get(`/api/quizzes/${this.selectedQuiz.id}/questions`)
                                    .then(response => {
                                        this.quizQuestions = response.data;
                                    })
                                    .catch(error => {
                                        console.error('Error refreshing questions:', error);
                                    });
                            }
                        }
                        
                        this.showDeleteModal = false;
                        
                        // Clear message after 3 seconds
                        setTimeout(() => {
                            this.successMessage = '';
                        }, 3000);
                    })
                    .catch(error => {
                        this.errorMessage = error.response ? error.response.data.message : `Failed to delete ${this.deleteType}.`;
                        console.error(`Error deleting ${this.deleteType}:`, error);
                        this.showDeleteModal = false;
                    });
            }
        },
        
        // Handle search
        setSearchText(text) {
            this.searchText = text;
        }
    }
};

// Admin Summary Component
const AdminSummary = {
    template: `
        <div class="container-fluid py-4">
            <div class="row mb-4">
                <div class="col-md-12">
                    <h2 class="mb-4">Dashboard Summary</h2>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card stat-card">
                        <div class="card-body">
                            <h5 class="card-title text-muted">Total Users</h5>
                            <p class="stat-number">{{ stats.totalUsers }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card stat-card">
                        <div class="card-body">
                            <h5 class="card-title text-muted">Total Subjects</h5>
                            <p class="stat-number">{{ stats.totalSubjects }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card stat-card">
                        <div class="card-body">
                            <h5 class="card-title text-muted">Total Quizzes</h5>
                            <p class="stat-number">{{ stats.totalQuizzes }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card stat-card">
                        <div class="card-body">
                            <h5 class="card-title text-muted">Total Quiz Attempts</h5>
                            <p class="stat-number">{{ stats.totalAttempts }}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-primary text-white">
                            Subject-wise Top Scores
                        </div>
                        <div class="card-body" style="height: 300px; max-height: 300px;">
                            <canvas ref="subjectScoresChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-success text-white">
                            Subject-wise User Attempts
                        </div>
                        <div class="card-body" style="height: 300px; max-height: 300px;">
                            <canvas ref="subjectAttemptsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-12 mb-4">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            User Activity
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Quizzes Attempted</th>
                                            <th>Average Score</th>
                                            <th>Last Activity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="user in userActivity" :key="user.id">
                                            <td>{{ user.name }}</td>
                                            <td>{{ user.email }}</td>
                                            <td>{{ user.attempts }}</td>
                                            <td>
                                                <span :class="getScoreClass(user.averageScore)">
                                                    {{ user.averageScore.toFixed(1) }}%
                                                </span>
                                            </td>
                                            <td>{{ formatDate(user.lastActivity) }}</td>
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
            users: [],
            subjects: [],
            chapters: [],
            quizzes: [],
            scores: [],
            
            subjectScoresChart: null,
            subjectAttemptsChart: null,
            
            stats: {
                totalUsers: 0,
                totalSubjects: 0,
                totalQuizzes: 0,
                totalAttempts: 0
            },
            
            userActivity: []
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
                axios.get('/api/scores'),
                axios.get('/api/users')  // Add users endpoint here
            ])
            .then(responses => {
                this.subjects = responses[0].data;
                this.chapters = responses[1].data;
                this.quizzes = responses[2].data;
                this.scores = responses[3].data;
                this.users = responses[4].data;  // Store users data
                
                // Update statistics
                this.updateStats();
                
                // Generate user activity data
                this.generateUserActivity();
                
                // Generate charts
                this.$nextTick(() => {
                    this.createCharts();
                });
            })
            .catch(error => {
                console.error('Error loading data:', error);
            });
        },
    
        
        
        fetchUsers() {
            axios.get('/api/users')
                .then(response => {
                    // Use the returned data directly
                    this.users = response.data;
                    // Then update user activity based on actual user data and scores
                    this.generateUserActivity();
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                    this.errorMessage = 'Failed to load user data.';
                });
        },

        updateStats() {
            this.stats.totalUsers = this.users.length;
            this.stats.totalSubjects = this.subjects.length;
            this.stats.totalQuizzes = this.quizzes.length;
            this.stats.totalAttempts = this.scores.length;
        },
        
        generateUserActivity() {
            this.userActivity = this.users.map(user => {
                const userScores = this.scores.filter(score => score.user_id === user.id);
                const totalScore = userScores.reduce((sum, score) => sum + score.total_scored * 100, 0);
                const averageScore = userScores.length ? (totalScore / userScores.length) : 0;
                const latestActivity = userScores.reduce((latest, score) => {
                    const scoreDate = new Date(score.time_stamp_of_attempt);
                    return latest && latest > scoreDate ? latest : scoreDate;
                }, null);
                return {
                    id: user.id,
                    name: user.full_name,
                    email: user.email,
                    attempts: userScores.length,
                    averageScore: averageScore,
                    lastActivity: latestActivity
                };
            });
        },
        
        createCharts() {
            this.createSubjectPerformanceChart();
            this.createSubjectAttemptsChart();
        },
        
        createSubjectPerformanceChart() {
            // Calculate top scores by subject
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
                        topScore: 0
                    };
                }
                
                const scorePercent = score.total_scored * 100;
                subjectScores[subject.name].scores.push(scorePercent);
                
                if (scorePercent > subjectScores[subject.name].topScore) {
                    subjectScores[subject.name].topScore = scorePercent;
                }
            });
            
            // Create chart data
            const labels = Object.keys(subjectScores);
            const data = labels.map(label => subjectScores[label].topScore);
            
            // Create chart
            if (this.$refs.subjectScoresChart) {
                const ctx = this.$refs.subjectScoresChart.getContext('2d');
                
                this.subjectScoresChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Top Score (%)',
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
                        },
                        plugins: {
                            legend: {
                                display: false // Hide legend to save space
                            }
                        }
                    }
                });
            }
        },
        
        createSubjectAttemptsChart() {
            // Calculate attempts by subject
            const subjectAttempts = {};
            
            this.scores.forEach(score => {
                const quiz = this.quizzes.find(q => q.id === score.quiz_id);
                if (!quiz) return;
                
                const chapter = this.chapters.find(c => c.id === quiz.chapter_id);
                if (!chapter) return;
                
                const subject = this.subjects.find(s => s.id === chapter.subject_id);
                if (!subject) return;
                
                if (!subjectAttempts[subject.name]) {
                    subjectAttempts[subject.name] = 0;
                }
                
                subjectAttempts[subject.name]++;
            });
            
            // Limit to top 5 subjects if there are too many
            let labels = Object.keys(subjectAttempts);
            let data = labels.map(label => subjectAttempts[label]);
            
            // Sort by attempt count and take top 5 if more than 5 subjects
            if (labels.length > 5) {
                const combined = labels.map((label, i) => ({ label, value: data[i] }));
                combined.sort((a, b) => b.value - a.value);
                const top5 = combined.slice(0, 5);
                
                labels = top5.map(item => item.label);
                data = top5.map(item => item.value);
            }
            
            // Create chart
            if (this.$refs.subjectAttemptsChart) {
                const ctx = this.$refs.subjectAttemptsChart.getContext('2d');
                
                this.subjectAttemptsChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
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
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    boxWidth: 15,
                                    font: {
                                        size: 10
                                    }
                                }
                            }
                        }
                    }
                });
            }
        },
        
        getScoreClass(score) {
            if (score >= 80) return 'text-success fw-bold';
            if (score >= 60) return 'text-primary';
            if (score >= 40) return 'text-warning';
            return 'text-danger';
        },
        
        formatDate(date) {
            if (!date) return 'Never';
            try {
                // Use system local time without enforcing time zone
                return new Date(date).toLocaleString();
            } catch (e) {
                console.error("Date formatting error:", e);
                return String(date);
            }
        },
        
        exportCSV() {
            // In a real app, this would trigger a backend job
            axios.post('/api/export/all-quizzes')
                .then(response => {
                    alert('CSV export job has been triggered. You will receive a notification when it is ready.');
                })
                .catch(error => {
                    console.error('Error exporting CSV:', error);
                    alert('There was an error triggering the export. Please try again later.');
                });
        }
    }
};

// Admin Dashboard Component
const AdminDashboard = {
    template: `
        <div>
            <admin-navbar :active-tab="activeTab" @change-tab="changeTab" @search="search" @logout="logout"></admin-navbar>
            
            <component :is="currentComponent" ref="currentComponent"></component>
        </div>
    `,
    components: {
        'admin-navbar': AdminNavbar,
        'admin-home': AdminHome,
        'admin-quiz': AdminQuiz,
        'admin-summary': AdminSummary
    },
    data() {
        return {
            activeTab: 'home',
            searchQuery: ''
        }
    },
    computed: {
        currentComponent() {
            switch(this.activeTab) {
                case 'home': return 'admin-home';
                case 'quiz': return 'admin-quiz';
                case 'summary': return 'admin-summary';
                default: return 'admin-home';
            }
        }
    },
    methods: {
        changeTab(tab) {
            this.activeTab = tab;
        },
        search(query) {
            this.searchQuery = query;
            // Pass search query to the current component
            if (this.$refs.currentComponent) {
                if (typeof this.$refs.currentComponent.setSearchText === 'function') {
                    this.$refs.currentComponent.setSearchText(query);
                } else {
                    console.warn('Current component does not have setSearchText method');
                }
            }
        },
        logout() {
            this.$emit('logout');
        }
    }
};