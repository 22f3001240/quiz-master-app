import os
import csv
from celery import shared_task
from .database import db
from .models import User, Score, Quiz
from flask import current_app

def get_report_filename():
    """Generates a timestamped CSV filename."""
    from datetime import datetime
    return f"user_performance_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.csv"

@shared_task(ignore_results=False, name="download_csv_report")
def csv_report():
    """Generates a CSV file for user performance data."""
    report_dir = os.path.join(current_app.root_path, "reports")
    os.makedirs(report_dir, exist_ok=True)
    filename = get_report_filename()
    filepath = os.path.join(report_dir, filename)
    
    try:
        with open(filepath, "w", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["User ID", "Full Name", "Email", "Quiz ID", "Quiz Date", "Score"])
            
            users = User.query.all()
            for user in users:
                scores = Score.query.filter_by(user_id=user.id).all()
                for score in scores:
                    quiz = Quiz.query.get(score.quiz_id)
                    writer.writerow([user.id, user.full_name, user.email, quiz.id, quiz.date_of_quiz, score.total_scored])
        
        return filename  # Returning filename to be used in /api/result/<id>
    except Exception as e:
        return str(e)

@shared_task(ignore_results=False, name="monthly_report")
def m_report():
    """Placeholder task for sending monthly reports."""
    return "Monthly reports sent"