import { useSelector } from 'react-redux';
import { checkPermission } from '../util/permissionHelper';
import { RootStore } from '../store/store';

/**
 * Custom hook to check permissions in components.
 * 
 * @returns {Object} - An object containing the 'can' function.
 */

export const usePermission = () => {
    const { admin, loginType, permissions } = useSelector((state: RootStore) => state.admin);

    /**
     * Checks if the user can perform a specific action on a module.
     * 
     * @param {string} moduleName - The name of the module.
     * @param {string} actionName - The name of the action (e.g., 'List', 'Create', 'Edit', 'Delete').
     * @returns {boolean} - True if permitted, false otherwise.
     */
    const can = (moduleName: string, actionName: string | null = null) => {
        return checkPermission(admin, loginType, permissions, moduleName, actionName);
    };

    return { can };
};
