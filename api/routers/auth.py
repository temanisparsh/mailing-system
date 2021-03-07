from flask import Blueprint, make_response, request, jsonify, current_app
from flask.views import MethodView
from controllers import auth

controller = auth.controller

router = Blueprint('auth', __name__)

router.add_url_rule('/login', view_func = controller['login'])
router.add_url_rule('/register', view_func = controller['register'])
