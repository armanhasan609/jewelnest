import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const currency = "₹";
    const delivery_fee = 50;
    const FREE_SHIPPING_THRESHOLD = 499;

    // ---------------- STATES ----------------
    const [products, setProducts] = useState([]);

    // Cart now stores objects with variant info: { quantity, selectedColor, selectedSize, variantImage, variantSku }
    // Key format: productId OR productId_color_size for variant items
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

    // Save Cart to LocalStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    // ---------------- HELPER: GLOBAL IMAGE RESOLVER ----------------
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

    // ---------------- CART KEY GENERATOR ----------------
    // For variant products: productId_color_size
    // For non-variant products: productId
    const getCartKey = (productId, selectedColor, selectedSize) => {
        if (selectedColor && selectedSize) {
            return `${productId}_${selectedColor}_${selectedSize}`;
        }
        return productId;
    };

    // ---------------- CART ----------------
    const addToCart = (productId, variantInfo = null) => {
        // variantInfo: { selectedColor, selectedSize, variantImage, variantSku, priceAdjustment }
        if (variantInfo) {
            const key = getCartKey(productId, variantInfo.selectedColor, variantInfo.selectedSize);
            setCartItems((prev) => {
                const existing = prev[key];
                if (existing && typeof existing === 'object') {
                    return {
                        ...prev,
                        [key]: { ...existing, quantity: existing.quantity + 1 }
                    };
                }
                return {
                    ...prev,
                    [key]: {
                        quantity: 1,
                        productId,
                        selectedColor: variantInfo.selectedColor,
                        selectedSize: variantInfo.selectedSize,
                        variantImage: variantInfo.variantImage || '',
                        variantSku: variantInfo.variantSku || '',
                        priceAdjustment: variantInfo.priceAdjustment || 0
                    }
                };
            });
        } else {
            // Non-variant product (backward compatible)
            setCartItems((prev) => {
                const existing = prev[productId];
                if (typeof existing === 'object') {
                    return { ...prev, [productId]: { ...existing, quantity: existing.quantity + 1 } };
                }
                return { ...prev, [productId]: (existing || 0) + 1 };
            });
        }
    };

    const removeFromCart = (cartKey) => {
        setCartItems((prev) => {
            const copy = { ...prev };
            delete copy[cartKey];
            return copy;
        });
    };

    const getCartCount = () => {
        let count = 0;
        for (const key in cartItems) {
            const item = cartItems[key];
            if (typeof item === 'object') {
                count += item.quantity || 0;
            } else {
                count += item;
            }
        }
        return count;
    };

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
        for (let key in cartItems) {
            const cartEntry = cartItems[key];
            if (typeof cartEntry === 'object') {
                // Variant item
                const product = products.find((p) => p._id === cartEntry.productId);
                if (product) {
                    const basePrice = getProductCurrentPrice(product);
                    const adjustment = cartEntry.priceAdjustment || 0;
                    total += (basePrice + adjustment) * cartEntry.quantity;
                }
            } else {
                // Non-variant item (legacy)
                const product = products.find((p) => p._id === key);
                if (product) {
                    total += getProductCurrentPrice(product) * cartEntry;
                }
            }
        }
        return total;
    };

    const getShippingFee = () => {
        const cartTotal = getCartAmount();
        return cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : delivery_fee;
    };

    const updateCartItemQuantity = (cartKey, quantity) => {
        setCartItems((prev) => {
            const updated = { ...prev };
            if (quantity <= 0) {
                delete updated[cartKey];
            } else {
                const existing = updated[cartKey];
                if (typeof existing === 'object') {
                    updated[cartKey] = { ...existing, quantity };
                } else {
                    updated[cartKey] = quantity;
                }
            }
            return updated;
        });
    };

    // ---------------- PREPARE DATA FOR BACKEND ----------------
    const getCartPayload = () => {
        const payload = [];
        for (const key in cartItems) {
            const cartEntry = cartItems[key];

            if (typeof cartEntry === 'object') {
                // Variant item
                const product = products.find(p => p._id === cartEntry.productId);
                if (product && cartEntry.quantity > 0) {
                    const basePrice = getProductCurrentPrice(product);
                    const adjustment = cartEntry.priceAdjustment || 0;
                    payload.push({
                        productId: cartEntry.productId,
                        name: product.name,
                        price: basePrice + adjustment,
                        quantity: cartEntry.quantity,
                        image: cartEntry.variantImage || resolveImage(product),
                        images: product.images || [],
                        sku: product.sku || '',
                        category: product.category || '',
                        size: cartEntry.selectedSize || '',
                        color: cartEntry.selectedColor || '',
                        material: product.material || '',
                        weight: product.weight || '',
                        // Variant-specific fields
                        selectedColor: cartEntry.selectedColor,
                        selectedSize: cartEntry.selectedSize,
                        variantSku: cartEntry.variantSku,
                        variantImage: cartEntry.variantImage || resolveImage(product)
                    });
                }
            } else {
                // Non-variant item (legacy)
                const product = products.find(p => p._id === key);
                if (product && cartEntry > 0) {
                    payload.push({
                        productId: key,
                        name: product.name,
                        price: getProductCurrentPrice(product),
                        quantity: cartEntry,
                        image: resolveImage(product),
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
        resolveImage,
        getCartPayload,
        getCartKey,
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
        subCategories,
    };

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
