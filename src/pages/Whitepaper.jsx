import Navbar from '../components/Navbar'

export default function Whitepaper(){
  return(
    <div>
      <Navbar />

      <div className='p-10 max-w-4xl mx-auto'>
        <h1 className='text-5xl mb-8 text-yellow-400'>
          Famous Coins Whitepaper
        </h1>

        <h2 className='text-3xl mt-8 mb-3'>Introduction</h2>
        <p>
          Famous Coins (FC) is a decentralized mining and rewards ecosystem.
        </p>

        <h2 className='text-3xl mt-8 mb-3'>Vision</h2>
        <p>
          Build a secure mining platform for global users.
        </p>

        <h2 className='text-3xl mt-8 mb-3'>Mining</h2>
        <p>
          Users earn FC tokens through cloud mining activities.
        </p>

        <h2 className='text-3xl mt-8 mb-3'>Roadmap</h2>
        <p>
          Launch website, token, wallet, exchange listings and mobile app.
        </p>
      </div>
    </div>
  )
}