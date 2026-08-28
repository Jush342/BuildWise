import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from '@/components/ui/field';
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
                        Login with your Apple or Google account
                    </p>
                </div>

                <Card className="border-zinc-800 bg-[#1a1a1a] shadow-xl">
                    <CardContent>
                        <FieldGroup>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-zinc-700 bg-[#1a1a1a] text-white hover:bg-zinc-800 hover:text-white"
                                >
                                    <svg
                                        className="size-4"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.98-2.53 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                    </svg>
                                    Apple
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-zinc-700 bg-[#1a1a1a] text-white hover:bg-zinc-800 hover:text-white"
                                >
                                    <svg
                                        className="size-4"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Google
                                </Button>
                            </div>

                            <FieldSeparator>Or continue with</FieldSeparator>

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
                    <Link
                        href="/terms"
                        className="underline underline-offset-4 hover:text-white"
                    >
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                        href="/privacy"
                        className="underline underline-offset-4 hover:text-white"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}
