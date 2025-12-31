'use client';

import {
    GoogleMap,
    Marker,
    Polyline,
    InfoWindow,
    useJsApiLoader,
} from '@react-google-maps/api';
import { useMemo, useState, useRef, useCallback } from 'react';
import type { Invoice } from '@/app/dashboard/supervisor/deliveries/[deliveryId]/page';

type MapPoint = {
    lat: number;
    lng: number;
    invNo: string;
    customerName: string;
    deliveredAt?: Date;
    stop: number;
};

const containerStyle = {
    width: '100%',
    height: '450px', // Increased height for better visibility
};

const mapOptions: google.maps.MapOptions = {
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
    ]
};

export default function DeliveryMap({ invoices }: { invoices: Invoice[] }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    });

    const [activePoint, setActivePoint] = useState<MapPoint | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const points = useMemo<MapPoint[]>(() => {
        return invoices
            .map((inv, index) => {
                if (!inv.location) return null;
                try {
                    const loc = JSON.parse(inv.location);
                    return {
                        lat: loc.lat,
                        lng: loc.lng,
                        invNo: `${inv.invType}/${inv.invNo}`,
                        customerName: inv.customerName,
                        deliveredAt: inv.deliveredAt ? new Date(inv.deliveredAt) : undefined,
                        stop: index + 1,
                    };
                } catch { return null; }
            })
            .filter(Boolean) as MapPoint[];
    }, [invoices]);

    const handleMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
        if (points.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            points.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
            map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 }); // Added padding so markers aren't on the edge
        }
    }, [points]);

    if (!isLoaded) {
        return (
            <div className="w-full h-110 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">
                <p className="text-slate-400">Loading Map...</p>
            </div>
        );
    }

    if (points.length === 0) {
        return (
            <div className="w-full h-110 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">
                <p className="text-slate-400">No Items delivered yet.</p>
            </div>
        );
    }

    return (
        <div className="relative group overflow-hidden rounded-xl border border-slate-200 shadow-md">
            {/* Header Overlay */}
            <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Delivery Route • {points.length} Stops
                </p>
            </div>

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={points[0]}
                zoom={14}
                onLoad={handleMapLoad}
                options={mapOptions}
            >
                {/* Route Line with Directional Arrows */}
                <Polyline
                    path={points.map(p => ({ lat: p.lat, lng: p.lng }))}
                    options={{
                        strokeColor: '#FF0000', // Red
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                        icons: [{
                            icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                            offset: '50%',
                            repeat: '100px'
                        }]
                    }}
                />

                {points.map((point) => (
                    <Marker
                        key={`${point.invNo}-${point.stop}`}
                        position={{ lat: point.lat, lng: point.lng }}
                        onClick={() => setActivePoint(point)}

                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: '#10b981',
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: '#ffffff',
                            scale: 10,
                        }}
                        label={{
                            text: `${point.stop}`,
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 'bold'
                        }}
                    />
                ))}

                {activePoint && (
                    <InfoWindow
                        position={{ lat: activePoint.lat, lng: activePoint.lng }}
                        onCloseClick={() => setActivePoint(null)}
                    >
                        <div className="p-1 max-w-50">
                            <h4 className="font-bold text-slate-900 truncate leading-tight">
                                {activePoint.customerName}
                            </h4>
                            <div className="mt-2 space-y-1.5">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500 uppercase">Invoice</span>
                                    <span className="font-mono font-medium">{activePoint.invNo}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500 uppercase">Status</span>
                                    <span className={activePoint.deliveredAt ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                                        {activePoint.deliveredAt ? 'Delivered' : 'Pending'}
                                    </span>
                                </div>
                                {activePoint.deliveredAt && (
                                    <p className="pt-1 text-[10px] text-slate-400 border-t border-slate-100">
                                        Time: {activePoint.deliveredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}