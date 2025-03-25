from flask import jsonify, current_app as app
from flask_security import auth_required, roles_required, current_user
from .database import db 
from .models import User, Role
from flask import current_app as app, jsonify, request, render_template, send_from_directory
from flask_security import auth_required, roles_required, roles_accepted, current_user, login_user
from werkzeug.security import check_password_hash, generate_password_hash

@app.route('/')
def lp():
    return jsonify({
        'message': 'susvagatam'
    })

# @app.route('/api/login', methods=['GET'])
# @auth_required('token') # Requires authentication via token
# def login():
#     return jsonify({
#         "message": "Login successful",
#         "user": {
#             "id": current_user.id,
#             "email": current_user.email,
#             "roles": [role.name for role in current_user.roles]
#         }
#     }), 2

@app.route('/api/login', methods=['POST'])
def user_login():
     body = request.get_json()
     email = body['email']
     password = body['password']
 
     if not email:
         return jsonify({
             "message": "Email is required!"
         }), 400
     
     user = app.security.datastore.find_user(email = email)
 
     if user:
         if check_password_hash(user.password, password):
             
             # if current_user is not None:
             #     return jsonify({
             #     "message": "Already logged in!"
             # }), 400
             login_user(user)
             print(current_user)
             return jsonify({
                 "id": user.id,
                 "full_name": user.full_name,
                 "auth-token": user.get_auth_token()
             })
         else:
             return jsonify({
                 "message": "Incorrect Password"
             }), 400
     else:
        return jsonify({
             "message": "User Not Found!"
         }), 404

@app.route('/api/register', methods=['POST'])
def create_user():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email = credentials["email"]):
        app.security.datastore.create_user(email = credentials["email"],
                                            full_name = credentials["full_name"],
                                            password = generate_password_hash(credentials["password"]),
                                            roles = ['user'])
        db.session.commit()
        return jsonify({
             "message": "User created successfully"
         }), 201
    return jsonify({
         "message": "User already exists!"
     }), 400