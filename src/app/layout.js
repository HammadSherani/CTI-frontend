import "./globals.css";
import { Poppins } from "next/font/google";

import { ToastContainer } from "react-toastify";
import { SocketProvider } from "@/contexts/SocketProvider";
import ReduxProvider from "@/components/website/provider/ReduxProvider";
import AuthListener from "@/components/AuthListener";
import { CurrencyProvider } from "@/contexts/CurrencyContext"; 

const poppins = Poppins({
  subsets: ["latin"],      
  weight: ["400", "600"],  
  display: "swap",
});

export default async function RootLayout({ children }) {
  return (
    <html className={poppins.className}>
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