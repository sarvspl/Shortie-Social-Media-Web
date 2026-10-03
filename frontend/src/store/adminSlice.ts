"use client";

import { toast } from "react-toastify";
import { apiInstance, apiInstanceFetch } from "@/util/ApiInstance";
import { jwtDecode } from "jwt-decode";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setToast } from "@/util/toast";
import { SetDevKey } from "@/util/setAuthAxios";
import { secretKey } from "@/util/config";
import axios from "axios";
import { generatePermissionHash } from "@/util/security";

interface UserState {
  isAuth: boolean;
  admin: any;
  loginType: string;
  permissions: any[];
  isLoading: boolean;
  imageUrl: any;
}
// const loginType =
//   typeof window !== "undefined" && sessionStorage.getItem("loginType");
// console.log(loginType, "loginType");
// const data =
//   typeof window !== "undefined" && JSON.parse(sessionStorage.getItem("admin_") || "{}");
// console.log(data, "data");

const initialState: UserState = {
  isAuth: false,
  admin: {},
  loginType: "",
  permissions: [],
  isLoading: false,
  imageUrl: "",
};

interface AllUsersPayload {
  adminId?: string;
  start?: number;
  limit?: number;
  startDate?: string;
  data?: any;
  endDate?: string;
  type?: string;
  email?: string;
  silent?: boolean; // ✅ ADD THIS
}

export const signUpAdmin = createAsyncThunk(
  "admin/admin/signUp",
  async (payload: AllUsersPayload | undefined, { rejectWithValue }) => {
    try {
      const res = await axios.post("admin/admin/signUp", payload);
      return res.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const login = createAsyncThunk(
  "admin/admin/login",
  async (payload: AllUsersPayload | undefined, { rejectWithValue }) => {
    try {
      const res: any = await apiInstanceFetch.post("admin/admin/login", payload);
      
      if (res && (res.status === true || res.token || res.data)) {
        const token = res.token || res.data || (typeof res === 'string' ? res : null);
        if (token) {
          try {
            const decodedToken: any = jwtDecode(token);
            const isSubAdmin = res.role === "subAdmin" || res.subAdmin;
            const permissions = isSubAdmin ? (res.subAdmin?.permissions || decodedToken?.permissions || []) : [];
            const loginType = isSubAdmin ? "staff" : "admin";
            
            // Generate secure hash of permissions and loginType
            const permissionsHash = await generatePermissionHash(permissions, loginType);
            return { ...res, token, permissionsHash };
          } catch (e) {
            console.error("Token decoding or hashing failed in login thunk:", e);
          }
        }
      }
      return res;
    } catch (err: any) {
      // If network error (backend completely offline), fallback to standalone mock
      if (
        err?.name === "TypeError" ||
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("NetworkError") ||
        err?.code === "ECONNREFUSED"
      ) {
        console.warn("Backend offline during login, using Standalone Mode fallback:", err);
        const { getStandaloneMockResponse, createStandaloneToken } = await import("@/util/standaloneMock");
        const mockRes = getStandaloneMockResponse("POST", "admin/admin/login", payload);
        const token = createStandaloneToken(payload?.email || "admin@gmail.com");
        const permissionsHash = await generatePermissionHash([], "admin");
        return { ...mockRes, token, permissionsHash };
      }
      return rejectWithValue(err);
    }
  },
);

export const adminProfileGet = createAsyncThunk(
  "admin/admin/profile",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(`admin/admin/profile`);
  },
);

export const adminProfileUpdate = createAsyncThunk(
  "admin/admin/updateProfile",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.patch(`admin/admin/updateProfile`, payload);
  },
);

// rohit change
// export const adminProfileUpdated = createAsyncThunk(
//   "admin/admin/updateProfile1",
//   async (payload: AllUsersPayload | undefined) => {
//     return axios.patch(`admin/admin/updateProfile`, payload?.data);
//   },
// );

export const adminProfileUpdated = createAsyncThunk(
  "admin/admin/updateProfile1",
  async (payload: AllUsersPayload | undefined, { rejectWithValue }) => {
    console.log(payload, "payload");
    try {
      const res = await axios.patch(`admin/admin/updateProfile`, payload?.data);
      return res.data; // { status, data }
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  },
);

// rohit change
// export const uploadFile = createAsyncThunk(
//   "admin/file/upload-file",
//   async (payload: AllUsersPayload | undefined) => {
//     return axios.post(`admin/file/upload-file`, payload?.data);
//   }
// );

export const uploadFile = createAsyncThunk(
  "admin/file/upload-file",
  async (payload: AllUsersPayload | undefined) => {
    const res = await axios.post(`admin/file/upload-file`, payload?.data);
    return res; // ✅ ONLY DATA
  },
);

export const updateAdminPassword = createAsyncThunk(
  "admin/admin/updatePassword",
  async (payload: AllUsersPayload | undefined) => {
    return axios.patch(`admin/admin/updatePassword`, payload?.data);
  },
);

// export const resetAdminPassword = createAsyncThunk(
//   "admin/admin/setPassword",
//   async (payload: AllUsersPayload | undefined) => {
//     return axios.patch(`admin/admin/setPassword`, payload?.data);
//   }
// );

export const resetAdminPassword = createAsyncThunk<
  { status: boolean; message: string },
  AllUsersPayload | undefined
>("admin/admin/setPassword", async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.patch(`admin/admin/setPassword`, payload?.data);
    return res.data; // ✅ IMPORTANT
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Something went wrong",
    );
  }
});

