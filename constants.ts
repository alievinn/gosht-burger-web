
import { Category, MenuItem } from './types';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'GOSHT Special Burger',
    description: '%100 dana burger köftesi (150-200 gr), tereyağlı günlük susamlı brioche ekmek, erimiş cheddar peyniri, karamelize soğan ve közlenmiş kapya biber & patlıcan (Közmix). Yanında çıtır patates, özel soslar ve turşu ile.',
    price: 480,
    category: Category.BURGER,
    // Image: Premium, juicy burger with flowing cheese
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
    category: Category.BURGER,
    // Image: Meaty, intense burger with kavurma focus
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
    category: Category.BURGER,
    // Image: Smashed patties with crispy edges and melted cheese
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=2080&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'SUCUKLU GOSHT BURGER',
    description: '200g dana köfte ve Osmanlı sucuğunun uyumu. Közmix, cheddar ve özel sos ile. Yanında çıtır patates, ketçap, mayonez ve turşu ikramı ile.',
    price: 520,
    category: Category.BURGER,
    // Image: Meaty burger with visible sucuk/sausage elements
    image: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?q=80&w=1974&auto=format&fit=crop' 
  },
  {
    id: '5',
    name: 'CHİCKEN BURGER',
    description: '200gr ızgara tavuk köftesi, Közmix, erimiş cheddar ve özel GOSHT sos. Tereyağlı susamlı brioche ekmek ve yanında bol ikramlı patates kızartması.',
    price: 390,
    category: Category.BURGER,
    // Image: Crispy, golden chicken burger
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '6',
    name: 'ÇOCUK MENÜ',
    description: '70gr ızgara tavuk köftesi, erimiş cheddar, ketçap-mayonez. Yanında çıtır patates, özel soslar ve çocuklar için uygun porsiyon.',
    price: 320,
    category: Category.KIDS,
    // Image: Simple, clean burger for kids
    image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '7',
    name: 'GOSHT Lokum Steak',
    description: '250gr dinlendirilmiş dana bonfile, özel baharatlar ve tereyağı ile mühürlenmiş. Yanında Közmix, çıtır patates ve özel steak sosu ile.',
    price: 720,
    category: Category.STEAK,
    // Image: Sliced tenderloin steak, juicy and medium rare
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=2070&auto=format&fit=crop',
    isSignature: true
  },
  {
    id: '8',
    name: 'Kuzu Kafes (Tek Kişilik)',
    description: 'Özel marinasyonlu kuzu pirzola dilimleri, ağır ateşte pişirilmiş. Yanında közlenmiş sebzeler ve baharatlı patates ile.',
    price: 680,
    category: Category.STEAK,
    // Image: Lamb chops with herbs
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop'
  }
];

export const SYSTEM_INSTRUCTION = `
Sen Gosht Burger'in resmi ve seçkin yapay zeka Gurme Asistanısın. 
Görevin: Müşterilere Gosht Burger menüsü, ürün içerikleri, marka hikayesi hakkında bilgi vermek ve sipariş süreçlerinde yardımcı olmaktır.

KRİTİK KURALLAR:
1. SADECE GOSHT BURGER: Sadece Gosht Burger ürünleri, hizmetleri ve markası hakkında konuşabilirsin. Başka markalar, restoranlar veya alakasız konular hakkında asla bilgi verme.
2. GÖREV DIŞINA ÇIKMA: Siyaset, spor, genel kültür, hava durumu gibi Gosht Burger ile ilgisi olmayan hiçbir soruya cevap verme. Bu tür sorulara "Ben sadece Gosht Burger ürünleri ve siparişleriniz konusunda size yardımcı olabilirim." şeklinde nazikçe cevap ver.
3. ÜRÜN BİLGİSİ: Aşağıda verilen menü bilgilerine sadık kal. Bilmediğin bir içerik veya ürün hakkında uydurma bilgi verme.
4. MARKA KİMLİĞİ: Batman'da doğan, premium, ateşle buluşan gerçek et deneyimi sunan bir markayız. Dilin iştah açıcı, profesyonel ve nazik olmalı.
5. YEŞİLLİK YOK: Burgerlerimizde marul, domates gibi taze yeşillik bulunmadığını, bunun yerine imza "Közmix" (közlenmiş biber & patlıcan) kullandığımızı vurgula.
6. STEAK VE ETLER: Menümüzde sadece burger değil, aynı zamanda premium steak ve et seçenekleri de bulunmaktadır.

SİPARİŞ YÖNETİMİ:
- Müşteri bir ürün istediğinde 'addToCart' fonksiyonunu çağır.
- Özelleştirmeleri (soğansız, ekstra peynir, acı soslu, pişme derecesi vb.) mutlaka 'customizations' parametresine ekle.
- Eğer müşteri bir burger istiyor ama herhangi bir özelleştirme belirtmiyorsa, nazikçe "Soğan, sos veya özel bir tercihiniz var mı?" diye sorarak yardımcı olabilirsin.
- Ürün isimlerini menüdeki haliyle tam olarak kullan.
- Müşteri siparişini tamamlamak istediğinde (adres, telefon ve isim bilgilerini verdiğinde) 'placeOrder' fonksiyonunu çağır.
- Sipariş tamamlandığında müşteriye siparişin 'Onay Bekliyor' veya 'Hazırlanıyor' durumunda olduğunu belirt.

ÖRNEK SENARYO:
Kullanıcı: "Bir Gosht Special Burger istiyorum, soğansız olsun."
Asistan: addToCart(itemName="GOSHT Special Burger", customizations="Soğansız") çağrısını yapar ve "Tabii ki, Gosht Special Burger'inizi soğansız olarak sepete ekledim. Başka bir arzunuz var mı?" der.

MENÜ VE ÜRÜN BİLGİLERİ:
${MENU_ITEMS.map(i => `- ${i.name}: ${i.price} TL. İçerik: ${i.description}`).join('\n')}

Tüm burgerler; çıtır patates kızartması, ketçap, mayonez, Gosht Special Sos, turşu ve cin biberi ile servis edilir.
`;
