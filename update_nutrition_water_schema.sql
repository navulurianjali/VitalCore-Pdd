-- SEED PREDEFINED CHALLENGES LIBRARY (30+ HEALTH CHALLENGES ACROSS 6 CATEGORIES)

INSERT INTO public.challenges (title, description, category, difficulty, xp_reward, duration_days)
VALUES
  -- 1. FITNESS
  ('Walk 10,000 Steps for 30 Days', 'Achieve 10,000 steps every day for 30 days to build foundational cardiovascular endurance.', 'Fitness', 'Medium', 350, 30),
  ('50 Squats Daily Challenge', 'Perform 50 bodyweight squats daily to strengthen lower body and improve mobility.', 'Fitness', 'Easy', 200, 14),
  ('30-Day Core Strength Sprint', 'Complete daily plank and core exercises to build trunk stability.', 'Fitness', 'Hard', 500, 30),
  ('Yoga & Mobility for 21 Days', 'Practice 20 minutes of daily yoga and hip mobility routines.', 'Fitness', 'Easy', 250, 21),
  ('10k Step Streak Sprint', 'Maintain a continuous 7-day streak of reaching 10,000 steps daily.', 'Fitness', 'Medium', 250, 7),

  -- 2. NUTRITION
  ('High Protein Week', 'Hit your daily protein target (at least 80g-120g) every day for 7 days.', 'Nutrition', 'Medium', 250, 7),
  ('No Sugary Drinks Challenge', 'Eliminate all sodas, packaged juices, and sweetened beverages for 14 days.', 'Nutrition', 'Easy', 200, 14),
  ('Healthy Breakfast Challenge', 'Eat an evidence-based high-protein, high-fiber breakfast daily.', 'Nutrition', 'Easy', 150, 7),
  ('No Junk Food Week', 'Avoid fried foods, processed snacks, and fast food for 7 consecutive days.', 'Nutrition', 'Medium', 300, 7),
  ('Fiber-Rich Meal Sprint', 'Consume at least 30g of dietary fiber daily from whole grains & vegetables.', 'Nutrition', 'Easy', 200, 14),
  ('Intermittent Fasting Reset', 'Follow a 16:8 intermittent fasting schedule for 10 consecutive days.', 'Nutrition', 'Hard', 400, 10),

  -- 3. HYDRATION
  ('Drink 2.5L Water Daily', 'Drink 2,500ml of fresh water every day to maintain optimal cellular hydration.', 'Hydration', 'Easy', 200, 14),
  ('7-Day Hydration Hero', 'Log at least 2,000ml of water daily for 7 consecutive days.', 'Hydration', 'Easy', 150, 7),
  ('Zero Soda & Energy Drinks', 'Replace all commercial energy drinks and sodas with pure water or herbal tea.', 'Hydration', 'Medium', 250, 21),
  ('Morning Hydration Opener', 'Drink 500ml of warm water immediately upon waking for 30 consecutive days.', 'Hydration', 'Easy', 250, 30),

  -- 4. SLEEP
  ('Sleep Before 11 PM', 'Go to bed before 11:00 PM every night for 14 nights to align circadian rhythm.', 'Sleep', 'Medium', 300, 14),
  ('Digital Detox Before Bed', 'Turn off all smartphone, laptop, and TV screens 45 minutes before sleep.', 'Sleep', 'Easy', 200, 7),
  ('8-Hour Sleep Routine Sprint', 'Log 8 hours of restorative sleep per night for 10 consecutive nights.', 'Sleep', 'Medium', 350, 10),
  ('Consistent Wake Time Challenge', 'Wake up at the exact same hour every morning for 21 days.', 'Sleep', 'Hard', 450, 21),

  -- 5. MENTAL WELLNESS
  ('15-Min Daily Meditation', 'Practice 15 minutes of mindfulness or guided meditation daily for 14 days.', 'Mental Wellness', 'Easy', 200, 14),
  ('Daily Gratitude Journal', 'Write down 3 things you are grateful for every evening for 21 days.', 'Mental Wellness', 'Easy', 250, 21),
  ('Stress Resilience Reset', 'Perform 5 minutes of box breathing whenever stress spike is detected.', 'Mental Wellness', 'Medium', 300, 14),
  ('Mindful Screen Detox', 'Limit daily non-work screen time to under 2 hours for 7 days.', 'Mental Wellness', 'Hard', 400, 7),

  -- 6. HEALTHY HABITS
  ('No Alcohol Month', 'Abstain from all alcoholic beverages for 30 consecutive days.', 'Healthy Habits', 'Hard', 500, 30),
  ('Cold Shower Energy Boost', 'Take a 60-second cold shower ending every morning for 14 days.', 'Healthy Habits', 'Medium', 300, 14),
  ('Morning Sun Exposure', 'Get 15 minutes of direct morning sunlight within 1 hour of waking.', 'Healthy Habits', 'Easy', 200, 21),
  ('Probiotic Gut Health Sprint', 'Consume daily fermented probiotic foods (curd, yogurt, kefir) for 14 days.', 'Healthy Habits', 'Easy', 200, 14)
ON CONFLICT DO NOTHING;
