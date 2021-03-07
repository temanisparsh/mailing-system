from flask import Blueprint, make_response, request, jsonify, current_app
from flask.views import MethodView
from controllers import folder

controller = folder.controller

router = Blueprint('folder', __name__)

router.add_url_rule('', view_func = controller['folder'])
