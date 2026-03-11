import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

function easeOutQuart(t) {
    return 1 - (1 - t) ** 4;
}

export default function StatsCounter({ end, label, suffix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    useEffect(() => {
        if (!inView) return;
        const duration = 2000;
        const startTime = performance.now();
        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.round(easeOutQuart(progress) * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [inView, end]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl md:text-5xl font-display font-black text-white">
                {count.toLocaleString()}{suffix}
            </div>
            <div className="text-slate-300 text-sm md:text-base mt-1 font-medium">{label}</div>
        </div>
    );
}
