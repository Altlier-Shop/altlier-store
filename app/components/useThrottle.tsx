import {useRef, useCallback} from 'react';

export default function useThrottle(
  callback: (event: WheelEvent) => void,
  delay: number,
) {
  const lastCall = useRef(0);

  const throttledFunc = useCallback(
    (...args: any[]) => {
      const now = new Date().getTime();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        // @ts-expect-error
        callback(...args);
      }
    },
    [callback, delay],
  );

  return throttledFunc;
}
