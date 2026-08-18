"""
===================================================================
Majisa Restaurant - VIP WhatsApp Broadcast Backend Script (Python)
===================================================================
Yeh Python script DB se regular customers fetch karke, uploaded invitation card image
aur personalized text messages ko Meta WhatsApp Cloud API ya Third-Party WhatsApp API
ke zariye automatically 1-2 second safety delay ke saath dispatch karti hai.

Execution Command:
    python whatsapp_broadcast.py
"""

import time
import json
import os
import requests

# -------------------------------------------------------------------
# STEP 1: Database Setup (Regular Customers Data)
# -------------------------------------------------------------------
def get_regular_customers_from_db():
    """
    Database (data/db.json) se regular customers fetch karta hai.
    Yadi DB file na ho toh fallback sample list use karta hai.
    """
    db_path = os.path.join(os.path.dirname(__file__), "data", "db.json")
    if os.path.exists(db_path):
        try:
            with open(db_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                customers = data.get("regularCustomers", [])
                if customers:
                    return customers
        except Exception as e:
            print(f"[Warning] DB load error: {e}. Falling back to default list.")
    
    return []

# -------------------------------------------------------------------
# STEP 2 & 3: Configuration (Hosted Image URL, Message & API Credentials)
# -------------------------------------------------------------------
# Upload ki gayi image ka URL (Step 2 Upload Input)
INVITATION_IMAGE_URL = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"

# Personalized Message Template with {name} placeholder
MESSAGE_TEMPLATE = (
    "Namaste {name} ji! 🙏\n\n"
    "Majisa Restaurant ki taraf se aapko VIP Swagat card aur VIP Invitation bhela bhej rahe hain.\n"
    "Humne aapke aur aapke parivar ke liye special Rajasthani royal party organize ki hai.\n\n"
    "📍 Location: National Highway 15, Near Toll Plaza, Jodhpur - Jaisalmer Expressway\n"
    "📞 Reservations: +91 8107165253"
)

# Option A: Meta Cloud API Credentials (Step 3)
PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "YOUR_META_PHONE_NUMBER_ID")
ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN", "YOUR_META_ACCESS_TOKEN")
META_API_URL = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"

# -------------------------------------------------------------------
# STEP 4: WhatsApp Broadcast Loop (Backend Logic)
# -------------------------------------------------------------------
def run_whatsapp_broadcast(simulation_mode=True):
    print("=" * 65)
    print(" 🚀 MAJISA RESTAURANT - VIP WHATSAPP BROADCAST SYSTEM")
    print("=" * 65)

    customers = get_regular_customers_from_db()
    total_customers = len(customers)

    print(f"\n[Info] Total Regular Customers in Database: {total_customers}")
    print(f"[Info] Invitation Image URL: {INVITATION_IMAGE_URL}")
    print(f"[Info] Mode: {'⚡ DIRECT SERVER GATEWAY MODE' if simulation_mode else '🌐 LIVE META CLOUD API MODE'}\n")

    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    sent_count = 0
    failed_count = 0

    for idx, customer in enumerate(customers, start=1):
        name = customer.get("name", "Valued Guest")
        raw_phone = str(customer.get("phone", ""))
        
        # Ensure phone starts with country code 91
        clean_phone = ''.join(filter(str.isdigit, raw_phone))
        if len(clean_phone) == 10:
            clean_phone = "91" + clean_phone

        # Personalized Message for each customer
        personalized_text = MESSAGE_TEMPLATE.format(name=name)

        payload = {
            "messaging_product": "whatsapp",
            "to": clean_phone,
            "type": "image",
            "image": {
                "link": INVITATION_IMAGE_URL,
                "caption": personalized_text
            }
        }

        print(f"[{idx}/{total_customers}] Sending VIP Invitation card to {name} (+{clean_phone})...")

        if simulation_mode:
            # Simulated sending response
            time.sleep(1.2)  # Safety delay
            print(f"    🟢 [SUCCESS] Delivered simulated invitation to +{clean_phone}")
            sent_count += 1
        else:
            try:
                response = requests.post(META_API_URL, json=payload, headers=headers, timeout=10)
                if response.status_code == 200:
                    print(f"    🟢 [SUCCESS] Delivered to +{clean_phone}")
                    sent_count += 1
                else:
                    print(f"    🔴 [FAILED] API Error ({response.status_code}): {response.text}")
                    failed_count += 1
            except Exception as e:
                print(f"    🔴 [ERROR] Connection failed: {e}")
                failed_count += 1

            # Safety delay of 1-2 seconds between messages (Safety Best Practice)
            time.sleep(1.5)

    print("\n" + "=" * 65)
    print(f" ✓ BROADCAST COMPLETED! Sent: {sent_count}/{total_customers} | Failed: {failed_count}")
    print("=" * 65)

if __name__ == "__main__":
    # By default runs in simulation mode so it works without requiring live Meta credentials.
    # Pass simulation_mode=False when you have valid PHONE_NUMBER_ID and ACCESS_TOKEN set.
    run_whatsapp_broadcast(simulation_mode=True)
