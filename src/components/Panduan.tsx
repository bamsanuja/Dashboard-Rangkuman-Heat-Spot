import { Download, MousePointerClick, Image as ImageIcon, Printer, Flame, CircleHelp, ExternalLink } from 'lucide-react';
import { SIPONGI_DOWNLOAD_URL } from '../utils/importers';

/**
 * Panduan di dalam aplikasi, ditulis untuk orang yang belum pernah membuka
 * terminal dan tidak perlu tahu apa itu terminal. Semua langkah teknis sudah
 * dipindahkan ke otomatisasi, jadi yang tersisa di sini hanya mengunduh,
 * menyeret berkas, dan membaca hasilnya.
 */

function Langkah({
  nomor,
  judul,
  icon: Icon,
  children,
}: {
  nomor: number;
  judul: string;
  icon: typeof Download;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-9 h-9 rounded-xl bg-amber-den/15 border border-amber-den/40 grid place-items-center">
          <Icon className="w-4 h-4 text-amber-den" />
        </div>
        <div className="w-px flex-1 bg-espresso-line mt-2" />
      </div>
      <div className="pb-7 min-w-0">
        <h3 className="text-[14px] font-bold text-cream">
          <span className="text-amber-den font-mono mr-2">{nomor}</span>
          {judul}
        </h3>
        <div className="text-[13px] text-cream-muted leading-relaxed mt-1.5 space-y-2">{children}</div>
      </div>
    </div>
  );
}

