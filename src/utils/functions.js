import * as yup from 'yup';

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


//  Yup Validations for each field
export const fieldValidations = {
  // Personal Information
  fullName: yup.string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters"),
  
  fatherName: yup.string()
    .required("Father's name is required")
    .min(2, "Name must be at least 2 characters"),
  
  nationalIdOrCitizenNumber: yup.string()
    .required("CNIC / T.C. No is required")
    .matches(/^\d{11}$/, "CNIC / T.C. No must be 11 digits"),
  
  dob: yup.date()
    .required("Date of birth is required")
    .max(new Date(), "Date cannot be in the future")
    .test('age', 'You must be at least 18 years old', function(value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    }),
  
  gender: yup.string()
    .required("Gender is required")
    .oneOf(["Male", "Female", "Other"], "Invalid gender"),

  // Contact Information
  mobileNumber: yup.string()
    .required("Mobile number is required")
    .matches(/^05\d{9}$/, "Enter valid Turkish mobile number (05XXXXXXXXX)"),
  
  whatsappNumber: yup.string()
    .required("WhatsApp number is required")
    .matches(/^05\d{9}$/, "Enter valid WhatsApp number (05XXXXXXXXX)"),
  
  emailAddress: yup.string()
    .required("Email is required")
    .email("Invalid email format"),
  
  email: yup.string()
    .required("Email is required")
    .email("Invalid email format"),
  
  emergencyContactPerson: yup.string()
    .required("Emergency contact person is required"),
  
  emergencyContactNumber: yup.string()
    .required("Emergency contact number is required")
    .matches(/^05\d{9}$/, "Enter valid contact number (05XXXXXXXXX)"),

  // Address & Location
  shopName: yup.string()
    .required("Shop name is required")
    .min(2, "Shop name must be at least 2 characters")
    .max(50, "Shop name cannot exceed 50 characters"),
  
  country: yup.string()
    .required("Country is required")
    .min(2, "Country name must be at least 2 characters")
    .max(56, "Country name cannot exceed 56 characters"),
  
  state: yup.string()
    .required("State is required")
    .min(2, "State name must be at least 2 characters")
    .max(50, "State name cannot exceed 50 characters"),
  
  city: yup.string()
    .required("City is required")
    .min(2, "City name must be at least 2 characters")
    .max(50, "City name cannot exceed 50 characters"),
  
  zipCode: yup.string()
    .required("ZIP code is required")
    .min(3, "ZIP code must be at least 3 characters")
    .max(10, "ZIP code cannot exceed 10 characters")
    .test('zip-code', 'Invalid ZIP code format', function(value) {
      if (!value) return false;
      const usZipRegex = /^\d{5}$/;
      const canadaZipRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
      const ukZipRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
      return usZipRegex.test(value) || canadaZipRegex.test(value) || ukZipRegex.test(value);
    }),
  
  fullAddress: yup.string()
    .required("Full address is required")
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address cannot exceed 200 characters"),
  
  taxNumber: yup.string()
    .required("Tax number is required")
    .min(5, "Tax number must be at least 5 characters")
    .max(20, "Tax number cannot exceed 20 characters"),

  // Experience & Availability
  yearsOfExperience: yup.number()
    .transform((value) => isNaN(value) ? undefined : value)
    .typeError("Years of experience must be a number")
    .required("Years of experience is required")
    .min(0, "Cannot be negative")
    .max(50, "Maximum 50 years"),
  
  specializations: yup.array()
    .min(1, "Add at least one specialization")
    .max(10, "Cannot add more than 10 specializations")
    .of(
      yup.string()
        .min(2, "Each specialization must be at least 2 characters")
        .max(50, "Each specialization cannot exceed 50 characters")
    ),
  
  brandsWorkedWith: yup.array()
    .min(1, "Add at least one brand")
    .max(20, "Cannot add more than 20 brands")
    .of(
      yup.string()
        .min(2, "Each brand name must be at least 2 characters")
        .max(50, "Each brand name cannot exceed 50 characters")
    ),
  
  description: yup.string()
    .required("Description is required")
    .min(50, "Description must be at least 50 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .matches(/[a-zA-Z]/, "Description must contain at least one letter"),
  
  workingDays: yup.array()
    .min(1, "Select at least one working day")
    .max(7, "Cannot select more than 7 days")
    .of(
      yup.string()
        .oneOf(
          ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          'Invalid day selected'
        )
    ),
  
  'workingHours.start': yup.string()
    .required("Start time is required")
    .matches(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 
      "Invalid time format (use HH:MM AM/PM)"
    ),
  
  'workingHours.end': yup.string()
    .required("End time is required")
    .matches(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 
      "Invalid time format (use HH:MM AM/PM)"
    )
    .test('is-greater', 'End time must be after start time', function(value) {
      const { start } = this.options.context || {};
      if (!start || !value) return true;
      
      const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      
      return parseTime(value) > parseTime(start);
    }),
  
  pickupService: yup.boolean()
    .required("Please specify if pickup service is available")
    .typeError("Pickup service must be a boolean value"),
};

// Helper function to validate a single field
export const validateSingleField = async (fieldName, value, context = {}) => {
  const validation = fieldValidations[fieldName];
  if (!validation) return { isValid: true, error: null };

  try {
    if (fieldName === 'workingHours.end') {
      await validation.validate(value, { context });
    } else {
      await validation.validate(value);
    }
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

// Helper function to validate multiple fields
export const validateFields = async (fields, values) => {
  const errors = {};
  let isValid = true;

  for (const fieldName of fields) {
    const value = values[fieldName];
    const context = fieldName === 'workingHours.end' 
      ? { start: values['workingHours.start'] }
      : {};
    
    const result = await validateSingleField(fieldName, value, context);
    if (!result.isValid) {
      errors[fieldName] = result.error;
      isValid = false;
    }
  }

  return { isValid, errors };
};