from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson import ObjectId
from database import inventory_col

inventory_bp = Blueprint("inventory", __name__)

def parse_item(item):
    item["id"] = str(item["_id"])
    del item["_id"]
    return item

@inventory_bp.route("", methods=["GET"])
@jwt_required()
def get_inventory():
    items = list(inventory_col.find({}))
    return jsonify([parse_item(i) for i in items])

@inventory_bp.route("", methods=["POST"])
@jwt_required()
def add_inventory():
    from datetime import datetime
    data = request.get_json()
    data["created_at"] = datetime.utcnow()
    data["updated_at"] = datetime.utcnow()
    result = inventory_col.insert_one(data)
    return jsonify({"id": str(result.inserted_id)}), 201

@inventory_bp.route("/<id>", methods=["PUT"])
@jwt_required()
def update_inventory(id):
    from datetime import datetime
    data = request.get_json()
    if "id" in data: del data["id"]
    data["updated_at"] = datetime.utcnow()
    inventory_col.update_one({"_id": ObjectId(id)}, {"$set": data})
    return jsonify({"msg": "Updated"}), 200

@inventory_bp.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_inventory(id):
    inventory_col.delete_one({"_id": ObjectId(id)})
    return jsonify({"msg": "Deleted"}), 200
