// app/layout.js
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { SocketProvider } from "@/contexts/SocketProvider";
import ReduxProvider from "@/components/website/provider/ReduxProvider";
// import NotificationListener from "@/components/NotificationListener";
// import NotificationInitializer from "@/components/NotificationInitializer";

export default async function RootLayout({ children }) {
  return (
    <html>
      <body className="antialiased">
        <ReduxProvider>
          <SocketProvider>
            {/* <NotificationListener />
            <NotificationInitializer /> */}
            {children}
            <ToastContainer />
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}