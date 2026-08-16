"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { AISSTREAM_WS_URL, BOUNDING_BOX_DEBOUNCE } from "@/lib/constants";
import type { Ship } from "@/lib/types";

interface AISMessage {
  MessageType: string;
  Metadata: {
    MMSI: number;
    ShipName?: string;
    latitude?: number;
    longitude?: number;
    time_utc?: string;
  };
  Message: Record<string, Record<string, unknown>>;
}

export function AISConnector() {
  const mapBounds = useStore((s) => s.mapBounds);
  const updateShip = useStore((s) => s.updateShip);
  const setLoadingShips = useStore((s) => s.setLoadingShips);
  const setApiError = useStore((s) => s.setApiError);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boundsRef = useRef(mapBounds);
  const lastSubscribeRef = useRef(0);

  boundsRef.current = mapBounds;

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_AISSTREAM_API_KEY;
    if (!apiKey) {
      setLoadingShips(false);
      return;
    }

    let connected = false;
    let disposed = false;

    function connect() {
      if (disposed) return;

      try {
        const ws = new WebSocket(AISSTREAM_WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          connected = true;
          subscribe();
        };

        ws.onmessage = (event) => {
          try {
            const msg: AISMessage = JSON.parse(event.data);
            handleMessage(msg);
          } catch {
            if (event.data.includes("error")) {
              setApiError("AISStream: invalid API key");
            }
          }
        };

        ws.onclose = () => {
          connected = false;
          wsRef.current = null;
          if (!disposed) reconnectTimerRef.current = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        if (!disposed) reconnectTimerRef.current = setTimeout(connect, 5000);
      }
    }

    function subscribe() {
      const b = boundsRef.current;
      if (!b || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const now = Date.now();
      if (now - lastSubscribeRef.current < 1500) return;
      lastSubscribeRef.current = now;

      const msg = {
        APIKey: apiKey,
        BoundingBoxes: [
          [
            [b.lamin, b.lomin],
            [b.lamax, b.lomax],
          ],
        ],
        FilterMessageTypes: [
          "PositionReport",
          "StandardClassBPositionReport",
          "ShipStaticData",
        ],
      };

      wsRef.current.send(JSON.stringify(msg));
    }

    function handleMessage(msg: AISMessage) {
      const meta = msg.Metadata;
      if (!meta || !meta.MMSI) return;

      if (msg.MessageType === "PositionReport" || msg.MessageType === "StandardClassBPositionReport") {
        const pos = msg.Message[msg.MessageType] as Record<string, unknown>;
        if (!pos) return;

        const lat = (pos.Latitude as number) || meta.latitude;
        const lon = (pos.Longitude as number) || meta.longitude;
        if (!lat || !lon) return;

        const ship: Ship = {
          mmsi: meta.MMSI,
          latitude: lat,
          longitude: lon,
          cog: (pos.Cog as number) ?? null,
          sog: (pos.Sog as number) ?? null,
          true_heading: (pos.TrueHeading as number) ?? null,
          navigational_status: (pos.NavigationalStatus as number) ?? null,
          ship_name: meta.ShipName || undefined,
          last_update: Date.now(),
          track: [],
        };

        updateShip(ship);
        setLoadingShips(false);
      }

      if (msg.MessageType === "ShipStaticData") {
        const data = msg.Message.ShipStaticData as Record<string, unknown>;
        if (!data) return;

        const existing = useStore.getState().ships.get(meta.MMSI);
        if (existing) {
          updateShip({
            ...existing,
            ship_name: (data.Name as string)?.trim() || existing.ship_name,
            ship_type: (data.Type as number) || existing.ship_type,
            callsign: (data.CallSign as string) || existing.callsign,
            imo: (data.IMO as number) || existing.imo,
          });
        }
      }
    }

    connect();

    const resubTimer = setInterval(() => {
      if (connected) subscribe();
    }, BOUNDING_BOX_DEBOUNCE + 2000);

    return () => {
      disposed = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      clearInterval(resubTimer);
    };
  }, [updateShip, setLoadingShips, setApiError]);

  return null;
}
