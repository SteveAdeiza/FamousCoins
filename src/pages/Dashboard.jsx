export default function Dashboard(){
 return <div className='min-h-screen bg-zinc-950 text-white p-8'>
  <h1 className='text-4xl font-bold text-yellow-400'>FMC Dashboard</h1>
  <div className='grid md:grid-cols-4 gap-6 mt-10'>
   {['Mining Power','Wallet Balance','Referrals','Daily Rewards'].map(item=><div key={item} className='bg-zinc-900 border border-yellow-500/20 p-6 rounded-2xl'><h2 className='text-gray-400'>{item}</h2><p className='text-3xl mt-4 font-bold'>0</p></div>)}
  </div>
 </div>
}
