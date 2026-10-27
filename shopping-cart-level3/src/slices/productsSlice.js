import {
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";

// Lấy sản phẩm từ API.
export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async(_, { rejectWithValue }) => {
        try {
            const response = await fetch(
                "http://localhost:3002/products"
            );

            if (!response.ok) {
                throw new Error(`Lỗi API: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }, {
        // Ngăn request trùng khi đang tải.
        condition: (_, { getState }) =>
            getState().products.status !== "loading",
    }
);

const productsSlice = createSlice({
    name: "products",

    initialState: {
        items: [],
        status: "idle",
        error: null,
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = "failed";
                state.error =
                    action.payload ||
                    action.error.message ||
                    "Không thể tải sản phẩm.";
            });
    },
});

export default productsSlice.reducer;