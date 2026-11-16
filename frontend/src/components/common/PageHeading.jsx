const PageHeading = ({ eyebrow, title, description, action }) => (
  <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
    <div>
      {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sage-deep">{eyebrow}</p>}
      <h1 className="section-title mt-1.5 sm:text-[1.75rem]">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default PageHeading;
