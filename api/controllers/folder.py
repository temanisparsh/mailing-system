from flask.views import MethodView
from flask import make_response, request, jsonify, current_app

from utils import jwt_encode, hash_password, verify_password
from models import folder as FolderModel

import re

class Folder(MethodView):
    
    def get(self):
        folder_id = request.args.get('folder_id')

        db = request.environ['db']
        user = request.environ['user']

        if not user:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401

        user_id = user['_id']['$oid']
        folder = FolderModel.findById(db, folder_id)

        if  user_id != folder['user']['$oid']:
            return make_response(jsonify({ 'message': 'Unauthorized!' })), 401
        
        return make_response(jsonify({'folder': folder})), 200

    def post(self):
        post_data = request.get_json(silent = True, force = True)
        db = request.environ['db']
        user = request.environ['user']
        folder_name = post_data['folder_name']

        if not user:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401

        user_id = user['_id']['$oid']

        folder = FolderModel.create(db, user_id, folder_name)

        return make_response(jsonify({'message': 'Folder %s created successfully!' % folder_name})), 200


    def put(self):
        folder_id = request.args.get('folder_id')
        post_data = request.get_json(silent = True, force = True)

        db = request.environ['db']
        user = request.environ['user']

        if not user:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401

        user_id = user['_id']['$oid']
        folder = FolderModel.findById(db, folder_id)

        if  user_id != folder['user']['$oid']:
            return make_response(jsonify({ 'message': 'Unauthorized!' })), 401

        folder_name = post_data['folder_name']

        FolderModel.update(db, folder_id, folder_name)
        return make_response(jsonify({'message': 'Folder updated successfully'})), 200

    def delete(self):
        folder_id = request.args.get('folder_id')

        db = request.environ['db']
        user = request.environ['user']

        if not user:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401

        user_id = user['_id']['$oid']
        folder = FolderModel.findById(db, folder_id)

        if  user_id != folder['user']['$oid']:
            return make_response(jsonify({ 'message': 'Unauthorized!' })), 401

        FolderModel.delete(db, folder_id)
        return make_response(jsonify({'message': 'Folder deleted successfully'})), 200

controller = {
    'folder': Folder.as_view('folder'),
}
