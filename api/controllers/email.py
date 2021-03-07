from flask.views import MethodView
from flask import make_response, request, jsonify, current_app

from utils import jwt_encode, hash_password, verify_password
from models import user as UserModel
from models import folder as FolderModel
from models import email as EmailModel
import re

class Draft(MethodView):
    def post(self):
        post_data = request.get_json(silent = True, force = True)
    
        user = request.environ['user']
        db = request.environ['db']
        user_id = user['_id']['$oid']

        if not user:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401

        content = post_data['content']
        subject = post_data['subject']
        to_user = None
        if 'to_user' in post_data:
            to_user = post_data['to_user']
            try:
                if not UserModel.findById(db, to_user):
                    return make_response(jsonify({ 'message': 'Invalid Receivers Email!' })), 400
            except:
                return make_response(jsonify({ 'message': 'Invalid Receivers Email!' })), 400
        from_user = user_id

        inserted_email = EmailModel.create(db, subject, content, from_user, to_user)
        EmailModel.addToDraft(db, user_id, inserted_email.inserted_id)


        return make_response(jsonify({'message': 'Email saved as draft!'})), 200
    
    def put(self):
        post_data = request.get_json(silent = True, force = True)
    
        user = request.environ['user']
        db = request.environ['db']
        user_id = user['_id']['$oid']
        email_id = post_data['email_id']

        email = EmailModel.findById(db, email_id)

        if  user_id != email['from_user']['$oid']:
            return make_response(jsonify({ 'message': 'Unauthorized!' })), 401

        if not email['is_draft']:
            return make_response(jsonify({ 'message': 'Method not allowed!' })), 400

        content = post_data['content']
        subject = post_data['subject']
        to_user = None
        if 'to_user' in post_data:
            to_user = post_data['to_user']
            try:
                if not UserModel.findById(db, to_user):
                    return make_response(jsonify({ 'message': 'Invalid Receivers Email!' })), 400
            except:
                return make_response(jsonify({ 'message': 'Invalid Receivers Email!' })), 400
        from_user = user_id

        EmailModel.updateEmail(db, user_id, subject, email_id, content, to_user, is_draft = True)

        return make_response(jsonify({'message': 'Email saved as draft!'})), 200

class Email(MethodView):    
    def get(self, email_id):
        
        user = request.environ['user']
        db = request.environ['db']
        user_id = user['_id']['$oid']

        if not user:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401

        email = EmailModel.findById(db, email_id)

        if (('to_user' in email) and user_id != email['to_user']['$oid']) and user_id != email['from_user']['$oid']:
            return make_response(jsonify({ 'message': 'Unauthorized!' })), 401
        
        return make_response(jsonify({'email': email})), 200

    def delete(self, email_id):
        user = request.environ['user']
        db = request.environ['db']
        user_id = user['_id']['$oid']

        if not user:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401

        email = EmailModel.findById(db, email_id)

        if email['is_draft'] and user_id == email['from_user']['$oid']:
            EmailModel.deleteDraft(db, email_id)
        if (('to_user' in email) and user_id != email['to_user']['$oid']) and user_id != email['from_user']['$oid']:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401

        EmailModel.removeFromAllCategories(db, user_id, email_id)
        FolderModel.removeFromAllFolders(db, user_id, email_id)

        return make_response(jsonify({'message': 'Email Deleted Successfully!'})), 200

class Folder(MethodView):
    def post(self, email_id, folder_id):

        post_data = request.get_json(silent = True, force = True)

        user = request.environ['user']
        db = request.environ['db']
        user_id = user['_id']['$oid']

        if not user:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401

        email = EmailModel.findById(db, email_id)

        if not( user_id == email['to_user']['$oid'] or user_id == email['from_user']['$oid']):
            return make_response(jsonify({ 'message': 'Unauthorized!' })), 401

        folder = FolderModel.findById(db, folder_id)
        print(folder)
        if not folder:
            return make_response(jsonify({ 'message': 'Invalid folder!' })), 401
        
        if user_id != folder['user']['$oid']:
            return make_response(jsonify({ 'message': 'Unauthorized!' })), 401

        EmailModel.removeFromAllCategories(db, user_id, email_id)
        FolderModel.removeFromAllFolders(db, user_id, email_id)

        FolderModel.addEmailToFolder(db, email_id, folder_id)

        return make_response(jsonify({'message': 'Email moved to folder %s!' % folder['folder_name']})), 200

class Mark(MethodView):

    def post(self, email_id, category):

        post_data = request.get_json(silent = True, force = True)

        user = request.environ['user']
        db = request.environ['db']
        user_id = user['_id']['$oid']

        if not user:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401

        email = EmailModel.findById(db, email_id)

        if not( user_id == email['to_user']['$oid'] or user_id == email['from_user']['$oid']):
            return make_response(jsonify({ 'message': 'Unauthorized!' })), 401

        if category not in EmailModel.category_names:
            return make_response(jsonify({ 'message': 'Invalid category name!' })), 400

        EmailModel.removeFromAllCategories(db, user_id, email_id)
        FolderModel.removeFromAllFolders(db, user_id, email_id)

        EmailModel.addToCategory(db, user_id, email_id, category)

        return make_response(jsonify({'message': 'Email moved to %s!' % category})), 200


class Send(MethodView):

    def post(self):
        post_data = request.get_json(silent = True, force = True)
    
        user = request.environ['user']
        db = request.environ['db']
        user_id = user['_id']['$oid']

        if not user:
            return make_response(jsonify({ 'message': 'Unauthenticated!' })), 401

        convert_draft = post_data['is_draft']
        if convert_draft:
            email_id = post_data['email_id']
            email = EmailModel.findById(db, email_id)
            if user_id != email['from_user']['$oid']:
                return make_response(jsonify({ 'message': 'Unauthorized!' })), 401
            EmailModel.sendEmail(db, email_id)
        else:
            
            content = post_data['content']
            subject = post_data['subject']
            to_user = post_data['to_user']
            try:
                if not UserModel.findById(db, to_user):
                    return make_response(jsonify({ 'message': 'Invalid Receivers Email!' })), 400
            except:
                return make_response(jsonify({ 'message': 'Invalid Receivers Email!' })), 400
            from_user = user_id

            email = EmailModel.create(db, subject, content, from_user, to_user)
            EmailModel.sendEmail(db, email.inserted_id)

        return make_response(jsonify({'message': 'Email sent successfully!'})), 200

class FindAll(MethodView):

    def post(self):
        post_data = request.get_json(silent = True, force = True)
    
        user = request.environ['user']
        db = request.environ['db']
        user_id = user['_id']['$oid']

        email_ids = post_data['email_ids']

        result = []
        for email_id in email_ids:
            email = EmailModel.findById(db, email_id)
            if not( ('to_user' in email) and user_id == email['to_user']['$oid'] or user_id == email['from_user']['$oid']):
                return make_response(jsonify({ 'message': 'Unauthorized!' })), 401
            result.append(email)
        
        return make_response(jsonify({'emails': result})), 200

controller = {
    'draft': Draft.as_view('draft'),
    'email': Email.as_view('email'),
    'folder': Folder.as_view('folder'),
    'mark': Mark.as_view('mark'),
    'send': Send.as_view('send'),
    'find_all': FindAll.as_view('find_all')
}
