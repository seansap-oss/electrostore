import { ToastForm } from "@/components/ToastForm";
export const metadata = { title: "Addresses" };
export default function AddressesPage() {
  return (
    <div className="container-es max-w-2xl py-8">
      <h1 className="text-3xl font-extrabold">Saved addresses</h1>
      <ToastForm toast="Address saved" className="card mt-4 grid gap-3 p-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="fn">First name</label><input id="fn" required className="input" /></div>
        <div><label className="label" htmlFor="ln">Last name</label><input id="ln" required className="input" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="st">Address</label><input id="st" required className="input" /></div>
        <div><label className="label" htmlFor="su">Suburb</label><input id="su" required className="input" /></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="sta">State</label><select id="sta" className="input"><option>NSW</option><option>VIC</option><option>QLD</option><option>SA</option><option>WA</option><option>TAS</option><option>NT</option><option>ACT</option></select></div>
        <div><label className="label" htmlFor="pc">Postcode</label><input id="pc" required pattern="\d{4}" className="input" /></div></div>
        <button className="btn-volt sm:col-span-2">Save address</button>
      </ToastForm>
    </div>
  );
}
