from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson import ObjectId
from datetime import datetime
from database import orders_col, inventory_col

orders_bp = Blueprint("orders", __name__)

def parse_order(order):
    order["id"] = str(order["_id"])
    del order["_id"]
    return order

@orders_bp.route("", methods=["GET"])
@jwt_required()
def get_orders():
    orders = list(orders_col.find({}))
    return jsonify([parse_order(o) for o in orders])

@orders_bp.route("", methods=["POST"])
@jwt_required()
def add_order():
    data = request.get_json()
    
    # Update inventory stock
    item_id = data.get("itemId")
    quantity = data.get("quantity")
    order_type = data.get("type") # 'sale' or 'restock'
    
    inventory_item = inventory_col.find_one({"_id": ObjectId(item_id)})
    if inventory_item:
        new_stock = inventory_item["stock"]
        if order_type == "sale":
            new_stock -= quantity
        else:
            new_stock += quantity
        inventory_col.update_one({"_id": ObjectId(item_id)}, {"$set": {"stock": max(0, new_stock), "updated_at": datetime.utcnow()}})

    data["created_at"] = datetime.utcnow()
    result = orders_col.insert_one(data)
    return jsonify({"id": str(result.inserted_id)}), 201
