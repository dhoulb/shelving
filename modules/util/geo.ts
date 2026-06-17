import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import { isProp } from "./object.js";

/**
 * List of countries by two-letter ISO 3166-1 alpha-2 code.
 * - Keys are uppercase two-letter codes; values are the full English country name.
 *
 * @see https://dhoulb.github.io/shelving/util/geo/COUNTRIES
 */
export const COUNTRIES = {
	AF: "Afghanistan",
	AX: "Aland Islands",
	AL: "Albania",
	DZ: "Algeria",
	AS: "American Samoa",
	AD: "Andorra",
	AO: "Angola",
	AI: "Anguilla",
	AQ: "Antarctica",
	AG: "Antigua and Barbuda",
	AR: "Argentina",
	AM: "Armenia",
	AW: "Aruba",
	AU: "Australia",
	AT: "Austria",
	AZ: "Azerbaijan",
	BS: "Bahamas",
	BH: "Bahrain",
	BD: "Bangladesh",
	BB: "Barbados",
	BY: "Belarus",
	BE: "Belgium",
	BZ: "Belize",
	BJ: "Benin",
	BM: "Bermuda",
	BT: "Bhutan",
	BO: "Bolivia",
	BA: "Bosnia and Herzegovina",
	BW: "Botswana",
	BV: "Bouvet Island",
	BR: "Brazil",
	IO: "British Indian Ocean Territory",
	BN: "Brunei Darussalam",
	BG: "Bulgaria",
	BF: "Burkina Faso",
	BI: "Burundi",
	KH: "Cambodia",
	CM: "Cameroon",
	CA: "Canada",
	CV: "Cape Verde",
	KY: "Cayman Islands",
	CF: "Central African Republic",
	TD: "Chad",
	CL: "Chile",
	CN: "China",
	CX: "Christmas Island",
	CC: "Cocos (Keeling) Islands",
	CO: "Colombia",
	KM: "Comoros",
	CG: "Congo",
	CD: "Congo, Democratic Republic",
	CK: "Cook Islands",
	CR: "Costa Rica",
	CI: "Cote D'Ivoire",
	HR: "Croatia",
	CU: "Cuba",
	CY: "Cyprus",
	CZ: "Czech Republic",
	DK: "Denmark",
	DJ: "Djibouti",
	DM: "Dominica",
	DO: "Dominican Republic",
	EC: "Ecuador",
	EG: "Egypt",
	SV: "El Salvador",
	GQ: "Equatorial Guinea",
	ER: "Eritrea",
	EE: "Estonia",
	ET: "Ethiopia",
	FK: "Falkland Islands",
	FO: "Faroe Islands",
	FJ: "Fiji",
	FI: "Finland",
	FR: "France",
	GF: "French Guiana",
	PF: "French Polynesia",
	TF: "French Southern Territories",
	GA: "Gabon",
	GM: "Gambia",
	GE: "Georgia",
	DE: "Germany",
	GH: "Ghana",
	GI: "Gibraltar",
	GR: "Greece",
	GL: "Greenland",
	GD: "Grenada",
	GP: "Guadeloupe",
	GU: "Guam",
	GT: "Guatemala",
	GG: "Guernsey",
	GN: "Guinea",
	GW: "Guinea-Bissau",
	GY: "Guyana",
	HT: "Haiti",
	HM: "Heard Island & Mcdonald Islands",
	VA: "Holy See (Vatican City State)",
	HN: "Honduras",
	HK: "Hong Kong",
	HU: "Hungary",
	IS: "Iceland",
	IN: "India",
	ID: "Indonesia",
	IR: "Iran, Islamic Republic Of",
	IQ: "Iraq",
	IE: "Ireland",
	IM: "Isle of Man",
	IL: "Israel",
	IT: "Italy",
	JM: "Jamaica",
	JP: "Japan",
	JE: "Jersey",
	JO: "Jordan",
	KZ: "Kazakhstan",
	KE: "Kenya",
	KI: "Kiribati",
	KR: "Korea",
	KP: "North Korea",
	KW: "Kuwait",
	KG: "Kyrgyzstan",
	LA: "Lao People's Democratic Republic",
	LV: "Latvia",
	LB: "Lebanon",
	LS: "Lesotho",
	LR: "Liberia",
	LY: "Libyan Arab Jamahiriya",
	LI: "Liechtenstein",
	LT: "Lithuania",
	LU: "Luxembourg",
	MO: "Macao",
	MK: "Macedonia",
	MG: "Madagascar",
	MW: "Malawi",
	MY: "Malaysia",
	MV: "Maldives",
	ML: "Mali",
	MT: "Malta",
	MH: "Marshall Islands",
	MQ: "Martinique",
	MR: "Mauritania",
	MU: "Mauritius",
	YT: "Mayotte",
	MX: "Mexico",
	FM: "Micronesia, Federated States Of",
	MD: "Moldova",
	MC: "Monaco",
	MN: "Mongolia",
	ME: "Montenegro",
	MS: "Montserrat",
	MA: "Morocco",
	MZ: "Mozambique",
	MM: "Myanmar",
	NA: "Namibia",
	NR: "Nauru",
	NP: "Nepal",
	NL: "Netherlands",
	AN: "Netherlands Antilles",
	NC: "New Caledonia",
	NZ: "New Zealand",
	NI: "Nicaragua",
	NE: "Niger",
	NG: "Nigeria",
	NU: "Niue",
	NF: "Norfolk Island",
	MP: "Northern Mariana Islands",
	NO: "Norway",
	OM: "Oman",
	PK: "Pakistan",
	PW: "Palau",
	PS: "Palestinian Territory, Occupied",
	PA: "Panama",
	PG: "Papua New Guinea",
	PY: "Paraguay",
	PE: "Peru",
	PH: "Philippines",
	PN: "Pitcairn",
	PL: "Poland",
	PT: "Portugal",
	PR: "Puerto Rico",
	QA: "Qatar",
	RE: "Reunion",
	RO: "Romania",
	RU: "Russian Federation",
	RW: "Rwanda",
	BL: "Saint Barthelemy",
	SH: "Saint Helena",
	KN: "Saint Kitts and Nevis",
	LC: "Saint Lucia",
	MF: "Saint Martin",
	PM: "Saint Pierre and Miquelon",
	VC: "Saint Vincent and Grenadines",
	WS: "Samoa",
	SM: "San Marino",
	ST: "Sao Tome and Principe",
	SA: "Saudi Arabia",
	SN: "Senegal",
	RS: "Serbia",
	SC: "Seychelles",
	SL: "Sierra Leone",
	SG: "Singapore",
	SK: "Slovakia",
	SI: "Slovenia",
	SB: "Solomon Islands",
	SO: "Somalia",
	ZA: "South Africa",
	GS: "South Georgia and Sandwich Isl.",
	ES: "Spain",
	LK: "Sri Lanka",
	SD: "Sudan",
	SR: "Suriname",
	SJ: "Svalbard and Jan Mayen",
	SZ: "Swaziland",
	SE: "Sweden",
	CH: "Switzerland",
	SY: "Syrian Arab Republic",
	TW: "Taiwan",
	TJ: "Tajikistan",
	TZ: "Tanzania",
	TH: "Thailand",
	TL: "Timor-Leste",
	TG: "Togo",
	TK: "Tokelau",
	TO: "Tonga",
	TT: "Trinidad and Tobago",
	TN: "Tunisia",
	TR: "Turkey",
	TM: "Turkmenistan",
	TC: "Turks and Caicos Islands",
	TV: "Tuvalu",
	UG: "Uganda",
	UA: "Ukraine",
	AE: "United Arab Emirates",
	GB: "United Kingdom",
	US: "United States",
	UM: "United States Outlying Islands",
	UY: "Uruguay",
	UZ: "Uzbekistan",
	VU: "Vanuatu",
	VE: "Venezuela",
	VN: "Vietnam",
	VG: "Virgin Islands, British",
	VI: "Virgin Islands, U.S.",
	WF: "Wallis and Futuna",
	EH: "Western Sahara",
	YE: "Yemen",
	ZM: "Zambia",
	ZW: "Zimbabwe",
} as const;

