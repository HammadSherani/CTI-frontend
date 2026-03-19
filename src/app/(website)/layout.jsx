'use client'

import Chat from '@/components/chat/GlobalChat'
import Footer from '@/components/website/Footer'
import WebsiteHeader from '@/components/website/Header'
import SelectCountry from '@/components/website/SelectCountry'
import React, { useEffect, useState } from 'react'
import Loader from '@/components/Loader'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '@/config/axiosInstance'
import { setUserDetails } from '@/store/auth'
import handleError from '@/helper/handleError'

function layout({ children }) {
  const {userDetails, token} = useSelector(state => state.auth);  
  const [loading, setLoading] = useState(false)
  console.log("Repair User", userDetails);
  const dispatch = useDispatch();
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/auth/user-details', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });

      dispatch(setUserDetails(data.data));


      console.log(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(token){
      fetchUserDetails();
    }
  }, [token])

 

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Loader loading={true}/>
      </div>
    )
  }

  return (
    <div className='relative'>
      <WebsiteHeader />
      {children}
      <Chat />
      <Footer />
      <SelectCountry />
    </div>
  )
}

export default layout
