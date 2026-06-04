// CreateCase.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { useSelector } from 'react-redux';
import {
  Card, Steps, Button, Typography, Row, Col, Avatar,
  Tag, Descriptions, Divider, Spin, message, Modal, Input, Select,
  Form, DatePicker, InputNumber, Alert, Badge, Progress,
  Statistic, Table, Space, Switch, Upload, List, Tooltip
} from 'antd';
import dayjs from 'dayjs';
import {
  UserOutlined, FileTextOutlined, BankOutlined,
  CheckCircleOutlined, InfoCircleOutlined, WarningOutlined,
  EyeOutlined, HomeOutlined, DollarCircleOutlined, 
  PlusOutlined, SaveOutlined, DeleteOutlined, EditOutlined,
  UploadOutlined, InboxOutlined, LinkOutlined,LineChartOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const THEME_COLOR = "#5C039B";

// Formatter for AED currency
const aedFormatter = (value) => {
  if (!value) return '';
  return `AED ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
const aedParser = (value) => {
  if (!value) return 0;
  return parseFloat(value.replace(/AED\s?|,/g, '')) || 0;
};

// Generate unique case reference
const generateCaseReference = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `XOTO-CASE-${year}-${random}`;
};

const CreateCase = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingProposals, setFetchingProposals] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const [form] = Form.useForm();

  const [acceptedProposals, setAcceptedProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedProposalData, setSelectedProposalData] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [createdCaseId, setCreatedCaseId] = useState(null);
  const [showBankSelectionModal, setShowBankSelectionModal] = useState(false);
  const [selectedBankFromProposal, setSelectedBankFromProposal] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  // Form validation rules
  const validateField = (field, value) => {
    const newErrors = { ...fieldErrors };
    if (!value || (typeof value === 'string' && !value.trim())) {
      newErrors[field] = true;
    } else {
      delete newErrors[field];
    }
    setFieldErrors(newErrors);
    return !newErrors[field];
  };

  const [caseData, setCaseData] = useState({
    caseReference: generateCaseReference(),
    clientInfo: {
      fullName: '', preferredName: '', gender: 'Male', dateOfBirth: null,
      nationality: '', maritalStatus: 'Single', numberOfDependents: 0,
      email: '', mobile: '', homePhone: null, workPhone: null, whatsapp: null,
    },
    currentAddress: {
      building: '', apartment: '', area: '', city: 'Dubai', country: 'UAE',
      residenceType: null, yearsAtAddress: null,
    },
    previousAddress: {
      building: '', apartment: '', area: '', city: 'Dubai', country: 'UAE',
      residenceType: null, yearsAtAddress: null,
    },
    employmentDetails: {
      employerName: '', industry: null, designation: '', employmentType: 'Salaried',
      yearsWithEmployer: null, monthsWithEmployer: 0, probationPeriod: 'Completed',
      workAddress: null, workPhone: null, employerEmail: null,
    },
    incomeDetails: {
      basicSalary: 0, housingAllowance: 0, transportAllowance: 0, otherAllowances: 0,
      totalMonthlySalary: 0, annualBonus: 0, otherIncome: 0, totalMonthlyIncome: 0,
      salaryTransferBank: null, salaryTransferType: null,
    },
    expenseDetails: {
      monthlyRent: 0, monthlyOtherLoanInstallments: 0, monthlyCreditCardPayments: 0,
      monthlyLivingExpenses: 0, totalMonthlyLiabilities: 0, dbrPercentage: 0,
      dbrStatus: 'Eligible', existingLoans: [],
    },
    propertyInfo: {
      propertyType: 'Ready', propertySubtype: 'Apartment', propertyValue: 0,
      valuationAmount: null, ltvPercentage: null, loanAmount: 0, downPayment: 0,
      downPaymentSource: null,
      propertyAddress: { building: '', apartment: null, floor: null, area: '', city: 'Dubai', emirate: 'Dubai' },
      propertyDetails: { bedrooms: null, bathrooms: null, areaSqft: null, areaSqm: null, yearBuilt: null, view: null, furnishing: null, parkingSpaces: 0 },
      ownershipDetails: { currentOwner: '', ownerType: 'Individual', titleDeedNumber: null, titleDeedUrl: null, nocAvailable: false },
      transactionDetails: { purchasePrice: 0, agreementDate: null, handoverDate: null, depositPaid: 0, depositPaidDate: null, agentCommission: 0, dldFees: 0, registrationFees: 0, totalClosingCosts: 0 },
    },
    loanInfo: {
      requestedAmount: 0, approvedAmount: null, tenureYears: 25, tenureMonths: 300,
      interestRateType: 'Fixed', interestRatePercentage: 0, processingFee: 0, valuationFee: 2500,
      earlySettlementFeePercentage: 1, earlySettlementAllowedAfterYears: 3,
      lifeInsuranceRequired: true, propertyInsuranceRequired: true,
      monthlyInstallment: { principalAndInterest: 0, lifeInsurance: 0, propertyInsurance: 0, totalMonthlyPayment: 0 },
      selectedBank: '', selectedBankProduct: '',
    },
    internalNotes: '', customerNotes: '',
  });

  // Calculate EMI
  const calculateEMI = (principal, annualRate, tenureYears) => {
    if (!principal || principal <= 0 || !annualRate || annualRate <= 0) return 0;
    const monthlyRate = annualRate / 100 / 12;
    const months = tenureYears * 12;
    if (monthlyRate === 0) return principal / months;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  // Update DBR and all calculations
  const updateFinancialCalculations = useCallback(() => {
    setCaseData(prev => {
      const monthlyIncome = prev.incomeDetails.totalMonthlyIncome || 0;
      const monthlyExpenses = (prev.expenseDetails.monthlyRent || 0) +
                              (prev.expenseDetails.monthlyOtherLoanInstallments || 0) +
                              (prev.expenseDetails.monthlyCreditCardPayments || 0) +
                              (prev.expenseDetails.monthlyLivingExpenses || 0);
      
      const propertyValue = prev.propertyInfo.propertyValue || 0;
      const downPayment = prev.propertyInfo.downPayment || 0;
      const loanAmount = propertyValue - downPayment;
      const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;
      
      const interestRate = prev.loanInfo.interestRatePercentage || 0;
      const tenureYears = prev.loanInfo.tenureYears || 25;
      const emi = calculateEMI(loanAmount, interestRate, tenureYears);
      
      const totalMonthlyOutgoing = monthlyExpenses + emi;
      const dbr = monthlyIncome > 0 ? (totalMonthlyOutgoing / monthlyIncome) * 100 : 0;
      const dbrStatus = dbr <= 50 ? 'Eligible' : dbr <= 60 ? 'Borderline' : 'Ineligible';
      
      const dldFee = propertyValue * 0.04;
      const registrationFee = loanAmount * 0.0025;
      const valuationFee = prev.loanInfo.valuationFee || 2500;
      const processingFee = prev.loanInfo.processingFee || 0;
      const totalUpfrontCost = dldFee + registrationFee + valuationFee + processingFee;
      
      return {
        ...prev,
        propertyInfo: {
          ...prev.propertyInfo,
          loanAmount: Math.round(loanAmount),
          ltvPercentage: parseFloat(ltv.toFixed(2)),
          transactionDetails: {
            ...prev.propertyInfo.transactionDetails,
            dldFees: Math.round(dldFee),
            registrationFees: Math.round(registrationFee),
            totalClosingCosts: Math.round(totalUpfrontCost)
          }
        },
        loanInfo: {
          ...prev.loanInfo,
          requestedAmount: Math.round(loanAmount),
          monthlyInstallment: {
            ...prev.loanInfo.monthlyInstallment,
            principalAndInterest: emi,
            totalMonthlyPayment: emi
          }
        },
        expenseDetails: {
          ...prev.expenseDetails,
          totalMonthlyLiabilities: monthlyExpenses,
          dbrPercentage: parseFloat(dbr.toFixed(2)),
          dbrStatus
        }
      };
    });
  }, []);

  useEffect(() => {
    updateFinancialCalculations();
  }, [
    caseData.incomeDetails.totalMonthlyIncome,
    caseData.expenseDetails.monthlyRent,
    caseData.expenseDetails.monthlyCreditCardPayments,
    caseData.expenseDetails.monthlyLivingExpenses,
    caseData.expenseDetails.monthlyOtherLoanInstallments,
    caseData.propertyInfo.propertyValue,
    caseData.propertyInfo.downPayment,
    caseData.loanInfo.interestRatePercentage,
    caseData.loanInfo.tenureYears,
    updateFinancialCalculations
  ]);

  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [loanForm] = Form.useForm();

  // Fetch accepted proposals
  const fetchAcceptedProposals = useCallback(async () => {
    setFetchingProposals(true);
    try {
      const res = await apiService.get('/vault/lead/proposals/my-proposals?page=1&limit=100&status=Accepted');
      if (res?.success) {
        const unconverted = res.data.filter(p => !p.convertedToCase);
        setAcceptedProposals(unconverted);
      }
    } catch (err) {
      message.error("Failed to fetch accepted proposals");
    } finally {
      setFetchingProposals(false);
    }
  }, []);

  // Fetch proposal details by ID
  const fetchProposalDetails = async (proposalId) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/vault/lead/proposals/${proposalId}`);
      if (res?.success) {
        setSelectedProposalData(res.data);
        const lead = res.data.proposal?.leadId;
        if (lead) {
          setSelectedLead(lead);
          populateCaseFromProposal(res.data.proposal, lead);
        }
      }
    } catch (err) {
      message.error("Failed to fetch proposal details");
    } finally {
      setLoading(false);
    }
  };

  // Populate case data from selected proposal
  const populateCaseFromProposal = (proposal, lead) => {
    if (!lead || !proposal) return;
    
    const selectedBankProductToUse = selectedBankFromProposal || proposal.selectedBankProducts?.[0];
    const bankProduct = selectedBankProductToUse?.bankProductId || {};
    const propertyValue = lead.propertyDetails?.propertyValue || 0;
    const downPayment = lead.propertyDetails?.downPaymentAmount || 0;
    
    setCaseData(prev => ({
      ...prev,
      caseReference: generateCaseReference(),
      clientInfo: {
        ...prev.clientInfo,
        fullName: lead.customerInfo?.fullName || '',
        email: lead.customerInfo?.email || '',
        mobile: lead.customerInfo?.mobileNumber || '',
        nationality: lead.customerInfo?.nationality || '',
        dateOfBirth: lead.customerInfo?.dateOfBirth ? dayjs(lead.customerInfo.dateOfBirth) : null,
        maritalStatus: lead.customerInfo?.maritalStatus || 'Single',
        numberOfDependents: lead.customerInfo?.numberOfDependents || 0,
      },
      propertyInfo: {
        ...prev.propertyInfo,
        propertyValue,
        downPayment,
        propertyAddress: {
          ...prev.propertyInfo.propertyAddress,
          area: lead.propertyDetails?.propertyAddress?.area || '',
        },
        transactionDetails: {
          ...prev.propertyInfo.transactionDetails,
          purchasePrice: propertyValue,
          agreementDate: dayjs(),
        },
        ownershipDetails: {
          ...prev.propertyInfo.ownershipDetails,
          currentOwner: lead.customerInfo?.fullName || '',
        }
      },
      loanInfo: {
        ...prev.loanInfo,
        selectedBank: selectedBankProductToUse?.bankName || bankProduct?.bankInfo?.bankName || '',
        selectedBankProduct: selectedBankProductToUse?.bankProductId?._id || '',
        interestRatePercentage: selectedBankProductToUse?.snapshotRate || bankProduct?.offerSummary?.initialRate || 4.25,
      },
      incomeDetails: {
        ...prev.incomeDetails,
        basicSalary: lead.customerInfo?.monthlySalary || 0,
        totalMonthlySalary: lead.customerInfo?.monthlySalary || 0,
        totalMonthlyIncome: lead.customerInfo?.monthlySalary || 0,
      },
      employmentDetails: {
        ...prev.employmentDetails,
        employerName: lead.customerInfo?.employer || '',
        designation: lead.customerInfo?.occupation || '',
      },
      internalNotes: proposal.coverNote || '',
    }));
  };

  useEffect(() => {
    fetchAcceptedProposals();
  }, [fetchAcceptedProposals]);

  useEffect(() => {
    if (selectedProposal) {
      fetchProposalDetails(selectedProposal._id);
    }
  }, [selectedProposal, selectedBankFromProposal]);

  const handleNext = async () => {
    // Validate current step fields
    if (currentStep === 0 && !selectedProposal) {
      message.warning("Please select an accepted proposal first.");
      return;
    }
    if (currentStep === 0 && selectedProposal) {
      const bankProducts = selectedProposal.selectedBankProducts || [];
      if (bankProducts.length > 1 && !selectedBankFromProposal) {
        setShowBankSelectionModal(true);
        return;
      } else if (bankProducts.length === 1) {
        setSelectedBankFromProposal(bankProducts[0]);
        setCurrentStep(prev => prev + 1);
        return;
      }
      setCurrentStep(prev => prev + 1);
      return;
    }
    
    // Step 1 validation - Client Info
    if (currentStep === 1) {
      const required = ['fullName', 'email', 'mobile', 'nationality', 'gender', 'dateOfBirth'];
      let hasError = false;
      required.forEach(field => {
        if (!caseData.clientInfo[field]) {
          validateField(field, null);
          hasError = true;
        }
      });
      if (hasError) {
        message.error("Please fill all required fields");
        return;
      }
    }
    
    // Step 2 validation - Income
    if (currentStep === 2 && (!caseData.incomeDetails.totalMonthlyIncome || caseData.incomeDetails.totalMonthlyIncome <= 0)) {
      message.error("Please enter valid monthly income");
      return;
    }
    
    // Step 3 validation - Property & Loan
    if (currentStep === 3) {
      if (!caseData.propertyInfo.propertyValue || caseData.propertyInfo.propertyValue <= 0) {
        message.error("Please enter property value");
        return;
      }
      if (!caseData.loanInfo.interestRatePercentage || caseData.loanInfo.interestRatePercentage <= 0) {
        message.error("Please enter interest rate");
        return;
      }
      if (!caseData.loanInfo.selectedBankProduct) {
        message.error("Please select a bank product");
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => setCurrentStep(prev => prev - 1);

  const handleBankSelection = (selectedBankProduct) => {
    setSelectedBankFromProposal(selectedBankProduct);
    setShowBankSelectionModal(false);
    if (selectedProposalData?.proposal && selectedLead) {
      populateCaseFromProposal(selectedProposalData.proposal, selectedLead);
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleCaseDataChange = (section, field, value) => {
    setCaseData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    validateField(`${section}.${field}`, value);
  };

  const handleNestedChange = (section, nested, field, value) => {
    setCaseData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nested]: {
          ...prev[section][nested],
          [field]: value
        }
      }
    }));
  };

  const handleIncomeChange = (field, val) => {
    setCaseData(prev => {
      const updated = { ...prev.incomeDetails, [field]: val || 0 };
      const total = (updated.basicSalary || 0) + (updated.housingAllowance || 0) + 
                    (updated.transportAllowance || 0) + (updated.otherAllowances || 0);
      return {
        ...prev,
        incomeDetails: {
          ...updated,
          totalMonthlySalary: total,
          totalMonthlyIncome: total,
        },
      };
    });
  };

  const handleAddLoan = () => {
    loanForm.validateFields().then(values => {
      const newLoan = {
        type: values.type,
        bank: values.bank,
        outstandingAmount: values.outstandingAmount,
        monthlyInstallment: values.monthlyInstallment,
        tenureRemainingMonths: values.tenureRemainingMonths,
      };
      setCaseData(prev => {
        let updatedLoans;
        if (editingLoan !== null) {
          updatedLoans = [...prev.expenseDetails.existingLoans];
          updatedLoans[editingLoan] = newLoan;
        } else {
          updatedLoans = [...prev.expenseDetails.existingLoans, newLoan];
        }
        const totalLoanInstallments = updatedLoans.reduce((sum, loan) => sum + (loan.monthlyInstallment || 0), 0);
        return {
          ...prev,
          expenseDetails: {
            ...prev.expenseDetails,
            existingLoans: updatedLoans,
            monthlyOtherLoanInstallments: totalLoanInstallments,
          },
        };
      });
      loanForm.resetFields();
      setShowAddLoanModal(false);
      setEditingLoan(null);
    });
  };

  const handleEditLoan = (index) => {
    const loan = caseData.expenseDetails.existingLoans[index];
    loanForm.setFieldsValue(loan);
    setEditingLoan(index);
    setShowAddLoanModal(true);
  };

  const handleRemoveLoan = (index) => {
    setCaseData(prev => {
      const updatedLoans = prev.expenseDetails.existingLoans.filter((_, i) => i !== index);
      const totalLoanInstallments = updatedLoans.reduce((sum, loan) => sum + (loan.monthlyInstallment || 0), 0);
      return {
        ...prev,
        expenseDetails: {
          ...prev.expenseDetails,
          existingLoans: updatedLoans,
          monthlyOtherLoanInstallments: totalLoanInstallments,
        },
      };
    });
  };

  const handleDocumentUpload = async (file, docType) => {
    setUploadingDocs(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', docType);
    formData.append('entityType', 'Case');
    
    try {
      // For now, just track uploaded documents
      setUploadedDocuments(prev => [...prev, { name: file.name, type: docType, status: 'uploaded' }]);
      message.success(`${docType} uploaded successfully`);
    } catch (error) {
      message.error(`Failed to upload ${docType}`);
    } finally {
      setUploadingDocs(false);
    }
  };

  const submitCase = async () => {
    setSubmitting(true);
    try {
      const formatDateForApi = (date) => {
        if (!date) return null;
        if (date.$d) return date.$d;
        if (date.toDate) return date.toDate();
        return date;
      };

      const payload = {
        proposalId: selectedProposal?._id,
        sourceLeadId: selectedLead?._id,
        caseReference: caseData.caseReference,
        
        clientInfo: {
          fullName: caseData.clientInfo.fullName,
          preferredName: caseData.clientInfo.preferredName,
          gender: caseData.clientInfo.gender || 'Male',
          dateOfBirth: formatDateForApi(caseData.clientInfo.dateOfBirth),
          nationality: caseData.clientInfo.nationality,
          maritalStatus: caseData.clientInfo.maritalStatus,
          numberOfDependents: caseData.clientInfo.numberOfDependents,
          email: caseData.clientInfo.email,
          mobile: caseData.clientInfo.mobile,
          homePhone: caseData.clientInfo.homePhone,
          workPhone: caseData.clientInfo.workPhone,
          whatsapp: caseData.clientInfo.whatsapp,
        },
        
        currentAddress: caseData.currentAddress?.building ? caseData.currentAddress : null,
        previousAddress: caseData.previousAddress?.building ? caseData.previousAddress : null,
        
        employmentDetails: {
          employerName: caseData.employmentDetails.employerName,
          industry: caseData.employmentDetails.industry,
          designation: caseData.employmentDetails.designation,
          employmentType: caseData.employmentDetails.employmentType,
          yearsWithEmployer: caseData.employmentDetails.yearsWithEmployer,
          monthsWithEmployer: caseData.employmentDetails.monthsWithEmployer,
          probationPeriod: caseData.employmentDetails.probationPeriod,
          workAddress: caseData.employmentDetails.workAddress,
          workPhone: caseData.employmentDetails.workPhone,
          employerEmail: caseData.employmentDetails.employerEmail,
        },
        
        incomeDetails: {
          basicSalary: caseData.incomeDetails.basicSalary,
          housingAllowance: caseData.incomeDetails.housingAllowance,
          transportAllowance: caseData.incomeDetails.transportAllowance,
          otherAllowances: caseData.incomeDetails.otherAllowances,
          totalMonthlySalary: caseData.incomeDetails.totalMonthlySalary,
          annualBonus: caseData.incomeDetails.annualBonus,
          otherIncome: caseData.incomeDetails.otherIncome,
          totalMonthlyIncome: caseData.incomeDetails.totalMonthlyIncome,
          salaryTransferBank: caseData.incomeDetails.salaryTransferBank,
          salaryTransferType: caseData.incomeDetails.salaryTransferType,
        },
        
        expenseDetails: {
          monthlyRent: caseData.expenseDetails.monthlyRent,
          monthlyOtherLoanInstallments: caseData.expenseDetails.monthlyOtherLoanInstallments,
          monthlyCreditCardPayments: caseData.expenseDetails.monthlyCreditCardPayments,
          monthlyLivingExpenses: caseData.expenseDetails.monthlyLivingExpenses,
          totalMonthlyLiabilities: caseData.expenseDetails.totalMonthlyLiabilities,
          dbrPercentage: caseData.expenseDetails.dbrPercentage,
          dbrStatus: caseData.expenseDetails.dbrStatus,
          existingLoans: caseData.expenseDetails.existingLoans,
        },
        
        propertyInfo: {
          propertyType: caseData.propertyInfo.propertyType,
          propertySubtype: caseData.propertyInfo.propertySubtype,
          propertyValue: caseData.propertyInfo.propertyValue,
          valuationAmount: caseData.propertyInfo.valuationAmount,
          ltvPercentage: caseData.propertyInfo.ltvPercentage,
          loanAmount: caseData.propertyInfo.loanAmount,
          downPayment: caseData.propertyInfo.downPayment,
          downPaymentSource: caseData.propertyInfo.downPaymentSource,
          propertyAddress: caseData.propertyInfo.propertyAddress,
          propertyDetails: caseData.propertyInfo.propertyDetails,
          ownershipDetails: {
            currentOwner: caseData.propertyInfo.ownershipDetails.currentOwner || caseData.clientInfo.fullName,
            ownerType: caseData.propertyInfo.ownershipDetails.ownerType,
            titleDeedNumber: caseData.propertyInfo.ownershipDetails.titleDeedNumber,
            titleDeedUrl: caseData.propertyInfo.ownershipDetails.titleDeedUrl,
            nocAvailable: caseData.propertyInfo.ownershipDetails.nocAvailable,
          },
          transactionDetails: {
            purchasePrice: caseData.propertyInfo.transactionDetails?.purchasePrice || caseData.propertyInfo.propertyValue,
            agreementDate: formatDateForApi(caseData.propertyInfo.transactionDetails?.agreementDate) || new Date(),
            handoverDate: formatDateForApi(caseData.propertyInfo.transactionDetails?.handoverDate),
            depositPaid: caseData.propertyInfo.transactionDetails?.depositPaid || 0,
            depositPaidDate: formatDateForApi(caseData.propertyInfo.transactionDetails?.depositPaidDate),
            agentCommission: caseData.propertyInfo.transactionDetails?.agentCommission || 0,
            dldFees: caseData.propertyInfo.transactionDetails?.dldFees || 0,
            registrationFees: caseData.propertyInfo.transactionDetails?.registrationFees || 0,
            totalClosingCosts: caseData.propertyInfo.transactionDetails?.totalClosingCosts || 0,
          },
        },
        
        loanInfo: {
          requestedAmount: caseData.loanInfo.requestedAmount,
          approvedAmount: caseData.loanInfo.approvedAmount,
          tenureYears: caseData.loanInfo.tenureYears,
          tenureMonths: caseData.loanInfo.tenureYears * 12,
          interestRateType: caseData.loanInfo.interestRateType,
          interestRatePercentage: caseData.loanInfo.interestRatePercentage,
          processingFee: caseData.loanInfo.processingFee,
          valuationFee: caseData.loanInfo.valuationFee,
          earlySettlementFeePercentage: caseData.loanInfo.earlySettlementFeePercentage,
          earlySettlementAllowedAfterYears: caseData.loanInfo.earlySettlementAllowedAfterYears,
          lifeInsuranceRequired: caseData.loanInfo.lifeInsuranceRequired,
          propertyInsuranceRequired: caseData.loanInfo.propertyInsuranceRequired,
          monthlyInstallment: caseData.loanInfo.monthlyInstallment,
          selectedBank: caseData.loanInfo.selectedBank,
          selectedBankProduct: caseData.loanInfo.selectedBankProduct,
        },
        
        currentStatus: 'Draft',
        internalNotes: caseData.internalNotes,
        customerNotes: caseData.customerNotes,
      };

      const response = await apiService.post('/vault/cases', payload);
      
      if (response?.success) {
        setCreatedCaseId(response.data._id);
        message.success(`Case created successfully! ${response.data.documentsCopied} documents copied from lead.`);
        setCurrentStep(0);
        setSelectedProposal(null);
        setSelectedLead(null);
        setSelectedBankFromProposal(null);
        setSelectedProposalData(null);
        setUploadedDocuments([]);
        fetchAcceptedProposals();
        // Reset form
        setCaseData({
          ...caseData,
          caseReference: generateCaseReference(),
          clientInfo: { ...caseData.clientInfo, fullName: '', email: '', mobile: '', nationality: '', dateOfBirth: null },
          propertyInfo: { ...caseData.propertyInfo, propertyValue: 0, downPayment: 0 },
          loanInfo: { ...caseData.loanInfo, interestRatePercentage: 0, selectedBank: '', selectedBankProduct: '' },
        });
      } else {
        message.error(response?.message || "Failed to create case");
      }
    } catch (err) {
      console.error("Case creation error:", err);
      message.error(err.response?.data?.message || "Error creating case");
    } finally {
      setSubmitting(false);
    }
  };

  // Document checklist items
  const documentChecklist = [
    { key: 'bank_application_form', label: 'Bank Application Form', required: true },
    { key: 'emirates_id_front', label: 'Emirates ID (Front)', required: true },
    { key: 'emirates_id_back', label: 'Emirates ID (Back)', required: true },
    { key: 'passport', label: 'Passport Copy', required: true },
    { key: 'visa', label: 'Residence Visa', required: false },
    { key: 'bank_statements', label: 'Bank Statements (6 months)', required: true },
    { key: 'salary_certificate', label: 'Salary Certificate', required: true },
    { key: 'payslips', label: 'Recent Payslips', required: false },
    { key: 'title_deed', label: 'Title Deed', required: true },
    { key: 'consent_form', label: 'Consent Form', required: true },
  ];

  // STEP 0: Select Accepted Proposal
  const renderStep0 = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Select Accepted Proposal to Convert to Case</Title>
      {fetchingProposals ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
      ) : acceptedProposals.length === 0 ? (
        <Alert 
          message="No Accepted Proposals Found" 
          description="There are no accepted proposals available to convert into cases. Please ensure you have accepted proposals first." 
          type="info" 
          showIcon 
          style={{ borderRadius: 12 }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {acceptedProposals.map(proposal => (
            <Col xs={24} md={12} lg={8} key={proposal._id}>
              <Card 
                hoverable 
                onClick={() => setSelectedProposal(proposal)} 
                style={{ 
                  borderColor: selectedProposal?._id === proposal._id ? THEME_COLOR : '#f0f0f0', 
                  borderWidth: selectedProposal?._id === proposal._id ? 2 : 1, 
                  borderRadius: 12, 
                  cursor: 'pointer' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: THEME_COLOR }} />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: 'block', fontSize: 16 }}>{proposal.leadId?.customerInfo?.fullName || 'Unknown Customer'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{proposal.leadId?.customerInfo?.email || 'No email'}</Text>
                  </div>
                  <Badge status="success" text="Accepted" />
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Property Value</Text>
                    <div><b>AED {proposal.clientRequirements?.targetPropertyValue?.toLocaleString() || 0}</b></div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Loan Amount</Text>
                    <div><b>AED {proposal.customerFinancialSummary?.estimatedLoanAmount?.toLocaleString() || 0}</b></div>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Selected Banks ({proposal.selectedBankProducts?.length || 0})</Text>
                    <div style={{ marginTop: 4 }}>
                      {proposal.selectedBankProducts?.map((p, idx) => (
                        <Tag key={idx} color="purple" style={{ marginTop: 4, marginRight: 4 }}>
                          {p.bankName || p.bankProductId?.bankInfo?.bankName} ({p.snapshotRate || p.bankProductId?.offerSummary?.initialRate}%)
                        </Tag>
                      ))}
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  // STEP 1: Client Information
  const renderStep1 = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Client Information</Title>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Personal Details" bodyStyle={{ padding: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Full Name <span style={{ color: 'red' }}>*</span></Text>
                <Input 
                  size="large" 
                  value={caseData.clientInfo.fullName} 
                  onChange={(e) => handleCaseDataChange('clientInfo', 'fullName', e.target.value)} 
                  placeholder="Enter full name" 
                  status={fieldErrors['fullName'] ? 'error' : ''} 
                  style={{ marginTop: 4 }} 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Preferred Name</Text>
                <Input 
                  size="large" 
                  value={caseData.clientInfo.preferredName} 
                  onChange={(e) => handleCaseDataChange('clientInfo', 'preferredName', e.target.value)} 
                  placeholder="Enter preferred name" 
                  style={{ marginTop: 4 }} 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Gender <span style={{ color: 'red' }}>*</span></Text>
                <Select 
                  size="large" 
                  value={caseData.clientInfo.gender} 
                  onChange={(val) => handleCaseDataChange('clientInfo', 'gender', val)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  placeholder="Select gender"
                >
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Date of Birth <span style={{ color: 'red' }}>*</span></Text>
                <DatePicker 
                  size="large" 
                  value={caseData.clientInfo.dateOfBirth} 
                  onChange={(date) => handleCaseDataChange('clientInfo', 'dateOfBirth', date)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  format="DD/MM/YYYY" 
                  placeholder="Select date of birth" 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Nationality <span style={{ color: 'red' }}>*</span></Text>
                <Input 
                  size="large" 
                  value={caseData.clientInfo.nationality} 
                  onChange={(e) => handleCaseDataChange('clientInfo', 'nationality', e.target.value)} 
                  placeholder="Enter nationality" 
                  style={{ marginTop: 4 }} 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Marital Status</Text>
                <Select 
                  size="large" 
                  value={caseData.clientInfo.maritalStatus} 
                  onChange={(val) => handleCaseDataChange('clientInfo', 'maritalStatus', val)} 
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="Single">Single</Option>
                  <Option value="Married">Married</Option>
                  <Option value="Divorced">Divorced</Option>
                  <Option value="Widowed">Widowed</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Number of Dependents</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.clientInfo.numberOfDependents} 
                  onChange={(val) => handleCaseDataChange('clientInfo', 'numberOfDependents', val)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  min={0} 
                  max={20} 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Email <span style={{ color: 'red' }}>*</span></Text>
                <Input 
                  size="large" 
                  value={caseData.clientInfo.email} 
                  onChange={(e) => handleCaseDataChange('clientInfo', 'email', e.target.value)} 
                  placeholder="Enter email" 
                  status={fieldErrors['email'] ? 'error' : ''} 
                  style={{ marginTop: 4 }} 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Mobile Number <span style={{ color: 'red' }}>*</span></Text>
                <Input 
                  size="large" 
                  value={caseData.clientInfo.mobile} 
                  onChange={(e) => handleCaseDataChange('clientInfo', 'mobile', e.target.value)} 
                  placeholder="Enter mobile number" 
                  status={fieldErrors['mobile'] ? 'error' : ''} 
                  style={{ marginTop: 4 }} 
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Employment Details" bodyStyle={{ padding: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Employer Name <span style={{ color: 'red' }}>*</span></Text>
                <Input 
                  size="large" 
                  value={caseData.employmentDetails.employerName} 
                  onChange={(e) => handleCaseDataChange('employmentDetails', 'employerName', e.target.value)} 
                  placeholder="Enter employer name" 
                  style={{ marginTop: 4 }} 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Designation <span style={{ color: 'red' }}>*</span></Text>
                <Input 
                  size="large" 
                  value={caseData.employmentDetails.designation} 
                  onChange={(e) => handleCaseDataChange('employmentDetails', 'designation', e.target.value)} 
                  placeholder="Enter job title" 
                  style={{ marginTop: 4 }} 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Employment Type</Text>
                <Select 
                  size="large" 
                  value={caseData.employmentDetails.employmentType} 
                  onChange={(val) => handleCaseDataChange('employmentDetails', 'employmentType', val)} 
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="Salaried">Salaried</Option>
                  <Option value="Self-Employed">Self-Employed</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Years with Employer</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.employmentDetails.yearsWithEmployer} 
                  onChange={(val) => handleCaseDataChange('employmentDetails', 'yearsWithEmployer', val)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  min={0} 
                  max={50} 
                  placeholder="Years" 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Probation Period</Text>
                <Select 
                  size="large" 
                  value={caseData.employmentDetails.probationPeriod} 
                  onChange={(val) => handleCaseDataChange('employmentDetails', 'probationPeriod', val)} 
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="Completed">Completed</Option>
                  <Option value="Ongoing">Ongoing</Option>
                  <Option value="Not Applicable">Not Applicable</Option>
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // STEP 2: Income & Expenses
  const renderStep2 = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Income & Financial Assessment</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Income Details" bodyStyle={{ padding: 24 }} style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text strong>Basic Salary (Monthly) <span style={{ color: 'red' }}>*</span></Text>
                <InputNumber 
                  size="large" 
                  value={caseData.incomeDetails.basicSalary} 
                  onChange={(val) => handleIncomeChange('basicSalary', val)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  placeholder="Enter basic salary" 
                  min={0} 
                />
              </Col>
              <Col span={12}>
                <Text strong>Housing Allowance</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.incomeDetails.housingAllowance} 
                  onChange={(val) => handleIncomeChange('housingAllowance', val)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  min={0} 
                />
              </Col>
              <Col span={12}>
                <Text strong>Transport Allowance</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.incomeDetails.transportAllowance} 
                  onChange={(val) => handleIncomeChange('transportAllowance', val)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  min={0} 
                />
              </Col>
              <Col span={24}>
                <Text strong>Other Allowances</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.incomeDetails.otherAllowances} 
                  onChange={(val) => handleIncomeChange('otherAllowances', val)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  min={0} 
                />
              </Col>
            </Row>
          </Card>

          <Card title="Monthly Expenses" bodyStyle={{ padding: 24 }} style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text strong>Monthly Rent</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.expenseDetails.monthlyRent} 
                  onChange={(val) => handleCaseDataChange('expenseDetails', 'monthlyRent', val || 0)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  min={0} 
                />
              </Col>
              <Col span={24}>
                <Text strong>Credit Card Payments (Monthly)</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.expenseDetails.monthlyCreditCardPayments} 
                  onChange={(val) => handleCaseDataChange('expenseDetails', 'monthlyCreditCardPayments', val || 0)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  min={0} 
                />
              </Col>
              <Col span={24}>
                <Text strong>Monthly Living Expenses</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.expenseDetails.monthlyLivingExpenses} 
                  onChange={(val) => handleCaseDataChange('expenseDetails', 'monthlyLivingExpenses', val || 0)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  min={0} 
                />
              </Col>
            </Row>
          </Card>

          <Card 
            title="Existing Loans & Liabilities" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => { setEditingLoan(null); loanForm.resetFields(); setShowAddLoanModal(true); }} 
                style={{ background: THEME_COLOR }}
              >
                Add Loan
              </Button>
            } 
            bodyStyle={{ padding: 24 }}
          >
            <Table 
              dataSource={caseData.expenseDetails.existingLoans} 
              columns={[
                { title: 'Type', dataIndex: 'type', key: 'type', width: 100, render: (val) => <Tag color="blue">{val}</Tag> },
                { title: 'Bank/Institution', dataIndex: 'bank', key: 'bank', width: 150 },
                { title: 'Outstanding Amount', dataIndex: 'outstandingAmount', key: 'outstandingAmount', width: 150, render: (val) => `AED ${(val || 0).toLocaleString()}` },
                { title: 'Monthly Installment', dataIndex: 'monthlyInstallment', key: 'monthlyInstallment', width: 150, render: (val) => `AED ${(val || 0).toLocaleString()}` },
                { title: 'Remaining Months', dataIndex: 'tenureRemainingMonths', key: 'tenureRemainingMonths', width: 120 },
                { title: 'Actions', key: 'actions', width: 100, render: (_, __, index) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEditLoan(index)} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleRemoveLoan(index)} />
                  </Space>
                ) },
              ]} 
              rowKey={(_, index) => index} 
              pagination={false} 
              locale={{ emptyText: 'No existing loans added' }} 
              scroll={{ x: 800 }} 
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card 
            title={<span><LineChartOutlined style={{ color: THEME_COLOR }} /> DBR Analysis & Tracker</span>} 
            bodyStyle={{ padding: 24 }} 
            headStyle={{ background: '#f8f5ff' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Progress 
                type="dashboard" 
                percent={Math.min(caseData.expenseDetails.dbrPercentage || 0, 100)} 
                strokeColor={caseData.expenseDetails.dbrPercentage <= 50 ? '#10b981' : caseData.expenseDetails.dbrPercentage <= 60 ? '#f59e0b' : '#ef4444'} 
                format={(percent) => (
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>{caseData.expenseDetails.dbrPercentage || 0}%</div>
                    <div style={{ fontSize: 12, color: '#666' }}>DBR Score</div>
                  </div>
                )} 
                width={180} 
                strokeWidth={12} 
              />
            </div>
            
            <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Total Monthly Income</Text>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#10b981' }}>
                    AED {caseData.incomeDetails.totalMonthlyIncome?.toLocaleString() || 0}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Total Monthly Liabilities</Text>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ef4444' }}>
                    AED {caseData.expenseDetails.totalMonthlyLiabilities?.toLocaleString() || 0}
                  </div>
                </Col>
              </Row>
            </div>
            
            <div style={{ background: '#f8f5ff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Proposed EMI</Text>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                    AED {caseData.loanInfo.monthlyInstallment?.principalAndInterest?.toLocaleString() || 0}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Total Outgoing</Text>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#e74c3c' }}>
                    AED {((caseData.expenseDetails.totalMonthlyLiabilities || 0) + (caseData.loanInfo.monthlyInstallment?.principalAndInterest || 0)).toLocaleString()}
                  </div>
                </Col>
              </Row>
            </div>
            
            <Alert 
              message={
                caseData.expenseDetails.dbrStatus === 'Eligible' ? '✅ Eligible' : 
                caseData.expenseDetails.dbrStatus === 'Borderline' ? '⚠️ Borderline' : '❌ Not Eligible'
              } 
              description={
                caseData.expenseDetails.dbrStatus === 'Eligible' ? 'DBR is within acceptable limits. Loan approval likely.' : 
                caseData.expenseDetails.dbrStatus === 'Borderline' ? 'DBR is borderline. May need additional documentation.' : 
                'DBR exceeds limits. Consider reducing liabilities or increasing income.'
              } 
              type={caseData.expenseDetails.dbrStatus === 'Eligible' ? 'success' : caseData.expenseDetails.dbrStatus === 'Borderline' ? 'warning' : 'error'} 
              showIcon 
              style={{ marginTop: 8 }} 
            />
            
            <Divider />
            <div style={{ marginTop: 16 }}>
              <Text strong>DBR Threshold Guidelines:</Text>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li><Tag color="green">≤ 50%</Tag> - <Text type="secondary">Eligible (Expatriates)</Text></li>
                <li><Tag color="green">≤ 55%</Tag> - <Text type="secondary">Eligible (UAE Nationals)</Text></li>
                <li><Tag color="orange">50-60%</Tag> - <Text type="secondary">Borderline - May require review</Text></li>
                <li><Tag color="red">&gt; 60%</Tag> - <Text type="secondary">Ineligible - Loan unlikely to be approved</Text></li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // STEP 3: Property & Loan Details
  const renderStep3 = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Property & Loan Details</Title>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Property Information" bodyStyle={{ padding: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Property Type</Text>
                <Select 
                  size="large" 
                  value={caseData.propertyInfo.propertyType} 
                  onChange={(val) => handleCaseDataChange('propertyInfo', 'propertyType', val)} 
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="Ready">Ready</Option>
                  <Option value="Off-plan">Off-plan</Option>
                  <Option value="Commercial">Commercial</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Property Subtype</Text>
                <Select 
                  size="large" 
                  value={caseData.propertyInfo.propertySubtype} 
                  onChange={(val) => handleCaseDataChange('propertyInfo', 'propertySubtype', val)} 
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="Apartment">Apartment</Option>
                  <Option value="Villa">Villa</Option>
                  <Option value="Townhouse">Townhouse</Option>
                  <Option value="Penthouse">Penthouse</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Property Value <span style={{ color: 'red' }}>*</span></Text>
                <InputNumber 
                  size="large" 
                  value={caseData.propertyInfo.propertyValue} 
                  onChange={(val) => handleCaseDataChange('propertyInfo', 'propertyValue', val || 0)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  min={0} 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Down Payment</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.propertyInfo.downPayment} 
                  onChange={(val) => handleCaseDataChange('propertyInfo', 'downPayment', val || 0)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  min={0} 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
<Text strong>
  Building Name <span style={{ color: 'red' }}>*</span>
</Text>              <Input 
  size="large" 
  value={caseData.propertyInfo.propertyAddress?.building} 
  onChange={(e) => handleNestedChange('propertyInfo', 'propertyAddress', 'building', e.target.value)} 
  placeholder="Enter building name" 
  style={{ marginTop: 4 }} 
  status={!caseData.propertyInfo.propertyAddress?.building ? 'error' : ''}
/>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Area <span style={{ color: 'red' }}>*</span></Text>
                <Input 
                  size="large" 
                  value={caseData.propertyInfo.propertyAddress?.area} 
                  onChange={(e) => handleNestedChange('propertyInfo', 'propertyAddress', 'area', e.target.value)} 
                  placeholder="Enter area" 
                  style={{ marginTop: 4 }} 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Purchase Price</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.propertyInfo.transactionDetails?.purchasePrice} 
                  onChange={(val) => handleNestedChange('propertyInfo', 'transactionDetails', 'purchasePrice', val || 0)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  min={0} 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Agreement Date</Text>
                <DatePicker 
                  size="large" 
                  value={caseData.propertyInfo.transactionDetails?.agreementDate} 
                  onChange={(date) => handleNestedChange('propertyInfo', 'transactionDetails', 'agreementDate', date)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  format="DD/MM/YYYY" 
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card 
            title="Loan Details" 
            extra={
              selectedBankFromProposal && (
                <Tag color="green" style={{ fontSize: 14 }}>
                  Selected Bank: {selectedBankFromProposal?.bankName || caseData.loanInfo.selectedBank}
                </Tag>
              )
            } 
            bodyStyle={{ padding: 24 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Selected Bank</Text>
                <Input 
                  size="large" 
                  value={caseData.loanInfo.selectedBank} 
                  style={{ marginTop: 4 }} 
                  disabled 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Interest Rate (%) <span style={{ color: 'red' }}>*</span></Text>
                <InputNumber 
                  size="large" 
                  value={caseData.loanInfo.interestRatePercentage} 
                  onChange={(val) => handleCaseDataChange('loanInfo', 'interestRatePercentage', val || 0)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  step={0.01} 
                  min={0} 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Tenure (Years)</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.loanInfo.tenureYears} 
                  onChange={(val) => handleCaseDataChange('loanInfo', 'tenureYears', val || 0)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  min={5} 
                  max={30} 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Monthly EMI</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.loanInfo.monthlyInstallment?.principalAndInterest} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  disabled 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Interest Rate Type</Text>
                <Select 
                  size="large" 
                  value={caseData.loanInfo.interestRateType} 
                  onChange={(val) => handleCaseDataChange('loanInfo', 'interestRateType', val)} 
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <Option value="Fixed">Fixed</Option>
                  <Option value="Variable">Variable</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Loan Amount</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.propertyInfo.loanAmount} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  disabled 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>LTV Percentage</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.propertyInfo.ltvPercentage} 
                  style={{ width: '100%', marginTop: 4 }} 
                  suffix="%" 
                  disabled 
                  precision={2} 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Valuation Fee</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.loanInfo.valuationFee} 
                  onChange={(val) => handleCaseDataChange('loanInfo', 'valuationFee', val || 0)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  min={0} 
                />
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <Switch 
                    checked={caseData.loanInfo.lifeInsuranceRequired} 
                    onChange={(val) => handleCaseDataChange('loanInfo', 'lifeInsuranceRequired', val)} 
                  />
                  <Text strong>Life Insurance Required</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <Switch 
                    checked={caseData.loanInfo.propertyInsuranceRequired} 
                    onChange={(val) => handleCaseDataChange('loanInfo', 'propertyInsuranceRequired', val)} 
                  />
                  <Text strong>Property Insurance Required</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Text strong>Processing Fee</Text>
                <InputNumber 
                  size="large" 
                  value={caseData.loanInfo.processingFee} 
                  onChange={(val) => handleCaseDataChange('loanInfo', 'processingFee', val || 0)} 
                  style={{ width: '100%', marginTop: 4 }} 
                  formatter={aedFormatter} 
                  parser={aedParser} 
                  min={0} 
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // STEP 4: Documents Upload
  const renderStepDocuments = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Documents Upload</Title>
      <Alert 
        message="Documents from Lead Will Be Copied Automatically" 
        description="Documents uploaded in the Lead stage will be automatically copied to this case. Additional documents can be uploaded here." 
        type="info" 
        showIcon 
        style={{ marginBottom: 20, borderRadius: 12 }}
      />
      
      <Card title="Required Documents Checklist" bodyStyle={{ padding: 24 }}>
        <Row gutter={[16, 16]}>
          {documentChecklist.map(doc => (
            <Col xs={24} sm={12} md={8} lg={6} key={doc.key}>
              <Card 
                size="small" 
                style={{ 
                  backgroundColor: uploadedDocuments.some(d => d.type === doc.key) ? '#f6ffed' : '#fafafa', 
                  border: `1px solid ${uploadedDocuments.some(d => d.type === doc.key) ? '#b7eb8f' : '#e8e8e8'}`,
                  borderRadius: 8 
                }}
              >
                <Text strong style={{ textTransform: 'capitalize', fontSize: 13 }}>
                  {doc.label}
                  {doc.required && <span style={{ color: 'red' }}>*</span>}
                </Text>
                {/* <div style={{ marginTop: 12 }}>
                  {uploadedDocuments.some(d => d.type === doc.key) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircleOutlined style={{ color: '#10b981' }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>Uploaded</Text>
                    </div>
                  ) : (
                    <Upload
                      beforeUpload={(file) => {
                        handleDocumentUpload(file, doc.key);
                        return false;
                      }}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />} size="small" block>
                        Upload
                      </Button>
                    </Upload>
                  )}
                </div> */}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
      
      <Alert 
        message="Note: Documents from Lead will be automatically copied when case is created" 
        description="You don't need to re-upload documents that were already uploaded in the Lead stage. They will be automatically linked to this case." 
        type="success" 
        showIcon 
        style={{ marginTop: 20, borderRadius: 12 }}
      />
    </div>
  );

  // STEP 5: Notes & Review
  const renderStepReview = () => (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Title level={4} style={{ color: THEME_COLOR, marginBottom: 24 }}>Notes & Final Review</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Internal Notes (Xoto Team Only)" bodyStyle={{ padding: 24 }}>
            <TextArea 
              rows={6} 
              value={caseData.internalNotes} 
              onChange={(e) => setCaseData(prev => ({ ...prev, internalNotes: e.target.value }))} 
              placeholder="Add internal notes for Xoto team..." 
              style={{ borderRadius: 8, fontSize: 14 }} 
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Customer Notes (Visible to Customer)" bodyStyle={{ padding: 24 }}>
            <TextArea 
              rows={6} 
              value={caseData.customerNotes} 
              onChange={(e) => setCaseData(prev => ({ ...prev, customerNotes: e.target.value }))} 
              placeholder="Add notes that will be shared with the customer..." 
              style={{ borderRadius: 8, fontSize: 14 }} 
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Case Summary" bodyStyle={{ padding: 24 }} headStyle={{ background: '#f8f5ff' }}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6}>
                <Statistic title="Case Reference" value={caseData.caseReference || 'Pending'} valueStyle={{ fontSize: 12 }} />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Statistic title="Client Name" value={caseData.clientInfo.fullName || 'Not set'} />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Statistic title="Property Value" value={caseData.propertyInfo.propertyValue || 0} prefix="AED" precision={0} />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Statistic title="Loan Amount" value={caseData.propertyInfo.loanAmount || 0} prefix="AED" precision={0} />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Statistic title="Selected Bank" value={caseData.loanInfo.selectedBank || 'Not selected'} />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Statistic title="Interest Rate" value={caseData.loanInfo.interestRatePercentage || 0} suffix="%" />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Statistic title="LTV" value={caseData.propertyInfo.ltvPercentage || 0} suffix="%" />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Statistic 
                  title="DBR" 
                  value={caseData.expenseDetails.dbrPercentage || 0} 
                  suffix="%" 
                  valueStyle={{ color: caseData.expenseDetails.dbrPercentage <= 50 ? '#10b981' : '#ef4444' }} 
                />
              </Col>
            </Row>
            <Divider />
            <Alert 
              message={(() => {
                const missingFields = [];
                if (!caseData.clientInfo.fullName) missingFields.push('Client Name');
                if (!caseData.propertyInfo.propertyValue) missingFields.push('Property Value');
                if (!caseData.loanInfo.interestRatePercentage) missingFields.push('Interest Rate');
                return missingFields.length > 0 ? `⚠️ Missing: ${missingFields.join(', ')}` : '✅ Ready to Create Case';
              })()} 
              description={(() => {
                if (!caseData.clientInfo.fullName) return "Please complete all required fields before creating the case.";
                if (caseData.expenseDetails.dbrPercentage > 60) return "⚠️ High DBR detected. Loan approval may be challenging.";
                return "Please review all information carefully before creating the case. Documents from Lead will be automatically copied.";
              })()} 
              type={(!caseData.clientInfo.fullName || !caseData.propertyInfo.propertyValue) ? 'warning' : (caseData.expenseDetails.dbrPercentage > 60 ? 'warning' : 'success')} 
              showIcon 
              style={{ marginTop: 16 }} 
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Bank Selection Modal
  const renderBankSelectionModal = () => (
    <Modal 
      title="Select Bank for Case Creation" 
      open={showBankSelectionModal} 
      onCancel={() => { setShowBankSelectionModal(false); setSelectedProposal(null); }} 
      footer={null} 
      width={600} 
      closable={false}
    >
      <Alert 
        message="Multiple Banks Selected in Proposal" 
        description="This proposal contains multiple bank options. Please select which bank to use for this case." 
        type="info" 
        showIcon 
        style={{ marginBottom: 20, borderRadius: 8 }} 
      />
      <Row gutter={[16, 16]}>
        {selectedProposal?.selectedBankProducts?.map((bankProduct, index) => (
          <Col span={24} key={index}>
            <Card 
              hoverable 
              onClick={() => handleBankSelection(bankProduct)} 
              style={{ borderRadius: 12, cursor: 'pointer', border: `1px solid ${THEME_COLOR}20` }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <BankOutlined style={{ fontSize: 32, color: THEME_COLOR }} />
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 16 }}>{bankProduct.bankName || bankProduct.bankProductId?.bankInfo?.bankName}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue">Rate: {bankProduct.snapshotRate || bankProduct.bankProductId?.offerSummary?.initialRate}%</Tag>
                    <Tag color="green">Max LTV: {bankProduct.snapshotMaxLtv || bankProduct.bankProductId?.loanDetails?.maxLoanToValue}%</Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    EMI: AED {(bankProduct.bankProductId?.offerSummary?.monthlyEMI || bankProduct.snapshotEmi || 0).toLocaleString()}/month
                  </Text>
                </div>
                <CheckCircleOutlined style={{ fontSize: 20, color: '#10b981' }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Button onClick={() => { setShowBankSelectionModal(false); setSelectedProposal(null); }}>Cancel</Button>
      </div>
    </Modal>
  );

  // Loan Modal
  const renderLoanModal = () => (
    <Modal 
      title={editingLoan !== null ? "Edit Existing Loan" : "Add Existing Loan"} 
      open={showAddLoanModal} 
      onCancel={() => { setShowAddLoanModal(false); setEditingLoan(null); loanForm.resetFields(); }} 
      footer={[
        <Button key="cancel" onClick={() => { setShowAddLoanModal(false); setEditingLoan(null); loanForm.resetFields(); }}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleAddLoan} style={{ background: THEME_COLOR }}>
          {editingLoan !== null ? "Update" : "Add"} Loan
        </Button>
      ]} 
      width={600}
    >
      <Form form={loanForm} layout="vertical">
        <Form.Item name="type" label="Loan Type" rules={[{ required: true }]}>
          <Select size="large" placeholder="Select loan type">
            <Option value="Car Loan">Car Loan</Option>
            <Option value="Personal Loan">Personal Loan</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>
        <Form.Item name="bank" label="Bank/Institution" rules={[{ required: true }]}>
          <Input size="large" placeholder="Enter bank name" />
        </Form.Item>
        <Form.Item name="outstandingAmount" label="Outstanding Amount" rules={[{ required: true }]}>
          <InputNumber size="large" style={{ width: '100%' }} formatter={aedFormatter} parser={aedParser} placeholder="Enter outstanding amount" min={0} />
        </Form.Item>
        <Form.Item name="monthlyInstallment" label="Monthly Installment" rules={[{ required: true }]}>
          <InputNumber size="large" style={{ width: '100%' }} formatter={aedFormatter} parser={aedParser} placeholder="Enter monthly installment" min={0} />
        </Form.Item>
        <Form.Item name="tenureRemainingMonths" label="Remaining Tenure (Months)" rules={[{ required: true }]}>
          <InputNumber size="large" style={{ width: '100%' }} min={1} max={360} placeholder="Enter remaining months" />
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <div style={{ padding: '24px', background: '#fdfbff', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .ant-card { border-radius: 16px; }
      `}</style>
      
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ color: '#1e1b4b', margin: 0, fontWeight: 800 }}>Create Case from Proposal</Title>
        <Text type="secondary">Convert an accepted proposal into a formal case for processing. Documents from Lead will be automatically copied.</Text>
      </div>

      <Card style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 24 }}>
        <Steps 
          current={currentStep} 
          style={{ marginBottom: 40 }} 
          items={[
            { title: 'Select Proposal' },
            { title: 'Client Info' },
            { title: 'Income & DBR' },
            { title: 'Property & Loan' },
            { title: 'Documents' },
            { title: 'Review' }
          ]} 
        />
        
        <div style={{ minHeight: 500 }}>
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStepDocuments()}
          {currentStep === 5 && renderStepReview()}
        </div>
        
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 24 }}>
          <Button 
            disabled={currentStep === 0} 
            onClick={handlePrev} 
            size="large" 
            style={{ borderRadius: 8, height: 44, padding: '0 32px' }}
          >
            Previous
          </Button>
          
          {currentStep < 5 ? (
            <Button 
              type="primary" 
              onClick={handleNext} 
              size="large" 
              style={{ background: THEME_COLOR, borderColor: THEME_COLOR, borderRadius: 8, height: 44, padding: '0 32px' }}
            >
              Continue
            </Button>
          ) : (
            <Button 
              type="primary" 
              onClick={submitCase} 
              loading={submitting} 
              size="large" 
              style={{ background: '#10b981', borderColor: '#10b981', borderRadius: 8, height: 44, padding: '0 32px' }} 
              icon={<SaveOutlined />}
            >
              {submitting ? 'Creating...' : 'Create Case'}
            </Button>
          )}
        </div>
      </Card>

      {renderBankSelectionModal()}
      {renderLoanModal()}
    </div>
  );
};

export default CreateCase;