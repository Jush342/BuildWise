import { Form, Head, Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <div className="flex min-h-svh items-center justify-center bg-[#0a0a0a] p-6">
            <Head title="Create account" />
            <div className="w-full max-w-[350px]">
                <div className="mb-8 flex flex-col gap-2 text-center">
                    <Link href="/" className="flex flex-col items-center gap-2">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-white shadow-sm">
                            <AppLogoIcon className="size-7 text-[#0a0a0a]" />
                        </div>
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        Create your account
                    </h1>
                    <p className="text-sm text-zinc-400">
                        Sign up to access your client portal
                    </p>
                </div>

                <Card className="border-zinc-800 bg-[#1a1a1a] shadow-xl">
                    <CardContent>
                        <Form
                            {...store.form()}
                            resetOnSuccess={[
                                'password',
                                'password_confirmation',
                            ]}
                        >
                            {({ processing, errors }) => (
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel
                                            htmlFor="name"
                                            className="text-zinc-300"
                                        >
                                            Full name
                                        </FieldLabel>
                                        <Input
                                            id="name"
                                            type="text"
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Jane Doe"
                                            className="border-zinc-700 bg-[#1a1a1a] text-white placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/50"
                                        />
                                        <InputError
                                            message={errors.name}
                                            className="text-red-400"
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel
                                            htmlFor="email"
                                            className="text-zinc-300"
                                        >
                                            Email
                                        </FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoComplete="email"
                                            placeholder="name@example.com"
                                            className="border-zinc-700 bg-[#1a1a1a] text-white placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/50"
                                        />
                                        <InputError
                                            message={errors.email}
                                            className="text-red-400"
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel
                                            htmlFor="password"
                                            className="text-zinc-300"
                                        >
                                            Password
                                        </FieldLabel>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            className="border-zinc-700 bg-[#1a1a1a] text-white placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/50"
                                        />
                                        <InputError
                                            message={errors.password}
                                            className="text-red-400"
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel
                                            htmlFor="password_confirmation"
                                            className="text-zinc-300"
                                        >
                                            Confirm password
                                        </FieldLabel>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            className="border-zinc-700 bg-[#1a1a1a] text-white placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/50"
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                            className="text-red-400"
                                        />
                                    </Field>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-white font-medium text-black hover:bg-zinc-200"
                                    >
                                        {processing
                                            ? 'Creating account...'
                                            : 'Create account'}
                                    </Button>
                                </FieldGroup>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <p className="mt-6 text-center text-sm text-zinc-400">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-medium text-white underline-offset-4 hover:underline"
                    >
                        Log in
                    </Link>
                </p>

                <p className="mt-6 text-center text-xs text-zinc-500">
                    By creating an account, you agree to our{' '}
                    <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-white"
                    >
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-white"
                    >
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
