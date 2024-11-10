import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
            {/* Left Section */}
            <div>
                <img className='mb-5 w-40' src={assets.logo} alt="" />
                <p className='w-full md:w-2/3 text-gray-600 leading-6'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Autem magnam beatae ullam impedit, et commodi exercitationem suscipit quo quibusdam iste iusto laboriosam cumque dolor molestias libero, voluptatem optio ab id.</p>


            </div>


              {/* Center Section */}
              <div>
                <p className='text-xl font-medium mb-5'>COMPANY</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Contact us</li>
                    <li>Privacy Policy</li>
                </ul>
                </div>

                  {/* Right Section */}
            <div>
                <p className='text-xl font-medium mb-5'>Get in touch</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>+9153434344343</li>
                    <li> 123t636@gmail.com</li>
                </ul>
                
                </div>

        </div>
                {/* ----copyright Text */}
        <div>
            <hr />
            <p className='py-5 text-sm text-center'>COPYRIGHT@2024 PRESCRIPTO ALL RIGHTS RESEVED</p>
            
        </div>
        
        </div>
  )
}

export default Footer