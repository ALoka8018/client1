const HISTORY = [
  {
    icon: "bolt",
    title: "Electrical Panel Upgrade",
    subtitle: "Preventative",
    date: "May 12, 2024",
    amount: "$450.00",
  },
  {
    icon: "ac_unit",
    title: "HVAC Annual Service",
    subtitle: "Maintenance",
    date: "Mar 05, 2024",
    amount: "$180.00",
  },
];

export function MaintenanceHistory() {
  return (
    <section className="mt-12">
      <h3 className="mb-6 px-4 font-display text-headline-md text-primary-container">
        Maintenance History
      </h3>
      <div className="glass overflow-hidden rounded-3xl">
        <table className="w-full text-left">
          <thead className="bg-surface-container font-sans text-label-md text-on-surface-variant">
            <tr>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container font-sans text-body-md">
            {HISTORY.map((row) => (
              <tr key={row.title} className="transition-colors hover:bg-surface-container-low">
                <td className="flex items-center gap-3 px-6 py-4">
                  <span className="material-symbols-outlined text-primary">
                    {row.icon}
                  </span>
                  <div>
                    <p className="font-semibold">{row.title}</p>
                    <p className="text-label-md text-on-surface-variant">
                      {row.subtitle}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-on-surface-variant">{row.date}</td>
                <td className="px-6 py-4 font-semibold text-primary">
                  {row.amount}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-label-md text-primary">
                    COMPLETED
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    className="text-label-md text-primary hover:underline"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
