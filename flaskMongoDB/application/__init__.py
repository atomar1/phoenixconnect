import os
from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo

# Get the absolute path of the project directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder="static")

CORS(app, origins=["http://localhost:5173"])

# Ensure the uploads directory exists
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["SECRET_KEY"] = "c2bd371f08b8a505f82b04819ffc133ff8eb3a7e"
app.config["MONGO_URI"] = "mongodb+srv://ivan:ivan123@cluster0.0uadu.mongodb.net/userinfo_db?retryWrites=true&w=majority"

mongodb_client = PyMongo(app)
db = mongodb_client.db

from application import routes

# mongodb+srv://ivan:ivan123@cluster0.0uadu.mongodb.net/userinfo_db?retryWrites=true&w=majority