export default function Panduan({ onImport }: { onImport: () => void }) {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="panel p-6">
        <h2 className="text-lg font-bold text-cream">Cara memakai aplikasi ini</h2>
        <p className="text-[13px] text-cream-muted leading-relaxed mt-1.5">
          Anda hanya perlu melakukan dua hal: mengunduh berkas dari SiPongi+, lalu menyeretnya ke jendela ini.
          Sisanya berjalan sendiri. Tidak ada yang perlu diketik, dan tidak ada perangkat lunak yang perlu dipasang.
        </p>
      </div>

      <div className="panel p-6">
        <Langkah nomor={1} judul="Ambil berkas dari SiPongi+" icon={Download}>
          <p>
            Buka halaman sebaran titik panas milik Kementerian Kehutanan:{' '}
            <a
              href={SIPONGI_DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
              className="text-amber-den hover:underline inline-flex items-center gap-1"
            >
              sipongi.gakkum.kehutanan.go.id
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p>
            Pilih provinsi dan rentang tanggal yang Anda perlukan, lalu klik tombol unduhan. Pilih{' '}
            <span className="text-cream font-medium">Download TXT</span> atau{' '}
            <span className="text-cream font-medium">Download KMZ</span>. Keduanya berisi koordinat titik, dan
            keduanya bisa dibaca aplikasi ini.
          </p>
          <p className="text-[12px] text-cream-faint">
            Hindari tabel rekapitulasi yang hanya memuat Satelit, Kab-Kota, Provinsi, Kepercayaan, dan Jumlah.
            Tabel itu tidak memuat koordinat, sehingga tidak bisa dipetakan.
          </p>
        </Langkah>

        <Langkah nomor={2} judul="Seret berkasnya ke jendela ini" icon={MousePointerClick}>
          <p>
            Buka folder Unduhan, lalu seret berkas itu ke mana saja di halaman ini. Kalau Anda lebih suka memilih
            lewat kotak dialog, klik tombol <span className="text-cream font-medium">Impor data</span> di kanan atas.
          </p>
          <button
            onClick={onImport}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-den text-espresso font-semibold text-[13px] px-4 py-2 hover:bg-camel transition-colors"
          >
            Impor data sekarang
          </button>
          <p className="text-[12px] text-cream-faint">
            Aplikasi akan memberi tahu berapa baris yang terbaca, dan berapa yang dilewati beserta alasannya.
            Baris yang tidak terbaca dilewati apa adanya, dan tidak pernah ditebak isinya.
          </p>
        </Langkah>

        <Langkah nomor={3} judul="Baca yang muncul" icon={Flame}>
          <p>Setelah data masuk, ada empat hal yang bisa Anda baca berurutan dari atas.</p>
          <ul className="list-disc list-inside space-y-1 text-[12px]">
            <li>
              <span className="text-cream font-medium">Kartu ringkasan</span>: berapa titik, berapa yang
              berkepercayaan tinggi, berapa yang jatuh di kawasan konservasi.
            </li>
            <li>
              <span className="text-cream font-medium">Tutupan lahan</span>: apa yang ada di bawah titik panas
              menurut citra satelit. Buka "Definisi tiap kelas" untuk tahu persis arti tiap istilah.
            </li>
            <li>
              <span className="text-cream font-medium">Tingkat bahaya</span>: seberapa kering lahannya. Ini yang
              membedakan api yang padam sendiri dari api gambut yang bertahan berminggu-minggu.
            </li>
            <li>
              <span className="text-cream font-medium">Peta dan Tabel</span>: titik satu per satu. Klik titik mana
              pun untuk melihat rinciannya.
            </li>
          </ul>
        </Langkah>

        <Langkah nomor={4} judul="Periksa citra satelitnya, kalau perlu" icon={ImageIcon}>
          <p>
            Untuk data satu provinsi ke atas, pembacaan citra tidak berjalan otomatis, karena jumlahnya bisa
            belasan ribu titik. Caranya: persempit dulu memakai kotak pencarian atau saringan provinsi, buka tab{' '}
            <span className="text-cream font-medium">Citra</span>, lalu klik tombol baca citra di sana.
          </p>
          <p>
            Hasilnya berupa lembar berisi petak-petak kecil citra tiap titik. Kalau ada yang menurut Anda salah
            dibaca mesin, klik labelnya dan perbaiki. Koreksi Anda langsung ikut ke semua ringkasan dan laporan.
          </p>
        </Langkah>

        <Langkah nomor={5} judul="Cetak catatan penapisannya" icon={Printer}>
          <p>
            Tab <span className="text-cream font-medium">Laporan</span> menyusun angka pokok, daftar prioritas
            verifikasi lapangan, seluruh batasan metode, dan rujukan hukumnya dalam satu halaman siap cetak.
          </p>
          <p className="text-[12px] text-cream-faint">
            Halaman itu menyebut dirinya catatan penapisan, bukan dokumen resmi, dan memang seharusnya begitu.
          </p>
        </Langkah>

        <div className="flex gap-4">
          <div className="shrink-0">
            <div className="w-9 h-9 rounded-xl bg-espresso-sunken border border-espresso-line grid place-items-center">
              <CircleHelp className="w-4 h-4 text-cream-faint" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold text-cream">Tingkat bahaya kebakaran diperbarui sendiri</h3>
            <p className="text-[13px] text-cream-muted leading-relaxed mt-1.5">
              Lapisan ini diambil otomatis setiap pagi dan ikut terbit bersama situs, jadi Anda tidak perlu
              mengunduh atau mengimpor apa pun untuk bagian ini. Tanggal observasinya tertulis di panel tingkat
              bahaya. Kalau tanggal itu terpaut jauh dari tanggal titik panas Anda, aplikasi akan memberi
              peringatan, karena kekeringan berubah setiap hari.
            </p>
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <h3 className="text-[14px] font-bold text-cream mb-3">Kalau ada yang tidak beres</h3>
        <dl className="space-y-3 text-[13px]">
          <div>
            <dt className="text-cream font-medium">Semua baris dilewati saat impor</dt>
            <dd className="text-cream-muted leading-relaxed">
              Kemungkinan besar Anda mengunduh tabel rekapitulasi, bukan berkas titik. Kembali ke SiPongi+ dan
              pilih Download TXT atau Download KMZ. Alasan tiap baris dilewati selalu ditampilkan di kotak impor.
            </dd>
          </div>
          <div>
            <dt className="text-cream font-medium">Petanya kosong padahal datanya masuk</dt>
            <dd className="text-cream-muted leading-relaxed">
              Periksa saringan di atas peta. Kalau salah satu saringan menyisakan nol titik, petanya memang kosong.
              Kosongkan kotak pencarian dan kembalikan semua saringan ke "Semua".
            </dd>
          </div>
          <div>
            <dt className="text-cream font-medium">Bentuk titik hilang saat melihat seluruh Indonesia</dt>
            <dd className="text-cream-muted leading-relaxed">
              Itu disengaja. Di atas 1.200 titik dalam satu tampilan, titiknya digambar sebagai bulatan warna saja
              supaya peta tetap lancar. Perbesar peta dan bentuknya kembali muncul.
            </dd>
          </div>
          <div>
            <dt className="text-cream font-medium">Tingkat bahaya tertulis belum dimuat</dt>
            <dd className="text-cream-muted leading-relaxed">
              Berarti pembaruan otomatisnya belum pernah jalan. Buka halaman GitHub repositori ini, masuk ke tab
              Actions, pilih "Perbarui data tingkat bahaya kebakaran", lalu klik "Run workflow". Semuanya lewat
              tombol, tanpa mengetik perintah.
            </dd>
          </div>
          <div>
            <dt className="text-cream font-medium">Citra tidak bisa dibaca di sebuah titik</dt>
            <dd className="text-cream-muted leading-relaxed">
              Bisa karena tertutup awan, atau karena citra basemap di lokasi itu terlalu kasar untuk memisahkan
              tajuk. Aplikasi akan menuliskannya sebagai tidak konklusif daripada menebak.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
