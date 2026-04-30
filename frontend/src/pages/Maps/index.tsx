import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useEntryContext } from '../../contexts/EntryContext';
import { useAuth } from '../../contexts/AuthContext';
import { type Entry, type MarkerCluster } from '../../types';
import Navbar from '../../components/common/Navbar';
import { Calendar, MapPin, Eye, User } from 'lucide-react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { PRESET_COLORS } from '../../utils/constants';
import styles from './index.module.css';

const createCustomIcon = (color: string) => {
    return L.divIcon({
        className: styles.customMarker,
        html: `<div class="${styles.markerPin}" style="background-color: ${color};"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -32],
    });
};

const createClusterIcon = (cluster: MarkerCluster) => {
    const count = cluster.getChildCount();
    const color = PRESET_COLORS[count % PRESET_COLORS.length];

    return L.divIcon({
        html: `<div class="${styles.clusterInner}" style="background-color: ${color};">
                <span>${count}</span>
               </div>`,
        className: styles.customCluster,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
    });
};

const MapsPage = () => {
    const { user } = useAuth();
    const { entries, selectEntry } = useEntryContext();
    const navigate = useNavigate();
    const [mapCenter] = useState<[number, number]>([20, 0]);

    const entriesWithLocation = useMemo(() => {
        return entries.filter((e) => e.latitude && e.longitude);
    }, [entries]);

    const handleViewEntry = (entry: Entry) => {
        selectEntry(entry);
        navigate('/entries');
    };

    return (
        <div className="page-container">
            <Navbar />
            <main className="main-layout">
                <div className={styles.mapWrapper}>
                    <MapContainer center={mapCenter} zoom={3} className={styles.mapContainer} minZoom={2}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <MarkerClusterGroup
                            chunkedLoading
                            iconCreateFunction={createClusterIcon}
                            polygonOptions={{
                                fillColor: 'var(--color-burgundy)',
                                color: 'var(--color-burgundy)',
                                weight: 2,
                                opacity: 0.5,
                                fillOpacity: 0.2,
                            }}
                        >
                            {entriesWithLocation.map((entry) => {
                                const isOwn = user?.id === entry.user_id;
                                const pinColor = entry.color || PRESET_COLORS[entry.id % PRESET_COLORS.length];

                                return (
                                    <Marker key={entry.id} position={[entry.latitude!, entry.longitude!]} icon={createCustomIcon(pinColor)}>
                                        <Popup className={styles.popup}>
                                            <div className={styles.popupContent}>
                                                <div className={styles.popupHeader}>
                                                    <h4 className={styles.popupTitle}>{entry.title || 'Untitled'}</h4>
                                                </div>

                                                <div className={styles.popupMeta}>
                                                    <div className={styles.metaItem}>
                                                        <Calendar size={13} />
                                                        <span>{entry.date}</span>
                                                    </div>
                                                    <div className={styles.metaItem}>
                                                        <MapPin size={13} />
                                                        <span>{entry.location_name}</span>
                                                    </div>
                                                    {entry.participants && entry.participants.length > 0 && (
                                                        <div className={styles.metaItem}>
                                                            <User size={13} />
                                                            <span>{entry.participants.length} participants</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={styles.popupFooter}>
                                                    {isOwn ? (
                                                        <button
                                                            className={`btn btn-primary btn-sm ${styles.viewBtn}`}
                                                            onClick={() => handleViewEntry(entry)}
                                                        >
                                                            <Eye size={17} /> View Entry
                                                        </button>
                                                    ) : (
                                                        <div className={styles.sharedWrapper}>
                                                            <span className={styles.sharedBadge}>Shared with you</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MarkerClusterGroup>
                    </MapContainer>

                    <div className={styles.statsOverlay}>
                        <div className={styles.statBox}>
                            <span className={styles.statCount}>{entriesWithLocation.length}</span>
                            <span className={styles.statLabel}>Mapped Entries</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MapsPage;
