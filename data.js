/* ---------------------------------------------------------------------------
 * data.js — Dakhla Admission Tracker
 * All content data lives here: the university list, the document checklist,
 * and the Scam Shield red-flag statements.
 *
 * Keeping data separate from logic (logic.js) and UI (app.js) means you can
 * update fees, deadlines or merits by editing ONLY this file.
 *
 * Notes on realism:
 *  - Application fees, semester fees and 2025 closing merits are realistic
 *    estimates for a demo (fees change every year — always verify against
 *    the official university portal before applying).
 *  - All deadlines below are set in Nov–Dec 2026, ahead of today (Oct 2026).
 *  - csMerit = 2025 closing aggregate for BS Computer Science (aggregate =
 *    50% Intermediate + 50% entry test). AKU's MBBS is test/interview-based,
 *    so its merit is null (the UI skips it gracefully).
 * -------------------------------------------------------------------------*/

const UNIVERSITIES = [
  {
    id: 'nust',
    name: 'NUST Islamabad',
    city: 'Islamabad',
    sector: 'Public',
    appFee: 5000,
    semesterFee: 210000,
    deadline: '2026-12-10',
    portal: 'undergrad.nust.edu.pk',
    csMerit: 81,
    programs: [
      { name: 'BS Computer Science', merit: 81 },
      { name: 'BS Software Engineering', merit: 78 },
      { name: 'BS Artificial Intelligence', merit: 79 }
    ]
  },
  {
    id: 'lums',
    name: 'LUMS Lahore',
    city: 'Lahore',
    sector: 'Private',
    appFee: 8000,
    semesterFee: 550000,
    deadline: '2026-12-15',
    portal: 'admission.lums.edu.pk',
    csMerit: 86,
    programs: [
      { name: 'BS Computer Science', merit: 86 },
      { name: 'BS Electrical Engineering', merit: 84 },
      { name: 'BSc Economics', merit: 88 }
    ]
  },
  {
    id: 'uet-peshawar',
    name: 'UET Peshawar',
    city: 'Peshawar',
    sector: 'Public',
    appFee: 3000,
    semesterFee: 42000,
    deadline: '2026-11-25',
    portal: 'admissions.uetpeshawar.edu.pk',
    csMerit: 72,
    programs: [
      { name: 'BS Computer Science', merit: 72 },
      { name: 'BS Software Engineering', merit: 70 },
      { name: 'BSc Electrical Engineering', merit: 68 }
    ]
  },
  {
    id: 'uet-lahore',
    name: 'UET Lahore',
    city: 'Lahore',
    sector: 'Public',
    appFee: 3000,
    semesterFee: 58000,
    deadline: '2026-11-30',
    portal: 'admission.uet.edu.pk',
    csMerit: 76,
    programs: [
      { name: 'BS Computer Science', merit: 76 },
      { name: 'BS Software Engineering', merit: 74 },
      { name: 'BSc Mechanical Engineering', merit: 72 }
    ]
  },
  {
    id: 'pu-lahore',
    name: 'University of the Punjab Lahore',
    city: 'Lahore',
    sector: 'Public',
    appFee: 3000,
    semesterFee: 50000,
    deadline: '2026-12-05',
    portal: 'admissions.pu.edu.pk',
    csMerit: 80,
    programs: [
      { name: 'BS Computer Science', merit: 80 },
      { name: 'BS Information Technology', merit: 77 },
      { name: 'BS Data Science', merit: 78 }
    ]
  },
  {
    id: 'iba-karachi',
    name: 'IBA Karachi',
    city: 'Karachi',
    sector: 'Public',
    appFee: 5000,
    semesterFee: 320000,
    deadline: '2026-12-18',
    portal: 'admissions.iba.edu.pk',
    csMerit: 85,
    programs: [
      { name: 'BS Computer Science', merit: 85 },
      { name: 'BBA', merit: 87 },
      { name: 'BS Economics', merit: 83 }
    ]
  },
  {
    id: 'fast-islamabad',
    name: 'FAST-NUCES Islamabad',
    city: 'Islamabad',
    sector: 'Private',
    appFee: 3000,
    semesterFee: 255000,
    deadline: '2026-11-28',
    portal: 'admissions.nu.edu.pk',
    csMerit: 75,
    programs: [
      { name: 'BS Computer Science', merit: 75 },
      { name: 'BS Software Engineering', merit: 73 },
      { name: 'BS Artificial Intelligence', merit: 74 }
    ]
  },
  {
    id: 'comsats-islamabad',
    name: 'COMSATS University Islamabad',
    city: 'Islamabad',
    sector: 'Public',
    appFee: 3000,
    semesterFee: 95000,
    deadline: '2026-12-08',
    portal: 'admissions.comsats.edu.pk',
    csMerit: 74,
    programs: [
      { name: 'BS Computer Science', merit: 74 },
      { name: 'BS Software Engineering', merit: 72 },
      { name: 'BS Cyber Security', merit: 73 }
    ]
  },
  {
    id: 'aku-karachi',
    name: 'Aga Khan University Karachi',
    city: 'Karachi',
    sector: 'Private',
    appFee: 7500,
    semesterFee: 600000,
    deadline: '2026-12-20',
    portal: 'akuedu/admissions',
    csMerit: null, // AKU MBBS is test + interview based — no aggregate merit
    programs: [
      { name: 'MBBS', merit: null },
      { name: 'BSc Nursing', merit: null },
      { name: 'MBBS (test + interview based)', merit: null }
    ]
  },
  {
    id: 'qau-islamabad',
    name: 'Quaid-i-Azam University Islamabad',
    city: 'Islamabad',
    sector: 'Public',
    appFee: 4000,
    semesterFee: 75000,
    deadline: '2026-12-12',
    portal: 'admissions.qau.edu.pk',
    csMerit: 78,
    programs: [
      { name: 'BS Computer Science', merit: 78 },
      { name: 'BS Information Technology', merit: 75 },
      { name: 'BBA', merit: 80 }
    ]
  },
  {
    id: 'giki-topi',
    name: 'GIKI Topi',
    city: 'Topi',
    sector: 'Private',
    appFee: 5000,
    semesterFee: 290000,
    deadline: '2026-12-14',
    portal: 'giki.edu.pk/admissions',
    csMerit: 72,
    programs: [
      { name: 'BS Computer Science', merit: 72 },
      { name: 'BS Artificial Intelligence', merit: 71 },
      { name: 'BS Computer Engineering', merit: 70 }
    ]
  },
  {
    id: 'pieas-islamabad',
    name: 'PIEAS Islamabad',
    city: 'Islamabad',
    sector: 'Public',
    appFee: 5000,
    semesterFee: 120000,
    deadline: '2026-12-01',
    portal: 'pieas.edu.pk/admissions',
    csMerit: 82,
    programs: [
      { name: 'BS Computer & Information Sciences', merit: 82 },
      { name: 'BS Electrical Engineering', merit: 80 },
      { name: 'BS Mechanical Engineering', merit: 79 }
    ]
  }
];

