import "./globals.css";
import { ToastContainer } from "react-toastify";
import { SocketProvider } from "@/contexts/SocketProvider";
import ReduxProvider from "@/components/website/provider/ReduxProvider";
import AuthListener from "@/components/AuthListener";
import { CurrencyProvider } from "@/contexts/CurrencyContext"; 

export default async function RootLayout({ children }) {
  return (
    <html>
      <body className="antialiased">
        <ReduxProvider>
          <CurrencyProvider> 
            <AuthListener />   
            <SocketProvider>
              {children}
              <ToastContainer />
            </SocketProvider>
          </CurrencyProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}