"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import handleError from "@/helper/handleError";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import OfferCard from "./OfferCard";
import { toast } from "react-toastify";
import SmallLoader from "@/components/SmallLoader";
import { CustomDropdown, UrgencyDropdown } from "@/components/dropdown";
import SearchInput from "@/components/SearchInput";
import useDebounce from "@/hooks/useDebounce";
import { Pagination } from "@/components/pagination";
import { JobCardSkeleton } from "@/components/Skeltons";

const MyOffersPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { token } = useSelector((state) => state.auth);

  const [offersData, setOffersData] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isChangeStatus, setIsChangeStatus] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch Offers
  const getAlloffers = async (page = 1) => {
    setLoading(true);

    try {
      let url = `/repairman/offers/my-offers?page=${page}&limit=10`;

      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }

      if (urgencyFilter !== "all") {
        url += `&priority=${urgencyFilter}`;
      }

      if (debouncedSearch) {
        url += `&search=${debouncedSearch}`;
      }

      const res = await axiosInstance.get(url, {
        headers: { Authorization: "Bearer " + token },
      });

      const data = res.data.data;

      setOffersData(data);

      setPagination({
        currentPage: data.pagination.current,
        totalPages: data.pagination.total,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAlloffers(currentPage);
  }, [currentPage, statusFilter, urgencyFilter, debouncedSearch, refreshTrigger]);

  const handleStartJob = async (id) => {
    try {
      setIsChangeStatus(true);

      const { data } = await axiosInstance.patch(
        `/repairman/offers/start-job/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(data?.message);
      getAlloffers(currentPage);
    } catch (error) {
      handleError(error);
    } finally {
      setIsChangeStatus(false);
    }
  };

  const handleJobAccepted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const filteredOffers = useMemo(() => {
    if (!offersData?.offers) return [];

    return offersData.offers.filter((offer) => {
      if (!offer.jobId) return false;
      if (offer.status === "in_progress") return false;

      const jobTitle = `${offer.jobId?.deviceInfo?.brand || ""} ${
        offer.jobId?.deviceInfo?.model || ""
      }`;

      const description = offer.description || "";

      const matchesSearch =
        jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUrgency =
        urgencyFilter === "all" ||
        offer.jobId?.urgency === urgencyFilter;

      return matchesSearch && matchesUrgency;
    });
  }, [searchQuery, urgencyFilter, offersData]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setUrgencyFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

    const getUrgencyLevel = (urgencyScore) => {
    if (urgencyScore >= 3) return 'high';
    if (urgencyScore >= 2) return 'medium';
    return 'low';
  }; const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

//   console.log("Offers Data:", offersData.offers.jobId);
// const job=offersData.offers.jobId||{};


  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "confirmed", label: "Confirmed" },
    { value: "rejected", label: "Rejected" },
    { value: "withdrawn", label: "Withdrawn" },
  ];

  const urgencyOptions = [
    { value: "all", label: "All Priorities" },
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" },
  ];

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
        <Icon icon="heroicons:document-magnifying-glass" className="w-10 h-10 text-gray-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No offers found</h3>
      <p className="text-gray-500 max-w-sm mx-auto mb-6">
        Try adjusting your filters.
      </p>
      <button
        onClick={handleClearFilters}
        className="text-primary-600 font-semibold hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );

  if (loading && !offersData) {
    return <SmallLoader loading={loading} text="Fetching your offers..." />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 py-10">

        <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 mb-10">
          <h1 className="text-4xl font-extrabold">My Offers</h1>
          <p className="text-gray-500">Manage your proposals</p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4  border-gray-200  bg-white  shadow-sm rounded-2xl border">

          <div className="lg:col-span-5">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search jobs..."
            />
          </div>

          <div className="col-span-2">
            <CustomDropdown
              label="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>

          <div className="col-span-3">
            <UrgencyDropdown
                 urgencyFilter={urgencyFilter}
                 setUrgencyFilter={setUrgencyFilter}
               />
          </div>

          <div className="lg:col-span-2">
             <button
      onClick={handleClearFilters}
      className="w-full py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition text-sm shadow-sm"
    >
      Clear Filters
    </button>
           
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <JobCardSkeleton/>
          ) : filteredOffers.length > 0 ? (
            <>
              <div className="space-y-6">
                {filteredOffers.map((offer) => (
                  <OfferCard
                    key={offer._id}
                    offer={offer}
                    onJobAccepted={handleJobAccepted}
                    handleStartJob={handleStartJob}
                    isChangeStatus={isChangeStatus}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && (
                <div className="mt-8">
                  <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOffersPage;