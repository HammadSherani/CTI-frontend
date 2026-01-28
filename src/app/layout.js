// app/layout.js
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { SocketProvider } from "@/contexts/SocketProvider";
import ReduxProvider from "@/components/website/provider/ReduxProvider";
import AuthListener from "@/components/AuthListener";

export default async function RootLayout({ children }) {
  return (
    <html>
      <body className="antialiased">
        <ReduxProvider>
          <AuthListener />   
          <SocketProvider>
            {children}
            <ToastContainer />
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
