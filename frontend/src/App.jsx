import { BrowserRouter, Route, Routes } from "react-router-dom"

import DashboardLayout from "./components/layout/DashboardLayout"

import Dashboard from "./pages/Dashboard"
import Inventory from "./pages/Inventory"
import Orders from "./pages/Orders"
import AIInsights from "./pages/AIInsights"
import Campaigns from "./pages/Campaigns"
import Notifications from "./pages/Notifications"
import Settings from "./pages/Settings"
import WhatsAppOrderDemo from "./pages/WhatsAppOrderDemo"
import MockPayment from "./pages/MockPayment"
import Chat from "./pages/Chat"
import { LocaleProvider } from "./lib/i18n"

function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/whatsapp-demo" element={<WhatsAppOrderDemo />} />
            <Route path="/mock-payment/:orderCode" element={<MockPayment />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </LocaleProvider>
  )
}

export default App
