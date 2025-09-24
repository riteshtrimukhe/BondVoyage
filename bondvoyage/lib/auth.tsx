import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  touristId: string;
  name: string;
  isRegistered: boolean;
  isDemoUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  checkRegistrationStatus: () => Promise<boolean>;
  loginDemoUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const touristId = await AsyncStorage.getItem("authToken");
      const touristName = await AsyncStorage.getItem("touristName");
      const isDemoUser = await AsyncStorage.getItem("isDemoUser");

      if (touristId && touristName) {
        const userData: User = {
          touristId,
          name: touristName,
          isRegistered: true,
          isDemoUser: isDemoUser === "true",
        };
        setUser(userData);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Error checking registration status:", error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemoUser = async (): Promise<void> => {
    try {
      const demoUser: User = {
        touristId: "T-DEMO-12345",
        name: "Demo User",
        isRegistered: true,
        isDemoUser: true,
      };

      // Store demo user data
      await AsyncStorage.setItem("authToken", demoUser.touristId);
      await AsyncStorage.setItem("touristName", demoUser.name);
      await AsyncStorage.setItem("isDemoUser", "true");

      // Set demo consent settings
      const demoConsents = {
        locationSharing: true,
        dataAccess: true,
        emergencyContacts: true,
        analyticsOptIn: false,
      };
      await AsyncStorage.setItem("userConsents", JSON.stringify(demoConsents));

      setUser(demoUser);
    } catch (error) {
      console.error("Error setting up demo user:", error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        "authToken",
        "touristName",
        "isDemoUser",
        "userConsents",
      ]);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const value: AuthContextType = {
    user,
    setUser,
    isLoading,
    checkRegistrationStatus,
    loginDemoUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
