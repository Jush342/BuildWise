import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;
    const brand = !name || name === 'Laravel' ? 'BuildWise' : name;

    return (
        <>
            <div className="flex size-8 items-center justify-center rounded-md bg-amber-600 text-white">
                <AppLogoIcon />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {brand}
                </span>
            </div>
        </>
    );
}
