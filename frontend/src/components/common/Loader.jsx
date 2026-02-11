import { useState } from 'react';

const Loader = ({
    type = "spinner",
    size = "medium",
    color = "#000000",
    bgColor = "#e5e7eb",
    text = "",
    textColor = "#6b7280",
    fullScreen = false,
    centered = true,
    speed = "normal",
    thickness = "medium",
    dotsCount = 3,
    barsCount = 4,
    visible = true,
    className = ""
}) => {
    if (!visible) return null;

    const speedMap = {
        slow: "2s",
        normal: "1s",
        fast: "0.5s",
        veryfast: "0.25s"
    };

    const sizeMap = {
        tiny: {
            size: "1rem",
            text: "0.75rem",
            thickness: "2px"
        },
        small: {
            size: "2rem",
            text: "0.875rem",
            thickness: "3px"
        },
        medium: {
            size: "3rem",
            text: "1rem",
            thickness: "4px"
        },
        large: {
            size: "4rem",
            text: "1.125rem",
            thickness: "5px"
        },
        xlarge: {
            size: "5rem",
            text: "1.25rem",
            thickness: "6px"
        }
    };

    const thicknessMap = {
        thin: "2px",
        medium: "4px",
        thick: "6px",
        extra: "8px"
    };

    const animationSpeed = speedMap[speed] || speedMap.normal;
    const currentSize = sizeMap[size] || sizeMap.medium;
    const currentThickness = thicknessMap[thickness] || currentSize.thickness;

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: fullScreen ? '100vw' : '100%',
        height: fullScreen ? '100vh' : 'auto',
        position: fullScreen ? 'fixed' : 'relative',
        top: fullScreen ? 0 : 'auto',
        left: fullScreen ? 0 : 'auto',
        zIndex: fullScreen ? 9999 : 'auto',
        backgroundColor: fullScreen ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: fullScreen ? 'blur(4px)' : 'none',
        ...(centered && !fullScreen ? {
            paddingTop: '5rem',
            paddingBottom: '5rem'
        } : {})
    };

    const textStyle = {
        marginTop: text ? '1rem' : '0',
        fontSize: currentSize.text,
        color: textColor,
        fontWeight: 500,
        letterSpacing: '0.025em'
    };

    const getLoaderStyle = () => {
        switch (type) {
            case "spinner":
                return {
                    width: currentSize.size,
                    height: currentSize.size,
                    border: `${currentThickness} solid ${bgColor}`,
                    borderTopColor: color,
                    borderRightColor: color,
                    borderRadius: '50%',
                    animation: `spin ${animationSpeed} linear infinite`
                };

            case "dots":
                const dotSize = `calc(${currentSize.size} / 3)`;
                return {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: `calc(${currentSize.size} / 5)`,
                    width: currentSize.size,
                    height: currentSize.size
                };

            case "bars":
                const barWidth = `calc(${currentSize.size} / ${barsCount * 1.5})`;
                return {
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: `calc(${currentSize.size} / 10)`,
                    width: currentSize.size,
                    height: currentSize.size
                };

            case "ring":
                return {
                    width: currentSize.size,
                    height: currentSize.size,
                    border: `${currentThickness} solid transparent`,
                    borderTopColor: color,
                    borderRightColor: color,
                    borderBottomColor: color,
                    borderRadius: '50%',
                    animation: `spin ${animationSpeed} linear infinite`
                };

            case "pulse":
                return {
                    width: currentSize.size,
                    height: currentSize.size,
                    backgroundColor: color,
                    borderRadius: '50%',
                    animation: `pulse ${animationSpeed} ease-in-out infinite`
                };

            case "hourglass":
                return {
                    width: currentSize.size,
                    height: currentSize.size,
                    border: `${currentThickness} solid ${color}`,
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                    borderRadius: '50%',
                    animation: `spin ${animationSpeed} linear infinite`
                };

            case "grid":
                return {
                    width: currentSize.size,
                    height: currentSize.size,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: `calc(${currentSize.size} / 6)`
                };

            case "clock":
                return {
                    width: currentSize.size,
                    height: currentSize.size,
                    border: `${currentThickness} solid ${bgColor}`,
                    borderRadius: '50%',
                    position: 'relative'
                };

            case "infinity":
                return {
                    width: currentSize.size,
                    height: currentSize.size,
                    position: 'relative'
                };

            case "orbit":
                return {
                    width: currentSize.size,
                    height: currentSize.size,
                    position: 'relative'
                };

            default:
                return {
                    width: currentSize.size,
                    height: currentSize.size,
                    border: `${currentThickness} solid ${bgColor}`,
                    borderTopColor: color,
                    borderRadius: '50%',
                    animation: `spin ${animationSpeed} linear infinite`
                };
        }
    };

    const renderDots = () => {
        const dots = [];
        for (let i = 0; i < dotsCount; i++) {
            dots.push(
                <div
                    key={i}
                    style={{
                        width: `calc(${currentSize.size} / 3)`,
                        height: `calc(${currentSize.size} / 3)`,
                        backgroundColor: color,
                        borderRadius: '50%',
                        animation: `bounce ${animationSpeed} ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`
                    }}
                />
            );
        }
        return dots;
    };

    const renderBars = () => {
        const bars = [];
        for (let i = 0; i < barsCount; i++) {
            bars.push(
                <div
                    key={i}
                    style={{
                        width: `calc(${currentSize.size} / ${barsCount * 1.5})`,
                        height: `calc(${currentSize.size} * ${0.3 + (i * 0.1)})`,
                        backgroundColor: color,
                        borderRadius: `calc(${currentSize.size} / 20)`,
                        animation: `grow ${animationSpeed} ease-in-out infinite`,
                        animationDelay: `${i * 0.15}s`
                    }}
                />
            );
        }
        return bars;
    };

    const renderGrid = () => {
        const cells = [];
        for (let i = 0; i < 9; i++) {
            cells.push(
                <div
                    key={i}
                    style={{
                        backgroundColor: color,
                        borderRadius: '20%',
                        animation: `gridScale ${animationSpeed} ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`
                    }}
                />
            );
        }
        return cells;
    };

    const renderClock = () => (
        <>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '2px',
                height: `calc(${currentSize.size} / 2.5)`,
                backgroundColor: color,
                transformOrigin: 'bottom center',
                transform: 'translateX(-50%)',
                animation: `clockHour ${animationSpeed} linear infinite`
            }} />
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '1px',
                height: `calc(${currentSize.size} / 3)`,
                backgroundColor: color,
                transformOrigin: 'bottom center',
                transform: 'translateX(-50%)',
                animation: `clockMinute ${animationSpeed} linear infinite`
            }} />
        </>
    );

    const renderInfinity = () => (
        <>
            <div style={{
                position: 'absolute',
                width: `calc(${currentSize.size} / 2)`,
                height: `calc(${currentSize.size} / 2)`,
                border: `${currentThickness} solid ${color}`,
                borderColor: `${color} transparent transparent transparent`,
                borderRadius: '50%',
                animation: `infinitySpin1 ${animationSpeed} linear infinite`
            }} />
            <div style={{
                position: 'absolute',
                width: `calc(${currentSize.size} / 2)`,
                height: `calc(${currentSize.size} / 2)`,
                border: `${currentThickness} solid ${color}`,
                borderColor: `transparent transparent ${color} transparent`,
                borderRadius: '50%',
                animation: `infinitySpin2 ${animationSpeed} linear infinite`
            }} />
        </>
    );

    const renderOrbit = () => (
        <>
            <div style={{
                position: 'absolute',
                width: `calc(${currentSize.size} / 4)`,
                height: `calc(${currentSize.size} / 4)`,
                backgroundColor: color,
                borderRadius: '50%',
                top: `calc(${currentSize.size} / 8)`,
                left: `calc(${currentSize.size} / 8)`,
                animation: `orbit ${animationSpeed} linear infinite`
            }} />
            <div style={{
                position: 'absolute',
                width: currentSize.size,
                height: currentSize.size,
                border: `1px dashed ${bgColor}`,
                borderRadius: '50%'
            }} />
        </>
    );

    const renderLoader = () => {
        switch (type) {
            case "dots":
                return <div style={getLoaderStyle()}>{renderDots()}</div>;
            case "bars":
                return <div style={getLoaderStyle()}>{renderBars()}</div>;
            case "grid":
                return <div style={getLoaderStyle()}>{renderGrid()}</div>;
            case "clock":
                return <div style={getLoaderStyle()}>{renderClock()}</div>;
            case "infinity":
                return <div style={getLoaderStyle()}>{renderInfinity()}</div>;
            case "orbit":
                return <div style={getLoaderStyle()}>{renderOrbit()}</div>;
            default:
                return <div style={getLoaderStyle()} />;
        }
    };

    return (
        <>
            <div style={containerStyle} className={className}>
                {renderLoader()}
                {text && <div style={textStyle}>{text}</div>}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes bounce {
                    0%, 100% { 
                        transform: translateY(0); 
                        opacity: 0.6;
                    }
                    50% { 
                        transform: translateY(-100%); 
                        opacity: 1;
                    }
                }

                @keyframes grow {
                    0%, 100% { 
                        transform: scaleY(0.5); 
                        opacity: 0.6;
                    }
                    50% { 
                        transform: scaleY(1); 
                        opacity: 1;
                    }
                }

                @keyframes pulse {
                    0%, 100% { 
                        transform: scale(0.8); 
                        opacity: 0.5;
                    }
                    50% { 
                        transform: scale(1); 
                        opacity: 1;
                    }
                }

                @keyframes gridScale {
                    0%, 100% { 
                        transform: scale(0); 
                        opacity: 0;
                    }
                    50% { 
                        transform: scale(1); 
                        opacity: 1;
                    }
                }

                @keyframes clockHour {
                    0% { transform: translateX(-50%) rotate(0deg); }
                    100% { transform: translateX(-50%) rotate(360deg); }
                }

                @keyframes clockMinute {
                    0% { transform: translateX(-50%) rotate(0deg); }
                    100% { transform: translateX(-50%) rotate(4320deg); }
                }

                @keyframes infinitySpin1 {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes infinitySpin2 {
                    0% { transform: rotate(45deg); }
                    100% { transform: rotate(405deg); }
                }

                @keyframes orbit {
                    0% { transform: rotate(0deg) translateX(calc(var(--size) / 3)) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(calc(var(--size) / 3)) rotate(-360deg); }
                }

                @keyframes wave {
                    0%, 100% { 
                        transform: translateY(0);
                        opacity: 0.6;
                    }
                    50% { 
                        transform: translateY(-20%);
                        opacity: 1;
                    }
                }

                .orbit-loader > div:first-child {
                    --size: ${currentSize.size};
                }
            `}</style>
        </>
    );
};

export default Loader;