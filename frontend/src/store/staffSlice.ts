import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { setToast } from "@/util/toast";

interface StaffState {
    staff: any[];
    total: number;
    isLoading: boolean;
}

const initialState: StaffState = {
    staff: [],
    total: 0,
    isLoading: false,
};

export const fetchStaffList = createAsyncThunk(
    "admin/subAdmin/fetchSubAdminDirectory",
    async (params: { start: number; limit: number; search?: string }) => {
        const res = await axios.get(`admin/subAdmin/fetchSubAdminDirectory?start=${params.start}&limit=${params.limit}${params.search ? `&search=${params.search}` : ""}`);
        return res.data;
    }
);

export const createStaff = createAsyncThunk(
    "admin/subAdmin/registerSubAdminAccount",
    async (payload: any) => {
        const res = await axios.post("admin/subAdmin/registerSubAdminAccount", payload);
        return res.data;
    }
);

export const editStaff = createAsyncThunk(
    "admin/subAdmin/modifySubAdminProfile",
    async (payload: any) => {
        const res = await axios.patch("admin/subAdmin/modifySubAdminProfile", payload);
        return res.data;
    }
);

export const deleteStaff = createAsyncThunk(
    "admin/subAdmin/revokeSubAdminAccount",
    async (subAdminId: string) => {
        const res = await axios.delete(`admin/subAdmin/revokeSubAdminAccount?subAdminId=${subAdminId}`);
        return res.data;
    }
);

export const toggleStaffActivation = createAsyncThunk(
    "admin/subAdmin/switchSubAdminAccess",
    async (subAdminId: string) => {
        const res = await axios.patch(`admin/subAdmin/switchSubAdminAccess?subAdminId=${subAdminId}`);
        console.log("res.data", res.data);
        return res.data;
    }
);

const staffSlice = createSlice({
    name: "staff",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Staff
            .addCase(fetchStaffList.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchStaffList.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.status) {
                    state.staff = action.payload.data;
                    state.total = action.payload.total;
                }
            })
            .addCase(fetchStaffList.rejected, (state) => {
                state.isLoading = false;
            })

            // Create Staff
            .addCase(createStaff.fulfilled, (state, action) => {
                if (action.payload.status) {
                    setToast("success", action.payload.message);
                } else {
                    setToast("error", action.payload.message);
                }
            })

            // Edit Staff
            .addCase(editStaff.fulfilled, (state, action) => {
                if (action.payload.status) {
                    setToast("success", action.payload.message);
                } else {
                    setToast("error", action.payload.message);
                }
            })

            // Delete Staff
            .addCase(deleteStaff.fulfilled, (state, action) => {
                if (action.payload.status) {
                    state.staff = state.staff.filter((s) => s._id !== action.meta.arg);
                    state.total -= 1;
                    setToast("success", action.payload.message);
                } else {
                    setToast("error", action.payload.message);
                }
            })

            // Toggle Activation
            .addCase(toggleStaffActivation.fulfilled, (state, action) => {
                if (action.payload.status) {
                    const updatedStaff = action.payload.data;

                    state.staff = state.staff.map((s) =>
                        s._id === updatedStaff._id
                            ? { ...s, isActive: updatedStaff.isActive }
                            : s
                    );

                    setToast("success", action.payload.message);
                } else {
                    setToast("error", action.payload.message);
                }
            });
    },
});

export default staffSlice.reducer;
