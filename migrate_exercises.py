#!/usr/bin/env python3
"""
VitalCore Exercise Database Migration Script
==========================================
ONE-TIME MIGRATION: Imports megaGymDataset.csv → Supabase exercise_database table.

Usage:
  pip install supabase
  python migrate_exercises.py

Set SUPABASE_URL and SUPABASE_SERVICE_KEY below or as environment variables.
"""

import csv
import os
import sys
import json
import re
from typing import Optional

# ─── CONFIG ──────────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get(
    "SUPABASE_URL",
    "https://bevolemwakfozxuymxsn.supabase.co"
)
SUPABASE_SERVICE_KEY = os.environ.get(
    "SUPABASE_SERVICE_KEY",
    ""   # ← paste your service_role key here if not using env var
)
CSV_FILE = os.path.join(os.path.dirname(__file__), "megaGymDataset.csv")
BATCH_SIZE = 100
# ─────────────────────────────────────────────────────────────────────────────


# ── Normalization Maps ────────────────────────────────────────────────────────

BODY_PART_TO_CATEGORY = {
    "abdominals": "core",
    "abs": "core",
    "quadriceps": "legs",
    "hamstrings": "legs",
    "glutes": "legs",
    "calves": "legs",
    "adductors": "legs",
    "abductors": "legs",
    "chest": "chest",
    "lats": "back",
    "middle back": "back",
    "lower back": "back",
    "traps": "back",
    "shoulders": "shoulders",
    "biceps": "arms",
    "triceps": "arms",
    "forearms": "arms",
    "neck": "full_body",
}

EQUIPMENT_NORMALIZE = {
    "body only": "Bodyweight",
    "none": "Bodyweight",
    "dumbbell": "Dumbbell",
    "barbell": "Barbell",
    "cable": "Cable",
    "machine": "Machine",
    "kettlebells": "Kettlebell",
    "bands": "Resistance Bands",
    "medicine ball": "Medicine Ball",
    "exercise ball": "Exercise Ball",
    "e-z curl bar": "EZ Bar",
    "foam roll": "Foam Roller",
    "other": "Other",
}

LOCATION_MAP = {
    "Bodyweight": "Both",
    "Dumbbell": "Both",
    "Barbell": "Gym",
    "Cable": "Gym",
    "Machine": "Gym",
    "Kettlebell": "Both",
    "Resistance Bands": "Both",
    "Medicine Ball": "Both",
    "Exercise Ball": "Both",
    "EZ Bar": "Gym",
    "Foam Roller": "Both",
    "Other": "Gym",
}

LEVEL_NORMALIZE = {
    "beginner": "Beginner",
    "intermediate": "Intermediate",
    "expert": "Advanced",
    "advanced": "Advanced",
}


def normalize_equipment(raw: str) -> str:
    return EQUIPMENT_NORMALIZE.get(raw.strip().lower(), "Other")


def normalize_level(raw: str) -> str:
    return LEVEL_NORMALIZE.get(raw.strip().lower(), "Intermediate")


def body_part_to_category(body_part: str) -> str:
    return BODY_PART_TO_CATEGORY.get(body_part.strip().lower(), "full_body")


def derive_sets(exercise_type: str, level: str) -> int:
    if exercise_type in ("Stretching",):
        return 2
    if level == "Beginner":
        return 3
    if level == "Advanced":
        return 4
    return 3  # Intermediate


def derive_reps(exercise_type: str, level: str, body_part: str) -> str:
    bp = body_part.lower()
    if exercise_type == "Cardio":
        return "60 sec"
    if exercise_type == "Stretching":
        return "45 sec hold"
    if exercise_type == "Plyometrics":
        if level == "Beginner":
            return "8-10 reps"
        return "10-15 reps"
    if exercise_type in ("Powerlifting", "Olympic Weightlifting", "Strongman"):
        if level == "Beginner":
            return "5 reps"
        if level == "Advanced":
            return "3-5 reps"
        return "5-8 reps"
    # Strength
    if bp in ("abdominals", "abs"):
        return "15-20 reps"
    if bp in ("calves",):
        return "15-20 reps"
    if level == "Beginner":
        return "10-12 reps"
    if level == "Advanced":
        return "6-10 reps"
    return "10-15 reps"


def derive_rest(exercise_type: str, level: str) -> int:
    if exercise_type == "Stretching":
        return 15
    if exercise_type in ("Powerlifting", "Olympic Weightlifting", "Strongman"):
        return 120 if level == "Advanced" else 90
    if exercise_type == "Plyometrics":
        return 45
    if exercise_type == "Cardio":
        return 30
    # Strength
    if level == "Beginner":
        return 30
    if level == "Advanced":
        return 60
    return 45


