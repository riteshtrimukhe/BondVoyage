# 📘 Tourist Safety System – API Documentation

Base URL:

```
http://localhost:3000/api/blockchain
```

All endpoints expect:

- `Authorization: Bearer <token>` header
- `Content-Type: application/json`

---

## 1. Initialize Blockchain

**Endpoint:**

```
POST /initialize
```

**Request Body:**
_None_

**Response Example:**

```json
{
  "success": true,
  "message": "Blockchain initialized successfully"
}
```

---

## 2. Register Tourist (KYC)

**Endpoint:**

```
POST /tourist/register
```

**Request Body:**

```json
{
  "touristId": "T-DEMO-12345",
  "name": "Alice Johnson",
  "nationality": "American",
  "passportNumber": "US123456789",
  "kycDocuments": {
    "passport": "base64_encoded_passport_scan",
    "visa": "base64_encoded_visa_scan",
    "photo": "base64_encoded_photo"
  }
}
```

**Response Example:**

```json
{
  "touristId": "T-DEMO-12345",
  "blockchainRecord": { "id": "tx_abcd1234" },
  "kycStorage": {
    "storageKey": "kyc/T-DEMO-12345/document.json",
    "documentHash": "sha256_abcdxyz",
    "timestamp": "2025-09-20T12:34:56.789Z"
  }
}
```

---

## 3. Anchor Itinerary

**Endpoint:**

```
POST /itinerary/anchor
```

**Request Body:**

```json
{
  "touristId": "T-DEMO-12345",
  "startDate": "2025-09-25",
  "endDate": "2025-09-30",
  "locations": ["Jaipur", "Udaipur"],
  "activities": ["City Palace tour", "Desert safari"],
  "accommodations": ["Hotel Raj Palace - Jaipur", "Lake Palace - Udaipur"]
}
```

**Response Example:**

```json
{
  "itineraryId": "ITIN_12345",
  "blockchainRecord": { "id": "tx_efgh5678" },
  "itineraryStorage": {
    "storageKey": "itineraries/T-DEMO-12345/itinerary.json",
    "itineraryHash": "sha256_itinxyz"
  }
}
```

---

## 4. Panic Event

**Endpoint:**

```
POST /event/panic
```

**Request Body:**

```json
{
  "touristId": "T-DEMO-12345",
  "location": { "lat": 26.9124, "lon": 75.7873 },
  "deviceId": "D-PHONE-001",
  "source": "phone",
  "panicType": "manual",
  "additionalData": {
    "batteryLevel": 45,
    "networkStrength": "good",
    "nearbyDevices": 2,
    "lastKnownActivity": "walking"
  }
}
```

**Response Example:**

```json
{
  "eventId": "EVT_12345",
  "blockchainRecord": { "id": "tx_event123" },
  "eventStorage": {
    "storageKey": "events/T-DEMO-12345/event.json",
    "payloadHash": "sha256_eventhash",
    "timestamp": "2025-09-20T12:40:00.000Z"
  }
}
```

---

## 5. File E-FIR

**Endpoint:**

```
POST /efir/file
```

**Request Body:**

```json
{
  "eventId": "EVT_12345",
  "touristId": "T-DEMO-12345",
  "policeStation": "Jaipur City Police Station",
  "officerId": "OFF-JP-001",
  "reportDetails": {
    "incidentType": "Tourist in distress",
    "description": "Tourist lost, panic button pressed.",
    "actionTaken": "Escorted to safety",
    "status": "Resolved",
    "witnesses": [],
    "evidenceCollected": ["GPS location", "Panic log"]
  },
  "attachments": ["incident_photo.jpg", "location_map.png"]
}
```

**Response Example:**

```json
{
  "efirId": "EFIR_67890",
  "blockchainRecord": { "id": "tx_efir123" },
  "efirStorage": {
    "storageKey": "efirs/T-DEMO-12345/efir.json",
    "reportHash": "sha256_efirhash"
  }
}
```

---

## 6. Update Consent

**Endpoint:**

```
POST /tourist/{touristId}/consent
```

**Request Body:**

```json
{
  "consentType": "location_sharing",
  "granted": true
}
```

**Response Example:**

```json
{
  "success": true,
  "message": "Consent updated successfully"
}
```

---

## 7. Grant Access

**Endpoint:**

```
POST /access/grant
```

**Request Body:**

```json
{
  "touristId": "T-DEMO-12345",
  "targetOrg": "FAMILY_MEMBER_001",
  "scope": ["location", "safety_status"],
  "expiryHours": 168
}
```

**Response Example:**

```json
{
  "grantId": "GRT_12345",
  "accessGrant": {
    "status": "active",
    "expiresAt": "2025-09-27T12:00:00.000Z"
  }
}
```

---

## 8. Verify Event Integrity

**Endpoint:**

```
POST /verify/event
```

**Request Body:**

```json
{
  "eventId": "EVT_12345",
  "originalPayload": {
    "type": "panic",
    "touristId": "T-DEMO-12345",
    "location": { "lat": 26.9124, "lon": 75.7873 },
    "panicType": "manual",
    "timestamp": "2025-09-20T12:45:00.000Z"
  }
}
```

**Response Example:**

```json
{
  "verification": {
    "valid": true,
    "computedHash": "sha256_eventhash",
    "expectedHash": "sha256_eventhash",
    "algorithm": "sha256"
  }
}
```

---

## 9. GDPR Compliance (Delete Tourist Data)

**Endpoint:**

```
DELETE /tourist/{touristId}
```

**Request Body:**
_None_

**Response Example:**

```json
{
  "success": true,
  "message": "Off-chain personal data deleted, blockchain hashes preserved"
}
```

---
