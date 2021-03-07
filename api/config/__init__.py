import json

import os

env_list = ['development', 'production', 'test']

env = os.getenv('FLASK_ENV', 'development')
if env not in env_list:
    env = 'development'

config_file = './config/%s.json' % env
config = dict()

with open(config_file, 'r') as file:
    config = json.load(file)

config['debug'] = env == 'development'
