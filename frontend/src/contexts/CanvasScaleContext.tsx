import { createContext, useContext } from 'react';

export const CanvasScaleContext = createContext<number>(1);

export const useCanvasScale = () => useContext(CanvasScaleContext);
