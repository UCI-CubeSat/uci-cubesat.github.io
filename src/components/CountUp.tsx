import ReactCountUp from 'react-countup';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function CountUp({ end, duration = 4, prefix = '', suffix = '' }: CountUpProps) {
  return (
    <h1>
      <ReactCountUp
        end={end}
        duration={duration}
        prefix={prefix}
        suffix={suffix}
        enableScrollSpy
        scrollSpyOnce
      />
    </h1>
  );
}

