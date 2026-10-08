// Karakteristik tanah per kota — konten UNIK & DETAIL per halaman.
// Aturan: hanya karakteristik tanah (tanpa bahasan batasan pengeboran), relevan,
// menyebut contoh wilayah spesifik, link studi asli DITANAM DI DALAM kalimat.
// Semua URL sudah diverifikasi aktif.
//
// Kejujuran: tiap studi berada di LOKASI spesifik dalam wilayah tsb (disebut namanya).

export interface SoilCharacter {
  htmlStrauss?: string;
  html: string;
}

export const SOIL_CHARACTER: Record<string, SoilCharacter> = {
  jakarta: {
    html: 'Jakarta terbentuk dari endapan aluvial, bekas rawa, dan timbunan organik. Di kawasan pesisir seperti <strong>Jakarta Utara</strong>, tanahnya cenderung lunak dan berair (<a href="https://lib.ui.ac.id/detail?id=20238696" target="_blank" rel="noopener">penelitian UI</a>); sedangkan kawasan <strong>Cengkareng</strong> (Jakarta Barat) tercatat sebagai wilayah rawan <a href="https://journal.untar.ac.id/index.php/jstupa/article/view/12876" target="_blank" rel="noopener">penurunan tanah (land subsidence)</a>. Secara umum, tanah Jakarta dan sekitarnya juga <a href="https://journal.untar.ac.id/index.php/jmts/article/view/28010" target="_blank" rel="noopener">berpotensi ekspansif</a>, yaitu mudah mengembang saat basah dan menyusut saat kering.',
    htmlStrauss: 'Tanah Jakarta didominasi oleh endapan aluvial, bekas rawa, dan timbunan organik. Di lapisan dangkal wilayah pesisir seperti <strong>Jakarta Utara</strong>, tanahnya cenderung lunak dan berair (<a href="https://lib.ui.ac.id/detail?id=20238696" target="_blank" rel="noopener">penelitian UI</a>). Sementara di kawasan <strong>Cengkareng</strong> dan <strong>Kalideres</strong> (Jakarta Barat), tercatat sebagai area rawan <a href="https://journal.untar.ac.id/index.php/jstupa/article/view/12876" target="_blank" rel="noopener">penurunan tanah (land subsidence)</a> dengan karakteristik tanah lempung yang <a href="https://journal.untar.ac.id/index.php/jmts/article/view/28010" target="_blank" rel="noopener">berpotensi ekspansif</a>.',
  },
  bekasi: {
    html: 'Sebagian tanah Bekasi berupa lempung ekspansif yang mudah mengembang dan menyusut. Di kawasan <strong>Cikarang Pusat (DeltaMas)</strong>, karakteristik fisis <a href="https://repository.usbypkp.ac.id/4986/" target="_blank" rel="noopener">tanah lempungnya</a> pernah diteliti. Selain itu, sebagian wilayah Bekasi juga rentan <a href="http://jurnal.uqgresik.ac.id/index.php/qjms/article/view/62" target="_blank" rel="noopener">penurunan tanah (land subsidence)</a> akibat pengambilan air tanah yang berlebihan.',
  },
  bogor: {
    html: 'Wilayah Bogor umumnya berupa tanah merah (latosol) yang gembur dengan kontur berbukit. Di kawasan <strong>Sentul</strong>, dijumpai lapisan <a href="https://journal.untar.ac.id/index.php/jmts/article/view/5816" target="_blank" rel="noopener">tanah clay shale</a> (batuan lempung), dan aspek <a href="https://journal.unpak.ac.id/index.php/jurnalteknik/article/view/1687" target="_blank" rel="noopener">kestabilan lereng</a> menjadi perhatian utama.',
  },
  depok: {
    html: 'Berdasarkan penyelidikan tanah di kawasan <strong>Pondok Cina</strong>, Kota Depok, jenis tanahnya didominasi <a href="https://jurnal.uns.ac.id/jrrs/article/view/44612" target="_blank" rel="noopener">pasir dan lanau</a>.',
  },
  tangerang: {
    html: 'Sebagian tanah Tangerang berupa lempung ekspansif (montmorillonit) dengan indeks plastisitas tinggi. Di kawasan <strong>Cisauk</strong>, tanahnya tercatat <a href="https://journal.isas.or.id/index.php/JACEIT/article/view/961" target="_blank" rel="noopener">mudah mengembang saat basah dan menyusut saat kering</a>. Sifat fisik dan mekanik <a href="https://repository.pnj.ac.id/id/eprint/19598/" target="_blank" rel="noopener">tanah ekspansif Kabupaten Tangerang</a> juga sudah diteliti.',
  },
  'tangerang-selatan': {
    html: 'Sebagian tanah Tangerang Selatan, khususnya di kawasan <strong>Ciledug</strong>, berupa <a href="https://eproceeding.itenas.ac.id/index.php/ftsp/article/view/2641" target="_blank" rel="noopener">lempung lunak</a>.',
  },
  'jakarta-selatan': {
    html: 'Kondisi tanah Jakarta Selatan bervariasi antar lokasi. Pada beberapa area seperti <strong>Tebet</strong> (<a href="https://repositori.usu.ac.id/handle/123456789/47232" target="_blank" rel="noopener">kajian geoteknik Tebet</a>) dan <strong>Pasar Jum\'at</strong> (<a href="http://jurnal.utu.ac.id/jtsipil/article/view/13139" target="_blank" rel="noopener">proyek RSNTT</a>), di bawah lapisan tanah lunak terdapat lapisan <a href="https://journal.jgu.ac.id/index.php/jgers/article/view/40" target="_blank" rel="noopener">tanah keras</a>.',
  },
};
