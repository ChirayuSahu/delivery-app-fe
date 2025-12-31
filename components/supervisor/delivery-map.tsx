'use client';

import {
    GoogleMap,
    Marker,
    Polyline,
    InfoWindow,
    useJsApiLoader,
} from '@react-google-maps/api';
import { useMemo, useState, useRef } from 'react';
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
    height: '360px',
};

export default function DeliveryMap({ invoices }: { invoices: Invoice[] }) {
    const { isLoaded } = useJsApiLoader({
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
                        deliveredAt: inv.deliveredAt
                            ? new Date(inv.deliveredAt)
                            : undefined,
                        stop: index + 1,
                    };
                } catch {
                    return null;
                }
            })
            .filter(Boolean) as MapPoint[];
    }, [invoices]);

    const handleMapLoad = (map: google.maps.Map) => {
        mapRef.current = map;

        if (points.length > 0) {
            const bounds = new google.maps.LatLngBounds();

            points.forEach(p => {
                bounds.extend({ lat: p.lat, lng: p.lng });
            });

            map.fitBounds(bounds);
        }
    };


    if (!isLoaded || points.length === 0) return null;

    return (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={points[0]}
                zoom={15}
                onLoad={handleMapLoad}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                }}
            >
                {/* Markers */}
                {points.map((point) => (
                    <Marker
                        key={`${point.invNo}-${point.stop}`}
                        position={{ lat: point.lat, lng: point.lng }}
                        label={`${point.stop}`}
                        onClick={() => setActivePoint(point)}
                    />
                ))}

                {/* Route */}
                <Polyline
                    path={points.map(p => ({ lat: p.lat, lng: p.lng }))}
                    options={{
                        strokeColor: '#22c55e',
                        strokeOpacity: 0.9,
                        strokeWeight: 4,
                    }}
                />

                {/* Info Window */}
                {activePoint && (
                    <InfoWindow
                        position={{ lat: activePoint.lat, lng: activePoint.lng }}
                        onCloseClick={() => setActivePoint(null)}
                    >
                        <div className="text-sm space-y-1 min-w-50">
                            <p className="font-bold text-slate-900">
                                {activePoint.customerName}
                            </p>

                            <p className="text-slate-600">
                                Invoice:{' '}
                                <span className="font-mono font-semibold">
                                    {activePoint.invNo}
                                </span>
                            </p>

                            <p className="text-slate-500 text-xs">
                                Stop #{activePoint.stop}
                            </p>

                            {activePoint.deliveredAt && (
                                <p className="text-slate-500 text-xs">
                                    Delivered at:{' '}
                                    <span className="font-medium text-slate-700">
                                        {activePoint.deliveredAt.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </p>
                            )}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
