'use client';

import {
    useEffect,
    useRef,
    useState
} from 'react';

import { Button } from '@/components/ui/button';

import {
    Camera,
    RefreshCcw
} from 'lucide-react';

import { toast } from 'sonner';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    for: string;
}

export default function CameraCapture({
    onCapture,
    for: forLabel
}: CameraCaptureProps) {
    const videoRef =
        useRef<HTMLVideoElement>(null);

    const canvasRef =
        useRef<HTMLCanvasElement>(null);

    const [stream, setStream] =
        useState<MediaStream | null>(null);

    const [captured, setCaptured] =
        useState(false);

    const [previewUrl, setPreviewUrl] =
        useState<string | null>(null);

    async function startCamera() {
        try {
            const mediaStream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment'
                    },

                    audio: false
                });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject =
                    mediaStream;
            }
        } catch {
            toast.error(
                'Unable to access camera'
            );
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const currentStream = videoRef.current.srcObject as MediaStream;
            currentStream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }

        setStream(null);
    }

    function capturePhoto() {
        if (
            !videoRef.current ||
            !canvasRef.current
        ) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        const MAX_WIDTH = 1280;

        const scale =
            video.videoWidth > MAX_WIDTH
                ? MAX_WIDTH / video.videoWidth
                : 1;

        canvas.width =
            video.videoWidth * scale;

        canvas.height =
            video.videoHeight * scale;

        const ctx =
            canvas.getContext('2d');

        if (!ctx) return;

        ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) return;

                const file = new File(
                    [blob],
                    `${forLabel.toLowerCase()}.jpg`,
                    {
                        type: 'image/jpeg'
                    }
                );

                const url =
                    URL.createObjectURL(
                        file
                    );

                setPreviewUrl(url);

                onCapture(file);

                setCaptured(true);

                stopCamera();
            },
            'image/jpeg',
            0.7
        );
    }

    function retakePhoto() {
        if (previewUrl) {
            URL.revokeObjectURL(
                previewUrl
            );
        }

        setPreviewUrl(null);

        setCaptured(false);

        startCamera();
    }

    useEffect(() => {
        startCamera();

        return () => {
            stopCamera();

            if (previewUrl) {
                URL.revokeObjectURL(
                    previewUrl
                );
            }
        };
    }, []);

    return (
        <div className="space-y-3">
            <div className="overflow-hidden rounded-xl bg-black">
                {!captured ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full aspect-video object-contain bg-black"
                    />
                ) : (
                    <img
                        src={
                            previewUrl || ''
                        }
                        alt={`Captured ${forLabel}`}
                        className="w-full aspect-video object-contain bg-black"
                    />
                )}
            </div>

            <canvas
                ref={canvasRef}
                className="hidden"
            />

            {!captured ? (
                <Button
                    type="button"
                    onClick={
                        capturePhoto
                    }
                    className="w-full"
                >
                    <Camera className="w-4 h-4 mr-2" />
                    Capture {forLabel}
                </Button>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    onClick={
                        retakePhoto
                    }
                    className="w-full"
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Retake Photo
                </Button>
            )}
        </div>
    );
}