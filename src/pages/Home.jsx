import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home(){
 return <div className='min-h-screen bg-black text-white'>
  <header className='p-6 flex justify-between border-b border-yellow-500/20'>
   <div>
    <h1 className='text-3xl font-bold text-yellow-400'>FMC</h1>
    <p className='text-sm text-gray-400'>Mine the Future. Build Digital Wealth.</p>
   </div>
   <nav className='flex gap-6 items-center'>
    <Link to='/dashboard'>Dashboard</Link>
    <Link to='/whitepaper'>Whitepaper</Link>
   </nav>
  </header>

  <section className='max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center'>
   <div>
    <motion.h2 initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} className='text-6xl font-black leading-tight'>
     Premium <span className='text-yellow-400'>Web3</span> Mining Ecosystem
    </motion.h2>
    <p className='mt-6 text-gray-300 text-lg'>Famous Coins (FMC) is a futuristic free-mining reward ecosystem powered by community growth and engagement.</p>
    <div className='mt-8 flex gap-4'>
      <button className='bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold'>Start Mining</button>
      <button className='border border-yellow-400 px-6 py-3 rounded-xl'>Connect Wallet</button>
    </div>
   </div>
   <div className='bg-gradient-to-br from-yellow-500/20 to-black border border-yellow-500/20 rounded-3xl p-10 shadow-2xl'>
      <div className='text-center'>
        <div className='text-7xl font-black text-yellow-400'>FMC</div>
        <p className='mt-4 text-gray-300'>Realtime Mining Active</p>
        <div className='mt-6 space-y-3 text-left'>
         <div className='bg-black/40 p-3 rounded-xl'>user**_001 mined 10 FMC</div>
         <div className='bg-black/40 p-3 rounded-xl'>miner**_847 activated boost</div>
         <div className='bg-black/40 p-3 rounded-xl'>user**_224 earned referral reward</div>
        </div>
      </div>
   </div>
  </section>
 </div>
}
