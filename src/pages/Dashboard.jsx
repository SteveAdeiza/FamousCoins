import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import MiningCard from '../components/MiningCard'
import ReferralCard from '../components/ReferralCard'
import WalletButton from '../components/WalletButton'

export default function Dashboard(){
  const [balance, setBalance] = useState(0)
  const [mining, setMining] = useState(false)

  useEffect(() => {
    let interval

    if(mining){
      interval = setInterval(() => {
        setBalance(prev => prev + 0.5)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [mining])

  return(
    <div>
      <Navbar />

      <div className='p-10'>
        <h1 className='text-5xl mb-5'>FC Dashboard</h1>

        <MiningCard
          balance={balance}
          mining={mining}
          setMining={setMining}
        />

        <WalletButton />

        <ReferralCard />
      </div>
    </div>
  )
}