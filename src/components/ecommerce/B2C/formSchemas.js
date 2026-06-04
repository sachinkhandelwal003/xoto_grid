/**
 * Common form schemas and validation rules
 */

export const sellerRegistrationSchema = {
  // Step 1: Personal Information
  step1: {
    fields: ['first_name', 'last_name', 'email', 'mobile', 'password', 'confirmPassword'],
    rules: {
      first_name: [{ required: true, message: 'First name is required' }],
      last_name: [{ required: true, message: 'Last name is required' }],
      email: [
        { required: true, message: 'Email is required' },
        { type: 'email', message: 'Please enter a valid email' }
      ],
      password: [
        { required: true, message: 'Password is required' },
        { min: 6, message: 'Password must be at least 6 characters' }
      ],
      confirmPassword: [
        { required: true, message: 'Please confirm your password' },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('Passwords do not match'));
          },
        }),
      ]
    }
  },

  // Step 2: Store Information
  step2: {
    fields: ['store_details.store_name', 'store_details.store_type', 'store_details.categories'],
    rules: {
      'store_details.store_name': [{ required: true, message: 'Store name is required' }],
      'store_details.store_type': [{ required: true, message: 'Business type is required' }],
      'store_details.categories': [{ required: true, message: 'Please select at least one category' }]
    }
  },

  // Step 3: Business Details
  step3: {
    fields: [
      'registration.pan_number',
      'store_details.store_address',
      'store_details.city',
      'store_details.country',
      'store_details.pincode',
      'meta.agreed_to_terms'
    ],
    rules: {
      'registration.pan_number': [{ required: true, message: 'PAN number is required' }],
      'store_details.store_address': [{ required: true, message: 'Address is required' }],
      'store_details.city': [{ required: true, message: 'City is required' }],
      'store_details.country': [{ required: true, message: 'Country is required' }],
      'store_details.pincode': [{ required: true, message: 'PIN code is required' }],
      'meta.agreed_to_terms': [
        {
          validator: (_, value) => 
            value ? Promise.resolve() : Promise.reject(new Error('You must agree to terms'))
        }
      ]
    }
  }
};

export const loginSchema = {
  fields: ['email', 'password'],
  rules: {
    email: [
      { required: true, message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email' }
    ],
    password: [
      { required: true, message: 'Password is required' }
    ]
  }
};

// Custom validators
export const customValidators = {
  phoneNumber: (countryCode = '+91') => ({
    validator: (_, value) => {
      if (!value) return Promise.reject(new Error('Phone number is required'));
      
    }
  }),

  panNumber: {
    validator: (_, value) => {
      if (!value) return Promise.reject(new Error('PAN number is required'));
      
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (panRegex.test(value.toUpperCase())) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Please enter a valid PAN number'));
    }
  },

  gstin: {
    validator: (_, value) => {
      if (!value) return Promise.resolve(); // Optional
      
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (gstinRegex.test(value.toUpperCase())) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Please enter a valid GSTIN'));
    }
  }
};