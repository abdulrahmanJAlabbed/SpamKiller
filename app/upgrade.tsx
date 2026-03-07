/**
 * Upgrade Screen — Presented as transparent modal, shows upgrade variant
 */

import { UpgradeModal } from '@/components/modals/UpgradeModal';
import type { UpgradeVariant } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function UpgradeScreen() {
    const { variant = 'filter' } = useLocalSearchParams<{ variant?: string }>();

    return <UpgradeModal variant={(variant as UpgradeVariant) || 'filter'} />;
}
