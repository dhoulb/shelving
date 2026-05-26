import type { ReactElement } from "react";
import { type AddressData, formatAddress } from "../../schema/AddressSchema.js";
import type { Nullish } from "../../util/null.js";
import { Small } from "../inline/Small.js";
import { Strong } from "../inline/Strong.js";
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import styles from "./Address.module.css";

export interface AddressProps extends AlignVariants, ColorVariants, SpacingVariants, TypographyVariants, ChildProps {}

export interface PhysicalAddressProps {
	name?: Nullish<string>;
	address: Nullish<AddressData>;
}

export interface EmailAddressProps {
	name?: Nullish<string>;
	email: Nullish<string>;
}

/** Show any kind of contact data. */
export function Address({ children, ...variants }: AddressProps) {
	return (
		<address
			className={getClass(
				getModuleClass(styles, "address"),
				getColorClass(variants),
				getAlignClass(variants),
				getSpacingClass(variants),
				getTypographyClass(variants),
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
