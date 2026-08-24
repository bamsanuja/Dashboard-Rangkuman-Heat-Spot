import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  AlertCircle,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Hotspot, SatelliteSensor } from '../types';
import { classifyHotspotSpatial } from '../utils/spatialAnalysis';

interface DataImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHotspot: (newHotspot: Hotspot) => void;
  onAddBatchHotspots: (newHotspots: Hotspot[]) => void;
}

export const DataImporterModal: React.FC<DataImporterModalProps> = ({
  isOpen,
  onClose,
  onAddHotspot,
  onAddBatchHotspots
}) => {
  const [tab, setTab] = useState<'single' | 'batch'>('single');

  // Single form inputs
  const [lat, setLat] = useState<string>('-0.1800');
  const [lng, setLng] = useState<string>('101.6500');
  const [confidence, setConfidence] = useState<number>(95);
  const [frp, setFrp] = useState<number>(65.4);
  const [province, setProvince] = useState<string>('Riau');
  const [district, setDistrict] = useState<string>('Pelalawan');
  const [subdistrict, setSubdistrict] = useState<string>('Ukui');
  const [satellite, setSatellite] = useState<SatelliteSensor>('VIIRS / SNPP');

  // Batch / Paste text
  const [rawText, setRawText] = useState<string>('');
  const [batchError, setBatchError] = useState<string | null>(null);

  if (!isOpen) return null;

  const loadPreset = (presetType: 'hutan' | 'sawit' | 'tambang' | 'kota') => {
    if (presetType === 'hutan') {
      setLat('-0.1800');
      setLng('101.6500');
      setProvince('Riau');
      setDistrict('Pelalawan');
      setSubdistrict('TN Tesso Nilo');
      setConfidence(95);
      setFrp(85.0);
    } else if (presetType === 'sawit') {
      setLat('-0.1500');
      setLng('102.1000');
      setProvince('Riau');
      setDistrict('Pelalawan');
      setSubdistrict('PT Palma Andalan (Sawit)');
      setConfidence(92);
      setFrp(72.0);
    } else if (presetType === 'tambang') {
      setLat('0.3200');
      setLng('117.6200');
      setProvince('Kalimantan Timur');
      setDistrict('Kutai Timur');
      setSubdistrict('KPC Sangatta (Tambang)');
      setConfidence(96);
      setFrp(110.5);
    } else if (presetType === 'kota') {
      setLat('-2.2200');
      setLng('113.9200');
      setProvince('Kalimantan Tengah');
      setDistrict('Kota Palangka Raya');
      setSubdistrict('Jekan Raya');
      setConfidence(85);
      setFrp(35.0);
    }
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('Koordinat latitude dan longitude tidak valid.');
      return;
    }

    const classification = classifyHotspotSpatial(latNum, lngNum, confidence);

    let confidenceLevel: Hotspot['confidenceLevel'] = 'medium';
    if (confidence >= 80) confidenceLevel = 'high';
    else if (confidence < 30) confidenceLevel = 'low';

    const now = new Date();
    const newHotspot: Hotspot = {
      id: `HS-CUSTOM-${Math.floor(Math.random() * 9000 + 1000)}`,
      latitude: latNum,
      longitude: lngNum,
      confidence,
      confidenceLevel,
      brightness: Math.round((320 + frp * 0.4) * 10) / 10,
      frp,
      satellite,
      acquisitionDate: now.toISOString().split('T')[0],
      acquisitionTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`,
      province,
      district,
      subdistrict,
      landCategory: classification.landCategory,
      landDetail: classification.landDetail
    };

    onAddHotspot(newHotspot);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    onClose();
  };

  const handleBatchSubmit = () => {
    setBatchError(null);
    if (!rawText.trim()) {
      setBatchError('Silakan tempel teks CSV atau GeoJSON.');
      return;
    }

    try {
      const lines = rawText.trim().split('\n');
      const newHotspots: Hotspot[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.toLowerCase().startsWith('lat') || line.toLowerCase().startsWith('id')) continue;

        const parts = line.split(/[,\t;]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 2) {
          const latVal = parseFloat(parts[0]);
          const lngVal = parseFloat(parts[1]);
          const confVal = parts[2] ? parseInt(parts[2], 10) : 85;
          const frpVal = parts[3] ? parseFloat(parts[3]) : 45.0;
          const provVal = parts[4] || 'Kalimantan Tengah';
          const distVal = parts[5] || 'Wilayah Input';

          if (!isNaN(latVal) && !isNaN(lngVal)) {
            const classification = classifyHotspotSpatial(latVal, lngVal, confVal);
            let confidenceLevel: Hotspot['confidenceLevel'] = 'medium';
            if (confVal >= 80) confidenceLevel = 'high';
            else if (confVal < 30) confidenceLevel = 'low';

            newHotspots.push({
              id: `HS-CSV-${Math.floor(Math.random() * 9000 + 1000)}`,
              latitude: latVal,
              longitude: lngVal,
              confidence: confVal,
              confidenceLevel,
              brightness: 335.0,
              frp: frpVal,
              satellite: 'VIIRS / SNPP',
              acquisitionDate: new Date().toISOString().split('T')[0],
              acquisitionTime: '12:00 WIB',
              province: provVal,
              district: distVal,
              subdistrict: 'Data Impor',
              landCategory: classification.landCategory,
              landDetail: classification.landDetail
            });
          }
        }
      }

      if (newHotspots.length === 0) {
        setBatchError('Format tidak valid. Gunakan format: lat, lng, confidence, frp, provinsi');
        return;
      }

      onAddBatchHotspots(newHotspots);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
      onClose();
    } catch (err: any) {
      setBatchError(`Gagal memproses data: ${err?.message || 'Format tidak cocok'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel-card rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700/80 shadow-2xl overflow-hidden bg-slate-950/98 max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        
        {/* Mobile pull indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-100">
                Uji Coba & Impor Titik Api
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Klasifikasi zonasi spasial otomatis instant.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-4 pt-2">
          <button
            onClick={() => setTab('single')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition ${
              tab === 'single'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Uji Titik Tunggal
          </button>
          <button
            onClick={() => setTab('batch')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition ${
              tab === 'batch'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Impor CSV / Bulk
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
          
          {tab === 'single' ? (
            <form onSubmit={handleSingleSubmit} className="space-y-3">
              
              {/* Presets */}
              <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block mb-1.5">
                  Preset Lokasi Uji Coba:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => loadPreset('hutan')}
                    className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-semibold text-left truncate"
                  >
                    🌲 TN Tesso Nilo
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('sawit')}
                    className="p-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-semibold text-left truncate"
                  >
                    🌴 Sawit Pelalawan
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('tambang')}
                    className="p-1.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-semibold text-left truncate"
                  >
                    ⛏️ Tambang Sangatta
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('kota')}
                    className="p-1.5 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 rounded-lg text-[10px] font-semibold text-left truncate"
                  >
                    🏙️ Palangka Raya
                  </button>
                </div>
              </div>

              {/* Coordinate Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Latitude</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    placeholder="-0.1800"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Longitude</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    placeholder="101.6500"
                  />
                </div>
              </div>

              {/* Confidence & FRP */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                    Confidence: <span className="text-orange-400">{confidence}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value, 10))}
                    className="w-full accent-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">FRP (MW)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={frp}
                    onChange={(e) => setFrp(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Administrative & Satellite */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Provinsi</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Satelit</label>
                  <select
                    value={satellite}
                    onChange={(e) => setSatellite(e.target.value as SatelliteSensor)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="VIIRS / SNPP">VIIRS / SNPP</option>
                    <option value="VIIRS / NOAA-20">VIIRS / NOAA-20</option>
                    <option value="MODIS / Aqua">MODIS / Aqua</option>
                    <option value="MODIS / Terra">MODIS / Terra</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Analisis & Tambahkan ke Dashboard</span>
              </button>
            </form>
          ) : (
            <div className="space-y-2.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  Tempel CSV (Format: lat, lng, confidence, frp, provinsi, kabupaten)
                </label>
                <textarea
                  rows={5}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`-0.1800, 101.6500, 94, 78.4, Riau, Pelalawan\n-2.5500, 113.8500, 99, 184.5, Kalimantan Tengah, Pulang Pisau`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {batchError && (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{batchError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleBatchSubmit}
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Proses & Klasifikasikan Dataset</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
