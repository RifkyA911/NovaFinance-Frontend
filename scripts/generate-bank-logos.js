const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/assets/images/banks');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const svgs = {
  'bca.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#003882"/>
    <circle cx="24" cy="24" r="14" fill="#00529C"/>
    <path d="M17 19H23.5C26 19 27.5 20.2 27.5 22C27.5 23.3 26.6 24.3 25.2 24.7C27 25.1 28.2 26.2 28.2 28C28.2 30.1 26.4 31.5 23.5 31.5H17V19ZM20.8 24H23C24.2 24 24.8 23.4 24.8 22.4C24.8 21.4 24.2 20.8 23 20.8H20.8V24ZM20.8 29.7H23.3C24.7 29.7 25.4 29 25.4 27.8C25.4 26.7 24.6 26 23.2 26H20.8V29.7Z" fill="white"/>
    <path d="M31.5 28.5L34 26C32.8 24.8 31.2 24 29.5 24C27.5 24 25.8 25 25 26.5L27.5 28C28 27.2 28.7 26.8 29.5 26.8C30.3 26.8 31 27.4 31.5 28.5Z" fill="#FDB913"/>
  </svg>`,

  'mandiri.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#002D62"/>
    <path d="M14 28V20H17.5L20.5 25L23.5 20H27V28H24.2V23.5L21.3 28H19.7L16.8 23.5V28H14Z" fill="white"/>
    <path d="M29 28V20H31.8L35.5 25.2V20H38.2V28H35.6L31.8 22.7V28H29Z" fill="white"/>
    <path d="M12 33C17 33 22 36 29 32C33 29.5 37 30 40 31" stroke="#FDB913" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M18 36C22 36 26 38 31 35.5" stroke="#F7941D" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  'bri.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#00529C"/>
    <rect x="10" y="16" width="28" height="16" rx="4" fill="#003366"/>
    <text x="24" y="28" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">BRI</text>
    <path d="M10 29C14 30.5 20 31 24 31C28 31 34 30.5 38 29" stroke="#F37021" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  'bni.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#005E6A"/>
    <text x="19" y="28" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF" text-anchor="middle">BNI</text>
    <path d="M28 17L37 25.5L34 27.5L28 22V31H25.5V17H28Z" fill="#F15A24"/>
    <circle cx="35.5" cy="21.5" r="2.5" fill="#F15A24"/>
  </svg>`,

  'bsi.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#00A39D"/>
    <circle cx="24" cy="24" r="13" fill="#00827C"/>
    <path d="M24 15L25.8 21.2H32L26.9 24.8L28.8 31L24 27.3L19.2 31L21.1 24.8L16 21.2H22.2L24 15Z" fill="#F9A01B"/>
    <text x="24" y="37" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">BSI</text>
  </svg>`,

  'jago.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#FF5B00"/>
    <text x="24" y="29" font-family="Arial, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.5">jago</text>
    <circle cx="33" cy="19" r="2" fill="#FFD100"/>
  </svg>`,

  'seabank.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#EE4D2D"/>
    <path d="M16 27C17 30 20 32 24 32C28 32 31 29.5 31 26C31 22 26 21 24 20C21.5 19 18 18 18 15C18 12.5 20.5 10.5 24 10.5C27 10.5 29.5 12 30.5 14" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
    <text x="24" y="39" font-family="Arial, sans-serif" font-size="6.5" font-weight="bold" fill="white" text-anchor="middle">SEABANK</text>
  </svg>`,

  'cimb.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#ED1B24"/>
    <path d="M14 16H22L30 24L22 32H14L22 24L14 16Z" fill="white"/>
    <polygon points="26,20 34,20 38,24 34,28 26,28 30,24" fill="#FFFFFF" opacity="0.75"/>
  </svg>`,

  'permata.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#1B365D"/>
    <path d="M24 12L31 24L24 36L17 24L24 12Z" fill="#84BD00"/>
    <path d="M24 16L28.5 24L24 32L19.5 24L24 16Z" fill="#009A44"/>
    <circle cx="24" cy="24" r="3" fill="#E52421"/>
  </svg>`,

  'danamon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#003366"/>
    <path d="M12 24C12 17.37 17.37 12 24 12C28 12 31.5 14 33.5 17" stroke="#FF6600" stroke-width="4" stroke-linecap="round"/>
    <path d="M36 24C36 30.63 30.63 36 24 36C20 36 16.5 34 14.5 31" stroke="#FFB300" stroke-width="4" stroke-linecap="round"/>
    <circle cx="24" cy="24" r="4" fill="#FF6600"/>
  </svg>`,

  'blu.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#00D1FF"/>
    <circle cx="24" cy="24" r="12" fill="#002B49"/>
    <text x="24" y="28" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#00D1FF" text-anchor="middle">blu</text>
  </svg>`,

  'jenius.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#00A3E0"/>
    <circle cx="19" cy="24" r="8" stroke="white" stroke-width="3" fill="none"/>
    <circle cx="29" cy="24" r="8" stroke="#FFB81C" stroke-width="3" fill="none"/>
    <circle cx="24" cy="24" r="2" fill="white"/>
  </svg>`,

  'ocbc.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#EE2726"/>
    <path d="M24 12C17.37 12 12 17.37 12 24C12 30.63 17.37 36 24 36C30.63 36 36 30.63 36 24" fill="none" stroke="white" stroke-width="2.5"/>
    <path d="M17 24C19 20 22 17 25 15C24 20 23 25 17 27V24Z" fill="white"/>
    <path d="M22 26C24 23 27 20 30 18C29 23 28 27 22 29V26Z" fill="white"/>
  </svg>`,

  'gopay.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#00AED6"/>
    <circle cx="24" cy="24" r="12" stroke="white" stroke-width="4" fill="none"/>
    <circle cx="24" cy="24" r="4" fill="white"/>
  </svg>`,

  'ovo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#4C3494"/>
    <circle cx="24" cy="24" r="11" stroke="white" stroke-width="3.5" fill="none"/>
    <circle cx="24" cy="24" r="6" stroke="#A485F6" stroke-width="2.5" fill="none"/>
  </svg>`,

  'dana.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#118EEA"/>
    <path d="M17 17H25C29 17 32 19.5 32 23.5C32 27.5 29 30 25 30H17V17Z" fill="white"/>
    <path d="M21 21H24.5C26.5 21 28 22 28 23.5C28 25 26.5 26 24.5 26H21V21Z" fill="#118EEA"/>
  </svg>`,

  'shopeepay.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#EE4D2D"/>
    <rect x="13" y="16" width="22" height="17" rx="3" stroke="white" stroke-width="2.5" fill="none"/>
    <path d="M18 16V13C18 11.5 19.5 10 21.5 10H26.5C28.5 10 30 11.5 30 13V16" stroke="white" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M22 22C22 20.8 23 20 24 20C25 20 26 20.8 26 22C26 24 22 25 22 27C22 28.2 23 29 24 29C25 29 26 28.2 26 27" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>`,

  'linkaja.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#ED1C24"/>
    <circle cx="24" cy="24" r="12" fill="#D0021B"/>
    <path d="M18 29L22 17H26L22 29H18Z" fill="white"/>
    <path d="M24 17L28 29H32L28 17H24Z" fill="#FFD100"/>
    <circle cx="25" cy="23" r="2.5" fill="white"/>
  </svg>`,

  'chase.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#117ACA"/>
    <path d="M19 14H29L34 19V29L29 34H19L14 29V19L19 14Z" stroke="white" stroke-width="3" stroke-linejoin="bevel" fill="none"/>
    <rect x="22" y="12" width="4" height="8" fill="white"/>
    <rect x="28" y="22" width="8" height="4" fill="white"/>
    <rect x="22" y="28" width="4" height="8" fill="white"/>
    <rect x="12" y="22" width="8" height="4" fill="white"/>
  </svg>`,

  'bofa.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#012169"/>
    <rect x="12" y="16" width="10" height="3" fill="#E31837"/>
    <rect x="12" y="21" width="10" height="3" fill="#E31837"/>
    <rect x="12" y="26" width="10" height="3" fill="#E31837"/>
    <rect x="26" y="16" width="10" height="3" fill="white"/>
    <rect x="26" y="21" width="10" height="3" fill="#E31837"/>
    <rect x="26" y="26" width="10" height="3" fill="#E31837"/>
    <rect x="12" y="31" width="24" height="2" fill="#E31837"/>
  </svg>`,

  'wellsfargo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#D71E28"/>
    <rect x="10" y="10" width="28" height="28" rx="3" stroke="#F4A900" stroke-width="2" fill="none"/>
    <text x="24" y="24" font-family="Arial, sans-serif" font-size="8" font-weight="900" fill="#F4A900" text-anchor="middle">WELLS</text>
    <text x="24" y="32" font-family="Arial, sans-serif" font-size="8" font-weight="900" fill="#F4A900" text-anchor="middle">FARGO</text>
  </svg>`,

  'citi.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#003B70"/>
    <text x="23" y="29" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">citi</text>
    <path d="M23 15C27 15 31 17 33 20" stroke="#EC1C24" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  </svg>`,

  'paypal.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#003087"/>
    <path d="M16 35L20 14H28C32 14 34.5 16 34 20C33.5 24 30.5 26 27 26H22L20.5 35H16Z" fill="#0079C1"/>
    <path d="M20 32L23 18H29C32.5 18 34.5 19.5 34 23C33.5 26.5 31 28.5 27.5 28.5H23.5L22.5 35H20" fill="#00457C" opacity="0.6"/>
    <path d="M21 34L23.5 19H29C32.5 19 34.5 20.5 34 24C33.5 27.5 31 29.5 27.5 29.5H24.5L23.5 35H21" fill="#0079C1"/>
  </svg>`,

  'wise.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#9FE870"/>
    <path d="M16 16H23L27 26L31 16H36L29 32H23L16 16Z" fill="#163300"/>
    <polygon points="20,16 27,26 25,29 18,18" fill="#225A00"/>
  </svg>`,

  'stripe.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#635BFF"/>
    <path d="M23 20.5C23 19.6 23.8 19 25.2 19C26.8 19 28.5 19.5 29.8 20.3V16.2C28.3 15.5 26.7 15.2 25.1 15.2C20.8 15.2 18 17.5 18 21C18 26.3 25.3 25.5 25.3 27.8C25.3 28.9 24.3 29.5 22.8 29.5C21 29.5 19 28.8 17.5 27.8V32C19.2 32.8 21.1 33.2 23 33.2C27.5 33.2 30.5 31 30.5 27.2C30.5 21.5 23 22.5 23 20.5Z" fill="white"/>
  </svg>`,

  'revolut.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#191C1F"/>
    <path d="M16 14H26C29.5 14 32 16 32 19.5C32 22 30.5 24 28 24.8L33 34H28L23.8 26H21V34H16V14ZM21 22H25.5C27 22 28 21 28 19.5C28 18 27 17 25.5 17H21V22Z" fill="white"/>
  </svg>`,

  'cash.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#10B981"/>
    <rect x="11" y="16" width="26" height="16" rx="3" fill="#059669" stroke="white" stroke-width="2"/>
    <circle cx="24" cy="24" r="4" fill="#FBBF24" stroke="white" stroke-width="1.5"/>
    <line x1="15" y1="20" x2="15" y2="28" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="33" y1="20" x2="33" y2="28" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  'crypto.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill="#F59E0B"/>
    <circle cx="24" cy="24" r="12" fill="#D97706" stroke="white" stroke-width="2"/>
    <text x="24" y="29" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">₿</text>
  </svg>`
};

for (const [file, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(dir, file), content.trim());
}

console.log('Successfully wrote ' + Object.keys(svgs).length + ' bank SVGs into ' + dir);
