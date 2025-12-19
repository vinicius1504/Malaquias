'use client';

import { GoogleTagManagerHead, GoogleTagManagerBody } from './GoogleTagManager';
import { FacebookPixel } from './FacebookPixel';
import { GoogleAnalytics } from './GoogleAnalytics';

export function Analytics() {
  return (
    <>
      <GoogleTagManagerHead />
      <GoogleAnalytics />
      <FacebookPixel />
    </>
  );
}

export { GoogleTagManagerBody } from './GoogleTagManager';
export { trackFBEvent } from './FacebookPixel';
export { trackGAEvent } from './GoogleAnalytics';
