import { Form, Head } from '@inertiajs/react';
import { LoginForm } from '@/components/login-form';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import type { TeamInvitationContext } from '@/types';

type Props = {
    status?: string;
    canResetPassword: boolean;
    teamInvitation?: TeamInvitationContext | null;
};

export default function Login({
    status,
    canResetPassword,
    teamInvitation,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            {teamInvitation && (
                <TeamInvitationAlert
                    invitation={teamInvitation}
                    action="Log in"
                />
            )}

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <LoginForm
                        canResetPassword={canResetPassword}
                        forgotPasswordUrl={request.url()}
                        status={status}
                        processing={processing}
                        errors={errors}
                        registerUrl="/register"
                    />
                )}
            </Form>
        </>
    );
}
