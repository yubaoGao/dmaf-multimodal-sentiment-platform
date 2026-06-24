import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function LazyImage({ src, alt, className }: LazyImageProps) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return <img ref={ref} src={visible ? src : undefined} alt={alt} className={className} />;
}
