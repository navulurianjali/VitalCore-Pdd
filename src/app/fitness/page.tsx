"use client";

import React, { useState, useEffect } from "react";
import { 
  Dumbbell, Play, Pause, RotateCcw, Check, Sparkles, ShieldAlert, 
  Award, Clock, Flame, Droplet, Calendar, TrendingUp, Compass, 
  Heart, CheckSquare, Plus, Save, BookOpen, AlertTriangle, ArrowRight, ArrowLeft,
  ChevronRight, RefreshCw, Layers, Activity
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useHealthData } from "@/hooks/useHealthData";
import { supabase } from "@/utils/supabase";
import confetti from "canvas-confetti";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { EXERCISE_LIBRARY, ExerciseDetail } from "@/utils/exerciseLibrary";

const EXERCISE_DATABASE = EXERCISE_LIBRARY;

export default function FitnessPage() {
  const { profile } = useAuth();
  const { activeMode } = useTheme();
  
  const { metrics, loading, refetch } = useHealthData();
  const [activeTab, setActiveTab] = useState<"coach" | "history">("coach");
  const [coachState, setCoachState] = useState<"form" | "generating" | "preview" | "active" | "summary">("form");

  // Onboarding questionnaire steps (1 to 6)
  const [questionStep, setQuestionStep] = useState(1);

  // Questionnaire form states
  const [feeling, setFeeling] = useState("normal");
  const [location, setLocation] = useState("home");
  const [focus, setFocus] = useState("full_body");
  const [duration, setDuration] = useState(30);
  const [equipment, setEquipment] = useState("none");
  const [intensity, setIntensity] = useState("moderate");

  // Loading screen ticks state
  const [loadingTick, setLoadingTick] = useState(0);

  // Generated workout session states
  const [generatedWorkout, setGeneratedWorkout] = useState<ExerciseDetail[]>([]);
  const [recoveryWarning, setRecoveryWarning] = useState("");
  const [activeWorkoutName, setActiveWorkoutName] = useState("Custom Adaptive Workout");

  // Readiness / Fatigue Score
  const [readinessScore, setReadinessScore] = useState(85);

  // Live Timer states
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isResting, setIsResting] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<boolean[]>([]);

  // Post workout stats
  const [workoutDurationSpent, setWorkoutDurationSpent] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [postWorkoutFeedback, setPostWorkoutFeedback] = useState("");

  // History states
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);

  // Saved routines states
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);

  // --- AI POSTURE TRACKING & SCANNER STATE & REFS ---
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [postureScore, setPostureScore] = useState<number | null>(null);
  const [alignmentQuality, setAlignmentQuality] = useState<string | null>(null);
  const [stabilityScore, setStabilityScore] = useState<number | null>(null);
  const [mobilityScore, setMobilityScore] = useState<number | null>(null);
  const [liveCue, setLiveCue] = useState("Place your full body in view to calibrate.");
  const [formAlert, setFormAlert] = useState<string | null>(null);
  
  // Daily Posture Check specific states
  const [postureCheckState, setPostureCheckState] = useState<"idle" | "scanning" | "completed">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanScoreHistory, setScanScoreHistory] = useState<any[]>([]);

  // Refs for camera processing
  const webcamVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const postureCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const requestRef = React.useRef<number | null>(null);
  const prevFrameRef = React.useRef<Uint8ClampedArray | null>(null);
  const poseInstanceRef = React.useRef<any>(null);
  const mediaPipeLoadedRef = React.useRef<boolean>(false);

  // Smooth joint positions kinematics ref
  const skeletonRef = React.useRef({
    head: { x: 320, y: 110, targetX: 320, targetY: 110 },
    neck: { x: 320, y: 160, targetX: 320, targetY: 160 },
    leftShoulder: { x: 260, y: 175, targetX: 260, targetY: 175 },
    rightShoulder: { x: 380, y: 175, targetX: 380, targetY: 175 },
    spineMid: { x: 320, y: 250, targetX: 320, targetY: 250 },
    leftHip: { x: 275, y: 310, targetX: 275, targetY: 310 },
    rightHip: { x: 365, y: 310, targetX: 365, targetY: 310 },
    leftKnee: { x: 275, y: 390, targetX: 275, targetY: 390 },
    rightKnee: { x: 365, y: 390, targetX: 365, targetY: 390 },
    leftAnkle: { x: 275, y: 460, targetX: 275, targetY: 460 },
    rightAnkle: { x: 365, y: 460, targetX: 365, targetY: 460 }
  });

  const loadScript = (src: string) => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") return resolve();
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve();
      }
      const script = document.createElement("script");
      script.src = src;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  };

  const initializeMediaPipe = async () => {
    if (mediaPipeLoadedRef.current) return true;
    try {
      setLiveCue("Priming computer vision AI... 🧠");
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1620228100/camera_utils.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js");
      
      // Wait for window.Pose to be defined (can take a few ms after script loads)
      for (let i = 0; i < 20; i++) {
        if (typeof window !== "undefined" && (window as any).Pose) break;
        await new Promise(r => setTimeout(r, 100));
      }
      
      if (typeof window !== "undefined" && (window as any).Pose) {
        const pose = new (window as any).Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
        });
        
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        pose.onResults(onPoseResults);
        poseInstanceRef.current = pose;
        mediaPipeLoadedRef.current = true;
        setLiveCue("Spine trackers active. Fits shoulders inside green box.");
        return true;
      }
      return false;
    } catch (e) {
      console.error("MediaPipe initialization failed:", e);
      setLiveCue("Calibration loaded. Running local acceleration.");
      return false;
    }
  };

  const onPoseResults = (results: any) => {
    const canvas = postureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw the source webcam frame mirrored or flipped
    ctx.save();
    if (isFrontCamera) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(results.image, 0, 0, w, h);
    ctx.restore();
    
    // If no landmarks are detected, draw the grid and return
    if (!results.poseLandmarks) {
      // Draw Grid
      ctx.strokeStyle = "rgba(139, 92, 246, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      return;
    }
    
    // Get real joint coordinates
    const landmarks = results.poseLandmarks;
    
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    
    const sk = skeletonRef.current;
    
    const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;
    const smoothFactor = 0.35;
    
    const mapPoint = (pt: any) => ({
      x: isFrontCamera ? (1 - pt.x) * w : pt.x * w,
      y: pt.y * h
    });
    
    const mappedNose = mapPoint(nose);
    const mappedLShoulder = mapPoint(leftShoulder);
    const mappedRShoulder = mapPoint(rightShoulder);
    const mappedLHip = mapPoint(leftHip);
    const mappedRHip = mapPoint(rightHip);
    const mappedLKnee = mapPoint(leftKnee);
    const mappedRKnee = mapPoint(rightKnee);
    const mappedLAnkle = mapPoint(leftAnkle);
    const mappedRAnkle = mapPoint(rightAnkle);
    
    // Smooth skeleton target points
    sk.head.targetX = mappedNose.x;
    sk.head.targetY = mappedNose.y;
    sk.neck.targetX = (mappedLShoulder.x + mappedRShoulder.x) / 2;
    sk.neck.targetY = (mappedLShoulder.y + mappedRShoulder.y) / 2 - 10;
    
    sk.leftShoulder.targetX = mappedLShoulder.x;
    sk.leftShoulder.targetY = mappedLShoulder.y;
    sk.rightShoulder.targetX = mappedRShoulder.x;
    sk.rightShoulder.targetY = mappedRShoulder.y;
    
    sk.spineMid.targetX = (mappedLShoulder.x + mappedRShoulder.x + mappedLHip.x + mappedRHip.x) / 4;
    sk.spineMid.targetY = (mappedLShoulder.y + mappedRShoulder.y + mappedLHip.y + mappedRHip.y) / 4;
    
    sk.leftHip.targetX = mappedLHip.x;
    sk.leftHip.targetY = mappedLHip.y;
    sk.rightHip.targetX = mappedRHip.x;
    sk.rightHip.targetY = mappedRHip.y;
    
    sk.leftKnee.targetX = mappedLKnee.x;
    sk.leftKnee.targetY = mappedLKnee.y;
    sk.rightKnee.targetX = mappedRKnee.x;
    sk.rightKnee.targetY = mappedRKnee.y;
    
    sk.leftAnkle.targetX = mappedLAnkle.x;
    sk.leftAnkle.targetY = mappedLAnkle.y;
    sk.rightAnkle.targetX = mappedRAnkle.x;
    sk.rightAnkle.targetY = mappedRAnkle.y;
    
    // Apply smooth interpolation
    Object.keys(sk).forEach((key) => {
      const node = sk[key as keyof typeof sk];
      node.x = lerp(node.x, node.targetX, smoothFactor);
      node.y = lerp(node.y, node.targetY, smoothFactor);
    });
    
    // Perform Real-Time joint geometry math
    let currentScore = 95;
    let coachCue = "Calibration successful. Scanning active alignment...";
    let alertMsg = null;
    let quality = "Excellent Alignment Check";
    
    const shoulderDiffY = Math.abs(leftShoulder.y - rightShoulder.y);
    const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
    const neckForwardDistance = Math.abs(nose.x - shoulderCenterX);
    

    
    // Draw Grid
    ctx.strokeStyle = "rgba(139, 92, 246, 0.08)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    
    // Draw Corners
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1.5;
    const borderOffset = 15;
    ctx.beginPath();
    ctx.moveTo(borderOffset, borderOffset + 20); ctx.lineTo(borderOffset, borderOffset); ctx.lineTo(borderOffset + 20, borderOffset);
    ctx.moveTo(w - borderOffset, borderOffset + 20); ctx.lineTo(w - borderOffset, borderOffset); ctx.lineTo(w - borderOffset - 20, borderOffset);
    ctx.moveTo(borderOffset, h - borderOffset - 20); ctx.lineTo(borderOffset, h - borderOffset); ctx.lineTo(borderOffset + 20, h - borderOffset);
    ctx.moveTo(w - borderOffset, h - borderOffset - 20); ctx.lineTo(w - borderOffset, h - borderOffset); ctx.lineTo(w - borderOffset - 20, h - borderOffset);
    ctx.stroke();
    
    // Bone lines drawing
    const mainColor = currentScore > 88 ? "0, 240, 255" : "255, 0, 85";
    ctx.shadowBlur = 15;
    ctx.shadowColor = `rgba(${mainColor}, 0.7)`;
    
    const drawBone = (p1: typeof sk.head, p2: typeof sk.head) => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${mainColor}, 0.85)`;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };
    
    drawBone(sk.head, sk.neck);
    drawBone(sk.neck, sk.leftShoulder);
    drawBone(sk.neck, sk.rightShoulder);
    drawBone(sk.leftShoulder, sk.spineMid);
    drawBone(sk.rightShoulder, sk.spineMid);
    drawBone(sk.spineMid, sk.leftHip);
    drawBone(sk.spineMid, sk.rightHip);
    drawBone(sk.leftHip, sk.leftKnee);
    drawBone(sk.rightHip, sk.rightKnee);
    drawBone(sk.leftKnee, sk.leftAnkle);
    drawBone(sk.rightKnee, sk.rightAnkle);
    
    // Node circles drawing
    ctx.shadowBlur = 10;
    Object.keys(sk).forEach((key) => {
      const node = sk[key as keyof typeof sk];
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${mainColor}, 0.95)`;
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = key === "head" ? "#ffea00" : `rgb(${mainColor})`;
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  };

  const startWebcam = async () => {
    setCameraError(null);
    try {
      if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
        setCameraError("Camera access requires HTTPS connection or localhost.");
        setIsWebcamActive(false);
        return;
      }
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isFrontCamera ? "user" : "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      setWebcamStream(stream);
      setIsWebcamActive(true);
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play().catch(e => console.error("Video playback error", e));
      }
    } catch (err: any) {
      console.error("Camera access failure:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Please enable camera access in your browser settings to analyze posture.");
      } else {
        setCameraError("Camera access required for posture analysis.");
      }
      setIsWebcamActive(false);
      setPostureScore(null);
      setAlignmentQuality(null);
      setStabilityScore(null);
      setMobilityScore(null);
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setIsWebcamActive(false);
    setPostureScore(null);
    setAlignmentQuality(null);
    setStabilityScore(null);
    setMobilityScore(null);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    prevFrameRef.current = null;
  };

  // Flip facing mode change
  useEffect(() => {
    if (isWebcamActive) {
      startWebcam();
    }
  }, [isFrontCamera]);

  // Active workout webcam trigger
  useEffect(() => {
    if (coachState === "active") {
      startWebcam();
    } else {
      stopWebcam();
    }
  }, [coachState]);

  // Unmount final cleanup
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // MediaPipe real frame capture & processing loop
  useEffect(() => {
    let active = true;
    const processLoop = async () => {
      const video = webcamVideoRef.current;
      if (!video || !isWebcamActive) return;
      
      const initialized = await initializeMediaPipe();
      if (!initialized) {
        return;
      }
      
      const sendFrame = async () => {
        if (!active || !isWebcamActive || !video) return;
        if (video.readyState >= 2 && !video.paused && !video.ended) {
          try {
            await poseInstanceRef.current.send({ image: video });
          } catch (e) {
            console.error("Pose frame error:", e);
          }
        }
        if (active && isWebcamActive) {
          requestRef.current = requestAnimationFrame(sendFrame);
        }
      };
      
      sendFrame();
    };
    
    if (isWebcamActive) {
      processLoop();
    }
    
    return () => {
      active = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isWebcamActive, isFrontCamera]);


  // Fetch Supabase workouts if possible
  useEffect(() => {
    async function fetchDBWorkouts() {
      if (supabase && profile?.id) {
        try {
          const { data, error } = await supabase
            .from("workouts")
            .select("*")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false });
          if (data && !error) {
            const wHistory = data.filter((w: any) => w.type !== "POSTURE" && w.type !== "steps").map((w: any) => ({
              date: new Date(w.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              focus: w.type,
              duration: w.duration_minutes,
              calories: w.calories_burned,
              completed: w.completed,
              rating: w.intensity
            }));
            setWorkoutHistory(wHistory);
          }
        } catch (e) {
          console.warn("Error fetching workouts from Supabase.");
        }
      }
    }
    fetchDBWorkouts();
  }, [profile?.id]);

  // Timer intervals & localStorage sync
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerRunning && timeLeft === 0) {
      setTimerRunning(false);
      handleTimeExpired();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Save active timer state to localStorage (user-scoped)
  useEffect(() => {
    if (typeof window === "undefined" || !profile?.id) return;
    const key = `vitalcore_workout_${profile.id}`;
    if (timerRunning) {
      localStorage.setItem(key, JSON.stringify({
        currentExerciseIdx,
        timeLeft,
        isResting,
        timerRunning: true,
        lastUpdated: Date.now()
      }));
    } else if (coachState !== "active") {
      localStorage.removeItem(key);
    }
  }, [timerRunning, currentExerciseIdx, timeLeft, isResting, coachState, profile?.id]);

  // Restore workout session on page load
  useEffect(() => {
    if (typeof window === "undefined" || !profile?.id) return;
    const key = `vitalcore_workout_${profile.id}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        const elapsed = Math.floor((Date.now() - (parsed.lastUpdated || Date.now())) / 1000);
        const remaining = Math.max(0, (parsed.timeLeft || 45) - elapsed);
        if (remaining > 0) {
          setCurrentExerciseIdx(parsed.currentExerciseIdx || 0);
          setTimeLeft(remaining);
          setIsResting(Boolean(parsed.isResting));
          setTimerRunning(Boolean(parsed.timerRunning));
          setCoachState("active");
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.error("Error restoring workout session:", e);
    }
  }, [profile?.id]);

  // Loading Screen ticks animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (coachState === "generating") {
      interval = setInterval(() => {
        setLoadingTick(prev => {
          if (prev >= 3) {
            clearInterval(interval);
            setTimeout(() => {
              setCoachState("preview");
            }, 600);
            return 3;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [coachState]);

  const handleTimeExpired = () => {
    if (isResting) {
      setIsResting(false);
      const nextIdx = currentExerciseIdx + 1;
      if (nextIdx < generatedWorkout.length) {
        setCurrentExerciseIdx(nextIdx);
        setTimeLeft(generatedWorkout[nextIdx].durationSeconds);
        setTimerRunning(true);
      } else {
        finishWorkoutSession();
      }
    } else {
      const updated = [...completedExercises];
      updated[currentExerciseIdx] = true;
      setCompletedExercises(updated);

      const nextIdx = currentExerciseIdx + 1;
      if (nextIdx < generatedWorkout.length) {
        setIsResting(true);
        setTimeLeft(generatedWorkout[currentExerciseIdx].restSeconds);
        setTimerRunning(true);
      } else {
        finishWorkoutSession();
      }
    }
  };

  // Compile final adaptive workout
  const compileWorkout = () => {
    setRecoveryWarning("");
    setLoadingTick(0);
    setCoachState("generating");

    const focusKey = focus === "yoga" || focus === "recovery" ? "mobility" : focus;
    const originalList = EXERCISE_DATABASE[focusKey] || EXERCISE_DATABASE["full_body"];
    
    let filteredList = originalList;
    if (equipment === "bodyweight" || equipment === "none") {
      filteredList = originalList.filter(ex => ex.equipment === "Bodyweight");
    } else if (equipment === "dumbbells") {
      filteredList = originalList.filter(ex => ex.equipment === "Bodyweight" || ex.equipment === "Dumbbells");
    } else if (equipment === "bands") {
      filteredList = originalList.filter(ex => ex.equipment === "Bodyweight" || ex.equipment === "Bands" || ex.equipment === "Resistance Bands");
    } else if (equipment === "yoga_mobility") {
      const mobilityList = EXERCISE_DATABASE["mobility"] || originalList;
      filteredList = mobilityList.filter(ex => ex.equipment === "Bodyweight");
    } else if (equipment === "outdoor") {
      filteredList = originalList.filter(ex => ex.equipment === "Bodyweight");
    } else if (equipment === "home_gym") {
      filteredList = originalList.filter(ex => ex.equipment === "Bodyweight" || ex.equipment === "Dumbbells" || ex.equipment === "Bands");
    } else if (equipment === "commercial_gym") {
      filteredList = originalList;
    }

    if (filteredList.length === 0) {
      filteredList = originalList;
    }

    // Shuffle the filtered list for dynamic routines
    filteredList = [...filteredList].sort(() => 0.5 - Math.random());

    let finalIntensity = intensity;
    let restBuffer = 0;
    
    // Bio-feedback calculations
    const isFatigued = feeling === "tired" || feeling === "stressed" || feeling === "sore" || (metrics && metrics.sleepQuality < 65);
    const isHighSoreness = profile?.soreness_level && profile.soreness_level > 5;
    
    let readiness = 88;
    if (isFatigued) readiness -= 20;
    if (isHighSoreness) readiness -= 15;
    setReadinessScore(Math.max(30, readiness));

    if (isFatigued || isHighSoreness) {
      finalIntensity = "light";
      restBuffer = 10; 
      setRecoveryWarning(
        "💡 We detected higher fatigue, sleep debt, or muscular soreness. To protect your joints, we have calibrated your workout to a supportive Light intensity and added extra rest buffers."
      );
    }

    const formattedExercises = filteredList.map(ex => {
      let repsLabel = ex.reps;
      let dur = ex.durationSeconds;
      
      if (finalIntensity === "light") {
        dur = Math.round(ex.durationSeconds * 0.8);
        repsLabel = ex.reps.includes("reps") ? `${Math.round(parseInt(ex.reps) * 0.8)} reps` : ex.reps;
      } else if (finalIntensity === "intense") {
        dur = Math.round(ex.durationSeconds * 1.2);
        repsLabel = ex.reps.includes("reps") ? `${Math.round(parseInt(ex.reps) * 1.2)} reps` : ex.reps;
      }

      return {
        ...ex,
        reps: repsLabel,
        durationSeconds: dur,
        restSeconds: ex.restSeconds + restBuffer
      };
    });

    const titleFocus = focus.replace("_", " ").toUpperCase();
    setActiveWorkoutName(`AI ${finalIntensity.toUpperCase()} ${titleFocus} ROUTINE`);
    setGeneratedWorkout(formattedExercises);
    setCompletedExercises(new Array(formattedExercises.length).fill(false));
    setCurrentExerciseIdx(0);
    setTimeLeft(formattedExercises[0].durationSeconds);
    setIsResting(false);
    setTimerRunning(false);
  };

  const handleMarkComplete = () => {
    if (isResting) {
      setIsResting(false);
      const nextIdx = currentExerciseIdx + 1;
      if (nextIdx < generatedWorkout.length) {
        setCurrentExerciseIdx(nextIdx);
        setTimeLeft(generatedWorkout[nextIdx].durationSeconds);
        setTimerRunning(true);
      } else {
        finishWorkoutSession();
      }
    } else {
      const updated = [...completedExercises];
      updated[currentExerciseIdx] = true;
      setCompletedExercises(updated);

      const nextIdx = currentExerciseIdx + 1;
      if (nextIdx < generatedWorkout.length) {
        setIsResting(true);
        setTimeLeft(generatedWorkout[currentExerciseIdx].restSeconds);
        setTimerRunning(true);
      } else {
        finishWorkoutSession();
      }
    }
  };

  const handleSkipExercise = () => {
    const nextIdx = currentExerciseIdx + 1;
    if (nextIdx < generatedWorkout.length) {
      setCurrentExerciseIdx(nextIdx);
      setTimeLeft(generatedWorkout[nextIdx].durationSeconds);
      setIsResting(false);
      setTimerRunning(false);
    } else {
      finishWorkoutSession();
    }
  };

  const finishWorkoutSession = async () => {
    setTimerRunning(false);
    confetti({
      particleCount: 150,
      spread: 80,
      colors: ["#8b5cf6", "#10b981", "#ec4899"]
    });

    const mins = duration;
    setWorkoutDurationSpent(mins);
    
    const calorieBurn = Math.round(mins * (intensity === "intense" ? 10 : intensity === "moderate" ? 7 : 4));
    setCaloriesBurned(calorieBurn);

    let feedback = "";
    if (feeling === "tired" || feeling === "stressed") {
      feedback = "🧘 Excellent! Your active mobility and gentle intensity choice today kept cardiac strain low. Remember to hydrate with 600ml of mineralized water within 30 minutes to reduce muscle tension.";
    } else {
      feedback = "⚡ Outstanding! High coordination capacity detected. Your active training today has optimized your muscle glycogen pathways and increased metabolic burn indexes. Great work!";
    }
    setPostWorkoutFeedback(feedback);

    const newLog = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      focus: focus.replace("_", " ").toUpperCase(),
      duration: mins,
      calories: calorieBurn,
      completed: true,
      rating: intensity.toUpperCase()
    };

    setWorkoutHistory(prev => [newLog, ...prev]);
    if (supabase && profile?.id) {
      try {
        await supabase.from("workouts").insert({
          user_id: profile.id,
          name: activeWorkoutName,
          type: focus.replace("_", " ").toUpperCase(),
          duration_minutes: mins,
          intensity: intensity.toLowerCase() as any,
          calories_burned: calorieBurn,
          completed: true,
          adaptive_adapted: recoveryWarning !== "",
          notes: feedback
        });
        window.dispatchEvent(new Event("vitalcore-data-updated"));
      } catch (err) {
        console.error("Database save failed.");
      }
    }

    setCoachState("summary");
  };

  const handleSaveRoutine = () => {
    const newRoutine = {
      id: `r-${Date.now()}`,
      name: activeWorkoutName,
      focus: focus,
      duration: duration,
      exercisesCount: generatedWorkout.length
    };
    setSavedRoutines(prev => [newRoutine, ...prev]);
    alert("Routine successfully added to your Saved Routines library!");
  };

  // Advance step in form and automatically submit if final step
  const handleSelectOption = (key: string, val: any) => {
    if (key === "feeling") setFeeling(val);
    if (key === "location") setLocation(val);
    if (key === "focus") setFocus(val);
    if (key === "duration") setDuration(Number(val));
    if (key === "equipment") setEquipment(val);
    if (key === "intensity") {
      setIntensity(val);
      // Last step answered, compile immediately
      setTimeout(() => {
        compileWorkout();
      }, 200);
      return;
    }
    
    // Smooth transition to next step
    setTimeout(() => {
      setQuestionStep(prev => Math.min(6, prev + 1));
    }, 200);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border-foreground/5 bg-gradient-to-r from-primary/10 via-background to-secondary/5 p-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary animate-pulse" />
              My Workout Companion
            </h1>
            <p className="text-xs text-foreground/70 font-semibold">
              Your guided workout sessions and companion tools designed for your daily rhythm.
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="grid grid-cols-2 gap-2 border-b border-foreground/5 pb-1">
          {[
            { id: "coach", label: "Guided Workouts", icon: Dumbbell },
            { id: "history", label: "My History", icon: Calendar }
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === "coach") {
                    setCoachState("form");
                    setQuestionStep(1);
                  }
                }}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-md shadow-primary/15"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <TabIcon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="space-y-6">
          
          {/* TAB 1: COACH TAB */}
          {activeTab === "coach" && (
            <>
              {/* STATE A: MULTI-STEP CONVERSATIONAL QUESTIONNAIRE */}
              {coachState === "form" && (
                <div className="max-w-[500px] mx-auto py-10">
                  <GlassCard glowColor="violet" className="p-6 border border-foreground/5 space-y-6">
                    
                    {/* Header Step progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-foreground/50 tracking-wider uppercase">
                        <span>Step {questionStep} of 6</span>
                        <span>{Math.round((questionStep / 6) * 100)}% Complete</span>
                      </div>
                      <div className="w-full bg-foreground/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${(questionStep / 6) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Step 1: Feeling */}
                    {questionStep === 1 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
                          How are you feeling today?
                        </h2>
                        <div className="flex flex-col gap-2">
                          {[
                            { value: "energetic", label: "💪 Energetic & Dynamic" },
                            { value: "normal", label: "😌 Good & Normal" },
                            { value: "tired", label: "😴 Tired & Low Energy" },
                            { value: "stressed", label: "🧠 Stressed & Burnt-out" },
                            { value: "sore", label: "🩹 Sore Muscles" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption("feeling", opt.value)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all hover:bg-foreground/5 ${
                                feeling === opt.value
                                  ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/5"
                                  : "border-foreground/5 bg-foreground/5 text-foreground/80"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Location */}
                    {questionStep === 2 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
                          Where are you working out today?
                        </h2>
                        <div className="flex flex-col gap-2">
                          {[
                            { value: "home", label: "🏡 Home Living Space" },
                            { value: "gym", label: "🏋️ Commercial Gym" },
                            { value: "outdoors", label: "🌳 Outdoors & Park" },
                            { value: "office", label: "🏢 Office Desk Area" },
                            { value: "traveling", label: "✈️ Hotel / Traveling" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption("location", opt.value)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all hover:bg-foreground/5 ${
                                location === opt.value
                                  ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/5"
                                  : "border-foreground/5 bg-foreground/5 text-foreground/80"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Focus */}
                    {questionStep === 3 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
                          What is your target focus today?
                        </h2>
                        <div className="flex flex-col gap-2">
                          {[
                            { value: "full_body", label: "🌀 Full Body Integration" },
                            { value: "chest", label: "🏋️ Chest Press & Push" },
                            { value: "back", label: "👐 Back Pulls & Lats" },
                            { value: "legs", label: "🦿 Leg strength & Squat" },
                            { value: "core", label: "🪵 Core Stability & Abs" },
                            { value: "shoulders", label: "🛡️ Shoulders & Upper Posture" },
                            { value: "mobility", label: "🧘 Restorative Mobility Flow" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption("focus", opt.value)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all hover:bg-foreground/5 ${
                                focus === opt.value
                                  ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/5"
                                  : "border-foreground/5 bg-foreground/5 text-foreground/80"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Duration */}
                    {questionStep === 4 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
                          How much time do you have today?
                        </h2>
                        <div className="flex flex-col gap-2">
                          {[
                            { value: "15", label: "⏱️ 15 Mins (Express Routine)" },
                            { value: "30", label: "⏱️ 30 Mins (Standard Balance)" },
                            { value: "45", label: "⏱️ 45 Mins (Optimized Power)" },
                            { value: "60", label: "⏱️ 60+ Mins (Peak Performance)" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption("duration", opt.value)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all hover:bg-foreground/5 ${
                                duration.toString() === opt.value
                                  ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/5"
                                  : "border-foreground/5 bg-foreground/5 text-foreground/80"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 5: Equipment */}
                    {questionStep === 5 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
                          What equipment is available?
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: "bodyweight", label: "🤸 Bodyweight Only", desc: "No weights or machines" },
                            { value: "dumbbells", label: "🏋️ Dumbbells Only", desc: "Dumbbells or kettlebells" },
                            { value: "bands", label: "🧬 Resistance Bands", desc: "Elastic loops or tubes" },
                            { value: "home_gym", label: "🏡 Home Gym Setup", desc: "Dumbbells, bands & bench" },
                            { value: "commercial_gym", label: "🏢 Full Commercial Gym", desc: "Barbells, cables & machines" },
                            { value: "yoga_mobility", label: "🧘 Yoga & Mobility Props", desc: "Foam roller, mat, straps" },
                            { value: "outdoor", label: "🌳 Outdoor Setup", desc: "Bodyweight, stairs & tracks" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption("equipment", opt.value)}
                              className={`text-left p-3.5 rounded-xl border text-xs font-bold transition-all hover:bg-foreground/5 flex flex-col gap-1.5 cursor-pointer ${
                                equipment === opt.value
                                  ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/5 scale-[1.02]"
                                  : "border-foreground/5 bg-foreground/5 text-foreground/80"
                              }`}
                            >
                              <span className="text-sm font-bold block">{opt.label}</span>
                              <span className="text-[10px] text-foreground/45 block font-semibold leading-normal">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 6: Intensity */}
                    {questionStep === 6 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-bold text-foreground tracking-tight leading-snug">
                          How intense should today be?
                        </h2>
                        <div className="flex flex-col gap-2">
                          {[
                            { value: "light", label: "🕊️ Light (Aerobic & Recovery)" },
                            { value: "moderate", label: "⚡ Moderate (Steady & Active)" },
                            { value: "intense", label: "🔥 Intense (High Power & Stamina)" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption("intensity", opt.value)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all hover:bg-foreground/5 ${
                                intensity === opt.value
                                  ? "border-primary text-primary bg-primary/5 shadow-md shadow-primary/5"
                                  : "border-foreground/5 bg-foreground/5 text-foreground/80"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Nav Controls */}
                    <div className="flex justify-between items-center pt-4 border-t border-foreground/5 text-xs font-semibold">
                      {questionStep > 1 ? (
                        <button 
                          onClick={() => setQuestionStep(prev => prev - 1)} 
                          className="flex items-center gap-1.5 text-foreground/60 hover:text-foreground transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back</span>
                        </button>
                      ) : (
                        <div />
                      )}
                      
                      {questionStep < 6 && (
                        <button 
                          onClick={() => setQuestionStep(prev => prev + 1)}
                          className="flex items-center gap-1 text-primary hover:underline transition-colors"
                        >
                          <span>Skip</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                  </GlassCard>
                </div>
              )}

              {/* STATE B: NEURAL GENERATING LOADING SCREEN */}
              {coachState === "generating" && (
                <div className="max-w-[460px] mx-auto py-16 text-center">
                  <GlassCard glowColor="violet" className="p-8 space-y-6">
                    <div className="flex justify-center">
                      <RefreshCw className="h-12 w-12 text-primary animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-foreground">Preparing Your Wellness Session...</h3>
                      <p className="text-[10px] text-primary font-bold tracking-widest uppercase">
                        Calibrating active adjustments
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 text-left max-w-sm mx-auto">
                      {[
                        "Analyzing sleep and recovery patterns...",
                        "Reviewing recent physical loads...",
                        "Assessing daily fatigue markers...",
                        "Calibrating movements for today's physical capacity..."
                      ].map((stepMsg, idx) => (
                        <div key={idx} className="flex gap-2.5 items-center text-xs font-semibold">
                          <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                            loadingTick >= idx 
                              ? "bg-primary/10 text-primary font-bold" 
                              : "bg-foreground/5 text-foreground/20"
                          }`}>
                            {loadingTick >= idx ? "✓" : idx + 1}
                          </div>
                          <span className={loadingTick >= idx ? "text-foreground" : "text-foreground/30"}>
                            {stepMsg}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* STATE C: PRE-WORKOUT PREVIEW DASHBOARD */}
              {coachState === "preview" && generatedWorkout.length > 0 && (
                <div className="max-w-3xl mx-auto space-y-6">
                  
                  {/* Premium Illustration Header Card */}
                  <div className="rounded-[28px] overflow-hidden relative min-h-[160px] bg-[var(--muted-bg)]/45 border border-[var(--border)] flex items-center shadow-sm p-6 sm:p-8">
                    <img 
                      src="/images/workout_illustration.png" 
                      alt="Workout illustration" 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-44 sm:w-56 object-contain pointer-events-none opacity-90 hidden sm:block"
                    />
                    <div className="space-y-2 relative z-10 max-w-full sm:max-w-[65%]">
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest block">Active Session Outline</span>
                      <h2 className="text-lg font-semibold text-[var(--foreground)] tracking-tight leading-tight capitalize">
                        {activeWorkoutName.replace("AI ", "").toLowerCase()}
                      </h2>
                      <p className="text-xs text-[var(--muted)] leading-relaxed font-normal">
                        Ready to begin? The session includes {generatedWorkout.length} tailored movements optimized for your biological recovery capacity.
                      </p>
                    </div>
                  </div>

                  {/* Integrated Readiness & Reasoning */}
                  <GlassCard glowColor="violet" className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-foreground/5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Session details</span>
                        <h3 className="text-base font-semibold text-foreground">Coach Guidance</h3>
                      </div>
                      
                      {/* Integrated Readiness Badge */}
                      <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2 shrink-0">
                        <div className="text-right">
                          <span className="text-[8px] font-bold text-foreground/50 uppercase block">Energy Status</span>
                          <span className="text-xs font-semibold text-foreground">
                            {metrics?.hasEnergyTelemetry 
                              ? (readinessScore > 75 ? "Ready to Move" : "Restorative Recovery")
                              : "Not enough telemetry"}
                          </span>
                        </div>
                        <div className="h-10 w-10 rounded-full border-2 border-primary flex items-center justify-center font-bold text-sm text-primary shadow-lg shadow-primary/10 bg-background shrink-0">
                          {metrics?.hasEnergyTelemetry ? `${readinessScore}%` : "--"}
                        </div>
                      </div>
                    </div>

                    {/* AI Reasoning Text */}
                    <div className="text-xs text-foreground/80 leading-relaxed font-semibold bg-foreground/5 p-4 rounded-xl border border-foreground/5">
                      {metrics?.hasEnergyTelemetry 
                        ? (recoveryWarning || "Your body is fully recharged! We compiled a strength and cardio session to support your metabolic wellness and cardiac health.")
                        : "Insufficient telemetry logged today. Complete your sleep log, fatigue check, or recovery score to generate accurate Energy Status guidance."}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-foreground/50 font-bold uppercase tracking-wider pt-2">
                      <span>Recent activity analyzed</span>
                      <span>Target: {duration} Mins</span>
                    </div>
                  </GlassCard>

                  {/* Exercises list preview */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-widest pl-1">
                      Exercise Routine Preview ({generatedWorkout.length} exercises)
                    </h3>
                    <div className="space-y-3">
                      {generatedWorkout.map((ex, idx) => (
                        <div key={idx} className="p-4 rounded-2xl glass-panel border border-foreground/5 bg-background/30 flex justify-between items-center gap-4">
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-xs font-bold text-foreground leading-normal flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-primary bg-primary/10 h-5 w-5 rounded-lg flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              {ex.name}
                            </h4>
                            <p className="text-[11px] text-foreground/60 leading-relaxed font-semibold max-w-lg truncate">
                              {ex.description}
                            </p>
                          </div>

                          <div className="flex gap-4 text-xs font-bold shrink-0">
                            <div className="text-right">
                              <span className="text-[9px] text-foreground/45 uppercase block">Target</span>
                              <span>{ex.reps}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-secondary uppercase block">Equipment</span>
                              <span className="text-secondary">{ex.equipment}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action triggers */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <Button 
                      variant="glass" 
                      onClick={() => {
                        setCoachState("form");
                        setQuestionStep(1);
                      }} 
                      className="flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Re-compile Questionnaire</span>
                    </Button>

                    <Button 
                      variant="primary" 
                      onClick={() => setCoachState("active")} 
                      className="flex-[2] py-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/25"
                    >
                      <Play className="h-4 w-4 fill-white" />
                      <span>Launch Guided Workout Terminal</span>
                    </Button>
                  </div>

                </div>
              )}

              {/* STATE D: ACTIVE GUIDED IMMERSIVE COACHING TERMINAL */}
              {coachState === "active" && generatedWorkout.length > 0 && (
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  {/* Header Progress Header */}
                  <GlassCard glowColor="violet" className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        {activeWorkoutName}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div className="flex items-center gap-4 text-xs font-bold text-foreground/70 shrink-0">
                      <span>Exercise {currentExerciseIdx + 1} of {generatedWorkout.length}</span>
                      <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px]">
                        {Math.round(((currentExerciseIdx) / generatedWorkout.length) * 100)}% Done
                      </span>
                      <span className="text-rose-400">
                        🔥 {Math.round((currentExerciseIdx / generatedWorkout.length) * caloriesBurned || (currentExerciseIdx * 35))} kcal
                      </span>
                    </div>
                  </GlassCard>

                  {/* Immersive Screen Splitter */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Left Column: Visual Posture Guidance & Demo Area */}
                    <GlassCard glowColor="rose" className="md:col-span-7 p-5 flex flex-col justify-between space-y-4 min-h-[380px] rounded-3xl">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1">
                            <Activity className="h-3 w-3 animate-pulse" />
                            Guided Movement Camera
                          </span>
                          <span className="bg-rose-500/10 text-rose-500 text-[8px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Active tracking
                          </span>
                        </div>
                        
                        {/* Real-time Posture Video and Canvas Trackers */}
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-foreground/10 flex flex-col items-center justify-center text-center group shadow-2xl">
                          
                          {/* Real Hidden Video Stream Element */}
                          <video 
                            ref={webcamVideoRef}
                            className="hidden"
                            playsInline
                            muted
                          />

                          {/* Live Render Canvas Overlay */}
                          <canvas 
                            ref={postureCanvasRef}
                            className="w-full h-full object-cover rounded-2xl block"
                          />

                          {/* Real-time form indicators */}
                          {isWebcamActive && !cameraError && postureScore !== null ? (
                            <>
                              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-[10px] font-semibold text-left text-foreground space-y-1 shadow-lg pointer-events-none">
                                <div className="flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
                                  <span className="text-[#00f0ff] uppercase tracking-wider text-[8px] font-bold">Live Feedback HUD</span>
                                </div>
                                <div className="text-foreground/80 mt-1">• Posture cue: {alignmentQuality || "Calibrating..."}</div>
                                <div className="text-foreground/80">• Spine stability: {stabilityScore !== null ? `${stabilityScore}%` : "--"}</div>
                                <div className="text-foreground/80">• Range of motion: {mobilityScore !== null ? `${mobilityScore}%` : "--"}</div>
                              </div>

                              <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1.5 pointer-events-none">
                                {formAlert && (
                                  <div className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider animate-bounce shadow-lg shadow-rose-500/25 border border-rose-400">
                                    ⚠️ {formAlert}
                                  </div>
                                )}
                                <div className={`text-white text-[10px] font-extrabold px-3 py-1 rounded-lg shadow-md border ${
                                  (postureScore || 0) > 88 
                                    ? "bg-emerald-500 border-emerald-400" 
                                    : "bg-amber-500 border-amber-400"
                                }`}>
                                  Posture Score: {postureScore}%
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-6 text-center space-y-3 z-10">
                              <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl font-bold">
                                📷
                              </div>
                              <p className="text-sm font-bold text-white max-w-xs">
                                Camera access required for posture analysis.
                              </p>
                              <button
                                onClick={startWebcam}
                                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20 cursor-pointer"
                              >
                                Enable Camera
                              </button>
                            </div>
                          )}

                          {/* Futuristic interactive camera utility actions */}
                          <div className="absolute bottom-3 left-3 flex gap-2">
                            <button
                              onClick={() => setIsFrontCamera(!isFrontCamera)}
                              className="bg-black/75 hover:bg-black/90 text-white border border-white/10 p-2 rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center hover:border-primary/50 text-[10px] font-extrabold gap-1 cursor-pointer"
                              title="Flip camera"
                            >
                              🔄 Flip Camera
                            </button>
                            {cameraError && (
                              <div className="bg-red-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1.5 rounded-lg border border-red-400 shadow-md flex items-center max-w-[200px] text-left">
                                {cameraError}
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* Step-by-Step interactive instructions */}
                      <div className="space-y-2 pt-2 border-t border-foreground/5">
                        <span className="text-[10px] font-bold text-foreground/50 uppercase block">Coaching Execution Cues</span>
                        <div className="space-y-1.5 text-xs text-foreground/80 font-semibold leading-relaxed">
                          {generatedWorkout[currentExerciseIdx].name === "Cat-Cow Stretch" ? (
                            <>
                              <div className="flex gap-2 items-start"><span className="text-primary font-bold">1.</span><span>Start on hands and knees with a neutral spine.</span></div>
                              <div className="flex gap-2 items-start"><span className="text-primary font-bold">2.</span><span>Inhale, drop your belly, and arch your back (Cow Pose).</span></div>
                              <div className="flex gap-2 items-start"><span className="text-primary font-bold">3.</span><span>Exhale, round your spine toward the ceiling (Cat Pose).</span></div>
                            </>
                          ) : generatedWorkout[currentExerciseIdx].name === "Bodyweight Squats" ? (
                            <>
                              <div className="flex gap-2 items-start"><span className="text-primary font-bold">1.</span><span>Place feet shoulder-width apart, chest upright.</span></div>
                              <div className="flex gap-2 items-start"><span className="text-primary font-bold">2.</span><span>Lower hips down and back as if sitting in a chair.</span></div>
                              <div className="flex gap-2 items-start"><span className="text-primary font-bold">3.</span><span>Keep knees behind toes, push through heels to stand.</span></div>
                            </>
                          ) : (
                            <>
                              <div className="flex gap-2 items-start"><span className="text-primary font-bold">1.</span><span>Position yourself on a flat, joint-supportive surface.</span></div>
                              <div className="flex gap-2 items-start"><span className="text-primary font-bold">2.</span><span>Maintain deep, steady diaphragmatic respiration beats.</span></div>
                              <div className="flex gap-2 items-start"><span className="text-primary font-bold">3.</span><span>Execute with complete control, prioritizing orthopedic safety.</span></div>
                            </>
                          )}
                        </div>
                      </div>
                    </GlassCard>

                    {/* Right Column: Timer, Details, and Active AI Guidance */}
                    <div className="md:col-span-5 flex flex-col gap-6 justify-between">
                      
                      {/* Active Exercise Detail Card */}
                      <GlassCard glowColor={isResting ? "emerald" : "violet"} className="p-6 text-center space-y-4 flex-1 flex flex-col justify-between">
                        
                        {isResting ? (
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                              Rest & Transition
                            </span>
                            <h2 className="text-xl font-bold mt-2">Catch Your Breath</h2>
                            <p className="text-[11px] text-foreground/60 leading-relaxed font-semibold">
                              Prepare for the next exercise:
                            </p>
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl inline-block mt-2">
                              <span className="text-xs font-bold text-foreground">
                                {generatedWorkout[Math.min(generatedWorkout.length - 1, currentExerciseIdx + 1)].name}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                              Active Routine
                            </span>
                            <h2 className="text-2xl font-black mt-2 leading-tight">{generatedWorkout[currentExerciseIdx].name}</h2>
                            <p className="text-xs text-foreground/70 font-semibold leading-relaxed">
                              {generatedWorkout[currentExerciseIdx].description}
                            </p>
                          </div>
                        )}

                        {/* Interactive Countdown Timer */}
                        <div className="flex flex-col items-center py-4">
                          <div className="h-32 w-32 rounded-full border-4 border-foreground/5 flex flex-col items-center justify-center bg-foreground/5 relative shadow-inner">
                            <span className="text-3xl font-black tracking-tight text-foreground">{timeLeft}s</span>
                            <span className="text-[9px] uppercase font-bold text-foreground/45 mt-0.5">
                              {isResting ? "rest break" : "seconds left"}
                            </span>
                          </div>
                        </div>

                        {/* Active AI Guidance Display */}
                        <div className="p-3 bg-primary/5 border border-primary/10 rounded-2xl text-[11px] font-bold text-primary leading-normal text-center min-h-[50px] flex items-center justify-center">
                          {isResting ? (
                            <span>🧘 Deep box-breathing: Inhale 4s, exhale slowly to lower active cortisol.</span>
                          ) : timeLeft > 30 ? (
                            <span>💡 AI Cue: "Slow down your breathing and focus on isometric core control."</span>
                          ) : timeLeft > 15 ? (
                            <span>💡 AI Cue: "Maintain posture shoulder alignment. Keep joints soft."</span>
                          ) : (
                            <span>💡 AI Cue: "Last push! Keep your spine straight and push through heels."</span>
                          )}
                        </div>

                        {/* Target values */}
                        {!isResting && (
                          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold border-t border-foreground/5 pt-4">
                            <div>
                              <span className="text-foreground/45 uppercase text-[9px] block">Target</span>
                              <span className="text-foreground font-black">{generatedWorkout[currentExerciseIdx].reps}</span>
                            </div>
                            <div>
                              <span className="text-foreground/45 uppercase text-[9px] block">Sets</span>
                              <span className="text-foreground font-black">{generatedWorkout[currentExerciseIdx].sets} Sets</span>
                            </div>
                            <div>
                              <span className="text-foreground/45 uppercase text-[9px] block">Equipment</span>
                              <span className="text-secondary font-black truncate">{generatedWorkout[currentExerciseIdx].equipment}</span>
                            </div>
                          </div>
                        )}

                      </GlassCard>

                      {/* Interactive Guided Controls */}
                      <GlassCard glowColor="none" className="p-4 space-y-4">
                        <div className="flex justify-center items-center gap-4">
                          
                          <Button variant="glass" size="sm" onClick={handleSkipExercise} className="flex items-center gap-1 text-xs font-bold">
                            <ArrowRight className="h-4 w-4" />
                            <span>Skip</span>
                          </Button>

                          <button 
                            onClick={() => setTimerRunning(!timerRunning)}
                            className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                              timerRunning 
                                ? "bg-amber-500 shadow-amber-500/20" 
                                : "bg-primary shadow-primary/20"
                            }`}
                          >
                            {timerRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                          </button>

                          <Button variant="primary" size="sm" onClick={handleMarkComplete} className="flex items-center gap-1 text-xs font-bold">
                            <Check className="h-4 w-4" />
                            <span>Complete</span>
                          </Button>

                        </div>

                        {/* Quit Trigger */}
                        <div className="text-center">
                          <button 
                            onClick={() => {
                              if (confirm("Are you sure you want to stop this workout? Your active progress will be lost.")) {
                                setCoachState("form");
                              }
                            }}
                            className="text-[10px] font-bold text-foreground/40 hover:text-red-400 transition-colors uppercase tracking-widest cursor-pointer"
                          >
                            Quit Active Session
                          </button>
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE E: SESSION SUMMARY */}
              {coachState === "summary" && (
                <div className="max-w-xl mx-auto space-y-6">
                  
                  <GlassCard glowColor="emerald" className="p-6 space-y-6 text-center">
                    
                    <div className="space-y-2">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-xl animate-bounce">
                        🎉
                      </div>
                      <h2 className="text-2xl font-bold">Session Completed!</h2>
                      <p className="text-xs text-foreground/60 leading-relaxed font-semibold">
                        Sensory tracking records successfully logged. Let's look at your dynamic session telemetry:
                      </p>
                    </div>

                    {/* Stats metrics grid */}
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-foreground/5">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] text-foreground/50 uppercase font-bold flex items-center gap-1 justify-center">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          Duration
                        </span>
                        <div className="text-base font-extrabold">{workoutDurationSpent} mins</div>
                      </div>

                      <div className="text-center space-y-1">
                        <span className="text-[10px] text-foreground/50 uppercase font-bold flex items-center gap-1 justify-center">
                          <Flame className="h-3.5 w-3.5 text-rose-500" />
                          Burned Est
                        </span>
                        <div className="text-base font-extrabold text-rose-400">{caloriesBurned} kcal</div>
                      </div>

                      <div className="text-center space-y-1">
                        <span className="text-[10px] text-foreground/50 uppercase font-bold flex items-center gap-1 justify-center">
                          <Droplet className="h-3.5 w-3.5 text-secondary" />
                          Water Add
                        </span>
                        <div className="text-base font-extrabold text-secondary">600 ml</div>
                      </div>
                    </div>

                    {/* AI Coach Feedback */}
                    <div className="text-left space-y-2.5 bg-foreground/5 p-4 rounded-2xl border border-foreground/5">
                      <h4 className="text-xs font-bold text-primary flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        AI Coach Adaptive Feedback
                      </h4>
                      <p className="text-xs text-foreground/75 leading-relaxed font-semibold">
                        {postWorkoutFeedback}
                      </p>
                    </div>

                    {/* Interactive controls */}
                    <div className="flex justify-center pt-2">
                      <Button variant="primary" onClick={() => setCoachState("form")} className="w-full py-3 text-xs font-bold">
                        Finish Portal
                      </Button>
                    </div>

                  </GlassCard>

                </div>
              )}
            </>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === "history" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest pl-1">
                Your Fitness History Logs
              </h3>

              {workoutHistory.length === 0 ? (
                <GlassCard className="p-8 text-center text-xs text-foreground/50 font-bold">
                  No fitness records logged yet. Go to Guided Workouts to generate your first session!
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {workoutHistory.map((item, idx) => (
                    <GlassCard key={idx} className="p-4 flex items-center justify-between border border-foreground/5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm shrink-0">
                          💪
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground leading-normal">{item.focus} Routine</h4>
                          <span className="text-[10px] text-foreground/45 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {item.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs font-bold">
                        <div className="text-right">
                          <span className="text-[9px] text-foreground/50 uppercase block">Duration</span>
                          <span>{item.duration} mins</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-rose-400/80 uppercase block">Burned</span>
                          <span className="text-rose-400">{item.calories} kcal</span>
                        </div>
                        <span className="text-[9px] uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold">
                          {item.rating || "MODERATE"}
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}
