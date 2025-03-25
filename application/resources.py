from flask_restful import Api, Resource, reqparse
from .models import *
from flask_security import auth_required, roles_required, roles_accepted, current_user
from .database import db
import datetime

api = Api()

# ------------------------------------------------------------
# Subject Endpoints
# ------------------------------------------------------------
subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str, required=True, help="Subject name is required")
subject_parser.add_argument('description', type=str, required=False)

class SubjectResource(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, subject_id=None):
        """GET all subjects or a specific subject if subject_id is provided."""
        if subject_id:
            subject = Subject.query.get(subject_id)
            if subject:
                return {
                    "id": subject.id,
                    "name": subject.name,
                    "description": subject.description
                }, 200
            return {"message": "Subject not found"}, 404

        subjects = Subject.query.all()
        return [{"id": sub.id, "name": sub.name, "description": sub.description} for sub in subjects], 200

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        """Admin creates a new subject."""
        args = subject_parser.parse_args()
        try:
            new_subject = Subject(name=args['name'], description=args.get('description'))
            db.session.add(new_subject)
            db.session.commit()
            return {"message": "Subject created successfully", "subject_id": new_subject.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "Error creating subject", "error": str(e)}, 400

    @auth_required('token')
    @roles_required('admin')
    def put(self, subject_id):
        """Admin updates an existing subject."""
        args = subject_parser.parse_args()
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        try:
            subject.name = args['name']
            subject.description = args.get('description')
            db.session.commit()
            return {"message": "Subject updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error updating subject", "error": str(e)}, 400

    @auth_required('token')
    @roles_required('admin')
    def delete(self, subject_id):
        """Admin deletes a subject."""
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        try:
            db.session.delete(subject)
            db.session.commit()
            return {"message": "Subject deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error deleting subject", "error": str(e)}, 400

# ------------------------------------------------------------
# Chapter Endpoints
# ------------------------------------------------------------
chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, required=True, help="Chapter name is required")
chapter_parser.add_argument('description', type=str, required=False)
chapter_parser.add_argument('subject_id', type=int, required=True, help="Subject ID is required")

class ChapterResource(Resource):
    @auth_required('token')
    def get(self, chapter_id=None):
        """GET all chapters or a specific chapter if chapter_id is provided."""
        if chapter_id:
            chapter = Chapter.query.get(chapter_id)
            if chapter:
                return {
                    "id": chapter.id,
                    "name": chapter.name,
                    "description": chapter.description,
                    "subject_id": chapter.subject_id
                }, 200
            return {"message": "Chapter not found"}, 404

        chapters = Chapter.query.all()
        return [{
            "id": chap.id,
            "name": chap.name,
            "description": chap.description,
            "subject_id": chap.subject_id
        } for chap in chapters], 200

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        """Admin creates a new chapter under a subject."""
        args = chapter_parser.parse_args()
        try:
            new_chapter = Chapter(
                name=args['name'],
                description=args.get('description'),
                subject_id=args['subject_id']
            )
            db.session.add(new_chapter)
            db.session.commit()
            return {"message": "Chapter created successfully", "chapter_id": new_chapter.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "Error creating chapter", "error": str(e)}, 400

    @auth_required('token')
    @roles_required('admin')
    def put(self, chapter_id):
        """Admin updates an existing chapter."""
        args = chapter_parser.parse_args()
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404
        try:
            chapter.name = args['name']
            chapter.description = args.get('description')
            chapter.subject_id = args['subject_id']
            db.session.commit()
            return {"message": "Chapter updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error updating chapter", "error": str(e)}, 400

    @auth_required('token')
    @roles_required('admin')
    def delete(self, chapter_id):
        """Admin deletes a chapter."""
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404
        try:
            db.session.delete(chapter)
            db.session.commit()
            return {"message": "Chapter deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error deleting chapter", "error": str(e)}, 400

