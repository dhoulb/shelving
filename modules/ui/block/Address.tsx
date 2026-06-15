import type { ReactElement } from "react";
import { type AddressData, formatAddress } from "../../schema/AddressSchema.js";
import type { Nullish } from "../../util/null.js";
import { Small } from "../inline/Small.js";
import { Strong } from "../inline/Strong.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { TINT_CLASS } from "../style/Tint.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import ADDRESS_CSS from "./Address.module.css";

const ADDRESS_CLASS = getModuleClass(ADDRESS_CSS, "address");

/**
 * Props for `Address` — colour, space, and typography variants plus required children.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Address/AddressProps
 */
export interface AddressProps extends ColorVariants, SpaceVariants, TypographyVariants, ChildProps {}

/**
 * Props for `PhysicalAddress` — an optional name and a nullable `AddressData` object.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Address/PhysicalAddressProps
 */
export interface PhysicalAddressProps {
	name?: Nullish<string>;
	address: Nullish<AddressData>;
}

/**
 * Props for `EmailAddress` — an optional name and a nullable email string.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Address/EmailAddressProps
 */
export interface EmailAddressProps {
	name?: Nullish<string>;
	email: Nullish<string>;
}

/**
 * Show any kind of contact data, rendered as an `<address>`.
 *
 * @example <Address><Strong>Acme</Strong>{"\n"}1 Example St</Address>
 * @see https://dhoulb.github.io/shelving/ui/block/Address/Address
 */
export function Address({ children, ...props }: AddressProps) {
	return (
		<address
			className={getClass(
				ADDRESS_CLASS, //
				TINT_CLASS,
				getColorClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</address>
	);
}

/**
 * Show an optional `AddressData` object correctly on screen.
 * - Renders an optional `name` in bold, followed by the formatted address; shows "No address" when `address` is empty.
 *
 * @example <PhysicalAddress name="Acme" address={addressData} />
 * @see https://dhoulb.github.io/shelving/ui/block/Address/PhysicalAddress
 */
export function PhysicalAddress({ name, address }: PhysicalAddressProps): ReactElement {
	return (
		<Address>
			{name && <Strong>{name}</Strong>}
			{name && "\n"}
			{address ? formatAddress(address) : <Small>No address</Small>}
		</Address>
	);
}

/**
 * Show an optional email address string correctly on screen.
 * - Renders an optional `name` in bold, followed by a `mailto:` link; shows "No email" when `email` is empty.
 *
 * @example <EmailAddress name="Acme" email="hi@example.com" />
 * @see https://dhoulb.github.io/shelving/ui/block/Address/EmailAddress
 */
export function EmailAddress({ name, email }: EmailAddressProps): ReactElement {
	return (
		<Address>
			{name && <Strong>{name}</Strong>}
			{name && "\n"}
			{email ? <a href={`mailto:${email}`}>{email}</a> : <Small>No email</Small>}
		</Address>
	);
}
