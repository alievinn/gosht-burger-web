import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), "data");
const LOGO_FILE = path.join(DATA_DIR, "logo.txt");
const HERO_BG_FILE = path.join(DATA_DIR, "hero_bg.txt");
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const FEEDBACKS_FILE = path.join(DATA_DIR, "feedbacks.json");
const COUPONS_FILE = path.join(DATA_DIR, "coupons.json");
const FRANCHISE_FILE = path.join(DATA_DIR, "franchise.json");
const LOYALTY_FILE = path.join(DATA_DIR, "loyalty.json");
const SERVER_LOG_FILE = path.join(DATA_DIR, "server.log");

const logToFile = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(SERVER_LOG_FILE, logMessage);
  console.log(message);
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize log file
if (!fs.existsSync(SERVER_LOG_FILE)) {
  fs.writeFileSync(SERVER_LOG_FILE, `Server Log Initialized at ${new Date().toISOString()}\n`);
}

logToFile(`Server starting. Data directory: ${DATA_DIR}`);

// Default Menu Items (from constants.ts)
const DEFAULT_MENU = [
  {
    id: '1',
    name: 'GOSHT Special Burger',
    description: '%100 dana burger köftesi (150-200 gr), tereyağlı günlük susamlı brioche ekmek, erimiş cheddar peyniri, karamelize soğan ve közlenmiş kapya biber & patlıcan (Közmix). Yanında çıtır patates, özel soslar ve turşu ile.',
    price: 480,
    category: "Burger",
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072&auto=format&fit=crop',
    isSignature: true,
    variants: [
      { id: 'v1', label: 'L (150 GR)', price: 480 },
      { id: 'v2', label: 'XL (200 GR)', price: 540 }
    ]
  },
  {
    id: '2',
    name: 'GOSHT KAVURMİX',
    description: '200gr %100 dana burger köftesi ve ev yapımı kavurmanın eşsiz uyumu. Közlenmiş biber & patlıcan (Közmix), erimiş cheddar ve özel GOSHT sos. Yanında çıtır patates ve ikramlar ile.',
    price: 560,
    category: "Burger",
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop',
    isSignature: true,
    variants: [
      { id: 'v3', label: 'Standart (200 GR)', price: 560 },
      { id: 'v4', label: 'Mega (300 GR)', price: 680 }
    ]
  },
  {
    id: '3',
    name: 'SMASH BURGER',
    description: 'Yüksek ısıda mühürlenmiş 2 adet 100gr dana köfte, double cheddar, karamelize soğan ve Közmix. Tereyağlı brioche ekmek arasında lezzet patlaması.',
    price: 460,
    category: "Burger",
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=2080&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'SUCUKLU GOSHT BURGER',
    description: '200g dana köfte ve Osmanlı sucuğunun uyumu. Közmix, cheddar ve özel sos ile. Yanında çıtır patates, ketçap, mayonez ve turşu ikramı ile.',
    price: 520,
    category: "Burger",
    image: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?q=80&w=1974&auto=format&fit=crop' 
  },
  {
    id: '5',
    name: 'CHİCKEN BURGER',
    description: '200gr ızgara tavuk köftesi, Közmix, erimiş cheddar ve özel GOSHT sos. Tereyağlı susamlı brioche ekmek ve yanında bol ikramlı patates kızartması.',
    price: 390,
    category: "Burger",
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '6',
    name: 'ÇOCUK MENÜ',
    description: '70gr ızgara tavuk köftesi, erimiş cheddar, ketçap-mayonez. Yanında çıtır patates, özel soslar ve çocuklar için uygun porsiyon.',
    price: 320,
    category: "Çocuk Menü",
    image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '7',
    name: 'GOSHT Lokum Steak',
    description: '250gr dinlendirilmiş dana bonfile, özel baharatlar ve tereyağı ile mühürlenmiş. Yanında Közmix, çıtır patates ve özel steak sosu ile.',
    price: 720,
    category: "Steak",
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=2070&auto=format&fit=crop',
    isSignature: true
  },
  {
    id: '8',
    name: 'Kuzu Kafes (Tek Kişilik)',
    description: 'Özel marinasyonlu kuzu pirzola dilimleri, ağır ateşte pişirilmiş. Yanında közlenmiş sebzeler ve baharatlı patates ile.',
    price: 680,
    category: "Steak",
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop'
  }
];

