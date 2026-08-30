/**
 * Legal references, corrected against the primary instruments.
 *
 * Deliberately absent: any string that tells a reader a satellite detection
 * satisfies the elements of an offence. A thermal anomaly establishes neither
 * the act, nor intent, nor a perpetrator.
 */

export interface LegalReference {
  citation: string;
  title: string;
  relevance: string;
  caution?: string;
}

export const LEGAL_REFERENCES: LegalReference[] = [
  {
    citation: 'UU 41/1999 Pasal 50 ayat (3) huruf d jo. Pasal 78 ayat (3)',
    title: 'Undang-Undang Kehutanan',
    relevance:
      'Larangan membakar hutan dan ancaman pidananya. Pasal 78 ayat (4) mengatur kelalaian. Ini adalah rujukan pidana yang tepat untuk pembakaran, bukan UU 18/2013.',
  },
  {
    citation: 'UU 32/2009 Pasal 108 jo. Pasal 69 ayat (1) huruf h',
    title: 'Perlindungan dan Pengelolaan Lingkungan Hidup',
    relevance: 'Larangan pembukaan lahan dengan cara membakar dan ancaman pidananya.',
  },
  {
    citation: 'UU 32/2009 Pasal 88 sebagaimana diubah UU 6/2023',
    title: 'Tanggung jawab mutlak (perdata)',
    relevance:
      'Tanggung jawab ganti rugi bagi kegiatan yang menggunakan B3, menghasilkan limbah B3, atau menimbulkan ancaman serius terhadap lingkungan.',
    caution:
      'Ini kaidah perdata, bukan pidana, dan tidak melekat pada setiap pemegang izin. Frasa "tanpa perlu pembuktian unsur kesalahan" dihapus oleh UU 11/2020, yang kemudian digantikan UU 6/2023.',
  },
  {
    citation: 'UU 5/1990 sebagaimana diubah UU 32/2024',
    title: 'Konservasi Sumber Daya Alam Hayati dan Ekosistemnya',
    relevance: 'Dasar perlindungan kawasan suaka alam dan kawasan pelestarian alam.',
  },
  {
    citation: 'UU 18/2013',
    title: 'Pencegahan dan Pemberantasan Perusakan Hutan',
    relevance:
      'Menjangkau pembalakan liar dan penggunaan kawasan hutan secara tidak sah yang dilakukan secara terorganisasi.',
    caution:
      'Membakar sebagai cara bukan unsur delik dalam undang-undang ini, dan perladangan tradisional masyarakat dikecualikan. Undang-undang ini bukan UU Kehutanan; UU Kehutanan adalah UU 41/1999.',
  },
];

export const EVIDENTIARY_NOTE =
  'Titik panas adalah anomali termal yang terdeteksi satelit. Titik panas bukan titik api, bukan bukti pembakaran, dan tidak menunjukkan pelaku. Setiap tindak lanjut memerlukan verifikasi lapangan.';

export const INSTITUTIONS = {
  ministry: 'Kementerian Kehutanan',
  directorate: 'Direktorat Pengendalian Kebakaran Hutan',
  enforcement: 'Ditjen Penegakan Hukum, Kementerian Kehutanan',
  note: 'Kementerian Lingkungan Hidup dan Kehutanan dipisah menjadi Kementerian Kehutanan dan Kementerian Lingkungan Hidup melalui Perpres 139/2024 pada Oktober 2024.',
};

export const TENURE_NOTE =
  'Aplikasi ini tidak menyebut pemegang izin. Batas HGU perkebunan tidak tersedia untuk publik meskipun Mahkamah Agung pada 2017 memutuskan dokumen HGU merupakan informasi publik. Batas konsesi mineral dan batubara tersedia melalui geoportal ESDM dan dapat diimpor sebagai lapisan tambahan.';
