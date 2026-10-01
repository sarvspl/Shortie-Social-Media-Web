import { apiInstanceFetch } from "@/util/ApiInstance";
import { setToast } from "@/util/toastServices";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface UserState {
  adminEarnings: any[];
  isLoading: boolean;
  isSkeleton: boolean;
  totalEarning: number;
  coinPlanHistory: any[];
  totalHistory: number;
  totalOrder: number;
}

const initialState: UserState = {
  adminEarnings: [],
  isLoading: false,
  isSkeleton: false,
  totalEarning: 0,
  coinPlanHistory: [],
  totalHistory: 0,
  totalOrder: 0,
};

interface AllUsersPayload {
  page?: number;
  size?: number;
  search: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  meta?: any;
  id?: any;
  data: any;
  bannerId: any;
  payload: any;
  formData: any;
  paymentGateway?: string;
}

export const getAdminEarning: any = createAsyncThunk("admin/coinPlan/fetchUserCoinplanTransactions", async (payload: AllUsersPayload | undefined) => {
  return apiInstanceFetch.get(
    `admin/coinPlan/fetchUserCoinplanTransactions?startDate=${payload?.startDate}&endDate=${payload?.endDate}&start=${payload?.page}&limit=${payload?.size}&search=${payload?.search}&paymentGateway=${payload?.paymentGateway}`
  );
});

export const getUserCoinPlanHistory = createAsyncThunk(
  "admin/coinPlan/fetchUserCoinPlanHistory",
  async (params: { userId: string; page?: number; limit?: number; startDate?: string; endDate?: string; search?: string }) => {
    const res = await apiInstanceFetch.get(
      `admin/coinPlan/${params.userId}?page=${params.page}&limit=${params.limit}&startDate=${params.startDate}&endDate=${params.endDate}&search=${params.search}`
    );

    return res;
  }
);

const adminEaningSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ADMIN EARNINGS
      .addCase(getAdminEarning.pending, (state) => {
        state.isLoading = true;
        state.isSkeleton = true;
      })
      .addCase(getAdminEarning.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSkeleton = false;
        state.adminEarnings = action.payload.data;
        state.totalEarning = action.payload.totalAdminEarnings;
        state.totalOrder = action.payload.total;
      })
      .addCase(getAdminEarning.rejected, (state) => {
        state.isLoading = false;
        state.isSkeleton = false;
      })

      // USER COIN PLAN HISTORY
      .addCase(getUserCoinPlanHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserCoinPlanHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coinPlanHistory = action.payload.data;
        state.totalHistory = action.payload.total;
      })
      .addCase(getUserCoinPlanHistory.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default adminEaningSlice.reducer;
