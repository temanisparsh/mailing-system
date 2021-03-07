from config import config
from flask_pymongo import PyMongo
from . import verify

class connect:
    def __init__(self, app):
        app.config["MONGO_URI"] = config['dbUrl']
        mongodb_client = PyMongo(app)
        self.db = mongodb_client.db
        self.app = app.wsgi_app
    def __call__(self, environment, response):
        environment['db'] = self.db
        environment['user'] = verify.verifyUser(self.db, environment)
        return self.app(environment, response)
