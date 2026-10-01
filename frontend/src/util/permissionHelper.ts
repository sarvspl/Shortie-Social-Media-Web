/**
 * Checks if a user has permission for a specific module and action.
 * 
 * @param {Object} admin - The admin object from Redux state.
 * @param {string} loginType - The login type ('admin' or 'staff').
 * @param {Array} permissions - The permissions array from Redux state.
 * @param {string} moduleName - The name of the module to check.
 * @param {string} actionName - The specific action to check (e.g., 'List', 'Create', 'Edit', 'Delete').
 * @returns {boolean} - Returns true if the user has permission, false otherwise.
 */
export const checkPermission = (admin: any, loginType: string, permissions: any[], moduleName: string, actionName: string | null = null) => {
    if (moduleName === "Dashboard") {
        return true;
    }

    if (actionName === "Update") {
        actionName = "Edit";
    }

    // Super admins have all permissions
    if (loginType === 'admin') {
        return true;
    }

    // Flag bypass only for non-staff or explicit super-admin flag
    if (loginType !== 'staff' && admin?.flag === true) {
        return true;
    }

    // If permissions is not an array, return false
    if (!Array.isArray(permissions)) {
        return false;
    }

    // Find the module in the permissions array
    const modulePermission = permissions.find(p => p.module === moduleName);

    if (!modulePermission) {
        return false;
    }

    // If no specific action is requested, just checking for module visibility
    if (!actionName) {
        return true;
    }

    // Check if the requested action exists in the module's actions array
    return modulePermission.actions && modulePermission.actions.includes(actionName);
};
