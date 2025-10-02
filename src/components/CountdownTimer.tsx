import { useEffect, useState } from 'react';
import { formatCountdown } from '@/utils/countdown';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endDate: Date | string;
  className?: string;
  compact?: boolean;
}

export const CountdownTimer = ({ endDate, className = '', compact = false }: CountdownTimerProps) => {
  const [countdown, setCountdown] = useState(formatCountdown(endDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(endDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  if (countdown.isEnded) {
    return (
      <div className={`flex items-center gap-2 text-destructive ${className}`}>
        <Clock className="h-4 w-4" />
        <span className="font-semibold">Ended</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Clock className="h-4 w-4" />
        <span className="font-semibold">
          {countdown.days > 0 && `${countdown.days}d `}
          {countdown.hours}h {countdown.minutes}m
        </span>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-4 gap-2 ${className}`}>
      <div className="text-center p-2 rounded-lg bg-muted/30">
        <div className="text-2xl font-bold">{countdown.days.toString().padStart(2, '0')}</div>
        <div className="text-xs text-muted-foreground">Days</div>
      </div>
      <div className="text-center p-2 rounded-lg bg-muted/30">
        <div className="text-2xl font-bold">{countdown.hours.toString().padStart(2, '0')}</div>
        <div className="text-xs text-muted-foreground">Hours</div>
      </div>
      <div className="text-center p-2 rounded-lg bg-muted/30">
        <div className="text-2xl font-bold">{countdown.minutes.toString().padStart(2, '0')}</div>
        <div className="text-xs text-muted-foreground">Mins</div>
      </div>
      <div className="text-center p-2 rounded-lg bg-muted/30">
        <div className="text-2xl font-bold">{countdown.seconds.toString().padStart(2, '0')}</div>
        <div className="text-xs text-muted-foreground">Secs</div>
      </div>
    </div>
  );
};
