from flask import Blueprint, make_response, request, jsonify, current_app
from flask.views import MethodView
from controllers import email

controller = email.controller

router = Blueprint('email', __name__)

router.add_url_rule('/draft', view_func = controller['draft'])
router.add_url_rule('/<email_id>', view_func = controller['email'])
router.add_url_rule('/folder/<email_id>/<folder_id>', view_func = controller['folder'])
router.add_url_rule('/mark/<email_id>/<category>', view_func = controller['mark'])
router.add_url_rule('/send', view_func = controller['send'])
router.add_url_rule('/all', view_func = controller['find_all'])
