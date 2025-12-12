"use client";


import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

function PartOrderDetailPage() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [partsOrders, setPartsOrders] = useState([]);
    const [pagination, setPagination] = useState({});
    const { token } = useSelector(state => state.auth);

    const { id } = useParams();
    const fetchPartsOrdersById = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/repairman/parts/orders/${id}`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            });

            if (data.success) {
                setPartsOrders(data.data || []);
                setPagination(data.pagination || {});
                setError(null);
            } else {
                setError('Failed to load parts orders');
            }
        } catch (error) {
            console.error('Error fetching parts orders:', error);
            setError('Failed to load parts orders. Please try again.');
            handleError(error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchPartsOrdersById();
    }, []);


  return (
    <div>
      Part Order Detail Page
    </div>
  )
}

export default PartOrderDetailPage
