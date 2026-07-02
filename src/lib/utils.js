// ponytail: utility helpers, cuma yang dipake aja

export function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);
}

export function hitungDenda(hariTelat, tarifPerHari, jumlahBarang) {
  return hariTelat * tarifPerHari * jumlahBarang;
}

export function selisihHari(tglAwal, tglAkhir) {
  const a = new Date(tglAwal);
  const b = new Date(tglAkhir);
  return Math.max(0, Math.ceil((b - a) / (1000 * 60 * 60 * 24)));
}
