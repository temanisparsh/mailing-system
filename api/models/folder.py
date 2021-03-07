from utils import parse_mongo
from bson.objectid import ObjectId
from . import email as EmailModel

def create(db, user_id, folder_name):
    folder = { 'user': ObjectId(user_id), 'folder_name': folder_name, 'emails': [] }
    folder = db.folders.insert_one(folder)

    db.users.update_one({ '_id': ObjectId(user_id) }, { '$addToSet': { 'folders': folder.inserted_id } })

    return folder

def addEmailToFolder(db, email_id, folder_id):
    db.folders.update_one({ '_id': ObjectId(folder_id) }, { '$addToSet': { 'emails': ObjectId(email_id) } })

def removeFromAllFolders(db, user_id, email_id):
    user = db.users.find_one({ '_id': ObjectId(user_id) })
    user = parse_mongo(user)

    folders = user['folders']
    for folder in folders:
        folder_id = folder['$oid']
        db.folders.update_one({ '_id': ObjectId(folder_id) }, { '$pull': { 'emails': ObjectId(email_id) } })

def findById(db, folder_id):
    folder = db.folders.find_one({ '_id': ObjectId(folder_id) })
    return parse_mongo(folder)

def update(db, folder_id, folder_name):
    db.folders.update_one({'_id': ObjectId(folder_id)}, {'$set': {'folder_name': folder_name}})

def delete(db, folder_id):
    folder = db.folders.find_one({ '_id': ObjectId(folder_id) })
    folder = parse_mongo(folder)
    user_id = folder['user']['$oid']
    emails_ids = folder['emails']

    for email_id in emails_ids:
        if EmailModel.findById(db, email_id['$oid']):
            EmailModel.addToCategory(db, user_id, email_id['$oid'], 'inbox')

    db.users.update_one({ '_id': ObjectId(user_id) }, { '$pull': { 'folders': ObjectId(folder_id) } })
    db.folders.remove({'_id': ObjectId(folder_id) })
    

