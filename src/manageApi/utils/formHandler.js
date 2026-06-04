/**
 * Custom Form Handler Utility
 * Handles both frontend and backend validation errors
 * Provides consistent error handling across all forms
 */

import { message } from 'antd';

class FormHandler {
  /**
   * Formats form data for API submission
   * @param {Object} formData - Raw form data
   * @param {Object} mapping - Field mapping configuration
   * @returns {Object} - Formatted payload
   */
  static formatFormData(formData, mapping = {}) {
    const payload = {};
    
    // Apply field mappings if provided
    if (Object.keys(mapping).length > 0) {
      Object.keys(mapping).forEach(key => {
        const targetPath = mapping[key];
        const value = this._getNestedValue(formData, key);
        this._setNestedValue(payload, targetPath, value);
      });
    } else {
      // Default: flatten nested objects
      return this.flattenFormData(formData);
    }
    
    return payload;
  }

  /**
   * Flattens nested form data
   * @param {Object} data - Nested form data
   * @returns {Object} - Flattened object
   */
  static flattenFormData(data) {
    const result = {};
    
    const flatten = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, newKey);
        } else {
          result[newKey] = value;
        }
      });
    };
    
    flatten(data);
    return result;
  }

  /**
   * Handles backend validation errors
   * @param {Object} error - API error response
   * @param {Object} form - Antd form instance
   * @param {Object} options - Handler options
   * @returns {void}
   */
  static handleBackendErrors(error, form, options = {}) {
    const {
      scrollToFirstError = true,
      showMessage = true,
      customMessage = null
    } = options;

    const response = error.response?.data || error;
    const formErrors = [];

    // Handle structured backend errors
    if (response?.errors && Array.isArray(response.errors)) {
      response.errors.forEach(error => {
        const namePath = this._parseFieldName(error.field);
        formErrors.push({
          name: namePath,
          errors: [error.message],
        });
      });

      if (formErrors.length > 0) {
        // Set form field errors
        form.setFields(formErrors);

        // Scroll to first error
        if (scrollToFirstError && formErrors[0]?.name) {
          form.scrollToField(formErrors[0].name, {
            behavior: 'smooth',
            block: 'center',
          });
        }

        // Show error message
        if (showMessage) {
          const msg = customMessage || `Please fix ${formErrors.length} error(s) below.`;
          message.error(msg);
        }
      }
    } else {
      // Handle generic errors
      const errorMsg = response?.message || 'Submission failed. Please try again.';
      if (showMessage) message.error(errorMsg);
    }
  }

  /**
   * Validates specific form fields
   * @param {Array} fieldNames - Field names/paths to validate
   * @param {Object} form - Antd form instance
   * @returns {Promise<boolean>} - Validation result
   */
  static async validateFields(fieldNames, form) {
    try {
      await form.validateFields(fieldNames);
      return true;
    } catch (error) {
      const errorFields = error.errorFields || [];
      if (errorFields.length > 0) {
        form.scrollToField(errorFields[0].name, {
          behavior: 'smooth',
          block: 'center',
        });
      }
      return false;
    }
  }

  /**
   * Resets form with optional preserved values
   * @param {Object} form - Antd form instance
   * @param {Array} preserveFields - Fields to preserve
   */
  static resetForm(form, preserveFields = []) {
    const currentValues = form.getFieldsValue();
    const preservedValues = {};
    
    preserveFields.forEach(field => {
      const value = this._getNestedValue(currentValues, field);
      if (value !== undefined) {
        this._setNestedValue(preservedValues, field, value);
      }
    });
    
    form.resetFields();
    
    if (preserveFields.length > 0) {
      form.setFieldsValue(preservedValues);
    }
  }

  /**
   * Creates form submission handler
   * @param {Function} submitFn - API submission function
   * @param {Object} options - Handler options
   * @returns {Function} - Form submission handler
   */
  static createSubmitHandler(submitFn, options = {}) {
    const {
      onSuccess,
      onError,
      successMessage = 'Operation successful!',
      errorMessage = 'Operation failed',
      formatter,
      validation
    } = options;

    return async (values, form) => {
      try {
        // Run custom validation if provided
        if (validation) {
          const validationResult = await validation(values, form);
          if (validationResult !== true) {
            throw validationResult;
          }
        }

        // Format data if formatter provided
        const payload = formatter ? formatter(values) : values;
        
        // Execute submission
        const response = await submitFn(payload);
        
        // Handle success
        if (onSuccess) {
          onSuccess(response, values, form);
        } else if (successMessage) {
          message.success(successMessage);
        }
        
        return response;
      } catch (error) {
        // Handle backend validation errors
        if (error.response?.data?.errors) {
          this.handleBackendErrors(error, form, {
            customMessage: errorMessage
          });
        } else if (onError) {
          // Custom error handler
          onError(error, values, form);
        } else {
          // Default error handling
          message.error(error.response?.data?.message || errorMessage);
        }
        
        throw error;
      }
    };
  }

  /**
   * Parse field name into namePath array
   * @private
   */
  static _parseFieldName(fieldName) {
    if (fieldName.includes('.')) {
      return fieldName.split('.');
    }
    return fieldName;
  }

  /**
   * Get nested value from object
   * @private
   */
  static _getNestedValue(obj, path) {
    if (typeof path === 'string' && path.includes('.')) {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    return obj?.[path];
  }

  /**
   * Set nested value in object
   * @private
   */
  static _setNestedValue(obj, path, value) {
    if (typeof path === 'string' && path.includes('.')) {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const target = keys.reduce((current, key) => {
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        return current[key];
      }, obj);
      target[lastKey] = value;
    } else {
      obj[path] = value;
    }
  }
}

export default FormHandler;