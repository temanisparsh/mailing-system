from utils import jwt_decode, parse_mongo
from models import user as User
from bson.objectid import ObjectId

def verifyUser(db, environment):
    if 'HTTP_AUTHORIZATION' not in environment:
        return None
    jwt = environment['HTTP_AUTHORIZATION']
    if not jwt:
        return None

    try:
        user = jwt_decode(jwt)
    except:
        return None

    if 'user_id' not in user:
        return None
    
    user = User.findById(db, user['user_id'])

    return parse_mongo(user)
