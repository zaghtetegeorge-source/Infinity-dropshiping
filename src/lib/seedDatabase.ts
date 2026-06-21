// Bootstraps the store with a default admin account and demo catalog data so
// it can be browsed and tested end-to-end before real products are added.
// Re-runnable: demo catalog data is replaced on each run, while the admin
// account is only created if it doesn't already exist (so a changed
// password survives re-seeding). Shared by the `db:seed` CLI script and the
// one-time `/api/admin/seed` endpoint (used to seed a freshly connected
// production database from a deploy with no local DB access).
import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function img(seed: string, alt: string) {
  return { url: `https://picsum.photos/seed/${seed}/800/800`, alt };
}

export async function seedDatabase(prisma: PrismaClient) {
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@infinitystore.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "ChangeMe123!";

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash, name: "Store Admin" },
  });

  // Clear demo catalog data (safe for a fresh/dev database only).
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({ data: { slug: "electronics", nameEn: "Electronics", nameAr: "إلكترونيات" } }),
    prisma.category.create({ data: { slug: "home-kitchen", nameEn: "Home & Kitchen", nameAr: "المنزل والمطبخ" } }),
    prisma.category.create({ data: { slug: "beauty", nameEn: "Beauty & Personal Care", nameAr: "الجمال والعناية الشخصية" } }),
    prisma.category.create({ data: { slug: "accessories", nameEn: "Fashion Accessories", nameAr: "إكسسوارات" } }),
  ]);

  const [electronics, homeKitchen, beauty, accessories] = categories;

  const sampleReviews = [
    { authorName: "Sara A.", rating: 5, titleText: "Excellent quality", bodyText: "Arrived fast and works perfectly. Highly recommend!" },
    { authorName: "Mohammed K.", rating: 4, titleText: "Good value", bodyText: "Good product for the price, exactly as described." },
    { authorName: "Fatima R.", rating: 5, titleText: null, bodyText: "Love it! Will buy again." },
  ];

  const products = [
    {
      slug: "wireless-earbuds-pro",
      titleEn: "Wireless Earbuds Pro",
      titleAr: "سماعات لاسلكية برو",
      descriptionEn: "True wireless earbuds with active noise cancellation, 30-hour battery life, and IPX5 water resistance.",
      descriptionAr: "سماعات لاسلكية حقيقية مع خاصية إلغاء الضجيج النشط، بطارية تدوم 30 ساعة، ومقاومة للماء IPX5.",
      brand: "Infinity Audio",
      gtin: "0123456789012",
      price: 149,
      compareAtPrice: 219,
      stock: 80,
      featured: true,
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      categoryId: electronics.id,
      images: [img("earbuds-1", "Wireless earbuds in case"), img("earbuds-2", "Wireless earbuds close-up")],
      variants: [
        { nameEn: "Black", nameAr: "أسود", sku: "EARBUDS-PRO-BLK", priceDelta: 0, stock: 40 },
        { nameEn: "White", nameAr: "أبيض", sku: "EARBUDS-PRO-WHT", priceDelta: 0, stock: 40 },
      ],
    },
    {
      slug: "smart-watch-fit",
      titleEn: "Smart Watch Fit",
      titleAr: "ساعة ذكية فيت",
      descriptionEn: "Fitness smartwatch with heart-rate monitor, sleep tracking, and 7-day battery life.",
      descriptionAr: "ساعة ذكية رياضية مع جهاز قياس معدل ضربات القلب، تتبع النوم، وبطارية تدوم 7 أيام.",
      brand: "Infinity Wear",
      price: 199,
      compareAtPrice: 279,
      stock: 60,
      featured: true,
      categoryId: electronics.id,
      images: [img("watch-1", "Smart watch on wrist"), img("watch-2", "Smart watch face")],
      variants: [
        { nameEn: "Black", nameAr: "أسود", sku: "WATCH-FIT-BLK", priceDelta: 0, stock: 30 },
        { nameEn: "Silver", nameAr: "فضي", sku: "WATCH-FIT-SLV", priceDelta: 20, stock: 30 },
      ],
    },
    {
      slug: "portable-blender",
      titleEn: "Portable USB Blender",
      titleAr: "خلاط محمول USB",
      descriptionEn: "Compact rechargeable blender for smoothies and shakes on the go. USB-C charging.",
      descriptionAr: "خلاط محمول قابل لإعادة الشحن لتحضير العصائر والمشروبات أثناء التنقل. شحن USB-C.",
      brand: "Infinity Home",
      price: 89,
      stock: 120,
      categoryId: homeKitchen.id,
      images: [img("blender-1", "Portable blender"), img("blender-2", "Blender in use")],
      variants: [],
    },
    {
      slug: "led-strip-lights",
      titleEn: "RGB LED Strip Lights",
      titleAr: "شريط إضاءة LED متعدد الألوان",
      descriptionEn: "5-meter smart RGB LED strip with app and voice control, perfect for room ambiance.",
      descriptionAr: "شريط إضاءة LED ذكي متعدد الألوان بطول 5 أمتار مع تحكم بالتطبيق والصوت، مثالي لإضاءة الغرفة.",
      brand: "Infinity Home",
      price: 59,
      compareAtPrice: 89,
      stock: 150,
      featured: true,
      categoryId: homeKitchen.id,
      images: [img("led-1", "LED strip lights on wall"), img("led-2", "LED strip lights colors")],
      variants: [],
    },
    {
      slug: "facial-cleansing-brush",
      titleEn: "Facial Cleansing Brush",
      titleAr: "فرشاة تنظيف الوجه",
      descriptionEn: "Silicone facial cleansing brush with 3 speed modes, waterproof and rechargeable.",
      descriptionAr: "فرشاة تنظيف وجه من السيليكون مع 3 أوضاع سرعة، مقاومة للماء وقابلة لإعادة الشحن.",
      brand: "Infinity Beauty",
      price: 69,
      stock: 90,
      categoryId: beauty.id,
      images: [img("brush-1", "Facial cleansing brush"), img("brush-2", "Facial brush in hand")],
      variants: [
        { nameEn: "Pink", nameAr: "وردي", sku: "FACEBRUSH-PNK", priceDelta: 0, stock: 45 },
        { nameEn: "Blue", nameAr: "أزرق", sku: "FACEBRUSH-BLU", priceDelta: 0, stock: 45 },
      ],
    },
    {
      slug: "hair-styling-tool",
      titleEn: "Ionic Hair Styler",
      titleAr: "مصفف شعر أيوني",
      descriptionEn: "2-in-1 ionic hair straightener and curler with ceramic plates for salon-quality results.",
      descriptionAr: "مصفف شعر أيوني 2 في 1 (فرد وتجعيد) بألواح سيراميك لنتائج بجودة الصالون.",
      brand: "Infinity Beauty",
      price: 119,
      compareAtPrice: 159,
      stock: 70,
      categoryId: beauty.id,
      images: [img("hairtool-1", "Hair styling tool"), img("hairtool-2", "Hair styler on hair")],
      variants: [],
    },
    {
      slug: "leather-wallet",
      titleEn: "Genuine Leather Wallet",
      titleAr: "محفظة جلد طبيعي",
      descriptionEn: "Slim genuine leather bifold wallet with RFID-blocking card slots.",
      descriptionAr: "محفظة جلد طبيعي رفيعة قابلة للطي مع فتحات بطاقات تحمي من قراءة RFID.",
      brand: "Infinity Accessories",
      price: 79,
      stock: 110,
      categoryId: accessories.id,
      images: [img("wallet-1", "Leather wallet"), img("wallet-2", "Leather wallet open")],
      variants: [
        { nameEn: "Brown", nameAr: "بني", sku: "WALLET-BRN", priceDelta: 0, stock: 55 },
        { nameEn: "Black", nameAr: "أسود", sku: "WALLET-BLK", priceDelta: 0, stock: 55 },
      ],
    },
    {
      slug: "sunglasses-classic",
      titleEn: "Classic Polarized Sunglasses",
      titleAr: "نظارات شمسية كلاسيكية مستقطبة",
      descriptionEn: "UV400 polarized sunglasses with a lightweight metal frame, unisex design.",
      descriptionAr: "نظارات شمسية مستقطبة بحماية UV400 وإطار معدني خفيف الوزن، تصميم للجنسين.",
      brand: "Infinity Accessories",
      price: 99,
      compareAtPrice: 139,
      stock: 95,
      featured: true,
      categoryId: accessories.id,
      images: [img("sunglasses-1", "Classic sunglasses"), img("sunglasses-2", "Sunglasses lifestyle")],
      variants: [],
    },
  ];

  for (const p of products) {
    const { images, variants, ...data } = p;
    await prisma.product.create({
      data: {
        ...data,
        images: { create: images.map((image, i) => ({ ...image, position: i })) },
        variants: { create: variants },
        reviews: { create: sampleReviews },
      },
    });
  }

  return { adminEmail, adminPassword, productCount: products.length, categoryCount: categories.length };
}