# ------------------------------------------------------------
# Quiz Endpoints
# ------------------------------------------------------------
quiz_parser = reqparse.RequestParser()
quiz_parser.add_argument('chapter_id', type=int, required=True, help="Chapter ID is required")
quiz_parser.add_argument('time_duration', type=str, required=True, help="Time duration is required (HH:MM)")
quiz_parser.add_argument('remarks', type=str, required=False)
quiz_parser.add_argument('date_of_quiz', type=lambda x: datetime.datetime.strptime(x, "%Y-%m-%d %H:%M:%S"), required=False)

class QuizResource(Resource):
    @auth_required('token')
    def get(self, quiz_id=None):
        """GET all quizzes or a specific quiz if quiz_id is provided."""
        if quiz_id:
            quiz = Quiz.query.get(quiz_id)
            if quiz:
                return {
                    "id": quiz.id,
                    "chapter_id": quiz.chapter_id,
                    "date_of_quiz": quiz.date_of_quiz,
                    "time_duration": quiz.time_duration,
                    "remarks": quiz.remarks
                }, 200
            return {"message": "Quiz not found"}, 404

        quizzes = Quiz.query.all()
        return [{
            "id": q.id,
            "chapter_id": q.chapter_id,
            "date_of_quiz": q.date_of_quiz,
            "time_duration": q.time_duration,
            "remarks": q.remarks
        } for q in quizzes], 200

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        """Admin creates a new quiz under a chapter."""
        args = quiz_parser.parse_args()
        try:
            date_of_quiz = args.get("date_of_quiz") or datetime.datetime.utcnow()
            new_quiz = Quiz(
                chapter_id=args['chapter_id'],
                date_of_quiz=date_of_quiz,
                time_duration=args['time_duration'],
                remarks=args.get('remarks')
            )
            db.session.add(new_quiz)
            db.session.commit()
            return {"message": "Quiz created successfully", "quiz_id": new_quiz.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "Error creating quiz", "error": str(e)}, 400

    @auth_required('token')
    @roles_required('admin')
    def put(self, quiz_id):
        """Admin updates an existing quiz."""
        args = quiz_parser.parse_args()
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404
        try:
            quiz.chapter_id = args['chapter_id']
            quiz.time_duration = args['time_duration']
            quiz.remarks = args.get('remarks')
            quiz.date_of_quiz = args.get('date_of_quiz') or quiz.date_of_quiz
            db.session.commit()
            return {"message": "Quiz updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error updating quiz", "error": str(e)}, 400

    @auth_required('token')
    @roles_required('admin')
    def delete(self, quiz_id):
        """Admin deletes a quiz."""
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404
        try:
            db.session.delete(quiz)
            db.session.commit()
            return {"message": "Quiz deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error deleting quiz", "error": str(e)}, 400

# ------------------------------------------------------------
# Question Endpoints
# ------------------------------------------------------------
question_parser = reqparse.RequestParser()
question_parser.add_argument('quiz_id', type=int, required=True, help="Quiz ID is required")
question_parser.add_argument('question_statement', type=str, required=True, help="Question statement is required")
question_parser.add_argument('option1', type=str, required=True, help="Option1 is required")
question_parser.add_argument('option2', type=str, required=True, help="Option2 is required")
question_parser.add_argument('option3', type=str, required=False)
question_parser.add_argument('option4', type=str, required=False)
question_parser.add_argument('correct_option', type=str, required=True, help="Correct option is required")

