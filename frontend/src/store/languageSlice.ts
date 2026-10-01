import { apiInstanceFetch, apiInstance } from "@/util/ApiInstance";
import { baseURL } from "@/util/config";
import { setToast } from "@/util/toastServices";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface LanguageState {
    languages: any[];
    translations: any;
    isLoading: boolean;
    totalLanguages: number;
}

const initialState: LanguageState = {
    languages: [],
    translations: null,
    isLoading: false,
    totalLanguages: 0,
};

export const getAllLanguages = createAsyncThunk(
    "admin/language/getAll",
    async (payload: { start: number; limit: number } | undefined) => {
        return apiInstanceFetch.get(`admin/langauge/getAllLanguages?start=${payload?.start || 1}&limit=${payload?.limit || 10}`);
    }
);

export const createLanguage = createAsyncThunk(
    "admin/language/create",
    async (payload: any) => {
        return apiInstanceFetch.post("admin/langauge/createLanguage", payload);
    }
);

export const updateLanguage = createAsyncThunk(
    "admin/language/update",
    async (payload: { id: string; data: any }) => {
        return axios.patch(`${baseURL}admin/langauge/updateLanguage?languageId=${payload.id}`, payload.data);
    }
);

export const toggleLanguage = createAsyncThunk(
    "admin/language/toggle",
    async (payload: { languageCode: string; toggleType: number }) => {
        return axios.patch(`${baseURL}admin/langauge/toggleSwitch?languageCode=${payload.languageCode}&toggleType=${payload.toggleType}`);
    }
);

export const deleteLanguage = createAsyncThunk(
    "admin/language/delete",
    async (languageCode: string) => {
        return apiInstanceFetch.delete(`admin/langauge/deleteLanguage?languageCode=${languageCode}`, {});
    }
);

export const uploadTranslations = createAsyncThunk(
    "admin/translation/upload",
    async (formData: FormData) => {
        return axios.post(`${baseURL}admin/translation/uploadTranslations`, formData);
    }
);

export const getLanguageTranslations = createAsyncThunk(
    "admin/translation/get",
    async (payload: { languageCode: string; module?: string; search?: string }) => {
        const { languageCode, module, search } = payload;
        let url = `admin/translation/getLanguageTranslations?languageCode=${languageCode}`;
        if (module) url += `&module=${module}`;
        if (search) url += `&search=${search}`;
        return apiInstanceFetch.get(url);
    }
);

export const updateLanguageTranslations = createAsyncThunk(
    "admin/translation/update",
    async (payload: { languageCode: string; translations: any; module: string }) => {
        return axios.patch(`${baseURL}admin/translation/updateLanguageTranslations`, payload);
    }
);

export const downloadTranslationsCSV = createAsyncThunk(
    "admin/translation/download",
    async () => {
        return axios.get(`${baseURL}admin/translation/downloadTranslationsCSV`, {
            responseType: "blob",
        });
    }
);

export const getLanguage = createAsyncThunk(
    "admin/language/get",
    async (languageCode: string) => {
        return apiInstanceFetch.get(`admin/langauge/getLanguage?languageCode=${languageCode}`);
    }
);

const languageSlice = createSlice({
    name: "language",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAllLanguages.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getAllLanguages.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            state.languages = action.payload.data;
            state.totalLanguages = action.payload.total;
        });
        builder.addCase(getAllLanguages.rejected, (state) => {
            state.isLoading = false;
        });

        builder.addCase(getLanguage.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getLanguage.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                state.languages = [action.payload.data];
                state.totalLanguages = 1;
            } else {
                state.languages = [];
                state.totalLanguages = 0;
            }
        });
        builder.addCase(getLanguage.rejected, (state) => {
            state.isLoading = false;
        });

        builder.addCase(createLanguage.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(createLanguage.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                state.languages.unshift(action.payload.data);
                setToast("success", "Language created successfully");
            } else {
                setToast("error", action.payload.message || "Failed to create language");
            }
        });
        builder.addCase(createLanguage.rejected, (state) => {
            state.isLoading = false;
        });

        builder.addCase(updateLanguage.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateLanguage.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.data.status) {
                const index = state.languages.findIndex((lang) => lang._id === action.payload.data.data._id);
                if (index !== -1) {
                    state.languages[index] = action.payload.data.data;
                }
                setToast("success", "Language updated successfully");
            } else {
                setToast("error", action.payload.data.message || "Failed to update language");
            }
        });
        builder.addCase(updateLanguage.rejected, (state) => {
            state.isLoading = false;
        });

        builder.addCase(toggleLanguage.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(toggleLanguage.fulfilled, (state, action: any) => {

            const response = action?.payload?.data;
            const { languageCode, toggleType } = action.meta.arg as any;

            if (response?.status) {
                const updatedLanguage = response;

                const languageIndex = state.languages.findIndex(
                    (lang) => lang.languageCode === languageCode
                );

                if (languageIndex !== -1) {
                    if (toggleType === 1) {
                        state.languages[languageIndex].isActive =
                            updatedLanguage.isActive;
                    } else if (toggleType === 2) {
                        state.languages.forEach((lang) => {
                            lang.isDefault = false;
                        });
                        state.languages[languageIndex].isDefault = true;
                    }
                }

                setToast("success", response?.message);
            } else {
                setToast("error", response?.message || "Something went wrong");
            }

            state.isLoading = false;
        });
        builder.addCase(toggleLanguage.rejected, (state) => {
            state.isLoading = false;
        });

        builder.addCase(deleteLanguage.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(deleteLanguage.fulfilled, (state, action: any) => {
            state.isLoading = false;
            if (action.payload?.status) {
                state.languages = state.languages.filter((lang) => lang.languageCode !== action.meta.arg);
                setToast("success", "Language deleted successfully");
            } else {
                setToast("error", action.payload?.message || "Failed to delete language");
            }
        });
        builder.addCase(deleteLanguage.rejected, (state) => {
            state.isLoading = false;
        });

        builder.addCase(uploadTranslations.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(uploadTranslations.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.data) {
                setToast(action.payload.data.status ? "success" : "error", action?.payload?.data?.message);
            }
        });
        builder.addCase(uploadTranslations.rejected, (state) => {
            state.isLoading = false;
        });

        builder.addCase(getLanguageTranslations.pending, (state) => {
            state.isLoading = true;
            state.translations = null;
        });
        builder.addCase(getLanguageTranslations.fulfilled, (state, action: any) => {
            state.isLoading = false;
            if (action.payload.status) {
                state.translations = action.payload.doc;
            } else {
                state.translations = null;
            }
        });
        builder.addCase(getLanguageTranslations.rejected, (state) => {
            state.isLoading = false;
        });

        builder.addCase(updateLanguageTranslations.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateLanguageTranslations.fulfilled, (state, action: any) => {
            state.isLoading = false;
            if (action.payload.status) {
                const { translations, module } = action.meta.arg;
                if (Array.isArray(state.translations)) {
                    const moduleIndex = state.translations.findIndex((item: any) => item.module === module);
                    if (moduleIndex !== -1) {
                        state.translations[moduleIndex].translations = {
                            ...state.translations[moduleIndex].translations,
                            ...translations
                        };
                    }
                } else if (state.translations && state.translations.module === module) {
                    state.translations.translations = {
                        ...state.translations.translations,
                        ...translations
                    };
                }
                setToast("success", action.payload.message || "Translation updated successfully");
            } else {
                setToast("error", action.payload.message || "Failed to update translation");
            }
        });
        builder.addCase(updateLanguageTranslations.rejected, (state) => {
            state.isLoading = false;
        });
    },
});

export default languageSlice.reducer;
