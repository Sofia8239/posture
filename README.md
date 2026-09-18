# Posture

A fitness web app that watches your form through the camera and coaches you in real
time — no wearables, no guesswork about whether a squat was actually deep enough.

## What it does

- **Real-time form tracking.** Points your device camera at you during an exercise,
  tracks body landmarks frame by frame, and flags specific technique issues as they
  happen (shallow depth, knees caving in, rounded back, uneven stance, and more) —
  rule sets tuned per exercise (squat, plié squat, narrow squat, lunges, glute bridge,
  plank).
- **Voice coaching.** Spoken, prioritized cues during a set instead of a wall of text
  to read mid-rep.
- **3D technique previews.** Every exercise in the catalog has an animated 3D
  walkthrough — step-by-step instructions synced to the movement, with the muscles
  worked highlighted as they engage.
- **Interactive body map.** Browse muscle groups and see which exercises target them
  across the 16-exercise catalog.
- **Progress tracking.** Session history, rep counts, and charts of which form issues
  come up most often over time.
- **Guided onboarding.** A short setup flow personalizes exercise selection and
  calibration to the user.

## Tech stack

- **React 19 + TypeScript**, built with **Vite**
- **MediaPipe Tasks Vision** for camera-based body landmark tracking
- **three.js** (via **react-three-fiber** + **drei**) for the 3D exercise viewer
- **Zustand** for app state
- **React Router** for navigation
- **Recharts** for progress charts

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. A webcam is required for the camera-tracked
exercises; the exercise catalog and 3D previews work without one.

Other scripts:

```bash
npm run build     # type-check and build for production
npm run preview   # preview the production build locally
npm run lint       # lint the codebase
```

## Project structure

```
src/
  features/
    camera/        # camera capture + pose landmark detection
    exercises/      # form-correction rules, session tracking, voice coaching
    technique3d/    # 3D animated technique previews
    bodymap/        # interactive muscle map
    dashboard/       # home screen
    onboarding/      # first-run setup flow
  store/            # app-wide state
```

## License

MIT
