import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
import csv
from io import StringIO


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

NASA_FIRMS_API_URL = "https://firms.modaps.eosdis.nasa.gov/api/area/csv/60b7fa1023bbd638613fcd533d7a151f/VIIRS_SNPP_NRT/world/1/2025-01-01"

# Define the bounding box for California
CALIFORNIA_BOUNDS = {
    'min_lat': 32.5342,
    'max_lat': 42.0095,
    'min_lon': -124.4095,
    'max_lon': -114.1312
}

@app.route("/api/wildfires", methods=["GET"])
def get_wildfires():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    radius = request.args.get("radius", 1000)

    if not lat or not lon:
        return jsonify({"error": "Location coordinates required"}), 400

    try:
        response = requests.get(NASA_FIRMS_API_URL)
        response.raise_for_status()

        csv_data = response.text
        csv_file = StringIO(csv_data)
        csv_reader = csv.DictReader(csv_file)

        wildfires = []
        for row in csv_reader:
            fire_lat = float(row['latitude'])
            fire_lon = float(row['longitude'])

            # Filter data to include only points within California
            if (CALIFORNIA_BOUNDS['min_lat'] <= fire_lat <= CALIFORNIA_BOUNDS['max_lat'] and
                CALIFORNIA_BOUNDS['min_lon'] <= fire_lon <= CALIFORNIA_BOUNDS['max_lon']):
                wildfires.append({
                    'latitude': fire_lat,
                    'longitude': fire_lon
                })

        return jsonify(wildfires)

    except requests.RequestException as e:
        print(f"RequestException: {e}")
        return jsonify({"error": f"Wildfire data fetch failed: {str(e)}"}), 500
    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route("/api/weather-alerts", methods=["GET"])
def get_weather_alerts():
    try:
        response = requests.get('https://api.weather.gov/alerts/active?area=CA')
        print(f"NOAA Response Status: {response.status_code}")
        if response.status_code == 200:
            alerts = response.json()
            severe_alerts = [
                feature for feature in alerts.get('features', [])
                if feature['properties']['severity'] in ['Severe', 'Warning', 'Advisory', 'Watch']
            ]
            print(f"Number of severe alerts found: {len(severe_alerts)}")
            return jsonify(severe_alerts)
        else:
            print(f"NOAA API Error: {response.text}")
            return jsonify({"error": "Failed to fetch NOAA alerts"}), 500
    except Exception as e:
        print(f"Error fetching weather alerts: {e}")
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)
