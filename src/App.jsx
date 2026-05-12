import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Whitepaper from './pages/Whitepaper';

export default function App(){
 return <Routes>
  <Route path='/' element={<Home/>}/>
  <Route path='/dashboard' element={<Dashboard/>}/>
  <Route path='/whitepaper' element={<Whitepaper/>}/>
 </Routes>
}
