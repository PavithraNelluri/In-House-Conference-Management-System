import { useRef, useEffect, useState } from 'react';
import './SignatureCanvas.css';

function SignatureCanvas({ onSignatureSave, onPositionChange, initialSignature = null, initialPosition = null, backgroundColor = '#ffffff' }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureData, setSignatureData] = useState(initialSignature);
    const [bgColor, setBgColor] = useState(backgroundColor);
    const [position, setPosition] = useState(initialPosition || { x: 50, y: 50 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            context.fillStyle = bgColor;
            context.fillRect(0, 0, canvas.width, canvas.height);

            if (initialSignature) {
                const img = new Image();
                img.onload = () => {
                    context.drawImage(img, 0, 0);
                };
                img.src = initialSignature;
            }
        }
    }, [initialSignature, bgColor]);

    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const context = canvas.getContext('2d');

        context.beginPath();
        context.moveTo(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const context = canvas.getContext('2d');

        context.lineWidth = 2;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = '#000';

        context.lineTo(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
        context.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.fillStyle = bgColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        setSignatureData(null);
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        setSignatureData(dataUrl);
        onSignatureSave(dataUrl);
    };

    const handleColorChange = (e) => {
        const newColor = e.target.value;
        setBgColor(newColor);
    };

    const handlePositionChange = (axis, value) => {
        const newPosition = { ...position, [axis]: value };
        setPosition(newPosition);
        if (onPositionChange) {
            onPositionChange(newPosition);
        }
    };

    return (
        <div className="signature-canvas-container">
            <div className="signature-settings">
                <div className="signature-setting-item">
                    <label>Background Color:</label>
                    <div className="color-picker-wrapper">
                        <input
                            type="color"
                            value={bgColor}
                            onChange={handleColorChange}
                            className="color-picker"
                        />
                        <span className="color-value">{bgColor}</span>
                    </div>
                </div>
            </div>

            <label>Draw Your Signature:</label>
            <canvas
                ref={canvasRef}
                width={500}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="signature-canvas"
                style={{ backgroundColor: bgColor }}
            />

            <div className="signature-actions">
                <button onClick={clearSignature} className="btn-secondary btn-sm">
                    Clear
                </button>
                <button onClick={saveSignature} className="btn-primary btn-sm">
                    Save Signature
                </button>
            </div>

            {signatureData && (
                <div className="signature-preview">
                    <p>Signature Preview:</p>
                    <img src={signatureData} alt="Signature Preview" />
                </div>
            )}
        </div>
    );
}

export default SignatureCanvas;