import os
from flask import Flask

app = Flask(__name__)

# Application config
PORT = os.getenv('PORT', 5000)
DEBUG = os.getenv('DEBUG', 'False')

# Database
DATABASE_URL = os.environ['DATABASE_URL']
REDIS_HOST = os.environ.get('REDIS_HOST')

# Authentication
SECRET_KEY = os.getenv('SECRET_KEY')
JWT_SECRET = os.environ['JWT_SECRET']

# External APIs
STRIPE_API_KEY = os.getenv('STRIPE_API_KEY')
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')

if __name__ == '__main__':
    app.run(port=PORT, debug=DEBUG)
