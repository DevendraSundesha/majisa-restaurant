// English to Hindi Transliteration Utility

const foodDictionary: Record<string, string> = {
  paneer: 'पनीर',
  panir: 'पनीर',
  butter: 'बटर',
  masala: 'मसाला',
  dal: 'दाल',
  daal: 'दाल',
  baati: 'बाटी',
  bati: 'बाटी',
  churma: 'चूरमा',
  churama: 'चूरमा',
  roti: 'रोटी',
  sogra: 'सोगरा',
  lassi: 'लस्सी',
  shahi: 'शाही',
  sahi: 'शाही',
  special: 'स्पेशल',
  kadhai: 'कढ़ाई',
  kadai: 'कढ़ाई',
  malai: 'मलाई',
  ghevar: 'घेवर',
  ghewar: 'घेवर',
  sabji: 'सब्जी',
  sabzi: 'सब्जी',
  thali: 'थाली',
  makhaniya: 'माखनिया',
  makhani: 'मखनी',
  kulhad: 'कुलहड़',
  kulhadh: 'कुलहड़',
  chai: 'चाय',
  tea: 'चाय',
  kachori: 'कचौरी',
  kachuri: 'कचौरी',
  samosa: 'समोसा',
  vada: 'वड़ा',
  wada: 'वड़ा',
  mirchi: 'मिर्च',
  sangri: 'सांगरी',
  ker: 'केर',
  gatte: 'गट्टे',
  gatta: 'गट्टा',
  papad: 'पापड़',
  raita: 'रायता',
  jeera: 'जीरा',
  zira: 'जीरा',
  rice: 'चावल',
  chawal: 'चावल',
  curd: 'दही',
  dahi: 'दही',
  sweet: 'मिठाई',
  sweets: 'मिठाईयां',
  chutney: 'चटनी',
  chatni: 'चटनी',
  fry: 'फ्राई',
  fried: 'फ्राई',
  matar: 'मटर',
  mutter: 'मटर',
  aloo: 'आलू',
  alu: 'आलू',
  gobhi: 'गोभी',
  gobi: 'गोभी',
  bhindi: 'भिंडी',
  naan: 'नान',
  paratha: 'पराठा',
  parautha: 'पराठा',
  tandoori: 'तंदूरी',
  tikka: 'टिक्का',
  gravy: 'ग्रेवी',
  mix: 'मिक्स',
  veg: 'वेज',
  vegetable: 'सब्जी',
  dry: 'ड्राय',
  soup: 'सूप',
  shake: 'शेक',
  juice: 'जूस',
  cold: 'कोल्ड',
  hot: 'हॉट',
  water: 'पानी',
  soda: 'सोडा',
  ice: 'आइस',
  cream: 'क्रीम',
  kaju: 'काजू',
  badam: 'बादाम',
  pista: 'पिस्ता',
  kesar: 'केसर',
  kesariya: 'केसरिया',
  rabdi: 'रबड़ी',
  rabri: 'रबड़ी',
  kheer: 'खीर',
  halwa: 'हलवा',
  halwaa: 'हलवा',
  puri: 'पूरी',
  poori: 'पूरी',
  chole: 'छोले',
  bhature: 'भटूरे',
  chana: 'चना',
  rajma: 'राजमा',
  dum: 'दम',
  kofta: 'कोफ़्ता',
  bharta: 'भरता',
  methi: 'मेथी',
  palak: 'पालक',
  corn: 'कॉर्न',
  babycorn: 'बेबीकॉर्न',
  mushroom: 'मशरूम',
  pulao: 'पुलाव',
  biryani: 'बिरयानी',
  khichdi: 'खिचड़ी',
  sev: 'सेव',
  namkeen: 'नमकीन',
  majisa: 'माजीसा',
  royal: 'रॉयल',
  rajasthani: 'राजस्थानी',
  marwari: 'मारवाड़ी',
  jodhpuri: 'जोधपुरी',
  jaipuri: 'जयपुरिया',
  dhaba: 'ढाबा',
  authentic: 'प्रामाणिक',
  sweetness: 'मिठास',
  combo: 'कॉम्बो',
  mini: 'मिनी',
  super: 'सुपर',
  jumbo: 'जंबो'
};

// Fast local dictionary transliteration
export function transliterateLocal(text: string): string {
  if (!text) return '';
  const words = text.split(/(\s+)/);
  return words.map(w => {
    const cleanWord = w.toLowerCase().replace(/[^a-z]/g, '');
    if (foodDictionary[cleanWord]) {
      return foodDictionary[cleanWord];
    }
    return w;
  }).join('');
}

// Google Input Tools API transliteration fallback for high accuracy on any word
export async function transliterateToHindi(text: string): Promise<string> {
  if (!text || !text.trim()) return '';

  const words = text.trim().split(/\s+/);
  const localResult = transliterateLocal(text);
  const allInDict = words.every(w => foodDictionary[w.toLowerCase().replace(/[^a-z]/g, '')]);
  
  if (allInDict && localResult !== text) {
    return localResult;
  }

  try {
    const res = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=hi-t-i0-und&num=1`);
    if (res.ok) {
      const data = await res.json();
      if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1] && data[1][0][1][0]) {
        return data[1][0][1][0];
      }
    }
  } catch (err) {
    // Fallback if offline
  }

  return localResult;
}