def derive_duration(exercise_type: str, level: str, body_part: str) -> int:
    """Duration in seconds for one set."""
    if exercise_type == "Cardio":
        return 60
    if exercise_type == "Stretching":
        return 45
    if exercise_type == "Plyometrics":
        return 35
    if exercise_type in ("Powerlifting", "Olympic Weightlifting", "Strongman"):
        return 50
    # Strength
    if level == "Beginner":
        return 40
    if level == "Advanced":
        return 50
    return 45


def derive_calories(exercise_type: str, level: str, body_part: str) -> int:
    """Estimated calories burned per set (based on 70kg person avg)."""
    base = {"Strength": 5, "Cardio": 8, "Stretching": 2,
            "Plyometrics": 9, "Powerlifting": 6,
            "Olympic Weightlifting": 7, "Strongman": 8}.get(exercise_type, 5)
    multiplier = {"Beginner": 0.8, "Intermediate": 1.0, "Advanced": 1.2}.get(level, 1.0)
    return max(2, int(base * multiplier))


def derive_secondary_muscles(body_part: str, title: str) -> list:
    bp = body_part.lower()
    title_lower = title.lower()
    muscles = []

    if bp == "chest":
        muscles = ["Triceps", "Anterior Deltoids"]
        if "cable" in title_lower or "fly" in title_lower:
            muscles = ["Anterior Deltoids", "Biceps"]
    elif bp == "quadriceps":
        muscles = ["Glutes", "Hamstrings", "Calves"]
        if "lunge" in title_lower:
            muscles = ["Glutes", "Calves", "Core"]
    elif bp == "hamstrings":
        muscles = ["Glutes", "Lower Back", "Calves"]
    elif bp == "glutes":
        muscles = ["Hamstrings", "Lower Back", "Core"]
    elif bp == "shoulders":
        muscles = ["Triceps", "Upper Trapezius"]
        if "lateral" in title_lower or "raise" in title_lower:
            muscles = ["Upper Trapezius", "Rotator Cuff"]
    elif bp == "lats":
        muscles = ["Rhomboids", "Biceps", "Rear Deltoids"]
    elif bp == "middle back":
        muscles = ["Lats", "Rear Deltoids", "Biceps"]
    elif bp == "lower back":
        muscles = ["Glutes", "Hamstrings", "Core"]
    elif bp == "biceps":
        muscles = ["Forearms", "Brachialis"]
    elif bp == "triceps":
        muscles = ["Anterior Deltoids", "Chest"]
        if "overhead" in title_lower:
            muscles = ["Anterior Deltoids", "Core"]
    elif bp == "abdominals":
        muscles = ["Hip Flexors", "Obliques"]
        if "plank" in title_lower:
            muscles = ["Shoulders", "Glutes", "Quads"]
        elif "twist" in title_lower or "rotation" in title_lower:
            muscles = ["Obliques", "Hip Flexors"]
    elif bp == "calves":
        muscles = ["Ankle Stabilizers", "Tibialis Anterior"]
    elif bp == "traps":
        muscles = ["Rhomboids", "Rear Deltoids"]
    elif bp == "forearms":
        muscles = ["Biceps", "Wrists"]
    elif bp in ("adductors", "abductors"):
        muscles = ["Glutes", "Hip Flexors"]

    return muscles


def synthesize_description(title: str, exercise_type: str, body_part: str, equipment: str) -> str:
    """Synthesize a description for exercises missing one."""
    equip_phrase = f"using {equipment}" if equipment not in ("Bodyweight", "Other") else "using bodyweight"
    type_phrase = {
        "Strength": "strength training",
        "Cardio": "cardiovascular conditioning",
        "Stretching": "flexibility and mobility",
        "Plyometrics": "explosive plyometric",
        "Powerlifting": "powerlifting",
        "Olympic Weightlifting": "Olympic weightlifting",
        "Strongman": "functional strongman",
    }.get(exercise_type, "fitness")

    return (
        f"The {title} is a {type_phrase} exercise targeting the {body_part} {equip_phrase}. "
        f"Perform with controlled form and full range of motion to maximize muscle activation and minimize injury risk."
    )


