import { Languages } from '@/i18n/languages'

import { createTranslator } from 'next-intl'

import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from '@react-email/components'

interface MagicLinkEmailProps {
	appName: string
	emailName: string
	loginUrl: string
	expirationTime?: string
	locale: Languages
}

export async function MagicLinkEmail({ appName, emailName, loginUrl, expirationTime, locale }: MagicLinkEmailProps) {
	const msg = await import(`../../locales/emails/${locale}.json`)
	const t = createTranslator({
		locale,
		messages: msg.default,
		namespace: 'magic-link',
	})

	return (
		<Html>
			<Head />
			<Preview>{t('subject', { appName })}</Preview>

			<Body
				style={{
					backgroundColor: '#f5f7fb',
					fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
					padding: '40px 0',
				}}
			>
				<Container
					style={{
						backgroundColor: '#ffffff',
						maxWidth: '620px',
						borderRadius: '18px',
						overflow: 'hidden',
						border: '1px solid #e5e7eb',
					}}
				>
					<Section
						style={{
							padding: '48px',
						}}
					>
						<Text
							style={{
								fontWeight: 700,
								fontSize: '26px',
								marginBottom: '40px',
							}}
						>
							{appName}
						</Text>

						<Heading
							style={{
								fontSize: '36px',
								lineHeight: '42px',
								margin: 0,
								fontWeight: 700,
							}}
						>
							{t('subject', { appName })}
						</Heading>

						<Text
							style={{
								color: '#4b5563',
								fontSize: '17px',
								lineHeight: '30px',
								marginTop: '28px',
							}}
						>
							{t('greeting', { emailName })}
						</Text>

						<Text
							style={{
								color: '#4b5563',
								fontSize: '17px',
								lineHeight: '30px',
							}}
						>
							{t('body')}
						</Text>
						{expirationTime && (
							<Text
								style={{
									color: '#4b5563',
									fontSize: '17px',
									lineHeight: '30px',
								}}
							>
								{t('expiration-time', { expirationTime })}
							</Text>
						)}
						<Button
							href={loginUrl}
							style={{
								marginTop: '32px',
								backgroundColor: '#111827',
								color: '#fff',
								padding: '16px 28px',
								borderRadius: '12px',
								fontWeight: 600,
								fontSize: '16px',
								textDecoration: 'none',
							}}
						>
							{t('button')} →
						</Button>

						<Hr
							style={{
								margin: '42px 0',
								borderColor: '#f0f0f0',
							}}
						/>

						<Text
							style={{
								color: '#6b7280',
								fontSize: '14px',
								lineHeight: '24px',
							}}
						>
							{t('button-note')}
						</Text>

						<Link
							href={loginUrl}
							style={{
								color: '#2563eb',
								wordBreak: 'break-word',
								fontSize: '14px',
							}}
						>
							{loginUrl}
						</Link>

						<Text
							style={{
								color: '#9ca3af',
								marginTop: '40px',
								fontSize: '13px',
							}}
						>
							{t('footer')}
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}

export default MagicLinkEmail

MagicLinkEmail.PreviewProps = {
	appName: 'Home Wallet',
	emailName: 'myhomewallet',
	loginUrl:
		'http://localhost:6001/api/auth/callback/email?callbackUrl=http%3A%2F%2Flocalhost%3A6001%2Fdashboard&token=8dc304f3de7e158e4563d6fe73aee47fd0af79771de194ba419f3453012a3015&email=pablo123test456%40gmail.com',
	expirationTime: '15 minutes',
	locale: Languages.SPANISH,
} satisfies MagicLinkEmailProps
