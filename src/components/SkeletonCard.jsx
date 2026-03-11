export default function SkeletonCard() {
    return (
        <div className="card p-5 flex flex-col gap-4 animate-pulse">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-slate-200 dark:bg-navy-600 rounded-xl flex-shrink-0" />
                <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-navy-600 rounded-lg w-3/4 mb-2" />
                    <div className="h-3 bg-slate-100 dark:bg-navy-700 rounded-lg w-1/2" />
                </div>
            </div>
            <div className="flex gap-3">
                <div className="h-3 bg-slate-100 dark:bg-navy-700 rounded-lg w-24" />
                <div className="h-3 bg-slate-100 dark:bg-navy-700 rounded-lg w-20" />
            </div>
            <div className="flex gap-2">
                <div className="h-5 bg-slate-100 dark:bg-navy-700 rounded-full w-16" />
                <div className="h-5 bg-slate-100 dark:bg-navy-700 rounded-full w-14" />
                <div className="h-5 bg-slate-100 dark:bg-navy-700 rounded-full w-16" />
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-navy-600">
                <div className="h-3 bg-slate-100 dark:bg-navy-700 rounded w-16" />
                <div className="h-6 bg-slate-200 dark:bg-navy-600 rounded-lg w-16" />
            </div>
        </div>
    );
}
