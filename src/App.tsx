import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { Dashboard } from './features/dashboard/Dashboard'
import { BodyMap } from './features/bodymap/BodyMap'
import { ExerciseSelect } from './features/exercises/ExerciseSelect'
import { ExerciseTrainer } from './features/exercises/ExerciseTrainer'
import { exerciseConfigs } from './features/exercises/exerciseConfigs'
import { Onboarding } from './features/onboarding/Onboarding'
import { ProfileScreen } from './features/onboarding/ProfileScreen'
import { ProgressScreen } from './features/exercises/ProgressScreen'
import { TechniqueViewer } from './features/technique3d/TechniqueViewer'
import { CatalogScreen } from './features/exercises/CatalogScreen'
import { SimpleMode } from './features/exercises/SimpleMode'
import type { ExerciseId } from './features/exercises/types'

function ExerciseTrainerRoute() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const validId = (exerciseConfigs.some((config) => config.id === exerciseId) ? exerciseId : 'plank') as ExerciseId

  // Remount the whole trainer on exercise change so no state leaks between exercises.
  return <ExerciseTrainer key={validId} exerciseId={validId} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/body-map" element={<BodyMap />} />
          <Route path="/training" element={<ExerciseSelect />} />
          <Route path="/training/:exerciseId" element={<ExerciseTrainerRoute />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/technique/:exerciseId" element={<TechniqueViewer />} />
          <Route path="/catalog" element={<CatalogScreen />} />
          <Route path="/simple/:exerciseId" element={<SimpleMode />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