def derive_common_mistakes(body_part: str, exercise_type: str) -> list:
    bp = body_part.lower()
    if exercise_type == "Stretching":
        return ["Bouncing during stretch", "Holding breath", "Overstretching"]
    if bp in ("lower back", "middle back", "lats"):
        return ["Rounding lower back", "Using momentum", "Shrugging shoulders"]
    if bp == "chest":
        return ["Bouncing weight off chest", "Flaring elbows too wide", "Incomplete range of motion"]
    if bp in ("quadriceps", "hamstrings", "glutes"):
        return ["Knees caving inward", "Not reaching full depth", "Leaning too far forward"]
    if bp == "shoulders":
        return ["Shrugging traps", "Using too much momentum", "Hyperextending elbows"]
    if bp == "abdominals":
        return ["Pulling on neck", "Holding breath", "Using hip flexors instead of abs"]
    if bp in ("biceps", "triceps", "forearms"):
        return ["Swinging body for momentum", "Incomplete range of motion", "Wrist misalignment"]
    return ["Poor form", "Rushing repetitions", "Inadequate range of motion"]


def derive_benefits(body_part: str, exercise_type: str, title: str) -> list:
    bp = body_part.lower()
    if exercise_type == "Cardio":
        return ["Improves cardiovascular health", "Burns calories efficiently", "Increases endurance"]
    if exercise_type == "Stretching":
        return ["Increases flexibility", "Reduces injury risk", "Improves posture"]
    if bp == "chest":
        return ["Builds chest mass and strength", "Improves pushing power", "Enhances upper body aesthetics"]
    if bp == "abdominals":
        return ["Strengthens core stability", "Protects lower back", "Improves athletic performance"]
    if bp in ("quadriceps", "hamstrings", "glutes"):
        return ["Builds lower body power", "Improves functional movement", "Increases metabolic rate"]
    if bp in ("lats", "middle back"):
        return ["Builds back width and thickness", "Improves posture", "Increases pulling strength"]
    if bp == "shoulders":
        return ["Builds shoulder definition", "Improves overhead mobility", "Enhances upper body balance"]
    if bp in ("biceps", "triceps"):
        return ["Increases arm size", "Improves elbow strength", "Enhances functional arm strength"]
    return ["Builds overall strength", "Improves muscular endurance", "Enhances fitness performance"]


def derive_instructions(title: str, desc: str, body_part: str, exercise_type: str) -> list:
    """Parse description into instruction steps, or generate generic ones."""
    if desc and len(desc) > 30:
        # Split into max 4 actionable steps
        sentences = re.split(r'(?<=[.!?])\s+', desc.strip())
        steps = [s.strip() for s in sentences if len(s.strip()) > 10][:4]
        if steps:
            return steps

    # Generate generic instructions based on type
    bp = body_part.lower()
    if exercise_type == "Stretching":
        return [
            f"Get into the starting position targeting the {body_part}.",
            "Breathe out and slowly move into the stretch.",
            "Hold at the point of mild tension for 30-45 seconds.",
            "Release slowly and repeat.",
        ]
    if bp in ("quadriceps", "hamstrings", "glutes"):
        return [
            "Stand with feet shoulder-width apart and brace your core.",
            f"Begin the {title} movement with controlled form.",
            "Drive through your heels and engage your glutes at the top.",
            "Return to start with a 2-second eccentric phase.",
        ]
    if bp in ("chest",):
        return [
            "Set up with a strong, stable base and retract your shoulder blades.",
            "Lower the weight with control, maintaining a slight arch in your back.",
            "Press explosively back to start, squeezing chest at the top.",
            "Keep your elbows at 45-75 degrees throughout.",
        ]
    return [
        f"Set up properly for {title} with stable positioning.",
        "Engage your core and maintain proper spinal alignment.",
        "Execute the movement with full range of motion and control.",
        "Return to start and repeat for prescribed reps.",
    ]


# ── Main Migration ────────────────────────────────────────────────────────────