/**
 * Two-letter ISO 3166-1 alpha-2 country code string (a key of [`COUNTRIES`](/util/geo/COUNTRIES)).
 *
 * @see https://dhoulb.github.io/shelving/util/geo/Country
 */
export type Country = keyof typeof COUNTRIES;

/**
 * A value that can possibly be resolved to a [`Country`](/util/geo/Country) — either a country code or the literal `"detect"`.
 *
 * @see https://dhoulb.github.io/shelving/util/geo/PossibleCountry
 */
export type PossibleCountry = Country | "detect";

/**
 * Parse a country string, or detect a browser country from `navigator.language`.
 * - When `value` is `"detect"`, reads the last two characters of `navigator.language` (if available).
 * - Matching is case-insensitive; the value is uppercased before lookup.
 *
 * @param value The country code to parse, or `"detect"` to read it from the browser. Defaults to `"detect"`.
 * @returns The matching [`Country`](/util/geo/Country) code, or `undefined` if it could not be resolved.
 * @example getCountry("gb") // "GB"
 * @see https://dhoulb.github.io/shelving/util/geo/getCountry
 */
export function getCountry(value: unknown = "detect"): Country | undefined {
	if (value === "detect") {
		if (typeof navigator === "object") {
			const code = navigator?.language?.slice(-2).toUpperCase();
			if (code && isProp(COUNTRIES, code)) return code;
		}
	} else if (typeof value === "string") {
		const code = value.toUpperCase();
		if (code && isProp(COUNTRIES, code)) return code;
	}
}

