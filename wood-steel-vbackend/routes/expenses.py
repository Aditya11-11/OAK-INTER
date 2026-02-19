from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson import ObjectId
from database import expenses_col

expenses_bp = Blueprint("expenses", __name__)

def parse_expense(exp):
    exp["id"] = str(exp["_id"])
    del exp["_id"]
    return exp

@expenses_bp.route("", methods=["GET"])
@jwt_required()
def get_expenses():
    exps = list(expenses_col.find({}))
    return jsonify([parse_expense(e) for e in exps])

@expenses_bp.route("", methods=["POST"])
@jwt_required()
def add_expense():
    from datetime import datetime
    data = request.get_json()
    data["created_at"] = datetime.utcnow()
    result = expenses_col.insert_one(data)
    return jsonify({"id": str(result.inserted_id)}), 201
