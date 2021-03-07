from utils import parse_mongo
from bson.objectid import ObjectId

category_names = ['starred', 'spam', 'inbox', 'important', 'sent', 'trash']

def create(db, subject, content, from_user, to_user):
    email = { 'subject': subject, 'content': content, 'from_user': ObjectId(from_user), 'is_draft': True }
    if to_user:
        email = { 'subject': subject, 'content': content, 'from_user': ObjectId(from_user), 'to_user': ObjectId(to_user), 'is_draft': True }
    return db.emails.insert_one(email)

def updateEmail(db, user_id, subject, email_id, content, to_user, is_draft):
    db.emails.update_one({'_id': ObjectId(email_id)}, { '$set': {'subject': subject, 'content': content, 'is_draft': is_draft }})
    if to_user:
        db.emails.update_one({'_id': ObjectId(email_id)}, { '$set': {'subject': subject, 'content': content, 'is_draft': is_draft, 'to_user': ObjectId(to_user) }})
    if is_draft:
        db.users.update_one({ '_id': ObjectId(user_id) }, { '$addToSet': { 'draft': ObjectId(email_id) } })

def removeFromAllCategories(db, user_id, email_id):
    for cat in category_names:
        db.users.update_one({ '_id': ObjectId(user_id) }, { '$pull': { cat: ObjectId(email_id) } })

def addToCategory(db, user_id, email_id, category):
    if category not in category_names:
        return
    removeFromAllCategories(db, user_id, email_id)
    db.users.update_one({ '_id': ObjectId(user_id) }, { '$addToSet': { category: ObjectId(email_id) } })

def findById(db, email_id):
    email = db.emails.find_one({ '_id': ObjectId(email_id) })
    return parse_mongo(email)

def addToDraft(db, user_id, email_id):
    db.users.update_one({ '_id': ObjectId(user_id) }, { '$addToSet': { 'draft': ObjectId(email_id) } })

def deleteDraft(db, user_id, email_id):
    db.users.update_one({ '_id': ObjectId(user_id) }, { '$pull': { 'draft': ObjectId(email_id) } })
    db.emails.remove({'_id': ObjectId(email_id)})

def sendEmail(db, email_id):
    email = findById(db, email_id)
    email = parse_mongo(email)
    if not email['to_user']:
        return
    db.emails.update_one({ '_id': ObjectId(email_id) }, { '$set': { 'is_draft': False }})
    to_user_id = email['to_user']['$oid']
    from_user_id = email['from_user']['$oid']

    db.users.update_one({ '_id': ObjectId(from_user_id) }, { '$pull': { 'draft': ObjectId(email_id) } })

    db.users.update_one({ '_id': ObjectId(from_user_id) }, { '$addToSet': { 'sent': ObjectId(email_id) } })
    db.users.update_one({ '_id': ObjectId(to_user_id) }, { '$addToSet': { 'inbox': ObjectId(email_id) } })
