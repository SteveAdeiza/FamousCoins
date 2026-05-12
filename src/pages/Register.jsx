export default function Register(){
  return(
    <div className='p-10 max-w-xl mx-auto'>
      <h1 className='text-5xl mb-8'>Register</h1>

      <input className='p-4 rounded-xl text-black mb-4' placeholder='Email' />
      <input className='p-4 rounded-xl text-black mb-4' placeholder='Password' type='password' />

      <button className='bg-yellow-400 text-black px-6 py-4 rounded-2xl'>
        Create Account
      </button>
    </div>
  )
}