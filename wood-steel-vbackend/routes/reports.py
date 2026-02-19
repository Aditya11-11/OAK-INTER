from flask import Blueprint, request, send_file, jsonify
from flask_jwt_extended import jwt_required
from database import inventory_col, orders_col, laborers_col, expenses_col
import pandas as pd
from io import BytesIO
from datetime import datetime, timedelta
from bson import ObjectId

reports_bp = Blueprint("reports", __name__)

def get_date_range(duration):
    now = datetime.utcnow()
    if duration == "today":
        return now.replace(hour=0, minute=0, second=0, microsecond=0), now
    elif duration == "last_week":
        return now - timedelta(days=7), now
    elif duration == "last_month":
        return now - timedelta(days=30), now
    return None, None

@reports_bp.route("/export", methods=["POST"])
@jwt_required()
def export_report():
    data = request.get_json()
    category = data.get("category") # 'Paint', 'Workers', 'Hardware/Tools', 'All'
    duration = data.get("duration") # 'today', 'last_week', 'last_month', 'custom'
    start_date = data.get("startDate")
    end_date = data.get("endDate")

    query = {}
    if duration != "custom":
        s, e = get_date_range(duration)
        if s:
            query["created_at"] = {"$gte": s, "$lte": e}
    elif start_date and end_date:
        query["created_at"] = {
            "$gte": datetime.fromisoformat(start_date),
            "$lte": datetime.fromisoformat(end_date)
        }

    df = pd.DataFrame()
    filename = f"report_{category}_{datetime.now().strftime('%Y%m%d')}.xlsx"

    if category == "Workers":
        items = list(laborers_col.find(query))
        if items:
            for i in items: i["id"] = str(i["_id"]); del i["_id"]
            df = pd.DataFrame(items)
    
    elif category == "Paint" or category == "Hardware/Tools":
        # Filter inventory by category
        inv_query = {"category": category} if category != "All" else {}
        items = list(inventory_col.find(inv_query))
        if items:
            for i in items: i["id"] = str(i["_id"]); del i["_id"]
            df = pd.DataFrame(items)
    
    else: # Default to All Inventory or Combined
        items = list(inventory_col.find({}))
        if items:
            for i in items: i["id"] = str(i["_id"]); del i["_id"]
            df = pd.DataFrame(items)

    if df.empty:
        return jsonify({"msg": "No data found for the selected range"}), 404

    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Report')
    
    output.seek(0)
    return send_file(
        output,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=filename
    )
