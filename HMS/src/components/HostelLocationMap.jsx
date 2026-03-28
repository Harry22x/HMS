import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function HostelLocationMap({ lat, lng, name }) {
  return (
    <div className="h-80 w-full rounded-3xl overflow-hidden shadow-inner mt-8">
      <MapContainer center={[lat, lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}


