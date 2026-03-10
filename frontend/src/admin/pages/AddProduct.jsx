import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Package, Tag, Percent, Calendar, Info, UploadCloud, X, Image as ImageIcon, Loader, Plus, Check, Trash2, ChevronDown } from 'lucide-react';

const AddProduct = () => {
    const [images, setImages] = useState([]);
    const [compressedImages, setCompressedImages] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    // --- PRICE STATES ---
    const [originalPrice, setOriginalPrice] = useState(""); // MRP
    const [price, setPrice] = useState("");                 // Regular Selling Price
    const [salePrice, setSalePrice] = useState("");         // Price during Sale

    const [stock, setStock] = useState("");
    const [subCategory, setSubCategory] = useState("Rings");
    const [subCategoryOptions, setSubCategoryOptions] = useState(["Rings", "Necklace", "Earrings", "Bangles"]);
    const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
    const [newSubCategory, setNewSubCategory] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch SubCategories on Mount
    useEffect(() => {
        const fetchSubCategories = async () => {
            try {
                const response = await API.get('/api/subcategories/all');
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
                setIsAddingSubCategory(false); // also reset add mode if open
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [bestseller, setBestseller] = useState(false);

    // --- SALE STATES ---
    const [onSale, setOnSale] = useState(false);
    const [saleStartDate, setSaleStartDate] = useState("");
    const [saleEndDate, setSaleEndDate] = useState("");

    // --- VARIANT STATES ---
    const [hasVariants, setHasVariants] = useState(false);
    // Each variant: { color: '', images: [], compressedImages: [], sizes: [{ size: '', stock: 0, priceAdjustment: 0 }] }
    const [variants, setVariants] = useState([]);

    const [loading, setLoading] = useState(false);
    const [compressing, setCompressing] = useState(false);

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

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);

        // Validate file count
        if (images.length + files.length > 10) {
            toast.error("Maximum 10 images allowed per product!");
            return;
        }

        // Validate each file
        const validFiles = files.filter(file => {
            // Check file type
            if (!file.type.startsWith('image/')) {
                toast.error(`File "${file.name}" is not an image!`);
                return false;
            }

            // Check file size (max 5MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File "${file.name}" is too large! Max size is 10MB.`);
                return false;
            }

            return true;
        });

        if (validFiles.length > 0) {
            setCompressing(true);
            try {
                // Compress each image
                const compressionPromises = validFiles.map(file => compressImage(file));
                const compressedFiles = await Promise.all(compressionPromises);

                setImages(prev => [...prev, ...validFiles]);
                setCompressedImages(prev => [...prev, ...compressedFiles]);

                toast.success(`Successfully added ${validFiles.length} image(s)`);
            } catch (error) {
                console.error('Compression error:', error);
                toast.error('Failed to compress images. Please try smaller files.');
            } finally {
                setCompressing(false);
            }
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setCompressedImages(prev => prev.filter((_, i) => i !== index));
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
            // Save to Database
            const response = await API.post('/api/subcategories/add', { name: trimmedName });
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
                const response = await API.post('/api/subcategories/delete', { name: categoryToDelete });
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

    // --- VARIANT MANAGEMENT FUNCTIONS ---
    const addVariant = () => {
        setVariants(prev => [...prev, {
            color: '',
            images: [],
            compressedImages: [],
            sizes: [{ size: '', stock: 0, priceAdjustment: 0 }]
        }]);
    };

    const removeVariant = (index) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const updateVariantColor = (index, color) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], color };
            return updated;
        });
    };

    const handleVariantImageUpload = async (variantIndex, e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) { toast.error(`"${file.name}" is not an image!`); return false; }
            if (file.size > 10 * 1024 * 1024) { toast.error(`"${file.name}" too large! Max 10MB.`); return false; }
            return true;
        });

        if (validFiles.length > 0) {
            setCompressing(true);
            try {
                const compressedFiles = await Promise.all(validFiles.map(file => compressImage(file)));
                setVariants(prev => {
                    const updated = [...prev];
                    updated[variantIndex] = {
                        ...updated[variantIndex],
                        images: [...updated[variantIndex].images, ...validFiles],
                        compressedImages: [...updated[variantIndex].compressedImages, ...compressedFiles]
                    };
                    return updated;
                });
                toast.success(`${validFiles.length} image(s) added to variant`);
            } catch (error) {
                toast.error('Failed to compress images');
            } finally {
                setCompressing(false);
            }
        }
    };

    const removeVariantImage = (variantIndex, imageIndex) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[variantIndex] = {
                ...updated[variantIndex],
                images: updated[variantIndex].images.filter((_, i) => i !== imageIndex),
                compressedImages: updated[variantIndex].compressedImages.filter((_, i) => i !== imageIndex)
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

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        // Basic Validations
        if (!hasVariants && compressedImages.length === 0) {
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
                if (v.compressedImages.length === 0) return toast.error(`Variant ${i + 1} (${v.color}): At least one image required!`);
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

            formData.append("name", name.trim());
            formData.append("description", description.trim());
            formData.append("originalPrice", Number(originalPrice));
            formData.append("price", Number(price));
            formData.append("subCategory", subCategory);
            formData.append("bestseller", bestseller.toString());
            formData.append("onSale", onSale.toString());
            formData.append("hasVariants", hasVariants.toString());

            if (onSale) {
                formData.append("salePrice", Number(salePrice));
                formData.append("saleStartDate", saleStartDate);
                formData.append("saleEndDate", saleEndDate);
            }

            if (hasVariants) {
                // Send variant metadata as JSON
                const variantsMeta = variants.map(v => ({
                    color: v.color,
                    sizes: v.sizes.map(s => ({
                        size: s.size,
                        stock: Number(s.stock) || 0,
                        priceAdjustment: Number(s.priceAdjustment) || 0
                    }))
                }));
                formData.append("variants", JSON.stringify(variantsMeta));

                // Stock will be calculated from variant sizes on the backend
                formData.append("stock", 0);

                // Append variant images with field name `variant_{index}`
                variants.forEach((variant, index) => {
                    variant.compressedImages.forEach(img => {
                        formData.append(`variant_${index}`, img);
                    });
                });
            } else {
                formData.append("stock", Number(stock));
                // Legacy image upload
                compressedImages.forEach(image => {
                    formData.append("image", image);
                });
            }

            const response = await API.post('/api/products/add', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000
            });

            if (response.data.success) {
                toast.success(response.data.message || "Product added successfully!");
                // Reset Form
                setName(""); setDescription(""); setPrice(""); setOriginalPrice("");
                setSalePrice(""); setStock(""); setSubCategory("Rings");
                setBestseller(false); setOnSale(false); setSaleStartDate(""); setSaleEndDate("");
                setImages([]); setCompressedImages([]); setHasVariants(false); setVariants([]);
            } else {
                toast.error(response.data.message || "Failed to add product!");
            }
        } catch (error) {
            console.error('Error adding product:', error);
            if (error.code === 'ECONNABORTED') {
                toast.error("Upload timeout! Try uploading fewer or smaller images.");
            } else if (error.response?.data?.message) {
                toast.error(`Error: ${error.response.data.message}`);
            } else {
                toast.error(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '1rem' : '2rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                padding: isMobile ? '1.5rem' : '3rem',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
                <div style={{
                    marginBottom: '2.5rem',
                    borderBottom: '2px solid #f1f5f9',
                    paddingBottom: '1.5rem'
                }}>
                    <h2 style={{
                        fontSize: isMobile ? '1.5rem' : '2rem',
                        fontWeight: '800',
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem'
                    }}>
                        <Package style={{ color: '#3b82f6' }} /> Add New Product
                    </h2>
                    <p style={{
                        color: '#64748b',
                        fontStyle: 'italic',
                        fontSize: '0.875rem',
                        background: '#f8fafc',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        display: 'inline-block',
                        border: '1px dashed #cbd5e1'
                    }}>
                        Images are automatically compressed for faster upload. Max 10 images, 10MB each.
                    </p>
                </div>

                <form onSubmit={onSubmitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Basic Info */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                color: '#334155',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Product Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="E.g. 22K Gold Wedding Band"
                                required
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    border: '2px solid #e2e8f0',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '16px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    fontSize: '1rem',
                                    backgroundColor: 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{
                            fontSize: '0.875rem',
                            fontWeight: '700',
                            color: '#334155',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Detailed Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Design details, purity, weight, and special features..."
                            required
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                border: '2px solid #e2e8f0',
                                padding: '0.875rem 1rem',
                                borderRadius: '16px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                minHeight: '120px',
                                backgroundColor: 'white'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {/* Multiple Image Upload Section */}
                    <div style={{
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        padding: isMobile ? '1.5rem' : '2rem',
                        borderRadius: '20px',
                        border: '2px solid #dbeafe',
                        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1.5rem',
                            gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    padding: '0.5rem',
                                    borderRadius: '12px',
                                    background: '#3b82f6',
                                    color: 'white'
                                }}>
                                    <ImageIcon size={20} />
                                </div>
                                <div>
                                    <h4 style={{
                                        fontWeight: '700',
                                        color: '#1e40af',
                                        fontSize: '1.125rem'
                                    }}>
                                        Product Images *
                                    </h4>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: '#64748b',
                                        fontStyle: 'italic'
                                    }}>Upload multiple images (Max 10, 10MB each - Auto-compressed)</p>
                                </div>
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#3b82f6',
                                background: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid #3b82f6'
                            }}>
                                {images.length}/10 images
                            </div>
                        </div>

                        {/* Image Upload Area */}
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
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: compressing ? '#e2e8f0' : 'white',
                                border: compressing ? '2px dashed #94a3b8' : '2px dashed #60a5fa',
                                borderRadius: '16px',
                                padding: '3rem',
                                cursor: compressing ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                marginBottom: images.length > 0 ? '1.5rem' : '0',
                                textAlign: 'center'
                            }}
                            onMouseOver={(e) => {
                                if (!compressing) {
                                    e.target.style.background = '#dbeafe';
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!compressing) {
                                    e.target.style.background = 'white';
                                    e.target.style.borderColor = '#60a5fa';
                                    e.target.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {compressing ? (
                                <>
                                    <Loader size={48} style={{ color: '#64748b', marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
                                    <p style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: '#64748b',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Compressing images...
                                    </p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={48} style={{ color: '#60a5fa', marginBottom: '1rem' }} />
                                    <p style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: '#3b82f6',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Click or drag to upload images
                                    </p>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: '#64748b',
                                        maxWidth: '400px'
                                    }}>
                                        Upload product images from different angles. Images are automatically compressed.
                                    </p>
                                </>
                            )}
                        </label>

                        {/* Image Preview Grid */}
                        {images.length > 0 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: '1rem',
                                marginTop: '1.5rem'
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
                                            alt={`Product preview ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
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
                                            disabled={compressing}
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
                                                MAIN IMAGE
                                            </div>
                                        )}
                                        {/* Show compression info */}
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
                                            {(image.size / 1024 / 1024).toFixed(1)}MB
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pricing & Stock Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%)',
                        padding: isMobile ? '1.5rem' : '2rem',
                        borderRadius: '20px',
                        border: '2px solid #fbbf24',
                        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                color: '#92400e',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Original MRP (₹) *
                            </label>
                            <input
                                type="number"
                                value={originalPrice}
                                onChange={(e) => setOriginalPrice(e.target.value)}
                                required
                                min="1"
                                step="0.01"
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '12px',
                                    border: '2px solid #fbbf24',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    backgroundColor: 'white',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#d97706'}
                                onBlur={(e) => e.target.style.borderColor = '#fbbf24'}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                color: '#92400e',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Regular Price (₹) *
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                min="1"
                                step="0.01"
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '12px',
                                    border: '2px solid #fbbf24',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    backgroundColor: 'white',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#d97706'}
                                onBlur={(e) => e.target.style.borderColor = '#fbbf24'}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                color: '#92400e',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                <Package size={14} /> Stock Quantity *
                            </label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                required
                                min="0"
                                step="1"
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '12px',
                                    border: '2px solid #fbbf24',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    backgroundColor: 'white',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#d97706'}
                                onBlur={(e) => e.target.style.borderColor = '#fbbf24'}
                            />
                        </div>
                    </div>

                    {/* Daily Sale Section */}
                    <div style={{
                        padding: isMobile ? '1.5rem' : '2rem',
                        borderRadius: '20px',
                        border: `2px solid ${onSale ? '#10b981' : '#e2e8f0'}`,
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: onSale ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'white',
                        boxShadow: onSale ? '0 10px 30px rgba(16, 185, 129, 0.1)' : 'none',
                        animation: onSale ? 'pulse 2s infinite' : 'none'
                    }}>
                        <style>
                            {`
                                @keyframes pulse {
                                    0%, 100% { box-shadow: 0 10px 30px rgba(16, 185, 129, 0.1); }
                                    50% { box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2); }
                                }
                                @keyframes slideIn {
                                    from {
                                        opacity: 0;
                                        transform: translateY(-10px);
                                    }
                                    to {
                                        opacity: 1;
                                        transform: translateY(0);
                                    }
                                }
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}
                        </style>
                        <div style={{
                            display: 'flex',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between',
                            marginBottom: '1.5rem',
                            gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    padding: '0.5rem',
                                    borderRadius: '12px',
                                    background: onSale ? '#10b981' : '#e2e8f0',
                                    color: onSale ? 'white' : '#64748b',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <Percent size={20} />
                                </div>
                                <div>
                                    <h4 style={{
                                        fontWeight: '700',
                                        color: '#1e293b',
                                        fontSize: '1.125rem'
                                    }}>Flash Sale Event</h4>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: '#64748b',
                                        fontStyle: 'italic'
                                    }}>Schedule a limited-time promotional discount.</p>
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
                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                />
                                <div style={{
                                    width: '44px',
                                    height: '24px',
                                    background: onSale ? '#10b981' : '#e2e8f0',
                                    borderRadius: '9999px',
                                    position: 'relative',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '2px',
                                        left: onSale ? 'calc(100% - 22px)' : '2px',
                                        width: '20px',
                                        height: '20px',
                                        background: 'white',
                                        borderRadius: '50%',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                    }} />
                                </div>
                            </label>
                        </div>

                        {onSale && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '1.5rem',
                                paddingTop: '1.5rem',
                                borderTop: '1px solid #10b981',
                                animation: 'slideIn 0.5s ease-out'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        color: '#065f46',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}>
                                        Flash Sale Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(e.target.value)}
                                        required={onSale}
                                        min="1"
                                        step="0.01"
                                        style={{
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            padding: '0.875rem 1rem',
                                            borderRadius: '12px',
                                            border: '2px solid #10b981',
                                            outline: 'none',
                                            fontSize: '1rem',
                                            backgroundColor: 'white',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#047857'}
                                        onBlur={(e) => e.target.style.borderColor = '#10b981'}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        color: '#065f46',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <Calendar size={14} /> Sale Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={saleStartDate}
                                        onChange={(e) => setSaleStartDate(e.target.value)}
                                        required={onSale}
                                        style={{
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            padding: '0.875rem 1rem',
                                            borderRadius: '12px',
                                            border: '2px solid #10b981',
                                            outline: 'none',
                                            fontSize: '1rem',
                                            backgroundColor: 'white',
                                            transition: 'all 0.2s ease',
                                            color: '#1e293b'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#047857'}
                                        onBlur={(e) => e.target.style.borderColor = '#10b981'}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        color: '#065f46',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <Calendar size={14} /> Sale End Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={saleEndDate}
                                        onChange={(e) => setSaleEndDate(e.target.value)}
                                        required={onSale}
                                        style={{
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            padding: '0.875rem 1rem',
                                            borderRadius: '12px',
                                            border: '2px solid #10b981',
                                            outline: 'none',
                                            fontSize: '1rem',
                                            backgroundColor: 'white',
                                            transition: 'all 0.2s ease',
                                            color: '#1e293b'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#047857'}
                                        onBlur={(e) => e.target.style.borderColor = '#10b981'}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ===== VARIANT SYSTEM ===== */}
                    <div style={{
                        padding: isMobile ? '1.5rem' : '2rem',
                        borderRadius: '20px',
                        border: `2px solid ${hasVariants ? '#8b5cf6' : '#e2e8f0'}`,
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
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
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '20px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontSize: '0.875rem',
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
                                        background: 'white',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        padding: '1.5rem',
                                        position: 'relative'
                                    }}>
                                        {/* Variant Header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#7c3aed' }}>
                                                Variant #{vIdx + 1}
                                            </span>
                                            {variants.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(vIdx)}
                                                    style={{
                                                        background: '#fef2f2',
                                                        border: '1px solid #fecaca',
                                                        color: '#ef4444',
                                                        padding: '6px 12px',
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '0.75rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <Trash2 size={12} /> Remove
                                                </button>
                                            )}
                                        </div>

                                        {/* Color Name */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Color Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={variant.color}
                                                onChange={(e) => updateVariantColor(vIdx, e.target.value)}
                                                placeholder="e.g., Gold, Silver, Rose Gold"
                                                style={{
                                                    width: '100%', boxSizing: 'border-box',
                                                    padding: '0.75rem 1rem', borderRadius: '12px',
                                                    border: '2px solid #e2e8f0', outline: 'none',
                                                    fontSize: '0.95rem', transition: 'border-color 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                        </div>

                                        {/* Variant Images */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Images for "{variant.color || 'this color'}" *
                                            </label>
                                            <label style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                gap: '0.5rem', padding: '1rem', borderRadius: '12px',
                                                border: '2px dashed #c4b5fd', background: '#faf5ff',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                fontSize: '0.875rem', color: '#7c3aed', fontWeight: '600'
                                            }}>
                                                <UploadCloud size={18} />
                                                Upload Images
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => handleVariantImageUpload(vIdx, e)}
                                                />
                                            </label>
                                            {variant.images.length > 0 && (
                                                <div style={{
                                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                                    gap: '0.5rem', marginTop: '0.75rem'
                                                }}>
                                                    {variant.images.map((img, imgIdx) => (
                                                        <div key={imgIdx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1/1', border: '1px solid #e2e8f0' }}>
                                                            <img src={URL.createObjectURL(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <button type="button" onClick={() => removeVariantImage(vIdx, imgIdx)}
                                                                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                                                <X size={12} />
                                                            </button>
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
                                                    display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr auto',
                                                    gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'end'
                                                }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600' }}>Size</label>
                                                        <input type="text" value={sizeObj.size}
                                                            onChange={(e) => updateVariantSize(vIdx, sIdx, 'size', e.target.value)}
                                                            placeholder="e.g., S, M, L or 6, 7"
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
                                        justifyContent: 'center', gap: '0.5rem',
                                        transition: 'all 0.2s ease'
                                    }}>
                                    <Plus size={18} /> Add Another Color Variant
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Category & Checkbox */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.5rem',
                        borderTop: '2px solid #f1f5f9',
                        paddingTop: '2rem'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'relative' }} ref={dropdownRef}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{
                                        fontSize: '0.625rem',
                                        fontWeight: '800',
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        marginLeft: '0.25rem'
                                    }}>Sub Category *</p>
                                </div>

                                {/* Custom Dropdown Trigger */}
                                <div
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        boxSizing: 'border-box',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '16px',
                                        backgroundColor: 'white',
                                        minWidth: '200px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderColor: isDropdownOpen ? '#3b82f6' : '#e2e8f0'
                                    }}
                                >
                                    <span style={{ fontSize: '0.875rem', color: '#334155' }}>{subCategory || "Select..."}</span>
                                    <ChevronDown size={16} color="#64748b" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                </div>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        width: '100%',
                                        minWidth: '240px',
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid #e2e8f0',
                                        zIndex: 50,
                                        marginTop: '4px',
                                        overflow: 'shown'
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
                                                        fontSize: '0.875rem'
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
                                            borderBottomLeftRadius: '16px',
                                            borderBottomRightRadius: '16px'
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
                                                            boxSizing: 'border-box',
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
                            gap: '0.75rem',
                            background: '#f8fafc',
                            padding: '1rem 1.5rem',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s ease'
                        }}>
                            <input
                                type="checkbox"
                                checked={bestseller}
                                onChange={() => setBestseller(!bestseller)}
                                id="bestseller"
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    accentColor: '#3b82f6'
                                }}
                            />
                            <label
                                htmlFor="bestseller"
                                style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '700',
                                    color: '#334155',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                            >
                                Feature as Bestseller
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || compressing || (!hasVariants && compressedImages.length === 0) || (hasVariants && variants.length === 0)}
                        style={{
                            width: '100%',
                            background: ((!hasVariants && compressedImages.length === 0) || (hasVariants && variants.length === 0))
                                ? '#cbd5e1'
                                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: 'white',
                            padding: '1.25rem',
                            borderRadius: '20px',
                            fontWeight: '800',
                            fontSize: '1.125rem',
                            transition: 'all 0.3s ease',
                            boxShadow: ((!hasVariants && compressedImages.length === 0) || (hasVariants && variants.length === 0))
                                ? 'none'
                                : '0 20px 40px rgba(59, 130, 246, 0.3)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.75rem',
                            border: 'none',
                            cursor: (loading || compressing || (!hasVariants && compressedImages.length === 0) || (hasVariants && variants.length === 0)) ? 'not-allowed' : 'pointer',
                            opacity: (loading || compressing) ? 0.8 : 1,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '20px', height: '20px',
                                    border: '3px solid rgba(255, 255, 255, 0.3)',
                                    borderTop: '3px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <span>Uploading Product...</span>
                            </div>
                        ) : compressing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                <span>Compressing Images...</span>
                            </div>
                        ) : (
                            <>
                                <Package size={24} />
                                <span>
                                    {hasVariants
                                        ? (variants.length === 0 ? 'Add Variants First' : `Publish Product (${variants.length} variant${variants.length > 1 ? 's' : ''})`)
                                        : (compressedImages.length === 0 ? 'Upload Images First' : 'Publish Product')}
                                </span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;