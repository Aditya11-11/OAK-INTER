from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
import bcrypt
from database import users_col

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    if users_col.find_one({"email": email}):
        return jsonify({"msg": "User already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users_col.insert_one({
        "email": email,
        "password": hashed_password
    })

    return jsonify({"msg": "User created successfully"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = users_col.find_one({"email": email})
    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token), 200

    return jsonify({"msg": "Bad email or password"}), 401

@auth_bp.route("/update", methods=["POST"])
@jwt_required()
def update_account():
    from flask_jwt_extended import get_jwt_identity
    current_user_email = get_jwt_identity()
    data = request.get_json()
    
    new_email = data.get("email")
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    user = users_col.find_one({"email": current_user_email})
    if not user or not bcrypt.checkpw(current_password.encode("utf-8"), user["password"]):
        return jsonify({"msg": "Invalid current password"}), 401

    update_data = {}
    if new_email:
        update_data["email"] = new_email
    if new_password:
        update_data["password"] = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())

    if update_data:
        users_col.update_one({"email": current_user_email}, {"$set": update_data})
        return jsonify({"msg": "Account updated successfully"}), 200

    return jsonify({"msg": "No changes provided"}), 400
