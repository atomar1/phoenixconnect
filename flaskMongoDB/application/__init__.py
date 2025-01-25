from flask import Flask
from flask_pymongo import PyMongo
app = Flask(__name__)
app.config["SECRET_KEY"] = "c2bd371f08b8a505f82b04819ffc133ff8eb3a7e"
app.config["MONGO_URI"] = "mongodb+srv://phoenix:phoenix123@cluster0.0uadu.mongodb.net/todo_db?retryWrites=true&w=majority"

mongodb_client = PyMongo(app)
db = mongodb_client.db

from application import routes
