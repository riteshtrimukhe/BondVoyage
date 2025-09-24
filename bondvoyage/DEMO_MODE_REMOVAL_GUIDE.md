# 🚀 Demo Mode Removal Guide

This guide explains how to remove demo mode functionality from your BondVoyage app for production deployment.

## 📋 Overview

The demo mode was implemented to allow testing of all app features without requiring a backend connection. For production deployment, you'll want to remove these demo features to ensure users only access real data and services.

## 🎯 Files to Modify

### 1. **Authentication Context** (`lib/auth.tsx`)

**Remove demo user functionality:**

```typescript
// REMOVE: Demo user creation function
const loginDemoUser = async () => {
  // Remove entire function
};

// REMOVE: Demo user from context
const value = {
  user,
  isLoading,
  login,
  logout,
  setUser,
  // loginDemoUser, // Remove this line
};
```

**Remove demo user checks:**

- Remove `isDemoUser` property from user type
- Remove demo user storage keys (`DEMO_USER_KEY`)
- Remove demo mode persistence logic

### 2. **API Service** (`lib/api.ts`)

**Remove demo mode detection:**

```typescript
// REMOVE: Demo mode checking functions
const isDemoMode = async () => {
  // Remove entire function
};

const getMockResponse = (endpoint: string, method: string = "GET") => {
  // Remove entire function
};

// REMOVE: Demo mode conditional logic from all API functions
export const registerTourist = async (userData: any) => {
  // Remove demo mode check, keep only real API call
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return response.json();
};
```

**Apply same pattern to all API functions:**

- `loginTourist`
- `getTouristProfile`
- `updateTouristProfile`
- `getEmergencyContacts`
- `addEmergencyContact`
- `reportEmergency`
- `getItineraries`
- `addItinerary`
- `updateConsent`
- `getConsent`

### 3. **Location Service** (`lib/location.ts`)

**Remove demo location functionality:**

```typescript
// REMOVE: Demo locations array
const DEMO_LOCATIONS = [
  // Remove entire array
];

// REMOVE: Demo mode location cycling
const startDemoLocationCycling = () => {
  // Remove entire function
};

// SIMPLIFY: Location functions to only use real GPS
export const getCurrentLocation = async (): Promise<LocationData> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission not granted");
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy || 0,
    timestamp: new Date().toISOString(),
  };
};
```

### 4. **Main App Entry** (`app/index.tsx`)

**Remove demo user creation option:**

```typescript
// REMOVE: Demo login handler
const handleDemoLogin = () => {
  // Remove entire function
};

// REMOVE: Demo banner from JSX
// Remove the entire LinearGradient component with "Try Demo Mode"

// SIMPLIFY: Render logic
export default function Index() {
  const { user, isLoading } = useAuth(); // Remove loginDemoUser

  if (isLoading) {
    return (
      <DrawerLayout>
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="text-slate-600 mt-4">Loading...</Text>
        </View>
      </DrawerLayout>
    );
  }

  // If user is registered, show dashboard
  if (user && user.isRegistered) {
    return (
      <DrawerLayout>
        <View className="flex-1 bg-background">
          <TouristDashboard />
        </View>
      </DrawerLayout>
    );
  }

  // Show registration form
  return (
    <DrawerLayout>
      <View className="flex-1 bg-background">
        <TouristRegistration />
      </View>
    </DrawerLayout>
  );
}
```

### 5. **Digital Card Component** (`components/DigitalCard.tsx`)

**Remove demo mode indicators:**

```typescript
// REMOVE: Demo mode status checks
<Text>
  {user.isDemoUser ? "Demo Mode" : "Blockchain secured"} // Remove condition
</Text>

// SIMPLIFY: Always show production status
<Text>Blockchain secured</Text>

// REMOVE: Demo user status
<Text>
  {user.isDemoUser ? "Demo User" : "Active Tourist"} // Remove condition
</Text>

// SIMPLIFY: Always show active status
<Text>Active Tourist</Text>

// REMOVE: Demo verification status
<Text>
  {user.isDemoUser ? "DEMO" : "VERIFIED"} // Remove condition
</Text>

// SIMPLIFY: Always show verified
<Text>VERIFIED</Text>
```

### 6. **Custom Drawer Content** (`components/CustomDrawerContent.tsx`)

**Remove demo mode logout text:**

```typescript
// SIMPLIFY: Logout button text
<Text className="ml-2 text-red-600 font-semibold text-sm">
  {user.isDemoUser ? "Exit Demo Mode" : "Logout"} // Remove condition
</Text>

// Use only production text
<Text className="ml-2 text-red-600 font-semibold text-sm">
  Logout
</Text>
```

### 7. **All Components with Demo Alerts**

**Remove demo mode alerts from:**

- `components/PanicSOS.tsx`
- `components/EmergencyContact.tsx`
- `components/CurrentLocation.tsx`
- Any other components with demo mode notifications

Replace demo alerts with actual API calls or remove them entirely.

## 🔄 Migration Steps

### Step 1: Backup Current Code

```bash
git add .
git commit -m "Backup before removing demo mode"
git checkout -b production-ready
```

### Step 2: Remove Demo Mode Files

1. Delete or comment out all demo mode related code
2. Update TypeScript interfaces to remove `isDemoUser` property
3. Remove demo mode storage keys and persistence

### Step 3: Update API Configuration

1. Ensure `API_BASE_URL` points to your production backend
2. Remove all mock responses and demo mode conditions
3. Add proper error handling for production API calls

### Step 4: Update Environment Variables

```bash
# .env.production
API_BASE_URL=https://your-production-api.com
BLOCKCHAIN_NETWORK=mainnet
```

### Step 5: Test Production Build

```bash
npm run build
# or
expo build
```

## ⚠️ Important Considerations

### Security

- Ensure all API endpoints use proper authentication
- Remove any hardcoded test credentials
- Implement proper token management

### Error Handling

- Add comprehensive error handling for network failures
- Implement proper loading states
- Add user-friendly error messages

### Performance

- Remove demo data that might cause memory leaks
- Ensure location services are properly cleaned up
- Optimize API calls and caching

### User Experience

- Add proper onboarding flow for real users
- Implement registration validation with backend
- Add proper feedback for all user actions

## ✅ Verification Checklist

- [ ] No demo mode options visible in UI
- [ ] All API calls connect to production backend
- [ ] Location services use real GPS only
- [ ] Authentication works with real user accounts
- [ ] No demo alerts or mock responses
- [ ] All hardcoded demo data removed
- [ ] Production environment variables set
- [ ] App builds successfully without demo code
- [ ] All features work with real backend data

## 🚨 Common Issues After Removal

### Network Errors

If you see network errors after removing demo mode:

1. Verify backend URL is correct
2. Check API endpoint availability
3. Ensure proper CORS configuration
4. Verify authentication tokens

### Authentication Issues

If authentication fails:

1. Check user registration flow
2. Verify token storage and retrieval
3. Ensure backend user validation
4. Check session management

### Location Issues

If location features fail:

1. Verify GPS permissions are requested
2. Check location accuracy settings
3. Ensure location services are enabled
4. Test on real devices (not simulators)

## 📞 Support

If you encounter issues during demo mode removal:

1. Check the `BACKEND_CONNECTION_GUIDE.md` for API setup
2. Verify all environment variables are set correctly
3. Test each feature individually after removal
4. Ensure proper error handling is in place

---

**🎉 Congratulations!** Your app is now production-ready without demo mode functionality.
