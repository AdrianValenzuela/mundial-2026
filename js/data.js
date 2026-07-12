// Álbum Panini FIFA World Cup 2026 — 980 cromos
// 1 logo Panini (00) + 19 especiales FWC + 48 selecciones × 20 cromos
// Por equipo: 1 = Escudo (foil), 13 = Foto del equipo, resto jugadores
// iso = código para las banderas de flagcdn.com (emoji como respaldo sin conexión)

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const TEAMS = [
  // Grupo A
  { code: "MEX", name: "México", iso: "mx", flag: "🇲🇽", group: "A" },
  { code: "RSA", name: "Sudáfrica", iso: "za", flag: "🇿🇦", group: "A" },
  { code: "KOR", name: "Corea del Sur", iso: "kr", flag: "🇰🇷", group: "A" },
  { code: "CZE", name: "Chequia", iso: "cz", flag: "🇨🇿", group: "A" },
  // Grupo B
  { code: "CAN", name: "Canadá", iso: "ca", flag: "🇨🇦", group: "B" },
  { code: "BIH", name: "Bosnia y Herzegovina", iso: "ba", flag: "🇧🇦", group: "B" },
  { code: "QAT", name: "Catar", iso: "qa", flag: "🇶🇦", group: "B" },
  { code: "SUI", name: "Suiza", iso: "ch", flag: "🇨🇭", group: "B" },
  // Grupo C
  { code: "BRA", name: "Brasil", iso: "br", flag: "🇧🇷", group: "C" },
  { code: "MAR", name: "Marruecos", iso: "ma", flag: "🇲🇦", group: "C" },
  { code: "HAI", name: "Haití", iso: "ht", flag: "🇭🇹", group: "C" },
  { code: "SCO", name: "Escocia", iso: "gb-sct", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C" },
  // Grupo D
  { code: "USA", name: "Estados Unidos", iso: "us", flag: "🇺🇸", group: "D" },
  { code: "PAR", name: "Paraguay", iso: "py", flag: "🇵🇾", group: "D" },
  { code: "AUS", name: "Australia", iso: "au", flag: "🇦🇺", group: "D" },
  { code: "TUR", name: "Turquía", iso: "tr", flag: "🇹🇷", group: "D" },
  // Grupo E
  { code: "GER", name: "Alemania", iso: "de", flag: "🇩🇪", group: "E" },
  { code: "CUW", name: "Curazao", iso: "cw", flag: "🇨🇼", group: "E" },
  { code: "CIV", name: "Costa de Marfil", iso: "ci", flag: "🇨🇮", group: "E" },
  { code: "ECU", name: "Ecuador", iso: "ec", flag: "🇪🇨", group: "E" },
  // Grupo F
  { code: "NED", name: "Países Bajos", iso: "nl", flag: "🇳🇱", group: "F" },
  { code: "JPN", name: "Japón", iso: "jp", flag: "🇯🇵", group: "F" },
  { code: "SWE", name: "Suecia", iso: "se", flag: "🇸🇪", group: "F" },
  { code: "TUN", name: "Túnez", iso: "tn", flag: "🇹🇳", group: "F" },
  // Grupo G
  { code: "BEL", name: "Bélgica", iso: "be", flag: "🇧🇪", group: "G" },
  { code: "EGY", name: "Egipto", iso: "eg", flag: "🇪🇬", group: "G" },
  { code: "IRN", name: "Irán", iso: "ir", flag: "🇮🇷", group: "G" },
  { code: "NZL", name: "Nueva Zelanda", iso: "nz", flag: "🇳🇿", group: "G" },
  // Grupo H
  { code: "ESP", name: "España", iso: "es", flag: "🇪🇸", group: "H" },
  { code: "CPV", name: "Cabo Verde", iso: "cv", flag: "🇨🇻", group: "H" },
  { code: "KSA", name: "Arabia Saudita", iso: "sa", flag: "🇸🇦", group: "H" },
  { code: "URU", name: "Uruguay", iso: "uy", flag: "🇺🇾", group: "H" },
  // Grupo I
  { code: "FRA", name: "Francia", iso: "fr", flag: "🇫🇷", group: "I" },
  { code: "SEN", name: "Senegal", iso: "sn", flag: "🇸🇳", group: "I" },
  { code: "IRQ", name: "Irak", iso: "iq", flag: "🇮🇶", group: "I" },
  { code: "NOR", name: "Noruega", iso: "no", flag: "🇳🇴", group: "I" },
  // Grupo J
  { code: "ARG", name: "Argentina", iso: "ar", flag: "🇦🇷", group: "J" },
  { code: "ALG", name: "Argelia", iso: "dz", flag: "🇩🇿", group: "J" },
  { code: "AUT", name: "Austria", iso: "at", flag: "🇦🇹", group: "J" },
  { code: "JOR", name: "Jordania", iso: "jo", flag: "🇯🇴", group: "J" },
  // Grupo K
  { code: "POR", name: "Portugal", iso: "pt", flag: "🇵🇹", group: "K" },
  { code: "COD", name: "RD del Congo", iso: "cd", flag: "🇨🇩", group: "K" },
  { code: "UZB", name: "Uzbekistán", iso: "uz", flag: "🇺🇿", group: "K" },
  { code: "COL", name: "Colombia", iso: "co", flag: "🇨🇴", group: "K" },
  // Grupo L
  { code: "ENG", name: "Inglaterra", iso: "gb-eng", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L" },
  { code: "CRO", name: "Croacia", iso: "hr", flag: "🇭🇷", group: "L" },
  { code: "GHA", name: "Ghana", iso: "gh", flag: "🇬🇭", group: "L" },
  { code: "PAN", name: "Panamá", iso: "pa", flag: "🇵🇦", group: "L" },
];

const STICKERS_PER_TEAM = 20;

function stickerLabel(num) {
  if (num === 1) return "Escudo";
  if (num === 13) return "Foto del equipo";
  return "Jugador";
}

// Genera la lista completa de cromos. Cada cromo: { id, code, section }
function buildStickers() {
  const stickers = [];
  stickers.push({ id: "P00", code: "00", section: "FWC", label: "Logo Panini (foil)" });
  for (let i = 1; i <= 19; i++) {
    stickers.push({
      id: `FWC${i}`,
      code: `FWC ${i}`,
      section: "FWC",
      label: i <= 8 ? "Especial" : "Museo FIFA",
    });
  }
  for (const team of TEAMS) {
    for (let n = 1; n <= STICKERS_PER_TEAM; n++) {
      stickers.push({
        id: `${team.code}${n}`,
        code: `${team.code} ${n}`,
        section: team.code,
        label: stickerLabel(n),
      });
    }
  }
  return stickers;
}

const ALL_STICKERS = buildStickers();
const TOTAL_STICKERS = ALL_STICKERS.length; // 980