/**
 * Parse a country string, or detect a browser country from `navigator.language`, or throw [`RequiredError`](/error/RequiredError).
 *
 * @param value The country code to parse, or `"detect"` to read it from the browser.
 * @param caller Identity of the calling function for error attribution.
 * @returns The matching [`Country`](/util/geo/Country) code.
 * @throws RequiredError If a country could not be resolved.
 * @example requireCountry("gb") // "GB"
 * @see https://dhoulb.github.io/shelving/util/geo/requireCountry
 */
export function requireCountry(value?: unknown, caller: AnyCaller = requireCountry): Country {
	const country = getCountry(value);
	if (!country) throw new RequiredError("Must be country", { received: value, caller });
	return country;
}

/**
 * Format a country code into its full country name.
 * - Matching is case-insensitive; unknown codes are returned unchanged.
 *
 * @param country The country code to format.
 * @returns The full English country name, or the input unchanged if it is not a known code.
 * @example formatCountry("GB") // "United Kingdom"
 * @see https://dhoulb.github.io/shelving/util/geo/formatCountry
 */
export function formatCountry(country: string): string {
	const code = country.toUpperCase();
	return isProp(COUNTRIES, code) ? COUNTRIES[code] : country;
}

/**
 * Valid shape for physical address data.
 *
 * @see https://dhoulb.github.io/shelving/util/geo/AddressData
 */
export type AddressData = {
	readonly address1: string;
	readonly address2: string;
	readonly city: string;
	readonly state: string;
	readonly postcode: string;
	readonly country: Country;
};

/**
 * Format address data into a single multiline string.
 * - Each field is placed on its own line; an empty `address2` is omitted.
 * - The country code is expanded to its full name via [`formatCountry()`](/util/geo/formatCountry).
 *
 * @param address The address data to format.
 * @returns A newline-separated address string.
 * @example formatAddress({ address1: "1 High St", address2: "", city: "London", state: "", postcode: "SW1", country: "GB" })
 * @see https://dhoulb.github.io/shelving/util/geo/formatAddress
 */
export function formatAddress({ address1, address2, city, state, postcode, country }: AddressData): string {
	return `${address1}\n${address2 ? `${address2}\n` : ""}${city}\n${state}\n${postcode}\n${formatCountry(country)}`;
}
