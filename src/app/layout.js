// app/layout.js
import "./globals.css";
import { ToastContainer } from "react-toastify";
import ReduxxProvider from "@/components/website/provider/ReduxProvider";
import { SocketProvider } from "@/contexts/SocketProvider";
// import NotificationListener from "@/components/NotificationListener";
// import NotificationInitializer from "@/components/NotificationInitializer";

export default async function RootLayout({ children }) {
  return (
    <html>
      <body className="antialiased">
        <ReduxxProvider>
          <SocketProvider>
            {/* <NotificationListener />
            <NotificationInitializer /> */}
            {children}
            <ToastContainer />
          </SocketProvider>
        </ReduxxProvider>
      </body>
    </html>
  );
}