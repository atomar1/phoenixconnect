import os
from flask import render_template, flash, request, redirect, url_for, session, send_from_directory
from application import app, db
from .forms import SignInForm, LoginForm
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename

# Configure upload folder and allowed extensions
UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Helper function to check allowed extensions


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    print(f"Attempting to serve file: {filename}")
    # Use absolute path from project root
    base_dir = os.path.dirname(os.path.abspath(__file__))
    uploads_dir = os.path.join(base_dir, 'static', 'uploads')
    full_path = os.path.join(uploads_dir, filename)

    print(f"Base directory: {base_dir}")
    print(f"Uploads directory: {uploads_dir}")
    print(f"Full file path: {full_path}")
    print(f"File exists: {os.path.exists(full_path)}")

    return send_from_directory(uploads_dir, filename)


@app.route("/sign_in", methods=["GET", "POST"])
def sign_in():
    form = SignInForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        confirm_password = form.confirm_password.data

        # Check if passwords match
        if password != confirm_password:
            flash("Passwords do not match. Please try again.", "danger")
            return render_template("sign_in.html", form=form)

        # Check if the username already exists
        existing_user = db.users.find_one({"username": username})
        if existing_user:
            flash("Username already exists. Please choose a different one.", "danger")
            return render_template("sign_in.html", form=form)

        # If validation passes, hash the password
        hashed_password = generate_password_hash(password)

        # Handle profile image upload
        if "profile_image" in request.files:
            profile_image = request.files["profile_image"]
            if profile_image and allowed_file(profile_image.filename):
                filename = secure_filename(profile_image.filename)
                image_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                profile_image.save(image_path)
                profile_image_url = f'/uploads/{filename}'
            else:
                profile_image_url = "/static/default-profile.png"  # Default image
        else:
            profile_image_url = "/static/default-profile.png"

        # Save the user data, including profile image
        db.users.insert_one({
            "username": username,
            "password": hashed_password,
            "profile_image": profile_image_url
        })

        session["user"] = username
        session["profile_image"] = profile_image_url
        flash(f"Welcome, {username}! You have successfully signed in.", "success")
        return redirect(url_for("index"))  # Redirect to the homepage

    return render_template("sign_in.html", form=form)


@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data

        # Check if the user exists
        user = db.users.find_one({"username": username})
        if not user:
            flash("User does not exist.", "danger")
            return render_template("login.html", form=form, title="Login")

        # Check password
        if not check_password_hash(user["password"], password):
            flash("Incorrect password.", "danger")
            return render_template("login.html", form=form, title="Login")

        # Log in the user if credentials are valid
        session["user"] = username
        session["profile_image"] = user.get("profile_image", "/static/default-profile.png")  # Add this line
        flash(f"Welcome back, {username}!", "success")
        return redirect(url_for("index"))

    return render_template("login.html", form=form, title="Login")



@app.route("/logout")
def logout():
    session.pop("user", None)
    flash("You have been logged out.", "info")  # Remove this if not required
    return redirect(url_for("login"))

"""
def custom_json_serializer(data):
    if isinstance(data, list):
        return [custom_json_serializer(item) for item in data]
    if isinstance(data, dict):
        return {key: custom_json_serializer(value) for key, value in data.items()}
    if isinstance(data, ObjectId):
        return str(data)  # Convert ObjectId to string
    if isinstance(data, datetime.datetime):
        return data.isoformat()  # Convert datetime to ISO format
    return data  # Return data as-is for other types

"""

def mjsonify(data):
    if isinstance(data, list):
        return [mjsonify(d) for d in data]
    if isinstance(data, dict):
        return {key: mjsonify(value) for key, value in data.items()}
    if isinstance(data, ObjectId):
        return str(data)
    if isinstance(data, datetime):
        return data.isoformat()
    return data


@app.route("/")
def index():
    # Check if the user is logged in
    # if "user" not in session:
    #     return render_template("welcome.html")  # Render the welcome page

    # Fetch posts and comments if the user is logged in
    posts = list(db.posts.find().sort("timestamp", -1))
    for post in posts:
        post["_id"] = str(post["_id"])  # Convert ObjectId to string for HTML
        post["comments"] = list(
            db.comments.find({"post_id": ObjectId(post["_id"])}).sort(
                "timestamp", -1)
        )
    for post in posts:
        user = db.users.find_one({"username": post["username"]})
        post["user_profile_image"] = user.get("profile_image", "/static/default-profile.png")

    # print(posts)
    return mjsonify(posts)

    # return render_template("index.html", posts=posts, username=session.get("user"))


@app.route("/create_post", methods=["GET", "POST"])
def create_post():
    if "user" not in session:
        flash("Please log in to create a post.", "warning")
        return redirect(url_for("login"))

    if request.method == "POST":
        content = request.form.get("content")
        if not content:
            flash("Post content cannot be empty.", "danger")
            return redirect(url_for("create_post"))

        image_url = None
        if "image" in request.files:
            image = request.files["image"]
            if image and allowed_file(image.filename):
                filename = secure_filename(image.filename)

                # Use absolute path to uploads directory
                base_dir = os.path.dirname(os.path.abspath(__file__))
                uploads_dir = os.path.join(base_dir, 'static', 'uploads')
                os.makedirs(uploads_dir, exist_ok=True)

                image_path = os.path.join(uploads_dir, filename)
                image.save(image_path)

                # Generate URL
                image_url = f'/uploads/{filename}'
                print(f"Image saved to: {image_path}")
                print(f"Image URL generated: {image_url}")

        # Insert the post into the database
        result = db.posts.insert_one({
            "username": session["user"],
            "content": content,
            "image_url": image_url,
            "timestamp": datetime.utcnow()
        })

        flash("Post created successfully!", "success")
        return redirect(url_for("index"))

    return render_template("create_post.html", title="Create Post")


@app.route("/add_comment/<post_id>", methods=["POST"])
def add_comment(post_id):
    if "user" not in session:
        flash("Please log in to comment.", "warning")
        return redirect(url_for("login"))

    content = request.form.get("comment_content")
    if not content:
        flash("Comment cannot be empty.", "danger")
        return redirect(url_for("index"))

    # Insert the comment into the database
    db.comments.insert_one({
        "post_id": ObjectId(post_id),  # Link comment to the post
        "username": session["user"],
        "content": content,
        "timestamp": datetime.utcnow()
    })
    flash("Comment added successfully!", "success")
    return redirect(url_for("index"))

@app.route("/profile/<username>")
def profile(username):
    user = db.users.find_one({"username": username})
    if not user:
        flash("User not found.", "danger")
        return redirect(url_for("index"))

    posts = list(db.posts.find({"username": username}).sort("timestamp", -1))
    for post in posts:
        post["_id"] = str(post["_id"])
        post["comments"] = list(db.comments.find({"post_id": ObjectId(post["_id"])}).sort("timestamp", -1))

    return render_template("profile.html", user=user, posts=posts)
