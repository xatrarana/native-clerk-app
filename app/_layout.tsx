import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ClerkProvider,useAuth } from "@clerk/clerk-expo";
import * as SecureStore from 'expo-secure-store';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const tokenCache = {
  async getToken(key:string){
    try {
      return  SecureStore.getItemAsync(key);
    } catch (error) {
      console.log(error);
      return
    }
  },
  async saveToken(key:string, value:string){
    try {
      return  SecureStore.setItemAsync(key,value)
    } catch (error) {
      console.log(error);
      return 
    }
  }
}

const InitialLayout = ()=>{
  const {isLoaded,isSignedIn} = useAuth()
  const segments = useSegments();
  const router = useRouter()
  useEffect(()=>{
  if(!isLoaded) return
    const inTabsGroup = segments[0] === '(auth)';
    console.log(inTabsGroup);
    
    if(isSignedIn && !inTabsGroup){
      router.replace('/home')
    }else if(!isSignedIn){
        router.replace('/login')
    }
    console.log('isSignedIn',isSignedIn);
    
  },[isSignedIn])
  return <Slot/>
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
<InitialLayout/>
      </ClerkProvider>
    </ThemeProvider>
  );
}
