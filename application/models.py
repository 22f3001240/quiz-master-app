from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime

# Many-to-Many relationship between Users and Roles
class UsersRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class Role(db.Model, RoleMixin):
    """Role model for user roles (e.g., admin, user)."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String)

class User(db.Model, UserMixin):
    """User model for storing user information."""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    qualification = db.Column(db.String(100))
    dob = db.Column(db.Date)
    active = db.Column(db.Boolean, default=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='users_roles', backref='bearer')

class Subject(db.Model):
    """Subject model representing a field of study."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    
    # Enable cascade delete for chapters
    chapters = db.relationship('Chapter', backref='subject', cascade="all, delete-orphan", passive_deletes=True)

class Chapter(db.Model):
    """Chapter model representing modules under a subject."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id', ondelete="CASCADE"), nullable=False)
    
    # Enable cascade delete for quizzes
    quizzes = db.relationship('Quiz', backref='chapter', cascade="all, delete-orphan", passive_deletes=True)

class Quiz(db.Model):
    """Quiz model representing tests under a chapter."""
    id = db.Column(db.Integer, primary_key=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id', ondelete="CASCADE"), nullable=False)
    date_of_quiz = db.Column(db.DateTime, default=datetime.utcnow)
    time_duration = db.Column(db.String(10))  # Format: HH:MM
    remarks = db.Column(db.Text)

    # Enable cascade delete for questions and scores
    questions = db.relationship('Question', backref='quiz', cascade="all, delete-orphan", passive_deletes=True)
    scores = db.relationship('Score', backref='quiz', cascade="all, delete-orphan", passive_deletes=True)

class Question(db.Model):
    """Question model representing quiz questions."""
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete="CASCADE"), nullable=False)
    question_statement = db.Column(db.Text, nullable=False)
    option1 = db.Column(db.String(255))
    option2 = db.Column(db.String(255))
    option3 = db.Column(db.String(255))
    option4 = db.Column(db.String(255))
    correct_option = db.Column(db.String(255))  # Store the correct answer option

class Score(db.Model):
    """Score model for storing quiz attempt results."""
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    time_stamp_of_attempt = db.Column(db.DateTime, default=datetime.utcnow)
    total_scored = db.Column(db.Float)  # Store score as a float value
