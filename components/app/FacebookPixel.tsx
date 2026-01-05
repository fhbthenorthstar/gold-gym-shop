"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ensureFbcCookie,
  getFacebookPixelId,
  trackFacebookEvent,
} from "@/lib/analytics/facebook";

export function FacebookPixel() {
  const pixelId = getFacebookPixelId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialEventIdRef = useRef<string | null>(null);
  const pixelPageViewSentRef = useRef(false);
  const lastRouteRef = useRef<string | null>(null);

  useEffect(() => {
    ensureFbcCookie(window.location.search);
  }, [searchParams]);

  useEffect(() => {
    if (!pixelId) return;
    if (initialEventIdRef.current) return;
    const pixelReady = typeof window !== "undefined" && typeof window.fbq === "function";
    trackFacebookEvent("PageView", { eventSourceUrl: window.location.href })
      .then((eventId) => {
        initialEventIdRef.current = eventId ?? null;
        pixelPageViewSentRef.current = pixelReady;
      })
      .catch(() => {
        // Ignore initial CAPI failure to avoid blocking render.
      });
  }, [pixelId]);

  useEffect(() => {
    if (!pixelId) return;
    const routeKey = `${pathname}?${searchParams.toString()}`;
    if (lastRouteRef.current === null) {
      lastRouteRef.current = routeKey;
      return;
    }
    if (routeKey === lastRouteRef.current) return;
    lastRouteRef.current = routeKey;
    trackFacebookEvent("PageView", { eventSourceUrl: window.location.href });
  }, [pathname, searchParams, pixelId]);

  if (!pixelId) return null;

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        onReady={() => {
          if (pixelPageViewSentRef.current) return;
          const eventId = initialEventIdRef.current;
          if (!eventId || typeof window === "undefined" || !window.fbq) return;
          window.fbq("track", "PageView", {}, { eventID: eventId });
          pixelPageViewSentRef.current = true;
        }}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
