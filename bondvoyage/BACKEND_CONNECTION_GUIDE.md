# 🚀 BondVoyage Frontend to Backend Connection Guide

This comprehensive guide will walk you through connecting your BondVoyage React Native frontend to your blockchain-based backend API.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend API Requirements](#backend-api-requirements)
3. [Frontend Configuration](#frontend-configuration)
4. [Environment Setup](#environment-setup)
5. [API Endpoint Integration](#api-endpoint-integration)
6. [Authentication Setup](#authentication-setup)
7. [Testing the Connection](#testing-the-connection)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

---

## 📚 Prerequisites

### Backend Requirements

- ✅ Backend server running on Node.js/Express
- ✅ Blockchain integration (Hyperledger Fabric/Ethereum)
- ✅ MongoDB/Database setup
- ✅ CORS enabled for React Native requests
- ✅ SSL certificate for production (HTTPS)

### Frontend Requirements

- ✅ React Native with Expo SDK 51+
- ✅ All dependencies installed (see package.json)
- ✅ Development environment set up

### Network Requirements

- ✅ Backend server accessible from mobile device
- ✅ Same network for development (or proper port forwarding)
- ✅ Firewall configured to allow API requests

---

## 🔧 Backend API Requirements

Your backend must implement these endpoints according to the API documentation:

### Core Endpoints

```bash
POST /api/blockchain/initialize           # Initialize blockchain
POST /api/blockchain/tourist/register     # Tourist KYC registration
POST /api/blockchain/itinerary/anchor     # Anchor travel itinerary
POST /api/blockchain/event/panic          # Emergency panic events
POST /api/blockchain/tourist/{id}/consent # Consent management
POST /api/blockchain/access/grant         # Access permissions
POST /api/blockchain/verify/event         # Event verification
DELETE /api/blockchain/tourist/{id}       # GDPR data deletion
```

### Required Headers

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>",
  "Accept": "application/json"
}
```

### CORS Configuration

Your backend needs CORS configured for React Native:

```javascript
// Express.js example
const cors = require("cors");

app.use(
  cors({
    origin: ["http://localhost:8081", "exp://localhost:8081"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
```

---

## ⚙️ Frontend Configuration

### Step 1: Update API Base URL

Edit `lib/api.ts` and update the base URL:

```typescript
// lib/api.ts
const API_BASE_URL = "http://YOUR_BACKEND_IP:3000/api/blockchain";

// Examples:
// Local development: 'http://192.168.1.100:3000/api/blockchain'
// Local machine: 'http://10.0.2.2:3000/api/blockchain' (Android emulator)
// Production: 'https://your-domain.com/api/blockchain'
```

### Step 2: Configure Network Security (Android)

Add network security config for development in `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">YOUR_BACKEND_IP</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

### Step 3: Update Android Manifest

In `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="true">
    <!-- ... other config ... -->
</application>
```

---

## 🌐 Environment Setup

### Development Environment

1. **Find Your Backend IP Address:**

   ```bash
   # Windows
   ipconfig

   # macOS/Linux
   ifconfig

   # Look for your local network IP (usually 192.168.x.x or 10.0.x.x)
   ```

2. **Ensure Backend is Running:**

   ```bash
   # Start your backend server
   cd your-backend-folder
   npm start

   # Verify it's accessible
   curl http://YOUR_IP:3000/api/blockchain/initialize
   ```

3. **Test Network Connectivity:**

   ```bash
   # From your development machine
   ping YOUR_BACKEND_IP

   # Test API endpoint
   curl -X POST http://YOUR_BACKEND_IP:3000/api/blockchain/initialize
   ```

### Mobile Device Setup

1. **Connect to Same Network:**
   - Ensure your mobile device/emulator is on the same WiFi network
   - For Android emulator, use `10.0.2.2` instead of `localhost`

2. **Allow HTTP Traffic (Development Only):**
   - iOS: Automatic in development
   - Android: Configured via network security config above

---

## 🔗 API Endpoint Integration

### Tourist Registration Integration

The frontend sends KYC data to your backend:

```typescript
// Frontend sends this data structure
const registrationData: TouristRegistrationData = {
  touristId: "T-GENERATED-ID",
  name: "John Doe",
  nationality: "American",
  passportNumber: "US123456789",
  kycDocuments: {
    passport: "base64_encoded_passport_scan",
    visa: "base64_encoded_visa_scan",
    photo: "base64_encoded_photo"
  }
};

// Your backend should respond with:
{
  "touristId": "T-GENERATED-ID",
  "blockchainRecord": { "id": "tx_abcd1234" },
  "kycStorage": {
    "storageKey": "kyc/T-GENERATED-ID/document.json",
    "documentHash": "sha256_hash",
    "timestamp": "2025-09-22T12:34:56.789Z"
  }
}
```

### Panic Event Integration

Emergency alerts send this data:

```typescript
// Frontend panic data
const panicData: PanicEventData = {
  touristId: "T-USER-ID",
  location: { lat: 26.9124, lon: 75.7873 },
  deviceId: "D-PHONE-001",
  source: "phone",
  panicType: "manual",
  additionalData: {
    batteryLevel: 45,
    networkStrength: "good",
    nearbyDevices: 2,
    lastKnownActivity: "walking"
  }
};

// Expected backend response:
{
  "eventId": "EVT_12345",
  "blockchainRecord": { "id": "tx_event123" },
  "eventStorage": {
    "storageKey": "events/T-USER-ID/event.json",
    "payloadHash": "sha256_hash",
    "timestamp": "2025-09-22T12:40:00.000Z"
  }
}
```

---

## 🔐 Authentication Setup

### Token Management

The frontend uses AsyncStorage for token management:

```typescript
// Token is stored as tourist ID
await apiService.setAuthToken(touristId);

// Tokens are sent in headers
headers: {
  'Authorization': `Bearer ${touristId}`,
  'Content-Type': 'application/json'
}
```

### Backend Token Validation

Your backend should validate tokens:

```javascript
// Express.js middleware example
const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Validate token (tourist ID format)
  if (!token.startsWith("T-")) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  req.touristId = token;
  next();
};
```

---

## 🧪 Testing the Connection

### Step 1: Enable Demo Mode First

Test without backend dependency:

```typescript
// In your app, press "Demo" button to test all features
// This creates a demo user with mock API responses
```

### Step 2: Test Backend Connection

1. **Update API URL:**

   ```typescript
   // lib/api.ts
   const API_BASE_URL = "http://192.168.1.100:3000/api/blockchain";
   ```

2. **Test Registration:**
   - Fill out registration form
   - Upload sample documents
   - Submit and check backend logs

3. **Test Emergency Features:**
   - Press panic button
   - Verify backend receives panic event
   - Check blockchain transaction

4. **Test Location Services:**
   - Grant location permissions
   - Verify current location updates
   - Test safe zone detection

### Step 3: Verify Backend Responses

Check your backend logs for incoming requests:

```bash
# Expected log entries
POST /api/blockchain/tourist/register - 200 OK
POST /api/blockchain/event/panic - 200 OK
POST /api/blockchain/itinerary/anchor - 200 OK
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. **Network Connection Failed**

```
Error: Network request failed
```

**Solutions:**

- ✅ Check if backend server is running
- ✅ Verify IP address is correct
- ✅ Ensure device is on same network
- ✅ Check firewall settings
- ✅ Use `10.0.2.2` for Android emulator

#### 2. **CORS Errors**

```
Error: CORS policy blocked request
```

**Solutions:**

- ✅ Configure CORS in backend
- ✅ Add React Native origins
- ✅ Enable credentials if needed

#### 3. **SSL Certificate Issues**

```
Error: Certificate verification failed
```

**Solutions:**

- ✅ Use HTTP for development
- ✅ Add SSL certificate to backend
- ✅ Configure network security for Android

#### 4. **Invalid Response Format**

```
Error: Unexpected token in JSON
```

**Solutions:**

- ✅ Check backend response format
- ✅ Ensure JSON content-type header
- ✅ Verify API endpoint paths

#### 5. **Location Permission Issues**

```
Error: Location permission denied
```

**Solutions:**

- ✅ Grant location permissions in device settings
- ✅ Check app.json for location permissions
- ✅ Test on physical device if emulator fails

### Debug Mode

Enable debug logging:

```typescript
// lib/api.ts - Add console logs
console.log("API Request:", endpoint, options);
console.log("API Response:", response);
```

### Network Debugging

Use network inspection tools:

```bash
# Monitor network traffic
npx react-native log-android  # Android logs
npx react-native log-ios      # iOS logs

# Or use Flipper for network inspection
```

---

## 🚀 Production Deployment

### Backend Production Setup

1. **HTTPS Configuration:**

   ```typescript
   // Update API URL for production
   const API_BASE_URL = "https://your-domain.com/api/blockchain";
   ```

2. **Environment Variables:**

   ```typescript
   // Use environment-specific configs
   const API_BASE_URL = __DEV__
     ? "http://192.168.1.100:3000/api/blockchain"
     : "https://your-domain.com/api/blockchain";
   ```

3. **Security Headers:**
   ```javascript
   // Backend security headers
   app.use(helmet());
   app.use(compression());
   ```

### Frontend Production Build

1. **Remove Debug Code:**

   ```typescript
   // Remove console.logs and debug code
   // Disable demo mode for production
   ```

2. **Build Production APK/IPA:**
   ```bash
   # Build for production
   eas build --platform android --profile production
   eas build --platform ios --profile production
   ```

### Security Considerations

1. **API Security:**
   - ✅ Use HTTPS in production
   - ✅ Implement proper authentication
   - ✅ Rate limiting on API endpoints
   - ✅ Input validation and sanitization

2. **Mobile Security:**
   - ✅ Certificate pinning for API calls
   - ✅ Secure storage for sensitive data
   - ✅ Code obfuscation for production builds

---

## 📊 Monitoring and Analytics

### Backend Monitoring

- ✅ API response times
- ✅ Error rates and logs
- ✅ Blockchain transaction status
- ✅ Database performance

### Frontend Monitoring

- ✅ Crash reporting (Sentry)
- ✅ Performance monitoring
- ✅ User analytics (opt-in only)
- ✅ Network request tracking

---

## 📞 Support and Resources

### Documentation Links

- [React Native Networking](https://reactnative.dev/docs/network)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

### Common Commands

```bash
# Reset Metro bundler cache
npx react-native start --reset-cache

# Clear app data (Android)
adb shell pm clear com.yourapp.package

# View device logs
npx react-native log-android
npx react-native log-ios
```

### Getting Help

- Check backend API documentation
- Test endpoints with Postman/curl
- Review network logs in debugger
- Enable verbose logging for troubleshooting

---

## ✅ Connection Checklist

Before going live, ensure:

- [ ] Backend server is running and accessible
- [ ] API endpoints return correct response format
- [ ] CORS is properly configured
- [ ] Authentication tokens work correctly
- [ ] Location services function properly
- [ ] Emergency features are tested
- [ ] File upload (KYC documents) works
- [ ] Database transactions are successful
- [ ] Blockchain integration is functional
- [ ] Error handling works as expected
- [ ] Production URLs are configured
- [ ] SSL certificates are valid
- [ ] Performance is acceptable
- [ ] Security measures are in place

---

## 🎉 Success!

Once connected, your BondVoyage app will:

- ✅ Register tourists with blockchain KYC
- ✅ Send real emergency alerts
- ✅ Track location for safety
- ✅ Anchor travel itineraries on blockchain
- ✅ Manage privacy consents
- ✅ Provide secure digital identity

Your frontend is now fully connected to the backend! 🚀

---

_For additional support or questions, refer to the backend API documentation or contact your development team._
