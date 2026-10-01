import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setToast } from "@/util/toast";

interface RoleState {
    role: any[];
    assignableRoles: any[];
    total: number;
    isLoading: boolean;
}

const initialState: RoleState = {
    role: [],
    assignableRoles: [],
    total: 0,
    isLoading: false,
};

export const fetchRoles = createAsyncThunk(
    "admin/role/listRoles",
    async (params: { start: number; limit: number; search?: string }) => {
        const res = await axios.get(`admin/role/listRoles?start=${params.start}&limit=${params.limit}${params.search ? `&search=${params.search}` : ""}`);
        return res.data;
    }
);

export const createRole = createAsyncThunk(
    "admin/role/registerRole",
    async (payload: any) => {
        const res = await axios.post("admin/role/registerRole", payload);
        return res.data;
    }
);

export const editRole = createAsyncThunk(
    "admin/role/modifyRole",
    async (payload: any) => {
        const res = await axios.patch("admin/role/modifyRole", payload);
        return res.data;
    }
);

export const deleteRole = createAsyncThunk(
    "admin/role/removeRole",
    async (roleId: string) => {
        const res = await axios.delete(`admin/role/removeRole?roleId=${roleId}`);
        return res.data;
    }
);

export const toggleRoleActivation = createAsyncThunk(
    "admin/role/changeRoleActivation",
    async (roleId: string) => {
        const res = await axios.patch(`admin/role/changeRoleActivation?roleId=${roleId}`);
        return res.data;
    }
);

export const fetchAssignableRoles = createAsyncThunk(
    "admin/role/listAssignableRoles",
    async () => {
        const res = await axios.get("admin/role/listAssignableRoles");
        return res.data;
    }
);

const roleSlice = createSlice({
    name: "role",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Roles
            .addCase(fetchRoles.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.status) {
                    state.role = action.payload.data;
                    state.total = action.payload.total;
                }
            })
            .addCase(fetchRoles.rejected, (state) => {
                state.isLoading = false;
            })

            // Create Role
            .addCase(createRole.fulfilled, (state, action) => {
                if (action.payload.status) {
                    setToast("success", action.payload.message);
                } else {
                    setToast("error", action.payload.message);
                }
            })

            // Edit Role
            .addCase(editRole.fulfilled, (state, action) => {
                if (action.payload.status) {
                    setToast("success", action.payload.message);
                } else {
                    setToast("error", action.payload.message);
                }
            })

            // Delete Role
            .addCase(deleteRole.fulfilled, (state, action) => {
                if (action.payload.status) {
                    state.role = state.role.filter((r) => r._id !== action.meta.arg);
                    state.total -= 1;
                    setToast("success", action.payload.message);
                } else {
                    setToast("error", action.payload.message);
                }
            })

            // Toggle Activation
            .addCase(toggleRoleActivation.fulfilled, (state, action) => {
                if (action.payload.status) {
                    const role = state.role.find((r) => r._id === action.meta.arg);
                    if (role) role.isActive = !role.isActive;
                    setToast("success", action.payload.message);
                } else {
                    setToast("error", action.payload.message);
                }
            })

            // Fetch Assignable Roles
            .addCase(fetchAssignableRoles.fulfilled, (state, action) => {
                if (action.payload.status) {
                    state.assignableRoles = action.payload.data;
                }
            });
    },
});

export default roleSlice.reducer;
