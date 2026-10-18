import React, { useRef, useEffect, useState } from 'react';
import { Pencil, Eraser, Trash2, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface ScratchPadProps {
  onClose: () => void;
}

export const ScratchPad: React.FC<ScratchPadProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pencil' | 'pen-blue' | 'pen-red' | 'eraser'>('pencil');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      if (tool === 'pencil') {
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 1.8;
      } else if (tool === 'pen-blue') {
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 2.2;
      } else if (tool === 'pen-red') {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.2;
      }
    }
    sound.playPencilMark();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sound.playPageTurn();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-(--a-card) paper-texture-grid rounded-xl paper-shadow-vintage border-2 border-(--a-sep) overflow-hidden flex flex-col h-[520px]">
        {/* Header styling like vintage notepad top */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-(--a-fill) border-b border-(--a-sep)">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-(--a-accent)/80 inline-block"></span>
            <span className="font-serif-kr font-bold text-sm text-(--a-label) tracking-tight">
              연습장 (Scratch Note / 계산 풀이)
            </span>
          </div>
          <button
            id="closeScratchpadBtn"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-(--a-fill-2) text-(--a-label) transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-(--a-fill) border-b border-(--a-sep) text-xs">
          <div className="flex items-center gap-1.5">
            <button
              id="toolPencilBtn"
              onClick={() => setTool('pencil')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-all ${
                tool === 'pencil'
                  ? 'bg-(--a-accent) text-white border-(--a-accent)'
                  : 'bg-(--a-card)/80 text-(--a-label) border-(--a-sep) hover:bg-(--a-card)'
              }`}
            >
              <Pencil className="w-3 h-3" /> 연필
            </button>
            <button
              id="toolPenBlueBtn"
              onClick={() => setTool('pen-blue')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-all ${
                tool === 'pen-blue'
                  ? 'bg-(--a-accent) text-white border-(--a-accent) shadow-xs'
                  : 'bg-(--a-card)/80 text-(--a-accent) border-(--a-sep) hover:bg-(--a-card)'
              }`}
            >
              파란펜
            </button>
            <button
              id="toolPenRedBtn"
              onClick={() => setTool('pen-red')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-all ${
                tool === 'pen-red'
                  ? 'bg-(--a-red) text-white border-(--a-red) shadow-xs'
                  : 'bg-(--a-card)/80 text-(--a-red) border-(--a-sep) hover:bg-(--a-card)'
              }`}
            >
              빨간펜
            </button>
            <button
              id="toolEraserBtn"
              onClick={() => setTool('eraser')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-all ${
                tool === 'eraser'
                  ? 'bg-(--a-fill-2) text-white border-(--a-sep) shadow-xs'
                  : 'bg-(--a-card)/80 text-(--a-label-2) border-(--a-sep) hover:bg-(--a-card)'
              }`}
            >
              <Eraser className="w-3 h-3" /> 지우개
            </button>
          </div>

          <button
            id="clearScratchpadBtn"
            onClick={clearCanvas}
            className="flex items-center gap-1 px-2 py-1 text-(--a-red) hover:bg-(--a-red-soft) rounded transition-colors"
          >
            <Trash2 className="w-3 h-3" /> 비우기
          </button>
        </div>

        {/* Canvas area with realistic ruled paper */}
        <div className="relative flex-1 cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="absolute inset-0 w-full h-full touch-none"
          />
          <div className="absolute bottom-2 right-3 pointer-events-none text-[11px] font-hand text-(--a-label-2)">
            손가락이나 마우스로 자유롭게 메모하세요
          </div>
        </div>
      </div>
    </div>
  );
};
