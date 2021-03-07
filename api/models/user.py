from utils import parse_mongo
from bson.objectid import ObjectId

def create(db, email, password, first_name, last_name):
    user = {'email': email, 'password': password, 'first_name': first_name, 'last_name': last_name, 'spam': [
    ],  'sent': [], 'inbox': [], 'important': [], 'trash': [], 'draft': [], 'starred': [], 'folders': []}
    return db.users.insert_one(user)

def findByEmail(db, email):
    user = db.users.find_one({'email': email})
    return parse_mongo(user)

def findById(db, user_id):
    user = db.users.find_one({'_id': ObjectId(user_id)})
    return parse_mongo(user)

def updatePassword(db, user_id, password):
    db.users.update_one({'_id': ObjectId(user_id)}, { '$set': {'password': password}})

def updateSettings(db, user_id, first_name, last_name):
    db.users.update_one({'_id': ObjectId(user_id)}, { '$set': {
                        'first_name': first_name, 'last_name': last_name}})

def findAll(db):
    users = db.users.find()
    return parse_mongo(users)