export const sendEmail: any = createAsyncThunk(
  "admin/admin/forgotPassword",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstance.post(
      `admin/admin/forgotPassword?email=${payload?.email}`,
    );
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    logoutApi(state: any) {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.removeItem("flag");
        localStorage.removeItem("flagHash");
      }
      state.admin = {};
      state.isAuth = false;
      state.loginType = "";
      state.permissions = [];
    },

    setHydrate(state: any, action: PayloadAction<any>) {
      if (action.payload) {
        state.isAuth = action.payload.isAuth;
        const adminObj = { ...action.payload.admin };
        delete adminObj.flag;
        Object.defineProperty(adminObj, "flag", {
          get: () => {
            if (typeof window !== "undefined") {
              return localStorage.getItem("flag") === "true";
            }
            return false;
          },
          enumerable: false,
          configurable: true,
        });
        state.admin = adminObj;
        state.loginType = action.payload.loginType || "";
        state.permissions = action.payload.permissions || [];
      }
    },
  },
  extraReducers: (builder: any) => {
    builder.addCase(
      signUpAdmin.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      },
    );

   builder.addCase(
      signUpAdmin.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload && action.payload?.status === true) {
          setToast("success", "Admin sign up Successfully");
          // setTimeout(() => {
          //   window.location.href = "/";
          // }, 2000);
        } else {
          setToast("error", action?.payload?.message);
        }
      },
    );
    builder.addCase(
      signUpAdmin.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      },
    );

    builder.addCase(login.pending, (state: any, action: PayloadAction<any>) => {
      state.isLoading = true;
    });
    builder.addCase(
      login.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload && (action.payload?.status !== false || action.payload?.token)) {
          // Robust token extraction
          const token = action.payload?.token || action.payload?.data || (typeof action.payload === 'string' ? action.payload : null);

          if (!token) {
            setToast("error", "Invalid login response: Token not found");
            return;
          }

          try {
            const decodedToken: any = jwtDecode(token);
            state.isAuth = true;

            if (action.payload?.role === "subAdmin" || action.payload?.subAdmin) {
              const subAdminData = action.payload.subAdmin || decodedToken;
              
              if (typeof window !== "undefined") {
                const flagVal = String(Boolean(subAdminData.flag));
                localStorage.setItem("flag", flagVal);
                generatePermissionHash([flagVal], "flag").then((h) => {
                  localStorage.setItem("flagHash", h);
                });
              }

              const adminObj = {
                ...subAdminData,
                name: subAdminData.name,
                email: subAdminData.email,
              };
              delete adminObj.flag;
              Object.defineProperty(adminObj, "flag", {
                get: () => {
                  if (typeof window !== "undefined") {
                    return localStorage.getItem("flag") === "true";
                  }
                  return false;
                },
                enumerable: false,
                configurable: true,
              });
              state.admin = adminObj;
              state.loginType = "staff";
              state.permissions = subAdminData?.permissions || [];

              axios.defaults.headers.common["Authorization"] = token;
              SetDevKey(secretKey);

              if (typeof window !== "undefined") {
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("isAuth", "true");
                const storageAdmin = { ...subAdminData };
                delete storageAdmin.flag;
                sessionStorage.setItem("admin_", JSON.stringify(storageAdmin));
                sessionStorage.setItem("loginType", "staff");
                sessionStorage.setItem("permissions", JSON.stringify(state.permissions));
                sessionStorage.setItem("permissionsHash", action.payload?.permissionsHash || "");

                setToast("success", "Staff Login Successfully");
                // setTimeout(() => {
                //   window.location.href = "/dashboard";
                // }, 500);
              }
            } else {
              const decodedData = decodedToken;
              if (typeof window !== "undefined") {
                const flagVal = String(Boolean(decodedData.flag));
                localStorage.setItem("flag", flagVal);
                generatePermissionHash([flagVal], "flag").then((h) => {
                  localStorage.setItem("flagHash", h);
                });
              }

              const adminObj = { ...decodedData };
              delete adminObj.flag;
              Object.defineProperty(adminObj, "flag", {
                get: () => {
                  if (typeof window !== "undefined") {
                    return localStorage.getItem("flag") === "true";
                  }
                  return false;
                },
                enumerable: false,
                configurable: true,
              });
              state.admin = adminObj;
              state.loginType = "admin";
              state.permissions = [];

              axios.defaults.headers.common["Authorization"] = token;
              SetDevKey(secretKey);

              if (typeof window !== "undefined") {
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("isAuth", "true");
                const storageAdmin = { ...decodedToken };
                delete storageAdmin.flag;
                sessionStorage.setItem("admin_", JSON.stringify(storageAdmin));
                sessionStorage.setItem("loginType", "admin");
                sessionStorage.setItem("permissions", JSON.stringify([]));
                sessionStorage.setItem("permissionsHash", action.payload?.permissionsHash || "");

                setToast("success", "Login Successfully");
                // setTimeout(() => {
                //   window.location.href = "/dashboard";
                // }, 500);
              }
            }
          } catch (e) {
            console.error("Token decoding failed:", e);
            setToast("error", "Invalid Token received");
          }
        } else {
          setToast("error", action.payload?.message || "Login failed");
        }
      },
    );

    
    builder.addCase(
      login.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      },
    );

    builder.addCase(
      adminProfileGet.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      },
    );
    builder.addCase(
      adminProfileGet.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        const data =
          typeof window !== "undefined" &&
          JSON.parse(sessionStorage.getItem("admin_") || "{}");

        const loginType =
          typeof window !== "undefined" && sessionStorage.getItem("loginType");

        console.log(data, "data");

        const { email, name, flag } = data || {};

        if (typeof window !== "undefined" && flag !== undefined) {
          const flagVal = String(Boolean(flag));
          localStorage.setItem("flag", flagVal);
          generatePermissionHash([flagVal], "flag").then((h) => {
            localStorage.setItem("flagHash", h);
          });
        }

        state.isLoading = false;

        if (loginType === "staff") {
          const adminObj = {
            ...state.admin,
            name,
            email,
          };
          delete adminObj.flag;
          Object.defineProperty(adminObj, "flag", {
            get: () => {
              if (typeof window !== "undefined") {
                return localStorage.getItem("flag") === "true";
              }
              return false;
            },
            enumerable: false,
            configurable: true,
          });
          state.admin = adminObj;
        } else {
          const adminObj = { ...action.payload.data };
          delete adminObj.flag;
          Object.defineProperty(adminObj, "flag", {
            get: () => {
              if (typeof window !== "undefined") {
                return localStorage.getItem("flag") === "true";
              }
              return false;
            },
            enumerable: false,
            configurable: true,
          });
          state.admin = adminObj;
        }
      }
    );
    builder.addCase(
      adminProfileGet.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      },
    );

    builder.addCase(
      uploadFile.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      },
    );
    builder.addCase(uploadFile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.imageUrl = action.payload?.url;
    });

    builder.addCase(
      uploadFile.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      },
    );

    builder.addCase(
      sendEmail.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      },
    );
    builder.addCase(
      sendEmail.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload?.status) {
          setToast("success", action?.payload?.message);
        } else {
          setToast("error", action?.payload?.message);
        }
      },
    );
    builder.addCase(
      sendEmail.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      },
    );

    builder.addCase(
      adminProfileUpdate.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      },
    );
    builder.addCase(
      adminProfileUpdate.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload?.status === true) {
          state.admin = action.payload?.data;
          setToast("success", "Admin profile  update successfully");
        } else {
          setToast("error", action.payload.message);
        }
      },
    );
    builder.addCase(
      adminProfileUpdate.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      },
    );

    builder.addCase(
      adminProfileUpdated.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      },
    );

    builder.addCase(adminProfileUpdated.fulfilled, (state, action) => {
      state.isLoading = false;

      if (action.payload?.status === true) {
        // ✅ MERGE admin
        state.admin = {
          ...state.admin,
          ...action.payload.data,
        };

        // ✅ sessionStorage sync
        const storageAdmin = { ...state.admin };
        delete storageAdmin.flag;
        sessionStorage.setItem("admin_", JSON.stringify(storageAdmin));

        // ✅ meta access SAFE
        if (!action.meta.arg?.silent) {
          setToast("success", "Admin profile updated successfully");
        }
      } else {
        setToast("error", action.payload?.message);
      }
    });

    builder.addCase(
      adminProfileUpdated.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      },
    );

    builder.addCase(
      updateAdminPassword.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      },
    );
    builder.addCase(
      updateAdminPassword.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload.data?.status === true) {
          state.admin = action.payload.data?.data;
          setToast("success", "Admin password update successfully");
          window.location.href = "/";
        } else {
          setToast("error", action.payload.data.message);
        }
      },
    );
    builder.addCase(
      updateAdminPassword.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      },
    );
  },
});

export default adminSlice.reducer;
export const { logoutApi, setHydrate } = adminSlice.actions;
