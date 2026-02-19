from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson import ObjectId
from database import laborers_col

labor_bp = Blueprint("labor", __name__)

def parse_laborer(lab):
    lab["id"] = str(lab["_id"])
    del lab["_id"]
    return lab

@labor_bp.route("", methods=["GET"])
@jwt_required()
def get_laborers():
    labs = list(laborers_col.find({}))
    return jsonify([parse_laborer(l) for l in labs])

@labor_bp.route("", methods=["POST"])
@jwt_required()
def add_laborer():
    from datetime import datetime
    data = request.get_json()
    if "history" not in data: data["history"] = []
    data["created_at"] = datetime.utcnow()
    data["updated_at"] = datetime.utcnow()
    result = laborers_col.insert_one(data)
    return jsonify({"id": str(result.inserted_id)}), 201

@labor_bp.route("/<id>", methods=["PUT"])
@jwt_required()
def update_laborer(id):
    from datetime import datetime
    data = request.get_json()
    if "id" in data: del data["id"]
    data["updated_at"] = datetime.utcnow()
    laborers_col.update_one({"_id": ObjectId(id)}, {"$set": data})
    return jsonify({"msg": "Updated"}), 200

@labor_bp.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_laborer(id):
    laborers_col.delete_one({"_id": ObjectId(id)})
    return jsonify({"msg": "Deleted"}), 200
