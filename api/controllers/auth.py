from flask.views import MethodView
from flask import make_response, request, jsonify, current_app

from utils import jwt_encode, hash_password, verify_password
from models import user as UserModel

import re

email_pattern = '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

class Login(MethodView):
    def post(self):

        post_data = request.get_json(silent = True, force = True)

        email = post_data['email']
        provided_password = post_data['password']

        db = request.environ['db']

        user = UserModel.findByEmail(db, email)

        if not user:
            return make_response(jsonify({ 'message': 'Email Id does not exist!' })), 401
        
        password = user['password']

        if not verify_password(password, provided_password):
            return make_response(jsonify({'message': 'Incorrect email or password!'})), 401

        token = jwt_encode({ 'user_id': user['_id']['$oid'] })

        return make_response(jsonify({'token': token})), 200

class Register(MethodView):
    
    def post(self):
         
        post_data = request.get_json(silent = True, force = True)

        email = post_data['email']

        if not re.match(email_pattern, email):
            return make_response(jsonify({'message': 'Invalid email Id!'})), 422

        password = post_data['password']

        if len(password) < 8 or len(password) > 32:
            return make_response(jsonify({'message': 'The password has to be 8 - 32 characters long!'})), 422

        if not (re.search('[a-z]', password) and re.search('[A-Z]', password) and re.search('[0-9]', password)):
            return make_response(jsonify({'message': 'The password must contain a number, a capital and a small character atleast!'})), 422

        first_name = post_data['first_name']
        last_name = post_data['last_name']

        if not(len(first_name) and len(last_name)):
            return make_response(jsonify({'message': 'First and Last name cannot be empty!'})), 422

        db = request.environ['db']

        user = UserModel.findByEmail(db, email)
        if user:
            return make_response(jsonify({'message': 'User with the given email ID already exists!'})), 401

        UserModel.create(db, email, hash_password(password), first_name, last_name)
        user = UserModel.findByEmail(db, email)

        token = jwt_encode({ 'user_id': user['_id']['$oid'] })

        return make_response(jsonify({'token': token})), 200

controller = {
    'login': Login.as_view('login'),
    'register': Register.as_view('register'),
}
