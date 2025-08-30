import "./globals.css";
import { ToastContainer } from "react-toastify";
import ReduxProvider from "@/components/website/provider/ReduxProvider";



export default async function RootLayout({ children }) {

  return (
    <html>
      <body className="antialiased">
          <ReduxProvider>
            {children}
            <ToastContainer />
          </ReduxProvider>
      </body>
    </html>
  );
}