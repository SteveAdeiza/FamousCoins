export default function MiningCard({balance, mining, setMining}){
  return(
    <div className='bg-gray-900 p-8 rounded-3xl mt-6'>
      <h2 className='text-3xl mb-4'>Mining Balance</h2>

      <p className='text-5xl text-yellow-400 mb-5'>
        {balance.toFixed(2)} FMC
      </p>

      <button
        className='bg-yellow-400 text-black px-6 py-4 rounded-2xl'
        onClick={() => setMining(!mining)}
      >
        {mining ? 'Stop Mining' : 'Start Mining'}
      </button>
    </div>
  )
}
