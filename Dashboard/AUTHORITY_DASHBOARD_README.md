# Authority Dashboard - Backend API Integration

## Overview
The Authority Dashboard has been completely redesigned to integrate with your blockchain-based backend API from `backend_api.md`. It provides comprehensive tourist safety monitoring, emergency response capabilities, and blockchain verification tools for authorities.

## Key Features

### 1. Real-time Dashboard Analytics
- **Total Tourists**: Shows registered tourist count
- **Active Tourists**: Currently online/active tourists
- **Active Alerts**: Live panic events requiring attention
- **Response Time**: Average emergency response time
- **Safe Zones**: Number of monitored geographical areas

### 2. Panic Event Management
- **Live Panic Events**: Real-time display of panic button activations
- **Priority-based Alerts**: Color-coded by urgency (high/medium/low)
- **Emergency Response**: One-click response dispatch
- **Event Verification**: Blockchain integrity verification
- **E-FIR Filing**: Electronic First Information Reports

### 3. Tourist Lookup & Verification
- **ID Lookup**: Search by Tourist ID or Passport Number
- **Blockchain Verification**: Verify tourist identity from blockchain
- **Location Tracking**: Current location with privacy compliance
- **Safety Scoring**: Real-time safety assessment

### 4. E-FIR (Electronic First Information Report)
- **Incident Documentation**: Comprehensive incident reporting
- **Blockchain Storage**: Immutable report storage
- **Multi-field Support**: Incident type, description, actions taken
- **Status Tracking**: Investigation progress tracking

### 5. GDPR Compliance
- **Data Deletion**: Tourist data removal (GDPR compliance)
- **Blockchain Preservation**: Hash preservation for integrity
- **Consent Management**: Privacy consent controls

## Backend API Integration

### Core Endpoints Used

#### 1. Tourist Lookup
```typescript
// Simulated endpoint (would be real in production)
await authorityAPI.lookupTourist(query: string)
```

#### 2. E-FIR Filing
```typescript
POST /api/blockchain/efir/file
```
**Payload:**
```json
{
  "eventId": "EVT_12345",
  "touristId": "T-DEMO-12345",
  "policeStation": "Jaipur City Police Station",
  "officerId": "OFF-JP-001",
  "reportDetails": {
    "incidentType": "Tourist in distress",
    "description": "Detailed incident description",
    "actionTaken": "Response actions taken",
    "status": "resolved"
  }
}
```

#### 3. Emergency Access Grant
```typescript
POST /api/blockchain/access/grant
```
**Payload:**
```json
{
  "touristId": "T-DEMO-12345",
  "targetOrg": "EMERGENCY_AUTHORITY_001",
  "scope": ["location", "identity", "emergency_contacts"],
  "expiryHours": 24
}
```

#### 4. Event Integrity Verification
```typescript
POST /api/blockchain/verify/event
```
**Payload:**
```json
{
  "eventId": "EVT_12345",
  "originalPayload": {
    "type": "panic",
    "touristId": "T-DEMO-12345",
    "location": {"lat": 26.9124, "lon": 75.7873},
    "panicType": "manual",
    "timestamp": "2025-09-20T12:45:00.000Z"
  }
}
```

#### 5. Tourist Data Deletion (GDPR)
```typescript
DELETE /api/blockchain/tourist/{touristId}
```

### API Configuration

**Base URL:** `http://localhost:3000/api/blockchain`

**Authentication:** 
- Uses Bearer token authentication
- Current demo token: `authority_demo_token`
- Update in `src/lib/api/authorityApi.ts` for production

## User Workflows

### 1. Emergency Response Workflow
1. **Panic Alert Received** → Dashboard shows active panic event
2. **Authority Reviews** → Location and tourist details displayed
3. **Emergency Response** → Click "Respond" to dispatch help
4. **Access Granted** → Automatic emergency access to tourist data
5. **Investigation** → Event status updated to "investigating"
6. **E-FIR Filing** → Complete incident report filed
7. **Resolution** → Event marked as resolved

### 2. Tourist Verification Workflow
1. **Search Query** → Enter Tourist ID or Passport Number
2. **Blockchain Lookup** → System queries blockchain records
3. **Identity Verification** → Tourist details retrieved and displayed
4. **Location Access** → Current location shown (if consented)
5. **Safety Assessment** → Safety score and status displayed

### 3. E-FIR Filing Workflow
1. **Event Selection** → Choose panic event for reporting
2. **Form Completion** → Fill incident details and actions taken
3. **Blockchain Filing** → E-FIR stored immutably on blockchain
4. **Confirmation** → Unique E-FIR ID generated and displayed

## Components Structure

### Main Files
- `src/pages/AuthorityDashboard.tsx` - Main dashboard component
- `src/lib/api/authorityApi.ts` - Backend API integration utility

### Key Components
- **Dashboard Stats Cards** - Real-time metrics display
- **Panic Events Panel** - Active emergency management
- **Tourist Lookup Panel** - Identity verification interface
- **E-FIR Modal** - Incident reporting form
- **Tourist List** - Recent registrations with GDPR controls

## Security Features

### 1. Access Control
- Role-based access to tourist data
- Time-limited emergency access grants
- Audit trail for all data access

### 2. Privacy Compliance
- GDPR-compliant data deletion
- Consent-based location sharing
- Anonymized map views

### 3. Data Integrity
- Blockchain verification of all events
- Immutable incident reports
- Cryptographic hash validation

## Configuration

### Environment Variables
```env
REACT_APP_API_BASE_URL=http://localhost:3000/api/blockchain
REACT_APP_AUTHORITY_TOKEN=your_authority_token_here
```

### API Token Configuration
Update the authority token in `src/lib/api/authorityApi.ts`:
```typescript
// Replace demo token with actual authority authentication
authorityAPI.setAuthToken('your_real_authority_token');
```

## Error Handling

### Network Errors
- Automatic retry mechanisms
- User-friendly error messages
- Fallback to cached data when possible

### Validation Errors
- Real-time form validation
- Required field highlighting
- Contextual error messages

### API Errors
- HTTP status code handling
- Detailed error logging
- Graceful degradation

## Testing

### Manual Testing Scenarios
1. **Dashboard Load** - Verify all metrics load correctly
2. **Tourist Lookup** - Test with valid/invalid IDs
3. **Emergency Response** - Simulate panic event handling
4. **E-FIR Filing** - Complete full incident report workflow
5. **Data Deletion** - Test GDPR compliance features

### API Testing
- Ensure backend is running on `localhost:3000`
- Test all endpoints with proper authentication
- Verify blockchain storage and retrieval

## Production Deployment

### Backend Requirements
1. Blockchain node operational
2. All API endpoints from `backend_api.md` implemented
3. Proper authentication and authorization
4. CORS configuration for frontend domain

### Frontend Configuration
1. Update API base URL for production
2. Configure real authentication tokens
3. Set up proper error monitoring
4. Enable production optimizations

## Monitoring and Analytics

### Key Metrics to Track
- Response times to panic events
- Tourist lookup success rates
- E-FIR filing completion rates
- System uptime and availability
- Blockchain verification success rates

### Logging
- All API calls logged with timestamps
- User actions tracked for audit
- Error rates monitored
- Performance metrics collected