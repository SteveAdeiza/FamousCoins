import { useState } from 'react'
import { ethers } from 'ethers'

export default function WalletButton(){
  const [wallet, setWallet] = useState('')

  const connectWallet = async () => {
    if(!window.ethereum){
      alert('Install MetaMask')
      return
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send('eth_requestAccounts', [])
    setWallet(accounts[0])
  }

  return(
    <div className='mt-5'>
      <button
        onClick={connectWallet}
        className='bg-yellow-400 text-black px-5 py-3 rounded-xl'
      >
        Connect Wallet
      </button>

      {wallet && <p className='mt-3'>{wallet}</p>}
    </div>
  )
}