const DEFAULT_SETTINGS = {
  aboutText: '',
  aboutLabel: 'Mirasımız',
  aboutTitle: "Batman'ın En İştah Açıcı Sokaklarından...",
  aboutQuote: '“Gerçek burgerin ateşini herkese hissettirmek.”',
  aboutFeatures: 'Daily Fresh Beef – Her gün taze çekilen dana döş\nÖzel GOSHT Sosları – Trüf, barbekü ve özel acı soslar\nPremium Sunum & Packaging\nHızlı, sıcak ve güvenilir servis\nHijyen ve kalite odaklı mutfak standartları',
  aboutImage1: null,
  aboutImage2: null,
  franchiseText: '',
  franchiseLabel: 'İş Ortaklığı',
  franchiseTitle: 'Franchise',
  franchiseQuote: '"Güçlü Bir Marka. Lezzet Odaklı Bir Yatırım."',
  franchiseWhyTitle: 'Neden Gosht Burger?',
  franchiseImage: null,
  contactPhone: '0507 864 16 72',
  contactEmail: 'info@goshtburger.com',
  contactAddress: 'Gap Mah. Cafeler Cd.\nMerkez, Batman',
  whatsappNumber: '905078641672',
  instagramUrl: 'https://www.instagram.com/goshtburger',
  tiktokUrl: 'https://www.tiktok.com/@goshtburger',
  heroTitle: 'GERÇEK ET. GERÇEK ATEŞ.',
  heroSubtitle: 'Batman\'ın kalbinde, %100 dana döş etinden hazırlanan gurme burger deneyimi.',
  heroCtaText: 'MENÜYÜ KEŞFET',
  footerDescription: 'Batman\'da doğan, premium, ateşle buluşan gerçek et deneyimi sunan bir markayız. Burgerlerimizde marul, domates gibi taze yeşillik bulunmadığını, bunun yerine imza "Közmix" (közlenmiş biber & patlıcan) kullandığımızı vurgularız.',
  footerCopyright: '© 2024 GOSHT BURGER. Tüm hakları saklıdır.',
  loyaltyEnabled: true,
  pointsPerTL: 1,
  minPointsToRedeem: 500,
  pointValueInTL: 0.1
};

// Initialize files if they don't exist
const initializeFile = (filePath: string, defaultValue: string) => {
  if (!fs.existsSync(filePath)) {
    logToFile(`Initializing file: ${filePath}`);
    fs.writeFileSync(filePath, defaultValue);
  } else {
    logToFile(`Data file exists and will be preserved: ${filePath}`);
  }
};

initializeFile(MENU_FILE, JSON.stringify(DEFAULT_MENU));
initializeFile(ORDERS_FILE, "[]");
initializeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS));
initializeFile(MESSAGES_FILE, "[]");
initializeFile(FEEDBACKS_FILE, "[]");
initializeFile(COUPONS_FILE, "[]");
initializeFile(FRANCHISE_FILE, "[]");
initializeFile(LOYALTY_FILE, "[]");

// Email Transporter
function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASSWORD
    }
  });
}

