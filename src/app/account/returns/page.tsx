import { ToastForm } from "@/components/ToastForm";
export const metadata = { title: "Returns" };
export default function ReturnsPage() {
  return (
    <div className="container-es max-w-2xl py-8">
      <h1 className="text-3xl font-extrabold">Returns</h1>
      <ToastForm toast="Return request submitted" className="card mt-4 space-y-3 p-5">
        <div><label className="label" htmlFor="ord">Order number</label><input id="ord" required placeholder="EL-260904-48291" className="input" /></div>
        <div><label className="label" htmlFor="rea">Reason</label><select id="rea" className="input"><option>Change of mind</option><option>Faulty</option><option>Wrong item</option><option>Damaged in transit</option></select></div>
        <div><label className="label" htmlFor="msg">Details</label><textarea id="msg" rows={4} className="input" placeholder="Tell us about the issue…" /></div>
        <button className="btn-dark">Submit return request</button>
      </ToastForm>
    </div>
  );
}
