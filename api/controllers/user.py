from flask.views import MethodView
from flask import make_response, request, jsonify, current_app

from utils import jwt_encode, hash_password, verify_password
from models import user as UserModel
from models import folder as FolderModel
import re

email_pattern = '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

class Home(MethodView):

    def get(self):
        user = request.environ['user']
        db = request.environ['db']

        if not user:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401

        user_id = user['_id']['$oid']

        folder_ids = user['folders']
        folders = []

        for folder_id in folder_ids:
            folder = FolderModel.findById(db, folder_id['$oid'])
            folders.append(folder)

        return make_response(jsonify({ 'user': user, 'folders': folders })), 200

class Settings(MethodView):

    def put(self):
        post_data = request.get_json(silent = True, force = True)
        user = request.environ['user']
        db = request.environ['db']

        user_id = user['_id']['$oid']

        first_name = post_data['first_name']
        last_name = post_data['last_name']

        UserModel.updateSettings(db, user_id, first_name, last_name)

        return make_response(jsonify({'message': 'Settings Updated!'})), 200

class ResetPassword(MethodView):

    def put(self):
        post_data = request.get_json(silent = True, force = True)

        old_password = post_data['old_password']
        new_password = post_data['new_password']

        db = request.environ['db']
        request_user = request.environ['user']

        if not request_user:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401
        
        user_id = request_user['_id']['$oid']

        user = UserModel.findById(db, user_id)

        stored_password = user['password']

        if not verify_password(stored_password, old_password):
            return make_response(jsonify({'message': 'Incorrect old password!'})), 401

        if len(new_password) < 8 or len(new_password) > 32:
            return make_response(jsonify({'message': 'The password has to be 8 - 32 characters long!'})), 422

        if not (re.search('[a-z]', new_password) and re.search('[A-Z]', new_password) and re.search('[0-9]', new_password)):
            return make_response(jsonify({'message': 'The password must contain a number, a capital and a small character atleast!'})), 422

        hashed_password = hash_password(new_password)        

        UserModel.updatePassword(db, user_id, hashed_password)

        return make_response(jsonify({ 'message': 'Password Successfully updated!' })), 200
    

class FindAll(MethodView):

    def get(self):
        
        db = request.environ['db']

        users = UserModel.findAll(db)
        result = {}
        for user in users:
            result[user['email']] = user['_id']['$oid']

        return make_response(jsonify({ 'users': result })), 200

controller = {
    'home': Home.as_view('home'),
    'settings': Settings.as_view('settings'),
    'reset_password': ResetPassword.as_view('reset_password'),
    'find_all': FindAll.as_view('find_all'),
}
