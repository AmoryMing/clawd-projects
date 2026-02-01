/**
 * Mobile Adapter - 移动端适配组件
 *
 * 功能：
 * - 响应式布局
 * - 触摸优化
 * - 移动端特定组件
 * - 设备检测
 */

// ═══════════════════════════════════════════════════════
// 设备检测
// ═══════════════════════════════════════════════════════

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceInfo {
  type: DeviceType;
  width: number;
  height: number;
  pixelRatio: number;
  isTouch: boolean;
  os: 'ios' | 'android' | 'windows' | 'mac' | 'other';
  browser: 'safari' | 'chrome' | 'firefox' | 'edge' | 'other';
}

export function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 检测 OS
  let os: DeviceInfo['os'] = 'other';
  if (/iPad|iPhone|iPod/.test(ua)) os = 'ios';
  else if (/Android/.test(ua)) os = 'android';
  else if (/Win/.test(ua)) os = 'windows';
  else if (/Mac/.test(ua)) os = 'mac';

  // 检测 Browser
  let browser: DeviceInfo['browser'] = 'other';
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'safari';
  else if (/Chrome/.test(ua)) browser = 'chrome';
  else if (/Firefox/.test(ua)) browser = 'firefox';
  else if (/Edg/.test(ua)) browser = 'edge';

  // 检测类型
  let type: DeviceType = 'desktop';
  if (width < 768) type = 'mobile';
  else if (width < 1024) type = 'tablet';

  return {
    type,
    width,
    height,
    pixelRatio,
    isTouch,
    os,
    browser
  };
}

// 响应式断点
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440
};

// ═══════════════════════════════════════════════════════
// 响应式 Hooks
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useMobile(): boolean {
  return useMediaQuery(`(max-width: ${breakpoints.mobile - 1}px)`);
}

export function useTablet(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.mobile}px) and (max-width: ${breakpoints.tablet - 1}px)`);
}

export function useDesktop(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.tablet}px)`);
}

export function useOrientation(): 'portrait' | 'landscape' {
  return useMediaQuery('(orientation: portrait)') ? 'portrait' : 'landscape';
}

export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// ═══════════════════════════════════════════════════════
// 触摸优化 Hooks
// ═══════════════════════════════════════════════════════

interface TouchHandlers {
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

export function useTouchHandlers(
  handlers: TouchHandlers,
  enabled: boolean = true
): TouchHandlers {
  const touchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    handlers.onTouchStart?.(e);
  }, [handlers, enabled]);

  const touchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    handlers.onTouchMove?.(e);
  }, [handlers, enabled]);

  const touchEnd = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    handlers.onTouchEnd?.(e);
  }, [handlers, enabled]);

  return {
    onTouchStart: touchStart,
    onTouchMove: touchMove,
    onTouchEnd: touchEnd
  };
}

// 长按处理
export function useLongPress(
  callback: () => void,
  delay: number = 500
): {
  onTouchStart: () => void;
  onTouchEnd: () => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
} {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    timerRef.current = setTimeout(callback, delay);
  }, [callback, delay]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: stop,
    onMouseDown: start,
    onMouseUp: stop
  };
}

// 滑动检测
export function useSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold: number = 50
): TouchHandlers {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // 确保是水平滑动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }

    setTouchStart(null);
  }, [touchStart, onSwipeLeft, onSwipeRight, threshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
}

// ═══════════════════════════════════════════════════════
// 移动端优化组件
// ═══════════════════════════════════════════════════════

interface MobileLayoutProps {
  children: React.ReactNode;
  debug?: boolean;
}

export function MobileLayout({ children, debug = false }: MobileLayoutProps) {
  const device = getDeviceInfo();
  const isMobile = device.type === 'mobile';

  return (
    <div
      className={`mobile-layout ${device.type} ${isMobile ? 'touch-device' : ''}`}
      data-debug={debug ? JSON.stringify(device) : undefined}
    >
      {children}
    </div>
  );
}

// 响应式网格
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
}

export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 16
}: ResponsiveGridProps) {
  return (
    <div
      className="responsive-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns.mobile}, 1fr)`,
        gap: `${gap}px`
      }}
      css={`
        @media (min-width: ${breakpoints.mobile}px) {
          .responsive-grid {
            grid-template-columns: repeat(${columns.tablet}, 1fr) !important;
          }
        }
        @media (min-width: ${breakpoints.tablet}px) {
          .responsive-grid {
            grid-template-columns: repeat(${columns.desktop}, 1fr) !important;
          }
        }
      `}
    >
      {children}
    </div>
  );
}

