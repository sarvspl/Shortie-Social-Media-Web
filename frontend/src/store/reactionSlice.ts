import { apiInstanceFetch } from './../util/ApiInstance';
import { setToast } from "@/util/toastServices";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface UserState {
  reaction: any[];
  isLoading: boolean;
  isSkeleton: boolean;
}

const initialState: UserState = {
  reaction: [],
  isLoading: false,
  isSkeleton: false,
};

interface AllUsersPayload {
  start?: number;
  limit?: number;
  search: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  meta?: any;
  id?: any;
  data: any;
  reactionId: any;
  payload: any;
  formData: any;
}

export const getReaction: any = createAsyncThunk(
  "admin/reaction/fetchReaction",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(`admin/reaction/fetchReaction`);
  }
);

export const createReaction = createAsyncThunk(
  "admin/reaction/addReaction",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.post("admin/reaction/addReaction", payload);
  }
);

export const deleteReaction = createAsyncThunk(
  "admin/reaction/removeReaction",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.delete(`admin/reaction/removeReaction?reactionId=${payload}`);
  }
);

export const activeReaction = createAsyncThunk(
  "admin/reaction/hasActiveReaction",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.patch(`admin/reaction/hasActiveReaction?reactionId=${payload}`);
  }
);

export const updateReaction: any = createAsyncThunk(
  "admin/reaction/modifyReaction",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.patch(
      `admin/reaction/modifyReaction`,
      payload
    );
  }
);

const reactionSlice = createSlice({
  name: "reaction",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getReaction.pending, (state, action: PayloadAction<any>) => {
      state.isSkeleton = true;
      state.isLoading = true;
    });
    builder.addCase(
      getReaction.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isSkeleton = false;
        state.reaction = Array.isArray(action.payload?.data)
          ? action.payload.data
          : Array.isArray(action.payload)
          ? action.payload
          : [];
      }
    );
    builder.addCase(getReaction.rejected, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.isSkeleton = false;
    });

    builder.addCase(
      createReaction.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      createReaction.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload?.status) {
          const newReaction = action.payload?.data;
          if (newReaction && newReaction._id) {
            state.reaction.unshift(newReaction);
          }
          setToast("success", "Reaction Added Successfully");
        }
      }
    );
    builder.addCase(createReaction.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(
      deleteReaction.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(deleteReaction.fulfilled, (state, action: any) => {
      if (action?.payload?.status) {
        state.reaction = state.reaction.filter(
          (banner) => banner?._id !== action?.meta?.arg
        );
        setToast("success", "Reaction Deleted Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(deleteReaction.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(
      activeReaction.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      activeReaction.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action?.payload?.status) {
          const updatedBanner = action.payload.data;
          const bannerIndex = state.reaction.findIndex(
            (banner) => banner?._id === updatedBanner?._id
          );
          if (bannerIndex !== -1) {
            state.reaction[bannerIndex].isActive = updatedBanner.isActive;
          }
          setToast("success", "Reaction Status Updated Successfully");
        }
        state.isLoading = false;
      }
    );

    builder.addCase(activeReaction.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(updateReaction.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(updateReaction.fulfilled, (state, action: any) => {
      state.isLoading = false;
      if (action.payload?.status === true) {
        const updatedReaction = action.payload?.data;
        const bannerIndex = state.reaction.findIndex(
          (banner) => banner?._id === updatedReaction?._id
        );
        if (bannerIndex !== -1) {
          state.reaction[bannerIndex] = {
            ...state.reaction[bannerIndex],
            ...updatedReaction,
          };
        }
        setToast("success", `Reaction Updated Successfully`);
      }
    });

    builder.addCase(updateReaction.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export default reactionSlice.reducer;
