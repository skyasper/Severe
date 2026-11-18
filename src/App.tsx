import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { wagmiConfig } from './config/wagmi';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { IssueProofPage } from './pages/IssueProofPage';
import { MyProofsPage } from './pages/MyProofsPage';
import { VerifyPage } from './pages/VerifyPage';
import { IssuerDashboardPage } from './pages/IssuerDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const severeRainbowTheme = lightTheme({
  accentColor: '#8B1E2D',
  accentColorForeground: '#FFFFFF',
  borderRadius: 'none',
  fontStack: 'system',
});

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={severeRainbowTheme}>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-[#F9F9F9] text-[#0A0A0A]">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/issue" element={<IssueProofPage />} />
                  <Route path="/proofs" element={<MyProofsPage />} />
                  <Route path="/verify" element={<VerifyPage />} />
                  <Route path="/verify/:proofId" element={<VerifyPage />} />
                  <Route path="/dashboard" element={<IssuerDashboardPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