async function sendOrderEmail(order: any) {
  const email = process.env.ADMIN_EMAIL;
  const pass = process.env.ADMIN_EMAIL_PASSWORD;

  if (!email || !pass) {
    console.log("Email credentials missing (ADMIN_EMAIL or ADMIN_EMAIL_PASSWORD). Skipping email notification.");
    return;
  }

  const maskedEmail = email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + "*".repeat(gp3.length));
  console.log(`Attempting to send order email using: ${maskedEmail}`);
  
  if (pass.length !== 16 && !pass.includes(' ')) {
    console.warn(`WARNING: ADMIN_EMAIL_PASSWORD length is ${pass.length}. Gmail App Passwords are exactly 16 characters long. This is likely why authentication is failing.`);
  }

  const itemsList = order.items.map((item: any) => 
    `- ${item.quantity}x ${item.name} ${item.selectedVariant ? `(${item.selectedVariant.label})` : ''} ${item.customizations ? `[Not: ${item.customizations}]` : ''}`
  ).join('\n');

  const mailOptions = {
    from: email,
    to: email, 
    subject: `Yeni Sipariş Geldi! - #${order.id.slice(-6)}`,
    text: `
Yeni bir sipariş aldınız!

Müşteri Bilgileri:
İsim: ${order.customerName}
Telefon: ${order.customerPhone}
Adres: ${order.customerAddress}
Ödeme Yöntemi: ${order.paymentMethod === 'cash' ? 'Nakit' : 'Kredi Kartı'}

Sipariş Detayları:
${itemsList}

Toplam Tutar: ${order.total} TL

Sipariş Zamanı: ${new Date(order.createdAt).toLocaleString('tr-TR')}
    `
  };

  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log("Order email sent successfully.");
  } catch (error: any) {
    console.error("Error sending order email:", error.message);
    if (error.message.includes('535-5.7.8')) {
      console.error("DIAGNOSTIC: This is an authentication error. Please ensure you are using a Gmail 'App Password', not your regular password. Also check that ADMIN_EMAIL is correct.");
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/test-email", async (req, res) => {
    const email = process.env.ADMIN_EMAIL;
    const pass = process.env.ADMIN_EMAIL_PASSWORD;

    if (!email || !pass) {
      return res.status(400).json({ error: "E-posta veya şifre eksik (ADMIN_EMAIL, ADMIN_EMAIL_PASSWORD)" });
    }

    try {
      const transporter = getTransporter();
      await transporter.verify();
      
      await transporter.sendMail({
        from: email,
        to: email,
        subject: "Gosht Burger - E-posta Testi",
        text: "E-posta yapılandırmanız başarıyla tamamlandı! Artık sipariş bildirimlerini alabilirsiniz."
      });
      
      res.json({ success: true, message: "Test e-postası başarıyla gönderildi." });
    } catch (error: any) {
      console.error("Test email failed:", error);
      
      let hint = null;
      if (error.message.includes('535-5.7.8')) {
        hint = "Kullanıcı adı veya şifre hatalı. Gmail kullanıyorsanız, normal şifrenizi DEĞİL, 16 haneli bir 'Uygulama Şifresi' (App Password) kullanmalısınız.";
      } else if (error.code === 'EAUTH') {
        hint = "Kimlik doğrulama hatası. Lütfen ADMIN_EMAIL ve ADMIN_EMAIL_PASSWORD değerlerini kontrol edin.";
      }

      res.status(500).json({ 
        error: "Bağlantı hatası", 
        details: error.message,
        hint: hint
      });
    }
  });
  app.get("/api/messages", (req, res) => {
    if (fs.existsSync(MESSAGES_FILE)) {
      const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
      res.json(messages);
    } else {
      res.json([]);
    }
  });

  app.post("/api/messages", (req, res) => {
    try {
      let messages = [];
      if (fs.existsSync(MESSAGES_FILE)) {
        messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
      }
      messages.push(req.body);
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages));
      logToFile(`New message saved. Total messages: ${messages.length}`);
      res.json({ success: true });
    } catch (error) {
      logToFile(`Error saving message: ${error}`);
      res.status(500).json({ success: false, error: "Mesaj kaydedilemedi" });
    }
  });

  app.delete("/api/messages/:id", (req, res) => {
    try {
      if (fs.existsSync(MESSAGES_FILE)) {
        let messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
        messages = messages.filter((m: any) => m.id !== req.params.id);
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages));
        logToFile(`Message deleted. ID: ${req.params.id}`);
      }
      res.json({ success: true });
    } catch (error) {
      logToFile(`Error deleting message: ${error}`);
      res.status(500).json({ success: false, error: "Mesaj silinemedi" });
    }
  });

  app.get("/api/feedbacks", (req, res) => {
    if (fs.existsSync(FEEDBACKS_FILE)) {
      const feedbacks = JSON.parse(fs.readFileSync(FEEDBACKS_FILE, "utf-8"));
      res.json(feedbacks);
    } else {
      res.json([]);
    }
  });

  app.post("/api/feedbacks", (req, res) => {
    try {
      let feedbacks = [];
      if (fs.existsSync(FEEDBACKS_FILE)) {
        feedbacks = JSON.parse(fs.readFileSync(FEEDBACKS_FILE, "utf-8"));
      }
      feedbacks.push(req.body);
      fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify(feedbacks));
      logToFile(`New feedback saved. Total feedbacks: ${feedbacks.length}`);
      res.json({ success: true });
    } catch (error) {
      logToFile(`Error saving feedback: ${error}`);
      res.status(500).json({ success: false, error: "Geri bildirim kaydedilemedi" });
    }
  });

  app.delete("/api/feedbacks/:id", (req, res) => {
    try {
      if (fs.existsSync(FEEDBACKS_FILE)) {
        let feedbacks = JSON.parse(fs.readFileSync(FEEDBACKS_FILE, "utf-8"));
        feedbacks = feedbacks.filter((f: any) => f.id !== req.params.id);
        fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify(feedbacks));
        logToFile(`Feedback deleted. ID: ${req.params.id}`);
      }
      res.json({ success: true });
    } catch (error) {
      logToFile(`Error deleting feedback: ${error}`);
      res.status(500).json({ success: false, error: "Geri bildirim silinemedi" });
    }
  });

  app.get("/api/coupons", (req, res) => {
    if (fs.existsSync(COUPONS_FILE)) {
      const coupons = JSON.parse(fs.readFileSync(COUPONS_FILE, "utf-8"));
      res.json(coupons);
    } else {
      res.json([]);
    }
  });

  app.post("/api/coupons", (req, res) => {
    try {
      let coupons = [];
      if (fs.existsSync(COUPONS_FILE)) {
        coupons = JSON.parse(fs.readFileSync(COUPONS_FILE, "utf-8"));
      }
      // Check if code already exists
      const exists = coupons.some((c: any) => c.code.toUpperCase() === req.body.code.toUpperCase());
      if (exists && !req.body.id) {
         return res.status(400).json({ success: false, error: "Bu kupon kodu zaten mevcut" });
      }

      if (req.body.id) {
        coupons = coupons.map((c: any) => c.id === req.body.id ? req.body : c);
      } else {
        coupons.push(req.body);
      }
      
      fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons));
      logToFile(`Coupon saved: ${req.body.code}`);
      res.json({ success: true });
    } catch (error) {
      logToFile(`Error saving coupon: ${error}`);
      res.status(500).json({ success: false, error: "Kupon kaydedilemedi" });
    }
  });

  app.delete("/api/coupons/:id", (req, res) => {
    try {
      if (fs.existsSync(COUPONS_FILE)) {
        let coupons = JSON.parse(fs.readFileSync(COUPONS_FILE, "utf-8"));
        coupons = coupons.filter((c: any) => c.id !== req.params.id);
        fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons));
        logToFile(`Coupon deleted. ID: ${req.params.id}`);
      }
      res.json({ success: true });
    } catch (error) {
      logToFile(`Error deleting coupon: ${error}`);
      res.status(500).json({ success: false, error: "Kupon silinemedi" });
    }
  });

  app.post("/api/coupons/redeem", (req, res) => {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ success: false, error: "Kupon kodu gerekli" });

      if (fs.existsSync(COUPONS_FILE)) {
        let coupons = JSON.parse(fs.readFileSync(COUPONS_FILE, "utf-8"));
        const index = coupons.findIndex((c: any) => c.code.toUpperCase() === code.toUpperCase());
        
        if (index !== -1) {
          coupons[index].usageCount = (coupons[index].usageCount || 0) + 1;
          fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons));
          logToFile(`Coupon redeemed: ${code}. New usage count: ${coupons[index].usageCount}`);
          return res.json({ success: true });
        }
      }
      res.status(404).json({ success: false, error: "Kupon bulunamadı" });
    } catch (error) {
      logToFile(`Error redeeming coupon: ${error}`);
      res.status(500).json({ success: false, error: "Kupon kullanımı işlenemedi" });
    }
  });

  app.get("/api/franchise", (req, res) => {
    if (fs.existsSync(FRANCHISE_FILE)) {
      const applications = JSON.parse(fs.readFileSync(FRANCHISE_FILE, "utf-8"));
      res.json(applications);
    } else {
      res.json([]);
    }
  });

  app.post("/api/franchise", (req, res) => {
    try {
      let applications = [];
      if (fs.existsSync(FRANCHISE_FILE)) {
        applications = JSON.parse(fs.readFileSync(FRANCHISE_FILE, "utf-8"));
      }
      applications.push(req.body);
      fs.writeFileSync(FRANCHISE_FILE, JSON.stringify(applications));
      logToFile(`New franchise application saved. Total: ${applications.length}`);
      res.json({ success: true });
    } catch (error) {
      logToFile(`Error saving franchise application: ${error}`);
      res.status(500).json({ success: false, error: "Başvuru kaydedilemedi" });
    }
  });

  app.delete("/api/franchise/:id", (req, res) => {
    try {
      if (fs.existsSync(FRANCHISE_FILE)) {
        let applications = JSON.parse(fs.readFileSync(FRANCHISE_FILE, "utf-8"));
        applications = applications.filter((a: any) => a.id !== req.params.id);
        fs.writeFileSync(FRANCHISE_FILE, JSON.stringify(applications));
        logToFile(`Franchise application deleted. ID: ${req.params.id}`);
      }
      res.json({ success: true });
    } catch (error) {
      logToFile(`Error deleting franchise application: ${error}`);
      res.status(500).json({ success: false, error: "Başvuru silinemedi" });
    }
  });

  app.get("/api/logo", (req, res) => {
    if (fs.existsSync(LOGO_FILE)) {
      const logo = fs.readFileSync(LOGO_FILE, "utf-8");
      res.json({ logo });
    } else {
      res.json({ logo: null });
    }
  });

  app.post("/api/logo", (req, res) => {
    const { logo } = req.body;
    try {
      if (logo === null) {
        if (fs.existsSync(LOGO_FILE)) fs.unlinkSync(LOGO_FILE);
        console.log("Logo reset to default");
      } else {
        fs.writeFileSync(LOGO_FILE, logo);
        console.log("Logo updated and saved to disk");
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving logo:", error);
      res.status(500).json({ success: false, error: "Logo kaydedilemedi" });
    }
  });

  app.get("/api/hero-bg", (req, res) => {
    if (fs.existsSync(HERO_BG_FILE)) {
      const heroBg = fs.readFileSync(HERO_BG_FILE, "utf-8");
      res.json({ heroBg });
    } else {
      res.json({ heroBg: null });
    }
  });

  app.post("/api/hero-bg", (req, res) => {
    const { heroBg } = req.body;
    if (heroBg === null) {
      if (fs.existsSync(HERO_BG_FILE)) fs.unlinkSync(HERO_BG_FILE);
    } else {
      fs.writeFileSync(HERO_BG_FILE, heroBg);
    }
    res.json({ success: true });
  });

  app.get("/api/menu", (req, res) => {
    if (fs.existsSync(MENU_FILE)) {
      const menu = JSON.parse(fs.readFileSync(MENU_FILE, "utf-8"));
      res.json(menu);
    } else {
      res.json(null);
    }
  });

  app.post("/api/menu", (req, res) => {
    fs.writeFileSync(MENU_FILE, JSON.stringify(req.body));
    res.json({ success: true });
  });

  app.get("/api/orders", (req, res) => {
    if (fs.existsSync(ORDERS_FILE)) {
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
      res.json(orders);
    } else {
      res.json([]);
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orders = req.body;
      let oldOrders = [];
      if (fs.existsSync(ORDERS_FILE)) {
        try {
          oldOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
        } catch (e) {
          oldOrders = [];
        }
      }

      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders));
      logToFile(`Orders updated. Total orders: ${orders.length}`);
      
      // Check if this is a new order by comparing IDs
      if (orders && orders.length > 0) {
        const newOrder = orders[0];
        const isAlreadyProcessed = oldOrders.some((o: any) => o.id === newOrder.id);

        if (!isAlreadyProcessed) {
          logToFile(`New order detected: ${newOrder.id}. Sending email...`);
          
          // Award Loyalty Points
          try {
            if (fs.existsSync(SETTINGS_FILE)) {
              const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
              if (settings && settings.loyaltyEnabled) {
                const phone = newOrder.customer.phone;
                const pointsToEarn = Math.floor(newOrder.total * (settings.pointsPerTL || 1));
                
                let accounts = [];
                if (fs.existsSync(LOYALTY_FILE)) {
                  accounts = JSON.parse(fs.readFileSync(LOYALTY_FILE, "utf-8"));
                }
                
                let account = accounts.find((a: any) => a.phone === phone);
                if (!account) {
                  account = { phone, points: 0, history: [] };
                  accounts.push(account);
                }
                
                account.points += pointsToEarn;
                account.history.push({
                  type: 'earn',
                  amount: pointsToEarn,
                  timestamp: Date.now(),
                  description: `Sipariş #${newOrder.id.slice(-6)} kazancı`
                });
                
                fs.writeFileSync(LOYALTY_FILE, JSON.stringify(accounts));
                logToFile(`Loyalty points awarded to ${phone}: ${pointsToEarn}`);
              }
            }
          } catch (loyaltyError) {
            logToFile(`Error awarding loyalty points: ${loyaltyError}`);
          }

          // We don't await here to not block the response
          sendOrderEmail({
            id: newOrder.id,
            customerName: `${newOrder.customer.firstName} ${newOrder.customer.lastName}`,
            customerPhone: newOrder.customer.phone,
            customerAddress: newOrder.customer.address,
            paymentMethod: newOrder.customer.paymentMethod,
            items: newOrder.items,
            total: newOrder.total,
            createdAt: newOrder.timestamp
          });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      logToFile(`Error saving orders: ${error}`);
      res.status(500).json({ success: false, error: "Siparişler kaydedilemedi" });
    }
  });

  app.get("/api/settings", (req, res) => {
    if (fs.existsSync(SETTINGS_FILE)) {
      const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
      res.json(settings);
    } else {
      res.json(null);
    }
  });

  app.post("/api/settings", (req, res) => {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body));
    res.json({ success: true });
  });

  // Loyalty Endpoints
  app.get("/api/loyalty", (req, res) => {
    if (fs.existsSync(LOYALTY_FILE)) {
      const accounts = JSON.parse(fs.readFileSync(LOYALTY_FILE, "utf-8"));
      res.json(accounts);
    } else {
      res.json([]);
    }
  });

  app.get("/api/loyalty/:phone", (req, res) => {
    const { phone } = req.params;
    if (fs.existsSync(LOYALTY_FILE)) {
      const accounts = JSON.parse(fs.readFileSync(LOYALTY_FILE, "utf-8"));
      const account = accounts.find((a: any) => a.phone === phone);
      res.json(account || { phone, points: 0, history: [] });
    } else {
      res.json({ phone, points: 0, history: [] });
    }
  });

  app.post("/api/loyalty/redeem", (req, res) => {
    const { phone, pointsToRedeem, description } = req.body;
    try {
      let accounts = [];
      if (fs.existsSync(LOYALTY_FILE)) {
        accounts = JSON.parse(fs.readFileSync(LOYALTY_FILE, "utf-8"));
      }
      
      let account = accounts.find((a: any) => a.phone === phone);
      if (!account || account.points < pointsToRedeem) {
        return res.status(400).json({ success: false, error: "Yetersiz puan" });
      }

      account.points -= pointsToRedeem;
      account.history.push({
        type: 'redeem',
        amount: pointsToRedeem,
        timestamp: Date.now(),
        description: description || "Puan kullanımı"
      });

      fs.writeFileSync(LOYALTY_FILE, JSON.stringify(accounts));
      logToFile(`Points redeemed for ${phone}: ${pointsToRedeem}`);
      res.json({ success: true, points: account.points });
    } catch (error) {
      logToFile(`Error redeeming points: ${error}`);
      res.status(500).json({ success: false, error: "Puan kullanılamadı" });
    }
  });

  app.get("/api/backup", (req, res) => {
    try {
      const backup: any = {};
      const files = [
        { key: 'menu', path: MENU_FILE },
        { key: 'orders', path: ORDERS_FILE },
        { key: 'settings', path: SETTINGS_FILE },
        { key: 'messages', path: MESSAGES_FILE },
        { key: 'feedbacks', path: FEEDBACKS_FILE },
        { key: 'coupons', path: COUPONS_FILE },
        { key: 'franchise', path: FRANCHISE_FILE },
        { key: 'loyalty', path: LOYALTY_FILE }
      ];

      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          backup[file.key] = JSON.parse(fs.readFileSync(file.path, "utf-8"));
        }
      });

      res.json(backup);
    } catch (error) {
      res.status(500).json({ error: "Yedek oluşturulamadı" });
    }
  });

  app.post("/api/reset-data", (req, res) => {
    try {
      fs.writeFileSync(MENU_FILE, JSON.stringify(DEFAULT_MENU));
      fs.writeFileSync(ORDERS_FILE, "[]");
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS));
      fs.writeFileSync(MESSAGES_FILE, "[]");
      fs.writeFileSync(FEEDBACKS_FILE, "[]");
      fs.writeFileSync(COUPONS_FILE, "[]");
      fs.writeFileSync(FRANCHISE_FILE, "[]");
      fs.writeFileSync(LOYALTY_FILE, "[]");
      
      logToFile("All data reset to defaults by admin");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Veriler sıfırlanamadı" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
