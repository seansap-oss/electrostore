import { notFound } from "next/navigation";
import prisma from "@/lib/db";
const FALLBACK: Record<string, { title: string; body: string }> = {
  about: { title: "About Electrostore", body: "Electrostore is Australia's home for smart tech, appliances and everyday essentials — great prices, local warranty and fast delivery." },
  shipping: { title: "Delivery Information", body: "Standard 2–7 business days, express 1–3. Free standard delivery over $99 on eligible products." },
  returns: { title: "Returns & Refunds", body: "30-day change-of-mind returns on eligible items. Faults covered under Australian Consumer Law." },
  warranty: { title: "Warranty", body: "Manufacturer warranty plus your rights under Australian Consumer Law." },
  privacy: { title: "Privacy Policy", body: "We collect only what we need to fulfil orders. We never sell your data." },
  terms: { title: "Terms & Conditions", body: "Prices are GST-inclusive in AUD." },
  faq: { title: "FAQs", body: "Track orders from your account. Contact support with your order number for fastest help." }
};
export async function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: FALLBACK[params.slug]?.title ?? params.slug };
}
export default async function SitePage({ params }: { params: { slug: string } }) {
  let page = FALLBACK[params.slug] ?? null;
  try {
    const row = await prisma.sitePage.findUnique({ where: { slug: params.slug } });
    if (row) page = { title: row.title, body: row.body };
  } catch {}
  if (!page) notFound();
  return (
    <div className="container-es max-w-3xl py-10">
      <h1 className="text-3xl font-extrabold">{page.title}</h1>
      <div className="card mt-4 p-6 text-[15px] leading-relaxed">{page.body}</div>
    </div>
  );
}
