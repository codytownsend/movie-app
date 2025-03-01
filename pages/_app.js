import '../styles/globals.css';
import '../styles/mobile.css'; // Import mobile styles
import { AuthProvider } from '../contexts/AuthContext';
import Head from 'next/head';
import MobileStyles from '../components/MobileStyles';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>CineMagic - AI-Powered Movie Recommendations</title>
        <meta name="description" content="Discover movies tailored to your preferences with advanced AI recommendations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MobileStyles />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;