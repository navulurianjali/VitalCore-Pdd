"""
Static test data definitions for Selenium E2E test runs.
"""

SAMPLE_ONBOARDING_DATA = {
    "fullName": "Selenium Tester",
    "age": 28,
    "gender": "Female",
    "bloodGroup": "O+",
    "height": 168,
    "weight": 62,
    "goals": ["Weight Loss", "Muscle Gain"],
    "foodPreference": "Vegetarian",
    "medicalConditions": ["Asthma"],
    "medications": "Inhaler",
    "allergies": "Peanuts",
    "activityLevel": "Moderately Active",
    "sleepDuration": 8.0,
}

SAMPLE_FOOD_ITEMS = [
    {"name": "Oatmeal with Fruits", "category": "Breakfast", "calories": 250, "protein": 8, "carbs": 45, "fats": 4},
    {"name": "Grilled Chicken Salad", "category": "Lunch", "calories": 420, "protein": 38, "carbs": 15, "fats": 18},
    {"name": "Quinoa & Vegetable Bowl", "category": "Dinner", "calories": 380, "protein": 14, "carbs": 58, "fats": 10},
    {"name": "Almonds & Apple", "category": "Snacks", "calories": 180, "protein": 5, "carbs": 22, "fats": 9},
]

SAMPLE_SLEEP_RECORD = {
    "hours": 7.5,
    "quality": 85,
    "bedtime": "22:30",
    "waketime": "06:00",
}

SAMPLE_WORKOUT = {
    "name": "Full Body Strength Circuit",
    "duration": 45,
    "caloriesBurned": 320,
    "exercise": "Squats",
}
