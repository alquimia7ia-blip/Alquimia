const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa');
const md = require('react-icons/md');
const bs = require('react-icons/bs');
const fs = require('fs');

const SET = {
  saludo:     [fa.FaHandsHelping,   'FFFFFF'],
  ruta:       [fa.FaMapSigns,       'FFFFFF'],
  dinero:     [fa.FaCoins,          'FFFFFF'],
  calculadora:[fa.FaCalculator,     'FFFFFF'],
  reloj:      [fa.FaRegClock,       'FFFFFF'],
  lapiz:      [fa.FaPencilAlt,      'FFFFFF'],
  foco:       [fa.FaLightbulb,      'FFFFFF'],
  caminar:    [fa.FaWalking,        'FFFFFF'],
  comida:     [fa.FaUtensils,       'FFFFFF'],
  celular:    [fa.FaMobileAlt,      'FFFFFF'],
  camara:     [fa.FaCamera,         'FFFFFF'],
  whatsapp:   [fa.FaWhatsapp,       'FFFFFF'],
  sol:        [bs.BsSunFill,        'FFFFFF'],
  cuadro:     [md.MdCropFree,       'FFFFFF'],
  zoom:       [fa.FaSearchPlus,     'FFFFFF'],
  corazon:    [fa.FaRegHeart,       'FFFFFF'],
  check:      [fa.FaCheck,          'FFFFFF'],
  bolsa:      [fa.FaShoppingBasket, 'FFFFFF'],
  casa:       [fa.FaHome,           'FFFFFF'],
  grupo:      [fa.FaUserFriends,    'FFFFFF'],
};

(async () => {
  for (const [name, [Icon, color]] of Object.entries(SET)) {
    const svg = ReactDOMServer.renderToStaticMarkup(
      React.createElement(Icon, { color, size: 512 }));
    const buf = await sharp(Buffer.from(svg)).resize(512, 512, {
      fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    fs.writeFileSync(`icons/${name}.png`, buf);
  }
  console.log('iconos:', Object.keys(SET).length);
})();

// --- iconos adicionales para la sesion 5 ---
const EXTRA = {
  escudo:   fa.FaShieldAlt,
  mano:     fa.FaHandPaper,
  pregunta: fa.FaQuestion,
  fichas:   fa.FaCoins,
  tienda:   fa.FaStore,
  megafono: fa.FaBullhorn,
  libro:    fa.FaBookOpen,
  bombillo: fa.FaRegLightbulb,
};
(async () => {
  for (const [name, Icon] of Object.entries(EXTRA)) {
    const svg = ReactDOMServer.renderToStaticMarkup(
      React.createElement(Icon, { color: 'FFFFFF', size: 512 }));
    const buf = await sharp(Buffer.from(svg)).resize(512, 512, {
      fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    fs.writeFileSync(`icons/${name}.png`, buf);
  }
  console.log('extra:', Object.keys(EXTRA).length);
})();
