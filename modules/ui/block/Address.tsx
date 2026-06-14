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

export const ADDRESS_CLASS = getModuleClass(ADDRESS_CSS, "address");
export const ADDRESS_PROSE_CLASS = getModuleClass(ADDRESS_CSS, "prose");

export interface AddressProps extends ColorVariants, SpaceVariants, TypographyVariants, ChildProps {}

export interface PhysicalAddressProps {
	name?: Nullish<string>;
	address: Nullish<AddressData>;
}

export interface EmailAddressProps {
	name?: Nullish<string>;
	email: Nullish<string>;
}

/** Show any kind of contact data. */
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

/** Show an optional `AddressData` object correctly on screen. */
export function PhysicalAddress({ name, address }: PhysicalAddressProps): ReactElement {
	return (
		<Address>
			{name && <Strong>{name}</Strong>}
			{name && "\n"}
			{address ? formatAddress(address) : <Small>No address</Small>}
		</Address>
	);
}

/** Show an optional email address string correctly on screen. */
export function EmailAddress({ name, email }: EmailAddressProps): ReactElement {
	return (
		<Address>
			{name && <Strong>{name}</Strong>}
			{name && "\n"}
			{email ? <a href={`mailto:${email}`}>{email}</a> : <Small>No email</Small>}
		</Address>
	);
}
