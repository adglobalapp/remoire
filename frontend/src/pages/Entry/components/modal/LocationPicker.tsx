import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { X, Search, MapPin, Check, AlertCircle, Loader2 } from 'lucide-react';
import type { LocationPickerProps } from '../../../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LocationPicker.module.css';

const createCustomIcon = () => {
    return L.divIcon({
        className: styles.customMarker,
        html: `<div class="${styles.markerPin}"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -28]
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
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [markerPos, setMarkerPos] = useState<[number, number]>(
        initialLocation ? [initialLocation.lat, initialLocation.lng] : [47.4979, 19.0402]
    );
    const [locationName, setLocationName] = useState(initialLocation?.name || '');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            if (data.length === 0) {
                setFieldErrors({ search: ['No results found for this location.'] });
            }
            setSearchResults(data);
        } catch (error: any) {
            setFieldErrors({ search: [error.message || 'Location search failed'] });
        } finally {
            setIsSearching(false);
        }
    };

    const selectResult = (result: any) => {
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
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
            );
            const data = await response.json();
            setLocationName(data.display_name || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
        } catch (error) {
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
                lng: markerPos[1]
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const renderFieldError = (fieldName: string) => {
        const errors = fieldErrors[fieldName];
        if (errors && errors.length > 0) {
            return (
                <div className={`field-errors-container ${styles.fieldErrorsContainer}`}>
                    {errors.map((msg, idx) => (
                        <span key={idx} className={`field-error-text ${styles.fieldErrorText}`}>
                            <AlertCircle size={16} /> {msg}
                        </span>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
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
                            </div>
                            <button type="submit" className={`btn btn-dark ${styles.searchBtn}`} disabled={isSearching}>
                                {isSearching ? '...' : <Search size={18} />}
                            </button>
                        </form>
                        {renderFieldError('search')}

                        {searchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                {searchResults.map((result) => (
                                    <div
                                        key={result.place_id}
                                        className={styles.resultItem}
                                        onClick={() => selectResult(result)}
                                    >
                                        <MapPin size={16} />
                                        <span>{result.display_name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.mapContainer}>
                        <MapContainer
                            center={markerPos}
                            zoom={13}
                            className={styles.mapWrapper}
                        >
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
                                <span className={styles.locationLabel}>
                                    {locationName || 'Click on map to pick a location'}
                                </span>
                            </div>
                        </div>
                        <button
                            className={`btn btn-dark ${styles.confirmBtn}`}
                            onClick={handleConfirm}
                            disabled={!locationName || isSaving}
                        >
                            {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Check size={18} /> Save Location</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
