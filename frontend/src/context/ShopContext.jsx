import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    // const backendUrl = ;
    const currency = "₹";
    const delivery_fee = 50;
    const FREE_SHIPPING_THRESHOLD = 499;

    // ---------------- STATES ----------------y
    const [products, setProducts] = useState([]);

    // FIX 1: Load Cart from LocalStorage so data isn't lost on refresh
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem("cartItems");
            return savedCart ? JSON.parse(savedCart) : {};
        } catch (error) {
            console.error("Failed to load cart from local storage", error);
            return {};
        }
    });

    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [user, setUser] = useState(
        localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user"))
            : null
    );
    const [role, setRole] = useState(localStorage.getItem("role") || "user");
    const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [subCategories, setSubCategories] = useState([]);

    // ---------------- PRODUCTS & SUBCATEGORIES ----------------
    const getProductsData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsRes, subCatRes] = await Promise.all([
                axios.get(`${backendUrl}/api/products/all`),
                axios.get(`${backendUrl}/api/subcategories/all`)
            ]);

            if (productsRes.data?.products) {
                setProducts(productsRes.data.products);
            }
            if (subCatRes.data?.success) {
                setSubCategories(subCatRes.data.subCategories);
            }
        } catch (err) {
            console.error("Failed to load initial data", err);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getProductsData();
    }, [getProductsData]);

    // FIX 2: Save Cart to LocalStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    // ---------------- HELPER: GLOBAL IMAGE RESOLVER (Fixes Image Issues) ----------------
    const resolveImage = (product) => {
        if (!product) return "";

        // 1. Check for 'images' array (Cloudinary/Multer multiple)
        if (Array.isArray(product.images) && product.images.length > 0) {
            const first = product.images[0];
            return typeof first === 'object' ? first.url : first;
        }

        // 2. Check for 'image' string/array (Legacy)
        if (product.image) {
            return Array.isArray(product.image) ? product.image[0] : product.image;
        }

        return ""; // Or a placeholder URL
    };

    // ---------------- CART ----------------
    const addToCart = (productId) => {
        setCartItems((prev) => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1,
        }));
    };

    const removeFromCart = (productId) => {
        setCartItems((prev) => {
            const copy = { ...prev };
            delete copy[productId];
            return copy;
        });
    };

    const getCartCount = () =>
        Object.values(cartItems).reduce((a, b) => a + b, 0);

    const getProductPrice = (product) => product?.price || 0;

    const getProductCurrentPrice = (product) => {
        if (!product) return 0;

        if (product.onSale && product.salePrice) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const startDate = new Date(product.saleStartDate);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(product.saleEndDate);
            endDate.setHours(23, 59, 59, 999);

            if (today >= startDate && today <= endDate) {
                return product.salePrice;
            }
        }

        return product.price || 0;
    };

    const getCartAmount = () => {
        let total = 0;
        for (let id in cartItems) {
            const product = products.find((p) => p._id === id);
            if (product) {
                total += getProductCurrentPrice(product) * cartItems[id];
            }
        }
        return total;
    };

    const getShippingFee = () => {
        const cartTotal = getCartAmount();
        return cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : delivery_fee;
    };

    const updateCartItemQuantity = (productId, quantity) => {
        setCartItems((prev) => {
            const updated = { ...prev };
            if (quantity <= 0) {
                delete updated[productId];
            } else {
                updated[productId] = quantity;
            }
            return updated;
        });
    };

    // ---------------- NEW: PREPARE DATA FOR BACKEND ----------------
    // This creates the exact payload your backend 'createOrder' expects
    // ensuring images are strings (URLs) and not objects/undefined.
    const getCartPayload = () => {
        const payload = [];
        for (const id in cartItems) {
            const product = products.find(p => p._id === id);
            if (product && cartItems[id] > 0) {
                payload.push({
                    productId: id,
                    name: product.name,
                    price: getProductCurrentPrice(product),
                    quantity: cartItems[id],
                    image: resolveImage(product), // <--- THIS FIXES THE IMAGE ISSUE
                    images: product.images || [],
                    sku: product.sku || '',
                    category: product.category || '',
                    size: product.size || '',
                    color: product.color || '',
                    material: product.material || '',
                    weight: product.weight || ''
                });
            }
        }
        return payload;
    };

    // ---------------- AUTH ----------------
    const login = (newToken, userRole, userData) => {
        setToken(newToken);
        setUser(userData);
        setRole(userRole || userData?.role || "user");
        setUserId(userData?._id);

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("role", userRole || userData?.role || "user");
        localStorage.setItem("userId", userData?._id);
    };

    const logout = () => {
        setToken("");
        setUser(null);
        setRole("");
        setUserId("");
        setCartItems({});
        localStorage.clear();
        window.location.href = "/login";
    };

    const loginUser = async (email, password) => {
        try {
            const res = await axios.post(`${backendUrl}/api/users/login`, {
                email,
                password,
            });
            if (res.data.success) {
                login(res.data.token, res.data.user?.role || "user", res.data.user);
                return { success: true };
            }
            return { success: false, message: res.data.message };
        } catch {
            return { success: false, message: "Login failed" };
        }
    };

    // ---------------- CONTEXT VALUE ----------------
    const value = {
        products,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        getCartCount,
        getCartAmount,
        getProductPrice,
        getProductCurrentPrice,
        getShippingFee,
        resolveImage,  // <--- Exposing this globally
        getCartPayload, // <--- Exposing this for PlaceOrder page
        currency,
        delivery_fee,
        FREE_SHIPPING_THRESHOLD,
        token,
        setToken,
        user,
        role,
        setRole,
        userId,
        setUserId,
        setCartItems,
        login,
        loginUser,
        logout,
        loading,
        backendUrl,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        subCategories, // Add this
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
