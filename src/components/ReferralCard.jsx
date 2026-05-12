export default function ReferralCard(){
  return(
    <div className='bg-gray-900 p-6 rounded-3xl mt-6'>
      <h2 className='text-2xl mb-4'>Referral System</h2>

      <p>
        Share your referral link and earn bonus FC coins.
      </p>

      <div className='bg-black p-3 rounded-xl mt-4 overflow-auto'>
        https://famouscoins.vercel.app/register?ref=FC001
      </div>
    </div>
  )
}