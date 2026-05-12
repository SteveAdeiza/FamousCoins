import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'

export default function Home(){
  return(
    <div>
      <Navbar />

      <div className='p-10 text-center'>
        <div className='mx-auto w-40 h-40 rounded-full bg-yellow-400 flex items-center justify-center text-black text-5xl font-bold border-8 border-yellow-300'>
          FC
        </div>

        <h1 className='text-6xl mt-10 font-bold text-yellow-400'>
          Famous Coins
        </h1>

        <p className='text-xl mt-5 text-gray-300'>
          Mine and earn FC tokens online.
        </p>

        <div className='mt-10 flex justify-center gap-5'>
          <Link
            to='/register'
            className='bg-yellow-400 text-black px-8 py-4 rounded-2xl'
          >
            Get Started
          </Link>

          <Link
            to='/whitepaper'
            className='border border-yellow-400 px-8 py-4 rounded-2xl'
          >
            Whitepaper
          </Link>
        </div>
      </div>
    </div>
  )
}