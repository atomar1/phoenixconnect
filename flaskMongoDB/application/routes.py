from flask.templating import render_template_string
from werkzeug.datastructures import RequestCacheControl
from application import app,db
from flask import render_template, flash, request, redirect
from .forms import TodoForm
from datetime import datetime


@app.route("/")
def index():
    return render_template("views_todos.html", title="Layout page")


@app.route("/add_todo", methods=["POST", "GET"])
def add_todo():
    if request.method == "POST":
        form = TodoForm(request.form)
        todo_name = form.name.data
        todo_description = form.description.data
        completed = form.completed.data

        db.todo_flask.insert_one({
            "name": todo_name,
            "description": todo_description,
            "completed": completed,
            "date_completed": datetime.utcnow()
        })
        flash("Todo successfully added", "success")
        return redirect("/")
    else:
        form = TodoForm()
    return render_template("add_todo.html", form=form)

