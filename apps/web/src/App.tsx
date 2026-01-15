import { Route, Router } from "@solidjs/router";
import { lazy, Suspense } from "solid-js";
import { MainLayout } from "./components/Layaout/MainLayaout";

// Pages
const MainPage = lazy(() => import("./pages/MainPage"));
const ExercisesPage = lazy(() => import("./pages/ExercisesPage"));
const TheoryPage = lazy(() => import("./pages/TheoryPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AboutUsPage = lazy(() => import("./pages/AboutPage"))
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Features
const ExercisesList = lazy(() => import("./features/excercises/ExercisesHome"));
const ChordDictation = lazy(() => import("./features/excercises/ChordDictation/ChordDictation"));
const ChordConstruction = lazy(() => import('./features/excercises/ChordConstruction/ChordConstruction'));
const NoteRecognition = lazy(() => import('./features/excercises/NoteRecognition/NoteRecognition'));
const MelodicDictation = lazy(() => import('./features/excercises/MelodicDictation/MelodicDictation'));

function App() {
  const basePath = import.meta.env.VITE_BASE_PATH || "/";

  return (
    <Router base={basePath} root={MainLayout}>
      <Suspense
        fallback={
          <div class="flex h-screen items-center justify-center bg-base-200 text-primary font-serif animate-pulse">
            Cargando Laboratorio...
          </div>
        }
      >
        <Route path="/" component={MainPage} />
        <Route path="about" component={AboutUsPage} />

        <Route path="/exercises" component={ExercisesPage}>
          <Route path="/" component={ExercisesList} />
          <Route path="/chord-construction" component={ChordConstruction} />
          <Route path="/chord-dictation" component={ChordDictation} />
          <Route path="/note-recognition" component={NoteRecognition} />
          <Route path="/melodic-dictation" component={MelodicDictation} />
        </Route>

        <Route path="/theory" component={TheoryPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="*404" component={NotFoundPage} />
      </Suspense>
    </Router>
  );
}

export default App;
