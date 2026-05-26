import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, setPage, hasMore, total, perPage }) {
  const maxPage = total != null ? Math.ceil(total / perPage) - 1 : null;
  const canNext = hasMore || (maxPage != null && page < maxPage);
  const canPrev = page > 0;
  const current = page + 1;
  const totalPages = maxPage != null ? maxPage + 1 : null;

  const pages = [];

  if (totalPages) {
    const left = Math.max(1, current - 1);
    const right = Math.min(totalPages, current + 1);

    if (left > 2) pages.push(1, "...");
    else for (let i = 1; i < left; i++) pages.push(i);

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < totalPages - 1) pages.push("...", totalPages);
    else for (let i = right + 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (page > 1) pages.push(1);
    if (page > 2) pages.push("...");
    if (page > 0) pages.push(current - 1);
    pages.push(current);
    if (canNext) pages.push(current + 1);
    if (canNext && hasMore) pages.push("...");
  }

  const arrowBtn = "btn btn-sm btn-circle shrink-0 bg-transparent border-transparent text-primary/50 hover:bg-primary/10 hover:text-primary/80 hover:border-transparent disabled:opacity-30";
  const pageBtn = "btn btn-sm shrink-0 px-3 min-w-[2rem] rounded-full bg-transparent border-transparent text-primary/50 hover:bg-primary/10 hover:text-primary/80 hover:border-transparent";
  const activeBtn = "btn btn-sm shrink-0 px-3 min-w-[2rem] rounded-full bg-primary/15 border border-primary/25 text-primary font-medium hover:bg-primary/20 hover:border-primary/35";

  return (
    <nav className="flex items-center justify-center gap-1 pt-8 pb-20" aria-label="Pagination">
      <button
        onClick={() => setPage(page - 1)}
        disabled={!canPrev}
        className={arrowBtn}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="w-8 text-center text-primary/30 tracking-widest select-none text-sm">
            ···
          </span>
        ) : (
          <button
            key={p}
            onClick={() => p !== current && setPage(p - 1)}
            aria-current={p === current ? "page" : undefined}
            className={p === current ? activeBtn : pageBtn}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => setPage(page + 1)}
        disabled={!canNext}
        className={arrowBtn}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}