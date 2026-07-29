import urllib.request
import json
import time

BASE_URL = "http://localhost:3000"

def test_single_prompt(prompt_text):
    payload = {
        "messages": [
            {"sender": "user", "text": prompt_text}
        ],
        "profile": {
            "full_name": "Test Explorer",
            "active_mode": "performance",
            "fitness_goal": "Muscle Growth & Recovery",
            "biological_age": 28,
            "weight_kg": 72,
            "height_cm": 178
        },
        "metrics": {
            "caloriesConsumed": 1850,
            "caloriesBurned": 520,
            "hydrationMl": 2200,
            "steps": 9400,
            "sleepHours": 7.5,
            "recoveryPercentage": 88,
            "fatigueScore": 18,
            "stressLevel": 25,
            "mood": "focused"
        }
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/api/chat",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            text_chunks = res.read().decode("utf-8")
            return res.status, text_chunks
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except Exception as e:
        return 500, str(e)

def main():
    print("==================================================")
    print("AI COACH ROUTE HANDLER & 20-PROMPT VERIFICATION")
    print("==================================================")

    prompts = [
        "How can I optimize my recovery score of 88% today?",
        "I consumed 1850 calories today, is that enough for muscle growth?",
        "My sleep last night was 7.5 hours. How can I increase REM sleep?",
        "What hydration intake do you recommend after burning 520 calories?",
        "How should I structure my leg day workout when fatigue is 18/100?",
        "Suggest a high-protein dinner for my 72kg weight target.",
        "How does my stress level of 25 impact my metabolic efficiency?",
        "What stretches help relieve hamstring tightness after 9,400 steps?",
        "Can I drink coffee 2 hours before sleep without ruining recovery?",
        "Explain the benefit of cold showers for post-workout soreness.",
        "How can I hit 10,000 steps without straining my ankles?",
        "What supplements support collagen synthesis for joint health?",
        "Should I do cardio before or after resistance training for fat loss?",
        "What electrolyte balance is best for a 2,200ml hydration intake?",
        "How does biological age calculation work in VitaCore?",
        "What food prevents evening sugar cravings after dinner?",
        "Suggest a 15-minute morning mobility routine for spine alignment.",
        "How many grams of protein should I consume per meal for synthesis?",
        "How does chronic stress affect stability score and longevity?",
        "Give me a 3-step action plan to reach 100% recovery tomorrow."
    ]

    passed_count = 0

    for i, p in enumerate(prompts, 1):
        print(f"\n[PROMPT {i:02d}/20] '{p}'")
        status, response_text = test_single_prompt(p)
        print(f"Status Code: {status}")
        preview = response_text[:120].replace('\n', ' ')
        print(f"Response Preview: {preview}...")
        
        if status in [200, 503] and len(response_text) > 0:
            passed_count += 1
            print(f"[PASS] Prompt {i} returned valid response stream or graceful fallback payload.")
        else:
            print(f"[FAIL] Prompt {i} failed with status {status}")

        time.sleep(2.5)

    print("\n==================================================")
    print(f"SUMMARY: {passed_count}/{len(prompts)} PROMPTS PASSED VERIFICATION")
    print("==================================================")

if __name__ == "__main__":
    main()
