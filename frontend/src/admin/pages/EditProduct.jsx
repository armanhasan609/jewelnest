import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api'; // Ensure API is imported if used
import { Package, Percent, Calendar, UploadCloud, ArrowLeft, Save, Tag, DollarSign, Layers, X, Image as ImageIcon, Plus, Check, Trash2, ChevronDown } from 'lucide-react';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [price, setPrice] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [stock, setStock] = useState("");
    const [subCategory, setSubCategory] = useState("Rings");
    const [subCategoryOptions, setSubCategoryOptions] = useState(["Rings", "Necklace", "Earrings", "Bangles"]);
    const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
    const [newSubCategory, setNewSubCategory] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [onSale, setOnSale] = useState(false);
    const [saleStartDate, setSaleStartDate] = useState("");
    const [saleEndDate, setSaleEndDate] = useState("");
    const [bestseller, setBestseller] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [compressing, setCompressing] = useState(false);

    // --- VARIANT STATES ---
    const [hasVariants, setHasVariants] = useState(false);
    // Each variant: { color: '', existingImages: [{url, publicId}], newImages: [], compressedImages: [], sizes: [{ size: '', stock: 0, priceAdjustment: 0 }] }
    const [variants, setVariants] = useState([]);

    // Fetch SubCategories on Mount
    useEffect(() => {
        const fetchSubCategories = async () => {
            try {
                // Using axios directly or API instance depending on preference, sticking to existing style mostly
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await axios.get(`${backendUrl}/api/subcategories/all`);
                if (response.data.success) {
                    const dbSubCategories = response.data.subCategories.map(sc => sc.name);
                    setSubCategoryOptions(prev => {
                        const unique = new Set([...prev, ...dbSubCategories]);
                        return Array.from(unique);
                    });
                }
            } catch (error) {
                console.error("Failed to fetch subcategories", error);
            }
        };
        fetchSubCategories();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                setIsAddingSubCategory(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Function to compress image
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Calculate new dimensions (max 1000px on longest side)
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 1000;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height = Math.round((height * MAX_SIZE) / width);
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width = Math.round((width * MAX_SIZE) / height);
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw image on canvas
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to compressed Blob
                    canvas.toBlob(
                        (blob) => {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        },
                        'image/jpeg',
                        0.7 // 70% quality
                    );
                };

                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
        });
    };

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setFetchLoading(true);
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await axios.post(`${backendUrl}/api/products/single`, { productId: id });

                if (response.data.success) {
                    const p = response.data.product;
                    setName(p.name);
                    setDescription(p.description);
                    setOriginalPrice(p.originalPrice);
                    setPrice(p.price);
                    setSalePrice(p.salePrice || "");
                    setStock(p.stock);
                    setSubCategory(p.subCategory);
                    setOnSale(p.onSale);
                    setBestseller(p.bestseller);

                    // Set existing images array
                    if (p.images && Array.isArray(p.images)) {
                        setExistingImages(p.images.map(img => ({
                            url: img.url,
                            publicId: img.publicId
                        })));
                    } else if (p.image) {
                        setExistingImages([{ url: p.image }]);
                    }

                    // Load variant data
                    if (p.hasVariants && p.variants && p.variants.length > 0) {
                        setHasVariants(true);
                        setVariants(p.variants.map(v => ({
                            color: v.color || '',
                            existingImages: (v.images || []).map(img => ({
                                url: typeof img === 'object' ? img.url : img,
                                publicId: typeof img === 'object' ? img.publicId : ''
                            })),
                            newImages: [],
                            compressedImages: [],
                            sizes: (v.sizes || []).map(s => ({
                                size: s.size || '',
                                stock: s.stock || 0,
                                priceAdjustment: s.priceAdjustment || 0
                            }))
                        })));
                    }

                    if (p.saleStartDate) setSaleStartDate(p.saleStartDate.split('T')[0]);
                    if (p.saleEndDate) setSaleEndDate(p.saleEndDate.split('T')[0]);

                    toast.success("Product data loaded successfully!");
                } else {
                    toast.error("Product not found!");
                    navigate('/admin/list');
                }
            } catch (error) {
                console.error("Fetch error:", error);
                toast.error("Failed to load product data!");
                navigate('/admin/list');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchProductData();
    }, [id, navigate]);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);

        // Validate file count
        if (images.length + files.length > 10) {
            toast.error("Maximum 10 images allowed per product!");
            return;
        }

        // Validate each file
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`File "${file.name}" is not an image!`);
                return false;
            }

            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File "${file.name}" is too large! Max size is 10MB.`);
                return false;
            }

            return true;
        });

        if (validFiles.length > 0) {
            setCompressing(true);
            try {
                const compressionPromises = validFiles.map(file => compressImage(file));
                const compressedFiles = await Promise.all(compressionPromises);

                setImages(prev => [...prev, ...compressedFiles]);
                toast.success(`Added ${validFiles.length} image(s)`);
            } catch (error) {
                console.error('Compression error:', error);
                toast.error('Failed to compress images.');
            } finally {
                setCompressing(false);
            }
        }
    };

    const removeNewImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    // --- VARIANT HELPER FUNCTIONS ---
    const addVariant = () => {
        setVariants(prev => [...prev, { color: '', existingImages: [], newImages: [], compressedImages: [], sizes: [{ size: '', stock: 0, priceAdjustment: 0 }] }]);
    };

    const removeVariant = (index) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const updateVariantColor = (index, value) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], color: value };
            return updated;
        });
    };

    const handleVariantImageUpload = async (variantIndex, e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const validFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
        if (validFiles.length === 0) { toast.error('No valid images selected'); return; }

        try {
            const compressed = await Promise.all(validFiles.map(f => compressImage(f)));
            setVariants(prev => {
                const updated = [...prev];
                updated[variantIndex] = {
                    ...updated[variantIndex],
                    newImages: [...updated[variantIndex].newImages, ...validFiles],
                    compressedImages: [...updated[variantIndex].compressedImages, ...compressed]
                };
                return updated;
            });
            toast.success(`Added ${validFiles.length} image(s)`);
        } catch (err) {
            toast.error('Failed to compress images');
        }
    };

    const removeVariantNewImage = (vIdx, imgIdx) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[vIdx] = {
                ...updated[vIdx],
                newImages: updated[vIdx].newImages.filter((_, i) => i !== imgIdx),
                compressedImages: updated[vIdx].compressedImages.filter((_, i) => i !== imgIdx)
            };
            return updated;
        });
    };

    const removeVariantExistingImage = (vIdx, imgIdx) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[vIdx] = {
                ...updated[vIdx],
                existingImages: updated[vIdx].existingImages.filter((_, i) => i !== imgIdx)
            };
            return updated;
        });
    };

    const addSizeToVariant = (variantIndex) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[variantIndex] = {
                ...updated[variantIndex],
                sizes: [...updated[variantIndex].sizes, { size: '', stock: 0, priceAdjustment: 0 }]
            };
            return updated;
        });
    };

    const removeSizeFromVariant = (variantIndex, sizeIndex) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[variantIndex] = {
                ...updated[variantIndex],
                sizes: updated[variantIndex].sizes.filter((_, i) => i !== sizeIndex)
            };
            return updated;
        });
    };

    const updateVariantSize = (variantIndex, sizeIndex, field, value) => {
        setVariants(prev => {
            const updated = [...prev];
            const newSizes = [...updated[variantIndex].sizes];
            newSizes[sizeIndex] = { ...newSizes[sizeIndex], [field]: value };
            updated[variantIndex] = { ...updated[variantIndex], sizes: newSizes };
            return updated;
        });
    };

    const handleAddSubCategory = async () => {
        if (!newSubCategory.trim()) {
            return toast.error("Please enter a sub category name");
        }
        const trimmedName = newSubCategory.trim();
        if (subCategoryOptions.includes(trimmedName)) {
            return toast.error("Sub Category already exists!");
        }

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await axios.post(`${backendUrl}/api/subcategories/add`, { name: trimmedName });
            if (response.data.success) {
                setSubCategoryOptions([...subCategoryOptions, trimmedName]);
                setSubCategory(trimmedName);
                setNewSubCategory("");
                setIsAddingSubCategory(false);
                toast.success("Sub Category added and saved!");
            } else {
                toast.error(response.data.message || "Failed to save sub category");
            }
        } catch (error) {
            console.error("Error adding subcategory:", error);
            toast.error("Failed to save sub category to database");
        }
    };

    const handleDeleteSubCategory = async (categoryToDelete) => {
        if (!categoryToDelete) return;

        if (window.confirm(`Are you sure you want to delete "${categoryToDelete}"?`)) {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await axios.post(`${backendUrl}/api/subcategories/delete`, { name: categoryToDelete });
                if (response.data.success) {
                    toast.success("Sub Category deleted!");
                    const newOptions = subCategoryOptions.filter(opt => opt !== categoryToDelete);
                    setSubCategoryOptions(newOptions);
                    if (subCategory === categoryToDelete) {
                        setSubCategory(newOptions.length > 0 ? newOptions[0] : "");
                    }
                }
            } catch (error) {
                // If 404 (not in DB), remove from frontend anyway
                if (error.response && error.response.status === 404) {
                    const newOptions = subCategoryOptions.filter(opt => opt !== categoryToDelete);
                    setSubCategoryOptions(newOptions);
                    if (subCategory === categoryToDelete) {
                        setSubCategory(newOptions.length > 0 ? newOptions[0] : "");
                    }
                    toast.info("Removed from list (was not in database)");
                } else {
                    console.error("Error deleting subcategory:", error);
                    toast.error("Failed to delete sub category");
                }
            }
        }
    };

    const onUpdateHandler = async (e) => {
        e.preventDefault();

        // Basic Validations
        if (!hasVariants && existingImages.length === 0 && images.length === 0) {
            return toast.error("Please upload at least one product image!");
        }
        if (!name.trim()) return toast.error("Product name is required!");
        if (!description.trim()) return toast.error("Product description is required!");
        if (!originalPrice || Number(originalPrice) <= 0) return toast.error("Valid MRP is required!");
        if (!price || Number(price) <= 0) return toast.error("Valid Regular Price is required!");
        if (Number(price) >= Number(originalPrice)) return toast.error("Regular Price must be less than MRP!");
        if (onSale) {
            if (!salePrice || Number(salePrice) <= 0) return toast.error("Valid Sale Price is required!");
            if (Number(salePrice) >= Number(price)) return toast.error("Sale Price must be less than Regular Price!");
            if (!saleStartDate || !saleEndDate) return toast.error("Sale dates are required!");
            if (new Date(saleEndDate) <= new Date(saleStartDate)) return toast.error("Sale end must be after start!");
        }

        // Variant Validations
        if (hasVariants) {
            if (variants.length === 0) return toast.error("Add at least one variant!");
            for (let i = 0; i < variants.length; i++) {
                const v = variants[i];
                if (!v.color.trim()) return toast.error(`Variant ${i + 1}: Color is required!`);
                if (v.existingImages.length === 0 && v.compressedImages.length === 0) return toast.error(`Variant ${i + 1} (${v.color}): At least one image required!`);
                if (v.sizes.length === 0) return toast.error(`Variant ${i + 1} (${v.color}): At least one size required!`);
                for (let j = 0; j < v.sizes.length; j++) {
                    if (!v.sizes[j].size.trim()) return toast.error(`Variant ${i + 1} (${v.color}): Size name is required!`);
                }
            }
        } else {
            if (!stock || Number(stock) < 0) return toast.error("Valid stock is required!");
        }

        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("id", id);
            formData.append("name", name.trim());
            formData.append("description", description.trim());
            formData.append("originalPrice", Number(originalPrice));
            formData.append("price", Number(price));
            formData.append("subCategory", subCategory);
            formData.append("onSale", onSale.toString());
            formData.append("bestseller", bestseller.toString());
            formData.append("hasVariants", hasVariants.toString());

            if (onSale) {
                formData.append("salePrice", Number(salePrice));
                formData.append("saleStartDate", saleStartDate);
                formData.append("saleEndDate", saleEndDate);
            }

            if (hasVariants) {
                // Send variant metadata as JSON (including existing images per variant)
                const variantsMeta = variants.map(v => ({
                    color: v.color,
                    existingImages: v.existingImages,
                    sizes: v.sizes.map(s => ({
                        size: s.size,
                        stock: Number(s.stock) || 0,
                        priceAdjustment: Number(s.priceAdjustment) || 0
                    }))
                }));
                formData.append("variants", JSON.stringify(variantsMeta));
                formData.append("stock", 0);

                // Send existing variant images info so backend knows what to keep
                const existingVariantsData = variants.map(v => ({
                    images: v.existingImages
                }));
                formData.append("existingVariants", JSON.stringify(existingVariantsData));

                // Append new variant images with field name `variant_{index}`
                variants.forEach((variant, index) => {
                    variant.compressedImages.forEach(img => {
                        formData.append(`variant_${index}`, img);
                    });
                });

                // Don't send legacy images for variant products
                formData.append("existingImages", JSON.stringify([]));
            } else {
                formData.append("stock", Number(stock));
                images.forEach((image) => {
                    formData.append("image", image);
                });
                formData.append("existingImages", JSON.stringify(existingImages));
            }

            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await axios.post(`${backendUrl}/api/products/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000
            });

            if (response.data.success) {
                toast.success(response.data.message || "Product updated successfully!");
                navigate('/admin/dashboard');
            } else {
                toast.error(response.data.message || "Failed to update product!");
            }
        } catch (error) {
            console.error('Update error:', error);
            if (error.code === 'ECONNABORTED') {
                toast.error("Upload timeout! Try fewer or smaller images.");
            } else if (error.response?.data?.message) {
                toast.error(`Error: ${error.response.data.message}`);
            } else if (error.request) {
                toast.error("No response from server.");
            } else {
                toast.error(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const LoadingScreen = () => (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 20px'
        }}>
            <div style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                marginBottom: '32px'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: '4px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    borderTop: '4px solid white',
                    animation: 'spin 1.5s linear infinite'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '76px',
                    height: '76px',
                    border: '4px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    borderTop: '4px solid rgba(255, 255, 255, 0.6)',
                    animation: 'spin 2s linear infinite reverse'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '24px',
                    left: '24px',
                    width: '52px',
                    height: '52px',
                    border: '4px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%',
                    borderTop: '4px solid rgba(255, 255, 255, 0.4)',
                    animation: 'spin 2.5s linear infinite'
                }} />
            </div>

            <div style={{ textAlign: 'center' }}>
                <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '12px',
                    letterSpacing: '0.5px'
                }}>
                    Loading Product Details
                </h3>
                <p style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    maxWidth: '400px',
                    marginBottom: '24px'
                }}>
                    Fetching product information and images...
                </p>
            </div>

            <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '20px'
            }}>
                {[0, 1, 2, 3].map((dot) => (
                    <div key={dot} style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        animation: `pulse 1.5s infinite ${dot * 0.2}s`
                    }} />
                ))}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                }
            `}</style>
        </div>
    );

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    };

    const cardStyle = {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        transition: 'all 0.3s ease'
    };

    const inputStyle = {
        width: '100%',
        border: '2px solid #e2e8f0',
        padding: '14px 16px',
        borderRadius: '12px',
        outline: 'none',
        transition: 'all 0.3s ease',
        fontSize: '15px',
        backgroundColor: 'white',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    };

    const buttonStyle = {
        width: '100%',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '18px',
        borderRadius: '14px',
        border: 'none',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
        position: 'relative',
        overflow: 'hidden'
    };

    const imageUploadStyle = {
        border: '2px dashed #cbd5e1',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
    };

    return fetchLoading ? (
        <LoadingScreen />
    ) : (
        <div style={containerStyle}>
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid #e2e8f0',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    color: '#475569',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    marginBottom: '24px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                }}
            >
                <ArrowLeft size={18} /> Back to Products
            </button>

            <div style={cardStyle}>
                {/* Header */}
                <div style={{
                    marginBottom: '32px',
                    borderBottom: '2px solid #f1f5f9',
                    paddingBottom: '20px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            padding: '12px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                        }}>
                            <Package size={24} color="white" />
                        </div>
                        <h2 style={{
                            fontSize: '32px',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.025em'
                        }}>
                            Edit Product Details
                        </h2>
                    </div>
                    <p style={{
                        color: '#64748b',
                        fontSize: '15px',
                        maxWidth: '600px',
                        lineHeight: '1.6'
                    }}>
                        Update product information, pricing, and inventory details
                    </p>
                </div>

                <form onSubmit={onUpdateHandler} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Product Name */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(1, 1fr)',
                        gap: '32px'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#334155',
                                marginBottom: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div style={{
                                    width: '4px',
                                    height: '16px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    borderRadius: '2px'
                                }} />
                                Product Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={inputStyle}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                }}
                            />
                        </div>
                    </div>

                    {/* Product Images */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    padding: '8px',
                                    borderRadius: '10px',
                                    background: '#3b82f6',
                                    color: 'white'
                                }}>
                                    <ImageIcon size={20} />
                                </div>
                                <div>
                                    <h4 style={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#1e40af'
                                    }}>
                                        Product Images
                                    </h4>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#64748b'
                                    }}>
                                        Add or remove product images (Max 10 total)
                                    </p>
                                </div>
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#3b82f6',
                                background: 'white',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                border: '1px solid #3b82f6'
                            }}>
                                Total: {existingImages.length + images.length}/10
                            </div>
                        </div>

                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div>
                                <h5 style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#475569',
                                    marginBottom: '12px'
                                }}>
                                    Current Images
                                </h5>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '16px',
                                    marginBottom: '24px'
                                }}>
                                    {existingImages.map((img, index) => (
                                        <div key={index} style={{
                                            position: 'relative',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            border: '2px solid #e2e8f0',
                                            aspectRatio: '1/1',
                                            background: '#f8fafc'
                                        }}>
                                            <img
                                                src={img.url}
                                                alt={`Product image ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'https://placehold.co/300x300?text=Image+Error';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: 'rgba(239, 68, 68, 0.9)',
                                                    color: 'white',
                                                    border: 'none',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseOver={(e) => e.target.style.background = '#dc2626'}
                                                onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.9)'}
                                            >
                                                <X size={16} />
                                            </button>
                                            {index === 0 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '8px',
                                                    left: '8px',
                                                    background: '#3b82f6',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    fontWeight: '700',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    MAIN
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Images Upload */}
                        <div>
                            <h5 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#475569',
                                marginBottom: '12px'
                            }}>
                                Add New Images
                            </h5>

                            <input
                                type="file"
                                id="image-upload"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                                disabled={compressing}
                            />

                            <label
                                htmlFor="image-upload"
                                style={{
                                    ...imageUploadStyle,
                                    background: compressing ? '#e2e8f0' : '#f8fafc',
                                    border: compressing ? '2px dashed #94a3b8' : '2px dashed #cbd5e1',
                                    cursor: compressing ? 'not-allowed' : 'pointer',
                                    marginBottom: images.length > 0 ? '20px' : '0'
                                }}
                                onMouseEnter={(e) => {
                                    if (!compressing) {
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                        e.currentTarget.style.backgroundColor = '#eff6ff';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!compressing) {
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                    }
                                }}
                            >
                                {compressing ? (
                                    <>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            border: '3px solid rgba(59, 130, 246, 0.3)',
                                            borderTop: '3px solid #3b82f6',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite',
                                            marginBottom: '12px'
                                        }} />
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#475569',
                                            marginBottom: '8px'
                                        }}>
                                            Compressing images...
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#475569',
                                            marginBottom: '8px'
                                        }}>
                                            Click to add new images
                                        </p>
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#94a3b8'
                                        }}>
                                            Images are auto-compressed. Max 10MB each
                                        </p>
                                    </>
                                )}
                            </label>

                            {/* New Images Preview */}
                            {images.length > 0 && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {images.map((image, index) => (
                                        <div key={index} style={{
                                            position: 'relative',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            border: '2px solid #e2e8f0',
                                            aspectRatio: '1/1',
                                            background: '#f8fafc'
                                        }}>
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`New preview ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: 'rgba(239, 68, 68, 0.9)',
                                                    color: 'white',
                                                    border: 'none',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseOver={(e) => e.target.style.background = '#dc2626'}
                                                onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.9)'}
                                            >
                                                <X size={16} />
                                            </button>
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                left: '8px',
                                                background: 'rgba(34, 197, 94, 0.9)',
                                                color: 'white',
                                                fontSize: '9px',
                                                fontWeight: '700',
                                                padding: '2px 6px',
                                                borderRadius: '8px',
                                                letterSpacing: '0.5px'
                                            }}>
                                                NEW
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#334155',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                width: '4px',
                                height: '16px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                borderRadius: '2px'
                            }} />
                            Product Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            required
                            style={{
                                ...inputStyle,
                                minHeight: '120px',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#8b5cf6';
                                e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                            }}
                        />
                    </div>

                    {/* Pricing & Stock Grid */}
                    <div style={{
                        background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
                        padding: '28px',
                        borderRadius: '20px',
                        border: '1px solid #dbeafe',
                        boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.04)'
                    }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1e40af',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <DollarSign size={20} /> Pricing & Inventory
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(1, 1fr)',
                            gap: '24px'
                        }}>
                            {[
                                { label: 'Original MRP (₹)', value: originalPrice, setter: setOriginalPrice, icon: '🏷️' },
                                { label: 'Selling Price (₹)', value: price, setter: setPrice, icon: '💰' },
                                { label: 'Stock Quantity', value: stock, setter: setStock, icon: '📦' }
                            ].map((field, index) => (
                                <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '4px'
                                    }}>
                                        <span style={{ fontSize: '20px' }}>{field.icon}</span>
                                        <label style={{
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            color: '#1e40af',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {field.label}
                                        </label>
                                    </div>
                                    <input
                                        type="number"
                                        value={field.value}
                                        onChange={(e) => field.setter(e.target.value)}
                                        required
                                        style={{
                                            ...inputStyle,
                                            borderColor: '#93c5fd',
                                            backgroundColor: 'white'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#2563eb';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#93c5fd';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Flash Sale Section */}
                    <div style={{
                        padding: '28px',
                        borderRadius: '20px',
                        border: `2px solid ${onSale ? '#f59e0b' : '#e2e8f0'}`,
                        background: onSale ? 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)' : 'white',
                        transition: 'all 0.4s ease',
                        boxShadow: onSale ? '0 8px 32px rgba(245, 158, 11, 0.15)' : 'none',
                        animation: onSale ? 'pulse 2s infinite' : 'none'
                    }}>
                        <style>{`
                            @keyframes pulse {
                                0%, 100% { box-shadow: 0 8px 32px rgba(245, 158, 11, 0.15); }
                                50% { box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3); }
                            }
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '24px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: onSale ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '#f1f5f9',
                                    color: onSale ? 'white' : '#94a3b8'
                                }}>
                                    <Percent size={24} />
                                </div>
                                <div>
                                    <h4 style={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#1e293b'
                                    }}>
                                        Flash Sale Settings
                                    </h4>
                                    <p style={{
                                        fontSize: '14px',
                                        color: onSale ? '#92400e' : '#64748b'
                                    }}>
                                        {onSale ? 'Sale is currently active' : 'Activate limited-time discount'}
                                    </p>
                                </div>
                            </div>
                            <label style={{
                                position: 'relative',
                                display: 'inline-flex',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={onSale}
                                    onChange={() => setOnSale(!onSale)}
                                    style={{ display: 'none' }}
                                />
                                <div style={{
                                    width: '52px',
                                    height: '28px',
                                    background: onSale ? '#f59e0b' : '#cbd5e1',
                                    borderRadius: '9999px',
                                    position: 'relative',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '2px',
                                        left: onSale ? 'calc(100% - 26px)' : '2px',
                                        width: '24px',
                                        height: '24px',
                                        background: 'white',
                                        borderRadius: '50%',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                                    }} />
                                </div>
                            </label>
                        </div>

                        {onSale && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(1, 1fr)',
                                gap: '24px',
                                paddingTop: '24px',
                                borderTop: '2px solid rgba(245, 158, 11, 0.2)'
                            }}>
                                {[
                                    { label: 'Sale Price (₹)', value: salePrice, setter: setSalePrice, icon: '🔥' },
                                    { label: 'Start Date', value: saleStartDate, setter: setSaleStartDate, icon: '📅', type: 'date' },
                                    { label: 'End Date', value: saleEndDate, setter: setSaleEndDate, icon: '⏰', type: 'date' }
                                ].map((field, index) => (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '4px'
                                        }}>
                                            <span style={{ fontSize: '18px' }}>{field.icon}</span>
                                            <label style={{
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                color: '#92400e',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                {field.label}
                                            </label>
                                        </div>
                                        <input
                                            type={field.type || 'number'}
                                            value={field.value}
                                            onChange={(e) => field.setter(e.target.value)}
                                            required={onSale}
                                            style={{
                                                ...inputStyle,
                                                borderColor: '#fbbf24',
                                                backgroundColor: 'white'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#d97706';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(217, 119, 6, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#fbbf24';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Category & Bestseller */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        padding: '28px',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h4 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1e293b',
                            marginBottom: '8px'
                        }}>
                            Classification
                        </h4>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(1, 1fr)',
                            gap: '24px'
                        }}>
                            {/* Category section removed as requested */}

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }} ref={dropdownRef}>
                                <label style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#475569'
                                }}>
                                    Sub Category
                                </label>

                                {/* Custom Dropdown Trigger */}
                                <div
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    style={{
                                        ...inputStyle,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderColor: isDropdownOpen ? '#3b82f6' : '#e2e8f0',
                                        position: 'relative',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <span style={{ color: '#334155' }}>{subCategory || "Select..."}</span>
                                    <ChevronDown size={16} color="#64748b" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                </div>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        marginTop: '70px', // Adjust based on label + trigger height
                                        width: '100%',
                                        maxWidth: 'calc(100% - 300px)', // Adjust based on grid/padding
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid #e2e8f0',
                                        zIndex: 50,
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
                                            {subCategoryOptions.map((opt) => (
                                                <div
                                                    key={opt}
                                                    style={{
                                                        padding: '0.5rem 0.75rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        backgroundColor: subCategory === opt ? '#eff6ff' : 'transparent',
                                                        color: subCategory === opt ? '#3b82f6' : '#475569',
                                                    }}
                                                    onClick={() => {
                                                        setSubCategory(opt);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    onMouseOver={(e) => {
                                                        if (subCategory !== opt) e.currentTarget.style.backgroundColor = '#f8fafc';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        if (subCategory !== opt) e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    <span>{opt}</span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSubCategory(opt);
                                                        }}
                                                        style={{
                                                            border: 'none',
                                                            background: 'none',
                                                            color: '#94a3b8',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            borderRadius: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.color = '#ef4444';
                                                            e.currentTarget.style.backgroundColor = '#fef2f2';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.color = '#94a3b8';
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add New Section Inside Dropdown */}
                                        <div style={{
                                            padding: '0.75rem',
                                            borderTop: '1px solid #e2e8f0',
                                            backgroundColor: '#f8fafc',
                                        }}>
                                            {isAddingSubCategory ? (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input
                                                        type="text"
                                                        value={newSubCategory}
                                                        onChange={(e) => setNewSubCategory(e.target.value)}
                                                        placeholder="New Category"
                                                        autoFocus
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.5rem',
                                                            border: '1px solid #3b82f6',
                                                            borderRadius: '8px',
                                                            fontSize: '0.875rem',
                                                            outline: 'none'
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddSubCategory();
                                                        }}
                                                        style={{
                                                            background: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            width: '32px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsAddingSubCategory(false);
                                                            setNewSubCategory("");
                                                        }}
                                                        style={{
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            width: '32px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsAddingSubCategory(true);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem',
                                                        border: '1px dashed #cbd5e1',
                                                        borderRadius: '8px',
                                                        color: '#3b82f6',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600',
                                                        background: 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                                                >
                                                    <Plus size={14} /> Add New Sub-Category
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '20px',
                            background: 'white',
                            borderRadius: '16px',
                            border: '2px solid #e2e8f0',
                            marginTop: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                            onClick={() => setBestseller(!bestseller)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = bestseller ? '#3b82f6' : '#e2e8f0';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{
                                width: '24px',
                                height: '24px',
                                border: bestseller ? 'none' : '2px solid #cbd5e1',
                                borderRadius: '6px',
                                background: bestseller ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                            }}>
                                {bestseller && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h5 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#1e293b',
                                    marginBottom: '4px'
                                }}>
                                    Mark as Bestseller
                                </h5>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#64748b'
                                }}>
                                    Feature this product in bestseller section
                                </p>
                            </div>
                            <Tag size={20} color={bestseller ? '#3b82f6' : '#94a3b8'} />
                        </div>
                    </div>

                    {/* ===== VARIANT SYSTEM ===== */}
                    <div style={{
                        padding: '28px',
                        borderRadius: '20px',
                        border: `2px solid ${hasVariants ? '#8b5cf6' : '#e2e8f0'}`,
                        transition: 'all 0.5s ease',
                        background: hasVariants ? 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' : 'white',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hasVariants ? '1.5rem' : 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Tag size={20} color={hasVariants ? '#7c3aed' : '#94a3b8'} />
                                <span style={{ fontWeight: '700', fontSize: '1rem', color: hasVariants ? '#5b21b6' : '#334155' }}>
                                    Product Variants (Color + Size)
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setHasVariants(!hasVariants); if (!hasVariants && variants.length === 0) addVariant(); }}
                                style={{
                                    padding: '0.5rem 1.25rem', borderRadius: '20px', border: 'none',
                                    cursor: 'pointer', fontWeight: '700', fontSize: '0.875rem',
                                    background: hasVariants ? '#7c3aed' : '#e2e8f0',
                                    color: hasVariants ? 'white' : '#64748b',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {hasVariants ? 'Enabled ✓' : 'Enable'}
                            </button>
                        </div>

                        {hasVariants && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {variants.map((variant, vIdx) => (
                                    <div key={vIdx} style={{
                                        background: 'white', borderRadius: '16px',
                                        border: '1px solid #e2e8f0', padding: '1.5rem', position: 'relative'
                                    }}>
                                        {/* Variant Header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#7c3aed' }}>
                                                Variant #{vIdx + 1}
                                            </span>
                                            {variants.length > 1 && (
                                                <button type="button" onClick={() => removeVariant(vIdx)}
                                                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '6px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Trash2 size={12} /> Remove
                                                </button>
                                            )}
                                        </div>

                                        {/* Color Name */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Color Name *
                                            </label>
                                            <input type="text" value={variant.color}
                                                onChange={(e) => updateVariantColor(vIdx, e.target.value)}
                                                placeholder="e.g., Gold, Silver, Rose Gold"
                                                style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s' }}
                                                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                        </div>

                                        {/* Variant Images */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Images for "{variant.color || 'this color'}" *
                                            </label>

                                            {/* Existing variant images */}
                                            {variant.existingImages.length > 0 && (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                    {variant.existingImages.map((img, imgIdx) => (
                                                        <div key={`existing-${imgIdx}`} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1/1', border: '1px solid #e2e8f0' }}>
                                                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <button type="button" onClick={() => removeVariantExistingImage(vIdx, imgIdx)}
                                                                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Upload new variant images */}
                                            <label style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                gap: '0.5rem', padding: '1rem', borderRadius: '12px',
                                                border: '2px dashed #c4b5fd', background: '#faf5ff',
                                                cursor: 'pointer', fontSize: '0.875rem', color: '#7c3aed', fontWeight: '600'
                                            }}>
                                                <UploadCloud size={18} />
                                                Upload Images
                                                <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                                                    onChange={(e) => handleVariantImageUpload(vIdx, e)} />
                                            </label>

                                            {/* New variant image previews */}
                                            {variant.newImages.length > 0 && (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                    {variant.newImages.map((img, imgIdx) => (
                                                        <div key={`new-${imgIdx}`} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1/1', border: '1px solid #e2e8f0' }}>
                                                            <img src={URL.createObjectURL(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <button type="button" onClick={() => removeVariantNewImage(vIdx, imgIdx)}
                                                                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <X size={12} />
                                                            </button>
                                                            <div style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(34,197,94,0.9)', color: 'white', fontSize: '8px', fontWeight: '700', padding: '2px 6px', borderRadius: '6px' }}>NEW</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Sizes for this variant */}
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Sizes & Stock *
                                                </label>
                                                <button type="button" onClick={() => addSizeToVariant(vIdx)}
                                                    style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Plus size={12} /> Add Size
                                                </button>
                                            </div>
                                            {variant.sizes.map((sizeObj, sIdx) => (
                                                <div key={sIdx} style={{
                                                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto',
                                                    gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'end'
                                                }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600' }}>Size</label>
                                                        <input type="text" value={sizeObj.size}
                                                            onChange={(e) => updateVariantSize(vIdx, sIdx, 'size', e.target.value)}
                                                            placeholder="e.g., S, M, L"
                                                            style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.875rem' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600' }}>Stock</label>
                                                        <input type="number" value={sizeObj.stock}
                                                            onChange={(e) => updateVariantSize(vIdx, sIdx, 'stock', e.target.value)}
                                                            min="0" step="1"
                                                            style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.875rem' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600' }}>Price Adjust (₹)</label>
                                                        <input type="number" value={sizeObj.priceAdjustment}
                                                            onChange={(e) => updateVariantSize(vIdx, sIdx, 'priceAdjustment', e.target.value)}
                                                            step="1"
                                                            style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.875rem' }}
                                                        />
                                                    </div>
                                                    {variant.sizes.length > 1 && (
                                                        <button type="button" onClick={() => removeSizeFromVariant(vIdx, sIdx)}
                                                            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Another Variant Button */}
                                <button type="button" onClick={addVariant}
                                    style={{
                                        width: '100%', padding: '1rem', borderRadius: '12px',
                                        border: '2px dashed #c4b5fd', background: 'transparent',
                                        color: '#7c3aed', fontWeight: '700', fontSize: '0.875rem',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: '0.5rem'
                                    }}>
                                    <Plus size={18} /> Add Another Color Variant
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || compressing || (existingImages.length === 0 && images.length === 0)}
                        style={{
                            ...buttonStyle,
                            background: (existingImages.length === 0 && images.length === 0)
                                ? '#cbd5e1'
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            opacity: loading || compressing ? 0.8 : 1,
                            cursor: loading || compressing || (existingImages.length === 0 && images.length === 0)
                                ? 'not-allowed'
                                : 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading && !compressing && !(existingImages.length === 0 && images.length === 0)) {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading && !compressing && !(existingImages.length === 0 && images.length === 0)) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.3)';
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '3px solid rgba(255, 255, 255, 0.3)',
                                    borderTop: '3px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                Updating Product...
                            </>
                        ) : compressing ? (
                            <>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '3px solid rgba(255, 255, 255, 0.3)',
                                    borderTop: '3px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                Compressing...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                {existingImages.length === 0 && images.length === 0 ? 'Upload Images First' : 'Update Product'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;