/* Documents every applicant typically needs, in the order admission offices
 * usually ask for them. Persisted in localStorage under 'dakhla_checklist_v1'. */
const DOCUMENTS = [
  { id: 'domicile', label: 'Domicile certificate' },
  { id: 'bform', label: 'B-Form / CNIC copy' },
  { id: 'inter', label: 'Intermediate result card' },
  { id: 'character', label: 'Character certificate' },
  { id: 'photos', label: 'Passport-size photographs' },
  { id: 'challan', label: 'Application fee challan' }
];

/* Scam Shield: the red-flag statements a user can tick. Verdict logic lives
 * in logic.js (scamVerdict). */
const SCAM_FLAGS = [
  { id: 'guarantee', label: 'Agent guarantees admission', why: 'No honest agent can guarantee a seat — admissions are decided by merit lists, not middlemen.' },
  { id: 'cash', label: 'Asks for cash, no receipt', why: 'Legitimate fees are always paid through a bank challan or the official portal — never cash with no paper trail.' },
  { id: 'no-official', label: 'No official email or website', why: 'Real admissions run through the university\u2019s own .edu.pk portal and official email addresses.' },
  { id: 'overfee', label: 'Fee far above the published rate', why: 'Application fees are published on the portal. Anything much higher is someone taking a cut.' }
];

/* Only trusted ways to pay or verify — shown as a static reassuring list. */
const VERIFIED_CHANNELS = [
  'The university\u2019s own admission portal (listed on each university card)',
  'Bank challan downloaded from the official portal',
  'The university\u2019s admission office landline (from their .edu.pk site)',
  'HEC Pakistan (hec.gov.pk) for degree-program verification'
];

/* Export for Node (tests) while staying a plain global in the browser. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UNIVERSITIES, DOCUMENTS, SCAM_FLAGS, VERIFIED_CHANNELS };
}
