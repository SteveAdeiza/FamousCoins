import Navbar from '../components/Navbar'

export default function Admin(){
  return(
    <div>
      <Navbar />

      <div className='p-10'>
        <h1 className='text-5xl mb-8'>Admin Dashboard</h1>

        <div className='grid gap-5'>
          <div className='bg-gray-900 p-6 rounded-3xl'>
            <h2>Total Users</h2>
            <p className='text-5xl text-yellow-400'>2450</p>
          </div>

          <div className='bg-gray-900 p-6 rounded-3xl'>
            <h2>Total FC Mined</h2>
            <p className='text-5xl text-yellow-400'>500000</p>
          </div>
        </div>
      </div>
    </div>
  )
}