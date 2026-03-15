export function getInitials(name) {
  if (!name) return "";

  return name
    .split(" ")                // split into words
    .map(word => word[0].toUpperCase()) // take first letter of each word
    .join("");                 // join them together
}


// export const getFieldLabel = (key) => {
//   const fieldLabels = {
//     fullName: "Full Name",
//     fatherName: "Father's Name",
//     nationalIdOrCitizenNumber: "CNIC Number",
//     emailAddress: "Email Address",
//     gender: "Gender",
//     dob: "Date of Birth",
//     phoneNumber: "Phone Number",
//     address: "Address",
//     experience: "Experience",
//   };

//   return fieldLabels[key] || key;
// };



export const getFieldLabel = {
  // Step 1 - Personal Information
  fullName: { label: "Full Name", type: "text" },
  fatherName: { label: "Father's Name", type: "text" },
  nationalIdOrCitizenNumber: { label: "CNIC / T.C. Number", type: "text" },
  dob: { label: "Date of Birth", type: "date" },
  gender: { label: "Gender", type: "select", options: ["Male", "Female", "Other"] },

  // Step 2 - Contact Information
  mobileNumber: { label: "Mobile Number", type: "tel" },
  whatsappNumber: { label: "WhatsApp Number", type: "tel" },
  emailAddress: { label: "Email Address", type: "email" },
  email: { label: "Email Address", type: "email" },
  emergencyContactPerson: { label: "Emergency Contact Person", type: "text" },
  emergencyContactNumber: { label: "Emergency Contact Number", type: "tel" },

  // Step 3 - Address & Location
  shopName: { label: "Shop Name", type: "text" },
  country: { label: "Country", type: "text" },
  state: { label: "State", type: "text" },
  city: { label: "City", type: "text" },
  zipCode: { label: "ZIP Code", type: "text" },
  fullAddress: { label: "Full Address", type: "textarea" },
  taxNumber: { label: "Tax Number", type: "text" },

  // Step 4 - Experience & Availability
  yearsOfExperience: { label: "Years of Experience", type: "number" },
  specializations: { label: "Specializations", type: "tags" },
  brandsWorkedWith: { label: "Brands Worked With", type: "tags" },
  description: { label: "Description", type: "textarea" },
  workingDays: {
    label: "Working Days", type: "multiselect",
    options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  },
  workingHours: { label: "Working Hours", type: "workinghours" },
  pickupService: { label: "Pickup Service Available", type: "boolean" },

  // Step 5 - Documents (file fields - read only display)
  profilePhoto: { label: "Profile Photo", type: "file" },
  nationalIdOrPassportScan: { label: "National ID / Passport Scan", type: "file" },
  shopPhoto: { label: "Shop Photo", type: "file" },
  utilityBillOrShopProof: { label: "Utility Bill / Shop Proof", type: "file" },
  certifications: { label: "Certifications", type: "file" },
};