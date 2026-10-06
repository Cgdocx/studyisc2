export interface TopicIcon {
  id: string;
  label: string;
  kw: RegExp;
  svg: string;
}

export const TOPIC_ICONS: TopicIcon[] = [
{id:'cia',label:'CIA Triad',kw:/\bcia\b|\btriad\b|confidentiality.*integrity.*availability|information\s+assurance/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M10 2L18 17H2Z"/><circle cx="10" cy="11" r="2" fill="currentColor"/></svg>'},
{id:'confidentiality',label:'Confidentiality',kw:/\bconfidentiality\b|unauthorized\s+disclosure|privacy|data.*protected.*from.*viewing|classif(?:ied|ication)|secrecy/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><ellipse cx="10" cy="10" rx="8" ry="5"/><circle cx="10" cy="10" r="2" fill="currentColor"/><line x1="3" y1="17" x2="17" y2="3"/></svg>'},
{id:'integrity',label:'Integrity',kw:/\bintegrity\b|tamper|unauthorized\s+modif|hash\w*\b|checksum|data.*accurate.*complete|unauthorized\s+change|message\s+digest/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M10 1L17 5V10C17 14 14 17 10 19C6 17 3 14 3 10V5Z"/><polyline points="7,10 9,13 14,7"/></svg>'},
{id:'availability',label:'Availability',kw:/\bavailability\b|uptime|downtime|redundan|failover|single\s+point.*failure|accessible.*when\s+needed|inaccessible|resilien/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><circle cx="10" cy="10" r="8"/><polyline points="10,4 10,10 14,10"/><polyline points="15,3 17,1 19,3"/></svg>'},
{id:'risk',label:'Risk',kw:/\brisks?\b|\bthreat\s+(?:assess|analy|model|intellig|landscape|actor|vector|identif)|\bvulnerabilit\w+\b|\bweakness\b|\bdanger\b|\blikelihood\b|\bimpact\s+analy|\bBIA\b|\bbusiness\s+impact/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M10 1L19 18H1Z"/><line x1="10" y1="7" x2="10" y2="12"/><rect x="9" y="14" width="2" height="2" fill="currentColor"/></svg>'},
{id:'governance',label:'Governance',kw:/\bgovernance\b|\bpolic(?:y|ies)\b|\bregulation\b|\bcompliance\b|\bframework\b|\bstandards?\b|\bNIST\b|\bISO\b|\blegal\b|\blaws?\b|\baudit\b(?!.*trail)|\bdue\s+(?:care|diligence)\b|\bethics?\b|\bcode\s+of\s+(?:ethics|conduct)\b|\bcanon\b|\bMOU\b|\bmemorandum\b|\bSLA\b|\bservice\s+level\b|\bagreement\b|\bmanaged\s+service/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><rect x="3" y="2" width="14" height="16"/><line x1="6" y1="6" x2="14" y2="6"/><line x1="6" y1="10" x2="14" y2="10"/><line x1="6" y1="14" x2="10" y2="14"/><circle cx="14" cy="14" r="2" fill="currentColor"/></svg>'},
{id:'auth',label:'Authentication',kw:/\bauthenticat\w*\b|\bpassword\b|\bMFA\b|\bmulti.factor\b|\bbiometric\b|\bcredential\b|\blogin\b|\bfactor\b.*authent|\bsomething\s+you\s+(?:know|have|are)\b|\btoken\b.*authent/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><circle cx="6" cy="8" r="4"/><line x1="10" y1="8" x2="19" y2="8"/><line x1="16" y1="5" x2="16" y2="8"/><line x1="13" y1="5" x2="13" y2="8"/></svg>'},
{id:'access',label:'Access Control',kw:/\baccess\s+control\b|\bRBAC\b|\bDAC\b|\bMAC\b|\bpermission\b|\bprivileg\b|\bleast\s+privilege\b|\bauthoriz\b|\bse(?:pa|gre)gation\s+of\s+duties\b|\baccess.*manage|\blogical\s+access|\bsecurity\s+model\b|\bBell.LaPadula\b|\bBiba\b|\brole.based\b|\bdiscretionary\b|\bmandatory\s+access|\bsubjects?\b.*\bobjects?\b/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><rect x="2" y="8" width="7" height="10"/><rect x="11" y="8" width="7" height="10"/><line x1="9" y1="11" x2="11" y2="11"/><path d="M5 8V5C5 3 7 1 10 1S15 3 15 5V8"/></svg>'},
{id:'physical',label:'Physical Security',kw:/\bphysical\b.*(?:security|access|control|barrier|protect)|\blocks?\b|\bbadge\b|\bguards?\b|\bfences?\b|\bgates?\b.*(?:physical|protect|secur)|\bCCTV\b|\bsurveillance\b|\bmantrap\b|\bbollard\b|\bturnstile\b|\bdoor\b.*(?:access|protect|secure)|\bfire\s+suppress|\bdata\s*cent(?:er|re)/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><rect x="5" y="8" width="10" height="10"/><path d="M7 8V6C7 3 8 2 10 2S13 3 13 6V8"/><circle cx="10" cy="13" r="1.5" fill="currentColor"/><line x1="10" y1="14.5" x2="10" y2="16"/></svg>'},
{id:'identity',label:'Identity',kw:/\bidentity\b|\bIAM\b|\bSSO\b|\bsingle\s+sign.on\b|\bLDAP\b|\bdirectory\b|\bprovision\b|\bdeprovisioning\b|\baccount\s+manage/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><circle cx="10" cy="6" r="4"/><path d="M3 18C3 14 6 12 10 12S17 14 17 18"/><rect x="12" y="13" width="6" height="4"/></svg>'},
{id:'network',label:'Network',kw:/\bnetwork(?:ing|s)?\b|\brouters?\b|\bswitche?s?\b|\bports?\b(?!.*folio)|\bIP\s|\bIP\b|\bTCP\b|\bDNS\b|\bsubnets?\b|\bDMZ\b|\bprotocols?\b|\bOSI\b|\bpackets?\b|\bLAN\b|\bWAN\b|\bVLAN\b|\bNAT\b|\bIPv[46]\b|\bservers?\b|\bclients?\b.*server|\baddress\b.*\b\d+\.\d+/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><circle cx="10" cy="4" r="2" fill="currentColor"/><circle cx="4" cy="16" r="2" fill="currentColor"/><circle cx="16" cy="16" r="2" fill="currentColor"/><line x1="10" y1="6" x2="4" y2="14"/><line x1="10" y1="6" x2="16" y2="14"/><line x1="6" y1="16" x2="14" y2="16"/></svg>'},
{id:'firewall',label:'Firewall',kw:/\bfirewalls?\b|\bWAF\b|\baccess\s+control\s+list\b|\bACL\b|\bstateful\b|\bproxy\b.*\bserver\b|\bpacket\s+filter/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><rect x="2" y="2" width="16" height="16"/><line x1="2" y1="7" x2="18" y2="7"/><line x1="2" y1="13" x2="18" y2="13"/><line x1="7" y1="2" x2="7" y2="7"/><line x1="13" y1="7" x2="13" y2="13"/><line x1="7" y1="13" x2="7" y2="18"/></svg>'},
{id:'crypto',label:'Encryption',kw:/\bencrypt\w*\b|\bdecrypt\w*\b|\bAES\b|\bRSA\b|\bcipher\b|\bPKI\b|\bcertificate\b|\bTLS\b|\bSSL\b|\bdigital\s+signature\b|\bpublic\s+key\b|\bprivate\s+key\b|\bcryptograph\w*\b|\bsymmetric\b|\basymmetric\b/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><rect x="4" y="8" width="12" height="10"/><path d="M7 8V5C7 3 8 2 10 2S13 3 13 5V8"/><rect x="7" y="12" width="2" height="2" fill="currentColor"/><rect x="11" y="12" width="2" height="2" fill="currentColor"/></svg>'},
{id:'attack',label:'Threat',kw:/\battacks?\b|\bmalware\b|\bvirus\w*\b|\bphishing\b|\bDoS\b|\bDDoS\b|\bexploit\b|\bransomware\b|\bsocial\s+engineer\w*\b|\bworms?\b|\btrojans?\b|\bbrute\s+force\b|\bman.in.the.middle\b|\bMITM\b|\bspoof\w*\b|\binjection\b|\bXSS\b|\bbot\b(?:net)?|\bzero.day\b|\bthreat\b(?!.*(?:assess|analy|model|intellig|landscape|identif))|\bpentest\w*\b|\bpenetration\s+test|\bcyberattack\w*/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M10 1L12 7H18L13 11L15 17L10 13L5 17L7 11L2 7H8Z"/></svg>'},
{id:'incident',label:'Incident Response',kw:/\bincident\b|\bresponse\b.*\bplan|\bcontainment\b|\beradication\b|\bforensic\b|\bCSIRT\b|\bIRT\b|\bbreach\b|\balert\b.*security|\bescalat\b/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M10 1C13 1 15 3 15 5V9L18 13V15H2V13L5 9V5C5 3 7 1 10 1Z"/><path d="M8 15C8 17 9 18 10 18S12 17 12 15"/></svg>'},
{id:'bcdr',label:'BC / DR',kw:/\bbusiness\s+continuity\b|\bdisaster\s+recovery\b|\bBCP\b|\bDRP\b|\bbackups?\b|\brestore\b|\bRPO\b|\bRTO\b|\bhot\s+site\b|\bwarm\s+site\b|\bcold\s+site\b|\brecovery\s+(?:point|time|site|plan)\b/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M4 10A6 6 0 0114 5"/><polyline points="14,2 14,5 11,5"/><path d="M16 10A6 6 0 016 15"/><polyline points="6,18 6,15 9,15"/></svg>'},
{id:'logging',label:'Monitoring',kw:/\blog(?:ging|s)?\b|\bmonitor\w*\b|\baudit\s+trail\b|\bSIEM\b|\bIDS\b|\bIPS\b|\bdetection\b.*intrusion|\bevent\b.*security|\bintrusion\s+detect/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><rect x="2" y="2" width="16" height="12"/><line x1="5" y1="6" x2="15" y2="6"/><line x1="5" y1="10" x2="12" y2="10"/><line x1="6" y1="18" x2="14" y2="18"/><line x1="10" y1="14" x2="10" y2="18"/></svg>'},
{id:'change',label:'Change Mgmt',kw:/\bchange\s+(?:management|control|request|advisory)\b|\bpatch\w*\b|\bconfiguration\s+manage|\bbaseline\b|\bversion\s+control\b|\bCAB\b|\bhardening\b|\bupdates?\b.*(?:system|security|software)|\bupgrades?\b/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="2.5" fill="currentColor"/><line x1="10" y1="3" x2="10" y2="5"/><line x1="10" y1="15" x2="10" y2="17"/><line x1="3" y1="10" x2="5" y2="10"/><line x1="15" y1="10" x2="17" y2="10"/></svg>'},
{id:'data',label:'Data',kw:/\bdata\s+(?:classif|handling|retention|destruct|protect|loss|breach|leak|at\s+rest|in\s+transit|in\s+use)\b|\bDLP\b|\bPII\b|\bPHI\b|\bsensitive\s+data\b|\bdata\s+life\s*cycle\b|\bdata\s+delet\w*\b|\bsecure\s+(?:delet|eras|dispos)/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M2 4C2 4 3 2 10 2S18 4 18 4"/><path d="M2 4V14C2 14 3 17 10 17S18 14 18 14V4"/><path d="M2 9C2 9 3 12 10 12S18 9 18 9"/></svg>'},
{id:'wireless',label:'Wireless',kw:/\bwireless\b|\bWi.?Fi\b|\bWPA\b|\bWEP\b|\bbluetooth\b|\bSSID\b|\brogue\s+AP\b/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><circle cx="10" cy="16" r="1.5" fill="currentColor"/><path d="M6 13C7.5 11.5 8.5 11 10 11S12.5 11.5 14 13"/><path d="M3 10C5.5 7.5 7.5 6.5 10 6.5S14.5 7.5 17 10"/><path d="M0 7C4 3 6 2 10 2S16 3 20 7"/></svg>'},
{id:'cloud',label:'Cloud',kw:/\bcloud\b|\bSaaS\b|\bPaaS\b|\bIaaS\b|\bmulti.tenant\b|\bhybrid\s+cloud\b|\bpublic\s+cloud\b|\bprivate\s+cloud\b|\bshared\s+responsibility\b/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M5 15C2.5 15 1 13.5 1 11.5S2.5 8 5 8C5 5 7 3 10 3S15 5 15 8C17 8 19 9.5 19 11.5S17.5 15 15 15Z"/></svg>'},
{id:'awareness',label:'Awareness',kw:/\bawareness\b|\btraining\b.*(?:security|employ)|\beducation\b.*security|\bsecurity\s+training\b|\buser\s+(?:awareness|education)\b/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><circle cx="10" cy="7" r="5"/><line x1="10" y1="4" x2="10" y2="8"/><circle cx="10" cy="3" r="0.8" fill="currentColor"/><line x1="10" y1="12" x2="10" y2="15"/><line x1="7" y1="15" x2="13" y2="15"/><line x1="8" y1="18" x2="12" y2="18"/></svg>'},
{id:'vpn',label:'VPN',kw:/\bVPN\b|\btunnel\b|\bIPSec\b|\bremote\s+access\b/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><rect x="1" y="7" width="5" height="6"/><rect x="14" y="7" width="5" height="6"/><path d="M6 10C8 7 12 7 14 10"/><path d="M6 10C8 13 12 13 14 10"/></svg>'},
{id:'nonrepudiation',label:'Non-repudiation',kw:/\bnon.repudiation\b|\bcannot\s+deny\b|\bundeniable\b|\bsender.*deny\b/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><rect x="3" y="2" width="14" height="16"/><polyline points="7,10 9,13 14,7"/><circle cx="4" cy="17" r="2" fill="currentColor"/></svg>'},
{id:'security_controls',label:'Security Controls',kw:/\bsecurity\s+controls?\b|\bpreventive\b|\bdetective\b|\bcorrective\b|\bcompensating\b|\bdeterrent\b|\btechnical\s+control\b|\badministrative\s+control\b|\bphysical\s+control\b|\bcountermeasure/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M10 1L17 5V10C17 14 14 17 10 19C6 17 3 14 3 10V5Z"/><line x1="7" y1="8" x2="13" y2="8"/><line x1="7" y1="11" x2="13" y2="11"/><line x1="7" y1="14" x2="11" y2="14"/></svg>'},
{id:'general',label:'Security',kw:/\bsecurity\b|\bcybersecurity\b|\bprotect\b|\bdefend\b|\bsafeguard\b|\bemployee\b|\borganiz/i,
svg:'<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M10 1L17 5V10C17 14 14 17 10 19C6 17 3 14 3 10V5Z"/></svg>'}
];

export function getTopicForQuestion(txt: string): TopicIcon | null {
  if (!txt) return null;
  for (const t of TOPIC_ICONS) if (t.kw.test(txt)) return t;
  return null;
}
