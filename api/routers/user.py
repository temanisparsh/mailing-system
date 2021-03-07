from flask import Blueprint, make_response, request, jsonify, current_app
from flask.views import MethodView
from controllers import user

controller = user.controller

router = Blueprint('user', __name__)

router.add_url_rule('/home', view_func = controller['home'])
router.add_url_rule('/settings', view_func = controller['settings'])
router.add_url_rule('/reset_password', view_func = controller['reset_password'])
router.add_url_rule('/all', view_func = controller['find_all'])
