from groq import Groq
import json
import os

# 🔐 Use your API key here (later we’ll move to .env for safety)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# -----------------------------------
# 🚀 Generate Itinerary
# -----------------------------------
def generate_itinerary(data):
    prompt = f"""
    Create a travel itinerary in STRICT JSON format.

    RULES:
    - Return ONLY valid JSON (no text, no markdown)
    - Stay strictly within budget
    - Keep response short and clean
    - Ensure JSON is properly formatted

    FORMAT:
    {{
      "destination": "string",
      "total_cost": number,
      "days": [
        {{
          "day": 1,
          "title": "string",
          "activities": ["string", "string"]
        }}
      ]
    }}

    INPUT:
    Destination: {data['destination']}
    Budget: {data['budget']}
    Days: {data['days']}
    Preferences: {data['preferences']}
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    content = response.choices[0].message.content.strip()

    # 🧠 Clean possible bad formatting
    content = content.replace("```json", "").replace("```", "").strip()

    try:
        result = json.loads(content)

        # 🔥 Budget check
        if result.get("total_cost", 0) > data["budget"]:
            result["warning"] = "Adjusted to fit budget"

        return result

    except Exception as e:
        return {
            "error": "Invalid JSON from AI",
            "raw_output": content
        }


# -----------------------------------
# 💬 Modify Itinerary (Chat Feature)
# -----------------------------------
def modify_itinerary(data):
    prompt = f"""
    You are an AI travel assistant.

    Modify the given itinerary based on user request.

    STRICT RULES:
    - Return ONLY valid JSON
    - Do NOT include explanations
    - Keep same structure
    - Adjust cost if needed

    FORMAT:
    {{
      "destination": "string",
      "total_cost": number,
      "days": [
        {{
          "day": 1,
          "title": "string",
          "activities": ["string"]
        }}
      ]
    }}

    CURRENT ITINERARY:
    {json.dumps(data['itinerary'])}

    USER REQUEST:
    {data['user_input']}
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    content = response.choices[0].message.content.strip()

    # 🧠 Clean formatting issues
    content = content.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(content)
    except Exception as e:
        return {
            "error": "Invalid JSON from AI",
            "raw_output": content
        }