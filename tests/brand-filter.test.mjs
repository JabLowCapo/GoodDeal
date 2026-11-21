import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { chineseBrandForMake, makeKey } from '../chinese-makes.mjs';

// Published make fields, marketplace make selectors and alternate labels those selectors use.
const examples = {
  AutoTraders: [
    ['Baic', 'BAIC'], ['بيست تيون', 'Bestune'], ['3فوتون', 'Foton'], ['تشانجن', 'Changan'],
    ['هونكي', 'Hongqi'], ['Avatar', 'Avatr'], ['أفاتار', 'Avatr'], ['JMC', 'JMC']
  ],
  CarSwitch: [
    ['Faw-Bestune', 'Bestune'], ['فاو بيستون', 'Bestune'], ['GWM', 'Great Wall Motor'],
    ['جريت وول', 'Great Wall Motor'], ['Galaxy', 'Geely Galaxy'], ['جالكسي', 'Geely Galaxy'],
    ['Speranza', 'Chery'], ['سبيرنزا', 'Chery'], ['أفاتر', 'Avatr']
  ],
  DubiCars: [
    ['212 موتورز', '212 Motors'], ['سي اتش تي سي', 'CHTC'], ['هايغر', 'Higer'],
    ['جاي ام سي', 'JMC'], ['سينوتراك', 'Sinotruk'], ['سايك', 'SAIC Motor'], ['زوتي اوتو', 'Zotye']
  ],
  Dubizzle: [
    ['Fengon', 'Fengon'], ['جايكو', 'Jaecoo'], ['إم إتش إي آر أو', 'Mengshi'],
    ['جي دبليو إم', 'Great Wall Motor'], ['إكس بانغ', 'XPeng'], ['Rox', 'ROX Motor'],
    ['iCaur', 'iCaur'], ['BAW', 'BAW'], ['LEPAS', 'Lepas'], ['Maextro', 'Maextro']
  ],
  OpenSooq: [
    ['افاتار', 'Avatr'], ['هونج تشي', 'Hongqi'], ['روي', 'Roewe'], ['آي إم', 'IM Motors'],
    ['ساوايست \u202c \u202b', 'Soueast'], ['DongFong', 'Dongfeng'], ['JMEV', 'JMEV']
  ],
  YallaMotor: [
    ['زي أن أي', 'ZNA'], ['لينك وكو', 'Lynk & Co'], ['دي إف إس كاي', 'DFSK'],
    ['Dongfeng Sokon', 'DFSK'], ['FAW Besturn', 'Bestune'], ['Great Wall', 'Great Wall Motor'],
    ['فورتينغ', 'Forthing']
  ]
};

for (const [marketplace, pairs] of Object.entries(examples)) {
  test(`${marketplace} make labels identify the intended brand`, () => {
    for (const [make, expected] of pairs) {
      assert.equal(chineseBrandForMake(make, marketplace), expected, make);
    }
  });
}

test('reviewed English and Arabic make labels from the six marketplaces are all covered', async () => {
  const selectors = JSON.parse(await readFile(new URL('./marketplace-aliases.json', import.meta.url), 'utf8'));
  for (const [marketplace, labels] of Object.entries(selectors)) {
    for (const label of labels) {
      assert.ok(chineseBrandForMake(label, marketplace), `${marketplace} / ${label}`);
    }
  }
});

test('reviewed inventory, related marques and historical spellings', () => {
  const makes = [
    'BAIC', 'Bestune', 'Brilliance', 'BYD', 'Changan', 'Chery', 'DFSK', 'DongFeng', 'Exeed',
    'Faw Besturn', 'Faw-Bestune', 'Fengon', 'Foton', 'GAC', 'Geely', 'great-wall', 'GWM',
    'Haval', 'Higer', 'Hongqi', 'JAC', 'Jetour', 'JMC', 'Kaiyi', 'Karry', 'kinglong', 'Maxus',
    'MG', 'Omoda', 'Roewe', 'Skywell', 'Soueast', 'VGV', 'Victory', 'Voyah', 'Zotye',
    'Denza', 'Yangwang', 'Fang Cheng Bao', 'Geely Galaxy', 'Zeekr', 'Radar Auto', 'Lynk and Co',
    'Great Wall Haval', 'GWM Tank', 'GWM Ora', 'GWM Wey', 'Changan Deepal', 'Avatr', 'KYC',
    'Chery Cowin', 'iCar', 'SAIC Maxus', 'NIO', 'Onvo', 'XPeng', 'Aion', 'Hozon Auto',
    'Li Xiang', 'Leapmotors', 'Polestone', 'Dorcen', 'Xiaomi Auto', 'IM Motors'
  ];
  for (const make of makes) assert.ok(chineseBrandForMake(make), make);
  assert.equal(chineseBrandForMake('  ＦＡＷ–Ｂｅｓｔｕｒｎ  '), 'Bestune');
  assert.equal(chineseBrandForMake('D.F.S.K.'), 'DFSK');
  assert.equal(chineseBrandForMake('العلامة شيري'), null);
  assert.equal(chineseBrandForMake('长安汽车'), 'Changan');
});

