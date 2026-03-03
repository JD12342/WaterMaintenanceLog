import { router } from '@inertiajs/react';

export const logout = () => {
    router.post('/logout', {}, { preserveState: false });
};
