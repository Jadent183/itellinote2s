// import React, { useEffect, useRef } from 'react';

// const SimpleAudioVisualizer = ({ isRecording, stream }) => {
//   const canvasRef = useRef(null);
//   const animationFrameRef = useRef(null);
//   const analyzerRef = useRef(null);
//   const audioContextRef = useRef(null);

//   useEffect(() => {
//     let cleanup = () => {};

//     if (isRecording && stream) {
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext('2d');

//       // Initialize audio context and analyzer only when recording
//       audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
//       analyzerRef.current = audioContextRef.current.createAnalyser();
//       analyzerRef.current.fftSize = 32; // Smaller size for fewer, wider bars

//       const source = audioContextRef.current.createMediaStreamSource(stream);
//       source.connect(analyzerRef.current);

//       const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
//       const barWidth = canvas.width / (analyzerRef.current.frequencyBinCount - 2);

//       const draw = () => {
//         if (!isRecording) return;

//         analyzerRef.current.getByteFrequencyData(dataArray);

//         ctx.fillStyle = '#f3f4f6'; // Light gray background
//         ctx.fillRect(0, 0, canvas.width, canvas.height);

//         dataArray.forEach((value, i) => {
//           if (i > 0 && i < dataArray.length - 1) { // Skip first and last items
//             const barHeight = (value / 255) * canvas.height * 0.8;
//             const x = barWidth * (i - 1);
//             const y = canvas.height - barHeight;

//             ctx.fillStyle = '#2563eb'; // Blue bars
//             ctx.fillRect(x, y, barWidth - 2, barHeight);
//           }
//         });

//         animationFrameRef.current = requestAnimationFrame(draw);
//       };

//       draw();

//       cleanup = () => {
//         if (animationFrameRef.current) {
//           cancelAnimationFrame(animationFrameRef.current);
//         }
//         source.disconnect();
//         if (audioContextRef.current?.state !== 'closed') {
//           audioContextRef.current?.close();
//         }
//       };
//     }

//     return cleanup;
//   }, [isRecording, stream]);

//   return (
//     <div className="w-full flex justify-center items-center h-12">
//       {isRecording ? (
//         <canvas
//           ref={canvasRef}
//           width={200}
//           height={40}
//           className="rounded-full bg-gray-100"
//         />
//       ) : (
//         <div className="h-1 w-48 bg-gray-200 rounded-full">
//           <div className="h-1 w-0 bg-blue-500 rounded-full"></div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SimpleAudioVisualizer;