from pymongo import MongoClient
import bcrypt
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.getenv("MONGO_URL")
client = MongoClient(mongo_url)
db = client["oak_woods_db"]

# Collections
inventory_col = db["inventory"]
orders_col = db["orders"]
laborers_col = db["laborers"]
expenses_col = db["expenses"]

def seed():
    # Clear existing data (optional, but good for clean state)
    # inventory_col.delete_many({})
    # orders_col.delete_many({})
    # laborers_col.delete_many({})
    # expenses_col.delete_many({})

    # 1. Inventory
    inventory_items = [
        {"name": "White Gloss Paint", "category": "Paint", "stock": 25, "unitPrice": 4500},
        {"name": "Sanding Machine", "category": "Tools", "stock": 3, "unitPrice": 12000},
        {"name": "Wood Varnish", "category": "Paint", "stock": 15, "unitPrice": 3200},
        {"name": "Drawer Handles", "category": "Hardware", "stock": 150, "unitPrice": 450},
        {"name": "Precision Level", "category": "Tools", "stock": 8, "unitPrice": 2500},
        {"name": "Paint Brush Set", "category": "Paint Tools", "stock": 20, "unitPrice": 1200},
    ]
    for item in inventory_items:
        item["created_at"] = datetime.utcnow()
        item["updated_at"] = datetime.utcnow()
    
    inv_ids = {item["name"]: inventory_col.insert_one(item).inserted_id for item in inventory_items}

    # 2. Laborers
    labor_list = [
        {
            "name": "Ibrahim Musa", 
            "skill": "Master Carpenter", 
            "status": "Available", 
            "assignedLocation": "Island Workshop",
            "scheduleStart": "2026-02-01",
            "scheduleEnd": "2026-02-28",
            "history": []
        },
        {
            "name": "Sarah Odoh", 
            "skill": "Expert Painter", 
            "status": "Scheduled", 
            "assignedLocation": "Lekki Site A",
            "scheduleStart": "2026-02-15",
            "scheduleEnd": "2026-02-22",
            "history": [
                {"id": "h1", "location": "Mainland Hub", "startDate": "2026-01-05", "endDate": "2026-01-20", "notes": "Completed living room set finishes."}
            ]
        },
    ]
    for l in labor_list:
        l["created_at"] = datetime.utcnow()
        l["updated_at"] = datetime.utcnow()
    laborers_col.insert_many(labor_list)

    # 3. Expenses
    expenses_list = [
        {"description": "Generator Fuel", "amount": 15000, "date": "2026-02-18"},
        {"description": "Transport for Ibrahim", "amount": 3500, "date": "2026-02-17"},
        {"description": "Shop Rent - Feb", "amount": 200000, "date": "2026-02-01"},
    ]
    for e in expenses_list:
        e["created_at"] = datetime.utcnow()
    expenses_col.insert_many(expenses_list)

    # 4. Orders (Sales/Restocks)
    orders_list = [
        {"type": "sale", "itemId": str(inv_ids["White Gloss Paint"]), "itemName": "White Gloss Paint", "quantity": 5, "totalPrice": 22500, "date": "2026-02-19"},
        {"type": "restock", "itemId": str(inv_ids["Wood Varnish"]), "itemName": "Wood Varnish", "quantity": 10, "totalPrice": 32000, "date": "2026-02-15"},
    ]
    for o in orders_list:
        o["created_at"] = datetime.utcnow()
    orders_col.insert_many(orders_list)

    print("Database seeded successfully with sample data!")

if __name__ == "__main__":
    seed()
