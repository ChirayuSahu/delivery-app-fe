'use client';

import {
    GoogleMap,
    Marker,
    useJsApiLoader,
} from '@react-google-maps/api';
import { useCallback, useRef, useMemo } from 'react';

interface SingleLocationMapProps {
    location: string; // JSON string: '{"lat": 22.1, "lng": 78.1}'
    title?: string;
    label?: string;
}

const containerStyle = {
    width: '100%',
    height: '450px',
};

const mapOptions: google.maps.MapOptions = {
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
    ],
};

export default function SingleLocationMap({ location, title, label }: SingleLocationMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    });

    const mapRef = useRef<google.maps.Map | null>(null);

    // Parse location string safely
    const coords = useMemo(() => {
        try {
            return JSON.parse(location);
        } catch (e) {
            console.error("Failed to parse map location", e);
            return null;
        }
    }, [location]);

    const handleMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    if (!isLoaded) {
        return (
            <div className="w-full h-110 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center border border-slate-200">
                <p className="text-slate-400 font-medium">Loading Map...</p>
            </div>
        );
    }

    if (!coords || !coords.lat || !coords.lng) {
        return (
            <div className="w-full h-110 bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-300">
                <p className="text-slate-400 text-sm italic">Invalid location data provided.</p>
            </div>
        );
    }

    return (
        <div className="relative group overflow-hidden rounded-xl border border-slate-200 shadow-md">
            {/* Header Overlay - Exact match to DeliveryMap */}
            <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {label || 'Delivery Point'} • {title || 'Details'}
                </p>
            </div>

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={coords}
                zoom={16}
                onLoad={handleMapLoad}
                options={mapOptions}
            >
                {/* Marker - Matching the Emerald Circle style from DeliveryMap */}
                <Marker
                    position={coords}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#10b981', // emerald-500
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#ffffff',
                        scale: 10,
                    }}
                    label={{
                        text: "1",
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold'
                    }}
                />
            </GoogleMap>
        </div>
    );
}