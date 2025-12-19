import { Route, Router } from '@solidjs/router';
// import { MainLayout } from './components/layout/MainLayout';
import { MainLayout } from './components/Layaout/MainLayaout';
import { lazy } from 'solid-js';
// import ChordConstruction from './features/excercises/ChordConstruction';
import ChordDictation from './features/excercises/ChordDictation';

// Lazy loading para mejorar el rendimiento inicial (Code Splitting)
const Exercises = lazy(() => import('./features/excercises/ExercisesHome'));
const Theory = lazy(() => import('./features/theory/TheoryHome'));
const Profile = lazy(() => import('./features/profile/ProfileHome'));

function App() {
  return (
    <Router root={MainLayout}>
      <Route path="/" component={Exercises} />
      <Route path="/exercises" component={Exercises} />
      
      {/* ESTA RUTA DEBE COINCIDIR CON EL HREF DEL BOTÓN */}
      <Route path="/exercises/chord-construction" component={ChordDictation} /> 
      
      <Route path="/theory" component={Theory} />
      <Route path="/profile" component={Profile} />
    </Router>
  );
}

export default App;