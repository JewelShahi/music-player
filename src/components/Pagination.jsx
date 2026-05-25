import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, setPage, hasMore, total, perPage }) {
  const maxPage = total != null ? Math.ceil(total / perPage) - 1 : null;
  const canNext = hasMore || (maxPage != null && page < maxPage);

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <button
        onClick={() => setPage(Math.max(0, page - 1))}
        disabled={page === 0}
        className="btn btn-sm btn-ghost text-slate-400 gap-1"
      >
        <ChevronLeft size={16} /> Prev
      </button>

      <div className="flex items-center gap-1">
        {page > 1 && (
          <button onClick={() => setPage(0)} className="btn btn-xs btn-ghost text-slate-500">1</button>
        )}
        {page > 2 && <span className="text-slate-600 px-1">…</span>}
        {page > 0 && (
          <button onClick={() => setPage(page - 1)} className="btn btn-xs btn-ghost text-slate-400">{page}</button>
        )}
        <button className="btn btn-xs btn-active bg-accent/20 border-accent/30 text-accent-light">{page + 1}</button>
        {canNext && (
          <button onClick={() => setPage(page + 1)} className="btn btn-xs btn-ghost text-slate-400">{page + 2}</button>
        )}
        {canNext && page + 2 < (maxPage ?? 999) && <span className="text-slate-600 px-1">…</span>}
      </div>

      <button
        onClick={() => setPage(page + 1)}
        disabled={!canNext}
        className="btn btn-sm btn-ghost text-slate-400 gap-1"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}