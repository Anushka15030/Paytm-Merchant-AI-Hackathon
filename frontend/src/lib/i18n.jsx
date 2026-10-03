import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const hindi = {
  "Dashboard": "डैशबोर्ड",
  "Inventory": "इन्वेंटरी",
  "Orders": "ऑर्डर",
  "WhatsApp Order Demo": "WhatsApp ऑर्डर डेमो",
  "Ask your business": "अपने व्यवसाय से पूछें",
  "Get answers from your current products, stock, sales, and orders.": "अपने मौजूदा प्रोडक्ट, स्टॉक, बिक्री और ऑर्डर के बारे में जवाब पाएँ।",
  "New conversation": "नई बातचीत",
  "Merchant chat": "मर्चेंट चैट",
  "Grounded in live dashboard data": "डैशबोर्ड के मौजूदा डेटा पर आधारित",
  "Hindi · Hinglish · English": "हिंदी · हिंग्लिश · अंग्रेज़ी",
  "What would you like to know?": "आप क्या जानना चाहेंगे?",
  "Ask about products, stock levels, recorded sales, or recent orders. Answers use the data currently available in your dashboard.": "प्रोडक्ट, स्टॉक, दर्ज बिक्री या हाल के ऑर्डर के बारे में पूछें। जवाब डैशबोर्ड में उपलब्ध डेटा पर आधारित होंगे।",
  "Thinking": "सोच रहा है",
  "Couldn’t get a reply: {error}": "जवाब नहीं मिला: {error}",
  "Retry": "फिर कोशिश करें",
  "Ask in English, हिंदी, or Hinglish…": "English, हिंदी या Hinglish में पूछें…",
  "Your message": "आपका संदेश",
  "Send message": "संदेश भेजें",
  "Replies use current dashboard data. This conversation is not saved as cross-session memory.": "जवाब मौजूदा डैशबोर्ड डेटा पर आधारित हैं। यह बातचीत अगली बार के लिए सेव नहीं होती।",
  "Order summary": "ऑर्डर सारांश",
  "Matched with current inventory": "मौजूदा इन्वेंटरी से मिलान किया गया",
  "✓ Payment successful": "✓ भुगतान सफल",
  "Paytm par ₹{amount} prapt hue.": "Paytm पर ₹{amount} प्राप्त हुए।",
  "Received": "प्राप्त",
  "Replay announcement": "घोषणा फिर सुनें",
  "Continue to WhatsApp": "WhatsApp पर जाएँ",
  "Simulated Paytm-style payment voice. Not connected to a real Soundbox or payment service.": "Paytm Soundbox जैसी डेमो आवाज़। यह किसी असली Soundbox या भुगतान सेवा से जुड़ी नहीं है।",
  "Order ready for payment:": "ऑर्डर भुगतान के लिए तैयार है:",
  "AI Insights": "एआई सुझाव",
  "Campaigns": "कैंपेन",
  "Notifications": "सूचनाएँ",
  "Settings": "सेटिंग्स",
  "Merchant Copilot": "मर्चेंट कोपायलट",
  "AI Business Partner": "एआई बिज़नेस पार्टनर",
  "Business": "व्यवसाय",
  "for": "के लिए",
  "Workspace": "वर्कस्पेस",
  "Your store": "आपकी दुकान",
  "Merchant dashboard": "मर्चेंट डैशबोर्ड",
  "English": "अंग्रेज़ी",
  "Hindi": "हिंदी",
  "English / हिंदी": "English / हिंदी",
  "Help": "मदद",
  "Your business, at a glance.": "एक नज़र में आपका व्यवसाय।",
  "Your Paytm for Business workspace, with a little extra intelligence to help you grow.": "Paytm for Business का आपका वर्कस्पेस—आपके व्यवसाय को बढ़ाने के लिए उपयोगी सुझावों के साथ।",
  "View Insights": "सुझाव देखें",
  "Business overview": "व्यवसाय की जानकारी",
  "Explore detailed performance and deeper business trends.": "विस्तृत प्रदर्शन और व्यवसाय के रुझान देखें।",
  "A simple, clear view of how your business is doing.": "आपका व्यवसाय कैसा चल रहा है, इसकी आसान और स्पष्ट जानकारी।",
  "Simple": "सरल",
  "Advanced": "एडवांस",
  "Dashboard view": "डैशबोर्ड दृश्य",
  "Dashboard mode: {mode}": "डैशबोर्ड मोड: {mode}",
  "Search products or categories...": "प्रोडक्ट या श्रेणी खोजें...",
  "Couldn’t load dashboard data: {error}": "डैशबोर्ड की जानकारी लोड नहीं हुई: {error}",
  "Try again": "फिर कोशिश करें",
  "Loading merchant data…": "मर्चेंट की जानकारी लोड हो रही है…",
  "Loading inventory…": "इन्वेंटरी लोड हो रही है…",
  "Sales today": "आज की बिक्री",
  "Orders today": "आज के ऑर्डर",
  "Sales growth": "बिक्री में बढ़ोतरी",
  "growth": "बढ़ोतरी",
  "Completed orders": "पूरे हुए ऑर्डर",
  "Compared with the previous period": "पिछली अवधि की तुलना में",
  "Low-stock products": "कम स्टॉक वाले प्रोडक्ट",
  "Need a restock review": "रीस्टॉक की जाँच ज़रूरी है",
  "Overstock products": "ज़रूरत से ज़्यादा स्टॉक",
  "May benefit from a promotion": "ऑफर देने से बिक्री बढ़ सकती है",
  "AI opportunities": "एआई के सुझाव",
  "Inventory recommendations": "इन्वेंटरी के सुझाव",
  "Product sales comparison": "प्रोडक्ट की बिक्री की तुलना",
  "Units sold in the last 7 and 30 days": "पिछले 7 और 30 दिनों में बिके यूनिट",
  "Last 7 days": "पिछले 7 दिन",
  "Last 30 days": "पिछले 30 दिन",
  "Inventory health": "इन्वेंटरी की स्थिति",
  "Current stock status across products": "सभी प्रोडक्ट का मौजूदा स्टॉक",
  "Healthy": "ठीक",
  "Low stock": "कम स्टॉक",
  "Overstock": "अधिक स्टॉक",
  "No matching products found.": "कोई मेल खाता प्रोडक्ट नहीं मिला।",
  "Sales by category": "श्रेणी के अनुसार बिक्री",
  "7-day estimate using units sold × current product price": "बिके यूनिट × मौजूदा कीमत के आधार पर 7 दिन का अनुमान",
  "Estimated sales": "अनुमानित बिक्री",
  "Live product and stock levels from your merchant account.": "आपके मर्चेंट खाते के प्रोडक्ट और स्टॉक की जानकारी।",
  "{count} products": "{count} प्रोडक्ट",
  "Stock status and recent sales": "स्टॉक की स्थिति और हाल की बिक्री",
  "Search products or suppliers...": "प्रोडक्ट या सप्लायर खोजें...",
  "Product": "प्रोडक्ट",
  "Category": "श्रेणी",
  "Price": "कीमत",
  "In stock": "स्टॉक में",
  "Sales · 7d": "बिक्री · 7 दिन",
  "Status": "स्थिति",
  "Action": "कार्रवाई",
  "Supplier: {supplier}": "सप्लायर: {supplier}",
  "Restock quantity for {product}": "{product} के लिए रीस्टॉक मात्रा",
  "Saving…": "सेव हो रहा है…",
  "Place order": "ऑर्डर करें",
  "Cancel": "रद्द करें",
  "Restock": "रीस्टॉक",
  "Restock requests": "रीस्टॉक अनुरोध",
  "Review requests, approve an order, or set a reminder after rejecting.": "अनुरोध देखें, ऑर्डर मंज़ूर करें या मना करने पर रिमाइंडर लगाएँ।",
  "Remind me after": "मुझे याद दिलाएँ",
  "{days} days": "{days} दिन",
  "in {days} days": "{days} दिन बाद",
  "Request #{id} · {quantity} units · Supplier: {supplier}": "अनुरोध #{id} · {quantity} यूनिट · सप्लायर: {supplier}",
  "Reminder due": "रिमाइंडर का समय हो गया",
  "Reminder scheduled for {date}": "रिमाइंडर {date} के लिए तय है",
  "Reminder email sent {date}": "रिमाइंडर ईमेल भेजा गया: {date}",
  "Invoice {id} · estimated total {total}": "इनवॉइस {id} · अनुमानित कुल {total}",
  "Approve & invoice": "मंज़ूर करें और इनवॉइस बनाएँ",
  "Reject & remind": "मना करें और रिमाइंडर लगाएँ",
  "Do not remind": "रिमाइंडर न भेजें",
  "No restock requests yet. Use Restock in the inventory table to create one.": "अभी कोई रीस्टॉक अनुरोध नहीं है। नया अनुरोध बनाने के लिए इन्वेंटरी तालिका में रीस्टॉक चुनें।",
  "Supplier invoice generated": "सप्लायर इनवॉइस बन गया",
  "Invoice {id} · {product} · {quantity} units · Estimated total {total}": "इनवॉइस {id} · {product} · {quantity} यूनिट · अनुमानित कुल {total}",
  "Estimate uses the product’s listed price; supplier cost is not configured in this demo.": "यह अनुमान प्रोडक्ट की दिखाई गई कीमत पर आधारित है; डेमो में सप्लायर की लागत सेट नहीं है।",
  "Prepare an invoice from the products in your inventory.": "अपनी इन्वेंटरी के प्रोडक्ट से इनवॉइस बनाएँ।",
  "Create an invoice": "इनवॉइस बनाएँ",
  "Choose a product and quantity to generate an invoice.": "इनवॉइस बनाने के लिए प्रोडक्ट और मात्रा चुनें।",
  "Loading products…": "प्रोडक्ट लोड हो रहे हैं…",
  "Quantity": "मात्रा",
  "Unit price": "प्रति यूनिट कीमत",
  "Generating…": "बनाया जा रहा है…",
  "Generate invoice": "इनवॉइस बनाएँ",
  "Invoice preview": "इनवॉइस का पूर्वावलोकन",
  "Your generated invoice details will appear here.": "आपके इनवॉइस की जानकारी यहाँ दिखेगी।",
  "Invoice ID": "इनवॉइस आईडी",
  "Total": "कुल",
  "Complete the form to create an invoice preview.": "इनवॉइस देखने के लिए फ़ॉर्म भरें।",
  "AI Insights": "एआई सुझाव",
  "Recommendations based on your current stock levels and recent sales.": "मौजूदा स्टॉक और हाल की बिक्री के आधार पर सुझाव।",
  "{count} opportunities": "{count} अवसर",
  "Couldn’t load insights: {error}": "सुझाव लोड नहीं हुए: {error}",
  "Reviewing your inventory…": "आपकी इन्वेंटरी की जाँच हो रही है…",
  "Restock soon": "जल्द रीस्टॉक करें",
  "Estimated stock left: {days}": "अनुमानित बचा स्टॉक: {days}",
  "Suggested restock: {quantity}": "सुझाई गई रीस्टॉक मात्रा: {quantity}",
  "{quantity} units": "{quantity} यूनिट",
  "Review current stock and consider a promotion to help move excess inventory.": "मौजूदा स्टॉक देखें और अतिरिक्त माल बेचने के लिए ऑफर पर विचार करें।",
  "Review inventory": "इन्वेंटरी देखें",
  "You’re in good shape": "आपका स्टॉक ठीक है",
  "There are no inventory recommendations right now.": "अभी इन्वेंटरी के लिए कोई सुझाव नहीं है।",
  "Refresh insights": "सुझाव रीफ़्रेश करें",
  "Create and manage campaigns.": "कैंपेन बनाएँ और संभालें।",
  "Your latest merchant notifications.": "आपकी नई मर्चेंट सूचनाएँ।",
  "Manage your merchant preferences.": "अपनी मर्चेंट प्राथमिकताएँ संभालें।",
  "Nothing here yet": "अभी यहाँ कुछ नहीं है",
  "There is no information to display.": "दिखाने के लिए कोई जानकारी नहीं है।",
  "Low Stock": "कम स्टॉक",
  "Paid": "भुगतान हुआ",
  "Pending": "लंबित",
  "Completed": "पूरा हुआ",
  "Cancelled": "रद्द",
  "Search...": "खोजें...",
  "Clear search": "खोज मिटाएँ",
  "Mobile navigation": "मोबाइल नेविगेशन",
  "Main navigation": "मुख्य नेविगेशन",
  "Switch to English": "अंग्रेज़ी में बदलें",
  "हिंदी में बदलें": "हिंदी में बदलें",
  "Dairy": "डेयरी",
  "Beverages": "पेय पदार्थ",
  "Grocery": "किराना",
  "Snacks": "स्नैक्स",
  "© 2026 Merchant Copilot": "© 2026 मर्चेंट कोपायलट",
  "Paytm for Business": "व्यवसाय के लिए Paytm",
  "Request #{id} · {status}": "अनुरोध #{id} · {status}",
  "PENDING": "लंबित",
  "APPROVED": "मंज़ूर",
  "REJECTED": "मना किया गया",
  "HEALTHY": "ठीक",
  "LOW": "कम स्टॉक",
  "OVERSTOCK": "अधिक स्टॉक",
  "Restock order created for {product}": "{product} के लिए रीस्टॉक ऑर्डर बनाया गया",
  "Restock approved and supplier invoice generated. Stock will change when delivery is received.": "रीस्टॉक मंज़ूर हुआ और सप्लायर इनवॉइस बन गया। सामान मिलने पर स्टॉक अपडेट होगा।",
  "Restock rejected. Reminders are turned off.": "रीस्टॉक अनुरोध अस्वीकार किया गया। रिमाइंडर बंद हैं।",
  "Restock rejected. A reminder is scheduled in {days} days.": "रीस्टॉक अनुरोध अस्वीकार किया गया। {days} दिन बाद रिमाइंडर आएगा।",
  "An error occurred": "एक त्रुटि हुई",
  "Supplier": "सप्लायर",
  "Network Error": "नेटवर्क की समस्या",
  "Unable to connect to the merchant backend.": "मर्चेंट बैकएंड से कनेक्ट नहीं हो पाया।",
  "Product not found": "प्रोडक्ट नहीं मिला।",
  "Restock request not found": "रीस्टॉक अनुरोध नहीं मिला।",
  "This request has already been decided": "इस अनुरोध पर पहले ही निर्णय लिया जा चुका है।",
  "This request has no scheduled reminder": "इस अनुरोध के लिए कोई रिमाइंडर तय नहीं है।",
  "Reminder is not due yet": "रिमाइंडर का समय अभी नहीं हुआ है।",
  "Reminder was already marked as sent": "रिमाइंडर पहले ही भेजा हुआ दर्ज है।",
  "Invalid n8n API key": "n8n एपीआई कुंजी गलत है।",
  "Quantity must be greater than 0": "मात्रा 0 से अधिक होनी चाहिए।",
  "Choose a reminder interval from 1 to 30 days, or turn reminders off.": "1 से 30 दिन का रिमाइंडर चुनें या रिमाइंडर बंद करें।",
  "Switch to Hindi": "हिंदी में बदलें",
  "{product} may run out soon.": "{product} का स्टॉक जल्द खत्म हो सकता है।",
  "{product} has excess inventory.": "{product} का स्टॉक ज़रूरत से ज़्यादा है।",
}

const LocaleContext = createContext(null)

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      return localStorage.getItem("merchant-copilot-locale") === "hi" ? "hi" : "en"
    } catch {
      return "en"
    }
  })

  const setLocale = (nextLocale) => {
    setLocaleState(nextLocale === "hi" ? "hi" : "en")
  }

  useEffect(() => {
    document.documentElement.lang = locale
    try {
      localStorage.setItem("merchant-copilot-locale", locale)
    } catch {
      // The selection still works for this page load when storage is unavailable.
    }
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale }), [locale])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) throw new Error("useLocale must be used inside LocaleProvider")
  return context
}

export function useT() {
  const { locale } = useLocale()
  return useCallback((key, variables = {}) => {
    let translated = locale === "hi" ? (hindi[key] || key) : key
    for (const [name, value] of Object.entries(variables)) {
      translated = translated.replaceAll(`{${name}}`, String(value))
    }
    return translated
  }, [locale])
}
