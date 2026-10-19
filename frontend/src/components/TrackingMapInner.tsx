'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Order } from '@/lib/types';
import { formatPercent, formatRupiah } from '@/lib/api';

interface TrackingMapInnerProps {
  orders: Order[];
  selectedOrderId?: number | null;
  onSelectOrder?: (order: Order) => void;
}

export default function TrackingMapInner({ orders, selectedOrderId, onSelectOrder }: TrackingMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Java - Jakarta to Surabaya corridor
      const map = L.map(mapContainerRef.current, {
        center: [-6.9175, 109.8],
        zoom: 7,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive during tab transitions or cleanup on unmount
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    // Custom truck icon
    const createTruckIcon = (isWarning: boolean, isSelected: boolean) => {
      const bgColor = isWarning ? '#be123c' : isSelected ? '#1d4ed8' : '#047857';
      return L.divIcon({
        className: 'custom-truck-marker',
        html: `
          <div style="
            background-color: ${bgColor};
            color: white;
            padding: 6px;
            border-radius: 9999px;
            box-shadow: 0 4px 10px -2px rgba(28, 25, 23, 0.35);
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });
    };

    orders.forEach((order) => {
      // Find latest tracking log coordinates or fallback driver coords
      const lat = order.latest_tracking_log?.lat ?? order.driver?.current_lat;
      const lng = order.latest_tracking_log?.lng ?? order.driver?.current_lng;

      if (!lat || !lng) return;

      bounds.extend([lat, lng]);

      const isSelected = order.id === selectedOrderId;
      const isWarning = order.is_under_margin;
      const icon = createTruckIcon(isWarning, isSelected);

      const marker = L.marker([lat, lng], { icon }).addTo(markersGroup);

      // Draw polyline if logs exist
      if (order.tracking_logs && order.tracking_logs.length > 1) {
        const pathCoords: L.LatLngExpression[] = order.tracking_logs.map((log) => [log.lat, log.lng]);
        L.polyline(pathCoords, {
          color: isWarning ? '#be123c' : '#1d4ed8',
          weight: 3,
          opacity: 0.55,
          dashArray: '2, 7',
        }).addTo(markersGroup);
      }

      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.45; min-width: 210px;">
          <div style="font-weight: 600; color: #1c1917; font-size: 13px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <span>${order.order_number}</span>
            <span style="font-size: 11px; padding: 1px 6px; border-radius: 5px; font-weight: 600; background: ${isWarning ? '#fff1f2; color: #be123c;' : '#ecfdf5; color: #047857;'}">
              ${formatPercent(order.margin_percentage)}
            </span>
          </div>
          <div style="color: #78716c; font-size: 12px; margin-bottom: 7px;">
            ${order.origin_city} → ${order.destination_city}
          </div>
          <div style="color: #44403c; margin-bottom: 2px;">
            <span style="color:#a8a29e;">Nopol</span> ${order.fleet?.plate_number ?? '-'} (${order.vehicle_type_required})
          </div>
          <div style="color: #44403c; margin-bottom: 2px;">
            <span style="color:#a8a29e;">Driver</span> ${order.driver?.name ?? '-'} (${order.driver?.phone ?? '-'})
          </div>
          <div style="color: #44403c; margin-bottom: 2px;">
            <span style="color:#a8a29e;">Lokasi</span> ${order.latest_tracking_log?.location_name ?? 'Dalam Perjalanan'}
          </div>
          <div style="color: #44403c; margin-bottom: 7px;">
            <span style="color:#a8a29e;">Laju</span> ${order.latest_tracking_log?.speed_kmh ?? 0} km/jam
          </div>
          <div style="font-size: 11px; color: #78716c; border-top: 1px solid #e7e5e1; padding-top: 5px;">
            Harga ${formatRupiah(order.customer_price)} · Laba ${formatRupiah(order.gross_profit)}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectOrder) onSelectOrder(order);
      });

      if (isSelected) {
        marker.openPopup();
      }
    });

    if (bounds.isValid() && orders.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [orders, selectedOrderId, onSelectOrder]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full min-h-[460px] w-full overflow-hidden rounded-lg border border-hairline"
    />
  );
}
