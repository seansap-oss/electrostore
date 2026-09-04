import { ToastForm } from "@/components/ToastForm";
export const metadata = { title: "Contact Us" };
export default function ContactPage() {
  return (
    <div className="container-es grid max-w-5xl gap-6 py-8 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-extrabold">Contact Electrostore</h1>
        <p className="mt-1 text-sm text-charcoal-mute">Support 7 days, 8am–8pm AEST · 1300 000 000 · support@electrostore.com.au</p>
        <ToastForm toast="Message sent — we'll reply shortly" className="card mt-4 space-y-3 p-5">
          <div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="n">Name</label><input id="n" required className="input" /></div><div><label className="label" htmlFor="e">Email</label><input id="e" required type="email" className="input" /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="m">Mobile</label><input id="m" className="input" /></div><div><label className="label" htmlFor="o">Order (optional)</label><input id="o" className="input" placeholder="EL-…" /></div></div>
          <div><label className="label" htmlFor="s">Subject</label><input id="s" required className="input" /></div>
          <div><label className="label" htmlFor="msg">Message</label><textarea id="msg" required rows={5} className="input" /></div>
          <button className="btn-volt w-full">Send message</button>
        </ToastForm>
      </div>
      <aside className="card h-fit p-5"><h2 className="font-extrabold">Visit / write</h2><p className="text-sm text-charcoal-mute">Electrostore Pty Ltd<br />Level 1, 123 Tech Street<br />Melbourne VIC 3000<br />ABN 00 000 000 000</p>
        <h2 className="mt-4 font-extrabold">FAQ shortcuts</h2><ul className="list-disc pl-5 text-sm"><li>Delivery timelines</li><li>Returns & refunds</li><li>Warranty claims</li></ul></aside>
    </div>
  );
}
