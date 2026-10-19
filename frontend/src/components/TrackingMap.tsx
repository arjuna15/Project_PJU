'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Order } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const TrackingMapInner = dynamic(() => import('./TrackingMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] flex flex-col items-center justify-center bg-slate-100 rounded-xl border border-slate-200 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
      <span className="text-sm font-medium">Memuat Peta Satelit & GPS Armada PJU...</span>
    </div>
  ),
});

interface TrackingMapProps {
  orders: Order[];
  selectedOrderId?: number | null;
  onSelectOrder?: (order: Order) => void;
}

export default function TrackingMap(props: TrackingMapProps) {
  return <TrackingMapInner {...props} />;
}
