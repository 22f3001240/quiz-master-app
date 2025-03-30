from flask import Flask 
from application.database import db
from application.models import User, Role, Subject, Chapter, Quiz, Question, Score #add the name of data models here
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from werkzeug.security import check_password_hash, generate_password_hash
from application.resources import api
from application.cel_init import celery_init_app

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role) #add name of models that will be imported from models.py
    app.security = Security(app, datastore)
    app.app_context().push()
    return app

app = create_app()
celery = celery_init_app(app)

with app.app_context():
    """Create all tables in the database."""
    db.create_all()
    app.security.datastore.find_or_create_role(name = "admin", description = "Superuser of app")
    app.security.datastore.find_or_create_role(name = "user", description = "General user of app")
    db.session.commit()

    # Add default admin user and roles if not already present
    if not app.security.datastore.find_user(email = "user0@admin.com"):
        app.security.datastore.create_user(email = "user0@admin.com",
                                           full_name = "admin01",
                                           password = generate_password_hash("1234"),
                                           roles = ['admin'])
        
    if not app.security.datastore.find_user(email = "user1@user.com"):
        app.security.datastore.create_user(email = "user1@user.com",
                                           full_name = "user01",
                                           password = generate_password_hash("1234"),
                                           roles = ['user'])
    db.session.commit()

from application.routes import *

if __name__ == '__main__':
    app.run(debug=True)