class QuestionResource(Resource):
    @auth_required('token')
    def get(self, question_id=None, quiz_id=None):
        """
        GET questions.
        If quiz_id is provided, returns all questions for that quiz.
        Otherwise, if question_id is provided, returns that specific question.
        """
        if quiz_id:
            questions = Question.query.filter_by(quiz_id=quiz_id).all()
            return [{
                "id": q.id,
                "quiz_id": q.quiz_id,
                "question_statement": q.question_statement,
                "option1": q.option1,
                "option2": q.option2,
                "option3": q.option3,
                "option4": q.option4,
                "correct_option": q.correct_option
            } for q in questions], 200
        elif question_id:
            q = Question.query.get(question_id)
            if q:
                return {
                    "id": q.id,
                    "quiz_id": q.quiz_id,
                    "question_statement": q.question_statement,
                    "option1": q.option1,
                    "option2": q.option2,
                    "option3": q.option3,
                    "option4": q.option4,
                    "correct_option": q.correct_option
                }, 200
            return {"message": "Question not found"}, 404
        return {"message": "Provide quiz_id or question_id"}, 400

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        """Admin creates a new question for a quiz."""
        args = question_parser.parse_args()
        try:
            new_question = Question(
                quiz_id=args['quiz_id'],
                question_statement=args['question_statement'],
                option1=args['option1'],
                option2=args['option2'],
                option3=args.get('option3'),
                option4=args.get('option4'),
                correct_option=args['correct_option']
            )
            db.session.add(new_question)
            db.session.commit()
            return {"message": "Question created successfully", "question_id": new_question.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "Error creating question", "error": str(e)}, 400

    @auth_required('token')
    @roles_required('admin')
    def put(self, question_id):
        """Admin updates an existing question."""
        args = question_parser.parse_args()
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404
        try:
            question.quiz_id = args['quiz_id']
            question.question_statement = args['question_statement']
            question.option1 = args['option1']
            question.option2 = args['option2']
            question.option3 = args.get('option3')
            question.option4 = args.get('option4')
            question.correct_option = args['correct_option']
            db.session.commit()
            return {"message": "Question updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error updating question", "error": str(e)}, 400

    @auth_required('token')
    @roles_required('admin')
    def delete(self, question_id):
        """Admin deletes a question."""
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404
        try:
            db.session.delete(question)
            db.session.commit()
            return {"message": "Question deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error deleting question", "error": str(e)}, 400

# ------------------------------------------------------------
# Score Endpoints (Quiz Attempts)
# ------------------------------------------------------------
score_parser = reqparse.RequestParser()
score_parser.add_argument('quiz_id', type=int, required=True, help="Quiz ID is required")
score_parser.add_argument('total_scored', type=float, required=True, help="Score is required")

class ScoreResource(Resource):
    @auth_required('token')
    def get(self, score_id=None):
        """
        GET scores.
        Admin users see all scores; regular users see only their own scores.
        """
        if current_user.has_role('admin'):
            if score_id:
                score = Score.query.get(score_id)
                if score:
                    return {
                        "id": score.id,
                        "quiz_id": score.quiz_id,
                        "user_id": score.user_id,
                        "time_stamp_of_attempt": score.time_stamp_of_attempt,
                        "total_scored": score.total_scored
                    }, 200
                return {"message": "Score not found"}, 404
            scores = Score.query.all()
            return [{
                "id": s.id,
                "quiz_id": s.quiz_id,
                "user_id": s.user_id,
                "time_stamp_of_attempt": s.time_stamp_of_attempt,
                "total_scored": s.total_scored
            } for s in scores], 200
        else:
            scores = Score.query.filter_by(user_id=current_user.id).all()
            return [{
                "id": s.id,
                "quiz_id": s.quiz_id,
                "time_stamp_of_attempt": s.time_stamp_of_attempt,
                "total_scored": s.total_scored
            } for s in scores], 200

    @auth_required('token')
    def post(self):
        """
        A user submits a score after attempting a quiz.
        """
        args = score_parser.parse_args()
        try:
            new_score = Score(
                quiz_id=args['quiz_id'],
                user_id=current_user.id,
                total_scored=args['total_scored'],
                time_stamp_of_attempt=datetime.datetime.utcnow()
            )
            db.session.add(new_score)
            db.session.commit()
            return {"message": "Score recorded successfully", "score_id": new_score.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "Error recording score", "error": str(e)}, 400

# ------------------------------------------------------------
# Registering Routes
# ------------------------------------------------------------
api.add_resource(SubjectResource, '/api/subjects', '/api/subjects/<int:subject_id>')
api.add_resource(ChapterResource, '/api/chapters', '/api/chapters/<int:chapter_id>')
api.add_resource(QuizResource, '/api/quizzes', '/api/quizzes/<int:quiz_id>')
api.add_resource(QuestionResource, '/api/questions', '/api/questions/<int:question_id>', '/api/quizzes/<int:quiz_id>/questions')
api.add_resource(ScoreResource, '/api/scores', '/api/scores/<int:score_id>')