// 移动端导航栏
interface MobileNavBarProps {
  title: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  sticky?: boolean;
}

export function MobileNavBar({
  title,
  leftAction,
  rightAction,
  onBack,
  sticky = true
}: MobileNavBarProps) {
  return (
    <nav
      className={`mobile-nav-bar ${sticky ? 'sticky' : ''}`}
      style={{
        position: sticky ? 'sticky' : 'relative',
        top: 0,
        zIndex: 100,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div className="nav-left">
        {leftAction || (
          <button
            className="nav-back-btn"
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ←
          </button>
        )}
      </div>

      <h1
        className="nav-title"
        style={{
          margin: 0,
          fontSize: '17px',
          fontWeight: '600',
          flex: 1,
          textAlign: 'center'
        }}
      >
        {title}
      </h1>

      <div className="nav-right">
        {rightAction}
      </div>
    </nav>
  );
}

// 底部操作栏
interface BottomActionBarProps {
  children: React.ReactNode;
  height?: number;
}

export function BottomActionBar({
  children,
  height = 60
}: BottomActionBarProps) {
  return (
    <div
      className="bottom-action-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: `${height}px`,
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}
    >
      {children}
    </div>
  );
}

// 移动端卡片
interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  padding?: number;
}

export function MobileCard({
  children,
  onClick,
  padding = 16
}: MobileCardProps) {
  return (
    <div
      className="mobile-card"
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: `${padding}px`,
        margin: `${padding}px`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      {children}
    </div>
  );
}

// 触摸反馈按钮
interface TouchFeedbackButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  activeColor?: string;
}

export function TouchFeedbackButton({
  children,
  onClick,
  disabled = false,
  activeColor = '#f0f0f0'
}: TouchFeedbackButtonProps) {
  const [isActive, setIsActive] = useState(false);

  const handlers = useTouchHandlers({
    onTouchStart: () => setIsActive(true),
    onTouchEnd: () => setIsActive(false),
    onTouchCancel: () => setIsActive(false)
  });

  return (
    <button
      className="touch-feedback-button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: isActive ? activeColor : 'transparent',
        transition: 'background 0.1s ease',
        border: 'none',
        padding: '12px 16px',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1
      }}
      {...handlers}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════
// 移动端样式工具
// ═══════════════════════════════════════════════════════

// 生成响应式样式
export function responsive(styles: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  return `
    ${styles.mobile || ''}
    @media (min-width: ${breakpoints.mobile}px) {
      ${styles.tablet || ''}
    }
    @media (min-width: ${breakpoints.tablet}px) {
      ${styles.desktop || ''}
    }
  `;
}

// 安全区域适配
export const safeAreaStyles = {
  paddingTop: 'env(safe-area-inset-top)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingLeft: 'env(safe-area-inset-left)',
  paddingRight: 'env(safe-area-inset-right)'
};

// 移动端字体大小
export const mobileFonts = {
  xs: '12px',
  sm: '14px',
  base: '15px',
  lg: '17px',
  xl: '20px',
  '2xl': '24px'
};

// ═══════════════════════════════════════════════════════
// 使用示例
// ═══════════════════════════════════════════════════════

/*
function MyMobilePage() {
  const isMobile = useMobile();
  const swipeHandlers = useSwipe(
    () => console.log('Swipe left'),
    () => console.log('Swipe right')
  );

  return (
    <MobileLayout>
      <MobileNavBar
        title="页面标题"
        onBack={() => navigate(-1)}
      />

      <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
        <MobileCard>
          <h3>卡片1</h3>
          <p>内容</p>
        </MobileCard>
        <MobileCard>
          <h3>卡片2</h3>
          <p>内容</p>
        </MobileCard>
      </ResponsiveGrid>

      <BottomActionBar>
        <TouchFeedbackButton onClick={() => {}}>
          操作1
        </TouchFeedbackButton>
        <TouchFeedbackButton onClick={() => {}}>
          操作2
        </TouchFeedbackButton>
      </BottomActionBar>
    </MobileLayout>
  );
}
*/

export default {
  getDeviceInfo,
  breakpoints,
  useMediaQuery,
  useMobile,
  useTablet,
  useDesktop,
  useOrientation,
  useReducedMotion,
  useLongPress,
  useSwipe,
  MobileLayout,
  ResponsiveGrid,
  MobileNavBar,
  BottomActionBar,
  MobileCard,
  TouchFeedbackButton,
  responsive,
  safeAreaStyles,
  mobileFonts
};
