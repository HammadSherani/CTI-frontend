// app/layout.js
import "./globals.css";
import { ToastContainer } from "react-toastify";
import ReduxProvider from "@/components/website/provider/ReduxProvider";
import { SocketProvider } from "@/contexts/SocketProvider";
import NotificationListener from "@/components/NotificationListener";

export default async function RootLayout({ children }) {
  return (
    <html>
      <body className="antialiased">
        <ReduxProvider>
          <SocketProvider>
            <NotificationListener />
            {children}
            <ToastContainer />
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}