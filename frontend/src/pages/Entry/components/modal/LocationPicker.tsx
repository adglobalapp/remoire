import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { X, Search, MapPin, Check, Loader2 } from 'lucide-react';
import type { LocationPickerProps, NominatimResult } from '../../../../types';
import FieldError from '../../../../components/common/FieldError';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LocationPicker.module.css';

const createCustomIcon = () => {
    return L.divIcon({
        className: styles.customMarker,
        html: `<div class="${styles.markerPin}"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -28],
    });
};

const customIcon = createCustomIcon();

function MapEvents({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
    useMapEvents({
        click(e) {
            onClick(e.latlng);
        },
    });
    return null;
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onClose, onSelect, initialLocation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [markerPos, setMarkerPos] = useState<[number, number]>(
        initialLocation ? [initialLocation.lat, initialLocation.lng] : [47.4979, 19.0402],
    );
    const [locationName, setLocationName] = useState(initialLocation?.name || '');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [isSaving, setIsSaving] = useState(false);

    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        setFieldErrors({});

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = (await res.json()) as NominatimResult[];
            if (data.length === 0) {
                setFieldErrors({ search: ['No results found for this location.'] });
            }
            setSearchResults(data);
        } catch (error) {
            const err = error as Error;
            setFieldErrors({ search: [err.message || 'Location search failed'] });
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                performSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(searchQuery);
    };

    const selectResult = (result: NominatimResult) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        setMarkerPos([lat, lon]);
        setLocationName(result.display_name);
        setSearchResults([]);
        setSearchQuery('');
        setFieldErrors({});
    };

    const handleMapClick = async (latlng: L.LatLng) => {
        setMarkerPos([latlng.lat, latlng.lng]);
        setFieldErrors({});

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
            const data = await res.json();
            setLocationName(data.display_name || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
        } catch {
            setLocationName(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
        }
    };

    const handleConfirm = async () => {
        if (!locationName) return;
        setIsSaving(true);
        try {
            await onSelect({
                name: locationName,
                lat: markerPos[0],
                lng: markerPos[1],
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="global-modal-overlay" onClick={onClose}>
            <div className={`global-modal-content ${styles.modalContent}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.title}>Select Location</h2>
                    <button className="global-modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.mapSection}>
                    <div className={styles.searchSection}>
                        <form onSubmit={handleSearch} className={styles.searchForm} noValidate>
                            <div className={`${styles.searchInputWrapper} ${fieldErrors.search ? 'input-error' : ''}`}>
                                <Search size={18} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Search location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />

                                {searchResults.length > 0 && (
                                    <div className={styles.searchResults}>
                                        {searchResults.map((result) => (
                                            <div key={result.place_id} className={styles.resultItem} onClick={() => selectResult(result)}>
                                                <MapPin size={16} className={styles.resultIcon} />
                                                <span className={styles.resultText}>{result.display_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button type="submit" className={`btn btn-dark ${styles.searchBtn}`} disabled={isSearching}>
                                <Search size={18} />
                            </button>
                        </form>
                        <FieldError errors={fieldErrors.search} />
                    </div>

                    <div className={styles.mapContainer}>
                        <MapContainer center={markerPos} zoom={13} className={styles.mapWrapper}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={markerPos} icon={customIcon} />
                            <MapEvents onClick={handleMapClick} />
                            <ChangeView center={markerPos} />
                        </MapContainer>
                    </div>

                    <div className={styles.footer}>
                        <div className={styles.currentLocation}>
                            <MapPin size={16} className={styles.pinIcon} />
                            <div className={styles.currentLocationFlex}>
                                <span className={styles.locationLabel}>{locationName || 'Click on map to pick a location'}</span>
                            </div>
                        </div>
                        <button
                            className={`btn btn-dark ${styles.confirmBtn}`}
                            onClick={handleConfirm}
                            disabled={!locationName || isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Check size={18} /> Save Location
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')!,
    );
};

export default LocationPicker;
