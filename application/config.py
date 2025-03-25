class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class LocalDevelopmentConfig(Config):
    #below is the database configuration
    SQLALCHEMY_DATABASE_URI = "sqlite:///qma.sqlite3"
    DEBUG = True
    #below is the security configuration
    SECRET_KEY = "bekar_key" #this is the hash used in cred session for authentication purposes only
    SECURITY_PASSWORD_HASH = "bcrypt" #this is the hash mechanism used for hashing passwords in credentials table for authentication purposes only
    SECURITY_PASSWORD_SALT = "this-is-my-secret-password-salt" #hash user credentials in session
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"