/**
 * Standalone mock catalog seeder.
 * Usage: node scripts/seed-mock.mjs
 *        node scripts/seed-mock.mjs --force
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) throw new Error("Missing .env.local");
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const MOCK_CATEGORIES = [
  { name: "Ready to Wear", slug: "ready-to-wear" },
  { name: "Unstitched", slug: "unstitched" },
  { name: "Festive Edit", slug: "festive-edit" },
  { name: "Everyday Essentials", slug: "everyday-essentials" },
  { name: "Premium Abayas", slug: "premium-abayas" },
];

function img(seed, w = 900, h = 1200) {
  return {
    url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
    publicId: `mock/${seed}`,
    alt: seed.replace(/-/g, " "),
  };
}

const PRODUCTS = [
  ["Rose Jacquard 3 Piece", "rose-jacquard-3-piece", "Structured jacquard three-piece with soft rose ground.", 9990, 5994, "ready-to-wear", "RTW Luxury", "ZR-RTW-RJ3-051", ["S", "M", "L", "XL"], ["Rose", "Ivory"], "Jacquard blend", "ziora-rose-jacquard", 18, true, true],
  ["Lilac Lawn 2 Piece", "lilac-lawn-2-piece", "Breathable lawn two-piece in muted lilac.", 6490, 3894, "ready-to-wear", "RTW Basic", "ZR-RTW-LL2-020", ["XS", "S", "M", "L"], ["Lilac"], "Premium lawn", "ziora-lilac-lawn", 24, true, true],
  ["Multi Lawn 3 Piece", "multi-lawn-3-piece", "Printed lawn three-piece with coordinated dupatta.", 9290, 5574, "ready-to-wear", "RTW Basic", "ZR-RTW-ML3-7A1", ["S", "M", "L", "XL"], ["Multi"], "Lawn", "ziora-multi-lawn", 14, false, true],
  ["Peach Jacquard Kurti", "peach-jacquard-kurti", "Single-piece jacquard kurti in soft peach.", 3980, 2786, "ready-to-wear", "RTW Basic", "ZR-RTW-PJK-002", ["S", "M", "L", "XL", "XXL"], ["Peach"], "Jacquard", "ziora-peach-kurti", 32, true, false],
  ["White Cambric 2 Piece", "white-cambric-2-piece", "Crisp white cambric set with subtle texture.", 5490, 3294, "ready-to-wear", "RTW Basic", "ZR-RTW-WC2-113", ["S", "M", "L"], ["White"], "Cambric", "ziora-white-cambric", 11, false, true],
  ["Navy Blended Kurta", "navy-blended-kurta", "Deep navy blended kurta for daily office wear.", 4890, 2934, "ready-to-wear", "Ready To Wear", "ZR-RTW-NBK-009", ["XS", "S", "M", "L", "XL"], ["Navy"], "Blended cotton", "ziora-navy-kurta", 20, false, false],
  ["Misl Unstitched 3 Pc", "misl-unstitched-3pc", "Unstitched three-piece lawn with digital print panel.", 8990, 5394, "unstitched", "Unstitched Basic", "ZR-US-MIS-062", ["Free Size"], ["Multi"], "Lawn", "ziora-misl-us", 40, true, true],
  ["Lavender Royale 3 Pc", "lavender-royale-3pc", "Soft lavender unstitched suite with embroidered neckline.", 7990, 4794, "unstitched", "Unstitched Basic", "ZR-US-LR-147", ["Free Size"], ["Lavender"], "Lawn + chiffon", "ziora-lavender-royale", 28, true, false],
  ["Dandelion Dream 3 Pc", "dandelion-dream-3pc", "Sunny dandelion print on airy lawn.", 8990, 5394, "unstitched", "Unstitched Basic", "ZR-US-DD-047", ["Free Size"], ["Yellow Multi"], "Lawn", "ziora-dandelion", 22, false, true],
  ["Zarposh Barkha 3 Pc", "zarposh-barkha-3pc", "Monsoon-inspired barkha print unstitched set.", 8990, 5394, "unstitched", "Unstitched Basic", "ZR-US-ZB-047", ["Free Size"], ["Teal Multi"], "Lawn", "ziora-zarposh", 16, false, false],
  ["L-Blue Jacquard Unstitched", "l-blue-jacquard-unstitched", "Luxury light-blue jacquard unstitched three-piece.", 5990, 3594, "unstitched", "Unstitched Luxury", "ZR-US-LBJ-049", ["Free Size"], ["Light Blue"], "Jacquard", "ziora-lblue-jacq", 12, true, true],
  ["Lime Zest 3 Pc", "lime-zest-3pc", "Fresh lime print unstitched set for summer.", 5290, 3703, "unstitched", "Unstitched Basic", "ZR-US-LZ-4M7", ["Free Size"], ["Lime"], "Lawn", "ziora-lime-zest", 35, true, false],
  ["Rust Jacquard 3 Piece", "rust-jacquard-3-piece", "Warm rust jacquard unstitched three-piece.", 6490, 4543, "unstitched", "Unstitched Basic", "ZR-US-RJ-1F8", ["Free Size"], ["Rust"], "Jacquard", "ziora-rust-jacq", 19, false, true],
  ["Nomadic 2 Pc", "nomadic-2pc", "Compact two-piece unstitched print.", 2790, 1953, "unstitched", "Unstitched Basic", "ZR-US-NOM-512", ["Free Size"], ["Sand"], "Cambric", "ziora-nomadic", 48, true, false],
  ["Zoey Festive 3 Pc", "zoey-festive-3pc", "Festive unstitched luxury with sequin accents.", 7990, 5593, "festive-edit", "Unstitched Luxury", "ZR-FE-ZOEY-124", ["Free Size"], ["Ivory Gold"], "Organza blend", "ziora-zoey-festive", 9, true, true],
  ["Nora Festive 3 Pc", "nora-festive-3pc", "Deep emerald festive suite with zari borders.", 7390, 4434, "festive-edit", "Unstitched Luxury", "ZR-FE-NORA-088", ["Free Size"], ["Emerald"], "Net + silk blend", "ziora-nora-festive", 7, true, true],
  ["Zariyah Festive 3 Pc", "zariyah-festive-3pc", "Rich maroon festive three-piece with embroidery.", 8990, 6293, "festive-edit", "Unstitched Luxury", "ZR-FE-ZAR-9O7", ["Free Size"], ["Maroon"], "Embroidered lawn + tissue", "ziora-zariyah", 6, false, true],
  ["Pure Elegance 3 Pc", "pure-elegance-3pc", "Ivory-on-ivory festive embroidery with pearl detail.", 9990, 6993, "festive-edit", "Unstitched Luxury", "ZR-FE-PE-10N5", ["Free Size"], ["Ivory"], "Organza", "ziora-pure-elegance", 5, true, false],
  ["Aura Everyday Kurta", "aura-everyday-kurta", "Soft everyday kurta in muted sage.", 4990, 3493, "everyday-essentials", "Everyday", "ZR-EE-AURA-2M5", ["S", "M", "L", "XL"], ["Sage", "Stone"], "Cotton blend", "ziora-aura-kurta", 30, true, true],
  ["Skyline 2 Pc Essential", "skyline-2pc-essential", "Minimal sky-blue two-piece for daily wear.", 2790, 1953, "everyday-essentials", "Everyday", "ZR-EE-SKY-4M6", ["S", "M", "L"], ["Sky"], "Lawn", "ziora-skyline", 42, true, false],
  ["Basis Printed 3 Pc", "basis-printed-3pc", "Everyday printed three-piece in soft pastels.", 5290, 3703, "everyday-essentials", "Everyday", "ZR-EE-BAS-4M5", ["S", "M", "L", "XL"], ["Pastel Multi"], "Lawn", "ziora-basis", 26, false, true],
  ["Gul Bahar Essential", "gul-bahar-essential", "Floral gul bahar print on soft cotton.", 9990, 6993, "everyday-essentials", "Everyday", "ZR-EE-GB-1F5", ["S", "M", "L"], ["Floral"], "Cotton", "ziora-gulbahar", 15, false, false],
  ["Noir Flow Abaya", "noir-flow-abaya", "Fluid black abaya with soft shoulder drape.", 8490, 0, "premium-abayas", "Premium Abayas", "ZR-AB-NOIR-001", ["S", "M", "L", "XL"], ["Black"], "Nida", "ziora-noir-abaya", 21, true, true],
  ["Sand Whisper Abaya", "sand-whisper-abaya", "Warm sand abaya with subtle cuff detail.", 7890, 6312, "premium-abayas", "Premium Abayas", "ZR-AB-SAND-014", ["S", "M", "L", "XL"], ["Sand"], "Premium nida", "ziora-sand-abaya", 13, true, true],
  ["Olive Umbrella Abaya", "olive-umbrella-abaya", "Umbrella-cut olive abaya with soft volume.", 7290, 0, "premium-abayas", "Premium Abayas", "ZR-AB-OLV-022", ["M", "L", "XL"], ["Olive"], "Nida", "ziora-olive-abaya", 8, false, false],
  ["Ivory Crescent Abaya", "ivory-crescent-abaya", "Ivory abaya with crescent embroidery at the cuff.", 9190, 7352, "premium-abayas", "Premium Abayas", "ZR-AB-IVC-031", ["S", "M", "L"], ["Ivory"], "Crepe nida", "ziora-ivory-abaya", 4, true, true],
];

const categorySchema = new mongoose.Schema(
  { name: String, slug: { type: String, unique: true } },
  { timestamps: { createdAt: true, updatedAt: false } }
);
const productSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
    price: Number,
    discountPrice: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    productLine: String,
    sku: { type: String, unique: true },
    sizes: [String],
    colors: [String],
    fabric: String,
    careInstructions: String,
    images: [{ url: String, publicId: String, alt: String }],
    thumbnail: { url: String, publicId: String, alt: String },
    stockQuantity: Number,
    isNewArrival: Boolean,
    isFeatured: Boolean,
    ratingAverage: Number,
    ratingCount: Number,
  },
  { timestamps: true }
);

async function main() {
  const force = process.argv.includes("--force");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing in .env.local");

  console.log("Connecting…");
  await mongoose.connect(uri, { bufferCommands: false });
  const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
  const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

  if (force) {
    console.log("Force mode: clearing ZR- mock products + mock categories…");
    await Product.deleteMany({ sku: /^ZR-/ });
    await Category.deleteMany({ slug: { $in: MOCK_CATEGORIES.map((c) => c.slug) } });
  }

  const bySlug = new Map();
  for (const cat of MOCK_CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { name: cat.name, slug: cat.slug },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    bySlug.set(cat.slug, doc._id);
    console.log("Category:", cat.name);
  }

  let upserted = 0;
  for (const row of PRODUCTS) {
    const [name, slug, description, price, discountPrice, categorySlug, productLine, sku, sizes, colors, fabric, imageSeed, stockQuantity, isNewArrival, isFeatured] = row;
    const thumbnail = { ...img(imageSeed), alt: name };
    const images = [
      { ...img(`${imageSeed}-a`), alt: `${name} detail` },
      { ...img(`${imageSeed}-b`), alt: `${name} back` },
      { ...img(`${imageSeed}-c`), alt: `${name} fabric` },
    ];
    await Product.findOneAndUpdate(
      { sku },
      {
        name,
        slug,
        description,
        price,
        discountPrice,
        category: bySlug.get(categorySlug),
        productLine,
        sku,
        sizes,
        colors,
        fabric,
        careInstructions: "See product page for care guidance",
        thumbnail,
        images,
        stockQuantity,
        isNewArrival,
        isFeatured,
        ratingAverage: 4.3,
        ratingCount: 18,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    upserted += 1;
    console.log("Product:", name);
  }

  const [products, categories] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
  ]);
  console.log(`\nDone. Upserted ${upserted} mock products.`);
  console.log(`Totals — products: ${products}, categories: ${categories}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
