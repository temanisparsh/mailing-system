import os
import sys
import json
from flask import Flask
from flask_cors import CORS


from config import config
import logging
from middlewares import db
from routers import user, auth, email, folder

from werkzeug.exceptions import HTTPException

sys.path.insert(0, os.getcwd())

def add_routers(app):
    app.register_blueprint(user.router, url_prefix='/api/v1/user')
    app.register_blueprint(auth.router, url_prefix='/api/v1/auth')
    app.register_blueprint(email.router, url_prefix='/api/v1/email')
    app.register_blueprint(folder.router, url_prefix='/api/v1/folder')


app = Flask(__name__, static_folder='', static_url_path='')

CORS(app)

app.wsgi_app = db.connect(app)

add_routers(app)

logging.basicConfig(level=logging.DEBUG)

@app.errorhandler(HTTPException)
def handle_exception(e):
    response = e.get_response()
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    })
    response.content_type = "application/json"
    return response

if __name__ == '__main__':
    app.run(host=config['app']['host'], port=config['app']
            ['port'], debug=config['debug'])
