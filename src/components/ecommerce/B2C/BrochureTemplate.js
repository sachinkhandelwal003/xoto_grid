// BrochureTemplate.js - Complete HTML brochure generator with all property details

// Format helpers
const formatPrice = (price, currency = 'AED') => {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const formatDate = (dateString) => {
  if (!dateString) return 'TBA';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Language translations
const translations = {
  EN: {
    presenting: 'PRESENTING',
    by: 'BY',
    dateOfCreation: 'Date of creation',
    aboutProject: 'About The Project',
    developer: 'Developer',
    unitPrices: 'Units & Availability',
    paymentPlan: 'Payment Plan',
    location: 'Location',
    features: 'Features & Amenities',
    onBooking: 'On Booking',
    duringConstruction: 'During Construction',
    uponHandover: 'Upon Handover',
    bedroom: 'Bedroom',
    bedrooms: 'Bedrooms',
    price: 'Price',
    area: 'Area',
    handover: 'Handover',
    propertyType: 'Property Type',
    status: 'Status',
    unitType: 'Unit Type',
    preparedFor: 'Prepared exclusively for',
    propertyId: 'Property ID',
    developerInfo: 'Developer Information',
    completedProjects: 'Completed Projects',
    yearEstablished: 'Year Established',
    reraNumber: 'RERA Number'
  },
  AR: {
    presenting: 'تقديم',
    by: 'بواسطة',
    dateOfCreation: 'تاريخ الإنشاء',
    aboutProject: 'عن المشروع',
    developer: 'المطور',
    unitPrices: 'الوحدات والتوفر',
    paymentPlan: 'خطة الدفع',
    location: 'الموقع',
    features: 'الميزات ووسائل الراحة',
    onBooking: 'عند الحجز',
    duringConstruction: 'أثناء البناء',
    uponHandover: 'عند التسليم',
    bedroom: 'غرفة نوم',
    bedrooms: 'غرف نوم',
    price: 'السعر',
    area: 'المساحة',
    handover: 'التسليم',
    propertyType: 'نوع العقار',
    status: 'الحالة',
    unitType: 'نوع الوحدة',
    preparedFor: 'أعدت خصيصا ل',
    propertyId: 'رقم العقار',
    developerInfo: 'معلومات المطور',
    completedProjects: 'المشاريع المنجزة',
    yearEstablished: 'عام التأسيس',
    reraNumber: 'رقم ريرا'
  }
};

// Main brochure HTML generator function
export const generateBrochureHTML = (property, lead, preferences, customDescription) => {
  const lang = preferences.language;
  const t = translations[lang] || translations.EN;
  
  const selectedSlides = preferences.slides;
  const currency = preferences.currency;
  const areaUnit = preferences.areaUnit;
  
  // Property details
  const price = formatPrice(property?.price || 0, currency);
  const handoverDate = formatDate(property?.handover);
  const mainImage = property?.photos?.[0] || property?.mainLogo || 'https://via.placeholder.com/1200x800?text=Property+Image';
  const developerName = property?.developer?.name || 'Developer';
  const propertyName = property?.propertyName || 'Property';
  const description = customDescription || property?.description || 'No description available.';
  
  // Developer details
  const developer = property?.developer || {};
  const developerLogo = developer?.logo || '';
  const developerEmail = developer?.email || '';
  const developerPhone = developer?.phone_number || '';
  const developerRera = developer?.reraNumber || '';
  const developerAddress = `${developer?.address || ''}, ${developer?.city || ''}, ${developer?.country || ''}`;
  
  // Get unit types
  const unitTypes = property?.unitType?.length > 0 
    ? property.unitType 
    : property?.bedrooms ? [`${property.bedrooms} ${t.bedroom}`] : ['Standard Unit'];

  // Get amenities
  const amenities = property?.amenities?.length > 0 
    ? property.amenities 
    : [
        'Infinity Pool', 'State-of-the-art Gym', 'Spa & Sauna',
        'Children\'s Play Area', 'Landscaped Gardens', '24/7 Security',
        'Covered Parking', 'Concierge Service', 'BBQ Areas'
      ];

  // Location
  const fullAddress = `${property?.area || ''}, ${property?.city || 'Dubai'}, ${property?.country || 'UAE'}`;
  
  // Payment plan
  const downPayment = property?.downPayment || 20;
  const constructionPayment = property?.paymentPlan_initialPercentage || 40;
  const handoverPayment = property?.paymentPlan_laterPercentage || 40;

  // Direction based on language
  const direction = lang === 'AR' ? 'rtl' : 'ltr';

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${direction}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${propertyName} - Property Brochure</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: ${lang === 'AR' ? 'Tajawal, ' : ''} 'Helvetica', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        .brochure {
            max-width: 1200px;
            margin: 0 auto;
        }
        .page {
            page-break-after: always;
            min-height: 100vh;
            position: relative;
        }
        
        /* Cover Page */
        .cover {
            height: 100vh;
            position: relative;
            background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${mainImage}');
            background-size: cover;
            background-position: center;
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 40px;
        }
        .cover-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .cover-logo {
            font-size: 24px;
            font-weight: bold;
            color: #c9a05e;
        }
        .cover-developer {
            font-size: 14px;
            opacity: 0.9;
        }
        .cover-center {
            text-align: center;
        }
        .cover-pre-title {
            font-size: 14px;
            letter-spacing: 4px;
            margin-bottom: 20px;
            opacity: 0.8;
        }
        .cover-title {
            font-size: 72px;
            font-weight: 800;
            text-transform: uppercase;
            line-height: 1.1;
            margin-bottom: 20px;
        }
        .cover-subtitle {
            font-size: 32px;
            letter-spacing: 6px;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        .cover-date {
            font-size: 14px;
            opacity: 0.6;
        }
        .cover-bottom {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .cover-agent {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .cover-agent-info h3 {
            font-size: 18px;
            margin-bottom: 5px;
        }
        .cover-agent-info p {
            font-size: 12px;
            opacity: 0.8;
        }
        .cover-website {
            font-size: 18px;
            font-weight: bold;
            color: #c9a05e;
        }

        /* Content Pages */
        .content-page {
            padding: 60px 40px;
        }
        .section-title {
            font-size: 36px;
            font-weight: 800;
            color: #111;
            margin-bottom: 30px;
            border-bottom: 3px solid #c9a05e;
            padding-bottom: 15px;
            display: inline-block;
        }
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
        }
        .info-card {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px solid #dee2e6;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #666;
        }
        .info-value {
            font-weight: 700;
            color: #c9a05e;
        }
        
        /* Developer Card */
        .developer-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 20px;
            margin: 30px 0;
        }
        .developer-logo {
            max-width: 150px;
            max-height: 80px;
            object-fit: contain;
            margin-bottom: 20px;
            background: white;
            padding: 10px;
            border-radius: 10px;
        }
        
        /* Table Styles */
        .table-container {
            margin: 30px 0;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            overflow: hidden;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            background: #111;
            color: white;
            padding: 15px;
            text-align: left;
            font-size: 14px;
        }
        td {
            padding: 15px;
            border-bottom: 1px solid #e5e5e5;
        }
        tr:last-child td {
            border-bottom: none;
        }
        
        /* Amenities Grid */
        .amenities-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        .amenity-item {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            font-weight: 500;
            transition: transform 0.3s;
        }
        .amenity-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        /* Payment Plan */
        .payment-plan {
            background: #111;
            color: white;
            padding: 40px;
            border-radius: 20px;
            margin: 30px 0;
        }
        .payment-row {
            display: flex;
            justify-content: space-between;
            padding: 20px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            font-size: 18px;
        }
        .payment-total {
            font-size: 48px;
            font-weight: bold;
            color: #c9a05e;
            text-align: center;
            margin-top: 30px;
        }
        
        /* Location Map */
        .location-map {
            height: 400px;
            background: #f0f0f0;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
        }
        .map-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        
        /* Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #c9a05e;
        }
        .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        
        /* Footer */
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #dee2e6;
        }
        
        /* RTL Support */
        [dir="rtl"] .info-row {
            flex-direction: row-reverse;
        }
        [dir="rtl"] th {
            text-align: right;
        }
        [dir="rtl"] .cover-bottom {
            flex-direction: row-reverse;
        }
        
        @media print {
            .page {
                page-break-after: always;
            }
            .amenity-item {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="brochure">
        ${selectedSlides.includes('Cover slide') ? `
        <!-- Cover Page -->
        <div class="page cover">
            <div class="cover-top">
                <div class="cover-logo">XOTO</div>
                <div class="cover-developer">${developerName}</div>
            </div>
            <div class="cover-center">
                <div class="cover-pre-title">${t.presenting}</div>
                <div class="cover-title">${propertyName}</div>
                <div class="cover-subtitle">${t.by} ${developerName}</div>
                <div class="cover-date">${t.dateOfCreation}: ${new Date().toLocaleDateString()}</div>
            </div>
            <div class="cover-bottom">
                <div class="cover-agent">
                    <div class="cover-agent-info">
                        <h3>${lead?.name?.first_name || 'Client'} ${lead?.name?.last_name || ''}</h3>
                        <p>${t.preparedFor} you</p>
                    </div>
                </div>
                <div class="cover-website">XOTO.AE</div>
            </div>
        </div>
        ` : ''}

        ${selectedSlides.includes('Project description') ? `
        <!-- Description Page -->
        <div class="page content-page">
            <h2 class="section-title">${t.aboutProject}</h2>
            
            <div class="grid-2">
                <div>
                    <p style="font-size: 16px; line-height: 1.8; margin-bottom: 20px;">${description}</p>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${property?.bedrooms || 0}</div>
                            <div class="stat-label">${t.bedrooms}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${property?.bathrooms || 0}</div>
                            <div class="stat-label">Bathrooms</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${property?.builtUpArea_min || 0}</div>
                            <div class="stat-label">${t.area} (min)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${property?.parking || 'Yes'}</div>
                            <div class="stat-label">Parking</div>
                        </div>
                    </div>
                </div>
                
                <div class="info-card">
                    <div class="info-row">
                        <span class="info-label">${t.propertyId}</span>
                        <span class="info-value">${property?._id?.slice(-6) || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">${t.handover}</span>
                        <span class="info-value">${handoverDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">${t.propertyType}</span>
                        <span class="info-value">${property?.propertyType || 'Apartment'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">${t.status}</span>
                        <span class="info-value">${property?.propertySubType || 'Off-Plan'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Reference</span>
                        <span class="info-value">${property?.reraNumber || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <h3 style="font-size: 24px; margin: 40px 0 20px;">${t.features}</h3>
            <div class="amenities-grid">
                ${amenities.slice(0, 9).map(item => `
                <div class="amenity-item">${item}</div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${selectedSlides.includes('Developer') ? `
        <!-- Developer Page -->
        <div class="page content-page">
            <h2 class="section-title">${t.developer}</h2>
            
            <div class="developer-card">
                ${developerLogo ? `
                <img src="${developerLogo}" alt="${developerName}" class="developer-logo" onerror="this.style.display='none'">
                ` : ''}
                <h3 style="font-size: 28px; margin-bottom: 20px;">${developerName}</h3>
                
                <div class="grid-3" style="margin-top: 30px;">
                    ${developerRera ? `
                    <div>
                        <div style="font-size: 14px; opacity: 0.8;">${t.reraNumber}</div>
                        <div style="font-size: 18px; font-weight: bold;">${developerRera}</div>
                    </div>
                    ` : ''}
                    ${developerEmail ? `
                    <div>
                        <div style="font-size: 14px; opacity: 0.8;">Email</div>
                        <div style="font-size: 16px;">${developerEmail}</div>
                    </div>
                    ` : ''}
                    ${developerPhone ? `
                    <div>
                        <div style="font-size: 14px; opacity: 0.8;">Phone</div>
                        <div style="font-size: 16px;">${developerPhone}</div>
                    </div>
                    ` : ''}
                </div>
                
                ${developerAddress ? `
                <div style="margin-top: 20px; font-size: 14px; opacity: 0.9;">
                    📍 ${developerAddress}
                </div>
                ` : ''}
            </div>

            <p style="font-size: 16px; line-height: 1.8; margin-top: 30px;">
                ${property?.about_developer || developer?.description || 
                `At ${developerName}, we are committed to excellence in real estate development. With a portfolio of successful projects across the UAE, we bring innovation, quality, and luxury to every development. Our team of experts ensures that each property meets the highest standards of design and construction.`}
            </p>
        </div>
        ` : ''}

        ${selectedSlides.includes('Unit prices') ? `
        <!-- Units Page -->
        <div class="page content-page">
            <h2 class="section-title">${t.unitPrices}</h2>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>${t.unitType}</th>
                            <th>${t.bedrooms}</th>
                            <th>${t.area} (${areaUnit})</th>
                            <th>${t.price}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${unitTypes.map((unit, index) => `
                        <tr>
                            <td>${property?.propertyType || 'Apartment'}</td>
                            <td>${unit}</td>
                            <td>${property?.builtUpArea_min || 0} - ${property?.builtUpArea_max || property?.builtUpArea_min || 0}</td>
                            <td><strong>${formatPrice(property?.price_min || property?.price || 0, currency)}</strong></td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 12px;">
                <p style="font-size: 14px; color: #666;">
                    * Prices are indicative and subject to change. Please contact our sales team for current availability and exact pricing.
                </p>
            </div>
        </div>
        ` : ''}

        ${selectedSlides.includes('Payment plans') ? `
        <!-- Payment Plan Page -->
        <div class="page content-page">
            <h2 class="section-title">${t.paymentPlan}</h2>
            
            <div class="payment-plan">
                <div class="payment-row">
                    <span>${t.onBooking}</span>
                    <span class="info-value">${downPayment}%</span>
                </div>
                <div class="payment-row">
                    <span>${t.duringConstruction}</span>
                    <span class="info-value">${constructionPayment}%</span>
                </div>
                <div class="payment-row">
                    <span>${t.uponHandover}</span>
                    <span class="info-value">${handoverPayment}%</span>
                </div>
            </div>
            
            <div class="payment-total">
                ${downPayment}/${constructionPayment}/${handoverPayment}%
            </div>

            <div style="margin-top: 40px; padding: 30px; background: #f8f9fa; border-radius: 12px;">
                <h3 style="font-size: 20px; margin-bottom: 15px;">Payment Schedule</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                        <strong>Booking Fee:</strong> ${downPayment}% of property value
                    </li>
                    <li style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
                        <strong>During Construction:</strong> ${constructionPayment}% payable in installments
                    </li>
                    <li style="padding: 10px 0;">
                        <strong>On Handover:</strong> ${handoverPayment}% final payment
                    </li>
                </ul>
            </div>
        </div>
        ` : ''}

        ${selectedSlides.includes('Location') ? `
        <!-- Location Page -->
        <div class="page content-page">
            <h2 class="section-title">${t.location}</h2>
            
            <div style="margin-bottom: 30px;">
                <h3 style="font-size: 24px; margin-bottom: 10px;">${propertyName}</h3>
                <p style="font-size: 18px; color: #666;">
                    <strong>📍 ${fullAddress}</strong>
                </p>
            </div>

            <div class="location-map">
                <iframe
                    width="100%"
                    height="100%"
                    style="border:0; filter: invert(90%);"
                    loading="lazy"
                    allowfullscreen
                    referrerpolicy="no-referrer-when-downgrade"
                    src="https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&t=m&z=15&output=embed">
                </iframe>
                <div class="map-overlay">
                    <div style="background: rgba(0,0,0,0.7); padding: 20px 40px; border-radius: 50px;">
                        📍 ${property?.area || 'Prime Location'}
                    </div>
                </div>
            </div>

            <div class="grid-3" style="margin-top: 40px;">
                <div class="info-card">
                    <h4 style="margin-bottom: 15px;">Nearby Attractions</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="padding: 8px 0;">• Dubai Mall (15 min)</li>
                        <li style="padding: 8px 0;">• Burj Khalifa (15 min)</li>
                        <li style="padding: 8px 0;">• Dubai Marina (10 min)</li>
                    </ul>
                </div>
                <div class="info-card">
                    <h4 style="margin-bottom: 15px;">Transportation</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="padding: 8px 0;">• Metro Station (5 min)</li>
                        <li style="padding: 8px 0;">• Major Highways (2 min)</li>
                        <li style="padding: 8px 0;">• Airport (20 min)</li>
                    </ul>
                </div>
                <div class="info-card">
                    <h4 style="margin-bottom: 15px;">Education</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="padding: 8px 0;">• International Schools</li>
                        <li style="padding: 8px 0;">• Universities</li>
                        <li style="padding: 8px 0;">• Nurseries</li>
                    </ul>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Footer on all pages -->
        <div class="footer">
            <p>${t.preparedFor} ${lead?.name?.first_name || 'Client'} ${lead?.name?.last_name || ''} • ${new Date().toLocaleString()}</p>
            <p style="margin-top: 5px;">${propertyName} • ${developerName} • XOTO.AE</p>
            <button onclick="window.print()" style="
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background: black;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
">
  Download PDF
</button>
        </div>
    </div>
</body>
</html>`;
};