import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SettingsRow } from '../../components/ui/SettingsRow';

// Mocking the translation hook and vector icons since these are not standard elements
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        i18n: { dir: () => 'ltr' },
        t: (key: string) => key
    })
}));
jest.mock('@expo/vector-icons', () => ({
    MaterialCommunityIcons: 'MaterialCommunityIcons'
}));

describe('SettingsRow Component', () => {
    it('renders label and description correctly', () => {
        const { getByText } = render(
            <SettingsRow
                icon="shield-check"
                label="Security"
                description="Manage your safety"
                onPress={() => { }}
            />
        );

        expect(getByText('Security')).toBeTruthy();
        expect(getByText('Manage your safety')).toBeTruthy();
    });

    it('triggers onPress when pressed', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(
            <SettingsRow
                icon="cog"
                label="Settings"
                onPress={onPressMock}
            />
        );

        fireEvent.press(getByText('Settings'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('renders a switch correctly and responds to events', () => {
        const onValueChangeMock = jest.fn();
        const { getByRole } = render(
            <SettingsRow
                icon="bell"
                label="Notifications"
                value={true}
                onValueChange={onValueChangeMock}
            />
        );

        const switchComponent = getByRole('switch');
        expect(switchComponent).toBeTruthy();

        fireEvent(switchComponent, 'onValueChange', false);
        expect(onValueChangeMock).toHaveBeenCalledWith(false);
    });
});
