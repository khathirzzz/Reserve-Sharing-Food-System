import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

useEffect(() => {
  const unlockAudio = () => {
    const audio = new Audio("/pingnoti.mp3");
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(() => {});
    document.removeEventListener("click", unlockAudio);
  };

  document.addEventListener("click", unlockAudio);
}, []);

  const [count, setCount] = useState(0)

  return (
    <>
      
      <h1 className='text-3xl'>Vite + React</h1>
      
    </>
  )
}

export default App
