export function PaymentMethods() {
  return (
    <div className="glass rounded-3xl p-8">
      <h3 className="mb-8 font-display text-headline-md text-primary-container">
        Payment Methods
      </h3>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-12 items-center justify-center rounded bg-inverse-surface font-bold text-white italic">
              VISA
            </div>
            <div>
              <p className="font-sans text-label-md text-primary">
                Visa Platinum •••• 8842
              </p>
              <p className="text-sm text-body-md text-on-surface-variant">
                Expires 12/26
              </p>
            </div>
          </div>
          <span className="rounded bg-primary-container/10 px-3 py-1 text-label-sm font-bold text-primary-container">
            DEFAULT
          </span>
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant py-4 font-sans text-label-md text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          <span className="material-icon">add_card</span>
          Add New Payment Method
        </button>
      </div>
    </div>
  );
}
