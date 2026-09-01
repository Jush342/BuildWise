import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type Props = {
    canResetPassword: boolean;
    forgotPasswordUrl: string;
    status?: string;
    processing: boolean;
    errors: Record<string, string>;
    registerUrl: string;
};

export function LoginForm({
    canResetPassword,
    forgotPasswordUrl,
    status,
    processing,
    errors,
    registerUrl,
}: Props) {
    return (
        <div className="flex min-h-svh items-center justify-center bg-[#0a0a0a] p-6">
            <div className="w-full max-w-[350px]">
                <div className="mb-8 flex flex-col gap-2 text-center">
                    <Link href="/" className="flex flex-col items-center gap-2">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-white shadow-sm">
                            <AppLogoIcon className="size-7 text-[#0a0a0a]" />
                        </div>
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        Welcome back
                    </h1>
                    <p className="text-sm text-zinc-400">
                        Log in to access your account
                    </p>
                </div>

                <Card className="border-zinc-800 bg-[#1a1a1a] shadow-xl">
                    <CardContent>
                        <FieldGroup>
                            {status && (
                                <div className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-400">
                                    {status}
                                </div>
                            )}

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
                                    tabIndex={1}
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
                                <div className="flex items-center justify-between">
                                    <FieldLabel
                                        htmlFor="password"
                                        className="text-zinc-300"
                                    >
                                        Password
                                    </FieldLabel>
                                    {canResetPassword && (
                                        <Link
                                            href={forgotPasswordUrl}
                                            className="text-sm text-zinc-400 underline-offset-4 hover:text-white hover:underline"
                                        >
                                            Forgot your password?
                                        </Link>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    className="border-zinc-700 bg-[#1a1a1a] text-white placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/50"
                                />
                                <InputError
                                    message={errors.password}
                                    className="text-red-400"
                                />
                            </Field>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-white font-medium text-black hover:bg-zinc-200"
                            >
                                {processing ? 'Logging in...' : 'Login'}
                            </Button>
                        </FieldGroup>
                    </CardContent>
                </Card>

                <p className="mt-6 text-center text-sm text-zinc-400">
                    Don't have an account?{' '}
                    <Link
                        href={registerUrl}
                        className="font-medium text-white underline-offset-4 hover:underline"
                    >
                        Sign up
                    </Link>
                </p>

                <p className="mt-6 text-center text-xs text-zinc-500">
                    By clicking continue, you agree to our{' '}
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