def load_and_clean_csv() -> list:
    """Load CSV, clean, deduplicate, and enrich."""
    print(f"[1/4] Reading {CSV_FILE}...")
    rows = []
    with open(CSV_FILE, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    print(f"  Raw rows: {len(rows)}")

    # Deduplicate by title (case-insensitive)
    seen_titles = set()
    clean = []
    dup_count = 0
    empty_title_count = 0
    for r in rows:
        title = r.get("Title", "").strip()
        if not title:
            empty_title_count += 1
            continue
        key = title.lower()
        if key in seen_titles:
            dup_count += 1
            continue
        seen_titles.add(key)
        clean.append(r)

    print(f"  Removed {dup_count} duplicates, {empty_title_count} empty titles")
    print(f"  Unique exercises: {len(clean)}")
    return clean


def transform_row(r: dict) -> dict:
    """Transform a raw CSV row to the exercise_database schema."""
    title = r.get("Title", "").strip()
    raw_desc = r.get("Desc", "").strip()
    exercise_type = r.get("Type", "Strength").strip()
    body_part = r.get("BodyPart", "").strip()
    raw_equipment = r.get("Equipment", "Body Only").strip()
    raw_level = r.get("Level", "Intermediate").strip()
    raw_rating = r.get("Rating", "").strip()

    # Normalize
    equipment = normalize_equipment(raw_equipment)
    level = normalize_level(raw_level)
    category = body_part_to_category(body_part)

    # Derive enrichment fields
    sets = derive_sets(exercise_type, level)
    reps = derive_reps(exercise_type, level, body_part)
    rest = derive_rest(exercise_type, level)
    duration = derive_duration(exercise_type, level, body_part)
    calories = derive_calories(exercise_type, level, body_part)
    secondary = derive_secondary_muscles(body_part, title)
    instructions = derive_instructions(title, raw_desc, body_part, exercise_type)
    mistakes = derive_common_mistakes(body_part, exercise_type)
    benefits = derive_benefits(body_part, exercise_type, title)

    # Synthesize description if missing
    description = raw_desc if raw_desc else synthesize_description(title, exercise_type, body_part, equipment)

    # Rating
    try:
        rating = float(raw_rating) if raw_rating else None
    except ValueError:
        rating = None

    return {
        "title": title,
        "description": description,
        "exercise_type": exercise_type,
        "body_part": body_part,
        "equipment": equipment,
        "level": level,
        "rating": rating,
        "category": category,
        "primary_muscle": body_part,
        "secondary_muscles": secondary,
        "sets_recommended": sets,
        "reps_recommended": reps,
        "rest_seconds": rest,
        "duration_seconds": duration,
        "calories_estimate": calories,
        "location": LOCATION_MAP.get(equipment, "Gym"),
        "instructions": instructions,
        "common_mistakes": mistakes,
        "benefits": benefits,
        "gif_url": None,
        "source": "megagym",
    }


def batch_insert(supabase_client, records: list) -> int:
    """Insert records in batches, return success count."""
    success = 0
    total = len(records)
    for i in range(0, total, BATCH_SIZE):
        batch = records[i : i + BATCH_SIZE]
        try:
            result = supabase_client.table("exercise_database").insert(batch).execute()
            inserted = len(result.data) if result.data else 0
            success += inserted
            print(f"  Batch {i // BATCH_SIZE + 1}: inserted {inserted} / {len(batch)} records")
        except Exception as e:
            print(f"  ERROR in batch {i // BATCH_SIZE + 1}: {e}")
    return success


def main():
    if not SUPABASE_SERVICE_KEY:
        print("ERROR: SUPABASE_SERVICE_KEY is not set.")
        print("  Set it as environment variable or paste it into the script.")
        print("  Get it from: Supabase Dashboard → Project Settings → API → service_role key")
        sys.exit(1)

    # Import supabase client
    try:
        from supabase import create_client
    except ImportError:
        print("ERROR: supabase package not found. Run: pip install supabase")
        sys.exit(1)

    print("=" * 60)
    print("VitalCore Exercise Database Migration")
    print("=" * 60)

    # Step 1: Connect
    print("\n[1/4] Connecting to Supabase...")
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print(f"  Connected to: {SUPABASE_URL}")

    # Step 2: Load & clean CSV
    print("\n[2/4] Loading and cleaning dataset...")
    clean_rows = load_and_clean_csv()

    # Step 3: Transform
    print("\n[3/4] Transforming rows to database schema...")
    records = [transform_row(r) for r in clean_rows]
    print(f"  Transformed {len(records)} records")

    # Step 4: Insert
    print("\n[4/4] Inserting into Supabase exercise_database...")
    print(f"  Total records: {len(records)} | Batch size: {BATCH_SIZE}")
    count = batch_insert(client, records)

    print("\n" + "=" * 60)
    print(f"MIGRATION COMPLETE")
    print(f"  Exercises imported: {count} / {len(records)}")
    print(f"  Table: exercise_database")
    print(f"  Source: megaGymDataset.csv")
    print("=" * 60)

    # Verification query
    print("\n[VERIFY] Fetching summary from Supabase...")
    try:
        result = client.table("exercise_database").select("id", count="exact").execute()
        print(f"  Total rows in table: {result.count}")
    except Exception as e:
        print(f"  Could not verify: {e}")


if __name__ == "__main__":
    main()
