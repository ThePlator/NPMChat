export const isVercel = () => process.env.VERCEL === "1" || process.env.VERCEL === "true";

export const parsePort = (portStr) => {
    const port = parseInt(portStr, 10);
    return isNaN(port) ? 8080 : port;
};

export const getPlatform = () => {
    if (isVercel()) return "vercel";
    return process.platform;
};