// These makes have been reviewed for continued display. New snapshot spellings get a review.
const reviewedVisible = new Set([
  'Abarth', 'AC', 'Acura', 'Alfa Romeo', 'Alpina', 'Alpine', 'Ariel', 'Ashok Leyland',
  'Aston Martin', 'Audi', 'Avatar Sports Cars', 'Bear', 'Bentley', 'BMW', 'BMW Alpina',
  'Borgward', 'BRABUS', 'Bugatti', 'Buick', 'Cadillac', 'Can-am', 'Caterham', 'Cevo', 'Chevrolet',
  'Chrysler', 'Citroen', 'Citroën', 'CMC', 'Dacia', 'Daewoo', 'Daihatsu', 'Datsun', 'Dodge',
  'Ducati', 'Ferrari', 'Fiat', 'Fisker', 'Force', 'Ford', 'Freelander', 'Fuso', 'Genesis', 'GMC',
  'Gordon', 'Hino', 'Honda', 'Hummer', 'Hyundai', 'INEOS', 'Infiniti', 'Isuzu', 'Iveco',
  'Jaguar', 'Jeep', 'JETTA', 'KGM', 'Kia', 'Koenigsegg', 'Lamborghini', 'Lancia', 'Land Rover',
  'LEVC', 'Lexus', 'Lincoln', 'Lotus', 'Lucid', 'Luxgen', 'Mahindra', 'Maserati', 'Massey Ferguson',
  'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mercedes-Maybach', 'Mini', 'Mitsubishi',
  'Morgan', 'Nissan', 'Opel', 'Pagani', 'Peugeot', 'Polestar', 'Porsche', 'Proton', 'Rabdan',
  'RAM', 'Renault', 'Rivian', 'Rolls-Royce', 'Saab', 'SEAT', 'Sharmax', 'Shelby', 'Skoda',
  'Škoda', 'Smart', 'Spruce', 'SsangYong', 'Subaru', 'Suzuki', 'Swapa', 'Tata', 'Tesla', 'Toyota',
  'Veryca', 'VinFast', 'Volkswagen', 'Volvo', 'XEV', 'جي إم سي', 'جمس', 'Other', 'Unknown',
  'Other Make', 'Unknown Make', 'Unspecified', 'N/A'
].map(makeKey));

test('ambiguous, unrelated and missing makes stay visible', () => {
  for (const key of reviewedVisible) assert.equal(chineseBrandForMake(key), null, key);
  for (const make of [null, undefined, 212, {}, '', '  ', 'Ford Galaxy', 'JAC Motorsports', 'Jacquar', 'Avatars', 'MG Rover Group']) {
    assert.equal(chineseBrandForMake(make), null, String(make));
  }
  for (const marketplace of Object.keys(examples)) {
    for (const label of ['GMC', 'جي ام سي', 'جي أم سي', 'جي إم سي', 'Avatar Sports Cars']) {
      assert.equal(chineseBrandForMake(label, marketplace), null, `${marketplace} / ${label}`);
    }
    assert.equal(chineseBrandForMake('Avatar', marketplace), ['AutoTraders', 'OpenSooq'].includes(marketplace) ? 'Avatr' : null);
    assert.equal(chineseBrandForMake('Galaxy', marketplace), marketplace === 'CarSwitch' ? 'Geely Galaxy' : null);
  }
});

test('every make in the published snapshot has a recorded review decision', async () => {
  const file = process.env.GOODDEAL_AUDIT_SNAPSHOT || new URL('../data/good-deals.json', import.meta.url);
  const snapshot = JSON.parse(await readFile(file, 'utf8'));
  const unreviewed = new Set();
  for (const { make, marketplace } of snapshot.listings) {
    const key = makeKey(make);
    if (key && !chineseBrandForMake(make, marketplace) && !reviewedVisible.has(key)) {
      unreviewed.add(`${marketplace} / ${make}`);
    }
  }
  assert.equal(unreviewed.size, 0, `Review these marketplace make labels:\n${[...unreviewed].sort().join('\n')}`);
});
