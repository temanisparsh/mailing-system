import jwt
import json
import hashlib, binascii
from bson.json_util import dumps

from config import config

salt = config['app']['hashSalt'].encode('utf-8')
jwtSecret = config['app']['jwtSecret']

def parse_mongo(obj):
    return json.loads(dumps(obj))

def hash_password(password):

    pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), 
                                salt, 100000)
    pwdhash = binascii.hexlify(pwdhash)
    return (salt + pwdhash).decode('ascii')

def verify_password(stored_password, provided_password):
    stored_salt = stored_password[:len(salt)]
    stored_password = stored_password[len(salt):]
    pwdhash = hashlib.pbkdf2_hmac('sha512', 
                                  provided_password.encode('utf-8'), 
                                  stored_salt.encode('ascii'),
                                  100000)
    pwdhash = binascii.hexlify(pwdhash).decode('ascii')
    return pwdhash == stored_password

def jwt_encode(content):
    return jwt.encode(content, jwtSecret, algorithm = "HS256")

def jwt_decode(content):
    return jwt.decode(content, jwtSecret, algorithm = "HS256")
