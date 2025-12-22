import { Route, Router } from '@solidjs/router';
import { lazy, Suspense } from 'solid-js';
import { MainLayout } from './components/Layaout/MainLayaout';

// Pages
const MainPage = lazy(() => import('./pages/MainPage'));
const ExercisesPage = lazy(() => import('./pages/ExercisesPage')); // El contenedor
const TheoryPage = lazy(() => import('./pages/TheoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Features (Vistas directas de los juegos)
const ExercisesList = lazy(() => import('./features/excercises/ExercisesHome'));
// const ChordConstruction = lazy(() => import('./features/exercises/views/ChordConstruction'));
const ChordDictation = lazy(() => import('./features/excercises/ChordDictation/ChordDictation'));

function App() {
  return (
    <Router root={MainLayout}>
      {/* 
        Suspense permite que la app renderice el Layout y la ruta Home 
        instantáneamente, mostrando el 'fallback' solo si algo falta.
      */}
      <Suspense fallback={<div class="flex h-screen items-center justify-center">Cargando Laboratorio...</div>}>
        <Route path="/" component={MainPage} />
        
        <Route path="/exercises" component={ExercisesPage}>
          <Route path="/" component={ExercisesList} />
          {/* <Route path="/chord-construction" component={ChordConstruction} /> */}
          <Route path="/chord-dictation" component={ChordDictation} />
        </Route>
        
        <Route path="/theory" component={TheoryPage} />
        <Route path="/profile" component={ProfilePage} />
      </Suspense>
    </Router>
  );
}
export default App;