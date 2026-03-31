"use client"

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useRouter } from '@/i18n/navigation';
const StatCard = ({ icon, label, value, bgColor = "bg-primary-50", iconColor = "text-primary-600" }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className="flex items-center gap-3">
      <div className={`${bgColor} p-3 rounded-xl`}>
        <Icon icon={icon} className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value || 'N/A'}</p>
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, icon, children, action }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && <Icon icon={icon} className="w-5 h-5 text-primary-600" />}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {action && action}
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const InfoRow = ({ icon, label, value, isVerified }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
    <div className={`p-2 rounded-lg ${value ? 'bg-primary-50' : 'bg-gray-100'}`}>
      <Icon icon={icon} className={`w-4 h-4 ${value ? 'text-primary-600' : 'text-gray-400'}`} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-900">{value || 'Not provided'}</p>
        {isVerified && value && (
          <Icon icon="heroicons:check-badge-20-solid" className="w-4 h-4 text-green-500" />
        )}
      </div>
    </div>
  </div>
);

const Badge = ({ children, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    default: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
};

function ProfilePage() {
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const router = useRouter();
  const { token } = useSelector(state => state.auth);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get(`/repairman/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setData(data.data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Icon icon="eos-icons:loading" className="text-5xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <Icon icon="heroicons:user-circle" className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Profile Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find any profile data. Please try again later.</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Icon icon="heroicons:arrow-path" className="w-5 h-5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user, profileStatus } = data;
  const profile = user.repairmanProfile || {};
  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      profile.fullName, profile.mobileNumber, profile.description,
      profile.specializations?.length, profile.workingHours,
      profile.city, profile.district, profile.isKycCompleted
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionPercentage = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Cover Image Section */}
      <div className="relative h-[400px] group">
        {/* Background with Parallax Effect */}
        <div className="absolute inset-0 overflow-hidden">
          {profile?.shopPhoto ? (
            <>
              <img
                src={profile.shopPhoto || "N/A"}
                alt="Cover"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900">
              {/* Animated Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }} />
              </div>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
        </div>

        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 px-6 py-4 flex justify-between items-center">
          <button className="flex items-center gap-2 text-white/90 hover:text-white bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-black/30 transition-all">
            <Icon icon="heroicons:arrow-left" className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <div className="flex gap-2">
            <button className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all border border-white/20">
              <Icon icon="heroicons:bookmark" className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all border border-white/20">
              <Icon icon="heroicons:share" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cover Image Actions - Bottom Right */}
        <div className="absolute bottom-24 right-6 flex gap-3" style={{ zIndex: 100 }}> {/* Inline z-index */}
          <button
            onClick={() => {
              router.push('/repair-man/profile/edit-profile');
            }}
            className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all border border-white/30 font-medium flex items-center gap-2 cursor-pointer relative" /* Added relative */
            type="button" /* Explicit button type */
          >
            <Icon icon="heroicons:pencil" className="w-5 h-5" />
            Update Profile
          </button>
        </div>

        {/* Profile Info Overlay - Bottom Left */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-24">
          <div className="flex items-end gap-6">
            {/* Profile Image with Border Animation */}
            <div className="relative">
              <div className="w-36 h-36 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 transform hover:scale-105 transition-transform duration-300">
                {profile?.profilePhoto ? (
                  <img
                    src={profile.profilePhoto || "N/A"}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl font-bold text-white">
                      {user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2.5 bg-primary-600 rounded-xl shadow-lg hover:bg-primary-700 transition-all border-2 border-white">
                <Icon icon="heroicons:camera" className="w-4 h-4 text-white" />
              </button>
              <div className="absolute -top-2 -right-2">
                {user.isEmailVerified && (
                  <div className="bg-green-500 rounded-full p-1.5 border-2 border-white">
                    <Icon icon="heroicons:check" className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{profile?.fullName || user.name}</h1>
                {profile?.shopName && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm border border-white/30">
                    {profile.shopName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <Icon icon="heroicons:map-pin" className="w-4 h-4" />
                  <span className="text-sm">{profile?.city || 'City not set'}, {profile?.district || 'District not set'}</span>
                </div>
                {profile?.yearsOfExperience && (
                  <div className="flex items-center gap-1">
                    <Icon icon="heroicons:clock" className="w-4 h-4" />
                    <span className="text-sm">{profile.yearsOfExperience} Years Experience</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Icon icon="heroicons:briefcase" className="w-4 h-4" />
                  <span className="text-sm">{profile?.totalJobs || 0} Jobs Completed</span>
                </div>
              </div>

              {/* Rating Badge */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 bg-yellow-400/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-400/30">
                  <Icon icon="heroicons:star" className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-white">{profile?.rating || '0.0'}</span>
                  <span className="text-xs text-white/70">({profile?.totalReviews || 0} reviews)</span>
                </div>
                {profile?.isKycCompleted && (
                  <div className="flex items-center gap-1 bg-green-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-green-500/30">
                    <Icon icon="heroicons:check-badge" className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white">KYC Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-12 pb-4">
            <div className="container mx-auto px-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon icon="heroicons:chart-bar" className="w-4 h-4 text-white/70" />
                      <span className="text-sm font-medium text-white/90">Profile Strength</span>
                    </div>
                    <span className="text-sm font-bold text-white">{completionPercentage}% Complete</span>
                  </div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500 relative"
                      style={{ width: `${completionPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                </div>
                {profileStatus?.message && (
                  <Badge variant={profileStatus.status === 'complete' ? 'success' : 'warning'}>
                    {profileStatus.message}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert for incomplete bank details */}
      {!profile.isPaymentInformationCompleted && (
        <div className="container mx-auto px-6 -mt-4 mb-6 relative z-10">
          <div className="animate-slideDown">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-orange-500 rounded-xl p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Complete Your Bank Details</h4>
                  <p className="text-sm text-gray-600 mb-3">Add your bank information to start receiving payments</p>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium inline-flex items-center gap-2">
                    <Icon icon="heroicons:banknotes" className="w-4 h-4" />
                    Add Bank Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the content remains the same... */}
      <div className="container mx-auto px-6 pb-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon="heroicons:star"
            label="Rating"
            value={profile?.rating ? `${profile.rating} (${profile.totalReviews || 0} reviews)` : 'No ratings'}
            bgColor="bg-yellow-50"
            iconColor="text-yellow-600"
          />
          <StatCard
            icon="heroicons:briefcase"
            label="Jobs Completed"
            value={profile?.totalJobs || 0}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            icon="heroicons:clock"
            label="Experience"
            value={profile?.yearsOfExperience ? `${profile.yearsOfExperience} Years` : 'N/A'}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            icon="heroicons:users"
            label="Happy Clients"
            value={profile?.totalClients || 0}
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {profile?.description && (
              <SectionCard title="About Me" icon="heroicons:information-circle">
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              </SectionCard>
            )}

            {/* Specializations */}
            {profile?.specializations?.length > 0 && (
              <SectionCard title="Specializations" icon="heroicons:bolt">
                <div className="flex flex-wrap gap-2">
                  {profile.specializations.map((spec, index) => (
                    <Badge key={index} variant="primary">{spec}</Badge>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Working Hours */}
            {profile?.workingHours && (
              <SectionCard title="Working Hours" icon="heroicons:clock">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 p-4 rounded-xl">
                    <p className="text-xs text-primary-600 font-medium mb-1">Business Hours</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile.workingHours.start || '09:00'} - {profile.workingHours.end || '18:00'}
                    </p>
                  </div>

                  {profile?.workingDays?.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium mb-2">Working Days</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.workingDays.map((day, index) => (
                          <span key={index} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs">
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Certifications */}
            {profile?.certifications?.length > 0 && (
              <SectionCard title="Certifications & Licenses" icon="heroicons:academic-cap">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.certifications.map((cert, index) => (
                    <div key={index} className="group relative rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
                      <img
                        src={cert || "N/A"}
                        alt={`Certificate ${index + 1}`}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="p-2 bg-white rounded-lg">
                          <Icon icon="heroicons:arrows-pointing-out" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Shop Photos */}
            {profile?.shopPhotos?.length > 0 && (
              <SectionCard title="Shop Gallery" icon="heroicons:photo">
                <div className="grid grid-cols-3 gap-4">
                  {profile.shopPhotos.map((photo, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
                      <img
                        src={photo || "N/A"}
                        alt={`Shop ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <SectionCard title="Contact Info" icon="heroicons:phone">
              <div className="space-y-2">
                <InfoRow
                  icon="heroicons:phone"
                  label="Phone"
                  value={profile?.mobileNumber || user.phone}
                />
                <InfoRow
                  icon="heroicons:envelope"
                  label="Email"
                  value={profile?.emailAddress || user.email}
                  isVerified={user.isEmailVerified}
                />
                {profile?.whatsappNumber && (
                  <InfoRow
                    icon="ic:baseline-whatsapp"
                    label="WhatsApp"
                    value={profile.whatsappNumber}
                  />
                )}
              </div>
            </SectionCard>

            {/* Location Details */}
            <SectionCard title="Location" icon="heroicons:map-pin">
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl">
                  <p className="text-xs text-primary-600 font-medium mb-1">Full Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.fullAddress || 'Address not provided'}
                  </p>
                </div>
                {profile?.zipCode && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500">ZIP Code</span>
                    <span className="text-sm font-medium">{profile.zipCode}</span>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Emergency Contact */}
            {(profile?.emergencyContactPerson || profile?.emergencyContactNumber) && (
              <SectionCard title="Emergency Contact" icon="heroicons:phone-arrow-up-right">
                <div className="space-y-3">
                  {profile.emergencyContactPerson && (
                    <InfoRow
                      icon="heroicons:user"
                      label="Contact Person"
                      value={profile.emergencyContactPerson}
                    />
                  )}
                  {profile.emergencyContactNumber && (
                    <InfoRow
                      icon="heroicons:phone"
                      label="Contact Number"
                      value={profile.emergencyContactNumber}
                    />
                  )}
                </div>
              </SectionCard>
            )}

            {/* Services */}
            <SectionCard title="Services" icon="heroicons:wrench-screwdriver">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Pickup Service</span>
                  <Badge variant={profile?.pickupService ? 'success' : 'default'}>
                    {profile?.pickupService ? 'Available' : 'Not Available'}
                  </Badge>
                </div>

                {profile?.homeService !== undefined && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Home Service</span>
                    <Badge variant={profile.homeService ? 'success' : 'default'}>
                      {profile.homeService ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Account Info */}
            <SectionCard title="Account Information" icon="heroicons:user-circle">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500">Member Since</span>
                  <span className="text-sm font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500">Last Updated</span>
                  <span className="text-sm font-medium">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className={`text-xs font-medium ${user.isEmailVerified ? 'text-green-600' : 'text-gray-400'}`}>
                      {user.isEmailVerified ? '✓ Email Verified' : '○ Email Unverified'}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className={`text-xs font-medium ${user.isProfileComplete ? 'text-blue-600' : 'text-gray-400'}`}>
                      {user.isProfileComplete ? '✓ Profile Complete' : '○ Profile Incomplete'}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

// "use client"

// import React, { useEffect, useState } from 'react';
// import { Icon } from '@iconify/react';
// import { useSelector } from 'react-redux';
// import handleError from '@/helper/handleError';
// import axiosInstance from '@/config/axiosInstance';

// function ProfilePage() {
//   const [profileImage, setProfileImage] = useState(null);
//   const [coverImage, setCoverImage] = useState(null);
//   const [isLoading, setIsLoading] = useState(false)
//   const [data, setData] = useState(null)

//   const { token } = useSelector(state => state.auth)

//   const fetchData = async () => {
//     try {
//       setIsLoading(true)
//       const { data } = await axiosInstance.get(`/repairman/profile`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       })
//       setData(data.data)
//     } catch (error) {
//       handleError(error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchData()
//   }, [])

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Icon icon="eos-icons:loading" className="text-4xl text-primary-500" />
//       </div>
//     )
//   }

//   if (!data) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="text-lg">No profile data found</div>
//       </div>
//     )
//   }

//   const { user, profileStatus } = data
//   const profile = user.repairmanProfile

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="relative">
//         <div
//           className="h-96 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden"
//           style={{
//             backgroundImage: profile?.shopPhoto
//               ? `url(${profile.shopPhoto})`
//               : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//             backgroundSize: 'cover',
//             backgroundPosition: 'center'
//           }}
//         >
//           {/* Overlay for better text visibility */}
//           {profile?.shopPhoto && (
//             <div className="absolute inset-0 bg-black/10"></div>
//           )}
//         </div>

//         {/* Profile Section */}
//         <div className="relative -mt-[200px] mx-auto px-6">
//           <div className="flex items-end justify-between">
//             <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-4 min-w-[500px]">

//               {/* Profile Image */}
//               <div className="flex items-center gap-3 bg-white/90 p-6 rounded-md w-full">
//                 <div className='relative'>
//                   <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
//                     {profile?.profilePhoto ? (
//                       <img
//                         src={profile.profilePhoto}
//                         alt="Profile"
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full bg-primary-100 flex items-center justify-center">
//                         <span className="text-3xl font-bold text-primary-600">
//                           {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="">
//                   <div className="flex items-center space-x-3 mb-2">
//                     <h1 className="text-3xl font-bold text-gray-900">{profile?.fullName || user.name}</h1>
//                     <button className="text-gray-400 hover:text-gray-600">
//                       <Icon icon="heroicons:share" className="w-5 h-5" />
//                     </button>
//                   </div>

//                   {/* Rating and Stats */}
//                   <div className="flex items-center space-x-6 mb-4">
//                     <div className="flex items-center space-x-2">
//                       <div className="flex">
//                         {[...Array(5)].map((_, i) => (
//                           <Icon
//                             key={i}
//                             icon="heroicons:star"
//                             className={`w-4 h-4 ${i < Math.floor(profile?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
//                           />
//                         ))}
//                       </div>
//                       <span className="text-sm font-medium">{profile?.rating || 0}</span>
//                     </div>

//                     <div className="flex items-center space-x-1">
//                       <Icon icon="heroicons:briefcase" className="w-4 h-4 text-gray-500" />
//                       <span className="text-sm">{profile?.totalJobs || 0} Jobs</span>
//                     </div>

//                     {profile?.yearsOfExperience && (
//                       <div className="flex items-center space-x-1">
//                         <Icon icon="heroicons:clock" className="w-4 h-4 text-gray-500" />
//                         <span className="text-sm">{profile.yearsOfExperience} Years</span>
//                       </div>
//                     )}
//                   </div>

//                   <h2 className="text-xl text-gray-700 mb-2 font-medium">{profile?.shopName}</h2>

//                   <div className="flex items-center space-x-2 text-sm text-gray-600">
//                     <Icon icon="heroicons:map-pin" className="w-4 h-4" />
//                     <span>{profile?.city}, {profile?.district}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-end gap-3">
//               <button
//                 type="button"
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 <Icon icon="heroicons:camera" className="h-5 w-5" />
//                 Update shop photo
//               </button>

// <button
//   type="button"
//   className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
// >
//   <Icon icon="heroicons:user" className="h-5 w-5" />
//   Update profile
// </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Verifications Section */}
//       {/* <div className="max-w-7xl mx-auto px-6 py-6">
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Verifications & Status</h3>
//           <div className="flex items-center space-x-6">
//             <div className={`flex items-center space-x-2 ${user.isEmailVerified ? 'text-green-600' : 'text-gray-400'}`}>
//               <Icon icon="heroicons:envelope" className="w-5 h-5" />
//               <span className="text-sm">Email Verified</span>
//             </div>
//             <div className={`flex items-center space-x-2 ${user.isProfileComplete ? 'text-green-600' : 'text-gray-400'}`}>
//               <Icon icon="heroicons:user" className="w-5 h-5" />
//               <span className="text-sm">Profile Complete</span>
//             </div>
//             <div className={`flex items-center space-x-2 ${profile?.isKycCompleted ? 'text-green-600' : 'text-gray-400'}`}>
//               <Icon icon="heroicons:identification" className="w-5 h-5" />
//               <span className="text-sm">KYC {profile?.kycStatus || 'Pending'}</span>
//             </div>
//             <div className={`flex items-center space-x-2 ${user.isActive ? 'text-green-600' : 'text-gray-400'}`}>
//               <Icon icon="heroicons:check-circle" className="w-5 h-5" />
//               <span className="text-sm">Account {user.status}</span>
//             </div>
//           </div>
//         </div>
//       </div> */}

//       <div className="max-w-7xl mx-auto px-6 pb-8 pt-10">

//         {!profile.isPaymentInformationCompleted && (
//           <div className="flex items-start mb-4 gap-3 border-l-4 border-red-600 bg-red-50 text-red-800 rounded-md p-4 shadow-sm">
//             <Icon icon="mdi:alert-circle-outline" className="w-6 h-6 mt-0.5 text-red-600" />
//             <div>
//               <p className="font-semibold">Incomplete Bank Details</p>
//               <p className="text-sm">Your bank information is missing some details. Please complete it to continue.</p>
//             </div>
//           </div>
//         )}



//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//           {/* Main Column */}
//           <div className="lg:col-span-2 space-y-8">

//             {/* About Section */}
//             {profile?.description && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
//                 <p className="text-gray-700 leading-relaxed">{profile.description}</p>
//               </div>
//             )}

//             {/* Specializations */}
//             {profile?.specializations && profile.specializations.length > 0 && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h3 className="text-xl font-semibold text-gray-900 mb-6">Specializations</h3>
//                 <div className="flex flex-wrap gap-3">
//                   {profile.specializations.map((spec, index) => (
//                     <span
//                       key={index}
//                       className="px-4 py-2 bg-primary-100 text-primary-800 rounded-lg font-medium"
//                     >
//                       {spec}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Working Hours */}
//             {profile?.workingHours && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h3 className="text-xl font-semibold text-gray-900 mb-6">Working Hours</h3>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center space-x-3">
//                       <Icon icon="heroicons:clock" className="w-6 h-6 text-primary-600" />
//                       <div>
//                         <p className="font-medium text-gray-900">Business Hours</p>
//                         <p className="text-sm text-gray-600">
//                           {profile.workingHours.start} - {profile.workingHours.end}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   {profile?.workingDays && profile.workingDays.length > 0 && (
//                     <div className="p-4 bg-gray-50 rounded-lg">
//                       <p className="font-medium text-gray-900 mb-2">Working Days</p>
//                       <div className="flex flex-wrap gap-2">
//                         {profile.workingDays.map((day, index) => (
//                           <span
//                             key={index}
//                             className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm"
//                           >
//                             {day}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Shop Photo */}
//             {profile?.shopPhoto && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h3 className="text-xl font-semibold text-gray-900 mb-6">Additional Shop Photos</h3>
//                 <div className="rounded-lg overflow-hidden">
//                   <img
//                     src={profile.shopPhoto}
//                     alt="Shop"
//                     className="w-full h-64 object-cover"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Certifications */}
//             {profile?.certifications && profile.certifications.length > 0 && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h3 className="text-xl font-semibold text-gray-900 mb-6">Certifications</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {profile.certifications.map((cert, index) => (
//                     <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
//                       <img
//                         src={cert}
//                         alt={`Certificate ${index + 1}`}
//                         className="w-full h-48 object-cover"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">

//             {/* Contact Information */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
//               <div className="space-y-3">
//                 <div className="flex items-center space-x-3">
//                   <Icon icon="heroicons:phone" className="w-5 h-5 text-gray-400" />
//                   <div>
//                     <p className="text-sm text-gray-600">Phone</p>
//                     <p className="font-medium">{profile?.mobileNumber || user.phone}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <Icon icon="heroicons:envelope" className="w-5 h-5 text-gray-400" />
//                   <div>
//                     <p className="text-sm text-gray-600">Email</p>
//                     <p className="font-medium">{profile?.emailAddress || user.email}</p>
//                   </div>
//                 </div>
//                 {profile?.whatsappNumber && (
//                   <div className="flex items-center space-x-3">
//                     <Icon icon="ic:baseline-whatsapp" className="w-5 h-5 text-green-600" />
//                     <div>
//                       <p className="text-sm text-gray-600">WhatsApp</p>
//                       <p className="font-medium">{profile.whatsappNumber}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Location */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h4 className="font-semibold text-gray-900 mb-4">Location</h4>
//               <div className="space-y-3">
//                 <div className="flex items-start space-x-3">
//                   <Icon icon="heroicons:map-pin" className="w-5 h-5 text-gray-400 mt-1" />
//                   <div>
//                     <p className="text-sm text-gray-900">{profile?.fullAddress}</p>
//                     {profile?.zipCode && (
//                       <p className="text-sm text-gray-600 mt-1">Zip: {profile.zipCode}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Emergency Contact */}
//             {profile?.emergencyContactPerson && (
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h4 className="font-semibold text-gray-900 mb-4">Emergency Contact</h4>
//                 <div className="space-y-2">
//                   <p className="font-medium text-gray-900">{profile.emergencyContactPerson}</p>
//                   <p className="text-sm text-gray-600">{profile.emergencyContactNumber}</p>
//                 </div>
//               </div>
//             )}

//             {/* Additional Services */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h4 className="font-semibold text-gray-900 mb-4">Services</h4>
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-600">Pickup Service</span>
//                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${profile?.pickupService ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                     }`}>
//                     {profile?.pickupService ? 'Available' : 'Not Available'}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Profile Status */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h4 className="font-semibold text-gray-900 mb-4">Account Info</h4>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Member Since</span>
//                   <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Last Updated</span>
//                   <span className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProfilePage;