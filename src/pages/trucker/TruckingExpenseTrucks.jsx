import { useState } from "react";
import { toast } from "react-toastify";
import { BASE_API_URL } from "../../apiConfig";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const emptyForm = () => ({
  truckNumber: "",
  trailerNumber: "",
  vin: "",
  notes: "",
});

const TruckingExpenseTrucks = () => {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const truckNumber = form.truckNumber.trim();
    if (!truckNumber) {
      toast.error("Truck number is required.");
      return;
    }

    const payload = {
      truckNumber,
      ...(form.trailerNumber.trim() ? { trailerNumber: form.trailerNumber.trim() } : {}),
      ...(form.vin.trim() ? { vin: form.vin.trim() } : {}),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    };

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_API_URL}/api/v1/trucking-expenses/trucks`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || `Request failed (${res.status})`);
      }
      toast.success(data?.message || "Truck saved successfully.");
      setForm(emptyForm());
    } catch (err) {
      toast.error(err?.message || "Failed to save truck.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Trucks</h1>
        <p className="mt-1 text-sm text-slate-600">
          Register a truck for expense tracking (linked to trucking expenses).
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 text-base font-semibold text-slate-800">Truck details</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              Truck number <span className="text-red-600">*</span>
            </span>
            <input
              type="text"
              value={form.truckNumber}
              onChange={handleChange("truckNumber")}
              placeholder="e.g. T-102"
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              autoComplete="off"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Trailer number</span>
            <input
              type="text"
              value={form.trailerNumber}
              onChange={handleChange("trailerNumber")}
              placeholder="e.g. TRL-55"
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              autoComplete="off"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">VIN</span>
            <input
              type="text"
              value={form.vin}
              onChange={handleChange("vin")}
              placeholder="Vehicle identification number"
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              autoComplete="off"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Notes</span>
            <textarea
              value={form.notes}
              onChange={handleChange("notes")}
              rows={3}
              placeholder="Primary lane truck, etc."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setForm(emptyForm())}
            disabled={submitting}
            className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save truck"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TruckingExpenseTrucks;
