import { Link } from 'react-router-dom'

export default function Navbar(){
  return(
    <div className='flex justify-between items-center p-5 bg-black border-b border-yellow-500'>
      <h1 className='text-2xl font-bold text-yellow-400'>Famous Coins (FMC)</h1>

      <div className='flex gap-4'>
        <Link to='/'>Home</Link>
        <Link to='/dashboard'>Dashboard</Link>
        <Link to='/login'>Login</Link>
      </div>
    </div>
  )
}
