import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Tag } from '../../components/ui/Tag';

jest.mock('@expo/vector-icons', () => ({
    MaterialCommunityIcons: 'MaterialCommunityIcons'
}));

describe('Tag Component', () => {
    it('renders correctly with text prop', () => {
        const { getByText } = render(<Tag text="Important" />);
        expect(getByText('Important')).toBeTruthy();
    });

    it('triggers onRemove callback when close icon is pressed', () => {
        const onRemoveMock = jest.fn();
        const { getByRole, getByLabelText, UNSAFE_getByType } = render(
            <Tag text="Spam" onRemove={onRemoveMock} />
        );

        // Find the MaterialCommunityIcons mock which represents the close button
        const closeButton = UNSAFE_getByType('MaterialCommunityIcons' as any);
        expect(closeButton).toBeTruthy();

        // Parent is a Pressable, trigger press on the icon wrapper
        fireEvent.press(closeButton);
        expect(onRemoveMock).toHaveBeenCalledTimes(1);
    });
});
