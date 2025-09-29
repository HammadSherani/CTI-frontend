// app/layout.js
import "./globals.css";
import { ToastContainer } from "react-toastify";
import ReduxProvider from "@/components/website/provider/ReduxProvider";
import { SocketProvider } from "@/contexts/SocketProvider";
import NotificationSetup from "@/components/NotificationSetup";

export default async function RootLayout({ children }) {
  return (
    <html>
      <body className="antialiased">
        <ReduxProvider>
          <SocketProvider>
            <NotificationSetup />
            {children}
            <ToastContainer />
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}