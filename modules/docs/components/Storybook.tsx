import type { ReactElement, ReactNode } from "react";
import { Blockquote } from "../../ui/block/Blockquote.js";
import { Card } from "../../ui/block/Card.js";
import { Divider } from "../../ui/block/Divider.js";
import { Heading } from "../../ui/block/Heading.js";
import { List } from "../../ui/block/List.js";
import { Paragraph } from "../../ui/block/Paragraph.js";
import { Subheading } from "../../ui/block/Subheading.js";
import { Code } from "../../ui/inline/Code.js";
import { Emphasis } from "../../ui/inline/Emphasis.js";
import { Mark } from "../../ui/inline/Mark.js";
import { Small } from "../../ui/inline/Small.js";
import { Strong } from "../../ui/inline/Strong.js";
import { Tag } from "../../ui/inline/Tag.js";
import { Notice } from "../../ui/notice/Notice.js";
import { getClass } from "../../ui/util/css.js";
import styles from "./Storybook.module.css";

/** Live showcase of every component in the shelving UI library that renders meaningfully without client-side JS. */
export function Storybook(): ReactElement {
	return (
		<div className={styles.storybook}>
			<Section title="Tags">
				<Demo title="Status colours">
					<Tag>default</Tag>
					<Tag primary>primary</Tag>
					<Tag secondary>secondary</Tag>
					<Tag tertiary>tertiary</Tag>
					<Tag info>info</Tag>
					<Tag success>success</Tag>
					<Tag warning>warning</Tag>
					<Tag danger>danger</Tag>
					<Tag error>error</Tag>
					<Tag highlight>highlight</Tag>
					<Tag quiet>quiet</Tag>
				</Demo>
				<Demo title="Outline">
					<Tag outline primary>
						primary
					</Tag>
					<Tag outline success>
						success
					</Tag>
					<Tag outline error>
						error
					</Tag>
				</Demo>
			</Section>

			<Section title="Inline text">
				<Demo title="Emphasis, strong, code, mark, small">
					<Paragraph>
						This is <Strong>strong</Strong>, <Emphasis>emphasised</Emphasis>, <Code>{"some code()"}</Code>, <Mark>highlighted</Mark>, and{" "}
						<Small>smaller text</Small>.
					</Paragraph>
				</Demo>
			</Section>

			<Section title="Headings">
				<Demo title="Heading levels" stack>
					<Heading level="1">Heading level 1</Heading>
					<Subheading level="2">Subheading level 2</Subheading>
					<Subheading level="3">Subheading level 3</Subheading>
				</Demo>
			</Section>

			<Section title="Paragraphs and prose">
				<Demo title="Paragraph" stack>
					<Paragraph>
						The <Strong>shelving</Strong> toolkit provides primitives for schema validation, database providers, state stores, and React
						integration.
					</Paragraph>
					<Paragraph>
						Components like <Code>Paragraph</Code> apply consistent typography, spacing, and prose-level styling.
					</Paragraph>
				</Demo>
				<Demo title="Blockquote" stack>
					<Blockquote>
						<Paragraph>"Trust source and tests over README if they conflict — but fix the README rather than leaving it wrong."</Paragraph>
					</Blockquote>
				</Demo>
				<Demo title="List" stack>
					<List>
						<li>Validate input via schemas</li>
						<li>Persist via providers</li>
						<li>Subscribe via stores</li>
					</List>
				</Demo>
				<Demo title="Divider" stack>
					<Divider />
				</Demo>
			</Section>

			<Section title="Cards">
				<Demo title="Card variants" stack>
					<Card>
						<Paragraph>Default card content.</Paragraph>
					</Card>
					<Card narrow>
						<Paragraph>Narrow card constrained to a smaller maximum width.</Paragraph>
					</Card>
					<Card wide>
						<Paragraph>Wide card constrained to a larger maximum width.</Paragraph>
					</Card>
				</Demo>
			</Section>

			<Section title="Notices">
				<Demo title="Status messages" stack>
					<Notice status="info">An informational notice.</Notice>
					<Notice status="success">Operation completed successfully.</Notice>
					<Notice status="warning">Heads up — review your input.</Notice>
					<Notice status="error">Something went wrong.</Notice>
					<Notice status="danger">Destructive action — proceed carefully.</Notice>
				</Demo>
			</Section>
		</div>
	);
}

function Section({ title, children }: { readonly title: string; readonly children: ReactNode }): ReactElement {
	return (
		<section className={styles.section}>
			<h2 className={styles.sectionTitle}>{title}</h2>
			{children}
		</section>
	);
}

function Demo({
	title,
	children,
	stack = false,
}: {
	readonly title: string;
	readonly children: ReactNode;
	readonly stack?: boolean;
}): ReactElement {
	return (
		<div className={styles.demo}>
			<h3 className={styles.demoTitle}>{title}</h3>
			<div className={getClass(styles.preview, stack ? styles.previewStack : null)}>{children}</div>
		</div>
	);
}
