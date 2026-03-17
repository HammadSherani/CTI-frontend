import { useState } from "react";

export const useMultiLoading = () => {
    const [multiloading, setMultiLoading] = useState({});
    const start = key => setMultiLoading(prev => ({ ...prev, [key]: true }));
    const stop = key => setMultiLoading(prev => ({ ...prev, [key]: false }));
    return {multiLoading:multiloading, multiloading, start, stop };

};