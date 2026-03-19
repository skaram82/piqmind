import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';

type Falloff = 'linear' | 'exponential' | 'gaussian';

export type VariableProximityProps = {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  containerRef?: React.RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: Falloff;
  fromColor?: string;
  toColor?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  style?: React.CSSProperties;
};

function useAnimationFrame(callback: () => void) {
  useEffect(() => {
    let frameId = 0;
    const loop = () => {
      callback();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [callback]);
}

function useMousePositionRef(containerRef: React.RefObject<HTMLElement | null>) {
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      const el = containerRef?.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        positionRef.current = { x: x - rect.left, y: y - rect.top };
      } else {
        positionRef.current = { x, y };
      }
    };

    const handleMouseMove = (ev: MouseEvent) => updatePosition(ev.clientX, ev.clientY);
    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0];
      if (!touch) return;
      updatePosition(touch.clientX, touch.clientY);
    };

    const target: HTMLElement | Window = containerRef?.current ?? window;
    target.addEventListener('mousemove', handleMouseMove);
    target.addEventListener('touchmove', handleTouchMove, { passive: true } as AddEventListenerOptions);
    return () => {
      target.removeEventListener('mousemove', handleMouseMove);
      target.removeEventListener('touchmove', handleTouchMove);
    };
  }, [containerRef]);

  return positionRef;
}

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>(
  (
    {
      label,
      fromFontVariationSettings,
      toFontVariationSettings,
      containerRef,
      radius = 50,
      falloff = 'linear',
      fromColor,
      toColor,
      className = '',
      onClick,
      style,
      ...restProps
    },
    ref
  ) => {
    const localContainerRef = useRef<HTMLSpanElement | null>(null);
    const effectiveContainerRef = (containerRef ?? localContainerRef) as React.RefObject<HTMLElement | null>;

    const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const interpolatedSettingsRef = useRef<string[]>([]);
    const interpolatedColorsRef = useRef<string[]>([]);
    const mousePositionRef = useMousePositionRef(effectiveContainerRef);
    const lastPositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

    const parsedSettings = useMemo(() => {
      const parseSettings = (settingsStr: string) =>
        new Map(
          settingsStr
            .split(',')
            .map((s) => s.trim())
            .map((s) => {
              const [name, value] = s.split(' ');
              return [name.replace(/['"]/g, ''), parseFloat(value)];
            })
        );

      const fromSettings = parseSettings(fromFontVariationSettings);
      const toSettings = parseSettings(toFontVariationSettings);

      return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
        axis,
        fromValue,
        toValue: toSettings.get(axis) ?? fromValue,
      }));
    }, [fromFontVariationSettings, toFontVariationSettings]);

    const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const calculateFalloff = (distance: number) => {
      const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
      switch (falloff) {
        case 'exponential':
          return norm ** 2;
        case 'gaussian':
          return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
        case 'linear':
        default:
          return norm;
      }
    };

    const parseColor = (color: string): [number, number, number] => {
      // basic hex support: #rgb, #rrggbb
      let c = color.trim();
      if (c.startsWith('#')) c = c.slice(1);
      if (c.length === 3) {
        const r = parseInt(c[0] + c[0], 16);
        const g = parseInt(c[1] + c[1], 16);
        const b = parseInt(c[2] + c[2], 16);
        return [r, g, b];
      }
      if (c.length === 6) {
        const r = parseInt(c.slice(0, 2), 16);
        const g = parseInt(c.slice(2, 4), 16);
        const b = parseInt(c.slice(4, 6), 16);
        return [r, g, b];
      }
      return [0, 0, 0];
    };

    const fromRGB = fromColor ? parseColor(fromColor) : null;
    const toRGB = toColor ? parseColor(toColor) : null;

    useAnimationFrame(() => {
      const container = effectiveContainerRef.current;
      if (!container) return;

      const { x, y } = mousePositionRef.current;
      if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) return;
      lastPositionRef.current = { x, y };

      const containerRect = container.getBoundingClientRect();

      letterRefs.current.forEach((letterRef, index) => {
        if (!letterRef) return;

        const rect = letterRef.getBoundingClientRect();
        const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
        const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

        const distance = calculateDistance(x, y, letterCenterX, letterCenterY);
        if (distance >= radius) {
          letterRef.style.fontVariationSettings = fromFontVariationSettings;
          if (fromRGB && toRGB) {
            letterRef.style.color = `rgb(${fromRGB[0]}, ${fromRGB[1]}, ${fromRGB[2]})`;
          }
          return;
        }

        const falloffValue = calculateFalloff(distance);
        const newSettings = parsedSettings
          .map(({ axis, fromValue, toValue }) => {
            const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue;
            return `'${axis}' ${interpolatedValue}`;
          })
          .join(', ');

        interpolatedSettingsRef.current[index] = newSettings;
        letterRef.style.fontVariationSettings = newSettings;

        if (fromRGB && toRGB) {
          const r = fromRGB[0] + (toRGB[0] - fromRGB[0]) * falloffValue;
          const g = fromRGB[1] + (toRGB[1] - fromRGB[1]) * falloffValue;
          const b = fromRGB[2] + (toRGB[2] - fromRGB[2]) * falloffValue;
          const color = `rgb(${r}, ${g}, ${b})`;
          interpolatedColorsRef.current[index] = color;
          letterRef.style.color = color;
        }
      });
    });

    const words = label.split(' ');
    let letterIndex = 0;

    return (
      <span
        ref={(node) => {
          localContainerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        onClick={onClick}
        style={{
          display: 'inline',
          // fontFamily: '"Roboto Flex Variable", "Roboto Flex", var(--aw-font-heading), sans-serif',
          ...style,
        }}
        className={className}
        {...restProps}
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {word.split('').map((letter) => {
              const currentLetterIndex = letterIndex++;
              return (
                <motion.span
                  key={currentLetterIndex}
                  ref={(el) => {
                    letterRefs.current[currentLetterIndex] = el;
                  }}
                  style={{
                    display: 'inline-block',
                    fontVariationSettings: interpolatedSettingsRef.current[currentLetterIndex],
                  }}
                  aria-hidden="true"
                >
                  {letter}
                </motion.span>
              );
            })}
            {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
        <span className="sr-only">{label}</span>
      </span>
    );
  }
);

VariableProximity.displayName = 'VariableProximity';
export default VariableProximity;
