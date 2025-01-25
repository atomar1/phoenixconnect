from flask import render_template, flash, request, redirect, url_for, session
from application import app, db
from .forms import SignInForm, LoginForm
from werkzeug.security import generate_password_hash, check_password_hash



@app.route("/sign_in", methods=["GET", "POST"])
def sign_in():
    form = SignInForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data

        # Check if user already exists
        existing_user = db.users.find_one({"username": username})
        if existing_user:
            flash("Username already exists. Please choose a different one.", "danger")
            return redirect(url_for("sign_in"))

        # Hash the password and save to DB
        hashed_password = generate_password_hash(password)
        db.users.insert_one({"username": username, "password": hashed_password})
        flash("Sign-up successful! Please log in.", "success")
        return redirect(url_for("login"))
    return render_template("sign_in.html", form=form, title="Sign In")

@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data

        # Check user credentials
        user = db.users.find_one({"username": username})
        if user and check_password_hash(user["password"], password):
            session["user"] = username  # Log the user in
            flash(f"Welcome, {username}!", "success")
            return redirect(url_for("index"))
        else:
            flash("Invalid username or password.", "danger")
    return render_template("login.html", form=form, title="Login")

@app.route("/logout")
def logout():
    session.pop("user", None)
    flash("You have been logged out.", "success")
    return redirect(url_for("index"))

@app.route("/")
def index():
    return render_template("index.html", title="Home")

