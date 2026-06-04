# API Endpoints Summary - Property Details

## 1. UNIQUE API ENDPOINTS FOR FETCHING SINGLE PROPERTY DETAILS

### PRIMARY ENDPOINT (Most Common - Used in Admin)
```
GET /properties/{id}
```
- **Used By**: Admin property detail pages, agent projects, advisor grids
- **Files**:
  - [Adminpropertydetails.jsx](src/components/CMS/pages/Adminpropertydetails.jsx#L59) - **ADMIN SECTION**
  - [Propertydetailpage.jsx](src/components/CMS/pages/Propertydetailpage.jsx#L142) - Rental properties
  - [AgentProjectDetails.jsx](src/components/Grid/GridAgent/AgentProjectDetails.jsx#L820)
  - [Propertycatalogue.jsx](src/components/Grid/AdvisorGrid/Propertycatalogue.jsx#L241)

### ALTERNATIVE ENDPOINT (Singular Form)
```
GET /property/{id}
```
- **Used By**: Quick fetches in various grid modules
- **Files**:
  - [GridAgentLeadDetail.jsx](src/components/Grid/GridAgent/GridAgentLeadDetail.jsx#L292)
  - [AgentProjectDetails.jsx](src/components/Grid/GridAgent/AgentProjectDetails.jsx#L208)
  - [GridAdvisorLeadDetail.jsx](src/components/Grid/AdvisorGrid/GridAdvisorLeadDetail.jsx#L210)

### LISTING-SPECIFIC ENDPOINT
```
GET /property/listing/{id}
```
- **Used By**: Platform leads in admin grid
- **Files**:
  - [PlatformLeads.jsx](src/components/Grid/GridAdmin.jsx/PlatformLeads.jsx#L140) - **ADMIN GRID**

### INVENTORY-SPECIFIC ENDPOINT
```
GET /properties/inventory/{id}
```
- **Used By**: Developer unit details and inventory operations
- **Files**:
  - [DeveloperUnitDetails.jsx](src/components/ecommerce/B2C/DeveloperUnitDetails.jsx#L31)
  - [DeveloperEditUnit.jsx](src/components/ecommerce/B2C/DeveloperEditUnit.jsx#L28)

---

## 2. PATTERN ANALYSIS

### Query Parameters for Single Property Lookups
```
GET /properties/inventory?propertyId={id}
```
- Used when querying inventory with property ID filter
- **Files**:
  - [CreateAgentLead.jsx](src/components/Grid/GridAgent/CreateAgentLead.jsx#L411)
  - [Dealrecordspage.jsx](src/components/Grid/GridAdmin.jsx/Dealrecordspage.jsx#L705)
  - [GridAdvisorLeadDetail.jsx](src/components/Grid/AdvisorGrid/GridAdvisorLeadDetail.jsx#L934)

---

## 3. LIST ENDPOINTS (Multiple Properties)

### Base Properties List
```
GET /properties
GET /properties?page={page}&limit={limit}&approvalStatus={status}
```
- **Files**:
  - [AgentProjectDetails.jsx](src/components/Grid/GridAgent/AgentProjectDetails.jsx#L820)
  - [Dealrecordspage.jsx](src/components/Grid/GridAdmin.jsx/Dealrecordspage.jsx#L661)

### Public Properties
```
GET /properties/public
```
- **Files**:
  - [CreateAgentLead.jsx](src/components/Grid/GridAgent/CreateAgentLead.jsx#L390)

### Filtered Properties Search
```
GET /properties?search={query}&limit=8&approvalStatus=approved&listingStatus=active
```
- **Files**:
  - [GridAdvisorLeadDetail.jsx](src/components/Grid/AdvisorGrid/GridAdvisorLeadDetail.jsx#L1614)

### All Properties (Unfiltered)
```
GET /property/get-all-properties?limit=1000
```
- **Files**:
  - [AgentLeadCreated.jsx](src/components/ecommerce/B2C/AgentLeadCreated.jsx#L93)

### Property Leads
```
GET /property/lead?page={page}&limit={limit}
GET /property/lead (with params)
```
- **Files**:
  - [Adminleadlist.jsx](src/component/Rent/Adminleadlist.jsx#L150)
  - [PropertyLeads.jsx](src/components/CMS/pages/dashboardPages/consult/PropertyLeads.jsx#L87)

---

## 4. ADMIN SECTION - CONFIRMED ENDPOINTS

### Admin Property Detail Page Endpoint
**Location**: [src/components/CMS/pages/Adminpropertydetails.jsx](src/components/CMS/pages/Adminpropertydetails.jsx)

**Fetching Single Property**:
```javascript
const json = await apiService.get(`/properties/${id}`);
setProperty(json?.data || null);
```
- **Line**: 59
- **Endpoint**: `GET /properties/{id}`
- **Response Format**: `{ data: {...} }` or direct object

### Admin Actions on Properties
```
PATCH /properties/{id}/approve
PATCH /properties/{id}/reject
PATCH /properties/{id}/request-changes
PUT /properties/{id}/approve
PUT /properties/{id}/reject
PUT /properties/{id}/hot
PATCH /properties/{id}/toggle-status
DELETE /properties/{id}
```

**Files Using These**:
- [Adminpropertydetails.jsx](src/components/CMS/pages/Adminpropertydetails.jsx) - Approve, Reject
- [Propertydetailpage.jsx](src/components/CMS/pages/Propertydetailpage.jsx#L209-L238) - Full CRUD operations
- [Propertymanagement.jsx](src/components/CMS/pages/Properties/Propertymanagement.jsx#L440) - Reject
- [ApprovalQueue.jsx](src/components/CMS/pages/Properties/ApprovalQueue.jsx#L357) - Request changes

---

## 5. KEY PATTERN OBSERVATIONS

### Inconsistent HTTP Methods
⚠️ **Issue Found**: Different files use different HTTP methods for the SAME endpoint:
- `PUT /properties/{id}/approve` vs `PATCH /properties/{id}/approve`
- `PUT /properties/{id}/reject` vs `PATCH /properties/{id}/reject`

**Affected Files**:
- [Adminpropertydetails.jsx](src/components/CMS/pages/Adminpropertydetails.jsx#L79) uses `PATCH`
- [Propertydetailpage.jsx](src/components/CMS/pages/Propertydetailpage.jsx#L209) uses `PUT`

### Inconsistent Response Formats
- Some endpoints return `{ data: {...} }`
- Others return the object directly
- [Adminpropertydetails.jsx](src/components/CMS/pages/Adminpropertydetails.jsx#L59) handles both: `json?.data || null`

### Inconsistent Endpoint Naming
- `/properties/{id}` vs `/property/{id}` (plural vs singular)
- Both are used throughout the codebase

---

## 6. RECOMMENDED ENDPOINT FOR ADMIN PROPERTY DETAILS

Based on analysis of the Admin CMS section:

### **PRIMARY ENDPOINT**: `GET /properties/{id}`
- **Location**: Used in [Adminpropertydetails.jsx](src/components/CMS/pages/Adminpropertydetails.jsx#L59)
- **Route**: `/dashboard/admin/properties/:id`
- **Response**: `{ data: propertyObject }` or `propertyObject`
- **Full Context**:
  ```javascript
  const json = await apiService.get(`/properties/${id}`);
  setProperty(json?.data || json);
  ```

### **Fallback/Alternative**: `GET /property/{id}`
- Used in some newer components
- May be deprecated or module-specific

---

## 7. COMPLETE FILE USAGE MATRIX

| Endpoint | File | Module | Purpose |
|----------|------|--------|---------|
| `/properties/{id}` | Adminpropertydetails.jsx | **ADMIN CMS** | Fetch property for approval/review |
| `/properties/{id}` | Propertydetailpage.jsx | Rental | Fetch rental property details |
| `/properties/{id}` | AgentProjectDetails.jsx | Grid Agent | Fetch agent project details |
| `/property/{id}` | GridAgentLeadDetail.jsx | Grid Agent | Quick property fetch |
| `/property/{id}` | GridAdvisorLeadDetail.jsx | Grid Advisor | Quick property fetch |
| `/property/listing/{id}` | PlatformLeads.jsx | Grid Admin | Fetch listing by ID |
| `/properties/inventory/{id}` | DeveloperUnitDetails.jsx | B2C | Fetch unit inventory |
| `/property/lead` | Adminleadlist.jsx | Rent Admin | Fetch property leads list |

---

## 8. NOTES

✅ **Confirmed**: The primary endpoint `GET /properties/{id}` is used across all major property detail pages
✅ **Admin Specific**: [Adminpropertydetails.jsx](src/components/CMS/pages/Adminpropertydetails.jsx) is the definitive admin property detail page
⚠️ **Inconsistency**: HTTP methods vary (PUT vs PATCH) for the same endpoints
⚠️ **Naming Inconsistency**: Both `/properties/{id}` and `/property/{id}` are used in production code
